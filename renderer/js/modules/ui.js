/**
 * UI Module
 * Handles common UI functionality like notifications and theme switching
 */

// Initialize UI components
function initUI() {
    // Initialize dark mode toggle
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', function() {
            // When checked, apply dark mode (remove light-mode class)
            // When unchecked, apply light mode (add light-mode class)
            const isDarkMode = this.checked;
            applyTheme(isDarkMode);
            
            // Save preference to localStorage
            localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
            
            // Show notification
            showNotification(`${isDarkMode ? 'Dark' : 'Light'} mode enabled`, 'info');
        });
        
        // Load saved preference
        const savedDarkMode = localStorage.getItem('darkMode');
        if (savedDarkMode !== null) {
            const isDarkMode = savedDarkMode === 'enabled';
            darkModeToggle.checked = isDarkMode;
            applyTheme(isDarkMode);
        } else {
            // Default to dark mode if no preference is saved
            darkModeToggle.checked = true;
            applyTheme(true);
        }
    }
    
    // Initialize notifications toggle
    const notificationsToggle = document.getElementById('notifications-toggle');
    if (notificationsToggle) {
        notificationsToggle.addEventListener('change', function() {
            const notificationsEnabled = this.checked;
            
            // Save preference to localStorage
            localStorage.setItem('notifications', notificationsEnabled ? 'enabled' : 'disabled');
            
            // Show notification if notifications are enabled
            if (notificationsEnabled) {
                showNotification('Notifications enabled', 'info');
            }
        });
        
        // Load saved preference
        const savedNotifications = localStorage.getItem('notifications');
        if (savedNotifications !== null) {
            notificationsToggle.checked = savedNotifications === 'enabled';
        }
    }
}

// Apply theme based on dark mode preference
function applyTheme(isDarkMode) {
    if (isDarkMode) {
        // Dark mode - remove light-mode class if it exists
        document.body.classList.remove('light-mode');
    } else {
        // Light mode - add light-mode class
        document.body.classList.add('light-mode');
    }
}

// Show notification toast
function showNotification(message, type = 'info') {
    const toast = document.getElementById('notification-toast');
    const messageElement = document.getElementById('notification-message');
    
    if (!toast || !messageElement) {
        console.error('Notification elements not found');
        return;
    }
    
    messageElement.textContent = message;
    toast.className = `notification-toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

// Format time
function formatTime(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Truncate text
function truncateText(text, maxLength = 100) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    
    return text.substring(0, maxLength) + '...';
}

// Export module
window.uiModule = {
    initUI,
    showNotification,
    formatDate,
    formatTime,
    truncateText,
    applyTheme
}; 