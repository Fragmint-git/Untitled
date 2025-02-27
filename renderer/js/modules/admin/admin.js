/**
 * Admin Module
 * Main module for the admin panel functionality
 */

// Admin Module
window.adminModule = {
    // Initialize admin panel
    init: function() {
        console.log('Initializing admin panel...');
        
        // Load tab modules
        this.loadModules();
        
        // Set up logout button
        this.setupLogout();
    },
    
    // Load all admin tab modules
    loadModules: async function() {
        try {
            // Load navigation module first
            await this.loadScript('../js/modules/admin/navigation.js');
            
            // Load dashboard module
            await this.loadScript('../js/modules/admin/tabs/dashboard.js');
            
            // Load games module
            await this.loadScript('../js/modules/admin/tabs/games.js');
            
            // Load tournaments module
            await this.loadScript('../js/modules/admin/tabs/tournaments.js');
            
            // Load players module
            await this.loadScript('../js/modules/admin/tabs/players.js');
            
            // Load settings module
            await this.loadScript('../js/modules/admin/tabs/settings.js');
            
            // Initialize navigation
            if (window.adminNavigationModule) {
                window.adminNavigationModule.init();
            } else {
                console.error('Admin navigation module not found');
            }
            
            console.log('All admin modules loaded successfully');
        } catch (error) {
            console.error('Error loading admin modules:', error);
            this.showMessage('Error loading admin modules. Please refresh the page.', 'error');
        }
    },
    
    // Load a script dynamically
    loadScript: function(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve();
            script.onerror = (error) => reject(new Error(`Failed to load script: ${src}`));
            document.head.appendChild(script);
        });
    },
    
    // Set up logout button
    setupLogout: function() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showConfirmModal(
                    'Confirm Logout',
                    'Are you sure you want to logout?',
                    () => {
                        // Redirect to login page
                        window.location.href = 'login.html';
                    }
                );
            });
        }
    },
    
    // Show confirmation modal
    showConfirmModal: function(title, message, confirmCallback) {
        const modal = document.getElementById('confirm-modal');
        const modalTitle = document.getElementById('confirm-modal-title');
        const modalMessage = document.getElementById('confirm-modal-message');
        const confirmBtn = document.getElementById('confirm-btn');
        const cancelBtn = document.getElementById('cancel-btn');
        const closeBtn = modal.querySelector('.close-modal');
        
        if (modal && modalTitle && modalMessage && confirmBtn) {
            // Set modal content
            modalTitle.textContent = title;
            modalMessage.textContent = message;
            
            // Show modal
            modal.style.display = 'block';
            
            // Remove existing event listeners by cloning and replacing buttons
            if (confirmBtn) {
                const newConfirmBtn = confirmBtn.cloneNode(true);
                confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
                
                // Add new event listener
                newConfirmBtn.addEventListener('click', () => {
                    modal.style.display = 'none';
                    if (typeof confirmCallback === 'function') {
                        confirmCallback();
                    }
                });
            }
            
            // Close button (X)
            if (closeBtn) {
                const newCloseBtn = closeBtn.cloneNode(true);
                closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
                
                newCloseBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    modal.style.display = 'none';
                });
            }
            
            // Cancel button (No)
            if (cancelBtn) {
                const newCancelBtn = cancelBtn.cloneNode(true);
                cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
                
                newCancelBtn.addEventListener('click', () => {
                    modal.style.display = 'none';
                });
            }
            
            // Close modal when clicking outside
            window.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }
    },
    
    // Show message (toast notification)
    showMessage: function(message, type = 'info') {
        // Create toast container if it doesn't exist
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            document.body.appendChild(toastContainer);
        }
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        // Add toast to container
        toastContainer.appendChild(toast);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => {
                toastContainer.removeChild(toast);
            }, 500);
        }, 3000);
    }
};

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (window.adminModule) {
        window.adminModule.init();
    }
}); 