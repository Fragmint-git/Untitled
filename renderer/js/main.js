/**
 * Main Application Entry Point
 * Initializes all modules and starts the application
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Initializing application...');
    
    // Set app version and product name from package.json
    try {
        const appInfo = window.api.getAppInfo();
        const versionElement = document.getElementById('app-version');
        const productNameElement = document.getElementById('app-product-name');
        
        if (versionElement) {
            versionElement.textContent = appInfo.version;
        }
        
        if (productNameElement) {
            productNameElement.textContent = appInfo.productName;
        }
        
        // Set the app version in the title bar as well
        const titlebarTitle = document.querySelector('.titlebar-title span');
        if (titlebarTitle) {
            titlebarTitle.textContent = appInfo.productName;
        }
    } catch (error) {
        console.error('Failed to load app information:', error);
    }
    
    // Initialize UI module
    if (window.uiModule) {
        window.uiModule.initUI();
    }
    
    // Initialize navigation
    if (window.navigationModule) {
        window.navigationModule.initNavigation();
    }
    
    // Initialize dashboard
    if (window.dashboardModule) {
        window.dashboardModule.loadDashboardData();
    }
    
    // Initialize store module
    if (window.storeModule) {
        window.storeModule.initStore();
    }
    
    // Initialize profile module
    if (window.profileModule) {
        window.profileModule.initProfile();
    }
    
    // Initialize matchfinder UI
    if (window.matchfinderUIModule) {
        window.matchfinderUIModule.initMatchfinderUI();
    }
    
    // Initialize quit button
    /*const quitButton = document.getElementById('quit-button');
    if (quitButton) {
        quitButton.addEventListener('click', async () => {
            // Show confirmation dialog
            const confirmed = window.confirm('Are you sure you want to quit the application?');
            if (confirmed) {
                try {
                    await window.api.quitApp();
                } catch (error) {
                    console.error('Error quitting application:', error);
                    window.uiModule.showNotification('Failed to quit application', 'error');
                }
            }
        });
    }*/

        /*const quitButton = document.getElementById('quit-button');
        if (quitButton) {
            quitButton.addEventListener('click', () => {
                const confirmed = window.confirm('Logout and return to login screen?');
                if (confirmed) {
                    localStorage.removeItem('userSession');
                    window.location.href = 'login.html';
                }
            });
        }*/
            const quitButton = document.getElementById('quit-button');
            if (quitButton) {
              quitButton.addEventListener('click', async () => {
                const confirmed = window.confirm('Logout and return to login screen?');
                if (!confirmed) return;
            
                try {
                  const session = await window.api.getSession();
                  const domainKey = window.env?.lootlockerDomainKey;
            
                  if (session?.lootlocker_token && domainKey) {
                    await fetch('https://api.lootlocker.io/white-label-login/logout', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'is-development': 'true',
                        'domain-key': process.env.LOOTLOCKER_DOMAIN_KEY,
                        'authorization': `Bearer ${session.lootlocker_token}`
                      }
                    });
                  }
                } catch (err) {
                  console.warn('Failed to logout from LootLocker:', err);
                }
            
                await window.api.clearSession();
                window.location.href = 'login.html';
              });
            }
            


    
    // Show welcome notification
    if (window.uiModule) {
        window.uiModule.showNotification('Welcome to VR Tournament', 'info');
    }
    
    console.log('Application initialized successfully');
}); 