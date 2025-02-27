/**
 * Main Application Entry Point
 * Initializes all modules and starts the application
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing application...');
    
    // Initialize UI module
    if (window.uiModule) {
        window.uiModule.initUI();
    }
    
    // Initialize navigation
    if (window.navigationModule) {
        window.navigationModule.initNavigation();
    }
    
    // Initialize dashboard
    if (window.dashboardModule) {
        window.dashboardModule.loadDashboardData();
    }
    
    // Initialize profile module
    if (window.profileModule) {
        window.profileModule.initProfile();
    }
    
    // Show welcome notification
    if (window.uiModule) {
        window.uiModule.showNotification('Welcome to VR Tournament Manager', 'info');
    }
    
    console.log('Application initialized successfully');
}); 