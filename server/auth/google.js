const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../Models/User');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function downloadAndSaveProfilePic(url, userId) {
  if (!url) return undefined;
  try {
    const res = await axios.get(url, { responseType: 'arraybuffer' });
    const ext = url.split('.').pop().split('?')[0];
    const filename = `google_${userId}_${Date.now()}.${ext}`;
    const uploadDir = path.join(__dirname, '..', 'uploads', 'profile-pics');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, res.data);
    // Store relative path for serving via static
    return `/uploads/profile-pics/${filename}`;
  } catch (e) {
    return undefined;
  }
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({ googleId: profile.id });
        if (existingUser) return done(null, existingUser);

        const email = profile.emails && profile.emails[0] && profile.emails[0].value
          ? profile.emails[0].value
          : undefined;
        const username = email ? email.split('@')[0] : `google_${profile.id}`;
        const profilePicUrl = profile.photos && profile.photos[0] && profile.photos[0].value
          ? profile.photos[0].value
          : undefined;

        // Download and save the profile pic locally, store path in DB
        const savedProfilePic = await downloadAndSaveProfilePic(profilePicUrl, profile.id);

        const newUser = await User.create({
          name: profile.displayName || username,
          email,
          username,
          provider: 'google',
          googleId: profile.id,
          profilePic: savedProfilePic || undefined,
        });

        return done(null, newUser);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);
