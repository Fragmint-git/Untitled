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
    /*loadUserProfile: function() {
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
        let userData;
        try {
            const savedUserData = localStorage.getItem('userData');
            userData = savedUserData ? JSON.parse(savedUserData) : mockUserData;
            
            // Ensure all required sections exist
            userData.personalInfo = userData.personalInfo || mockUserData.personalInfo;
            userData.accountSettings = userData.accountSettings || mockUserData.accountSettings;
            userData.notificationSettings = userData.notificationSettings || mockUserData.notificationSettings;
            userData.appearanceSettings = userData.appearanceSettings || mockUserData.appearanceSettings;
            userData.privacySettings = userData.privacySettings || mockUserData.privacySettings;
        } catch (error) {
            console.error('Error loading user data from localStorage:', error);
            userData = mockUserData;
        }
        
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
    },*/

    loadUserProfile: async function () {
        console.log('Loading user profile data');
      
        const session = await window.api.getSession();
        //console.log('Session:', session);
      
        const userId = session?.id;
        if (!userId) {
          //console.error('No user session found');
          return;
        }
      
        const result = await window.api.getUserById(userId);
        //console.log('API result:', result);
      
        if (!result.success) {
          //console.error('Failed to load user:', result.message);
          return;
        }
      
        const user = result.user;
        //console.log('User from API:', user);
      
        const personalInfo = {
          username: user.username,
          ign: user.ign || '',
          displayName: user.displayName || '',
          fullName: user.fullName || '',
          email: user.email || '',
          phone: user.phone || '',
          bio: user.bio || '',
          avatar: user.avatar || '',
          banner: user.banner || '',
          platform: user.platform || '',
          timezone: user.timezone || ''
        };
      
        const accountSettings = {
          language: 'en',
          playerSessionId: user.player_session_id || '',
          walletId: user.wallet_id || '',
          isAdmin: user.is_admin || false
        };
      
        window.dispatchEvent(new CustomEvent('profile:load-personal-info', { detail: personalInfo }));
        window.dispatchEvent(new CustomEvent('profile:load-account-settings', { detail: accountSettings }));
        window.dispatchEvent(new CustomEvent('profile:load-appearance-settings', { detail: { theme: 'dark', fontSize: 16 } }));
        window.dispatchEvent(new CustomEvent('profile:load-notification-settings', { detail: { emailNotifications: true } }));
        window.dispatchEvent(new CustomEvent('profile:load-privacy-settings', { detail: { profileVisibility: true } }));
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