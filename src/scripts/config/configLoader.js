/**
 * ============================================================================
 * Config Loader - Securely loads Firebase configuration
 * ============================================================================
 * For vanilla HTML/JS projects WITHOUT a build tool
 * 
 * USAGE:
 * 1. Update the config object below with your values from .env
 * 2. Or if you're deploying, set these via hosting environment (Firebase, Netlify, etc)
 * ============================================================================
 */

// FIREBASE CONFIGURATION - Update these values from your .env file
const firebaseConfig = {
  apiKey: "AIzaSyBT5QC4BsHvNGBL-JDVAhCPqmWiBzfgT_4",
  authDomain: "orsys-ary.firebaseapp.com",
  projectId: "orsys-ary",
  storageBucket: "orsys-ary.firebasestorage.app",
  messagingSenderId: "182260073312",
  appId: "1:182260073312:web:e6c1c05b6eb67b139b5405",
  measurementId: "G-3XHTBHC14M"
};

// ALLOWED ADMIN EMAILS - Update this list
const ALLOWED_ADMINS = [
  'aneel@aryservices.com.pk',
  'mohiuddin.siddiqui@aryservices.com.pk',
  'qasim@aryservices.com.pk',
  'khizar.ansari@aryservices.com.pk',
  'essa@aryservices.com.pk'
];

// Validate that all required config values are present
const requiredKeys = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId'
];

console.log('%c🔐 Initializing Firebase Configuration...', 'color: blue; font-weight: bold;');

for (const key of requiredKeys) {
  if (!firebaseConfig[key]) {
    console.error(`❌ Missing Firebase config: ${key}`);
    throw new Error(`Firebase configuration incomplete: ${key} is missing`);
  }
}

// Check if Firebase is loaded
if (typeof firebase === 'undefined') {
  console.error('❌ Firebase SDK not loaded. Make sure Firebase scripts are loaded BEFORE this file.');
  throw new Error('Firebase SDK must be loaded before configLoader.js');
}

// Check if Firebase app is already initialized
if (firebase.apps.length === 0) {
  try {
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    throw error;
  }
} else {
  console.log('✅ Firebase already initialized');
}

// Export instances for use in other scripts
const auth = firebase.auth();
const db = firebase.firestore();

// Configuration object for app settings
const APP_CONFIG = {
  allowedAdmins: ALLOWED_ADMINS,
  debug: true // Set to false in production
};

// Log config status
if (APP_CONFIG.debug) {
  console.log('✅ Config loaded successfully');
  console.log('👤 Allowed admins:', ALLOWED_ADMINS.length, 'users');
}

// Export to global scope so other scripts can access
window.firebaseConfig = firebaseConfig;
window.auth = auth;
window.db = db;
window.APP_CONFIG = APP_CONFIG;
window.ALLOWED_ADMINS = ALLOWED_ADMINS;

console.log('%c✅ Firebase ready!', 'color: green; font-weight: bold;');
