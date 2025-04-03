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
        username: formData.get('username'),
        displayName: formData.get('displayName'),
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        bio: formData.get('bio')
    };
    
    // Save to localStorage
    savePersonalInfo(personalInfo);
    
    // Show notification
    //window.uiModule.showNotification('Personal information saved successfully', 'success');
}

// Handle loading personal information
function handleLoadPersonalInfo(e) {
    const personalInfo = e.detail;
    
    // Populate form fields
    const userNameField = document.getElementById('username');
    const displayNameField = document.getElementById('display-name');
    const fullNameField = document.getElementById('full-name');
    const emailField = document.getElementById('email');
    const phoneField = document.getElementById('phone');
    const bioField = document.getElementById('bio');
    
    if (userNameField) userNameField.value = personalInfo.username || '';
    if (displayNameField) displayNameField.value = personalInfo.displayName || '';
    if (fullNameField) fullNameField.value = personalInfo.fullName || '';
    if (emailField) emailField.value = personalInfo.email || '';
    if (phoneField) phoneField.value = personalInfo.phone || '';
    if (bioField) bioField.value = personalInfo.bio || '';
}

// Save personal information to localStorage
async function savePersonalInfo(personalInfo) {
    try {
        const session = window.api.getSession();
        if (!session || !session.id) {
            console.error('No user session found');
            window.uiModule.showNotification('User session not found', 'error');
            return;
        }

        const dataToSend = {
            ...personalInfo,
            id: session.id
        };

        const result = await window.api.savePersonalInfo(dataToSend);

        if (result.success) {
            console.log('Personal info saved to DB:', result.data);
            window.uiModule.showNotification('Personal information saved successfully', 'success');
        } else {
            console.error('Failed to save:', result.error);
            window.uiModule.showNotification(result.error || 'Failed to save personal info', 'error');
        }
    } catch (error) {
        console.error('Error calling savePersonalInfo:', error);
        window.uiModule.showNotification('An unexpected error occurred', 'error');
    }
}


initPersonalInfo(); 