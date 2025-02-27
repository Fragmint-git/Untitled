/**
 * Admin Navigation Module
 * Handles navigation between different sections in the admin panel
 */

// Admin Navigation Module
window.adminNavigationModule = {
    // Initialize navigation
    init: function() {
        console.log('Initializing admin navigation...');
        
        // Set up navigation
        this.setupNavigation();
        
        // Check if there's a stored active section and navigate to it
        const storedSection = localStorage.getItem('adminActiveSection');
        if (storedSection) {
            this.navigateToSection(storedSection);
        } else {
            // Check if there's a hash in the URL to navigate to a specific section
            const hash = window.location.hash.substring(1);
            if (hash) {
                this.navigateToSection(hash);
            } else {
                // Default to dashboard
                this.navigateToSection('dashboard');
            }
        }
    },
    
    // Set up admin navigation
    setupNavigation: function() {
        // Admin menu links
        const adminMenuLinks = document.querySelectorAll('.admin-menu-link');
        
        // Add click event to each menu link
        adminMenuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Get section ID from data attribute
                const sectionId = link.getAttribute('data-section');
                if (sectionId) {
                    this.navigateToSection(sectionId);
                }
            });
        });
        
        // Back to application link
        const backToAppLink = document.querySelector('.back-to-app');
        if (backToAppLink) {
            backToAppLink.addEventListener('click', (e) => {
                e.preventDefault();
                // Confirm before leaving admin panel
                if (window.adminModule && window.adminModule.showConfirmModal) {
                    window.adminModule.showConfirmModal(
                        'Leave Admin Panel',
                        'Are you sure you want to return to the main application?',
                        () => {
                            window.location.href = '../index.html';
                        }
                    );
                } else {
                    window.location.href = '../index.html';
                }
            });
        }
    },
    
    // Navigate to a specific section
    navigateToSection: function(sectionId) {
        console.log(`Navigating to admin section: ${sectionId}`);
        
        // Hide all sections
        const sections = document.querySelectorAll('.admin-section');
        sections.forEach(section => {
            section.style.display = 'none';
        });
        
        // Show the selected section
        const selectedSection = document.getElementById(`admin-${sectionId}`);
        if (selectedSection) {
            selectedSection.style.display = 'block';
        } else {
            console.warn(`Section with ID "admin-${sectionId}" not found`);
            return;
        }
        
        // Update active menu item
        const menuLinks = document.querySelectorAll('.admin-menu-link');
        menuLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === sectionId) {
                link.classList.add('active');
            }
        });
        
        // Initialize the section if it hasn't been initialized yet
        this.initializeSection(sectionId);
        
        // Update URL hash for bookmarking
        window.location.hash = sectionId;
        
        // Store the active section in localStorage
        localStorage.setItem('adminActiveSection', sectionId);
    },
    
    // Initialize a specific section
    initializeSection: function(sectionId) {
        switch (sectionId) {
            case 'dashboard':
                if (window.adminDashboardModule) {
                    window.adminDashboardModule.initDashboard();
                } else {
                    console.error('Admin dashboard module not found');
                }
                break;
            case 'games':
                if (window.adminGamesTabModule) {
                    window.adminGamesTabModule.initGamesTab();
                } else {
                    console.error('Admin games module not found');
                }
                break;
            case 'tournaments':
                if (window.adminTournamentsTabModule) {
                    window.adminTournamentsTabModule.initTournamentsTab();
                } else {
                    console.error('Admin tournaments module not found');
                }
                break;
            case 'players':
                if (window.adminPlayersTabModule) {
                    window.adminPlayersTabModule.initPlayersTab();
                } else {
                    console.error('Admin players module not found');
                }
                break;
            case 'settings':
                if (window.adminSettingsTabModule) {
                    window.adminSettingsTabModule.initSettingsTab();
                } else {
                    console.error('Admin settings module not found');
                }
                break;
            default:
                console.warn(`Unknown section: ${sectionId}`);
        }
    }
}; 