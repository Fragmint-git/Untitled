/**
 * Admin Settings Tab Module
 * Handles the admin settings functionality in the admin panel
 */

// Admin Settings Tab Module
window.adminSettingsTabModule = {
    // Initialize settings tab
    initSettingsTab: function() {
        console.log('Initializing settings tab...');
        
        // Settings form
        const settingsForm = document.getElementById('admin-settings-form');
        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveSettings();
            });
        }
        
        // Reset settings button
        const resetSettingsBtn = document.getElementById('reset-settings-btn');
        if (resetSettingsBtn) {
            resetSettingsBtn.addEventListener('click', () => {
                if (window.adminModule) {
                    window.adminModule.showConfirmModal(
                        'Reset Settings',
                        'Are you sure you want to reset all settings to default values?',
                        () => {
                            this.resetSettings();
                        }
                    );
                }
            });
        }
        
        // Load settings initially
        this.loadSettings();
    },
    
    // Load settings
    loadSettings: async function() {
        try {
            console.log('Attempting to load admin settings...');
            
            // Fetch settings from the backend
            const response = await fetch('http://localhost:3000/api/admin/settings', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Admin settings API response status:', response.status);
            
            // If the API endpoint doesn't exist yet, use mock data
            let settings;
            if (response.ok) {
                try {
                    settings = await response.json();
                    console.log('Successfully loaded settings from API');
                } catch (parseError) {
                    console.error('Error parsing settings JSON:', parseError);
                    settings = this.getMockSettings();
                    console.log('Using mock settings due to JSON parse error');
                }
            } else {
                console.warn(`API returned status ${response.status}, using mock data`);
                // Mock data for development
                settings = this.getMockSettings();
            }
            
            // Populate form with settings
            if (settings) {
                try {
                    // Helper function to safely set form element values
                    const setElementValue = (id, value) => {
                        const element = document.getElementById(id);
                        if (element) {
                            if (element.type === 'checkbox') {
                                element.checked = value;
                            } else {
                                element.value = value;
                            }
                        } else {
                            console.warn(`Element with ID "${id}" not found`);
                        }
                    };
                    
                    // General settings
                    setElementValue('site-name', settings.general.siteName);
                    setElementValue('site-description', settings.general.siteDescription);
                    setElementValue('maintenance-mode', settings.general.maintenanceMode);
                    
                    // Email settings
                    setElementValue('email-notifications', settings.email.enableNotifications);
                    setElementValue('email-from', settings.email.fromEmail);
                    setElementValue('email-smtp-host', settings.email.smtpHost);
                    setElementValue('email-smtp-port', settings.email.smtpPort);
                    setElementValue('email-smtp-user', settings.email.smtpUser);
                    
                    // Tournament settings
                    setElementValue('max-tournaments', settings.tournaments.maxActive);
                    setElementValue('tournament-approval', settings.tournaments.requireApproval);
                    setElementValue('tournament-registration-days', settings.tournaments.registrationDays);
                    
                    // Security settings
                    setElementValue('two-factor-auth', settings.security.twoFactorAuth);
                    setElementValue('session-timeout', settings.security.sessionTimeout);
                    setElementValue('max-login-attempts', settings.security.maxLoginAttempts);
                    
                    console.log('Settings form populated successfully');
                } catch (formError) {
                    console.error('Error populating form with settings:', formError);
                    throw new Error('Failed to populate form fields: ' + formError.message);
                }
            } else {
                throw new Error('No settings data available');
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            
            // Try to use mock data as a fallback
            try {
                console.log('Attempting to use mock data as fallback...');
                const mockSettings = this.getMockSettings();
                
                // Helper function to safely set form element values
                const setElementValue = (id, value) => {
                    const element = document.getElementById(id);
                    if (element) {
                        if (element.type === 'checkbox') {
                            element.checked = value;
                        } else {
                            element.value = value;
                        }
                    } else {
                        console.warn(`Element with ID "${id}" not found in fallback`);
                    }
                };
                
                // General settings
                setElementValue('site-name', mockSettings.general.siteName);
                setElementValue('site-description', mockSettings.general.siteDescription);
                setElementValue('maintenance-mode', mockSettings.general.maintenanceMode);
                
                // Email settings
                setElementValue('email-notifications', mockSettings.email.enableNotifications);
                setElementValue('email-from', mockSettings.email.fromEmail);
                setElementValue('email-smtp-host', mockSettings.email.smtpHost);
                setElementValue('email-smtp-port', mockSettings.email.smtpPort);
                setElementValue('email-smtp-user', mockSettings.email.smtpUser);
                
                // Tournament settings
                setElementValue('max-tournaments', mockSettings.tournaments.maxActive);
                setElementValue('tournament-approval', mockSettings.tournaments.requireApproval);
                setElementValue('tournament-registration-days', mockSettings.tournaments.registrationDays);
                
                // Security settings
                setElementValue('two-factor-auth', mockSettings.security.twoFactorAuth);
                setElementValue('session-timeout', mockSettings.security.sessionTimeout);
                setElementValue('max-login-attempts', mockSettings.security.maxLoginAttempts);
                
                console.log('Successfully used mock data as fallback');
            } catch (fallbackError) {
                console.error('Even fallback to mock data failed:', fallbackError);
                if (window.adminModule) {
                    window.adminModule.showMessage('Error loading settings. Please try again.', 'error');
                }
            }
        }
    },
    
    // Save settings
    saveSettings: async function() {
        try {
            // Helper function to safely get form element values
            const getElementValue = (id, defaultValue = '') => {
                const element = document.getElementById(id);
                if (element) {
                    if (element.type === 'checkbox') {
                        return element.checked;
                    } else {
                        return element.value;
                    }
                } else {
                    console.warn(`Element with ID "${id}" not found when saving`);
                    return defaultValue;
                }
            };
            
            // Get form data
            const settings = {
                general: {
                    siteName: getElementValue('site-name', 'VR Battle Royale'),
                    siteDescription: getElementValue('site-description', 'VR Gaming Tournament Platform'),
                    maintenanceMode: getElementValue('maintenance-mode', false)
                },
                email: {
                    enableNotifications: getElementValue('email-notifications', false),
                    fromEmail: getElementValue('email-from', 'noreply@vrbattleroyale.com'),
                    smtpHost: getElementValue('email-smtp-host', ''),
                    smtpPort: getElementValue('email-smtp-port', '587'),
                    smtpUser: getElementValue('email-smtp-user', ''),
                    smtpPassword: getElementValue('email-smtp-password', '')
                },
                tournaments: {
                    maxActive: parseInt(getElementValue('max-tournaments', '5')),
                    requireApproval: getElementValue('tournament-approval', true),
                    registrationDays: parseInt(getElementValue('tournament-registration-days', '5'))
                },
                security: {
                    twoFactorAuth: getElementValue('two-factor-auth', false),
                    sessionTimeout: parseInt(getElementValue('session-timeout', '30')),
                    maxLoginAttempts: parseInt(getElementValue('max-login-attempts', '3'))
                }
            };
            
            // Send settings to the backend
            const response = await fetch('http://localhost:3000/api/admin/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('Settings saved:', result);
                
                // Show success message
                if (window.adminModule) {
                    window.adminModule.showMessage('Settings saved successfully!', 'success');
                }
            } else {
                throw new Error('Failed to save settings');
            }
            
        } catch (error) {
            console.error('Error saving settings:', error);
            if (window.adminModule) {
                window.adminModule.showMessage('Error saving settings. Please try again.', 'error');
            }
        }
    },
    
    // Reset settings
    resetSettings: function() {
        try {
            // Get default settings
            const defaultSettings = this.getDefaultSettings();
            
            // Helper function to safely set form element values
            const setElementValue = (id, value) => {
                const element = document.getElementById(id);
                if (element) {
                    if (element.type === 'checkbox') {
                        element.checked = value;
                    } else {
                        element.value = value;
                    }
                } else {
                    console.warn(`Element with ID "${id}" not found when resetting`);
                }
            };
            
            // Populate form with default settings
            if (defaultSettings) {
                // General settings
                setElementValue('site-name', defaultSettings.general.siteName);
                setElementValue('site-description', defaultSettings.general.siteDescription);
                setElementValue('maintenance-mode', defaultSettings.general.maintenanceMode);
                
                // Email settings
                setElementValue('email-notifications', defaultSettings.email.enableNotifications);
                setElementValue('email-from', defaultSettings.email.fromEmail);
                setElementValue('email-smtp-host', defaultSettings.email.smtpHost);
                setElementValue('email-smtp-port', defaultSettings.email.smtpPort);
                setElementValue('email-smtp-user', defaultSettings.email.smtpUser);
                setElementValue('email-smtp-password', '');
                
                // Tournament settings
                setElementValue('max-tournaments', defaultSettings.tournaments.maxActive);
                setElementValue('tournament-approval', defaultSettings.tournaments.requireApproval);
                setElementValue('tournament-registration-days', defaultSettings.tournaments.registrationDays);
                
                // Security settings
                setElementValue('two-factor-auth', defaultSettings.security.twoFactorAuth);
                setElementValue('session-timeout', defaultSettings.security.sessionTimeout);
                setElementValue('max-login-attempts', defaultSettings.security.maxLoginAttempts);
            }
            
            // Show success message
            if (window.adminModule) {
                window.adminModule.showMessage('Settings reset to default values.', 'success');
            }
            
        } catch (error) {
            console.error('Error resetting settings:', error);
            if (window.adminModule) {
                window.adminModule.showMessage('Error resetting settings. Please try again.', 'error');
            }
        }
    },
    
    // Get mock settings data
    getMockSettings: function() {
        return {
            general: {
                siteName: 'VR Battle Royale',
                siteDescription: 'The ultimate platform for VR gaming tournaments',
                maintenanceMode: false
            },
            email: {
                enableNotifications: true,
                fromEmail: 'notifications@vrbattleroyale.com',
                smtpHost: 'smtp.example.com',
                smtpPort: '587',
                smtpUser: 'smtp_user'
            },
            tournaments: {
                maxActive: 10,
                requireApproval: true,
                registrationDays: 7
            },
            security: {
                twoFactorAuth: false,
                sessionTimeout: 60,
                maxLoginAttempts: 5
            }
        };
    },
    
    // Get default settings
    getDefaultSettings: function() {
        return {
            general: {
                siteName: 'VR Battle Royale',
                siteDescription: 'VR Gaming Tournament Platform',
                maintenanceMode: false
            },
            email: {
                enableNotifications: false,
                fromEmail: 'noreply@vrbattleroyale.com',
                smtpHost: '',
                smtpPort: '587',
                smtpUser: ''
            },
            tournaments: {
                maxActive: 5,
                requireApproval: true,
                registrationDays: 5
            },
            security: {
                twoFactorAuth: false,
                sessionTimeout: 30,
                maxLoginAttempts: 3
            }
        };
    }
}; 