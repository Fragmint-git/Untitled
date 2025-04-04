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

    const formData = new FormData(e.target);

    const personalInfo = {
        username: formData.get('username'),
        ign: formData.get('ign'),
        email: formData.get('email')
    };
    savePersonalInfo(personalInfo);
}


// Handle loading personal information
function handleLoadPersonalInfo(e) {
    const personalInfo = e.detail;

    const usernameField = document.getElementById('username');
    const ignField = document.getElementById('ign');
    const emailField = document.getElementById('email');

    if (usernameField) usernameField.value = personalInfo.username || '';
    if (ignField) ignField.value = personalInfo.ign || '';
    if (emailField) emailField.value = personalInfo.email || '';
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