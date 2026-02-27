/**
 * Firebase Initialization Script
 * Loads configuration from config-loader and initializes Firebase
 * This script should be loaded AFTER config-loader.js and Firebase SDK
 */

(function initializeFirebase() {
    // Verify Firebase SDK is loaded
    if (typeof firebase === 'undefined') {
        console.error('Firebase SDK must be loaded before firebase-init.js');
        return;
    }

    // Get configuration from config loader
    const firebaseConfig = configLoader.getFirebaseConfig();

    // Validate configuration
    if (firebaseConfig.apiKey === 'CONFIG_NOT_SET') {
        console.error(
            'Firebase configuration is not set. ' +
            'Please configure environment variables properly.'
        );
        // Show user-friendly error
        if (typeof document !== 'undefined') {
            document.body.innerHTML = `
                <div style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    background: #f8f9fa;
                    font-family: Arial, sans-serif;
                ">
                    <div style="
                        background: white;
                        padding: 2rem;
                        border-radius: 8px;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                        max-width: 500px;
                        text-align: center;
                    ">
                        <h2>⚠️ Configuration Error</h2>
                        <p>Firebase configuration is missing. Please contact the administrator.</p>
                        <small style="color: #666;">Error: Firebase credentials not loaded</small>
                    </div>
                </div>
            `;
        }
        return;
    }

    try {
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);

        // Initialize services
        window.auth = firebase.auth();
        window.db = firebase.firestore();

        // Enable debug logging if in development
        if (configLoader.isDebugMode()) {
            console.log('🔥 Firebase initialized (Development Mode)');
            firebase.database.enableLogging(true);
        } else {
            console.log('🔥 Firebase initialized (Production Mode)');
        }

        // Dispatch custom event to notify other scripts
        const event = new CustomEvent('firebaseInitialized', {
            detail: { config: firebaseConfig }
        });
        document.dispatchEvent(event);

    } catch (error) {
        console.error('Failed to initialize Firebase:', error);

        // Log to console for debugging
        if (configLoader.isDevelopment()) {
            console.error('Firebase Config:', firebaseConfig);
        }
    }
})();
