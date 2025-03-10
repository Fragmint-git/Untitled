/**
 * Players Module
 * Handles player functionality and data loading
 */

// Load players from database
async function loadPlayers() {
    try {
        const playersContainer = document.getElementById('players-container');
        playersContainer.innerHTML = '<div class="loading">Loading players...</div>';
        
        const players = await window.api.getPlayers();
        
        // Clear the loading message
        playersContainer.innerHTML = '';
        
        // Add player creation button
        const createButtonContainer = document.createElement('div');
        createButtonContainer.className = 'create-button-container';
        createButtonContainer.innerHTML = `
            <button id="create-player-btn" class="btn primary">Add New Player</button>
        `;
        playersContainer.appendChild(createButtonContainer);
        
        // Add player filters
        const filtersContainer = document.createElement('div');
        filtersContainer.className = 'filters-container';
        filtersContainer.innerHTML = `
            <div class="search-container">
                <input type="text" id="player-search" placeholder="Search players...">
            </div>
            <div class="filter-options">
                <select id="player-status-filter">
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="banned">Banned</option>
                </select>
            </div>
        `;
        playersContainer.appendChild(filtersContainer);
        
        // Create players list
        const playersListContainer = document.createElement('div');
        playersListContainer.className = 'players-list';
        playersListContainer.id = 'players-list';
        
        if (players.length === 0) {
            playersListContainer.innerHTML = `
                <div class="empty-state">
                    <h3>No Players Found</h3>
                    <p>Get started by adding your first player!</p>
                </div>
            `;
        } else {
            // Create a table for players
            const playersTable = document.createElement('table');
            playersTable.className = 'players-table';
            playersTable.innerHTML = `
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Display Name</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${players.map(player => `
                        <tr data-id="${player.id}" data-status="${player.status}">
                            <td>${player.username}</td>
                            <td>${player.displayName || '-'}</td>
                            <td>${player.email || '-'}</td>
                            <td><span class="status ${player.status}">${player.status}</span></td>
                            <td>
                                <button class="btn small view-player" data-id="${player.id}">View</button>
                                <button class="btn small edit-player" data-id="${player.id}">Edit</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
            
            playersListContainer.appendChild(playersTable);
        }
        
        playersContainer.appendChild(playersListContainer);
        
        // Add event listeners
        document.getElementById('create-player-btn').addEventListener('click', showCreatePlayerForm);
        
        document.querySelectorAll('.view-player').forEach(button => {
            button.addEventListener('click', (e) => {
                const playerId = e.target.getAttribute('data-id');
                showPlayerDetails(playerId);
            });
        });
        
        document.querySelectorAll('.edit-player').forEach(button => {
            button.addEventListener('click', (e) => {
                const playerId = e.target.getAttribute('data-id');
                showEditPlayerForm(playerId);
            });
        });
        
        // Add search and filter functionality
        document.getElementById('player-search').addEventListener('input', filterPlayers);
        document.getElementById('player-status-filter').addEventListener('change', filterPlayers);
        
    } catch (error) {
        console.error('Error loading players:', error);
        document.getElementById('players-container').innerHTML = `
            <div class="error-message">
                <p>Failed to load players. Please try again.</p>
                <button id="retry-load-players" class="btn">Retry</button>
            </div>
        `;
        
        document.getElementById('retry-load-players').addEventListener('click', loadPlayers);
    }
}

// Function to filter players based on search and filter criteria
function filterPlayers() {
    const searchTerm = document.getElementById('player-search').value.toLowerCase();
    const statusFilter = document.getElementById('player-status-filter').value;
    
    const playerRows = document.querySelectorAll('.players-table tbody tr');
    
    playerRows.forEach(row => {
        const username = row.cells[0].textContent.toLowerCase();
        const displayName = row.cells[1].textContent.toLowerCase();
        const email = row.cells[2].textContent.toLowerCase();
        const status = row.getAttribute('data-status');
        
        const matchesSearch = username.includes(searchTerm) || 
                             displayName.includes(searchTerm) || 
                             email.includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || status === statusFilter;
        
        if (matchesSearch && matchesStatus) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
    
    // Show empty state if no players match the filters
    const visiblePlayers = document.querySelectorAll('.players-table tbody tr[style=""]');
    const emptyState = document.querySelector('.empty-state');
    
    if (visiblePlayers.length === 0 && !emptyState) {
        const playersListContainer = document.getElementById('players-list');
        
        // Clear the table if it exists
        const existingTable = playersListContainer.querySelector('.players-table');
        if (existingTable) {
            existingTable.style.display = 'none';
        }
        
        // Add empty state message
        const emptyStateDiv = document.createElement('div');
        emptyStateDiv.className = 'empty-state';
        emptyStateDiv.innerHTML = `
            <h3>No Players Match Your Filters</h3>
            <p>Try adjusting your search criteria.</p>
        `;
        playersListContainer.appendChild(emptyStateDiv);
    } else if (visiblePlayers.length > 0 && emptyState) {
        emptyState.remove();
        
        // Show the table again if it was hidden
        const existingTable = document.querySelector('.players-table');
        if (existingTable) {
            existingTable.style.display = '';
        }
    }
}

// Function to show the create player form
function showCreatePlayerForm() {
    const playersContainer = document.getElementById('players-container');
    playersContainer.innerHTML = '';
    
    const formContainer = document.createElement('div');
    formContainer.className = 'form-container';
    formContainer.innerHTML = `
        <div class="back-button-container">
            <button id="back-to-players" class="btn">← Back to Players</button>
        </div>
        <h2>Add New Player</h2>
        <form id="create-player-form">
            <div class="form-group">
                <label for="player-username">Username</label>
                <input type="text" id="player-username" name="username" required>
            </div>
            <div class="form-group">
                <label for="player-displayName">Display Name</label>
                <input type="text" id="player-displayName" name="displayName">
            </div>
            <div class="form-group">
                <label for="player-email">Email</label>
                <input type="email" id="player-email" name="email">
            </div>
            <div class="form-actions">
                <button type="button" id="cancel-create-player" class="btn">Cancel</button>
                <button type="submit" class="btn primary">Add Player</button>
            </div>
        </form>
    `;
    
    playersContainer.appendChild(formContainer);
    
    // Add event listeners
    document.getElementById('back-to-players').addEventListener('click', loadPlayers);
    document.getElementById('cancel-create-player').addEventListener('click', loadPlayers);
    
    document.getElementById('create-player-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const playerData = {
            username: formData.get('username'),
            displayName: formData.get('displayName'),
            email: formData.get('email'),
            status: 'active' // Default status
        };
        
        try {
            const newPlayer = await window.api.createPlayer(playerData);
            window.uiModule.showNotification('Player added successfully!', 'success');
            loadPlayers();
        } catch (error) {
            console.error('Error adding player:', error);
            window.uiModule.showNotification('Failed to add player', 'error');
        }
    });
}

// Function to show player details
function showPlayerDetails(playerId) {
    // Implementation will be added later
    window.uiModule.showNotification('Player details functionality coming soon', 'info');
}

// Function to show edit player form
function showEditPlayerForm(playerId) {
    // Implementation will be added later
    window.uiModule.showNotification('Edit player functionality coming soon', 'info');
}

// Export module
window.playersModule = {
    loadPlayers,
    showCreatePlayerForm,
    showPlayerDetails,
    showEditPlayerForm
}; 