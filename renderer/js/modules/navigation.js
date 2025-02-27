/**
 * Navigation Module
 * Handles sidebar navigation and section switching
 */

// Initialize navigation
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const contentSections = document.querySelectorAll('.content-section');

    // Add click event listeners to navigation items
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get the section id from the data attribute
            const sectionId = this.getAttribute('data-section');
            
            // Remove active class from all nav items
            navItems.forEach(navItem => {
                navItem.classList.remove('active');
            });
            
            // Add active class to clicked nav item
            this.classList.add('active');
            
            // Hide all content sections
            contentSections.forEach(section => {
                section.classList.remove('active');
            });
            
            // Show the selected content section
            document.getElementById(sectionId).classList.add('active');
            
            // Load section-specific content if needed
            if (sectionId === 'dashboard') {
                window.dashboardModule.loadDashboardData();
            } else if (sectionId === 'tournaments') {
                window.tournamentsModule.loadTournaments();
            } else if (sectionId === 'players') {
                window.playersModule.loadPlayers();
            } else if (sectionId === 'games') {
                window.gamesModule.loadGames();
            }
        });
    });
}

// Export module
window.navigationModule = {
    initNavigation
}; 