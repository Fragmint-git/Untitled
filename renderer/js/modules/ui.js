/**
 * UI Module
 * Handles UI-related functionality like notifications and theme switching
 */

// Initialize UI components
function initUI() {
    // Initialize dark mode toggle
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        // Load saved preference
        const savedTheme = localStorage.getItem('theme');
        const savedDarkMode = localStorage.getItem('darkMode');

        let isDarkMode = true;

        if (savedTheme) {
            isDarkMode = savedTheme === 'dark';
        } else if (savedDarkMode) {
            isDarkMode = savedDarkMode === 'enabled';
        }

        // Apply theme immediately based on saved preference
        applyTheme(isDarkMode);
        darkModeToggle.checked = isDarkMode;

        darkModeToggle.addEventListener('change', function () {
            // When checked, apply dark mode (remove light-mode class)
            // When unchecked, apply light mode (add light-mode class)
            const isDarkMode = this.checked;
            applyTheme(isDarkMode);

            // Save preference to localStorage
            localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
            localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');

            // Show notification
            showNotification(`${isDarkMode ? 'Dark' : 'Light'} mode enabled`, 'info');
        });
    }

    // Initialize notifications toggle
    const notificationsToggle = document.getElementById('notifications-toggle');
    if (notificationsToggle) {
        notificationsToggle.addEventListener('change', function () {
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
/*function applyTheme(isDarkMode) {
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
    } else {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
    }
    
    // Save theme preference
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}*/

function applyTheme(isDarkMode) {
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
    } else {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
    }

    document.querySelectorAll('select, option').forEach(el => {
        if (isDarkMode) {
            el.style.backgroundColor = '#2c2c3c';
            el.style.color = '#fff';
            el.style.border = '1px solid #555';
        } else {
            el.style.backgroundColor = '';
            el.style.color = '';
            el.style.border = '';
        }
    });

    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}


// Show notification toast
function showNotification(message, type = 'info') {
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