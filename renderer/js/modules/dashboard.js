/**
 * Dashboard Module
 * Handles dashboard functionality and data loading
 */

// Load dashboard data
/*async function loadDashboardData() {
    try {
        // Fetch data for dashboard
        const tournaments = await window.api.getTournaments();
        const players = await window.api.getPlayers();
        const games = await window.api.getGames();
        
        // Update dashboard statistics if elements exist
        const updateElement = (id, value) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        };

        updateElement('total-tournaments', tournaments.length);
        updateElement('total-players', players.length);
        updateElement('total-games', games.length);
        
        // Get active tournaments (status = 'active')
        const activeTournaments = tournaments.filter(t => t.status === 'active');
        updateElement('active-tournaments', activeTournaments.length);
        
        // Display recent tournaments in the dashboard
        const recentTournamentsContainer = document.getElementById('recent-tournaments');
        if (recentTournamentsContainer) {
            recentTournamentsContainer.innerHTML = '';
            
            // Sort tournaments by start date (most recent first)
            const sortedTournaments = [...tournaments].sort((a, b) => 
                new Date(b.startDate) - new Date(a.startDate)
            ).slice(0, 5);
            
            if (sortedTournaments.length === 0) {
                recentTournamentsContainer.innerHTML = '<p>No tournaments found. Create your first tournament!</p>';
            } else {
                sortedTournaments.forEach(tournament => {
                    const tournamentCard = document.createElement('div');
                    tournamentCard.className = 'tournament-card';
                    tournamentCard.innerHTML = `
                        <h3>${tournament.name}</h3>
                        <p>${tournament.description ? tournament.description.substring(0, 100) + (tournament.description.length > 100 ? '...' : '') : 'No description available.'}</p>
                        <div class="tournament-meta">
                            <span class="status ${tournament.status}">${tournament.status}</span>
                            <span class="date">Starts: ${new Date(tournament.startDate).toLocaleDateString()}</span>
                        </div>
                        <button class="btn view-tournament" data-id="${tournament.id}">View Details</button>
                    `;
                    recentTournamentsContainer.appendChild(tournamentCard);
                });
                
                // Add event listeners to view tournament buttons
                document.querySelectorAll('.view-tournament').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const tournamentId = e.target.getAttribute('data-id');
                        // Navigate to tournament details
                        document.querySelector('.nav-item[data-section="tournaments"]').click();
                        // Show tournament details
                        window.tournamentsModule.showTournamentDetails(tournamentId);
                    });
                });
            }
        }
        
        // Display upcoming matches
        loadUpcomingMatches();
        
        // Load news items
        loadNewsItems();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        window.uiModule.showNotification('Failed to load dashboard data', 'error');
    }
}

// Function to load upcoming matches
async function loadUpcomingMatches() {
    try {
        const matches = await window.api.getMatches();
        const upcomingMatchesContainer = document.getElementById('upcoming-matches');
        if (!upcomingMatchesContainer) return;

        upcomingMatchesContainer.innerHTML = '';
        
        // Filter for upcoming matches (those with future start times)
        const now = new Date();
        const upcomingMatches = matches.filter(match => 
            new Date(match.startTime) > now
        ).sort((a, b) => 
            new Date(a.startTime) - new Date(b.startTime)
        ).slice(0, 5); // Get only the 5 soonest matches
        
        if (upcomingMatches.length === 0) {
            upcomingMatchesContainer.innerHTML = '<p>No upcoming matches scheduled.</p>';
        } else {
            upcomingMatches.forEach(match => {
                const matchCard = document.createElement('div');
                matchCard.className = 'match-card';
                
                // Format the date and time
                const matchDate = new Date(match.startTime);
                const formattedDate = matchDate.toLocaleDateString();
                const formattedTime = matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                matchCard.innerHTML = `
                    <div class="match-time">
                        <div class="date">${formattedDate}</div>
                        <div class="time">${formattedTime}</div>
                    </div>
                    <div class="match-details">
                        <h4>Match #${match.id}</h4>
                        <p>Tournament: ${match.Tournament ? match.Tournament.name : 'Unknown'}</p>
                        <span class="status ${match.status}">${match.status}</span>
                    </div>
                `;
                upcomingMatchesContainer.appendChild(matchCard);
            });
        }
    } catch (error) {
        console.error('Error loading upcoming matches:', error);
        window.uiModule.showNotification('Failed to load upcoming matches', 'error');
    }
}*/

// Function to load news items
async function loadNewsItems() {
    try {
        // In a real app, this would fetch from an API
        // For now, we'll use mock data
        const newsItems = getMockNewsItems();
        const newsGrid = document.querySelector('.news-grid');
        
        if (!newsGrid) return;
        
        newsGrid.innerHTML = '';
        
        if (newsItems.length === 0) {
            newsGrid.innerHTML = '<p>No news available at this time.</p>';
        } else {
            newsItems.forEach(item => {
                const newsCard = document.createElement('div');
                newsCard.className = 'news-card';
                
                // Format the date
                const itemDate = new Date(item.publishDate);
                const formattedDate = itemDate.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
                
                newsCard.innerHTML = `
                    <div class="news-image">
                        <img src="${item.imageUrl}" alt="${item.title}">
                    </div>
                    <div class="news-content">
                        <div class="news-date">${formattedDate}</div>
                        <h3>${item.title}</h3>
                        <p>${item.excerpt}</p>
                        <a href="#" class="btn-text news-read-more" data-id="${item.id}">Read More <i class="fas fa-arrow-right"></i></a>
                    </div>
                `;
                newsGrid.appendChild(newsCard);
            });
            
            // Add event listeners to news read more links
            document.querySelectorAll('.news-read-more').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const newsId = e.target.getAttribute('data-id');
                    showNewsDetails(newsId);
                });
            });
        }
        
        // Update banner if it exists
        updateDashboardBanner();
        
    } catch (error) {
        console.error('Error loading news items:', error);
        window.uiModule.showNotification('Failed to load news', 'error');
    }
}

// Function to show news details
function showNewsDetails(newsId) {
    // In a real app, this would navigate to a news detail page
    // For now, we'll just log the news ID
    console.log(`Showing news details for ID: ${newsId}`);
    window.uiModule.showNotification('News detail view coming soon', 'info');
}

// Function to update the dashboard banner
function updateDashboardBanner() {
    // In a real app, this would fetch the latest banner content from an API
    // For now, we'll use static content
    const banner = document.querySelector('.dashboard-banner');
    if (!banner) return;
    
    // You could update this with dynamic content if needed
    banner.querySelector('h2').textContent = 'Welcome to VR Battle Royale';
    banner.querySelector('p').textContent = 'Get ready for the upcoming Spring Tournament Series!';
    
    // Add event listener to the Learn More button
    const learnMoreBtn = banner.querySelector('.btn-primary');
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', () => {
            // Navigate to the tournaments section
            document.querySelector('.nav-item[data-section="tournaments"]').click();
        });
    }
}

// Get mock news data
function getMockNewsItems() {
    return [
        {
            id: 1,
            title: 'Major Platform Update',
            excerpt: 'We\'ve completely redesigned the tournament experience with new features and improvements.',
            content: 'The latest update brings a completely revamped user interface, improved matchmaking algorithms, and new tournament formats. Players can now enjoy a smoother experience with less waiting time between matches and more detailed statistics.',
            publishDate: '2023-03-15',
            imageUrl: 'assets/images/news/update1.jpg',
            author: 'VR Battle Royale Team'
        },
        {
            id: 2,
            title: 'Spring Tournament Series Announced',
            excerpt: 'Join us for the biggest VR tournament series with over $10,000 in prizes.',
            content: 'The Spring Tournament Series will run from April 1st to May 15th, featuring competitions in Beat Saber, Pistol Whip, and Superhot VR. Players of all skill levels are welcome to participate, with separate divisions for beginners, intermediate, and professional players.',
            publishDate: '2023-03-10',
            imageUrl: 'assets/images/news/tournament.jpg',
            author: 'Tournament Director'
        },
        {
            id: 3,
            title: 'New Partnership with VR Hardware Company',
            excerpt: 'We\'re excited to announce our partnership with a leading VR hardware manufacturer.',
            content: 'This partnership will bring exclusive hardware discounts to our premium members, as well as special tournament prizes including the latest VR headsets and accessories. Stay tuned for exclusive offers coming soon!',
            publishDate: '2023-03-05',
            imageUrl: 'assets/images/news/partnership.jpg',
            author: 'Marketing Team'
        }
    ];
}

// Export module
window.dashboardModule = {
    loadDashboardData
}; 