/**
 * Admin Tournaments Tab Module
 * Handles the tournaments management functionality in the admin panel
 */

// Admin Tournaments Tab Module
window.adminTournamentsTabModule = {
    // Initialize tournaments tab
    initTournamentsTab: function() {
        console.log('Initializing tournaments tab...');
        
        // Add tournament button
        const addTournamentBtn = document.getElementById('add-tournament-btn');
        if (addTournamentBtn) {
            addTournamentBtn.addEventListener('click', () => {
                this.openTournamentForm();
            });
        }
        
        // Load tournaments initially
        this.loadTournaments();
    },
    
    // Load tournaments
    loadTournaments: async function() {
        try {
            // Fetch tournaments from the backend
            const response = await fetch('http://localhost:3000/api/tournaments');
            
            // If the API endpoint doesn't exist yet, use mock data
            let tournaments;
            if (response.ok) {
                tournaments = await response.json();
            } else {
                // Mock data for development
                tournaments = this.getMockTournaments();
            }
            
            // Update tournaments table
            const tournamentsTable = document.getElementById('tournaments-table-body');
            if (tournamentsTable) {
                if (tournaments.length === 0) {
                    tournamentsTable.innerHTML = '<tr><td colspan="8" class="empty-state">No tournaments found</td></tr>';
                    return;
                }
                
                let html = '';
                tournaments.forEach(tournament => {
                    // Format dates
                    const startDate = new Date(tournament.startDate);
                    const endDate = new Date(tournament.endDate);
                    const formattedStartDate = startDate.toLocaleDateString();
                    const formattedEndDate = endDate.toLocaleDateString();
                    
                    // Status class
                    const statusClass = tournament.status.toLowerCase();
                    
                    html += `
                        <tr data-tournament-id="${tournament.id}">
                            <td>${tournament.id}</td>
                            <td>${tournament.name}</td>
                            <td>${tournament.game}</td>
                            <td>${formattedStartDate}</td>
                            <td>${formattedEndDate}</td>
                            <td>${tournament.players}/${tournament.maxPlayers}</td>
                            <td><span class="status-badge ${statusClass}">${tournament.status}</span></td>
                            <td class="actions">
                                <button class="edit-tournament-btn" data-tournament-id="${tournament.id}">Edit</button>
                                <button class="delete-tournament-btn" data-tournament-id="${tournament.id}">Delete</button>
                                <button class="view-tournament-btn" data-tournament-id="${tournament.id}">View</button>
                            </td>
                        </tr>
                    `;
                });
                
                tournamentsTable.innerHTML = html;
                
                // Add event listeners to action buttons
                document.querySelectorAll('.edit-tournament-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const tournamentId = e.target.getAttribute('data-tournament-id');
                        const tournament = tournaments.find(t => t.id.toString() === tournamentId);
                        if (tournament) {
                            this.openTournamentForm(tournament);
                        }
                    });
                });
                
                document.querySelectorAll('.delete-tournament-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const tournamentId = e.target.getAttribute('data-tournament-id');
                        const tournament = tournaments.find(t => t.id.toString() === tournamentId);
                        if (tournament) {
                            if (window.adminModule) {
                                window.adminModule.showConfirmModal(
                                    'Confirm Delete',
                                    `Are you sure you want to delete the tournament "${tournament.name}"?`,
                                    () => {
                                        this.deleteTournament(tournamentId);
                                    }
                                );
                            }
                        }
                    });
                });
                
                document.querySelectorAll('.view-tournament-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const tournamentId = e.target.getAttribute('data-tournament-id');
                        this.viewTournament(tournamentId);
                    });
                });
            }
        } catch (error) {
            console.error('Error loading tournaments:', error);
            if (window.adminModule) {
                window.adminModule.showMessage('Error loading tournaments. Please try again.', 'error');
            }
        }
    },
    
    // Open tournament form
    openTournamentForm: function(tournamentData = null) {
        // In a real implementation, this would open a modal with a form
        // For now, we'll just show an alert
        if (tournamentData) {
            alert(`Edit tournament: ${tournamentData.name}`);
        } else {
            alert('Add new tournament');
        }
    },
    
    // Delete tournament
    deleteTournament: async function(tournamentId) {
        try {
            // In a real app, this would send a delete request to the backend
            // For now, we'll just simulate a successful delete
            
            // Show success message
            if (window.adminModule) {
                window.adminModule.showMessage('Tournament deleted successfully!', 'success');
            }
            
            // Reload tournaments
            this.loadTournaments();
            
        } catch (error) {
            console.error('Error deleting tournament:', error);
            if (window.adminModule) {
                window.adminModule.showMessage('Error deleting tournament. Please try again.', 'error');
            }
        }
    },
    
    // View tournament
    viewTournament: function(tournamentId) {
        // In a real app, this would navigate to the tournament details page
        // For now, we'll just show an alert
        alert(`Viewing tournament with ID: ${tournamentId}`);
    },
    
    // Get mock tournaments data
    getMockTournaments: function() {
        return [
            {
                id: 1,
                name: 'Echo Arena Championship 2024',
                game: 'Echo Arena',
                startDate: '2024-06-15',
                endDate: '2024-06-30',
                players: 64,
                maxPlayers: 128,
                status: 'Active',
                prize: '$5,000'
            },
            {
                id: 2,
                name: 'Breachers Masters League',
                game: 'Breachers',
                startDate: '2024-07-10',
                endDate: '2024-07-25',
                players: 32,
                maxPlayers: 32,
                status: 'Full',
                prize: '$3,000'
            },
            {
                id: 3,
                name: 'Echo Combat Tournament',
                game: 'Echo Combat',
                startDate: '2024-05-01',
                endDate: '2024-05-15',
                players: 48,
                maxPlayers: 64,
                status: 'Completed',
                prize: '$2,000'
            },
            {
                id: 4,
                name: 'Nock Championship Series',
                game: 'Nock',
                startDate: '2024-08-01',
                endDate: '2024-08-15',
                players: 16,
                maxPlayers: 32,
                status: 'Upcoming',
                prize: '$1,500'
            },
            {
                id: 5,
                name: 'Vail Tactical Cup',
                game: 'Vail',
                startDate: '2024-09-10',
                endDate: '2024-09-25',
                players: 0,
                maxPlayers: 16,
                status: 'Registration',
                prize: '$1,000'
            }
        ];
    }
}; 