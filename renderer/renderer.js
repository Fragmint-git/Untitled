// UI Module
window.uiModule = {
    // ... existing UI module code ...
    
    // Show notification
    showNotification: function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="close-notification">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // Add event listener to close button
        notification.querySelector('.close-notification').addEventListener('click', () => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        });
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.classList.add('fade-out');
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    },
    
    // Apply theme
    applyTheme: function(isDarkMode) {
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            document.body.classList.remove('light-mode');
        } else {
            document.body.classList.add('light-mode');
            document.body.classList.remove('dark-mode');
        }
        
        // Save theme preference
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // ... existing initialization code ...
    
    // Initialize profile module
    if (window.profileModule) {
        window.profileModule.initProfile();
    } else {
        console.error('Profile module not loaded');
        
        // Import profile module dynamically
        import('./js/modules/profile/profile.js')
            .then(() => {
                if (window.profileModule) {
                    window.profileModule.initProfile();
                }
            })
            .catch(err => {
                console.error('Failed to load profile module:', err);
            });
    }
    
    // ... existing initialization code ...
}); 