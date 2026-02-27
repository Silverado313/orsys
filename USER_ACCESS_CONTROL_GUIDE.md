# Database-Driven User Access Control

## Problem with Hardcoded Email Lists

Current approach (in dashboard.js, appdvreport.js, etc.):
```javascript
const allowedEmails = [
    'aneel@aryservices.com.pk',
    'mohiuddin.siddiqui@aryservices.com.pk',
    // ... hardcoded list
];
```

### Issues:
- ❌ Requires code changes to add/remove users
- ❌ Inconsistent across multiple files
- ❌ No audit trail
- ❌ Can't change permissions without redeployment
- ❌ Security risk during maintenance

## Solution: userData Collection

### Step 1: Create userData in Firestore

Manually create the collection and documents in Firebase Console:

**Collection**: `userData`
**Documents**: One per user (uid as document ID)

```
Collection: userData
├── Document: uid_12345
│   ├── email: "aneel@aryservices.com.pk"
│   ├── displayName: "Aneel Raza"
│   ├── role: "admin"
│   ├── active: true
│   ├── createdAt: timestamp
│   └── permissions: {
│       "canCreateVouchers": true,
│       "canEditVouchers": true,
│       "canDeleteVouchers": false,
│       "canViewReports": true,
│       "canManageUsers": false
│   }
│
├── Document: uid_67890
│   ├── email: "mohiuddin.siddiqui@aryservices.com.pk"
│   ├── displayName: "Mohiuddin Siddiqui"
│   ├── role: "user"
│   ├── active: true
│   ├── permissions: {
│       "canCreateVouchers": true,
│       "canEditVouchers": true,
│       "canDeleteVouchers": false,
│       ...
│   }
```

### Step 2: Update Firestore Rules

Replace the hardcoded email check with database lookup:

```javascript
function isAllowedUser() {
  return isAuth() && 
         get(/databases/$(database)/documents/userData/$(request.auth.uid)).data.active == true;
}

function hasPermission(permission) {
  return isAuth() && 
         get(/databases/$(database)/documents/userData/$(request.auth.uid)).data.permissions[permission] == true;
}
```

### Step 3: Create User Management Utility

```javascript
// /src/scripts/shared/user-manager.js

class UserManager {
    /**
     * Get current user data from Firestore
     */
    static async getCurrentUserData() {
        try {
            const userDoc = await db.collection('userData')
                .doc(auth.currentUser.uid)
                .get();
            
            if (!userDoc.exists) {
                console.warn('User data not found in database');
                return null;
            }
            
            return userDoc.data();
        } catch (error) {
            console.error('Error fetching user data:', error);
            return null;
        }
    }

    /**
     * Check if user is admin
     */
    static async isAdmin() {
        const userData = await this.getCurrentUserData();
        return userData?.role === 'admin';
    }

    /**
     * Check if user has specific permission
     */
    static async hasPermission(permission) {
        const userData = await this.getCurrentUserData();
        return userData?.permissions?.[permission] === true;
    }

    /**
     * Check if user is active
     */
    static async isActive() {
        const userData = await this.getCurrentUserData();
        return userData?.active === true;
    }

    /**
     * Get all users (admin only)
     */
    static async getAllUsers() {
        try {
            const snapshot = await db.collection('userData')
                .where('active', '==', true)
                .get();
            
            const users = [];
            snapshot.forEach(doc => {
                users.push({ uid: doc.id, ...doc.data() });
            });
            return users;
        } catch (error) {
            console.error('Error fetching users:', error);
            return [];
        }
    }

    /**
     * Add user (admin only)
     */
    static async addUser(uid, userData) {
        try {
            await db.collection('userData').doc(uid).set({
                email: userData.email,
                displayName: userData.displayName || '',
                role: userData.role || 'user',
                active: true,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                permissions: userData.permissions || {}
            });
            return true;
        } catch (error) {
            console.error('Error adding user:', error);
            return false;
        }
    }

    /**
     * Update user (admin only)
     */
    static async updateUser(uid, updates) {
        try {
            await db.collection('userData').doc(uid).update({
                ...updates,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Error updating user:', error);
            return false;
        }
    }

    /**
     * Deactivate user (admin only)
     */
    static async deactivateUser(uid) {
        return this.updateUser(uid, { active: false });
    }

    /**
     * Grant permission to user (admin only)
     */
    static async grantPermission(uid, permission) {
        try {
            const userRef = db.collection('userData').doc(uid);
            await userRef.update({
                [`permissions.${permission}`]: true
            });
            return true;
        } catch (error) {
            console.error('Error granting permission:', error);
            return false;
        }
    }
}
```

### Step 4: Update Dashboard to Use New System

Replace hardcoded email checks:

```javascript
// OLD CODE (REMOVE):
const allowedEmails = ['aneel@aryservices.com.pk', ...];

auth.onAuthStateChanged(function(user) {
    if (!user || !allowedEmails.includes(user.email)) {
        window.location.href = '/';
    }
});

// NEW CODE (USE):
auth.onAuthStateChanged(async function(user) {
    if (!user) {
        window.location.href = '/';
        return;
    }

    const userData = await UserManager.getCurrentUserData();
    if (!userData?.active) {
        alert('Your account is inactive. Contact administrator.');
        await auth.signOut();
        window.location.href = '/';
        return;
    }

    initializeDashboard();
});
```

### Step 5: Create Admin User Management Panel

Create a simple UI to manage users (replace hardcoded lists):

```html
<!-- /src/pages/admin/users.html -->
<div id="users-container">
    <!-- User list will be populated by JavaScript -->
</div>

<script src="/src/scripts/shared/user-manager.js"></script>
<script>
    async function loadUsers() {
        const users = await UserManager.getAllUsers();
        // Render user list
    }
</script>
```

## Migration Checklist

### Phase 1: Setup Database
- [ ] Create `userData` collection in Firestore
- [ ] Add all current allowed users as documents
- [ ] Grant each user appropriate permissions
- [ ] Update Firestore rules to use database lookup

### Phase 2: Update Code
- [ ] Create `user-manager.js` utility script
- [ ] Update all dashboard files to use `UserManager`
- [ ] Remove hardcoded email lists from:
  - `dashboard.js`
  - `appdvreport.js`
  - `enhanced_dashboard_datatables.js`
  - Any other files with `allowedEmails`
- [ ] Update `firebaseConfig.js` to load user data on init

### Phase 3: Testing
- [ ] Test admin user can access all features
- [ ] Test regular user has limited access
- [ ] Test inactive user is denied access
- [ ] Test permission checking works

### Phase 4: Cleanup
- [ ] Remove all hardcoded email lists
- [ ] Update security rules
- [ ] Document user management process

## Benefits

✅ **Easier Management**: Add/remove users without touching code
✅ **Better Audit Trail**: All user changes logged in Firestore
✅ **Role-Based Access**: Support different permission levels
✅ **Real-Time Updates**: User status changes immediately
✅ **Scalability**: Easy to add hundreds of users
✅ **Security**: Centralized permission management

---

**This approach transforms your system from hardcoded lists to enterprise-grade access control.**
