/**
 * Privacy Settings Module
 * Handles privacy settings section of the profile
 */

// Initialize privacy settings section
function initPrivacySettings() {
    // Get form element
    const privacySettingsForm = document.getElementById('privacy-settings-form');
    
    // Add submit event listener
    if (privacySettingsForm) {
        privacySettingsForm.addEventListener('submit', handlePrivacySettingsSubmit);
    }
    
    // Listen for load event
    window.addEventListener('profile:load-privacy-settings', handleLoadPrivacySettings);
}

// Handle form submission
function handlePrivacySettingsSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(e.target);
    const privacySettings = {
        profileVisibility: formData.get('profileVisibility') === 'on',
        showRealName: formData.get('showRealName') === 'on',
        shareStatistics: formData.get('shareStatistics') === 'on'
    };
    
    // Save to localStorage
    savePrivacySettings(privacySettings);
    
    // Show notification
    window.uiModule.showNotification('Privacy settings saved successfully', 'success');
}

// Handle loading privacy settings
function handleLoadPrivacySettings(e) {
    const privacySettings = e.detail;
    
    // Populate form fields
    const profileVisibility = document.getElementById('profile-visibility');
    const showRealName = document.getElementById('show-real-name');
    const shareStatistics = document.getElementById('share-statistics');
    
    if (profileVisibility) profileVisibility.checked = privacySettings.profileVisibility;
    if (showRealName) showRealName.checked = privacySettings.showRealName;
    if (shareStatistics) shareStatistics.checked = privacySettings.shareStatistics;
}

// Save privacy settings to localStorage
function savePrivacySettings(privacySettings) {
    // Get current user data
    const savedUserData = localStorage.getItem('userData');
    const userData = savedUserData ? JSON.parse(savedUserData) : {};
    
    // Update privacy settings
    userData.privacySettings = privacySettings;
    
    // Save to localStorage
    localStorage.setItem('userData', JSON.stringify(userData));
}

// Initialize module
initPrivacySettings(); 