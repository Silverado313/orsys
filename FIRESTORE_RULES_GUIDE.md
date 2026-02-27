# Firestore Security Rules Deployment Guide

## Quick Start

### Option 1: Manual Deployment via Firebase Console (Recommended for beginners)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project **orsys-ary**
3. Left sidebar → **Firestore Database**
4. Click the **Rules** tab
5. Copy the entire content from `firestore.rules` file
6. Paste it into the Firebase Console rules editor
7. Click **Publish**

### Option 2: Automated Deployment via Firebase CLI

#### Prerequisites
```bash
npm install -g firebase-tools
```

#### Deployment Steps
```bash
# 1. Login to Firebase (first time only)
firebase login

# 2. Initialize Firebase project locally (if not done)
firebase init firestore

# 3. Deploy only Firestore rules
firebase deploy --only firestore:rules

# 4. Verify deployment
firebase firestore:indexes
```

## Understanding These Rules

### 🔐 Security Levels

1. **Public (No Auth)**: ❌ Not allowed
2. **Authenticated Only**: Limited
3. **Allowed Users Only**: ✅ Main level (using email whitelist)
4. **Admin Only**: 🔒 Sensitive operations

### 📋 Collections Protected

| Collection | Read | Create | Update | Delete |
|-----------|------|--------|--------|--------|
| `vouchers` | Allowed Users | Allowed Users | Creator/Admin | Creator/Admin |
| `debitVouchers` | Allowed Users | Allowed Users | Creator/Admin | Creator/Admin |
| `userData` | Self/Admin | Admin | Self/Admin | Admin |
| `heads` | Allowed Users | Admin | Admin | Admin |
| `config` | Authenticated | Admin | Admin | Admin |
| `auditLog` | Self/Admin | System | System | System |

## Important Notes

### ⚠️ Hardcoded Email List

The current rules use a hardcoded email list:
```javascript
function isAllowedUser() {
  return isAuth() && request.auth.token.email in [
    'aneel@aryservices.com.pk',
    'mohiuddin.siddiqui@aryservices.com.pk',
    // ...
  ];
}
```

**TODO - Better Approach:** Use a `userData` collection for role management:

```javascript
function isAllowedUser() {
  return isAuth() && 
         get(/databases/$(database)/documents/userData/$(request.auth.uid)).data.active == true;
}
```

### 📝 Field Validation

For better security, add data validation to create/update operations:

```javascript
allow create: if isAllowedUser() && 
               validateVoucher(request.resource.data);

function validateVoucher(data) {
  return data.slipNo is string &&
         data.cellNo is string &&
         data.amount is number &&
         data.amount > 0;
}
```

## Testing Rules Locally

### Option 1: Firestore Emulator

```bash
# Install emulator
firebase init emulator

# Run emulator
firebase emulators:start
```

### Option 2: Firebase Console Simulator

1. In Firebase Console → Firestore Rules
2. Click **Simulator** button
3. Test read/write scenarios with different users

## Troubleshooting

### "Permission denied" errors
- Check if user email is in the allowed list
- Verify user is authenticated
- Check if data structure matches rules

### "Field validation failed"
- Ensure all required fields are present
- Check field data types
- Verify timestamp format

## Next Steps

1. ✅ Deploy these rules to Firebase
2. 🔄 Update hardcoded email list → database-driven
3. 📊 Add audit logging for compliance
4. 🧪 Test with different user roles
5. 📚 Create backend Cloud Functions for complex operations

---

**Security Level After Deployment**: 🟡 **Good**

Even with exposed API keys, these rules prevent unauthorized access to your data.

**For Production**: Consider implementing Cloud Functions as a backend proxy.
