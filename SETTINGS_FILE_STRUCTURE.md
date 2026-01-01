# Settings Feature - File Structure & Changes

## 📁 Complete File Tree

```
vittmoney-ai/
├── client/
│   ├── src/
│   │   ├── app/
│   │   │   └── dashboard/
│   │   │       ├── settings/
│   │   │       │   └── page.tsx                          [NEW ✨]
│   │   │       │       └── Profile & account settings page
│   │   │       ├── expenses/
│   │   │       ├── analytics/
│   │   │       └── layout.tsx
│   │   ├── components/
│   │   │   ├── EditProfileModal.tsx                      [NEW ✨]
│   │   │   │   └── Modal for editing user profile
│   │   │   ├── DeleteAccountModal.tsx                    [NEW ✨]
│   │   │   │   └── Two-step account deletion modal
│   │   │   ├── DashboardTopBar.tsx                       [MODIFIED 🔄]
│   │   │   │   └── Avatar clickable, settings link added
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Card.tsx
│   │   │   └── ...other components
│   │   ├── lib/
│   │   └── utils/
│   └── package.json
│
├── server/
│   ├── routes/
│   │   ├── users.js                                      [NEW ✨]
│   │   │   ├── PUT /api/users/profile
│   │   │   ├── POST /api/users/request-delete-account
│   │   │   └── POST /api/users/confirm-delete-account
│   │   ├── auth.js
│   │   ├── expenses.js
│   │   └── ...other routes
│   ├── Models/
│   │   ├── User.js                                       [MODIFIED 🔄]
│   │   │   └── Added: deleteAccountToken, deleteAccountTokenExpiry
│   │   └── Expense.js
│   ├── middleware/
│   │   └── auth.js
│   ├── uploads/
│   │   └── profile-pics/                                 [NEW 📁]
│   │       └── [User avatar files stored here]
│   ├── utils/
│   │   └── email.js                                      [USED]
│   ├── index.js                                          [MODIFIED 🔄]
│   │   └── Added: users route mounting, static file serving
│   ├── package.json                                      [MODIFIED 🔄]
│   │   └── Added: "multer": "^1.4.5-lts.1"
│   └── ...other files
│
├── SETTINGS_COMPLETE_SUMMARY.md                          [NEW 📄]
│   └── This comprehensive summary document
├── SETTINGS_IMPLEMENTATION_GUIDE.md                       [NEW 📄]
│   └── Detailed technical implementation guide
├── SETTINGS_DEPLOYMENT_NOTES.md                          [NEW 📄]
│   └── Quick deployment and setup guide
└── ...other project files
```

## 🔄 Modified Files Summary

### 1. `client/src/components/DashboardTopBar.tsx`
**Changes Made:**
- Added `useRouter` and `Link` imports
- Made avatar clickable (links to `/dashboard/settings`)
- Added Settings option in mobile dropdown menu
- Enhanced avatar styling with hover effects
- Avatar now shows from profile picture or initials

**Lines Changed:** ~15 lines (links + navigation)

### 2. `server/Models/User.js`
**Changes Made:**
- Added `deleteAccountToken` field (String)
- Added `deleteAccountTokenExpiry` field (Date)
- These store temporary deletion verification codes

**Lines Added:** 6 lines

### 3. `server/index.js`
**Changes Made:**
- Added users route import
- Mounted users route at `/api/users`
- Already had static file serving (checked)

**Lines Added:** 3 lines

### 4. `server/package.json`
**Changes Made:**
- Added `"multer": "^1.4.5-lts.1"` to dependencies

**Lines Changed:** 1 line (dependency added)

## ✨ New Files Created

### Frontend Components

#### `client/src/components/EditProfileModal.tsx` (180 lines)
**Purpose:** Modal for editing user profile (name & avatar)

**Key Functions:**
- `handleFileSelect()` - Image upload validation
- `handleSubmit()` - Profile update API call
- Real-time preview of selected avatar
- Form validation and error handling

**Dependencies:**
- React hooks (useState, useRef, useEffect)
- Toast notifications
- Lucide icons
- Custom Card component

#### `client/src/components/DeleteAccountModal.tsx` (250 lines)
**Purpose:** Two-step account deletion with email verification

**Key Functions:**
- `handleRequestDelete()` - Request deletion email
- `handleConfirmDelete()` - Verify code and delete
- Step management (confirm → verification)
- Error display and handling

**Dependencies:**
- React hooks (useState)
- React Router navigation
- Toast notifications
- Lucide icons

#### `client/src/app/dashboard/settings/page.tsx` (320 lines)
**Purpose:** Main settings page component

**Key Sections:**
- Profile information display
- Avatar preview (large)
- Edit profile button
- Account provider badge
- Join date display
- Security & Privacy section (placeholders)
- Account section (logout, delete)
- Modal integration

**Dependencies:**
- React hooks
- Toast notifications
- Custom modals
- Lucide icons
- Theme provider

### Backend Routes

#### `server/routes/users.js` (350 lines)
**Purpose:** User profile management and account deletion

**Endpoints:**
1. **PUT /api/users/profile**
   - Update user name and/or avatar
   - Multer file upload handling
   - File validation (type, size)
   - Automatic cleanup of old files

2. **POST /api/users/request-delete-account**
   - Generate 6-digit verification code
   - Send email with code
   - Store token with 10-min expiry

3. **POST /api/users/confirm-delete-account**
   - Verify code validity and expiry
   - Delete user document
   - Cleanup files
   - Return success

**Dependencies:**
- Express, Multer
- Authentication middleware
- Email service
- File system operations
- User model

## 📦 Dependencies Added

### Server
```json
{
  "multer": "^1.4.5-lts.1"  // File upload handling
}
```

**Why Multer?**
- Industry standard for file uploads in Express
- Handles multipart/form-data
- Provides file validation options
- Lightweight and performant

### Frontend
**No new dependencies** - All existing packages used:
- lucide-react (icons)
- react-hot-toast (notifications)
- SwitchMode context (theme)
- safeLocalStorage (token storage)

## 🗂️ Directory Changes

### New Directories
```
server/
└── uploads/
    └── profile-pics/          [User avatars stored here]
```

**Initialization:**
```bash
mkdir -p server/uploads/profile-pics
chmod 755 server/uploads/profile-pics
```

## 📊 Code Statistics

| Component | Lines | Type | Status |
|-----------|-------|------|--------|
| EditProfileModal.tsx | 180 | TSX | New |
| DeleteAccountModal.tsx | 250 | TSX | New |
| Settings/page.tsx | 320 | TSX | New |
| users.js | 350 | JS | New |
| DashboardTopBar.tsx | +15 | TSX | Modified |
| User.js | +6 | JS | Modified |
| index.js | +3 | JS | Modified |
| package.json | +1 | JSON | Modified |
| **Total New** | **1,100+** | - | - |

## 🔗 Component Relationships

```
DashboardLayout
├── Sidebar
│   └── Links to /dashboard/settings
└── DashboardTopBar (Updated)
    ├── Avatar (Clickable → /dashboard/settings)
    └── Dropdown Menu
        └── Settings Link (Mobile)

Settings Page (/dashboard/settings)
├── User Info Display
├── Edit Profile Button
│   └── EditProfileModal
│       ├── Name Input
│       └── Avatar Upload
├── Delete Account Button
│   └── DeleteAccountModal
│       ├── Confirmation Step
│       └── Verification Step

Backend
├── /api/users/profile (PUT)
│   └── Multer Upload Middleware
├── /api/users/request-delete-account (POST)
│   └── Email Service
└── /api/users/confirm-delete-account (POST)
    └── Token Validation
```

## 🔐 Authentication Flow

```
User Action → Component → API Call → Middleware
                                     ↓
                              Check JWT Token
                                     ↓
                              Validate User ID
                                     ↓
                              Process Request
                                     ↓
                              Return Response
```

## 🎯 File Upload Flow

```
User Selects File
        ↓
Frontend Validation (Type, Size)
        ↓
Preview Display
        ↓
Form Submit → API (Multipart)
        ↓
Multer Validation
        ↓
Disk Storage
        ↓
Delete Old File
        ↓
Update DB
        ↓
Return Response
        ↓
Frontend Updates UI
```

## 📧 Email Flow

```
Delete Request
        ↓
Generate 6-digit Code
        ↓
Store Code + Expiry
        ↓
Send Email via Nodemailer
        ↓
User Receives Email
        ↓
User Enters Code
        ↓
Verify Code & Expiry
        ↓
Delete Account
        ↓
Cleanup Files
        ↓
Delete Document
```

## 🎨 Styling Architecture

All components use:
- **Tailwind CSS** for utility styling
- **Theme Context** for light/dark mode
- **Custom Card component** for consistent design
- **Lucide React** for icons
- **CSS-in-JS** via classNames for dynamic styles

## 🚀 Build & Deployment Files

No webpack config changes needed:
- Next.js handles frontend builds
- Express runs backend directly
- Static files served by Express middleware

---

**Summary**: The implementation adds ~1,100 lines of new production-ready code with proper error handling, validation, and security measures, while maintaining consistency with the existing codebase architecture and design system.
