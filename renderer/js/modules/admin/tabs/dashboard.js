/**
 * Admin Dashboard Tab Module
 * Handles the dashboard functionality in the admin panel
 */

// Admin Dashboard Module
window.adminDashboardModule = {
    // Initialize dashboard
    initDashboard: function() {
        console.log('Initializing admin dashboard...');
        
        // Load dashboard data
        this.loadDashboard();
    },
    
    // Load dashboard data
    loadDashboard: async function() {
        try {
            // Fetch dashboard data from the backend
            const response = await fetch('http://localhost:3000/api/dashboard');
            
            // If the API endpoint doesn't exist yet, use mock data
            let dashboardData;
            if (response.ok) {
                dashboardData = await response.json();
            } else {
                // Mock data for development
                dashboardData = this.getMockDashboardData();
            }
            
            // Update dashboard stats
            this.updateDashboardStats(dashboardData);
            
            // Update recent activity
            this.updateRecentActivity(dashboardData.recentActivity);
            
        } catch (error) {
            console.error('Error updating admin dashboard:', error);
            if (window.adminModule && window.adminModule.showMessage) {
                window.adminModule.showMessage('Error loading dashboard data', 'error');
            }
        }
    },
    
    // Update dashboard statistics
    updateDashboardStats: function(dashboardData) {
        document.getElementById('total-games-count').textContent = dashboardData.totalGames;
        document.getElementById('total-tournaments-count').textContent = dashboardData.totalTournaments;
        document.getElementById('total-players-count').textContent = dashboardData.totalPlayers;
        document.getElementById('active-tournaments-count').textContent = dashboardData.activeTournaments;
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