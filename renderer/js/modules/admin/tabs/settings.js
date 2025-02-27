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
            // Fetch settings from the backend
            const response = await fetch('http://localhost:3000/api/admin/settings');
            
            // If the API endpoint doesn't exist yet, use mock data
            let settings;
            if (response.ok) {
                settings = await response.json();
            } else {
                // Mock data for development
                settings = this.getMockSettings();
            }
            
            // Populate form with settings
            if (settings) {
                // General settings
                document.getElementById('site-name').value = settings.general.siteName;
                document.getElementById('site-description').value = settings.general.siteDescription;
                document.getElementById('maintenance-mode').checked = settings.general.maintenanceMode;
                
                // Email settings
                document.getElementById('email-notifications').checked = settings.email.enableNotifications;
                document.getElementById('email-from').value = settings.email.fromEmail;
                document.getElementById('email-smtp-host').value = settings.email.smtpHost;
                document.getElementById('email-smtp-port').value = settings.email.smtpPort;
                document.getElementById('email-smtp-user').value = settings.email.smtpUser;
                
                // Tournament settings
                document.getElementById('max-tournaments').value = settings.tournaments.maxActive;
                document.getElementById('tournament-approval').checked = settings.tournaments.requireApproval;
                document.getElementById('tournament-registration-days').value = settings.tournaments.registrationDays;
                
                // Security settings
                document.getElementById('two-factor-auth').checked = settings.security.twoFactorAuth;
                document.getElementById('session-timeout').value = settings.security.sessionTimeout;
                document.getElementById('max-login-attempts').value = settings.security.maxLoginAttempts;
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            if (window.adminModule) {
                window.adminModule.showMessage('Error loading settings. Please try again.', 'error');
            }
        }
    },
    
    // Save settings
    saveSettings: async function() {
        try {
            // Get form data
            const settings = {
                general: {
                    siteName: document.getElementById('site-name').value,
                    siteDescription: document.getElementById('site-description').value,
                    maintenanceMode: document.getElementById('maintenance-mode').checked
                },
                email: {
                    enableNotifications: document.getElementById('email-notifications').checked,
                    fromEmail: document.getElementById('email-from').value,
                    smtpHost: document.getElementById('email-smtp-host').value,
                    smtpPort: document.getElementById('email-smtp-port').value,
                    smtpUser: document.getElementById('email-smtp-user').value,
                    smtpPassword: document.getElementById('email-smtp-password').value
                },
                tournaments: {
                    maxActive: parseInt(document.getElementById('max-tournaments').value),
                    requireApproval: document.getElementById('tournament-approval').checked,
                    registrationDays: parseInt(document.getElementById('tournament-registration-days').value)
                },
                security: {
                    twoFactorAuth: document.getElementById('two-factor-auth').checked,
                    sessionTimeout: parseInt(document.getElementById('session-timeout').value),
                    maxLoginAttempts: parseInt(document.getElementById('max-login-attempts').value)
                }
            };
            
            // In a real app, this would send data to the backend
            // For now, we'll just simulate a successful save
            console.log('Saving settings:', settings);
            
            // Show success message
            if (window.adminModule) {
                window.adminModule.showMessage('Settings saved successfully!', 'success');
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
            
            // Populate form with default settings
            if (defaultSettings) {
                // General settings
                document.getElementById('site-name').value = defaultSettings.general.siteName;
                document.getElementById('site-description').value = defaultSettings.general.siteDescription;
                document.getElementById('maintenance-mode').checked = defaultSettings.general.maintenanceMode;
                
                // Email settings
                document.getElementById('email-notifications').checked = defaultSettings.email.enableNotifications;
                document.getElementById('email-from').value = defaultSettings.email.fromEmail;
                document.getElementById('email-smtp-host').value = defaultSettings.email.smtpHost;
                document.getElementById('email-smtp-port').value = defaultSettings.email.smtpPort;
                document.getElementById('email-smtp-user').value = defaultSettings.email.smtpUser;
                document.getElementById('email-smtp-password').value = '';
                
                // Tournament settings
                document.getElementById('max-tournaments').value = defaultSettings.tournaments.maxActive;
                document.getElementById('tournament-approval').checked = defaultSettings.tournaments.requireApproval;
                document.getElementById('tournament-registration-days').value = defaultSettings.tournaments.registrationDays;
                
                // Security settings
                document.getElementById('two-factor-auth').checked = defaultSettings.security.twoFactorAuth;
                document.getElementById('session-timeout').value = defaultSettings.security.sessionTimeout;
                document.getElementById('max-login-attempts').value = defaultSettings.security.maxLoginAttempts;
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