/**
 * Personal Information Module
 * Handles personal information section of the profile
 */

// Initialize personal information section
function initPersonalInfo() {
    // Get form element
    const personalInfoForm = document.getElementById('personal-info-form');
    
    // Add submit event listener
    if (personalInfoForm) {
        personalInfoForm.addEventListener('submit', handlePersonalInfoSubmit);
    }
    
    // Listen for load event
    window.addEventListener('profile:load-personal-info', handleLoadPersonalInfo);
}

// Handle form submission
function handlePersonalInfoSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(e.target);
    const personalInfo = {
        displayName: formData.get('displayName'),
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        bio: formData.get('bio')
    };
    
    // Save to localStorage
    savePersonalInfo(personalInfo);
    
    // Show notification
    window.uiModule.showNotification('Personal information saved successfully', 'success');
}

// Handle loading personal information
function handleLoadPersonalInfo(e) {
    const personalInfo = e.detail;
    
    // Populate form fields
    const displayNameField = document.getElementById('display-name');
    const fullNameField = document.getElementById('full-name');
    const emailField = document.getElementById('email');
    const phoneField = document.getElementById('phone');
    const bioField = document.getElementById('bio');
    
    if (displayNameField) displayNameField.value = personalInfo.displayName || '';
    if (fullNameField) fullNameField.value = personalInfo.fullName || '';
    if (emailField) emailField.value = personalInfo.email || '';
    if (phoneField) phoneField.value = personalInfo.phone || '';
    if (bioField) bioField.value = personalInfo.bio || '';
}

// Save personal information to localStorage
function savePersonalInfo(personalInfo) {
    // Get current user data
    const savedUserData = localStorage.getItem('userData');
    const userData = savedUserData ? JSON.parse(savedUserData) : {};
    
    // Update personal information
    userData.personalInfo = personalInfo;
    
    // Save to localStorage
    localStorage.setItem('userData', JSON.stringify(userData));
}

// Initialize module
initPersonalInfo(); 