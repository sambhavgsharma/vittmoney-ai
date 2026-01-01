# Settings Feature - Quick Reference Commands

## 🚀 Getting Started

### Install & Run

```bash
# 1. Install server dependencies
cd server
npm install

# 2. Create upload directory
mkdir -p uploads/profile-pics

# 3. Set environment variables (see below)
# Edit .env file with EMAIL_USER, EMAIL_PASSWORD, etc.

# 4. Start servers in separate terminals

# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev

# 3. Access the app
# Open http://localhost:3000/dashboard/settings
```

## ⚙️ Environment Configuration

### Backend `.env` Template
```env
# Database
MONGO_URI=mongodb://localhost:27017/vittmoney

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here

# Server
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:3000

# Email Configuration (NEW)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false

# Optional Admin Email
ACCT_EMAIL_ID=admin@example.com
```

### Frontend `.env.local` Template
```env
NEXT_PUBLIC_API_BASE=http://localhost:5000/api
```

### Gmail App Password Setup
```
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer"
3. Google generates 16-character password
4. Use this in EMAIL_PASSWORD (remove spaces)
```

## 📋 File Checklist

### Frontend Components Created
- [ ] `client/src/components/EditProfileModal.tsx` (180 lines)
- [ ] `client/src/components/DeleteAccountModal.tsx` (250 lines)
- [ ] `client/src/app/dashboard/settings/page.tsx` (320 lines)

### Backend Routes Created
- [ ] `server/routes/users.js` (350 lines)

### Files Modified
- [ ] `client/src/components/DashboardTopBar.tsx` (+ 15 lines)
- [ ] `server/Models/User.js` (+ 6 lines)
- [ ] `server/index.js` (+ 3 lines)
- [ ] `server/package.json` (+ multer)

### Directories Created
- [ ] `server/uploads/profile-pics/` directory

## 🧪 Testing Commands

### Manual Testing Checklist

```bash
# Access settings page
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/me

# Test profile update (with image)
curl -X PUT -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "name=John Doe" \
  -F "profilePic=@/path/to/image.jpg" \
  http://localhost:5000/api/users/profile

# Test delete request
curl -X POST -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}' \
  http://localhost:5000/api/users/request-delete-account

# Test delete confirmation
curl -X POST -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","verificationCode":"123456"}' \
  http://localhost:5000/api/users/confirm-delete-account
```

### Browser Console Testing

```javascript
// Get current user
fetch('http://localhost:5000/api/me', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
}).then(r => r.json()).then(console.log)

// Check avatar URL
console.log(document.querySelector('img[alt="User Avatar"]').src)

// Verify token format
console.log(localStorage.getItem('token').substring(0, 20) + '...')
```

## 📁 Important Paths

```
# User Avatars
server/uploads/profile-pics/profile-TIMESTAMP.jpg

# Settings Page
client/src/app/dashboard/settings/page.tsx

# User Routes API
server/routes/users.js

# Avatar Serving
http://localhost:5000/uploads/profile-pics/profile-xxx.jpg
```

## 🐛 Debugging Commands

### Check File Uploads
```bash
# List uploaded avatars
ls -lah server/uploads/profile-pics/

# Check file size
du -sh server/uploads/profile-pics/

# Remove all uploads (fresh start)
rm -rf server/uploads/profile-pics/*
```

### Database Debugging
```javascript
// Check user document
db.users.findOne({ email: "user@example.com" })

// Check deletion tokens
db.users.find({ deleteAccountToken: { $ne: null } })

// Clean up expired tokens
db.users.updateMany(
  { deleteAccountTokenExpiry: { $lt: new Date() } },
  { $unset: { deleteAccountToken: "", deleteAccountTokenExpiry: "" } }
)
```

### Server Logs
```bash
# View error logs
tail -f server/logs/error.log

# Check email sending logs
grep "Email sent:" server/logs/*.log

# Monitor uploads
watch -n 1 'ls -lah server/uploads/profile-pics/'
```

### Frontend Debugging
```javascript
// Check theme
console.log(document.documentElement.className)

// Check authentication
console.log('Token:', localStorage.getItem('token') ? 'Present' : 'Missing')

// Monitor API calls
// Open DevTools → Network tab → Filter by 'users'
```

## 🔧 Common Issues & Fixes

### Issue: Settings page returns 404
```bash
# Fix: Clear Next.js cache
cd client
rm -rf .next
npm run build
npm run dev
```

### Issue: Avatar upload fails
```bash
# Fix: Check directory permissions
chmod 755 server/uploads/profile-pics/
ls -ld server/uploads/profile-pics/

# Fix: Clear old uploads
rm -rf server/uploads/profile-pics/*
```

### Issue: Email not sending
```bash
# Fix: Verify credentials
env | grep EMAIL_

# Test email service
node -e "
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  transporter.verify((err, valid) => {
    console.log(valid ? 'Email configured correctly' : 'Email error: ' + err);
  });
"
```

### Issue: Avatar not updating in UI
```bash
# Fix: Clear browser cache
# Chrome: Ctrl+Shift+Delete → Clear Browsing Data
# Or reload with Ctrl+Shift+R (hard refresh)

# Fix: Check API response
# Network tab → Select users/profile request → Preview tab
```

## 📊 Monitoring

### Disk Usage
```bash
# Check uploads directory size
du -sh server/uploads/profile-pics/

# Set up alert if exceeds 1GB
if [ $(du -sk server/uploads/profile-pics | cut -f1) -gt 1048576 ]; then
  echo "Alert: Upload directory > 1GB"
fi
```

### Database Monitoring
```bash
# Count users with avatars
db.users.countDocuments({ profilePic: { $ne: null, $ne: "/assets/images/logo.svg" } })

# Find pending deletions
db.users.countDocuments({ deleteAccountToken: { $ne: null } })

# Average avatar file size
```

### Email Monitoring
```bash
# Check sent emails log
grep -c "Email sent:" server/logs/*.log

# Monitor failed sends
grep "Email sending error" server/logs/*.log
```

## 🔐 Security Checks

### File Upload Validation
```javascript
// Verify file types accepted
const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

// Verify file size limit
const maxSize = 5 * 1024 * 1024; // 5MB

// Test with curl
curl -X PUT -F "profilePic=@large-file.jpg" ... # Should fail if > 5MB
```

### Token Validation
```javascript
// Check JWT secret configured
process.env.JWT_SECRET // Should not be empty

// Verify auth middleware active
// Should get 401 without token
curl -X GET http://localhost:5000/api/users/profile
```

### Email Verification
```bash
# Check token expiry (10 minutes)
db.users.findOne({ deleteAccountToken: "123456" })
# deleteAccountTokenExpiry should be Date.now() + 10 * 60 * 1000
```

## 📚 Documentation Files Created

```bash
# View all documentation
ls -lah *.md | grep SETTINGS

# Quick reference (you are here)
cat SETTINGS_QUICK_REFERENCE.md

# Full implementation details
cat SETTINGS_IMPLEMENTATION_GUIDE.md

# Deployment steps
cat SETTINGS_DEPLOYMENT_NOTES.md

# File structure
cat SETTINGS_FILE_STRUCTURE.md

# Complete summary
cat SETTINGS_COMPLETE_SUMMARY.md
```

## 🎯 Next Steps

1. **Setup** (5 min)
   ```bash
   cd server && npm install
   mkdir -p uploads/profile-pics
   # Configure .env file
   ```

2. **Start** (2 min)
   ```bash
   # Terminal 1: npm run dev in server/
   # Terminal 2: npm run dev in client/
   ```

3. **Test** (10 min)
   - Visit http://localhost:3000/dashboard/settings
   - Click avatar → Edit profile
   - Upload image → Save
   - Try delete account flow

4. **Deploy** (varies)
   - Push to repository
   - Deploy backend
   - Deploy frontend
   - Verify in production

## 📞 Help & Support

### Check Logs
```bash
# Backend logs
tail -f server/logs/*.log

# Frontend logs
# Open DevTools (F12) → Console tab
```

### Verify Installation
```bash
# Check Node version
node --version  # Should be 16+

# Check npm packages
npm list --depth=0  # In each directory

# Test MongoDB
mongosh  # or mongo

# Test email
npx nodemailer-cli test
```

### Reset Everything (Clean Slate)
```bash
# Backend
cd server
rm -rf uploads node_modules
npm install
mkdir -p uploads/profile-pics

# Frontend
cd client
rm -rf .next node_modules
npm install

# Restart servers
```

## ✅ Success Indicators

✅ Settings page loads without errors
✅ Avatar appears in top bar (clickable)
✅ Can edit profile name
✅ Can upload avatar image
✅ Avatar updates in real-time
✅ Can request account deletion
✅ Email arrives with verification code
✅ Account successfully deleted with code
✅ Automatically logged out after deletion
✅ Responsive on mobile/tablet/desktop

---

**Keep this file handy for quick reference during development and testing!**
