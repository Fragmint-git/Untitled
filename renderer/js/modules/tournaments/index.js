/**
 * Tournaments Module
 * Handles tournament functionality and UI
 */

window.tournamentsModule = {
    // Initialize tournaments module
    init: function() {
        console.log('Initializing tournaments module...');
        this.loadTournaments();
        this.setupEventListeners();
    },

    // Setup event listeners
    setupEventListeners: function() {
        // Tournament search
        const searchInput = document.getElementById('tournament-search');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterTournaments());
        }

        // Status filter
        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.filterTournaments());
        }

        // Game filter
        const gameFilter = document.getElementById('game-filter');
        if (gameFilter) {
            gameFilter.addEventListener('change', () => this.filterTournaments());
        }

        // Create tournament button
        const createBtn = document.getElementById('create-tournament-btn');
        if (createBtn) {
            createBtn.addEventListener('click', () => this.openCreateTournamentModal());
        }
    },

    // Load tournaments
    loadTournaments: async function() {
        try {
            console.log('Starting to load tournaments...');
            const container = document.getElementById('tournaments-container');
            if (!container) {
                console.error('Tournaments container not found');
                return;
            }

            // Add tournament controls
            container.innerHTML = `
                <div class="tournaments-controls">
                    <div class="search-filters">
                        <div class="search-box">
                            <i class="fas fa-search"></i>
                            <input type="text" id="tournament-search" placeholder="Search tournaments...">
                        </div>
                        <div class="filters">
                            <select id="status-filter">
                                <option value="all">All Statuses</option>
                                <option value="upcoming">Upcoming</option>
                                <option value="ongoing">Ongoing</option>
                                <option value="completed">Completed</option>
                                <option value="draft">Draft</option>
                            </select>
                            <select id="game-filter">
                                <option value="all">All Games</option>
                                <option value="echo-arena">Echo Arena</option>
                                <option value="nock">Nock</option>
                                <option value="echo-combat">Echo Combat</option>
                                <option value="breachers">Breachers</option>
                                <option value="vail">Vail</option>
                                <option value="blacktop-hoops">Blacktop Hoops</option>
                            </select>
                        </div>
                    </div>
                    <button id="create-tournament-btn" class="btn-primary">
                        <i class="fas fa-plus"></i> Create Tournament
                    </button>
                </div>

                <div class="tournaments-grid" id="tournaments-grid">
                    <!-- Tournaments will be loaded here -->
                </div>
            `;

            console.log('Fetching tournaments via IPC...');
            // Fetch tournaments using IPC - use the correct method from preload
            const tournaments = await window.api.getTournaments();
            console.log('Received tournaments:', tournaments);
            
            // Render the tournaments
            this.renderTournaments(tournaments);
            this.setupEventListeners();

        } catch (error) {
            console.error('Error loading tournaments:', error);
            if (window.uiModule) {
                window.uiModule.showNotification('Failed to load tournaments', 'error');
            }
        }
    },

    // Render tournaments
    renderTournaments: function(tournaments) {
        console.log('Starting to render tournaments:', tournaments);
        const grid = document.getElementById('tournaments-grid');
        if (!grid) {
            console.error('Tournament grid element not found');
            return;
        }

        if (!tournaments || tournaments.length === 0) {
            console.log('No tournaments to display');
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-trophy"></i>
                    <h3>No Tournaments Found</h3>
                    <p>Create a new tournament to get started!</p>
                    <button class="btn-primary" onclick="window.tournamentsModule.openCreateTournamentModal()">
                        Create Tournament
                    </button>
                </div>
            `;
            return;
        }

        console.log('Rendering tournament cards...');
        grid.innerHTML = tournaments.map(tournament => {
            // Get proper image path for tournament game
            let imagePath = '/assets/default-game-cover.png'; // Default fallback
            if (tournament.Game && tournament.Game.coverImage) {
                console.log(`Raw coverImage for ${tournament.Game.name}:`, tournament.Game.coverImage);
                
                // Check if coverImage already has a full path
                if (tournament.Game.coverImage.startsWith('http://') || tournament.Game.coverImage.startsWith('https://')) {
                    imagePath = tournament.Game.coverImage;
                    console.log(`Using server-provided URL: ${imagePath}`);
                } else if (tournament.Game.coverImage.startsWith('/assets/')) {
                    imagePath = tournament.Game.coverImage;
                    console.log(`Using asset path: ${imagePath}`);
                } else {
                    // Otherwise construct the full path - try direct asset path first rather than server
                    imagePath = `/assets/images/games/GameLogos/${tournament.Game.coverImage}`;
                    console.log(`Using direct asset path: ${imagePath}`);
                }
                // Log the image path for debugging
                console.log(`Final image path for game ${tournament.Game.name}:`, imagePath);
            } else {
                console.warn('No cover image found for tournament game, using default');
            }
            
            return `
                <div class="tournament-card" data-id="${tournament.id}">
                    <div class="tournament-header">
                        <img src="${imagePath}" alt="${tournament.Game?.name || 'Game Image'}" 
                             onerror="this.onerror=null; console.error('Failed to load image:', this.src); this.src='/assets/default-game-cover.png'; console.log('Fallback image loaded');">
                        <span class="status-badge ${tournament.status.toLowerCase()}">${tournament.status}</span>
                    </div>
                    <div class="tournament-content">
                        <h3>${tournament.name}</h3>
                        <p class="game-name"><i class="fas fa-gamepad"></i> ${tournament.Game?.name || 'Unknown Game'}</p>
                        <div class="tournament-info">
                            <div class="info-item">
                                <i class="fas fa-users"></i>
                                <span>${tournament.players}/${tournament.maxPlayers} Players</span>
                            </div>
                            <div class="info-item">
                                <i class="fas fa-calendar"></i>
                                <span>${new Date(tournament.startDate).toLocaleDateString()}</span>
                            </div>
                            <div class="info-item">
                                <i class="fas fa-trophy"></i>
                                <span>$${tournament.prizePool.toLocaleString()}</span>
                            </div>
                        </div>
                        <p class="description">${tournament.description}</p>
                    </div>
                    <div class="tournament-actions">
                        ${this.getTournamentActions(tournament)}
                    </div>
                </div>
            `;
        }).join('');

        // Add event listeners to action buttons
        this.setupTournamentCardListeners();
    },

    // Get tournament action buttons based on status
    getTournamentActions: function(tournament) {
        const session = window.api.getSession();
        const isAdmin = session && session.is_admin == 1;
    
        if (!isAdmin) {
            return `
                <button class="btn-primary join-tournament" data-id="${tournament.id}">
                    Join
                </button>
                <button class="btn-secondary view-details" data-id="${tournament.id}">
                    View
                </button>
            `;
        }
    
        switch (tournament.status.toLowerCase()) {
            case 'upcoming':
                return `
                    <button class="btn-primary join-tournament" data-id="${tournament.id}">
                        Join Tournament
                    </button>
                    <button class="btn-secondary view-details" data-id="${tournament.id}">
                        View Details
                    </button>
                `;
            case 'ongoing':
                return `
                    <button class="btn-primary view-matches" data-id="${tournament.id}">
                        View Matches
                    </button>
                    <button class="btn-secondary view-bracket" data-id="${tournament.id}">
                        View Bracket
                    </button>
                `;
            case 'completed':
                return `
                    <button class="btn-primary view-results" data-id="${tournament.id}">
                        View Results
                    </button>
                    <button class="btn-secondary view-bracket" data-id="${tournament.id}">
                        View Bracket
                    </button>
                `;
            case 'draft':
                return `
                    <button class="btn-primary edit-tournament" data-id="${tournament.id}">
                        Edit Tournament
                    </button>
                    <button class="btn-secondary delete-tournament" data-id="${tournament.id}">
                        Delete
                    </button>
                `;
            default:
                return `
                    <button class="btn-secondary view-details" data-id="${tournament.id}">
                        View Details
                    </button>
                `;
        }
    },

    // Setup tournament card event listeners
    setupTournamentCardListeners: function() {
        // Join tournament
        document.querySelectorAll('.join-tournament').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                this.joinTournament(id);
            });
        });

        // View details
        document.querySelectorAll('.view-details, .view-matches, .view-results').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                this.viewTournamentDetails(id);
            });
        });

        // View bracket
        document.querySelectorAll('.view-bracket').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                this.viewTournamentBracket(id);
            });
        });

        // Edit tournament
        document.querySelectorAll('.edit-tournament').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                this.editTournament(id);
            });
        });

        // Delete tournament
        document.querySelectorAll('.delete-tournament').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                this.deleteTournament(id);
            });
        });
    },

    // Filter tournaments
    filterTournaments: function() {
        const searchTerm = document.getElementById('tournament-search').value.toLowerCase();
        const statusFilter = document.getElementById('status-filter').value;
        const gameFilter = document.getElementById('game-filter').value;

        const cards = document.querySelectorAll('.tournament-card');
        cards.forEach(card => {
            const name = card.querySelector('h3').textContent.toLowerCase();
            const game = card.querySelector('.game-name').textContent.toLowerCase();
            const status = card.querySelector('.status-badge').textContent.toLowerCase();

            const matchesSearch = name.includes(searchTerm) || game.includes(searchTerm);
            const matchesStatus = statusFilter === 'all' || status === statusFilter;
            const matchesGame = gameFilter === 'all' || game.includes(gameFilter);

            card.style.display = matchesSearch && matchesStatus && matchesGame ? 'flex' : 'none';
        });
    },

    // Open create tournament modal
    openCreateTournamentModal: function() {
        const modal = document.getElementById('create-tournament-modal');
        if (!modal) return;

        modal.style.display = 'block';

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        // Close modal when clicking close button
        modal.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        });

        // Handle form submission
        const form = document.getElementById('tournament-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createTournament(form);
            });
        }
    },

    // Create tournament
    createTournament: async function(form) {
        try {
            const tournamentData = {
                name: document.getElementById('tournament-name').value,
                game: document.getElementById('tournament-game').value,
                startDate: document.getElementById('start-date').value,
                endDate: document.getElementById('end-date').value,
                description: document.getElementById('tournament-description').value,
                maxPlayers: parseInt(document.getElementById('max-players').value),
                prizePool: parseFloat(document.getElementById('prize-pool').value),
                status: 'draft'
            };

            // In a real app, this would be sent to the backend
            console.log('Creating tournament:', tournamentData);

            // Close modal
            document.getElementById('create-tournament-modal').style.display = 'none';

            // Show success message
            if (window.uiModule) {
                window.uiModule.showNotification('Tournament created successfully!', 'success');
            }

            // Reload tournaments
            this.loadTournaments();

        } catch (error) {
            console.error('Error creating tournament:', error);
            if (window.uiModule) {
                window.uiModule.showNotification('Failed to create tournament', 'error');
            }
        }
    },

    // Join tournament
    joinTournament: async function(tournamentId) {
        try {
            // In a real app, this would send a request to join the tournament
            console.log('Joining tournament:', tournamentId);

            if (window.uiModule) {
                window.uiModule.showNotification('Successfully joined tournament!', 'success');
            }

            // Reload tournaments to update the UI
            this.loadTournaments();

        } catch (error) {
            console.error('Error joining tournament:', error);
            if (window.uiModule) {
                window.uiModule.showNotification('Failed to join tournament', 'error');
            }
        }
    },

    // View tournament details
    viewTournamentDetails: function(tournamentId) {
        // Implementation pending
        console.log('Viewing tournament details:', tournamentId);
    },

    // View tournament bracket
    viewTournamentBracket: function(tournamentId) {
        // Implementation pending
        console.log('Viewing tournament bracket:', tournamentId);
    },

    // Edit tournament
    editTournament: function(tournamentId) {
        // Implementation pending
        console.log('Editing tournament:', tournamentId);
    },

    // Delete tournament
    deleteTournament: async function(tournamentId) {
        try {
            if (confirm('Are you sure you want to delete this tournament?')) {
                // In a real app, this would send a delete request to the backend
                console.log('Deleting tournament:', tournamentId);

                if (window.uiModule) {
                    window.uiModule.showNotification('Tournament deleted successfully!', 'success');
                }

                // Reload tournaments
                this.loadTournaments();
            }
        } catch (error) {
            console.error('Error deleting tournament:', error);
            if (window.uiModule) {
                window.uiModule.showNotification('Failed to delete tournament', 'error');
            }
        }
    },

    // Get mock tournaments data
    getMockTournaments: async function() {
        return [
            {
                id: 1,
                name: 'Echo Arena Championship 2025',
                game: {
                    name: 'Echo Arena',
                    coverImage: '/assets/images/games/GameLogos/echoarena.webp'
                },
                status: 'draft',
                startDate: '2025-03-14',
                endDate: '2025-03-19',
                description: 'The biggest zero-gravity sports tournament of the year',
                players: 0,
                maxPlayers: 64,
                prizePool: 10000
            },
            {
                id: 2,
                name: 'Weekly Nock Challenge',
                game: {
                    name: 'Nock',
                    coverImage: '/assets/images/games/GameLogos/nock.webp'
                },
                status: 'ongoing',
                startDate: '2024-02-01',
                endDate: '2024-02-07',
                description: 'Weekly competition for Nock archery enthusiasts',
                players: 32,
                maxPlayers: 32,
                prizePool: 500
            },
            {
                id: 3,
                name: 'Breachers Tactical Championship',
                game: {
                    name: 'Breachers',
                    coverImage: '/assets/images/games/GameLogos/Breachers.webp'
                },
                status: 'upcoming',
                startDate: '2024-03-01',
                endDate: '2024-03-03',
                description: 'Test your tactical skills in close-quarters combat',
                players: 16,
                maxPlayers: 32,
                prizePool: 1000
            }
        ];
    }
};

// Initialize module when document is ready
document.addEventListener('DOMContentLoaded', () => {
    window.tournamentsModule.init();
}); 