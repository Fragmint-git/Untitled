// Admin Panel JavaScript

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    // Navigation elements
    const adminMenuLinks = document.querySelectorAll('.admin-menu a');
    const adminSections = document.querySelectorAll('.admin-section');
    
    // Game management elements
    const addGameBtn = document.getElementById('add-game-btn');
    const gameFormModal = document.getElementById('game-form-modal');
    const gameForm = document.getElementById('game-form');
    const cancelGameFormBtn = document.getElementById('cancel-game-form');
    const gameSearchInput = document.getElementById('admin-game-search');
    const gameFilterSelect = document.getElementById('admin-game-filter');
    
    // Confirmation modal elements
    const confirmModal = document.getElementById('confirm-modal');
    const confirmYesBtn = document.getElementById('confirm-yes');
    const confirmNoBtn = document.getElementById('confirm-no');
    
    // Admin logout button
    const logoutBtn = document.getElementById('admin-logout');
    
    // Initialize admin panel
    initAdminPanel();
    
    // Admin navigation
    adminMenuLinks.forEach(link => {
        if (!link.classList.contains('back-to-app')) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Get the section id from the data attribute
                const sectionId = link.getAttribute('data-admin-section');
                
                // Hide all sections
                adminSections.forEach(section => {
                    section.classList.remove('active');
                });
                
                // Show the selected section
                document.getElementById(`admin-${sectionId}`).classList.add('active');
                
                // Update active menu item
                adminMenuLinks.forEach(menuItem => {
                    menuItem.classList.remove('active');
                });
                link.classList.add('active');
                
                // Load section data if needed
                if (sectionId === 'games') {
                    loadGames();
                } else if (sectionId === 'tournaments') {
                    // loadTournaments(); // Would be implemented similarly
                } else if (sectionId === 'players') {
                    // loadPlayers(); // Would be implemented similarly
                }
            });
        }
    });
    
    // Add Game button
    if (addGameBtn) {
        addGameBtn.addEventListener('click', () => {
            openGameForm();
        });
    }
    
    // Game form submission
    if (gameForm) {
        gameForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveGame();
        });
    }
    
    // Cancel game form button
    if (cancelGameFormBtn) {
        cancelGameFormBtn.addEventListener('click', () => {
            closeGameForm();
        });
    }
    
    // Close modal when clicking on X
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            gameFormModal.style.display = 'none';
            confirmModal.style.display = 'none';
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === gameFormModal) {
            gameFormModal.style.display = 'none';
        }
        if (e.target === confirmModal) {
            confirmModal.style.display = 'none';
        }
    });
    
    // Game search and filter
    if (gameSearchInput) {
        gameSearchInput.addEventListener('input', filterGames);
    }
    
    if (gameFilterSelect) {
        gameFilterSelect.addEventListener('change', filterGames);
    }
    
    // Confirmation modal buttons
    if (confirmYesBtn) {
        confirmYesBtn.addEventListener('click', () => {
            if (window.currentConfirmCallback) {
                window.currentConfirmCallback();
            }
            confirmModal.style.display = 'none';
        });
    }
    
    if (confirmNoBtn) {
        confirmNoBtn.addEventListener('click', () => {
            confirmModal.style.display = 'none';
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
                    document.getElementById('cover-preview-image').src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Admin logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // In a real app, this would handle logout logic
            showConfirmModal(
                'Confirm Logout',
                'Are you sure you want to logout?',
                () => {
                    // Redirect to login page
                    window.location.href = '../index.html';
                }
            );
        });
    }
});

// Initialize admin panel
async function initAdminPanel() {
    try {
        // Load admin dashboard data
        await updateAdminDashboard();
        
        // Load initial games data
        await loadGames();
        
        console.log('Admin panel initialized successfully');
    } catch (error) {
        console.error('Error initializing admin panel:', error);
        showMessage('Error initializing admin panel', 'error');
    }
}

// Update admin dashboard
async function updateAdminDashboard() {
    try {
        // Fetch dashboard data from the backend
        const response = await fetch('http://localhost:3000/api/dashboard');
        
        // If the API endpoint doesn't exist yet, use mock data
        let dashboardData;
        if (response.ok) {
            dashboardData = await response.json();
        } else {
            // Mock data for development
            dashboardData = {
                totalGames: 12,
                totalTournaments: 25,
                totalPlayers: 156,
                activeTournaments: 8,
                recentActivity: [
                    {
                        type: 'add',
                        entity: 'game',
                        name: 'Beat Saber',
                        user: 'Admin',
                        time: '2023-02-24T15:30:00'
                    },
                    {
                        type: 'edit',
                        entity: 'tournament',
                        name: 'VR Championship 2023',
                        user: 'Admin',
                        time: '2023-02-24T14:15:00'
                    },
                    {
                        type: 'delete',
                        entity: 'game',
                        name: 'Outdated Game',
                        user: 'Admin',
                        time: '2023-02-23T11:45:00'
                    }
                ]
            };
        }
        
        // Update dashboard stats
        document.getElementById('total-games-count').textContent = dashboardData.totalGames;
        document.getElementById('total-tournaments-count').textContent = dashboardData.totalTournaments;
        document.getElementById('total-players-count').textContent = dashboardData.totalPlayers;
        document.getElementById('active-tournaments-count').textContent = dashboardData.activeTournaments;
        
        // Update recent activity
        const activityList = document.getElementById('recent-activity-list');
        if (activityList) {
            if (dashboardData.recentActivity.length === 0) {
                activityList.innerHTML = '<p class="empty-state">No recent activity</p>';
                return;
            }
            
            let html = '';
            dashboardData.recentActivity.forEach(activity => {
                const date = new Date(activity.time);
                const formattedTime = date.toLocaleString();
                
                html += `
                    <div class="activity-item">
                        <div class="activity-icon ${activity.type}">
                            ${getActivityIcon(activity.type)}
                        </div>
                        <div class="activity-details">
                            <p><strong>${activity.user}</strong> ${getActivityText(activity)}</p>
                            <p class="activity-time">${formattedTime}</p>
                        </div>
                    </div>
                `;
            });
            
            activityList.innerHTML = html;
        }
    } catch (error) {
        console.error('Error updating admin dashboard:', error);
    }
}

// Get activity icon
function getActivityIcon(type) {
    switch (type) {
        case 'add':
            return '+';
        case 'edit':
            return '✎';
        case 'delete':
            return '×';
        default:
            return '•';
    }
}

// Get activity text
function getActivityText(activity) {
    switch (activity.type) {
        case 'add':
            return `added a new ${activity.entity}: <strong>${activity.name}</strong>`;
        case 'edit':
            return `updated ${activity.entity}: <strong>${activity.name}</strong>`;
        case 'delete':
            return `deleted ${activity.entity}: <strong>${activity.name}</strong>`;
        default:
            return `performed an action on ${activity.entity}: <strong>${activity.name}</strong>`;
    }
}

// Load games
async function loadGames() {
    try {
        const gamesTableBody = document.getElementById('games-table-body');
        
        // Fetch games from the backend
        const response = await fetch('http://localhost:3000/api/games');
        
        let games;
        if (response.ok) {
            games = await response.json();
        } else {
            // Use mock data if API fails
            games = await getMockGames();
        }
        
        if (games.length === 0) {
            gamesTableBody.innerHTML = '<tr><td colspan="9" class="empty-table">No games available</td></tr>';
            return;
        }
        
        let html = '';
        games.forEach(game => {
            const releaseDate = new Date(game.releaseDate).toLocaleDateString();
            const platforms = Array.isArray(game.platforms) ? game.platforms.join(', ') : '';
            const statusClass = `status-${game.status.toLowerCase()}`;
            
            // Use a default image if no cover image is available
            const coverImage = game.coverImage || '../assets/default-game-cover.png';
            
            html += `
                <tr data-id="${game.id}" data-game='${JSON.stringify(game)}'>
                    <td>${game.id}</td>
                    <td><img src="${coverImage}" alt="${game.name}" class="table-image"></td>
                    <td>${game.name}</td>
                    <td>${game.developer}</td>
                    <td>${releaseDate}</td>
                    <td>${platforms}</td>
                    <td>${game.tournamentCount || 0}</td>
                    <td><span class="status-badge ${statusClass}">${game.status}</span></td>
                    <td>
                        <div class="table-actions">
                            <button class="action-btn edit-btn" data-id="${game.id}">Edit</button>
                            <button class="action-btn delete-btn" data-id="${game.id}">Delete</button>
                            <button class="action-btn view-btn" data-id="${game.id}">View</button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        gamesTableBody.innerHTML = html;
        
        // Add event listeners to action buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const gameId = btn.getAttribute('data-id');
                const gameRow = document.querySelector(`tr[data-id="${gameId}"]`);
                const gameData = JSON.parse(gameRow.getAttribute('data-game'));
                openGameForm(gameData);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const gameId = btn.getAttribute('data-id');
                const gameRow = document.querySelector(`tr[data-id="${gameId}"]`);
                const gameData = JSON.parse(gameRow.getAttribute('data-game'));
                
                showConfirmModal(
                    'Confirm Delete',
                    `Are you sure you want to delete the game "${gameData.name}"?`,
                    () => deleteGame(gameId)
                );
            });
        });
        
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const gameId = btn.getAttribute('data-id');
                viewGame(gameId);
            });
        });
        
    } catch (error) {
        console.error('Error loading games:', error);
        const gamesTableBody = document.getElementById('games-table-body');
        gamesTableBody.innerHTML = '<tr><td colspan="9" class="empty-table error">Error loading games. Please try again.</td></tr>';
    }
}

// Filter games
function filterGames() {
    const searchTerm = document.getElementById('admin-game-search').value.toLowerCase();
    const filterValue = document.getElementById('admin-game-filter').value;
    
    const rows = document.querySelectorAll('#games-table-body tr');
    
    rows.forEach(row => {
        if (row.classList.contains('empty-table')) return;
        
        const gameData = JSON.parse(row.getAttribute('data-game'));
        
        const matchesSearch = 
            gameData.name.toLowerCase().includes(searchTerm) || 
            gameData.developer.toLowerCase().includes(searchTerm);
        
        const matchesFilter = 
            filterValue === 'all' || 
            gameData.status.toLowerCase() === filterValue;
        
        if (matchesSearch && matchesFilter) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
    
    // Check if all rows are hidden
    const visibleRows = document.querySelectorAll('#games-table-body tr:not([style*="display: none"])');
    const emptyTableRow = document.querySelector('#games-table-body .empty-table');
    
    if (visibleRows.length === 0 && !emptyTableRow) {
        const gamesTableBody = document.getElementById('games-table-body');
        const emptyRow = document.createElement('tr');
        emptyRow.className = 'empty-table';
        emptyRow.innerHTML = '<td colspan="9" class="empty-table">No games match your search criteria</td>';
        gamesTableBody.appendChild(emptyRow);
    } else if (visibleRows.length > 0 && emptyTableRow) {
        emptyTableRow.remove();
    }
}

// Open game form
function openGameForm(gameData = null) {
    const modal = document.getElementById('game-form-modal');
    const form = document.getElementById('game-form');
    const formTitle = document.getElementById('game-form-title');
    
    // Reset form
    form.reset();
    document.getElementById('cover-preview-image').src = '../assets/default-game-cover.png';
    
    // Set form title
    if (gameData) {
        formTitle.textContent = 'Edit Game';
    } else {
        formTitle.textContent = 'Add New Game';
    }
    
    // Populate form if editing
    if (gameData) {
        document.getElementById('game-id').value = gameData.id;
        document.getElementById('game-name').value = gameData.name;
        document.getElementById('game-developer').value = gameData.developer;
        document.getElementById('game-release-date').value = new Date(gameData.releaseDate).toISOString().split('T')[0];
        document.getElementById('game-description').value = gameData.description;
        document.getElementById('game-status').value = gameData.status.toLowerCase();
        
        // Set cover image if available
        if (gameData.coverImage) {
            document.getElementById('cover-preview-image').src = gameData.coverImage;
        }
        
        // Set platforms
        if (Array.isArray(gameData.platforms)) {
            gameData.platforms.forEach(platform => {
                const checkbox = document.getElementById(`platform-${platform.toLowerCase()}`);
                if (checkbox) checkbox.checked = true;
            });
        }
        
        // Set genres
        if (Array.isArray(gameData.genres)) {
            gameData.genres.forEach(genre => {
                const checkbox = document.getElementById(`genre-${genre.toLowerCase()}`);
                if (checkbox) checkbox.checked = true;
            });
        }
    }
    
    // Show modal
    modal.style.display = 'block';
}

// Close game form
function closeGameForm() {
    const modal = document.getElementById('game-form-modal');
    modal.style.display = 'none';
}

// Save game
async function saveGame() {
    try {
        const form = document.getElementById('game-form');
        const formData = new FormData(form);
        
        // Get form values
        const gameId = formData.get('id');
        const name = formData.get('name');
        const developer = formData.get('developer');
        const releaseDate = formData.get('releaseDate');
        const description = formData.get('description');
        const status = formData.get('status');
        
        // Get platforms (multiple checkboxes)
        const platforms = [];
        document.querySelectorAll('input[name="platforms"]:checked').forEach(checkbox => {
            platforms.push(checkbox.value);
        });
        
        // Get genres (multiple checkboxes)
        const genres = [];
        document.querySelectorAll('input[name="genres"]:checked').forEach(checkbox => {
            genres.push(checkbox.value);
        });
        
        // Get cover image file
        const coverImageFile = document.getElementById('game-cover').files[0];
        
        // Validate form
        if (!name || !developer || !releaseDate || !description || platforms.length === 0 || genres.length === 0) {
            showMessage('Please fill in all required fields', 'error');
            return;
        }
        
        // Handle image upload first if there's a new image
        let coverImagePath = null;
        if (coverImageFile) {
            const imageFormData = new FormData();
            imageFormData.append('image', coverImageFile);
            
            const uploadResponse = await fetch('http://localhost:3000/api/upload/game-image', {
                method: 'POST',
                body: imageFormData
            });
            
            if (!uploadResponse.ok) {
                throw new Error('Failed to upload image');
            }
            
            const uploadResult = await uploadResponse.json();
            coverImagePath = uploadResult.imagePath;
        }
        
        // Create game object
        const gameData = {
            name,
            developer,
            releaseDate,
            description,
            platforms,
            genres,
            status
        };
        
        // Add cover image path if available
        if (coverImagePath) {
            gameData.coverImage = coverImagePath;
        } else if (!coverImageFile && gameId) {
            // Keep existing image if editing and no new image was selected
            const existingGame = JSON.parse(document.querySelector(`tr[data-id="${gameId}"]`).getAttribute('data-game'));
            if (existingGame.coverImage) {
                gameData.coverImage = existingGame.coverImage;
            }
        }
        
        let response;
        
        if (gameId) {
            // Update existing game
            response = await fetch(`http://localhost:3000/api/games/${gameId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(gameData)
            });
        } else {
            // Add new game
            response = await fetch('http://localhost:3000/api/games', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(gameData)
            });
        }
        
        if (!response.ok) {
            throw new Error(gameId ? 'Failed to update game' : 'Failed to add game');
        }
        
        // Close form and reload games
        closeGameForm();
        await loadGames();
        
        showMessage(gameId ? 'Game updated successfully' : 'Game added successfully', 'success');
        
    } catch (error) {
        console.error('Error saving game:', error);
        showMessage(`Error saving game: ${error.message}`, 'error');
    }
}

// Delete game
async function deleteGame(gameId) {
    try {
        const response = await fetch(`http://localhost:3000/api/games/${gameId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete game');
        }
        
        // Reload games
        await loadGames();
        
        showMessage('Game deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting game:', error);
        showMessage(`Error deleting game: ${error.message}`, 'error');
    }
}

// View game
function viewGame(gameId) {
    // In a real app, this would navigate to the game details page
    // For now, we'll just show an alert
    alert(`View game ${gameId}`);
}

// Show confirmation modal
function showConfirmModal(title, message, callback) {
    const modal = document.getElementById('confirm-modal');
    const titleElement = document.getElementById('confirm-title');
    const messageElement = document.getElementById('confirm-message');
    
    titleElement.textContent = title;
    messageElement.textContent = message;
    
    // Store callback for use when confirmed
    window.currentConfirmCallback = callback;
    
    modal.style.display = 'block';
}

// Show message
function showMessage(message, type = 'info') {
    // Create toast element if it doesn't exist
    let toast = document.getElementById('toast-message');
    
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-message';
        document.body.appendChild(toast);
        
        // Add toast styles if they don't exist
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                #toast-message {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    padding: 12px 20px;
                    border-radius: 4px;
                    color: white;
                    font-size: 16px;
                    z-index: 1000;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                    opacity: 0;
                    transform: translateY(20px);
                }
                #toast-message.visible {
                    opacity: 1;
                    transform: translateY(0);
                }
                #toast-message.success {
                    background-color: #4CAF50;
                }
                #toast-message.error {
                    background-color: #F44336;
                }
                #toast-message.info {
                    background-color: #2196F3;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Set message and type
    toast.textContent = message;
    toast.className = type;
    
    // Show the toast
    setTimeout(() => {
        toast.classList.add('visible');
    }, 10);
    
    // Hide after delay
    setTimeout(() => {
        toast.classList.remove('visible');
    }, 3000);
}

// Mock data functions (would be replaced with actual API calls)

// Get mock games
async function getMockGames() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Return mock data
    return [
        {
            id: '1',
            name: 'Beat Saber',
            developer: 'Beat Games',
            releaseDate: '2018-05-01',
            description: 'Beat Saber is a VR rhythm game where you slash the beats of adrenaline-pumping music as they fly towards you, surrounded by a futuristic world.',
            platforms: ['Oculus', 'Vive', 'Index', 'PSVR'],
            genres: ['Rhythm', 'Action'],
            coverImage: '../assets/default-game-cover.png',
            status: 'Active',
            tournamentCount: 8
        },
        {
            id: '2',
            name: 'Superhot VR',
            developer: 'SUPERHOT Team',
            releaseDate: '2016-12-05',
            description: 'SUPERHOT VR is a virtual reality adaptation of SUPERHOT, where time moves only when you move.',
            platforms: ['Oculus', 'Vive', 'PSVR'],
            genres: ['Action', 'Shooter'],
            coverImage: '../assets/default-game-cover.png',
            status: 'Active',
            tournamentCount: 5
        },
        {
            id: '3',
            name: 'Pistol Whip',
            developer: 'Cloudhead Games',
            releaseDate: '2019-11-07',
            description: 'Pistol Whip is an action-rhythm FPS where you shoot, dodge, and dance your way through a cinematic bullet hell.',
            platforms: ['Oculus', 'Vive', 'Index'],
            genres: ['Action', 'Rhythm', 'Shooter'],
            coverImage: '../assets/default-game-cover.png',
            status: 'Active',
            tournamentCount: 3
        },
        {
            id: '4',
            name: 'Half-Life: Alyx',
            developer: 'Valve',
            releaseDate: '2020-03-23',
            description: 'Half-Life: Alyx is a VR return to the Half-Life series where you play as Alyx Vance in a fight against the Combine.',
            platforms: ['Vive', 'Index', 'Oculus'],
            genres: ['Action', 'Shooter'],
            coverImage: '../assets/default-game-cover.png',
            status: 'Active',
            tournamentCount: 2
        },
        {
            id: '5',
            name: 'VR Puzzle Game',
            developer: 'Indie Studio',
            releaseDate: '2021-06-15',
            description: 'A challenging puzzle game designed specifically for virtual reality.',
            platforms: ['Oculus', 'Vive'],
            genres: ['Puzzle'],
            coverImage: '../assets/default-game-cover.png',
            status: 'Inactive',
            tournamentCount: 0
        }
    ];
} 