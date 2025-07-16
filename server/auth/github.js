const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../Models/User');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function downloadAndSaveProfilePic(url, userId) {
  if (!url) return undefined;
  try {
    const res = await axios.get(url, { responseType: 'arraybuffer' });
    const ext = url.split('.').pop().split('?')[0];
    const filename = `github_${userId}_${Date.now()}.${ext}`;
    const uploadDir = path.join(__dirname, '..', 'uploads', 'profile-pics');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, res.data);
    return `/uploads/profile-pics/${filename}`;
  } catch (e) {
    return undefined;
  }
}

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/github/callback',
      scope: ['user:email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({ githubId: profile.id });
        if (existingUser) return done(null, existingUser);

        // Defensive checks for profile fields
        let email;
        if (profile.emails && profile.emails.length > 0) {
          email = profile.emails[0].value;
        }
        const username = profile.username || (email ? email.split('@')[0] : `github_${profile.id}`);
        const profilePicUrl = profile.photos && profile.photos[0] && profile.photos[0].value
          ? profile.photos[0].value
          : undefined;

        // Download and save the profile pic locally, store path in DB
        const savedProfilePic = await downloadAndSaveProfilePic(profilePicUrl, profile.id);

        const newUser = await User.create({
          name: profile.displayName || username,
          email,
          username,
          provider: 'github',
          githubId: profile.id,
          profilePic: savedProfilePic || undefined,
        });

        return done(null, newUser);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);
