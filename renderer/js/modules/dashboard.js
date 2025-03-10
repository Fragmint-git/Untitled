/**
 * Dashboard Module
 * Handles dashboard functionality and data loading
 */

// Load dashboard data
async function loadDashboardData() {
    try {
        // Fetch data for dashboard
        const tournaments = await window.api.getTournaments();
        const players = await window.api.getPlayers();
        const games = await window.api.getGames();
        
        // Update dashboard statistics if elements exist
        const updateElement = (id, value) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        };

        updateElement('total-tournaments', tournaments.length);
        updateElement('total-players', players.length);
        updateElement('total-games', games.length);
        
        // Get active tournaments (status = 'active')
        const activeTournaments = tournaments.filter(t => t.status === 'active');
        updateElement('active-tournaments', activeTournaments.length);
        
        // Display recent tournaments in the dashboard
        const recentTournamentsContainer = document.getElementById('recent-tournaments');
        if (recentTournamentsContainer) {
            recentTournamentsContainer.innerHTML = '';
            
            // Sort tournaments by start date (most recent first)
            const sortedTournaments = [...tournaments].sort((a, b) => 
                new Date(b.startDate) - new Date(a.startDate)
            ).slice(0, 5);
            
            if (sortedTournaments.length === 0) {
                recentTournamentsContainer.innerHTML = '<p>No tournaments found. Create your first tournament!</p>';
            } else {
                sortedTournaments.forEach(tournament => {
                    const tournamentCard = document.createElement('div');
                    tournamentCard.className = 'tournament-card';
                    tournamentCard.innerHTML = `
                        <h3>${tournament.name}</h3>
                        <p>${tournament.description ? tournament.description.substring(0, 100) + (tournament.description.length > 100 ? '...' : '') : 'No description available.'}</p>
                        <div class="tournament-meta">
                            <span class="status ${tournament.status}">${tournament.status}</span>
                            <span class="date">Starts: ${new Date(tournament.startDate).toLocaleDateString()}</span>
                        </div>
                        <button class="btn view-tournament" data-id="${tournament.id}">View Details</button>
                    `;
                    recentTournamentsContainer.appendChild(tournamentCard);
                });
                
                // Add event listeners to view tournament buttons
                document.querySelectorAll('.view-tournament').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const tournamentId = e.target.getAttribute('data-id');
                        // Navigate to tournament details
                        document.querySelector('.nav-item[data-section="tournaments"]').click();
                        // Show tournament details
                        window.tournamentsModule.showTournamentDetails(tournamentId);
                    });
                });
            }
        }
        
        // Display upcoming matches
        loadUpcomingMatches();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        window.uiModule.showNotification('Failed to load dashboard data', 'error');
    }
}

// Function to load upcoming matches
async function loadUpcomingMatches() {
    try {
        const matches = await window.api.getMatches();
        const upcomingMatchesContainer = document.getElementById('upcoming-matches');
        if (!upcomingMatchesContainer) return;

        upcomingMatchesContainer.innerHTML = '';
        
        // Filter for upcoming matches (those with future start times)
        const now = new Date();
        const upcomingMatches = matches.filter(match => 
            new Date(match.startTime) > now
        ).sort((a, b) => 
            new Date(a.startTime) - new Date(b.startTime)
        ).slice(0, 5); // Get only the 5 soonest matches
        
        if (upcomingMatches.length === 0) {
            upcomingMatchesContainer.innerHTML = '<p>No upcoming matches scheduled.</p>';
        } else {
            upcomingMatches.forEach(match => {
                const matchCard = document.createElement('div');
                matchCard.className = 'match-card';
                
                // Format the date and time
                const matchDate = new Date(match.startTime);
                const formattedDate = matchDate.toLocaleDateString();
                const formattedTime = matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                matchCard.innerHTML = `
                    <div class="match-time">
                        <div class="date">${formattedDate}</div>
                        <div class="time">${formattedTime}</div>
                    </div>
                    <div class="match-details">
                        <h4>Match #${match.id}</h4>
                        <p>Tournament: ${match.Tournament ? match.Tournament.name : 'Unknown'}</p>
                        <span class="status ${match.status}">${match.status}</span>
                    </div>
                `;
                upcomingMatchesContainer.appendChild(matchCard);
            });
        }
    } catch (error) {
        console.error('Error loading upcoming matches:', error);
        window.uiModule.showNotification('Failed to load upcoming matches', 'error');
    }
}

// Export module
window.dashboardModule = {
    loadDashboardData
}; 