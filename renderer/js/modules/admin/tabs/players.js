/**
 * Admin Players Tab Module
 * Handles the players management functionality in the admin panel
 */

// Admin Players Tab Module
window.adminPlayersTabModule = {
    // Initialize players tab
    initPlayersTab: function() {
        console.log('Initializing players tab...');
        
        // Player search
        const playerSearchInput = document.getElementById('player-search');
        if (playerSearchInput) {
            playerSearchInput.addEventListener('input', () => {
                this.filterPlayers();
            });
        }
        
        // Player status filter
        const playerStatusFilter = document.getElementById('player-status-filter');
        if (playerStatusFilter) {
            playerStatusFilter.addEventListener('change', () => {
                this.filterPlayers();
            });
        }
        
        // Load players initially
        this.loadPlayers();
    },
    
    // Load players
    loadPlayers: async function() {
        try {
            // Fetch players from the backend
            const response = await fetch('http://localhost:3000/api/players');
            
            // If the API endpoint doesn't exist yet, use mock data
            let players;
            if (response.ok) {
                players = await response.json();
            } else {
                // Mock data for development
                players = this.getMockPlayers();
            }
            
            // Update players table
            const playersTable = document.getElementById('players-table-body');
            if (playersTable) {
                if (players.length === 0) {
                    playersTable.innerHTML = '<tr><td colspan="7" class="empty-state">No players found</td></tr>';
                    return;
                }
                
                let html = '';
                players.forEach(player => {
                    // Format join date
                    const joinDate = new Date(player.joinDate);
                    const formattedJoinDate = joinDate.toLocaleDateString();
                    
                    // Status class
                    const statusClass = player.status.toLowerCase();
                    
                    html += `
                        <tr data-player-id="${player.id}">
                            <td>${player.id}</td>
                            <td>
                                <img src="${player.avatar || 'assets/images/default-avatar.jpg'}" alt="${player.username}" class="player-avatar-thumb">
                                ${player.username}
                            </td>
                            <td>${player.email}</td>
                            <td>${formattedJoinDate}</td>
                            <td>${player.tournaments}</td>
                            <td><span class="status-badge ${statusClass}">${player.status}</span></td>
                            <td class="actions">
                                <button class="edit-player-btn" data-player-id="${player.id}">Edit</button>
                                <button class="view-player-btn" data-player-id="${player.id}">View</button>
                            </td>
                        </tr>
                    `;
                });
                
                playersTable.innerHTML = html;
                
                // Add event listeners to action buttons
                document.querySelectorAll('.edit-player-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const playerId = e.target.getAttribute('data-player-id');
                        const player = players.find(p => p.id.toString() === playerId);
                        if (player) {
                            this.editPlayer(player);
                        }
                    });
                });
                
                document.querySelectorAll('.view-player-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const playerId = e.target.getAttribute('data-player-id');
                        this.viewPlayer(playerId);
                    });
                });
            }
        } catch (error) {
            console.error('Error loading players:', error);
            if (window.adminModule) {
                window.adminModule.showMessage('Error loading players. Please try again.', 'error');
            }
        }
    },
    
    // Filter players
    filterPlayers: function() {
        const searchTerm = document.getElementById('player-search').value.toLowerCase();
        const statusFilter = document.getElementById('player-status-filter').value;
        
        const rows = document.querySelectorAll('#players-table-body tr');
        
        rows.forEach(row => {
            const username = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
            const email = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
            const status = row.querySelector('td:nth-child(6) span').textContent.toLowerCase();
            
            // Check if the row matches the search term
            const matchesSearch = username.includes(searchTerm) || email.includes(searchTerm);
            
            // Check if the row matches the filter
            let matchesFilter = true;
            if (statusFilter !== 'all') {
                matchesFilter = status === statusFilter;
            }
            
            // Show or hide the row
            if (matchesSearch && matchesFilter) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    },
    
    // Edit player
    editPlayer: function(playerData) {
        // In a real implementation, this would open a modal with a form
        // For now, we'll just show an alert
        alert(`Edit player: ${playerData.username}`);
    },
    
    // View player
    viewPlayer: function(playerId) {
        // In a real app, this would navigate to the player details page
        // For now, we'll just show an alert
        alert(`Viewing player with ID: ${playerId}`);
    },
    
    // Get mock players data
    getMockPlayers: function() {
        return [
            {
                id: 1,
                username: 'VRMaster',
                email: 'vrmaster@example.com',
                joinDate: '2022-01-15',
                tournaments: 12,
                status: 'Active',
                avatar: 'assets/images/avatars/avatar1.jpg'
            },
            {
                id: 2,
                username: 'BeatSaberPro',
                email: 'beatsaber@example.com',
                joinDate: '2022-02-20',
                tournaments: 8,
                status: 'Active',
                avatar: 'assets/images/avatars/avatar2.jpg'
            },
            {
                id: 3,
                username: 'VRGamer123',
                email: 'vrgamer@example.com',
                joinDate: '2022-03-10',
                tournaments: 5,
                status: 'Inactive',
                avatar: 'assets/images/avatars/avatar3.jpg'
            },
            {
                id: 4,
                username: 'AlixFan',
                email: 'alixfan@example.com',
                joinDate: '2022-04-05',
                tournaments: 3,
                status: 'Active',
                avatar: 'assets/images/avatars/avatar4.jpg'
            },
            {
                id: 5,
                username: 'SuperhotPlayer',
                email: 'superhot@example.com',
                joinDate: '2022-05-12',
                tournaments: 2,
                status: 'Active',
                avatar: 'assets/images/avatars/avatar5.jpg'
            },
            {
                id: 6,
                username: 'VRNewbie',
                email: 'vrnewbie@example.com',
                joinDate: '2022-06-18',
                tournaments: 0,
                status: 'Pending',
                avatar: 'assets/images/avatars/avatar6.jpg'
            },
            {
                id: 7,
                username: 'TournamentKing',
                email: 'tournamentking@example.com',
                joinDate: '2022-07-22',
                tournaments: 15,
                status: 'Active',
                avatar: 'assets/images/avatars/avatar7.jpg'
            },
            {
                id: 8,
                username: 'VRExplorer',
                email: 'vrexplorer@example.com',
                joinDate: '2022-08-30',
                tournaments: 1,
                status: 'Inactive',
                avatar: 'assets/images/avatars/avatar8.jpg'
            }
        ];
    }
}; 