/**
 * Social module for VR Battles Nexus
 * Promotional page to encourage user registration and login
 */

const SocialModule = {
    /**
     * Initialize the social module
     * @param {HTMLElement} container - The container element to render content into
     */
    init(container) {
        this.container = container;
        this.render();
        this.attachEventListeners();
    },

    /**
     * Render the promotional content
     */
    render() {
        // This content template is used by both the module and the fallback extraction in welcome.html
        const content = `
            <div class="social-container">
                <div class="social-hero">
                    <div class="hero-content">
                        <h1>The VR Battles Community</h1>
                        <p class="hero-subtitle">Join the fastest-growing VR gaming community where players connect, compete, and build lasting friendships.</p>
                        
                        <div class="cta-buttons">
                            <a href="registration.html" class="btn-primary btn-large">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                                Join VR Battles
                            </a>
                            <a href="login.html" class="btn-secondary btn-large">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
                                Sign In
                            </a>
                        </div>
                    </div>
                    <div class="hero-graphic">
                        <img src="../assets/icons/renamed/vrb-logo-256.png" alt="VR Battles Logo" class="vr-battles-logo">
                    </div>
                </div>

                <div class="community-banner">
                    <h2>More Than Just Competition</h2>
                    <p>VR Battles is a thriving community of passionate VR gamers from around the world. Whether you're a competitive player or casual enthusiast, you'll find your place here.</p>
                </div>

                <div class="benefits-section">
                    <h2>Be Part of the VR Battles Family</h2>
                    <div class="benefits-grid">
                        <div class="benefit-card">
                            <div class="benefit-icon">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FF7F00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            </div>
                            <h3>Connect With VR Battlers</h3>
                            <p>Find and connect with other VR Battles players, build your network, and never play alone again.</p>
                        </div>
                        
                        <div class="benefit-card">
                            <div class="benefit-icon">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FF7F00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                            </div>
                            <h3>VR Battles Chat</h3>
                            <p>Our dedicated chat system lets you coordinate matches, discuss strategies, and build friendships with fellow players.</p>
                        </div>
                        
                        <div class="benefit-card">
                            <div class="benefit-icon">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FF7F00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            </div>
                            <h3>Create Elite Teams</h3>
                            <p>Form official VR Battles teams, recruit members, and climb the ranks together in our tournaments.</p>
                        </div>
                        
                        <div class="benefit-card">
                            <div class="benefit-icon">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FF7F00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                            </div>
                            <h3>Battle Highlights</h3>
                            <p>Share your best VR Battles moments with the community and get recognized for your skills.</p>
                        </div>
                        
                        <div class="benefit-card">
                            <div class="benefit-icon">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FF7F00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
                            </div>
                            <h3>Exclusive Events</h3>
                            <p>Get early access to VR Battles tournaments, community meetups, and special member-only events.</p>
                        </div>
                        
                        <div class="benefit-card">
                            <div class="benefit-icon">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FF7F00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                            </div>
                            <h3>Community Support</h3>
                            <p>Access tips, strategies, and help from experienced VR Battles players and community mentors.</p>
                        </div>
                    </div>
                </div>

                <div class="feature-showcase">
                    <div class="feature-card">
                        <div class="feature-icon">
                            <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#FF7F00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        </div>
                        <h3>VR Battles Chat Hub</h3>
                        <ul class="feature-list">
                            <li>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF7F00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                Private messaging between members
                            </li>
                            <li>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF7F00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                Team chat rooms with voice support
                            </li>
                            <li>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF7F00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                Pre-match coordination tools
                            </li>
                            <li>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF7F00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                Share replays and highlight clips
                            </li>
                        </ul>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-icon">
                            <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#FF7F00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        </div>
                        <h3>VR Battles Network</h3>
                        <ul class="feature-list">
                            <li>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF7F00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                Find players by skill level or region
                            </li>
                            <li>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF7F00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                Player match history and stats
                            </li>
                            <li>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF7F00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                VR Battles verified player badges
                            </li>
                            <li>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF7F00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                Community event notifications
                            </li>
                        </ul>
                    </div>
                </div>

                <div class="community-gallery">
                    <h2>Our Community in Action</h2>
                    <div class="gallery-placeholder">
                        <div class="gallery-message">Community screenshots coming soon</div>
                    </div>
                </div>

                <div class="testimonials-section">
                    <h2>Hear From VR Battlers</h2>
                    <div class="testimonials-grid">
                        <div class="testimonial-card">
                            <div class="testimonial-content">
                                <p>"I've been with VR Battles since the beginning. The community is like a second family - supportive, competitive, and always pushing each other to improve."</p>
                            </div>
                            <div class="testimonial-author">
                                <div class="author-avatar"></div>
                                <div class="author-info">
                                    <h4>Alex J.</h4>
                                    <p>VR Battles Veteran</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="testimonial-card">
                            <div class="testimonial-content">
                                <p>"The VR Battles community welcomed me immediately. Within days, I had a full friends list and was participating in practice matches with players at my skill level."</p>
                            </div>
                            <div class="testimonial-author">
                                <div class="author-avatar"></div>
                                <div class="author-info">
                                    <h4>Maya T.</h4>
                                    <p>Team Captain</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="testimonial-card">
                            <div class="testimonial-content">
                                <p>"What makes VR Battles special is how the community comes together. Everyone from beginners to pros share tips and help each other level up their game."</p>
                            </div>
                            <div class="testimonial-author">
                                <div class="author-avatar"></div>
                                <div class="author-info">
                                    <h4>Darius M.</h4>
                                    <p>Community Moderator</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="final-cta">
                    <h2>Join the VR Battles Community Today</h2>
                    <p>Become part of a worldwide network of VR gamers who share your passion for competition and camaraderie.</p>
                    <div class="cta-buttons">
                        <a href="registration.html" class="btn-primary btn-large">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                            Become a VR Battler
                        </a>
                        <a href="login.html" class="btn-secondary btn-large">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
                            Sign In
                        </a>
                    </div>
                </div>
            </div>
        `;
        
        this.container.innerHTML = content;
        
        // Add CSS for Social UI
        this.addStyles();
    },
    
    /**
     * Add CSS styles for the Social UI
     */
    addStyles() {
        // Check if the stylesheet already exists to avoid duplicates
        const existingStyle = document.getElementById('social-module-styles');
        if (existingStyle) return;

        const socialStylesheet = document.createElement('style');
        socialStylesheet.id = 'social-module-styles';
        socialStylesheet.textContent = `
            .social-container {
                display: flex;
                flex-direction: column;
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
                gap: 60px;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                color: #e1e1e1;
            }
            
            /* Hero Section */
            .social-hero {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 40px;
                padding: 60px 0;
            }
            
            .hero-content {
                flex: 1;
            }
            
            .hero-content h1 {
                font-size: 48px;
                font-weight: 700;
                margin: 0 0 20px 0;
                background: linear-gradient(45deg, #ff7f00, #ffb700);
                background-clip: text;
                -webkit-background-clip: text;
                color: transparent;
                line-height: 1.2;
            }
            
            .hero-subtitle {
                font-size: 20px;
                line-height: 1.6;
                margin-bottom: 40px;
                color: #e1e1e1;
                max-width: 600px;
            }
            
            .hero-graphic {
                flex: 1;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .vr-battles-logo {
                width: 250px;
                height: auto;
                animation: pulse 3s infinite alternate;
            }
            
            @keyframes pulse {
                0% {
                    transform: scale(1);
                    filter: drop-shadow(0 0 10px rgba(255, 127, 0, 0.3));
                }
                100% {
                    transform: scale(1.1);
                    filter: drop-shadow(0 0 20px rgba(255, 127, 0, 0.6));
                }
            }
            
            /* Community Banner */
            .community-banner {
                background: linear-gradient(135deg, rgba(255, 127, 0, 0.05), rgba(255, 183, 0, 0.05));
                border-radius: 12px;
                padding: 40px;
                text-align: center;
                border: 1px solid rgba(255, 127, 0, 0.1);
                max-width: 900px;
                margin: 0 auto;
            }
            
            .community-banner h2 {
                font-size: 32px;
                font-weight: 700;
                margin-bottom: 15px;
                color: white;
            }
            
            .community-banner p {
                font-size: 18px;
                line-height: 1.6;
                color: #e1e1e1;
                max-width: 700px;
                margin: 0 auto;
            }
            
            /* CTA Buttons */
            .cta-buttons {
                display: flex;
                gap: 20px;
            }
            
            .btn-primary,
            .btn-secondary {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                padding: 15px 30px;
                border-radius: 8px;
                font-weight: 600;
                font-size: 16px;
                text-decoration: none;
                transition: all 0.3s ease;
                cursor: pointer;
            }
            
            .btn-large {
                padding: 16px 32px;
                font-size: 18px;
            }
            
            .btn-primary {
                background: #ff7f00;
                color: white;
                border: none;
                box-shadow: 0 4px 15px rgba(255, 127, 0, 0.3);
            }
            
            .btn-secondary {
                background: rgba(255, 255, 255, 0.1);
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .btn-primary:hover {
                background: #e67300;
                transform: translateY(-3px);
                box-shadow: 0 6px 20px rgba(255, 127, 0, 0.4);
            }
            
            .btn-secondary:hover {
                background: rgba(255, 255, 255, 0.15);
                transform: translateY(-3px);
                box-shadow: 0 4px 15px rgba(255, 255, 255, 0.1);
            }
            
            /* Benefits Section */
            .benefits-section {
                text-align: center;
                padding: 40px 0;
            }
            
            .benefits-section h2 {
                font-size: 36px;
                font-weight: 700;
                margin-bottom: 50px;
                color: white;
            }
            
            /* Fixed Card Grid */
            .benefits-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 30px;
                width: 100%;
                max-width: 100%;
                margin: 0 auto;
            }
            
            /* Fixed Benefit Cards */
            .benefit-card {
                background: linear-gradient(145deg, #2a2a45, #252540);
                border-radius: 12px;
                padding: 30px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                transition: all 0.3s ease;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
                overflow: hidden;
                position: relative;
                border: 1px solid rgba(255, 255, 255, 0.05);
            }
            
            .benefit-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(45deg, rgba(255, 127, 0, 0.05), transparent);
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .benefit-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25);
                border-color: rgba(255, 127, 0, 0.2);
            }
            
            .benefit-card:hover::before {
                opacity: 1;
            }
            
            .benefit-icon {
                margin-bottom: 20px;
                background: rgba(255, 127, 0, 0.1);
                width: 80px;
                height: 80px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                z-index: 1;
                box-shadow: 0 5px 15px rgba(255, 127, 0, 0.15);
            }
            
            .benefit-card h3 {
                font-size: 22px;
                font-weight: 600;
                margin-bottom: 15px;
                color: white;
                position: relative;
                z-index: 1;
            }
            
            .benefit-card p {
                font-size: 16px;
                line-height: 1.6;
                color: #b3b3cc;
                margin: 0;
                position: relative;
                z-index: 1;
            }
            
            /* Feature Showcase */
            .feature-showcase {
                display: flex;
                gap: 30px;
                margin: 0 auto;
                max-width: 900px;
            }
            
            .feature-card {
                flex: 1;
                background: linear-gradient(145deg, #2a2a45, #252540);
                border-radius: 12px;
                padding: 30px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.05);
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            
            .feature-icon {
                margin-bottom: 20px;
                background: rgba(255, 127, 0, 0.1);
                width: 100px;
                height: 100px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 5px 15px rgba(255, 127, 0, 0.15);
            }
            
            .feature-card h3 {
                font-size: 24px;
                font-weight: 700;
                margin-bottom: 20px;
                color: white;
                text-align: center;
            }
            
            .feature-list {
                list-style: none;
                padding: 0;
                margin: 0;
                width: 100%;
                text-align: left;
            }
            
            .feature-list li {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 15px;
                color: #e1e1e1;
                font-size: 16px;
            }
            
            .feature-list li svg {
                flex-shrink: 0;
            }
            
            /* Community Gallery */
            .community-gallery {
                text-align: center;
            }
            
            .community-gallery h2 {
                font-size: 36px;
                font-weight: 700;
                margin-bottom: 30px;
                color: white;
            }
            
            .gallery-placeholder {
                background: linear-gradient(145deg, #2a2a45, #252540);
                border-radius: 12px;
                padding: 60px 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 1px solid rgba(255, 255, 255, 0.05);
            }
            
            .gallery-message {
                font-size: 18px;
                color: #b3b3cc;
            }
            
            /* Testimonials Section */
            .testimonials-section {
                text-align: center;
                padding: 40px 0;
            }
            
            .testimonials-section h2 {
                font-size: 36px;
                font-weight: 700;
                margin-bottom: 50px;
                color: white;
            }
            
            /* Fixed Testimonial Grid */
            .testimonials-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 30px;
                width: 100%;
                max-width: 100%;
                margin: 0 auto;
            }
            
            /* Fixed Testimonial Cards */
            .testimonial-card {
                background: linear-gradient(145deg, #2a2a45, #252540);
                border-radius: 12px;
                padding: 30px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                display: flex;
                flex-direction: column;
                height: 100%;
                position: relative;
                border: 1px solid rgba(255, 255, 255, 0.05);
                overflow: hidden;
                transition: all 0.3s ease;
            }
            
            .testimonial-card::before {
                content: '"';
                position: absolute;
                top: 10px;
                left: 20px;
                font-size: 120px;
                line-height: 1;
                font-family: Georgia, serif;
                color: rgba(255, 127, 0, 0.1);
                z-index: 0;
            }
            
            .testimonial-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25);
                border-color: rgba(255, 127, 0, 0.2);
            }
            
            .testimonial-content {
                flex: 1;
                margin-bottom: 20px;
                position: relative;
                z-index: 1;
            }
            
            .testimonial-content p {
                font-size: 16px;
                line-height: 1.6;
                color: #e1e1e1;
                font-style: italic;
            }
            
            .testimonial-author {
                display: flex;
                align-items: center;
                gap: 15px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                padding-top: 20px;
                position: relative;
                z-index: 1;
            }
            
            .author-avatar {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: linear-gradient(45deg, #ff7f00, #ffb700);
                box-shadow: 0 4px 10px rgba(255, 127, 0, 0.3);
            }
            
            .author-info {
                text-align: left;
            }
            
            .author-info h4 {
                font-size: 18px;
                font-weight: 600;
                margin: 0 0 5px 0;
                color: white;
            }
            
            .author-info p {
                font-size: 14px;
                color: #b3b3cc;
                margin: 0;
            }
            
            /* Final CTA Section */
            .final-cta {
                text-align: center;
                background: linear-gradient(135deg, rgba(255, 127, 0, 0.1), rgba(255, 183, 0, 0.1));
                border-radius: 12px;
                padding: 60px 40px;
                margin-bottom: 40px;
                border: 1px solid rgba(255, 127, 0, 0.1);
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
            }
            
            .final-cta h2 {
                font-size: 36px;
                font-weight: 700;
                margin-bottom: 15px;
                color: white;
            }
            
            .final-cta p {
                font-size: 18px;
                line-height: 1.6;
                color: #e1e1e1;
                margin-bottom: 40px;
                max-width: 700px;
                margin-left: auto;
                margin-right: auto;
            }
            
            /* Responsive Design */
            @media (max-width: 1100px) {
                .benefits-grid, .testimonials-grid {
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                }
                
                .social-hero {
                    flex-direction: column;
                    text-align: center;
                    padding: 40px 0;
                }
                
                .hero-content h1 {
                    font-size: 40px;
                }
                
                .hero-subtitle {
                    margin-left: auto;
                    margin-right: auto;
                }
                
                .cta-buttons {
                    justify-content: center;
                }
                
                .feature-showcase {
                    flex-direction: column;
                }
            }
            
            @media (max-width: 768px) {
                .benefits-grid, .testimonials-grid {
                    grid-template-columns: 1fr;
                    gap: 20px;
                }
                
                .hero-content h1 {
                    font-size: 32px;
                }
                
                .benefits-section h2, 
                .testimonials-section h2, 
                .final-cta h2,
                .community-gallery h2,
                .community-banner h2 {
                    font-size: 28px;
                }
                
                .community-banner p {
                    font-size: 16px;
                }
                
                .cta-buttons {
                    flex-direction: column;
                    gap: 15px;
                }
                
                .btn-primary, .btn-secondary {
                    width: 100%;
                }
                
                .testimonial-card {
                    padding: 20px;
                }
            }
            
            /* Fix for card display on smaller screens */
            @media (max-width: 480px) {
                .benefit-icon {
                    width: 60px;
                    height: 60px;
                }
                
                .benefit-icon svg {
                    width: 30px;
                    height: 30px;
                }
                
                .benefit-card h3 {
                    font-size: 18px;
                }
                
                .benefit-card p {
                    font-size: 14px;
                }
                
                .testimonial-content p {
                    font-size: 14px;
                }
                
                .author-avatar {
                    width: 40px;
                    height: 40px;
                }
                
                .author-info h4 {
                    font-size: 16px;
                }
                
                .social-container {
                    gap: 40px;
                    padding: 10px;
                }
                
                .feature-icon {
                    width: 80px;
                    height: 80px;
                }
                
                .feature-icon svg {
                    width: 40px;
                    height: 40px;
                }
                
                .community-banner {
                    padding: 20px;
                }
            }
        `;
        document.head.appendChild(socialStylesheet);
    },

    /**
     * Attach event listeners for interactions
     */
    attachEventListeners() {
        // Add animations or interactive elements
        const benefitCards = this.container.querySelectorAll('.benefit-card');
        
        // Add hover effects or interactions if needed
        benefitCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                const icon = card.querySelector('.benefit-icon svg');
                if (icon) {
                    icon.style.transform = 'scale(1.1)';
                    icon.style.transition = 'transform 0.3s ease';
                }
            });
            
            card.addEventListener('mouseleave', () => {
                const icon = card.querySelector('.benefit-icon svg');
                if (icon) {
                    icon.style.transform = 'scale(1)';
                }
            });
        });
    }
};

// This section ensures compatibility with both require() and direct browser usage
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = SocialModule;
} else {
    // Make available globally when loaded directly in browser
    window.SocialModule = SocialModule;
    
    // Auto-initialize if loaded directly via <script> tag
    document.addEventListener('DOMContentLoaded', () => {
        const container = document.getElementById('main-content');
        if (container && !container.querySelector('.social-container')) {
            SocialModule.init(container);
        }
    });
}
