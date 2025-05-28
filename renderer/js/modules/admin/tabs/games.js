/**
 * Admin Games Tab Module
 * Handles the games management functionality in the admin panel
 */
let gamesTabInitialized = false;
// Admin Games Tab Module
window.adminGamesTabModule = {
    // Initialize games tab
    initGamesTab: function() {
        if (gamesTabInitialized) return;
        gamesTabInitialized = true;
        console.log('Initializing games tab...');
        
        // Game management elements
        const addGameBtn = document.getElementById('add-game-btn');
        const gameForm = document.getElementById('game-form');
        const gameSearchInput = document.getElementById('game-search');
        const gameFilterSelect = document.getElementById('game-filter');
        
        // Add game button
        if (addGameBtn) {
            addGameBtn.addEventListener('click', () => {
                this.openGameForm();
            });
        }
        
        // Game form submission
        if (gameForm) {
            gameForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveGame();
            });
            
            // Add event listeners for modal close buttons
            const closeButtons = gameForm.querySelectorAll('.close-modal');
            closeButtons.forEach(button => {
                button.addEventListener('click', () => {
                    this.closeGameForm();
                });
            });
        }
        
        // Close modal when clicking outside
        const gameModal = document.getElementById('game-modal');
        if (gameModal) {
            window.addEventListener('click', (e) => {
                if (e.target === gameModal) {
                    this.closeGameForm();
                }
            });
        }
        
        // Game search
        if (gameSearchInput) {
            gameSearchInput.addEventListener('input', () => {
                this.filterGames();
            });
        }
        
        // Game filter
        if (gameFilterSelect) {
            gameFilterSelect.addEventListener('change', () => {
                this.filterGames();
            });
        }
        
        // Game cover image preview
        const gameCoverInput = document.getElementById('game-cover');
        if (gameCoverInput) {
            gameCoverInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const coverPreview = document.getElementById('cover-preview');
                        if (coverPreview) {
                            coverPreview.src = e.target.result;
                            coverPreview.style.display = 'block';
                        }
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        
        // Load games initially
        this.loadGames();
    },
    
    // Load games
    loadGames: async function () {
    const tableBody = document.getElementById('games-table-body');
    tableBody.innerHTML = '';

    try {
        const response = await window.api.getAllGames(); // use your Electron preload API
        const games = response?.data || [];

        if (!Array.isArray(games) || games.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6">No games found</td></tr>`;
        return;
        }

        games.forEach(game => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${game.id}</td>
            <td><img src="${game.logo}" alt="Logo" style="width: 60px; height: 60px; object-fit: cover;"></td>
            <td>${game.date_created?.split(' ')[0] || 'N/A'}</td>
            <td>${game.name}</td>
            <td>${game.status || 'Open'}</td>
            <td><button class="btn-primary">EDIT</button></td>
        `;
        row.querySelector('button')?.addEventListener('click', () => {
            loadGameEditor(game);
        });
        tableBody.appendChild(row);
        });
    } catch (err) {
        console.error('[loadGames Error]', err);
        tableBody.innerHTML = `<tr><td colspan="6">Failed to load games</td></tr>`;
    }
    },

    
    // Filter games
    filterGames: function() {
        const searchTerm = document.getElementById('game-search').value.toLowerCase();
        const filterValue = document.getElementById('game-filter').value;
        
        const rows = document.querySelectorAll('#games-table-body tr');
        
        rows.forEach(row => {
            const name = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
            const developer = row.querySelector('td:nth-child(4)').textContent.toLowerCase();
            const status = row.querySelector('td:nth-child(8)').textContent.toLowerCase();
            
            // Check if the row matches the search term
            const matchesSearch = name.includes(searchTerm) || developer.includes(searchTerm);
            
            // Check if the row matches the filter
            let matchesFilter = true;
            if (filterValue !== 'all') {
                matchesFilter = status === filterValue;
            }
            
            // Show or hide the row
            if (matchesSearch && matchesFilter) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    },
    
    // Open game form
    openGameForm: function(gameData = null) {
        const modal = document.getElementById('game-modal');
        const form = document.getElementById('game-form');
        const formTitle = document.getElementById('game-form-title');
        
        // Reset form
        form.reset();
        
        // Set form title
        formTitle.textContent = gameData ? 'Edit Game' : 'Add New Game';
        
        // Reset cover preview
        const coverPreview = document.getElementById('cover-preview');
        if (coverPreview) {
            coverPreview.src = '';
            coverPreview.style.display = 'none';
        }
        
        // If editing, populate form with game data
        if (gameData) {
            document.getElementById('game-id').value = gameData.id;
            document.getElementById('game-name').value = gameData.name;
            document.getElementById('game-developer').value = gameData.developer;
            
            // Format date for input
            const releaseDate = new Date(gameData.releaseDate);
            const formattedDate = releaseDate.toISOString().split('T')[0];
            document.getElementById('game-release-date').value = formattedDate;
            
            document.getElementById('game-description').value = gameData.description;
            document.getElementById('game-status').value = gameData.status;
            
            // Set platforms
            const platformCheckboxes = document.querySelectorAll('input[name="game-platforms"]');
            platformCheckboxes.forEach(checkbox => {
                checkbox.checked = gameData.platforms.includes(checkbox.value);
            });
            
            // Set genres
            const genreCheckboxes = document.querySelectorAll('input[name="game-genres"]');
            genreCheckboxes.forEach(checkbox => {
                checkbox.checked = gameData.genres.includes(checkbox.value);
            });
            
            // Show cover preview if available
            if (gameData.coverImage) {
                coverPreview.src = gameData.coverImage;
                coverPreview.style.display = 'block';
            }
        } else {
            // Clear game ID for new games
            document.getElementById('game-id').value = '';
        }
        
        // Show modal
        modal.style.display = 'block';
    },
    
    // Close game form
    closeGameForm: function() {
        const modal = document.getElementById('game-modal');
        modal.style.display = 'none';
    },
    
    // Save game
    saveGame: async function() {
        try {
            // Get form data
            const gameId = document.getElementById('game-id').value;
            const name = document.getElementById('game-name').value;
            const developer = document.getElementById('game-developer').value;
            const releaseDate = document.getElementById('game-release-date').value;
            const description = document.getElementById('game-description').value;
            const status = document.getElementById('game-status').value;
            
            // Validate required fields
            if (!name || !developer || !releaseDate || !status) {
                if (window.adminModule) {
                    window.adminModule.showMessage('Please fill in all required fields.', 'error');
                }
                return;
            }
            
            // Get selected platforms
            const platformCheckboxes = document.querySelectorAll('input[name="game-platforms"]:checked');
            const platforms = Array.from(platformCheckboxes).map(cb => cb.value);
            
            // Get selected genres
            const genreCheckboxes = document.querySelectorAll('input[name="game-genres"]:checked');
            const genres = Array.from(genreCheckboxes).map(cb => cb.value);
            
            // Get cover image
            const coverInput = document.getElementById('game-cover');
            let coverImage = '/assets/default-game-cover.png';
            
            if (coverInput.files.length > 0) {
                const file = coverInput.files[0];
                const reader = new FileReader();
                
                // Convert file to base64 for storage
                // In a real app, this would be handled by a file upload service
                coverImage = await new Promise((resolve) => {
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsDataURL(file);
                });
            } else if (document.getElementById('cover-preview').style.display !== 'none') {
                // Keep existing image if editing and no new image selected
                coverImage = document.getElementById('cover-preview').src;
            }
            
            // Create game data object
            const gameData = {
                name,
                developer,
                releaseDate,
                description,
                status,
                platforms,
                genres,
                coverImage
            };
            
            // Add ID if editing
            if (gameId) {
                gameData.id = parseInt(gameId);
            }
            
            // In a real app, this would send data to the backend
            // For now, we'll just simulate a successful save
            
            // Close the form
            this.closeGameForm();
            
            // Show success message
            if (window.adminModule) {
                window.adminModule.showMessage(
                    gameId ? 'Game updated successfully!' : 'Game added successfully!',
                    'success'
                );
            }
            
            // Reload games
            this.loadGames();
            
        } catch (error) {
            console.error('Error saving game:', error);
            if (window.adminModule) {
                window.adminModule.showMessage('Error saving game. Please try again.', 'error');
            }
        }
    },
    
    // Delete game
    deleteGame: async function(gameId) {
        try {
            // In a real app, this would send a delete request to the backend
            // For now, we'll just simulate a successful delete
            
            // Show success message
            if (window.adminModule) {
                window.adminModule.showMessage('Game deleted successfully!', 'success');
            }
            
            // Reload games
            this.loadGames();
            
        } catch (error) {
            console.error('Error deleting game:', error);
            if (window.adminModule) {
                window.adminModule.showMessage('Error deleting game. Please try again.', 'error');
            }
        }
    },
    
    // View game
    viewGame: function(gameId) {
        // In a real app, this would navigate to the game details page
        // For now, we'll just show an alert
        alert(`Viewing game with ID: ${gameId}`);
    },
    
    // Get mock games data
    getMockGames: function() {
        return [
            {
                id: 1,
                name: 'Beat Saber',
                developer: 'Beat Games',
                releaseDate: '2019-05-21',
                description: 'Beat Saber is a VR rhythm game where you slash the beats of adrenaline-pumping music as they fly towards you, surrounded by a futuristic world.',
                status: 'Active',
                platforms: ['Oculus', 'SteamVR', 'PSVR'],
                genres: ['Rhythm', 'Action'],
                tournaments: 5,
                coverImage: 'assets/images/games/beat-saber.jpg'
            },
            {
                id: 2,
                name: 'Half-Life: Alyx',
                developer: 'Valve',
                releaseDate: '2020-03-23',
                description: 'Half-Life: Alyx is Valve\'s VR return to the Half-Life series. It\'s the story of an impossible fight against a vicious alien race known as the Combine.',
                status: 'Active',
                platforms: ['SteamVR'],
                genres: ['FPS', 'Action', 'Adventure'],
                tournaments: 3,
                coverImage: 'assets/images/games/half-life-alyx.jpg'
            },
            {
                id: 3,
                name: 'Superhot VR',
                developer: 'SUPERHOT Team',
                releaseDate: '2016-12-05',
                description: 'SUPERHOT VR is a virtual reality adaptation of SUPERHOT, a first-person shooter video game where time moves only when the player moves.',
                status: 'Active',
                platforms: ['Oculus', 'SteamVR', 'PSVR'],
                genres: ['FPS', 'Action', 'Puzzle'],
                tournaments: 2,
                coverImage: 'assets/images/games/superhot-vr.jpg'
            },
            {
                id: 4,
                name: 'Pistol Whip',
                developer: 'Cloudhead Games',
                releaseDate: '2019-11-07',
                description: 'Pistol Whip is an unstoppable action-rhythm FPS. Journey through a cinematic bullet hell powered by a breakneck soundtrack to become the ultimate action hero legend.',
                status: 'Active',
                platforms: ['Oculus', 'SteamVR', 'PSVR'],
                genres: ['Rhythm', 'Action', 'FPS'],
                tournaments: 1,
                coverImage: 'assets/images/games/pistol-whip.jpg'
            },
            {
                id: 5,
                name: 'The Walking Dead: Saints & Sinners',
                developer: 'Skydance Interactive',
                releaseDate: '2020-01-23',
                description: 'Saints & Sinners is a game unlike any other in The Walking Dead universe. Every challenge you face and decision you make is driven by YOU.',
                status: 'Active',
                platforms: ['Oculus', 'SteamVR', 'PSVR'],
                genres: ['Survival', 'Horror', 'Action'],
                tournaments: 0,
                coverImage: 'assets/images/games/walking-dead-saints-sinners.jpg'
            },
            {
                id: 6,
                name: 'VR Chat',
                developer: 'VRChat Inc.',
                releaseDate: '2017-02-01',
                description: 'VRChat offers an endless collection of social VR experiences by giving the power of creation to its community.',
                status: 'Inactive',
                platforms: ['Oculus', 'SteamVR'],
                genres: ['Social', 'Casual'],
                tournaments: 0,
                coverImage: 'assets/images/games/vrchat.jpg'
            }
        ];
    }
}; 