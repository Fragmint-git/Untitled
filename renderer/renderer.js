// We'll use the window.api object exposed by the preload script

// DOM Elements
const menuLinks = document.querySelectorAll('.menu a');
const sections = document.querySelectorAll('.section');
const createTournamentBtn = document.getElementById('create-tournament');
const settingsForm = document.getElementById('settings-form');

// Navigation functionality
menuLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Get the section id from the data attribute
        const sectionId = this.getAttribute('data-section');
        
        // Hide all sections
        sections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Show the selected section
        document.getElementById(sectionId).classList.add('active');
        
        // Update active menu item
        menuLinks.forEach(menuItem => {
            menuItem.classList.remove('active');
        });
        this.classList.add('active');
    });
});

// Create Tournament button
if (createTournamentBtn) {
    createTournamentBtn.addEventListener('click', function() {
        // In a real app, this would open a form or modal to create a tournament
        const tournamentData = {
            name: 'New Tournament',
            description: 'Tournament created from desktop app',
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days later
            status: 'draft',
            gameType: 'VR Game',
            maxPlayers: 32
        };
        
        createNewTournament(tournamentData);
    });
}

// Create new tournament
async function createNewTournament(tournamentData) {
    try {
        const result = await window.api.createTournament(tournamentData);
        alert(`Tournament "${result.name}" created successfully!`);
        loadTournaments(); // Reload the tournaments list
    } catch (error) {
        console.error('Error creating tournament:', error);
        alert('Failed to create tournament. Please try again.');
    }
}

// Settings form submission
if (settingsForm) {
    settingsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const appName = document.getElementById('app-name').value;
        const dbPath = document.getElementById('db-path').value;
        
        // In a real app, this would save settings to electron-store
        console.log('Settings saved:', { appName, dbPath });
        alert('Settings saved successfully!');
    });
}

// Load tournaments from database
async function loadTournaments() {
    try {
        const tournamentsContainer = document.getElementById('tournaments-list');
        const tournaments = await window.api.getTournaments();
        
        if (tournaments.length === 0) {
            tournamentsContainer.innerHTML = '<p>No tournaments available</p>';
            return;
        }
        
        let html = '';
        tournaments.forEach(tournament => {
            html += `
                <div class="tournament-item">
                    <h3>${tournament.name}</h3>
                    <p>${tournament.description || 'No description'}</p>
                    <p>Status: ${tournament.status}</p>
                    <p>Game: ${tournament.gameType}</p>
                    <button class="view-tournament" data-id="${tournament.id}">View Details</button>
                </div>
            `;
        });
        
        tournamentsContainer.innerHTML = html;
        
        // Add event listeners to the view buttons
        document.querySelectorAll('.view-tournament').forEach(button => {
            button.addEventListener('click', async function() {
                const tournamentId = this.getAttribute('data-id');
                // This would show tournament details in a real app
                alert(`View tournament ${tournamentId} details`);
            });
        });
    } catch (error) {
        console.error('Error loading tournaments:', error);
        document.getElementById('tournaments-list').innerHTML = 
            '<p class="error">Error loading tournaments. Please try again.</p>';
    }
}

// Load players from database
async function loadPlayers() {
    try {
        const playersContainer = document.getElementById('players-list');
        const players = await window.api.getPlayers();
        
        if (players.length === 0) {
            playersContainer.innerHTML = '<p>No players registered</p>';
            return;
        }
        
        let html = '';
        players.forEach(player => {
            html += `
                <div class="player-item">
                    <h3>${player.displayName || player.username}</h3>
                    <p>Username: ${player.username}</p>
                    <p>Email: ${player.email}</p>
                    <p>Status: ${player.status}</p>
                </div>
            `;
        });
        
        playersContainer.innerHTML = html;
    } catch (error) {
        console.error('Error loading players:', error);
        document.getElementById('players-list').innerHTML = 
            '<p class="error">Error loading players. Please try again.</p>';
    }
}

// Update dashboard data
async function updateDashboard() {
    try {
        const tournaments = await window.api.getTournaments();
        const players = await window.api.getPlayers();
        const matches = await window.api.getMatches() || [];
        
        // Update dashboard widgets
        document.querySelector('#dashboard .widget:nth-child(1) .count').textContent = 
            tournaments.filter(t => t.status === 'active').length;
        
        document.querySelector('#dashboard .widget:nth-child(2) .count').textContent = 
            players.length;
        
        document.querySelector('#dashboard .widget:nth-child(3) .count').textContent = 
            matches.filter(m => m.status === 'scheduled').length;
    } catch (error) {
        console.error('Error updating dashboard:', error);
    }
}

// Initialize the app
async function initApp() {
    try {
        // Load initial data
        await updateDashboard();
        
        // Add event listeners to load data when sections become active
        menuLinks.forEach(link => {
            link.addEventListener('click', async function() {
                const sectionId = this.getAttribute('data-section');
                
                if (sectionId === 'tournaments') {
                    await loadTournaments();
                } else if (sectionId === 'players') {
                    await loadPlayers();
                }
            });
        });
        
        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Error initializing application:', error);
    }
}

// Call init function when the page loads
document.addEventListener('DOMContentLoaded', initApp);