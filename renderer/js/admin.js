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

// Admin Panel Main JavaScript
import ReleaseNotes from './modules/admin/release-notes.js';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize modules
    ReleaseNotes.init();
    
    // Admin menu navigation
    const adminMenuLinks = document.querySelectorAll('.admin-menu-link');
    const adminSections = document.querySelectorAll('.admin-section');
    
    adminMenuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links and sections
            adminMenuLinks.forEach(l => l.classList.remove('active'));
            adminSections.forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show corresponding section
            const sectionId = 'admin-' + this.dataset.section;
            document.getElementById(sectionId).classList.add('active');
        });
    });
    
    // Admin settings form submission
    const adminSettingsForm = document.getElementById('admin-settings-form');
    if (adminSettingsForm) {
        adminSettingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Here would be the code to save settings
            alert('Settings saved successfully!');
        });
    }
    
    // Populate admin dashboard with sample data
    populateDashboardData();
})

// Sample data for admin dashboard
function populateDashboardData() {
    // Update stat counts
    document.getElementById('total-games-count').textContent = '12';
    document.getElementById('total-tournaments-count').textContent = '24';
    document.getElementById('total-players-count').textContent = '345';
    document.getElementById('active-tournaments-count').textContent = '5';
    
    // Sample activity data
    const activities = [
        { time: '2 hours ago', message: 'New tournament created: Spring Championship 2023' },
        { time: '3 hours ago', message: 'Player JohnDoe123 registered for Summer Cup' },
        { time: '5 hours ago', message: 'New game added: Cosmic Clash VR' },
        { time: '1 day ago', message: 'Tournament concluded: Winter Series Finals' },
        { time: '2 days ago', message: 'System maintenance completed' }
    ];
    
    // Populate activity list
    const activityList = document.getElementById('recent-activity-list');
    if (activityList) {
        activityList.innerHTML = '';
        
        activities.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <div class="activity-time">${activity.time}</div>
                <div class="activity-message">${activity.message}</div>
            `;
            activityList.appendChild(activityItem);
        });
    }
} 