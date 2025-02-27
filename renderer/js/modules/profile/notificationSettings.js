/**
 * Notification Settings Module
 * Handles notification settings section of the profile
 */

// Initialize notification settings section
function initNotificationSettings() {
    // Get form element
    const notificationSettingsForm = document.getElementById('notification-settings-form');
    
    // Add submit event listener
    if (notificationSettingsForm) {
        notificationSettingsForm.addEventListener('submit', handleNotificationSettingsSubmit);
    }
    
    // Listen for load event
    window.addEventListener('profile:load-notification-settings', handleLoadNotificationSettings);
}

// Handle form submission
function handleNotificationSettingsSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(e.target);
    const notificationSettings = {
        emailNotifications: formData.get('emailNotifications') === 'on',
        tournamentUpdates: formData.get('tournamentUpdates') === 'on',
        matchReminders: formData.get('matchReminders') === 'on',
        resultNotifications: formData.get('resultNotifications') === 'on',
        desktopNotifications: formData.get('desktopNotifications') === 'on'
    };
    
    // Save to localStorage
    saveNotificationSettings(notificationSettings);
    
    // Show notification
    window.uiModule.showNotification('Notification settings saved successfully', 'success');
}

// Handle loading notification settings
function handleLoadNotificationSettings(e) {
    const notificationSettings = e.detail;
    
    // Populate form fields
    const emailNotifications = document.getElementById('email-notifications');
    const tournamentUpdates = document.getElementById('tournament-updates');
    const matchReminders = document.getElementById('match-reminders');
    const resultNotifications = document.getElementById('result-notifications');
    const desktopNotifications = document.getElementById('desktop-notifications');
    
    if (emailNotifications) emailNotifications.checked = notificationSettings.emailNotifications;
    if (tournamentUpdates) tournamentUpdates.checked = notificationSettings.tournamentUpdates;
    if (matchReminders) matchReminders.checked = notificationSettings.matchReminders;
    if (resultNotifications) resultNotifications.checked = notificationSettings.resultNotifications;
    if (desktopNotifications) desktopNotifications.checked = notificationSettings.desktopNotifications;
}

// Save notification settings to localStorage
function saveNotificationSettings(notificationSettings) {
    // Get current user data
    const savedUserData = localStorage.getItem('userData');
    const userData = savedUserData ? JSON.parse(savedUserData) : {};
    
    // Update notification settings
    userData.notificationSettings = notificationSettings;
    
    // Save to localStorage
    localStorage.setItem('userData', JSON.stringify(userData));
}

// Initialize module
initNotificationSettings(); 