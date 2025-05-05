/**
 * Matchfinder UI Module
 * Handles UI interactions for the matchmaking functionality
 */

// Initialize matchfinder UI
async function initMatchfinderUI() {
    console.log('Initializing matchfinder UI...');
    
    // Load games into the game select
    await loadGamesIntoSelect();
    
    // Add event listeners
    document.getElementById('quick-match-btn').addEventListener('click', handleQuickMatch);
    document.getElementById('find-match-btn').addEventListener('click', handleCustomMatch);
    document.getElementById('game-select').addEventListener('change', handleGameChange);
    
    // Load initial match suggestions
    await loadMatchSuggestions();
}

// Load games into the game select dropdown
async function loadGamesIntoSelect() {
    try {
        const games = await window.api.getGames();
        const gameSelect = document.getElementById('game-select');
        
        games.forEach(game => {
            const option = document.createElement('option');
            option.value = game.id;
            option.textContent = game.name;
            gameSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading games:', error);
        window.uiModule.showNotification('Failed to load games', 'error');
    }
}

// Handle quick match button click
/*async function handleQuickMatch() {
    try {
        window.uiModule.showNotification('Finding a quick match...', 'info');
        
        // Get the current user's ID (you'll need to implement this)
        const currentUserId = await getCurrentUserId();
        
        // Find matches for the current user
        const matches = await window.matchfinderModule.findMatches(currentUserId);
        
        if (matches && matches.length > 0) {
            // Create a match with the best-matched player
            const match = await window.matchfinderModule.createMatch(currentUserId, matches[0].id);
            window.uiModule.showNotification('Match found! Starting game...', 'success');
            // Handle match creation success (e.g., redirect to game lobby)
        } else {
            window.uiModule.showNotification('No suitable matches found. Try again later.', 'warning');
        }
    } catch (error) {
        console.error('Error in quick match:', error);
        window.uiModule.showNotification('Failed to find a match', 'error');
    }
}*/

// Handle custom match button click
async function handleCustomMatch() {
    try {
        const gameId = document.getElementById('game-select').value;
        const skillRange = document.getElementById('skill-range').value;
        const region = document.getElementById('region-select').value;
        
        if (!gameId) {
            window.uiModule.showNotification('Please select a game', 'warning');
            return;
        }
        
        window.uiModule.showNotification('Finding a custom match...', 'info');
        
        // Get match suggestions based on filters
        const suggestions = await window.matchfinderModule.getMatchSuggestions(gameId);
        
        // Filter suggestions based on skill range and region
        const filteredSuggestions = filterSuggestions(suggestions, skillRange, region);
        
        // Update the suggestions list
        updateSuggestionsList(filteredSuggestions);
        
    } catch (error) {
        console.error('Error in custom match:', error);
        window.uiModule.showNotification('Failed to find matches', 'error');
    }
}

// Handle game selection change
function handleGameChange() {
    // Implement any specific logic needed when the game changes
    loadMatchSuggestions();
}

// Load match suggestions
async function loadMatchSuggestions() {
    try {
        const gameId = document.getElementById('game-select').value;
        if (!gameId) return;
        
        const suggestions = await window.matchfinderModule.getMatchSuggestions(gameId);
        updateSuggestionsList(suggestions);
    } catch (error) {
        console.error('Error loading match suggestions:', error);
    }
}

// Filter match suggestions based on criteria
function filterSuggestions(suggestions, skillRange, region) {
    return suggestions.filter(suggestion => {
        const matchesSkill = skillRange === 'any' || 
            (suggestion.player1.skillLevel === skillRange && suggestion.player2.skillLevel === skillRange);
        const matchesRegion = region === 'any' ||
            (suggestion.player1.region === region && suggestion.player2.region === region);
        
        return matchesSkill && matchesRegion;
    });
}

// Update the suggestions list in the UI
function updateSuggestionsList(suggestions) {
    const suggestionsList = document.getElementById('match-suggestions-list');
    
    if (!suggestions || suggestions.length === 0) {
        suggestionsList.innerHTML = '<p>No matches found. Try adjusting your filters.</p>';
        return;
    }
    
    suggestionsList.innerHTML = suggestions.map(suggestion => `
        <div class="match-suggestion">
            <div class="players">
                <div class="player">
                    <img src="${suggestion.player1.avatar || '../assets/images/default-avatar.png'}" alt="Player 1">
                    <span>${suggestion.player1.displayName}</span>
                </div>
                <div class="vs">VS</div>
                <div class="player">
                    <img src="${suggestion.player2.avatar || '../assets/images/default-avatar.png'}" alt="Player 2">
                    <span>${suggestion.player2.displayName}</span>
                </div>
            </div>
            <div class="match-details">
                <span class="compatibility">Match Score: ${Math.round(suggestion.compatibilityScore * 100)}%</span>
                <button class="btn secondary join-match" data-player1="${suggestion.player1.id}" data-player2="${suggestion.player2.id}">
                    Join Match
                </button>
            </div>
        </div>
    `).join('');
    
    // Add event listeners to join match buttons
    document.querySelectorAll('.join-match').forEach(button => {
        button.addEventListener('click', async (e) => {
            const player1Id = e.target.dataset.player1;
            const player2Id = e.target.dataset.player2;
            try {
                await window.matchfinderModule.createMatch(player1Id, player2Id);
                window.uiModule.showNotification('Match joined successfully!', 'success');
                // Handle match join success (e.g., redirect to game lobby)
            } catch (error) {
                console.error('Error joining match:', error);
                window.uiModule.showNotification('Failed to join match', 'error');
            }
        });
    });
}

// Helper function to get current user ID (implement this based on your auth system)
async function getCurrentUserId() {
    // Implement this based on your authentication system
    return 1; // Placeholder
}

// Export module
window.matchfinderUIModule = {
    initMatchfinderUI,
    handleQuickMatch,
    handleCustomMatch,
    loadMatchSuggestions
}; 