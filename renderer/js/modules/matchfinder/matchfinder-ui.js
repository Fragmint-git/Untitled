let sessionUserId = null;
let cancelRequestId = null;
let acceptRequestId = null;
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

function formatMatchStart(utcDatetimeString, userTimezone = 'America/Chicago') {
    if (!utcDatetimeString || isNaN(Date.parse(utcDatetimeString))) return 'TBD';
  
    try {
      const utcDate = new Date(utcDatetimeString);
      const now = new Date();
  
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: userTimezone,
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
  
      const userTime = new Date(utcDate.toLocaleString('en-US', { timeZone: userTimezone }));
      const userNow = new Date(now.toLocaleString('en-US', { timeZone: userTimezone }));
      const diffMs = userTime - userNow;
  
      if (diffMs < 0) return 'Match expired';
  
      const diffMinutes = Math.floor(diffMs / 60000);
      const days = Math.floor(diffMinutes / 1440);
      const hours = Math.floor((diffMinutes % 1440) / 60);
      const minutes = diffMinutes % 60;
  
      return `(${formatter.format(utcDate)})<br>${days} days<br>${hours} hours<br>${minutes} minutes`;
    } catch (err) {
      console.error('Time format error:', err);
      return 'Invalid Date';
    }
  }
  

  
  async function loadOpenMatchRequests() {
    try {
      const result = await window.api.getOpenMatchRequests();
      const session = await window.api.getSession();
      const sessionUserId = session?.id;
  
      if (!Array.isArray(result.data)) return;
  
      const tbody = document.getElementById('match-request-body');
      tbody.innerHTML = '';
  
      result.data.forEach(request => {
        if (request.status !== 'Open') return;
  
        const isCreator = sessionUserId === request.created_by_user_id;
        const combinedDatetime = request.match_date && request.match_time
          ? `${request.match_date}T${request.match_time}Z`
          : null;
  
        const timeDisplay = formatMatchStart(combinedDatetime, session?.timezone || 'America/Chicago');
  
        const row = document.createElement('tr');
        row.innerHTML = `
          <td><img src="/assets/images/games/GameLogos/${request.game_image || 'default.png'}" style="height: 50px;"></td>
          <td>${request.entry_fee || 'Free'}</td>
          <td>${request.team_size}</td>
          <td>${request.game_name}<br>${request.region || 'NA'} | ${request.match_type || 'BO3'}</td>
          <td>${request.skill_level || 'all'}</td>
          <td>${request.support || 'Enabled'}</td>
          <td>${timeDisplay}</td>
          <td>
            <button class="${isCreator ? 'btn-cancel' : 'btn-accept'}" data-request-id="${request.id}">
              ${isCreator ? 'CANCEL' : 'ACCEPT'}
            </button>
          </td>
        `;
        tbody.appendChild(row);
      });
  
      //cancel request
      document.querySelectorAll('.btn-cancel').forEach(button => {
        button.addEventListener('click', () => {
          cancelRequestId = button.dataset.requestId;
          document.getElementById('cancel-confirmation-modal').style.display = 'block';
        });
      });
  
      const cancelModal = document.getElementById('cancel-confirmation-modal');
      document.getElementById('cancel-no').onclick = () => {
        cancelModal.style.display = 'none';
        cancelRequestId = null;
      };
      document.getElementById('cancel-yes').onclick = async () => {
        if (!cancelRequestId || !sessionUserId) {
          window.uiModule.showNotification('Missing request or user ID', 'error');
          return;
        }
        try {
          const response = await fetch('http://localhost/api/matches/cancel_request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              match_request_id: cancelRequestId,
              user_id: sessionUserId
            })
          });
          const result = await response.json();
          if (result.status === 'success') {
            window.uiModule.showNotification('Match request cancelled.', 'success');
            cancelModal.style.display = 'none';
            loadOpenMatchRequests();
          } else {
            window.uiModule.showNotification(result.message || 'Failed to cancel match.', 'error');
          }
        } catch (error) {
          console.error('Cancel failed:', error);
          window.uiModule.showNotification('Server error.', 'error');
        }
      };
  
      //accept match
      document.querySelectorAll('.btn-accept').forEach(button => {
        button.addEventListener('click', () => {
          acceptRequestId = button.dataset.requestId;
          document.getElementById('accept-confirmation-modal').style.display = 'block';
        });
      });
      
      const acceptModal = document.getElementById('accept-confirmation-modal');
      
      document.getElementById('accept-no').onclick = () => {
        acceptModal.style.display = 'none';
        acceptRequestId = null;
      };
      
      document.getElementById('accept-yes').onclick = async () => {
        const acceptYesButton = document.getElementById('accept-yes');
        const acceptNoButton = document.getElementById('accept-no');
      
        acceptYesButton.disabled = true;
        acceptNoButton.disabled = true;
      
        const originalYesText = acceptYesButton.textContent;
        acceptYesButton.textContent = 'Checking…';
      
        if (!acceptRequestId) {
          acceptModal.style.display = 'none';
          window.uiModule.showNotification('Missing match request ID', 'error');
          acceptYesButton.disabled = false;
          acceptNoButton.disabled = false;
          acceptYesButton.textContent = originalYesText;
          return;
        }
      
        const session = await window.api.getSession();
        const sessionUserId = session?.id;
      
        if (!sessionUserId) {
          acceptModal.style.display = 'none';
          window.uiModule.showNotification('Missing session user ID', 'error');
          acceptYesButton.disabled = false;
          acceptNoButton.disabled = false;
          acceptYesButton.textContent = originalYesText;
          return;
        }
      
        try {
          const result = await window.api.acceptMatchRequest(acceptRequestId, sessionUserId);
          if (result.status === 'success') {
            acceptModal.style.display = 'none';
            window.uiModule.showNotification('Match accepted.', 'success');
            loadOpenMatchRequests();
          } else {
            window.uiModule.showNotification(result.message || 'Could not accept match.', 'error');
          }
        } catch (error) {
          console.error('Accept match error:', error);
          window.uiModule.showNotification('Server error while accepting match.', 'error');
        } finally {
          acceptYesButton.disabled = false;
          acceptNoButton.disabled = false;
          acceptYesButton.textContent = originalYesText;
        }
      };
      
      
  
    } catch (error) {
      console.error('Failed to load match requests:', error);
    }
  }//////////////
  
  

  setInterval(loadOpenMatchRequests, 2000);
  loadOpenMatchRequests();

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
    loadMatchSuggestions,
    loadOpenMatchRequests
}; 