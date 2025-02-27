/**
 * Tournaments Module
 * Handles tournament functionality and data loading
 */

// Load tournaments from database
async function loadTournaments() {
    try {
        const tournamentsContainer = document.getElementById('tournaments-container');
        tournamentsContainer.innerHTML = '<div class="loading">Loading tournaments...</div>';
        
        const tournaments = await window.api.getTournaments();
        
        // Clear the loading message
        tournamentsContainer.innerHTML = '';
        
        // Add tournament creation button
        const createButtonContainer = document.createElement('div');
        createButtonContainer.className = 'create-button-container';
        createButtonContainer.innerHTML = `
            <button id="create-tournament-btn" class="btn primary">Create New Tournament</button>
        `;
        tournamentsContainer.appendChild(createButtonContainer);
        
        // Add tournament filters
        const filtersContainer = document.createElement('div');
        filtersContainer.className = 'filters-container';
        filtersContainer.innerHTML = `
            <div class="search-container">
                <input type="text" id="tournament-search" placeholder="Search tournaments...">
            </div>
            <div class="filter-options">
                <select id="status-filter">
                    <option value="all">All Statuses</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
                <select id="game-filter">
                    <option value="all">All Games</option>
                    <!-- Will be populated with games -->
                </select>
            </div>
        `;
        tournamentsContainer.appendChild(filtersContainer);
        
        // Populate game filter
        const games = await window.api.getGames();
        const gameFilter = document.getElementById('game-filter');
        games.forEach(game => {
            const option = document.createElement('option');
            option.value = game.id;
            option.textContent = game.name;
            gameFilter.appendChild(option);
        });
        
        // Create tournaments list
        const tournamentsListContainer = document.createElement('div');
        tournamentsListContainer.className = 'tournaments-list';
        tournamentsListContainer.id = 'tournaments-list';
        
        if (tournaments.length === 0) {
            tournamentsListContainer.innerHTML = `
                <div class="empty-state">
                    <h3>No Tournaments Found</h3>
                    <p>Get started by creating your first tournament!</p>
                </div>
            `;
        } else {
            tournaments.forEach(tournament => {
                const tournamentCard = document.createElement('div');
                tournamentCard.className = 'tournament-card';
                tournamentCard.setAttribute('data-id', tournament.id);
                tournamentCard.setAttribute('data-status', tournament.status);
                tournamentCard.setAttribute('data-game', tournament.Game ? tournament.Game.id : '');
                
                // Format dates
                const startDate = new Date(tournament.startDate).toLocaleDateString();
                const endDate = new Date(tournament.endDate).toLocaleDateString();
                
                tournamentCard.innerHTML = `
                    <h3>${tournament.name}</h3>
                    <p>${tournament.description.substring(0, 100)}${tournament.description.length > 100 ? '...' : ''}</p>
                    <div class="tournament-meta">
                        <span class="status ${tournament.status}">${tournament.status}</span>
                        <span class="date">${startDate} - ${endDate}</span>
                    </div>
                    <div class="tournament-game">
                        <span>Game: ${tournament.Game ? tournament.Game.name : 'None'}</span>
                    </div>
                    <div class="tournament-players">
                        <span>Players: ${tournament.Players ? tournament.Players.length : 0}/${tournament.maxPlayers}</span>
                    </div>
                    <div class="tournament-actions">
                        <button class="btn view-details" data-id="${tournament.id}">View Details</button>
                    </div>
                `;
                
                tournamentsListContainer.appendChild(tournamentCard);
            });
        }
        
        tournamentsContainer.appendChild(tournamentsListContainer);
        
        // Add event listeners
        document.getElementById('create-tournament-btn').addEventListener('click', showCreateTournamentForm);
        
        document.querySelectorAll('.view-details').forEach(button => {
            button.addEventListener('click', (e) => {
                const tournamentId = e.target.getAttribute('data-id');
                showTournamentDetails(tournamentId);
            });
        });
        
        // Add search and filter functionality
        document.getElementById('tournament-search').addEventListener('input', filterTournaments);
        document.getElementById('status-filter').addEventListener('change', filterTournaments);
        document.getElementById('game-filter').addEventListener('change', filterTournaments);
        
    } catch (error) {
        console.error('Error loading tournaments:', error);
        document.getElementById('tournaments-container').innerHTML = `
            <div class="error-message">
                <p>Failed to load tournaments. Please try again.</p>
                <button id="retry-load-tournaments" class="btn">Retry</button>
            </div>
        `;
        
        document.getElementById('retry-load-tournaments').addEventListener('click', loadTournaments);
    }
}

// Function to filter tournaments based on search and filter criteria
function filterTournaments() {
    const searchTerm = document.getElementById('tournament-search').value.toLowerCase();
    const statusFilter = document.getElementById('status-filter').value;
    const gameFilter = document.getElementById('game-filter').value;
    
    const tournamentCards = document.querySelectorAll('.tournament-card');
    
    tournamentCards.forEach(card => {
        const tournamentName = card.querySelector('h3').textContent.toLowerCase();
        const tournamentDescription = card.querySelector('p').textContent.toLowerCase();
        const tournamentStatus = card.getAttribute('data-status');
        const tournamentGame = card.getAttribute('data-game');
        
        const matchesSearch = tournamentName.includes(searchTerm) || tournamentDescription.includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || tournamentStatus === statusFilter;
        const matchesGame = gameFilter === 'all' || tournamentGame === gameFilter;
        
        if (matchesSearch && matchesStatus && matchesGame) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
    
    // Show empty state if no tournaments match the filters
    const visibleTournaments = document.querySelectorAll('.tournament-card[style="display: block"]');
    const emptyState = document.querySelector('.empty-state');
    
    if (visibleTournaments.length === 0 && !emptyState) {
        const tournamentsListContainer = document.getElementById('tournaments-list');
        tournamentsListContainer.innerHTML += `
            <div class="empty-state">
                <h3>No Tournaments Match Your Filters</h3>
                <p>Try adjusting your search criteria.</p>
            </div>
        `;
    } else if (visibleTournaments.length > 0 && emptyState) {
        emptyState.remove();
    }
}

// Function to show the create tournament form
function showCreateTournamentForm() {
    const tournamentsContainer = document.getElementById('tournaments-container');
    tournamentsContainer.innerHTML = '';
    
    const formContainer = document.createElement('div');
    formContainer.className = 'form-container';
    formContainer.innerHTML = `
        <div class="back-button-container">
            <button id="back-to-tournaments" class="btn">← Back to Tournaments</button>
        </div>
        <h2>Create New Tournament</h2>
        <form id="create-tournament-form">
            <div class="form-group">
                <label for="tournament-name">Tournament Name</label>
                <input type="text" id="tournament-name" name="name" required>
            </div>
            <div class="form-group">
                <label for="tournament-description">Description</label>
                <textarea id="tournament-description" name="description" rows="4" required></textarea>
            </div>
            <div class="form-group">
                <label for="tournament-game">Game</label>
                <select id="tournament-game" name="GameId" required>
                    <option value="">Select a Game</option>
                    <!-- Will be populated with games -->
                </select>
            </div>
            <div class="form-group">
                <label for="tournament-start-date">Start Date</label>
                <input type="date" id="tournament-start-date" name="startDate" required>
            </div>
            <div class="form-group">
                <label for="tournament-end-date">End Date</label>
                <input type="date" id="tournament-end-date" name="endDate" required>
            </div>
            <div class="form-group">
                <label for="tournament-max-players">Maximum Players</label>
                <input type="number" id="tournament-max-players" name="maxPlayers" min="2" value="16" required>
            </div>
            <div class="form-group">
                <label for="tournament-status">Status</label>
                <select id="tournament-status" name="status" required>
                    <option value="upcoming">Upcoming</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" id="cancel-create" class="btn">Cancel</button>
                <button type="submit" class="btn primary">Create Tournament</button>
            </div>
        </form>
    `;
    
    tournamentsContainer.appendChild(formContainer);
    
    // Populate game select
    window.api.getGames()
        .then(games => {
            const gameSelect = document.getElementById('tournament-game');
            games.forEach(game => {
                const option = document.createElement('option');
                option.value = game.id;
                option.textContent = game.name;
                gameSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error fetching games:', error);
            window.uiModule.showNotification('Failed to load games', 'error');
        });
    
    // Set default dates
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    document.getElementById('tournament-start-date').valueAsDate = today;
    document.getElementById('tournament-end-date').valueAsDate = nextWeek;
    
    // Add event listeners
    document.getElementById('back-to-tournaments').addEventListener('click', loadTournaments);
    document.getElementById('cancel-create').addEventListener('click', loadTournaments);
    
    document.getElementById('create-tournament-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const tournamentData = {
            name: formData.get('name'),
            description: formData.get('description'),
            GameId: parseInt(formData.get('GameId')),
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate'),
            maxPlayers: parseInt(formData.get('maxPlayers')),
            status: formData.get('status')
        };
        
        try {
            const newTournament = await window.api.createTournament(tournamentData);
            window.uiModule.showNotification('Tournament created successfully!', 'success');
            loadTournaments();
        } catch (error) {
            console.error('Error creating tournament:', error);
            window.uiModule.showNotification('Failed to create tournament', 'error');
        }
    });
}

// Function to show tournament details
async function showTournamentDetails(tournamentId) {
    try {
        const tournamentsContainer = document.getElementById('tournaments-container');
        tournamentsContainer.innerHTML = '<div class="loading">Loading tournament details...</div>';
        
        const tournament = await window.api.getTournament(tournamentId);
        
        // Clear the loading message
        tournamentsContainer.innerHTML = '';
        
        // Create the tournament details view
        const detailsContainer = document.createElement('div');
        detailsContainer.className = 'tournament-details';
        
        // Format dates
        const startDate = new Date(tournament.startDate).toLocaleDateString();
        const endDate = new Date(tournament.endDate).toLocaleDateString();
        
        detailsContainer.innerHTML = `
            <div class="back-button-container">
                <button id="back-to-tournaments" class="btn">← Back to Tournaments</button>
            </div>
            <h2>${tournament.name}</h2>
            <div class="tournament-meta">
                <span class="status ${tournament.status}">${tournament.status}</span>
                <span class="date">From ${startDate} to ${endDate}</span>
            </div>
            <div class="tournament-description">
                <p>${tournament.description}</p>
            </div>
            <div class="tournament-game">
                <h3>Game</h3>
                <p>${tournament.Game ? tournament.Game.name : 'No game associated'}</p>
            </div>
            <div class="tournament-players">
                <h3>Players (${tournament.Players ? tournament.Players.length : 0}/${tournament.maxPlayers})</h3>
                <div class="players-list" id="tournament-players-list">
                    ${tournament.Players && tournament.Players.length > 0 
                        ? tournament.Players.map(player => `
                            <div class="player-card">
                                <h4>${player.displayName || player.username}</h4>
                                <p>${player.status}</p>
                            </div>
                        `).join('')
                        : '<p>No players registered yet.</p>'
                    }
                </div>
            </div>
            <div class="tournament-matches">
                <h3>Matches</h3>
                <div class="matches-list" id="tournament-matches-list">
                    ${tournament.Matches && tournament.Matches.length > 0 
                        ? tournament.Matches.map(match => {
                            const matchDate = new Date(match.startTime);
                            return `
                                <div class="match-card">
                                    <div class="match-time">
                                        <div class="date">${matchDate.toLocaleDateString()}</div>
                                        <div class="time">${matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                    <div class="match-details">
                                        <h4>Match #${match.id}</h4>
                                        <span class="status ${match.status}">${match.status}</span>
                                        <p>${match.result || 'No result yet'}</p>
                                    </div>
                                </div>
                            `;
                        }).join('')
                        : '<p>No matches scheduled yet.</p>'
                    }
                </div>
            </div>
            <div class="tournament-actions">
                <button class="btn edit-tournament" data-id="${tournament.id}">Edit Tournament</button>
                <button class="btn add-player" data-id="${tournament.id}">Add Player</button>
                <button class="btn schedule-match" data-id="${tournament.id}">Schedule Match</button>
            </div>
        `;
        
        tournamentsContainer.appendChild(detailsContainer);
        
        // Add event listener for back button
        document.getElementById('back-to-tournaments').addEventListener('click', () => {
            loadTournaments();
        });
        
        // Add event listeners for action buttons
        document.querySelector('.edit-tournament').addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            showEditTournamentForm(id);
        });
        
        document.querySelector('.add-player').addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            showAddPlayerForm(id);
        });
        
        document.querySelector('.schedule-match').addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            showScheduleMatchForm(id);
        });
    } catch (error) {
        console.error('Error fetching tournament details:', error);
        document.getElementById('tournaments-container').innerHTML = `
            <div class="error-message">
                <p>Failed to load tournament details. Please try again.</p>
                <button id="back-to-tournaments" class="btn">Back to Tournaments</button>
            </div>
        `;
        
        document.getElementById('back-to-tournaments').addEventListener('click', () => {
            loadTournaments();
        });
    }
}

// Function to show edit tournament form
function showEditTournamentForm(tournamentId) {
    // Implementation will be added later
    window.uiModule.showNotification('Edit tournament functionality coming soon', 'info');
}

// Function to show add player form
function showAddPlayerForm(tournamentId) {
    // Implementation will be added later
    window.uiModule.showNotification('Add player functionality coming soon', 'info');
}

// Function to show schedule match form
function showScheduleMatchForm(tournamentId) {
    // Implementation will be added later
    window.uiModule.showNotification('Schedule match functionality coming soon', 'info');
}

// Export module
window.tournamentsModule = {
    loadTournaments,
    showTournamentDetails,
    showCreateTournamentForm,
    showEditTournamentForm,
    showAddPlayerForm,
    showScheduleMatchForm
}; 