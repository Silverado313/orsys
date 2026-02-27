/**
 * UserManager - Database-driven access control
 * Replaces hardcoded email lists with Firestore userData collection
 */

class UserManager {
    // Cache for user data (5 minute TTL)
    static userCache = new Map();
    static CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    /**
     * Get current user data from Firestore with caching
     */
    static async getCurrentUserData(forceRefresh = false) {
        if (!auth.currentUser) {
            console.error('No user authenticated');
            return null;
        }

        const uid = auth.currentUser.uid;

        // Check cache first
        if (!forceRefresh && this.userCache.has(uid)) {
            const cached = this.userCache.get(uid);
            if (Date.now() - cached.timestamp < this.CACHE_TTL) {
                return cached.data;
            }
        }

        try {
            const userDoc = await db.collection('userData').doc(uid).get();

            if (!userDoc.exists) {
                console.warn(`User document not found for uid: ${uid}`);
                this.userCache.set(uid, {
                    data: null,
                    timestamp: Date.now()
                });
                return null;
            }

            const userData = userDoc.data();

            // Cache the result
            this.userCache.set(uid, {
                data: userData,
                timestamp: Date.now()
            });

            return userData;
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
     * Get all allowed users (admin only)
     */
    static async getAllUsers() {
        try {
            // Check permission first
            if (!(await this.isAdmin())) {
                console.error('Only admins can view all users');
                return [];
            }

            const snapshot = await db.collection('userData')
                .orderBy('displayName')
                .get();

            const users = [];
            snapshot.forEach(doc => {
                users.push({
                    uid: doc.id,
                    ...doc.data()
                });
            });
            return users;
        } catch (error) {
            console.error('Error fetching users:', error);
            return [];
        }
    }

    /**
     * Add new user (admin only)
     */
    static async addUser(uid, userData) {
        try {
            if (!(await this.isAdmin())) {
                throw new Error('Only admins can add users');
            }

            const { email, displayName, role = 'user', permissions = {} } = userData;

            if (!email || !displayName) {
                throw new Error('Email and displayName are required');
            }

            await db.collection('userData').doc(uid).set({
                email: InputValidator.sanitizeString(email),
                displayName: InputValidator.sanitizeString(displayName),
                role: role,
                active: true,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: auth.currentUser.email,
                permissions: permissions || {}
            });

            console.log(`User ${uid} added successfully`);
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
            if (!(await this.isAdmin())) {
                throw new Error('Only admins can update users');
            }

            // Sanitize text fields
            if (updates.displayName) {
                updates.displayName = InputValidator.sanitizeString(updates.displayName);
            }

            await db.collection('userData').doc(uid).update({
                ...updates,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: auth.currentUser.email
            });

            // Invalidate cache
            this.userCache.delete(uid);

            console.log(`User ${uid} updated successfully`);
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
        return this.updateUser(uid, {
            active: false,
            deactivatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    }

    /**
     * Activate user (admin only)
     */
    static async activateUser(uid) {
        return this.updateUser(uid, {
            active: true,
            activatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    }

    /**
     * Grant permission to user (admin only)
     */
    static async grantPermission(uid, permission) {
        try {
            if (!(await this.isAdmin())) {
                throw new Error('Only admins can grant permissions');
            }

            const userRef = db.collection('userData').doc(uid);
            await userRef.update({
                [`permissions.${permission}`]: true,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            this.userCache.delete(uid);
            console.log(`Permission '${permission}' granted to ${uid}`);
            return true;
        } catch (error) {
            console.error('Error granting permission:', error);
            return false;
        }
    }

    /**
     * Revoke permission from user (admin only)
     */
    static async revokePermission(uid, permission) {
        try {
            if (!(await this.isAdmin())) {
                throw new Error('Only admins can revoke permissions');
            }

            const userRef = db.collection('userData').doc(uid);
            await userRef.update({
                [`permissions.${permission}`]: false,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            this.userCache.delete(uid);
            console.log(`Permission '${permission}' revoked from ${uid}`);
            return true;
        } catch (error) {
            console.error('Error revoking permission:', error);
            return false;
        }
    }

    /**
     * Clear cache for user (useful after updates)
     */
    static clearCache(uid = null) {
        if (uid) {
            this.userCache.delete(uid);
        } else {
            this.userCache.clear();
        }
    }

    /**
     * Check access with fallback to legacy hardcoded list (for migration period)
     */
    static async checkAccessWithFallback(legacyAllowedEmails = []) {
        if (!auth.currentUser) {
            return false;
        }

        // Try new system first
        const userData = await this.getCurrentUserData();
        if (userData?.active === true) {
            return true;
        }

        // Fallback to legacy system (during migration)
        if (legacyAllowedEmails.includes(auth.currentUser.email)) {
            console.warn('User accessed via legacy email list - please migrate to userData collection');
            return true;
        }

        return false;
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserManager;
}
