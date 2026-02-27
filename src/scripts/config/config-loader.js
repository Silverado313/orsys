/**
 * Configuration Loader
 * Handles environment variables and configuration for different environments
 * This bridges vanilla JS with environment variable support
 */

class ConfigLoader {
    constructor() {
        this.config = this.loadConfig();
    }

    /**
     * Load configuration from environment or fallback
     * In development: looks for window.__CONFIG__ or localStorage
     * In production: should use build-time substitution
     */
    loadConfig() {
        // Check if config is already loaded globally
        if (window.__CONFIG__) {
            return window.__CONFIG__;
        }

        // Check localStorage (for development)
        const localConfig = localStorage.getItem('__APP_CONFIG__');
        if (localConfig) {
            return JSON.parse(localConfig);
        }

        // Development fallback - encourage using environment variables
        console.warn(
            '%c⚠️ Configuration loaded from fallback.\n' +
            'For security:\n' +
            '1. Create .env.local with Firebase credentials\n' +
            '2. Use a build tool (Vite) to inject these at build time\n' +
            '3. Never commit sensitive keys to git',
            'color: orange; font-weight: bold;'
        );

        // This should trigger an error if no config is set
        return this.getProductionConfig();
    }

    /**
     * Get production configuration
     * In production builds, this should be injected by the build system
     */
    getProductionConfig() {
        return {
            apiKey: process.env.VITE_FIREBASE_API_KEY || 'CONFIG_NOT_SET',
            authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'CONFIG_NOT_SET',
            projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'CONFIG_NOT_SET',
            storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'CONFIG_NOT_SET',
            messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'CONFIG_NOT_SET',
            appId: process.env.VITE_FIREBASE_APP_ID || 'CONFIG_NOT_SET',
            measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || 'CONFIG_NOT_SET'
        };
    }

    /**
     * Set configuration from external source (for loading from config file)
     */
    setConfig(config) {
        this.config = config;
        window.__CONFIG__ = config;
    }

    /**
     * Get Firebase configuration
     */
    getFirebaseConfig() {
        const requiredKeys = [
            'apiKey', 'authDomain', 'projectId',
            'storageBucket', 'messagingSenderId', 'appId'
        ];

        // Validate required keys
        for (const key of requiredKeys) {
            if (!this.config[key] || this.config[key] === 'CONFIG_NOT_SET') {
                console.error(
                    `Missing Firebase configuration: ${key}\n` +
                    'Please set up environment variables properly.'
                );
            }
        }

        return this.config;
    }

    /**
     * Check if running in development mode
     */
    isDevelopment() {
        return (
            (process.env.VITE_APP_ENV === 'development') ||
            (typeof window !== 'undefined' && window.location.hostname === 'localhost')
        );
    }

    /**
     * Get debug mode setting
     */
    isDebugMode() {
        return process.env.VITE_DEBUG_MODE === 'true' || this.isDevelopment();
    }
}

// Create singleton instance
const configLoader = new ConfigLoader();

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = configLoader;
}
