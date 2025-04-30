/**
 * Featured module for VR Battles Nexus
 * Displays the main welcome content and featured items
 */

const FeaturedModule = {
    /**
     * Initialize the featured module
     * @param {HTMLElement} container - The container element to render content into
     */
    init(container) {
        this.container = container;
        this.render();
    },

    /**
     * Render the featured content
     */
    render() {
        const content = `
            <!-- Banner Section -->
            <div class="dashboard-banner">
                <div class="banner-content">
                    <h2>Welcome to VR Battles Nexus</h2>
                    <p>The ultimate platform for VR gaming tournaments and matchmaking</p>
                    <div class="welcome-actions">
                        <a href="login.html" class="btn-secondary">Login</a>
                        <a href="registration.html" class="btn-primary">Register</a>
                    </div>
                </div>
            </div>

            <!-- Recent News Section -->
            <div class="section-header">
                <h2>Recent News</h2>
            </div>
            <div class="news-grid">
                <div class="news-card">
                    <div class="news-image">
                        <img src="assets/images/news/update1.jpg" alt="Major Update">
                    </div>
                    <div class="news-content">
                        <div class="news-date">March 15, 2023</div>
                        <h3>Major Platform Update</h3>
                        <p>We've redesigned the tournament experience with new features and improvements.</p>
                    </div>
                </div>
                <div class="news-card">
                    <div class="news-image">
                        <img src="assets/images/news/tournament.jpg" alt="Tournament">
                    </div>
                    <div class="news-content">
                        <div class="news-date">March 10, 2023</div>
                        <h3>Spring Tournament Series</h3>
                        <p>Join us for the biggest VR tournament series with over $10,000 in prizes!</p>
                    </div>
                </div>
                <div class="news-card">
                    <div class="news-image">
                        <img src="assets/images/news/partnership.jpg" alt="Partnership">
                    </div>
                    <div class="news-content">
                        <div class="news-date">March 5, 2023</div>
                        <h3>New Hardware Partnership</h3>
                        <p>We're excited to announce our partnership with a leading VR hardware manufacturer.</p>
                    </div>
                </div>
            </div>
        `;

        this.container.innerHTML = content;
    }
};

module.exports = FeaturedModule;
