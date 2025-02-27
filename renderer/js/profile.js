// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    // Navigation elements
    const profileMenuLinks = document.querySelectorAll('.profile-menu a');
    const profileSections = document.querySelectorAll('.profile-section');
    
    // Form elements
    const personalInfoForm = document.getElementById('personal-info-form');
    const accountSettingsForm = document.getElementById('account-settings-form');
    const notificationSettingsForm = document.getElementById('notification-settings-form');
    const appearanceSettingsForm = document.getElementById('appearance-settings-form');
    const privacySettingsForm = document.getElementById('privacy-settings-form');
    
    // Profile picture elements
    const profilePicture = document.getElementById('profile-picture');
    const changePictureBtn = document.getElementById('change-picture-btn');
    
    // Font size range slider
    const fontSizeRange = document.getElementById('font-size');
    const fontSizeValue = document.getElementById('font-size-value');
    
    // Load user profile data from local storage or database
    loadUserProfile();
    
    // Tab navigation
    profileMenuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all links and sections
            profileMenuLinks.forEach(item => item.classList.remove('active'));
            profileSections.forEach(section => section.classList.remove('active'));
            
            // Add active class to clicked link
            link.classList.add('active');
            
            // Show corresponding section
            const targetSectionId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetSectionId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
    
    // Handle profile picture change
    changePictureBtn.addEventListener('click', () => {
        // In Electron, we'd use dialog API to select files
        // For now, simulate with a file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    profilePicture.src = e.target.result;
                    
                    // Save to local storage or send to backend
                    saveProfilePicture(e.target.result);
                };
                reader.readAsDataURL(file);
            }
        });
        
        document.body.appendChild(fileInput);
        fileInput.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(fileInput);
        }, 1000);
    });
    
    // Update font size display
    fontSizeRange.addEventListener('input', () => {
        const size = fontSizeRange.value;
        fontSizeValue.textContent = `${size}px`;
        
        // Preview font size
        document.documentElement.style.setProperty('--font-size', `${size}px`);
    });
    
    // Form submissions
    personalInfoForm.addEventListener('submit', handleFormSubmit);
    accountSettingsForm.addEventListener('submit', handleFormSubmit);
    notificationSettingsForm.addEventListener('submit', handleFormSubmit);
    appearanceSettingsForm.addEventListener('submit', handleFormSubmit);
    privacySettingsForm.addEventListener('submit', handleFormSubmit);
    
    // Reset buttons
    document.querySelectorAll('button[type="reset"]').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            loadUserProfile(); // Reload the current profile data
        });
    });
});

// Helper Functions

/**
 * Load user profile data from storage (localStorage in this example)
 * In a real app, this would likely come from a database via IPC
 */
function loadUserProfile() {
    // For this example, we'll use mock data
    // In a real application, this would come from backend/database
    const mockUserData = {
        personalInfo: {
            displayName: 'VRPlayer123',
            fullName: 'John Doe',
            email: 'johndoe@example.com',
            phone: '(555) 123-4567',
            bio: 'Enthusiastic VR player with 5 years of experience in competitive gaming.'
        },
        accountSettings: {
            language: 'en'
        },
        notificationSettings: {
            emailNotifications: true,
            tournamentUpdates: true,
            matchReminders: true,
            resultNotifications: true,
            desktopNotifications: true
        },
        appearanceSettings: {
            theme: 'light',
            fontSize: 16
        },
        privacySettings: {
            profileVisibility: true,
            showRealName: false,
            shareStatistics: true
        },
        profilePicture: null // Default is handled by HTML
    };
    
    // Get saved user data from localStorage, if any
    const savedUserData = localStorage.getItem('userData');
    const userData = savedUserData ? JSON.parse(savedUserData) : mockUserData;
    
    // Populate personal info form
    document.getElementById('display-name').value = userData.personalInfo.displayName || '';
    document.getElementById('full-name').value = userData.personalInfo.fullName || '';
    document.getElementById('email').value = userData.personalInfo.email || '';
    document.getElementById('phone').value = userData.personalInfo.phone || '';
    document.getElementById('bio').value = userData.personalInfo.bio || '';
    
    // Populate account settings
    document.getElementById('language-select').value = userData.accountSettings.language || 'en';
    
    // Populate notification settings
    document.getElementById('email-notifications').checked = userData.notificationSettings.emailNotifications;
    document.getElementById('tournament-updates').checked = userData.notificationSettings.tournamentUpdates;
    document.getElementById('match-reminders').checked = userData.notificationSettings.matchReminders;
    document.getElementById('result-notifications').checked = userData.notificationSettings.resultNotifications;
    document.getElementById('desktop-notifications').checked = userData.notificationSettings.desktopNotifications;
    
    // Populate appearance settings
    document.getElementById('theme-select').value = userData.appearanceSettings.theme || 'light';
    document.getElementById('font-size').value = userData.appearanceSettings.fontSize || 16;
    document.getElementById('font-size-value').textContent = `${userData.appearanceSettings.fontSize || 16}px`;
    
    // Populate privacy settings
    document.getElementById('profile-visibility').checked = userData.privacySettings.profileVisibility;
    document.getElementById('show-real-name').checked = userData.privacySettings.showRealName;
    document.getElementById('share-statistics').checked = userData.privacySettings.shareStatistics;
    
    // Set profile picture if available
    if (userData.profilePicture) {
        document.getElementById('profile-picture').src = userData.profilePicture;
    }
    
    // Apply theme if available
    applyTheme(userData.appearanceSettings.theme || 'light');
}

/**
 * Handle form submissions
 */
function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const formId = form.id;
    
    // Get current user data
    const savedUserData = localStorage.getItem('userData');
    const userData = savedUserData ? JSON.parse(savedUserData) : {};
    
    // Update the appropriate section based on form ID
    switch (formId) {
        case 'personal-info-form':
            userData.personalInfo = {
                displayName: formData.get('displayName'),
                fullName: formData.get('fullName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                bio: formData.get('bio')
            };
            break;
            
        case 'account-settings-form':
            // Password change would be handled separately with proper verification
            userData.accountSettings = {
                language: formData.get('language')
            };
            break;
            
        case 'notification-settings-form':
            userData.notificationSettings = {
                emailNotifications: formData.get('emailNotifications') === 'on',
                tournamentUpdates: formData.get('tournamentUpdates') === 'on',
                matchReminders: formData.get('matchReminders') === 'on',
                resultNotifications: formData.get('resultNotifications') === 'on',
                desktopNotifications: formData.get('desktopNotifications') === 'on'
            };
            break;
            
        case 'appearance-settings-form':
            userData.appearanceSettings = {
                theme: formData.get('theme'),
                fontSize: formData.get('fontSize')
            };
            // Apply theme immediately
            applyTheme(formData.get('theme'));
            break;
            
        case 'privacy-settings-form':
            userData.privacySettings = {
                profileVisibility: formData.get('profileVisibility') === 'on',
                showRealName: formData.get('showRealName') === 'on',
                shareStatistics: formData.get('shareStatistics') === 'on'
            };
            break;
    }
    
    // Save to localStorage (in a real app, this would be saved to a database)
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // Show success message
    showMessage('Settings saved successfully!', 'success');
}

/**
 * Save profile picture to storage
 */
function saveProfilePicture(dataUrl) {
    // Get current user data
    const savedUserData = localStorage.getItem('userData');
    const userData = savedUserData ? JSON.parse(savedUserData) : {};
    
    // Update profile picture
    userData.profilePicture = dataUrl;
    
    // Save to localStorage
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // Show success message
    showMessage('Profile picture updated!', 'success');
}

/**
 * Apply theme settings
 */
function applyTheme(theme) {
    // Remove any existing theme classes
    document.body.classList.remove('theme-light', 'theme-dark');
    
    // Apply selected theme
    if (theme === 'system') {
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('theme-dark');
        } else {
            document.body.classList.add('theme-light');
        }
    } else {
        document.body.classList.add(`theme-${theme}`);
    }
}

/**
 * Show a toast message
 */
function showMessage(message, type = 'info') {
    // Create toast element if it doesn't exist
    let toast = document.getElementById('toast-message');
    
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-message';
        document.body.appendChild(toast);
        
        // Add toast styles if they don't exist
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                #toast-message {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    padding: 12px 20px;
                    border-radius: 4px;
                    color: white;
                    font-size: 16px;
                    z-index: 1000;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                    opacity: 0;
                    transform: translateY(20px);
                }
                #toast-message.visible {
                    opacity: 1;
                    transform: translateY(0);
                }
                #toast-message.success {
                    background-color: #4CAF50;
                }
                #toast-message.error {
                    background-color: #F44336;
                }
                #toast-message.info {
                    background-color: #2196F3;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Set message and type
    toast.textContent = message;
    toast.className = type;
    
    // Show the toast
    setTimeout(() => {
        toast.classList.add('visible');
    }, 10);
    
    // Hide after delay
    setTimeout(() => {
        toast.classList.remove('visible');
    }, 3000);
} 