/**
 * Profile Module
 * Handles user profile functionality and navigation
 */

// Profile Module
window.profileModule = {
    // Initialize profile
    initProfile: function() {
        console.log('Initializing profile module');
        
        // Initialize profile menu navigation
        this.initProfileMenu();
        
        // Initialize profile picture change functionality
        this.initProfilePicture();
        
        // Load user profile data
        this.loadUserProfile();
        
        // Add click event to "Edit Profile" button in settings
        const editProfileBtn = document.querySelector('.settings-card .btn-secondary');
        if (editProfileBtn && editProfileBtn.textContent === 'Edit Profile') {
            editProfileBtn.addEventListener('click', function(e) {
                e.preventDefault();
                window.navigationModule.navigateTo('profile');
            });
        }
    },
    
    // Initialize profile menu navigation
    initProfileMenu: function() {
        const profileMenuLinks = document.querySelectorAll('.profile-menu a');
        const profileSections = document.querySelectorAll('.profile-section');
        
        profileMenuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active class from all links and sections
                profileMenuLinks.forEach(item => item.classList.remove('active'));
                profileSections.forEach(section => section.classList.remove('active'));
                
                // Add active class to clicked link
                link.classList.add('active');
                
                // Show corresponding section
                const targetSectionId = link.getAttribute('data-profile-section');
                const targetSection = document.getElementById(targetSectionId);
                if (targetSection) {
                    targetSection.classList.add('active');
                    console.log(`Showing profile section: ${targetSectionId}`);
                } else {
                    console.error(`Profile section with ID "${targetSectionId}" not found`);
                }
                
                // Store the active tab in localStorage for persistence
                localStorage.setItem('activeProfileTab', targetSectionId);
            });
        });
        
        // Check if there's a stored active tab and activate it
        const activeTab = localStorage.getItem('activeProfileTab');
        if (activeTab) {
            const activeLink = document.querySelector(`.profile-menu a[data-profile-section="${activeTab}"]`);
            if (activeLink) {
                // Simulate a click on the stored active tab
                activeLink.click();
            }
        }
    },
    
    // Initialize profile picture change functionality
    initProfilePicture: function() {
        const profilePicture = document.getElementById('profile-picture');
        const changePictureBtn = document.getElementById('change-picture-btn');
        
        if (changePictureBtn && profilePicture) {
            changePictureBtn.addEventListener('click', () => {
                // Create a file input element
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = 'image/*';
                fileInput.style.display = 'none';
                
                fileInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            // Update profile picture
                            profilePicture.src = e.target.result;
                            
                            // Also update the profile image in the header
                            const headerProfileImage = document.querySelector('.profile-image');
                            if (headerProfileImage) {
                                headerProfileImage.src = e.target.result;
                            }
                            
                            // Save to localStorage
                            this.saveProfilePicture(e.target.result);
                            
                            // Show notification
                            if (window.uiModule && typeof window.uiModule.showNotification === 'function') {
                                window.uiModule.showNotification('Profile picture updated successfully', 'success');
                            } else {
                                console.log('Profile picture updated successfully');
                            }
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
        } else {
            console.warn('Profile picture elements not found');
        }
    },
    
    // Load user profile data
    loadUserProfile: function() {
        console.log('Loading user profile data');
        
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
                theme: 'dark',
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
        
        // Load profile picture if available
        if (userData.profilePicture) {
            const profilePicture = document.getElementById('profile-picture');
            const headerProfileImage = document.querySelector('.profile-image');
            
            if (profilePicture) {
                profilePicture.src = userData.profilePicture;
            }
            
            if (headerProfileImage) {
                headerProfileImage.src = userData.profilePicture;
            }
        }
        
        // Dispatch events to load data in each section
        window.dispatchEvent(new CustomEvent('profile:load-personal-info', { detail: userData.personalInfo }));
        window.dispatchEvent(new CustomEvent('profile:load-account-settings', { detail: userData.accountSettings }));
        window.dispatchEvent(new CustomEvent('profile:load-notification-settings', { detail: userData.notificationSettings }));
        window.dispatchEvent(new CustomEvent('profile:load-appearance-settings', { detail: userData.appearanceSettings }));
        window.dispatchEvent(new CustomEvent('profile:load-privacy-settings', { detail: userData.privacySettings }));
    },
    
    // Save profile picture
    saveProfilePicture: function(dataUrl) {
        // Get current user data
        const savedUserData = localStorage.getItem('userData');
        const userData = savedUserData ? JSON.parse(savedUserData) : {};
        
        // Update profile picture
        userData.profilePicture = dataUrl;
        
        // Save to localStorage
        localStorage.setItem('userData', JSON.stringify(userData));
    }
}; 