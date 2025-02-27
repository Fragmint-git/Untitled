/**
 * Admin Panel Entry Point
 * Loads the admin module and initializes the admin panel
 */

// Load admin module
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Loading admin panel...');
    
    try {
        // Load the main admin module
        await loadScript('../js/modules/admin/admin.js');
        
        // Initialize the admin panel
        if (window.adminModule) {
            window.adminModule.init();
        } else {
            console.error('Admin module not found');
        }
    } catch (error) {
        console.error('Error initializing admin panel:', error);
        showErrorMessage('Failed to initialize admin panel. Please refresh the page.');
    }
});

// Helper function to load a script
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = (error) => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(script);
    });
}

// Show error message
function showErrorMessage(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    document.body.appendChild(errorElement);
} 