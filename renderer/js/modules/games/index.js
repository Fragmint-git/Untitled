/**
 * Games Module
 * Handles games functionality and data loading
 */

// Load games from database
async function loadGames() {
    try {
        const gamesContainer = document.getElementById('games-container');
        gamesContainer.innerHTML = '<div class="loading">Loading games...</div>';
        
        const games = await window.api.getGames();
        
        // Clear the loading message
        gamesContainer.innerHTML = '';
        
        // Add game creation button (only visible in admin panel)
        const createButtonContainer = document.createElement('div');
        createButtonContainer.className = 'create-button-container';
        createButtonContainer.innerHTML = `
            <a href="pages/admin.html" class="btn primary">Manage Games in Admin Panel</a>
        `;
        gamesContainer.appendChild(createButtonContainer);
        
        // Add game filters
        const filtersContainer = document.createElement('div');
        filtersContainer.className = 'filters-container';
        filtersContainer.innerHTML = `
            <div class="search-container">
                <input type="text" id="game-search" placeholder="Search games...">
            </div>
            <div class="filter-options">
                <select id="platform-filter">
                    <option value="all">All Platforms</option>
                    <option value="oculus">Oculus</option>
                    <option value="vive">HTC Vive</option>
                    <option value="index">Valve Index</option>
                    <option value="psvr">PlayStation VR</option>
                </select>
                <select id="genre-filter">
                    <option value="all">All Genres</option>
                    <option value="action">Action</option>
                    <option value="sports">Sports</option>
                    <option value="rhythm">Rhythm</option>
                    <option value="shooter">Shooter</option>
                    <option value="puzzle">Puzzle</option>
                </select>
            </div>
        `;
        gamesContainer.appendChild(filtersContainer);
        
        // Create games grid
        const gamesGrid = document.createElement('div');
        gamesGrid.className = 'games-grid';
        gamesGrid.id = 'games-grid';
        
        if (games.length === 0) {
            gamesGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-gamepad"></i>
                    <h3>No Games Found</h3>
                    <p>No VR games are currently available.</p>
                </div>
            `;
        } else {
            games.forEach(game => {
                const gameCard = document.createElement('div');
                gameCard.className = 'game-card';
                gameCard.setAttribute('data-id', game.id);
                
                // Parse platforms and genres from strings to arrays if needed
                const platforms = Array.isArray(game.platforms) 
                    ? game.platforms 
                    : (game.platforms ? game.platforms.split(',').map(p => p.trim()) : []);
                const genres = Array.isArray(game.genres)
                    ? game.genres
                    : (game.genres ? game.genres.split(',').map(g => g.trim()) : []);
                
                // Create platform badges HTML
                const platformBadges = platforms.map(platform => 
                    `<span class="platform-badge ${platform.toLowerCase()}">${platform}</span>`
                ).join('');
                
                // Create genre tags HTML
                const genreTags = genres.map(genre => 
                    `<span class="genre-tag">${genre}</span>`
                ).join('');
                
                // Get proper image path for game
                let imagePath = '/assets/default-game-cover.png'; // Default fallback
                if (game.coverImage) {
                    console.log(`Raw coverImage for ${game.name}:`, game.coverImage);
                    
                    // Check if coverImage already has a full path
                    if (game.coverImage.startsWith('http://') || game.coverImage.startsWith('https://')) {
                        imagePath = game.coverImage;
                        console.log(`Using server-provided URL: ${imagePath}`);
                    } else if (game.coverImage.startsWith('/assets/')) {
                        imagePath = game.coverImage;
                        console.log(`Using asset path: ${imagePath}`);
                    } else {
                        // Otherwise construct the full path
                        imagePath = `/assets/images/games/GameLogos/${game.coverImage}`;
                        console.log(`Constructed asset path: ${imagePath}`);
                    }
                    // Log the final image path for debugging
                    console.log(`Final image path for game ${game.name}:`, imagePath);
                } else {
                    console.warn(`No cover image found for game ${game.name}, using default`);
                }
                
                gameCard.innerHTML = `
                    <div class="game-image">
                        <img src="${imagePath}" alt="${game.name}" 
                             onerror="this.onerror=null; console.error('Failed to load image:', this.src); this.src='/assets/default-game-cover.png'; console.log('Using fallback image');">
                    </div>
                    <div class="game-info">
                        <h3>${game.name}</h3>

                        <p class="game-developer">${
                            game.bio ? (game.bio.length > 100 ? game.bio.substring(0, 100) + '...' : game.bio)
                            : 'No details available'
                        }</p>

                        <!--<div class="game-meta">
                            <span class="platforms">${Array.isArray(game.platforms) ? game.platforms.join(', ') : game.platforms}</span>
                            <span class="release-date">${new Date(game.releaseDate).getFullYear()}</span>
                        </div>
                        
                        <div class="platform-badges">
                            ${platformBadges}
                        </div>
                        <div class="genre-tags">
                            ${genreTags}
                        </div>-->
                    </div>
                    <div class="game-actions">
                        <button class="btn view-game" data-id="${game.id}">View Details</button>
                    </div>
                `;
                
                gamesGrid.appendChild(gameCard);
            });
        }
        
        gamesContainer.appendChild(gamesGrid);
        
        // Add event listeners
        document.querySelectorAll('.view-game').forEach(button => {
            button.addEventListener('click', (e) => {
                const gameId = e.target.getAttribute('data-id');
                showGameDetails(gameId);
            });
        });
        
        // Add search and filter functionality
        const gameSearch = document.getElementById('game-search');
        const platformFilter = document.getElementById('platform-filter');
        const genreFilter = document.getElementById('genre-filter');
        
        if (gameSearch) {
            gameSearch.addEventListener('input', filterGames);
        }
        
        if (platformFilter) {
            platformFilter.addEventListener('change', filterGames);
        }
        
        if (genreFilter) {
            genreFilter.addEventListener('change', filterGames);
        }
        
    } catch (error) {
        console.error('Error loading games:', error);
        document.getElementById('games-container').innerHTML = `
            <div class="error-message">
                <p>Failed to load games. Please try again.</p>
                <button id="retry-load-games" class="btn">Retry</button>
            </div>
        `;
        
        document.getElementById('retry-load-games').addEventListener('click', loadGames);
    }
}

// Function to filter games based on search and filter criteria
function filterGames() {
    const searchTerm = document.getElementById('game-search').value.toLowerCase();
    const platformFilter = document.getElementById('platform-filter').value;
    const genreFilter = document.getElementById('genre-filter').value;
    
    const gameCards = document.querySelectorAll('.game-card');
    
    gameCards.forEach(card => {
        const gameName = card.querySelector('h3').textContent.toLowerCase();
        const gameDeveloper = card.querySelector('.game-developer').textContent.toLowerCase();
        const platformBadges = card.querySelectorAll('.platform-badge');
        const genreTags = card.querySelectorAll('.genre-tag');
        
        // Check if game matches search term
        const matchesSearch = gameName.includes(searchTerm) || gameDeveloper.includes(searchTerm);
        
        // Check if game matches platform filter
        let matchesPlatform = platformFilter === 'all';
        if (!matchesPlatform) {
            platformBadges.forEach(badge => {
                if (badge.classList.contains(platformFilter.toLowerCase())) {
                    matchesPlatform = true;
                }
            });
        }
        
        // Check if game matches genre filter
        let matchesGenre = genreFilter === 'all';
        if (!matchesGenre) {
            genreTags.forEach(tag => {
                if (tag.textContent.toLowerCase() === genreFilter.toLowerCase()) {
                    matchesGenre = true;
                }
            });
        }
        
        // Show or hide game card based on filters
        if (matchesSearch && matchesPlatform && matchesGenre) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
    
    // Show empty state if no games match the filters
    const visibleGames = document.querySelectorAll('.game-card[style="display: block"]');
    const emptyState = document.querySelector('.empty-state');
    
    if (visibleGames.length === 0 && !emptyState) {
        const gamesGrid = document.getElementById('games-grid');
        
        // Clear the grid if it exists
        gamesGrid.innerHTML = `
            <div class="empty-state">
                <h3>No Games Match Your Filters</h3>
                <p>Try adjusting your search criteria.</p>
            </div>
        `;
    } else if (visibleGames.length > 0 && emptyState) {
        emptyState.remove();
    }
}

// Function to show game details
async function showGameDetails(gameId) {
    try {
        const gamesContainer = document.getElementById('games-container');
        gamesContainer.innerHTML = '<div class="loading">Loading game details...</div>';
        
        const game = await window.api.getGame(gameId);
        
        // Clear the loading message
        gamesContainer.innerHTML = '';
        
        // Create game details view
        const gameDetails = document.createElement('div');
        gameDetails.className = 'game-details';
        
        // Parse platforms and genres from strings to arrays if needed
        const platforms = Array.isArray(game.platforms) 
            ? game.platforms 
            : (game.platforms ? game.platforms.split(',').map(p => p.trim()) : []);
        const genres = Array.isArray(game.genres)
            ? game.genres
            : (game.genres ? game.genres.split(',').map(g => g.trim()) : []);
        
        // Create platform badges HTML
        const platformBadges = platforms.map(platform => 
            `<span class="platform-badge ${platform.toLowerCase()}">${platform}</span>`
        ).join('');
        
        // Create genre tags HTML
        const genreTags = genres.map(genre => 
            `<span class="genre-tag">${genre}</span>`
        ).join('');
        
        gameDetails.innerHTML = `
            <div class="back-button-container">
                <button id="back-to-games" class="btn">← Back to Games</button>
            </div>
            <div class="game-header">
                <div class="game-cover-large">
                    <img src="${game.coverImage || '/assets/default-game-cover.png'}" alt="${game.name}"
                         onerror="this.onerror=null; this.src='/assets/default-game-cover.png';">
                </div>
                <div class="game-info-large">
                    <h2>${game.name}</h2>
                    <p class="game-developer">${game.developer || 'Unknown Developer'}</p>
                    <p class="game-release">Released: ${game.releaseDate ? new Date(game.releaseDate).toLocaleDateString() : 'TBA'}</p>
                    <div class="platform-badges">
                        ${platformBadges}
                    </div>
                    <div class="genre-tags">
                        ${genreTags}
                    </div>
                    <div class="game-status">
                        <span class="status ${game.status?.toLowerCase() || 'active'}">${game.status || 'Active'}</span>
                    </div>
                </div>
            </div>
            <div class="game-description">
                <h3>Description</h3>
                <p>${game.description || 'No description available.'}</p>
            </div>
            <div class="game-tournaments">
                <h3>Tournaments for this Game</h3>
                <div id="game-tournaments-list">
                    ${game.Tournaments && game.Tournaments.length > 0 
                        ? game.Tournaments.map(tournament => `
                            <div class="tournament-card">
                                <h3>${tournament.name}</h3>
                                <p>${tournament.description.substring(0, 100)}${tournament.description.length > 100 ? '...' : ''}</p>
                                <div class="tournament-meta">
                                    <span class="status ${tournament.status}">${tournament.status}</span>
                                    <span class="date">From ${new Date(tournament.startDate).toLocaleDateString()} to ${new Date(tournament.endDate).toLocaleDateString()}</span>
                                </div>
                                <button class="btn view-tournament" data-id="${tournament.id}">View Tournament</button>
                            </div>
                        `).join('')
                        : '<p>No tournaments found for this game.</p>'
                    }
                </div>
            </div>
        `;
        
        gamesContainer.appendChild(gameDetails);
        
        // Add event listener for back button
        document.getElementById('back-to-games').addEventListener('click', loadGames);
        
        // Add event listeners for tournament buttons
        document.querySelectorAll('.view-tournament').forEach(button => {
            button.addEventListener('click', (e) => {
                const tournamentId = e.target.getAttribute('data-id');
                
                // Navigate to tournaments section
                document.querySelector('.nav-item[data-section="tournaments"]').click();
                
                // Show tournament details
                window.tournamentsModule.showTournamentDetails(tournamentId);
            });
        });
        
    } catch (error) {
        console.error('Error loading game details:', error);
        document.getElementById('games-container').innerHTML = `
            <div class="error-message">
                <p>Failed to load game details. Please try again.</p>
                <button id="back-to-games" class="btn">Back to Games</button>
            </div>
        `;
        
        document.getElementById('back-to-games').addEventListener('click', loadGames);
    }
}

// Export module
window.gamesModule = {
    loadGames,
    showGameDetails
}; 