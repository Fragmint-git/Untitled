/**
 * Admin Dashboard Tab Module
 * Handles the dashboard functionality in the admin panel
 */

// Admin Dashboard Module
window.adminDashboardModule = {
    // Initialize dashboard
    initDashboard: function() {
        //console.log('Initializing admin dashboard...');
        this.loadDashboard();
    },
    
    // Load dashboard data
    loadDashboard: async function () {
        try {
            //const response = await fetch('http://localhost/api/fetch/dashboard');
            const response = await fetch('https://vrbattles.gg/api/fetch/dashboard');
            if (response.ok) {
                const result = await response.json();
                if (result.status === 'success') {
                    this.updateDashboardStats(result.data);
                    this.updateRecentActivity(result.data.recentActivity || []);
                }
            } else {
                throw new Error('API failed');
            }
        } catch (err) {
            //console.error('Error loading dashboard:', err);
            window.adminModule?.showMessage('Error loading dashboard data', 'error');
        }
    },

    updateDashboardStats: function (data) {
        document.getElementById('stat-games-count').textContent = data.games;
        document.getElementById('stat-tournaments-count').textContent = data.tournaments;
        document.getElementById('stat-teams-count').textContent = data.teams;
        document.getElementById('stat-matches-count').textContent = data.matches;
        document.getElementById('stat-players-count').textContent = data.players;
    },

    
    // Update recent activity list
    updateRecentActivity: function(activities) {
        const activityList = document.getElementById('recent-activity-list');
        if (!activityList) return;
        
        if (activities.length === 0) {
            activityList.innerHTML = '<p class="empty-state">No recent activity</p>';
            return;
        }
        
        let html = '';
        activities.forEach(activity => {
            const date = new Date(activity.time);
            const formattedTime = date.toLocaleString();
            
            html += `
                <div class="activity-item">
                    <div class="activity-icon ${activity.type}">
                        ${this.getActivityIcon(activity.type)}
                    </div>
                    <div class="activity-details">
                        <p><strong>${activity.user}</strong> ${this.getActivityText(activity)}</p>
                        <p class="activity-time">${formattedTime}</p>
                    </div>
                </div>
            `;
        });
        
        activityList.innerHTML = html;
    },
    
    // Get activity icon
    getActivityIcon: function(type) {
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
    },
    
    // Get activity text
    getActivityText: function(activity) {
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
    },
    
    // Get mock dashboard data
    getMockDashboardData: function() {
        return {
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
}; 
window.addEventListener('DOMContentLoaded', () => {
    window.adminDashboardModule.initDashboard();
});