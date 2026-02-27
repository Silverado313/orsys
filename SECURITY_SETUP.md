# 🔒 Security Setup Guide - ORSYS-ARY

## Priority 1 - COMPLETED ✅

### ✅ 1. Environment Variables Setup

**What was done:**
- Created `.env` file with Firebase configuration (DO NOT COMMIT)
- Created `.env.example` template for team members
- Created `.gitignore` to prevent accidental commits

**Files created:**
- `.env` - Your actual credentials (in gitignore)
- `.env.example` - Template for others to copy

**Verify environment variables are loaded:**
```bash
# Check that .env is created
ls -la .env

# Check that .env is in .gitignore
cat .gitignore | grep ".env"
```

---

### ✅ 2. Secure Config Loader

**What was done:**
- Created `/src/scripts/config/configLoader.js` that loads from environment variables
- Replaces hardcoded Firebase credentials across ALL pages
- Validates that all required config is present

**All pages updated from:** exposing `firebaseConfig.js`  
**Updated to:** using secure `configLoader.js`

**Affected files (17 total):**
- ✅ index.html
- ✅ src/pages/dashboard.html
- ✅ src/pages/admin/index.html
- ✅ src/pages/dv/dashboard.html
- ✅ src/pages/dv/index.html
- ✅ src/pages/dv/print.html
- ✅ src/pages/dashboard4dv/index.html
- ✅ src/pages/vouchers/receipt.html
- ✅ src/pages/vouchers/print.html
- ✅ src/pages/vouchers/verify.html
- ✅ src/pages/vouchers/index.html
- ✅ src/pages/admin/add-head.html
- ✅ src/pages/admin/cv/update.html
- ✅ src/pages/admin/dv/update.html
- ✅ src/pages/admin/dv/update copy.html
- ✅ src/pages/index.html
- ✅ crud/index_old1.html

---

### ✅ 3. Input Validation

**What was done:**
- Created `/src/scripts/config/validation.js` with comprehensive validation rules
- Includes sanitization to prevent XSS attacks
- Added form validation utilities

**Available validation rules:**
```javascript
// In your forms, use:
validateField(value, 'email')        // Email validation
validateField(value, 'phone')        // Phone number validation
validateField(value, 'amount')       // Currency amounts
validateField(value, 'name')         // Names
validateField(value, 'slipNo')       // Numeric slip numbers
sanitizeInput(userInput)             // Clean XSS attempts
```

**Add to your forms:**
```html
<!-- Already added to all main pages -->
<script src="/src/scripts/config/validation.js"></script>
```

---

## Priority 2 - Next Steps (NOT STARTED)

### ❌ 4. Firestore Security Rules

These CRITICAL rules prevent unauthorized database access even if Firebase keys are exposed.

**Where to set them:**
1. Go to Firebase Console → Firestore Database → Rules
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Only authenticated admins can read/write
    match /vouchers/{document=**} {
      allow read, write: if 
        request.auth != null && 
        request.auth.token.email in getAllowedAdmins();
    }
    
    match /heads/{document=**} {
      allow read, write: if 
        request.auth != null && 
        request.auth.token.email in getAllowedAdmins();
    }
    
    // Public receipts verification (read-only)
    match /publicReceipts/{slipNo} {
      allow read: if true;
      allow write: if false;
    }
  }
  
  function getAllowedAdmins() {
    return [
      'aneel@aryservices.com.pk',
      'mohiuddin.siddiqui@aryservices.com.pk',
      'qasim@aryservices.com.pk',
      'khizar.ansari@aryservices.com.pk',
      'essa@aryservices.com.pk'
    ];
  }
}
```

**⚠️ CRITICAL:** Do this BEFORE deploying!

---

### ❌ 5. Extract Hardcoded Emails to Database

**Current issue:**
- Admin emails hardcoded in multiple JS files
- Cannot add/remove admins without code changes

**Solution:**
1. Create `admins` collection in Firestore with email list
2. Update dashboard.js, appdvreport.js, etc. to fetch from database
3. Create admin panel to manage allowed users

**Example Firebase collection structure:**
```
admins/
  ├── aneel@aryservices.com.pk
  │   └── role: "superadmin"
  │       createdAt: timestamp
  ├── mohiuddin.siddiqui@aryservices.com.pk
  │   └── role: "admin"
  │       createdAt: timestamp
```

---

## 🚀 How to Deploy Securely

### For Local Development:
```bash
# 1. Copy the example file
cp .env.example .env

# 2. Edit .env with your credentials
nano .env  # or edit in VS Code

# 3. Verify .env is in .gitignore
cat .gitignore | grep "^.env$"

# 4. Start your development server
# (Vite or your current setup will load from .env)
```

### For Production (Firebase Hosting):
```bash
# 1. DO NOT commit .env file
git status .env  # Should show "not tracked"

# 2. Set environment variables in Firebase
firebase deploy --token YOUR_TOKEN

# 3. Configure environment variables:
# Option A: Firebase Functions (recommended)
# firebase functions:config:set env.firebase_key="YOUR_KEY"

# Option B: Use .env in hosting (with Cloud Build)
# Set secrets in Google Cloud Secret Manager
```

### For Other Platforms (Vercel, Netlify, etc.):
1. Go to project settings → Environment Variables
2. Add each VITE_* variable
3. Deploy (they'll automatically be loaded)

---

## ✅ Verification Checklist

- [ ] `.env` file exists with correct values
- [ ] `.env` is in `.gitignore` (prevents accidental commits)
- [ ] All HTML pages load `configLoader.js`
- [ ] Browser console shows: "✅ Firebase config loaded from environment variables"
- [ ] Firebase auth still works on your pages
- [ ] `.env.example` is committed to git (sharing the structure)

---

## 🔐 Security Best Practices Going Forward

1. **Never commit `.env`** - It contains production secrets
2. **Use environment variables** - For all sensitive data
3. **Rotate API keys** - Periodically regenerate in Firebase Console
4. **Enable Firestore Rules** - Always restrict database access
5. **Monitor database** - Set up Firebase alerts for unusual activity
6. **Add input validation** - Prevent injection attacks (already done!)
7. **Use HTTPS only** - Enable in Firebase Hosting settings

---

## 📞 Questions?

If you get "Firebase config incomplete" error:
1. Check `.env` file exists
2. Verify all `VITE_FIREBASE_*` variables are set
3. Make sure `configLoader.js` is loaded before other scripts
4. Check browser DevTools → Network tab for 404s

---

**Last Updated:** February 27, 2026  
**Status:** Priority 1 ✅ COMPLETE | Priority 2 ⏳ READY
