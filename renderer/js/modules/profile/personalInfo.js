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
        email: formData.get('email'),
        platform: formData.get('platform'),
        timezone: formData.get('timezone')
    };
    savePersonalInfo(personalInfo);
}


// Handle loading personal information
function handleLoadPersonalInfo(e) {
    const personalInfo = e.detail;

    const usernameField = document.getElementById('username');
    const ignField = document.getElementById('ign');
    const emailField = document.getElementById('email');
    const platformField = document.getElementById('platform');
    const timezoneField = document.getElementById('timezone');

    const fullNameField = document.getElementById('full-name');
    const displayNameField = document.getElementById('display-name');
    const profileImage = document.getElementById('profile-picture');
    const profileBanner = document.getElementById('profile-banner');
    const bioField = document.getElementById('bio');

    if (usernameField) usernameField.value = personalInfo.username || '';
    if (ignField) ignField.value = personalInfo.ign || '';
    if (emailField) emailField.value = personalInfo.email || '';
    if (platformField) platformField.value = personalInfo.platform || '';
    if (timezoneField) timezoneField.value = personalInfo.timezone || '';

    if (fullNameField) fullNameField.textContent = personalInfo.fullName || '';
    if (displayNameField) displayNameField.textContent = personalInfo.displayName || '';
    if (profileImage && personalInfo.avatar) profileImage.src = `assets/uploads/profile/${personalInfo.avatar}`;
    if (profileBanner && personalInfo.banner) profileBanner.style.backgroundImage = `url('assets/uploads/banner/${personalInfo.banner}')`;
    if (bioField) bioField.textContent = personalInfo.bio || '';
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


function loadTimezones() {
    const timezoneSelect = document.getElementById('timezone');
    if (!timezoneSelect) return;
  
    const timezones = Intl.supportedValuesOf("timeZone") || [];
  
    timezoneSelect.innerHTML = '<option value="">Select Timezone</option>';
    timezones.forEach(tz => {
      timezoneSelect.innerHTML += `<option value="${tz}">${tz}</option>`;
    });
  }
  
  window.addEventListener('DOMContentLoaded', loadTimezones);
  