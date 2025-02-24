const path = require('path');
const fs = require('fs');
const os = require('os');
const { app } = require('electron');

// Create the app data directory if it doesn't exist
const appDataPath = path.join(app ? app.getPath('userData') : os.homedir(), 'vr-tournament-app');
if (!fs.existsSync(appDataPath)) {
    fs.mkdirSync(appDataPath, { recursive: true });
}

// Config for different environments
const config = {
    development: {
        appName: 'VR Tournament App (Dev)',
        databasePath: path.join(appDataPath, 'dev-tournament.db'),
        apiPort: 3000,
        logLevel: 'debug'
    },
    test: {
        appName: 'VR Tournament App (Test)',
        databasePath: path.join(appDataPath, 'test-tournament.db'),
        apiPort: 3001,
        logLevel: 'info'
    },
    production: {
        appName: 'VR Tournament App',
        databasePath: path.join(appDataPath, 'tournament.db'),
        apiPort: 0, // Dynamic port for production
        logLevel: 'warn'
    }
};

// Get current environment from NODE_ENV or default to development
const env = process.env.NODE_ENV || 'development';
const currentConfig = config[env];

module.exports = {
    ...currentConfig,
    env,
    appDataPath,
    // Mobile specific settings
    mobile: {
        // Settings specific to mobile platforms
        apiUrl: 'https://api.vrtournament.example.com', // For when using in mobile context
        mobileAppId: 'com.fragmint.vrtournament'
    }
};