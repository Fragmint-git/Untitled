/**
 * Account Settings Module
 * Handles account settings section of the profile
 */

// Initialize account settings section
function initAccountSettings() {
    // Get form element
    const accountSettingsForm = document.getElementById('account-settings-form');
    
    // Add submit event listener
    if (accountSettingsForm) {
        accountSettingsForm.addEventListener('submit', handleAccountSettingsSubmit);
    }
    
    // Listen for load event
    window.addEventListener('profile:load-account-settings', handleLoadAccountSettings);
}

// Handle form submission
function handleAccountSettingsSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(e.target);
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');
    
    // Validate passwords if changing password
    if (currentPassword && newPassword) {
        if (newPassword !== confirmPassword) {
            window.uiModule.showNotification('New passwords do not match', 'error');
            return;
        }
        
        // In a real app, you would verify the current password and update the password
        // For this example, we'll just show a success message
        window.uiModule.showNotification('Password updated successfully', 'success');
    }
    
    // Save account settings
    const accountSettings = {
        language: formData.get('language')
    };
    
    // Save to localStorage
    saveAccountSettings(accountSettings);
    
    // Show notification
    window.uiModule.showNotification('Account settings saved successfully', 'success');
}

// Handle loading account settings
function handleLoadAccountSettings(e) {
    const accountSettings = e.detail;
    
    // Populate form fields
    const languageSelect = document.getElementById('language-select');
    
    if (languageSelect) {
        languageSelect.value = accountSettings.language || 'en';
    }
}

// Save account settings to localStorage
function saveAccountSettings(accountSettings) {
    // Get current user data
    const savedUserData = localStorage.getItem('userData');
    const userData = savedUserData ? JSON.parse(savedUserData) : {};
    
    // Update account settings
    userData.accountSettings = accountSettings;
    
    // Save to localStorage
    localStorage.setItem('userData', JSON.stringify(userData));
}

// Initialize module
initAccountSettings(); 