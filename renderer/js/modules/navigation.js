/**
 * Navigation Module
 * Handles navigation between different sections of the application
 */

// Navigation Module
window.navigationModule = {
    // Initialize navigation
    initNavigation: function() {
        // Add event listeners to sidebar navigation items
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', function() {
                const targetSection = this.getAttribute('data-section');
                window.navigationModule.navigateTo(targetSection);
            });
        });
        
        // Add event listener to user profile button
        const userProfileButton = document.getElementById('user-profile-button');
        if (userProfileButton) {
            userProfileButton.addEventListener('click', function() {
                window.navigationModule.navigateTo('profile');
            });
        }
        
        // Check if there's a hash in the URL to navigate to a specific section on load
        if (window.location.hash) {
            const sectionId = window.location.hash.substring(1);
            this.navigateTo(sectionId);
        }
    },
    
    // Navigate to a specific section
    navigateTo: function(sectionId) {
        console.log(`Navigating to section: ${sectionId}`);
        
        // Hide all sections
        const contentSections = document.querySelectorAll('.content-section');
        contentSections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            
            // Load section data if needed
            this.loadSectionData(sectionId);
        } else {
            console.error(`Section with ID "${sectionId}" not found`);
        }
        
        // Update active state in sidebar
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            if (item.getAttribute('data-section') === sectionId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // Update URL hash for bookmarking/sharing
        window.location.hash = sectionId;
    },
    
    // Load section-specific data
    loadSectionData: function(sectionId) {
        switch(sectionId) {
            case 'tournaments':
                if (window.tournamentsModule && typeof window.tournamentsModule.loadTournaments === 'function') {
                    window.tournamentsModule.loadTournaments();
                }
                break;
            case 'players':
                if (window.playersModule && typeof window.playersModule.loadPlayers === 'function') {
                    window.playersModule.loadPlayers();
                }
                break;
            case 'games':
                if (window.gamesModule && typeof window.gamesModule.loadGames === 'function') {
                    window.gamesModule.loadGames();
                }
                break;
            case 'profile':
                if (window.profileModule && typeof window.profileModule.loadUserProfile === 'function') {
                    window.profileModule.loadUserProfile();
                }
                break;
        }
    }
}; 