/**
 * Appearance Settings Module
 * Handles appearance settings section of the profile
 */

// Initialize appearance settings section
function initAppearanceSettings() {
    // Get form element
    const appearanceSettingsForm = document.getElementById('appearance-settings-form');
    
    // Add submit event listener
    if (appearanceSettingsForm) {
        appearanceSettingsForm.addEventListener('submit', handleAppearanceSettingsSubmit);
    }
    
    // Initialize font size slider
    initFontSizeSlider();
    
    // Listen for load event
    window.addEventListener('profile:load-appearance-settings', handleLoadAppearanceSettings);
}

// Initialize font size slider
function initFontSizeSlider() {
    const fontSizeRange = document.getElementById('font-size');
    const fontSizeValue = document.getElementById('font-size-value');
    
    if (fontSizeRange && fontSizeValue) {
        fontSizeRange.addEventListener('input', () => {
            const size = fontSizeRange.value;
            fontSizeValue.textContent = `${size}px`;
            
            // Preview font size
            document.documentElement.style.setProperty('--font-size', `${size}px`);
        });
    }
}

// Handle form submission
function handleAppearanceSettingsSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(e.target);
    const appearanceSettings = {
        theme: formData.get('theme'),
        fontSize: parseInt(formData.get('fontSize'))
    };
    
    // Apply theme
    window.uiModule.applyTheme(appearanceSettings.theme === 'dark');
    
    // Apply font size
    document.documentElement.style.setProperty('--font-size', `${appearanceSettings.fontSize}px`);
    
    // Save to localStorage
    saveAppearanceSettings(appearanceSettings);
    
    // Show notification
    window.uiModule.showNotification('Appearance settings saved successfully', 'success');
}

// Handle loading appearance settings
function handleLoadAppearanceSettings(e) {
    const appearanceSettings = e.detail;
    
    // Populate form fields
    const themeSelect = document.getElementById('theme-select');
    const fontSizeRange = document.getElementById('font-size');
    const fontSizeValue = document.getElementById('font-size-value');
    
    if (themeSelect) themeSelect.value = appearanceSettings.theme || 'dark';
    if (fontSizeRange) fontSizeRange.value = appearanceSettings.fontSize || 16;
    if (fontSizeValue) fontSizeValue.textContent = `${appearanceSettings.fontSize || 16}px`;
    
    // Apply font size
    document.documentElement.style.setProperty('--font-size', `${appearanceSettings.fontSize || 16}px`);
}

// Save appearance settings to localStorage
function saveAppearanceSettings(appearanceSettings) {
    // Get current user data
    const savedUserData = localStorage.getItem('userData');
    const userData = savedUserData ? JSON.parse(savedUserData) : {};
    
    // Update appearance settings
    userData.appearanceSettings = appearanceSettings;
    
    // Save to localStorage
    localStorage.setItem('userData', JSON.stringify(userData));
}

// Initialize module
initAppearanceSettings(); 