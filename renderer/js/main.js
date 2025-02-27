/**
 * Main Application Entry Point
 * Initializes all modules and starts the application
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing application...');
    
    // Initialize UI components
    window.uiModule.initUI();
    
    // Initialize navigation
    window.navigationModule.initNavigation();
    
    // Load dashboard data on initial load
    window.dashboardModule.loadDashboardData();
    
    console.log('Application initialized successfully');
}); 