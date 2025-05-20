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

/*
document.getElementById('my-matches-btn').addEventListener('click', async () => {
  document.querySelectorAll('.content-section').forEach(section => {
    section.style.display = 'none';
  });

  const tab = document.getElementById('my-matches-tab');
  tab.style.display = 'block';

  const contentDiv = document.getElementById('my-matches-content');
  contentDiv.innerHTML = '';

  try {
    const session = await window.api.getSession();
    if (!session || !session.id) {
      contentDiv.innerHTML = '<p>Please log in to view your matches.</p>';
      return;
    }

    const result = await window.api.getMyMatches(session.id);
    const matches = result.data || [];

    const myMatch = matches.find(m =>
      (m.team1_id == session.id || m.team2_id == session.id) &&
      m.current_match == 1
    );

    if (myMatch) {
      if (myMatch.status === 'in-progress') {
        const info = document.createElement('p');
        info.innerHTML = 'You have an <strong>in-progress</strong> match. Please proceed to score entry.';
        contentDiv.appendChild(info);
      } else if (myMatch.status === 'scheduled') {
        const scheduledCard = document.createElement('div');
        scheduledCard.className = 'match-preview-card';
        scheduledCard.innerHTML = `
          <div class="team-name left">${myMatch.team1_name || 'Team 1'}</div>
          <div class="match-info">
            <h3>${myMatch.game_name} - BO3</h3>
            <p><strong>Team Size:</strong> ${myMatch.team_size || 'N/A'}</p>
            <p><strong>Date:</strong> ${formatDate(myMatch.start_time)}</p>
            <p><strong>Time:</strong> ${formatTime(myMatch.start_time)}</p>
            <p><strong>Region:</strong> ${myMatch.region || 'N/A'}</p>
          </div>
          <div class="team-name right">${myMatch.team2_name || 'Team 2'}</div>
          <div class="team-buttons">
            <button class="btn-primary">View Team</button>
            <button class="btn-primary">View Team</button>
          </div>
        `;
        contentDiv.appendChild(scheduledCard);
      }
    } else {
      const info = document.createElement('p');
      info.textContent = 'You are not in a current match.';
      contentDiv.appendChild(info);
    }

    const completed = matches.filter(m => m.current_match == 0);
    renderCompletedMatches(completed);

  } catch (err) {
    console.error('[My Matches] Error:', err);
    contentDiv.innerHTML = '<p>Failed to load your match info.</p>';
  }
});////////////////



function renderCompletedMatches(matches) {
  const container = document.getElementById('my-matches-content');

  const oldSection = container.querySelector('.completed-matches-section');
  if (oldSection) {
    container.removeChild(oldSection);
  }

  const section = document.createElement('div');
  section.classList.add('completed-matches-section');
  section.innerHTML = `<h3>Completed Matches</h3>`;

  if (!matches || matches.length === 0) {
    section.innerHTML += '<p>You have no completed matches.</p>';
  } else {
    section.innerHTML += matches.map(m => `
      <div class="completed-match-card">
        <p><strong>Match #${m.match_id}:</strong> ${m.team1_name || 'Team 1'} vs ${m.team2_name || 'Team 2'}</p>
        <p><strong>Game:</strong> ${m.game_name} &nbsp; <strong>Team Size:</strong> ${m.team_size || 'N/A'}</p>
        <p><strong>Winner:</strong> ${m.winner_name || 'N/A'} &nbsp; <strong>Score:</strong> ${m.team1_score || 0} - ${m.team2_score || 0}</p>
        <p style="opacity: 0.7;">Date: ${formatDate(m.start_time)} at ${formatTime(m.start_time)}</p>
      </div>
    `).join('');
  }

  container.appendChild(section);
}////////////
*/




let cachedMatchData = {
  matches: [],
  session: null
};

async function preloadMatchesInBackground() {
  if (cachedMatchData.session && cachedMatchData.matches.length > 0) {
    return;
  }
  
  try {
    const session = await window.api.getSession();
    if (!session || !session.id) return;

    const result = await window.api.getMyMatches(session.id);
    if (result.status === 'success') {
      cachedMatchData = {
        session,
        matches: result.data || []
      };
    }
  } catch (err) {
    //console.error('[Background Match Preload Error]', err);
  }
}

async function renderCompletedMatches(matches) {
  const container = document.getElementById('my-matches-content');

  const oldSection = container.querySelector('.completed-matches-section');
  if (oldSection) container.removeChild(oldSection);

  const section = document.createElement('div');
  section.classList.add('completed-matches-section');
  section.innerHTML = `<h3 class="text-center mb-3">Completed Matches</h3>`;
  const filteredMatches = matches.filter(m => m.tournament_id == 0) .sort((a, b) => new Date(b.start_time) - new Date(a.start_time));

  if (filteredMatches.length === 0) {
    section.innerHTML += '<p>You have no completed matches.</p>';
  } else {
    for (const match of filteredMatches) {
      const team1 = match.team1_details;
      const team2 = match.team2_details;

      const team1Name = match.team1_details?.name || `Team 1`;
      const team2Name = match.team2_details?.name || `Team 2`;      

      const gameName = match.game_name;
      const teamSize = match.team_size || match.game_mode || 'N/A';
      const matchStatus = match.status;
      const winnerId = match.winner_id;

      let matchWinner = 'Draw';
      if (matchStatus === 'match-disputed') {
        matchWinner = 'Match Disputed';
      } else if (winnerId == 1 && team1) {
        matchWinner = team1.name;
      } else if (winnerId == 2 && team2) {
        matchWinner = team2.name;
      }

      let team1Score = 0;
      let team2Score = 0;
      let scoreText = '0 - 0';

      if (Array.isArray(match.rounds) && match.rounds.length > 0) {
        for (const round of match.rounds) {
          if (parseInt(round.round_winner_id) === 1) team1Score++;
          if (parseInt(round.round_winner_id) === 2) team2Score++;
        }

        scoreText = `${team1Score} - ${team2Score}`;

        if (match.rounds.some(r => r.proof === 'Win-via-Forfeit')) {
          scoreText = 'N/A - Forfeit';
        }
      } else if (matchStatus === 'match-disputed') {
        scoreText = 'Match Disputed';
      }

      const formattedStart = formatDate(match.start_time) + ' at ' + formatTime(match.start_time);

      const card = document.createElement('div');
      card.classList.add('card', 'mb-3', 'w-100');
      card.style.border = '1px solid #f07a3f';
      card.style.background = '#2f313b';
      card.style.padding = '1rem';
      card.style.borderRadius = '6px';
      card.style.marginBottom = '10px';

      card.innerHTML = `
      <div class="card-body" style="padding: 10px;">
        <h5 class="card-title mb-3" style="font-size: 20px; color: #f07a3f;">
          <strong>Match #${match.match_id} :</strong> 
          <span style="color: #fff;">${team1Name} vs ${team2Name}</span>
        </h5>
    
        <div class="d-flex flex-wrap justify-content-start align-items-center mb-2" style="font-size: 16px; gap: 2rem; font-family: Roboto, sans-serif;">
          <p class="mb-0"><span style="color: #f07a3f;">Game:</span> ${gameName}</p>
          <p class="mb-0"><span style="color: #f07a3f;">Team Size:</span> ${teamSize}</p>
          <p class="mb-0"><span style="color: #f07a3f;">Winner:</span> ${matchWinner}</p>
          <p class="mb-0"><span style="color: #f07a3f;">Score:</span> ${scoreText}</p>
        </div>
    
        <p class="mb-0 mt-1" style="font-size: 14px; color: #ccc;">Date: ${formattedStart}</p>
      </div>
    `;
    


      section.appendChild(card);
    }
  }

  container.appendChild(section);
}



//scores details and form
document.getElementById('my-matches-btn').addEventListener('click', async () => {
  await preloadMatchesInBackground();

  document.querySelectorAll('.content-section').forEach(section => {
    section.classList.remove('active');
  });
  document.getElementById('my-matches-tab').classList.add('active');

  const tab = document.getElementById('my-matches-tab');
  const contentDiv = document.getElementById('my-matches-content');
  contentDiv.innerHTML = '';

  const { session, matches } = cachedMatchData;

  if (!session || !matches || matches.length === 0) {
    contentDiv.innerHTML = '<p>No session or matches available.</p>';
    return;
  }

  const myMatch = matches.find(m =>
    (m.team1_id == session.id || m.team2_id == session.id) &&
    m.current_match == 1
  );

  if (myMatch) {

    const team1Name = myMatch.team1_details?.name || 'Team A';
    const team2Name = myMatch.team2_details?.name || 'Team B';
    const gameName = myMatch.game_name;
    const region = myMatch.request_details?.region || 'N/A';
    const teamSize = myMatch.request_details?.team_size || 'N/A';
    const map = myMatch.map_name || 'Coming soon';
    const formattedDate = formatDate(myMatch.start_time);
    const formattedTime = formatTime(myMatch.start_time);

    if (myMatch.status === 'in-progress') {
      contentDiv.innerHTML = `
      <div class="match-scores-details">
        <h2 style="text-align: center;">Current Match Details</h2>
        <div class="match-score-submission" style="margin-top: 1rem;">
          <div style="display: flex; justify-content: space-around; align-items: center; flex-wrap: wrap;">
            <div style="text-align: center; margin-bottom: 1rem;">
              <strong class="team-label">(${team1Name})</strong>
              <img src="/assets/images/no-image.png" alt="Team 1" style="max-width: 100px; display: block; margin: 10px auto;">
              <button class="btn-gradient">View Team</button>
            </div>
            <div class="match-center-info" style="text-align: center;">
              <h3>${gameName} - BO3</h3>
              <p>Team Size: ${teamSize}</p>
              <p>Map: ${map}</p>
              <p>Date: ${formattedDate}</p>
              <p>Time: ${formattedTime}</p>
              <p>Region: ${region}</p>
              <p>Status: <strong style="color: orange;">${myMatch.status}</strong></p>
            </div>
            <div style="text-align: center; margin-bottom: 1rem;">
              <strong class="team-label">(${team2Name})</strong>
              <img src="/assets/images/no-image.png" alt="Team 2" style="max-width: 100px; display: block; margin: 10px auto;">
              <button class="btn-gradient">View Team</button>
            </div>
          </div>
        </div>
      </div>


      <div class="match-score-submission">
          <div class="match-header">
            <h2>Submit Match Results</h2>
          </div>

          <form id="submit-score-form">
            <div class="form-group">
              <label for="winner">Select Match Winner:</label>
              <select id="winner" name="winner" class="form-select" required>
                <option value="">Select Winner</option>
                <option value="1">${team1Name}</option>
                <option value="2">${team2Name}</option>
                <option value="3">Draw</option>
              </select>
            </div>

            <div class="form-group">
              <label for="rounds_played">Rounds Played:</label>
              <select id="rounds_played" name="rounds_played" class="form-select" onchange="updateRounds()" required>
                <option value="2">2 Rounds</option>
                <option value="3">3 Rounds</option>
              </select>
            </div>

            <div id="score_inputs"></div>

            <div class="form-group" style="text-align: center; margin-top: 30px;">
              <input type="checkbox" id="no_proof" name="no_proof" onchange="toggleProofInput()" />
              <label for="no_proof" style="margin-left: 8px;">No proof available</label>
              <div style="font-size: 12px; color: var(--text-color); margin-top: 5px;">Check this box if you cannot provide proof.</div>

              <div style="margin-top: 20px;">
                <label for="proof" style="display: block; font-weight: bold; margin-bottom: 5px;">Provide link of Proof:</label>
                <input type="text" id="proof" name="proof" class="form-input" required
                  style="width: 90%; max-width: 800px; padding: 10px; border: 1px solid #ccc; border-radius: 5px; background: var(--bg-input, #fff); color: var(--text-color, #000);" />
                <div style="font-size: 12px; margin-top: 8px; color: var(--text-color);">
                  Note: Upload a screenshot or video to Google Drive and share the link.<br>
                  Rename as <code>GameName_Mode_Team_Round</code>.
                </div>
              </div>
            </div>
            
          <div class="form-group" style="display: flex; justify-content: center; gap: 15px; margin-top: 30px; flex-wrap: wrap;">
            <button type="submit" class="btn-submit"
              style="background: #28a745; color: white; padding: 12px 20px; border: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
              Submit
            </button>
            <button type="button" class="btn-forfeit"
              style="background: #007bff; color: white; padding: 12px 20px; border: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
              Forfeit
            </button>
            <button type="button" class="btn-dispute"
              style="background: #dc3545; color: white; padding: 12px 20px; border: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
              Dispute Match
            </button>
          </div>

          </form>
        </div>
      `;
      window.updateRounds = function () {
      const roundsPlayed = parseInt(document.getElementById('rounds_played').value);
      const teamA = document.querySelector('option[value="1"]').textContent;
      const teamB = document.querySelector('option[value="2"]').textContent;
      const container = document.getElementById('score_inputs');
      container.innerHTML = '';

      for (let i = 1; i <= roundsPlayed; i++) {
        container.innerHTML += `
          <div class="round-scores" style="margin-top: 30px;">
            <h5 style="text-align: center; font-size: 16px; margin-bottom: 15px;">Round ${i} Scores:</h5>
            <div class="form-row" style="display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;">
              <div class="form-group" style="flex: 1; min-width: 200px; max-width: 300px;">
                <label style="display: block; margin-bottom: 5px;">${teamA}:</label>
              <input type="text" name="round${i}_team1" class="form-input round-score-input" required
                placeholder="Enter ${teamA} score">
              </div>
              <div class="form-group" style="flex: 1; min-width: 200px; max-width: 300px;">
                <label style="display: block; margin-bottom: 5px;">${teamB}:</label>
              <input type="text" name="round${i}_team2" class="form-input round-score-input" required
                placeholder="Enter ${teamB} score">
              </div>
              <div class="form-group" style="flex: 1; min-width: 200px; max-width: 300px;">
                <label style="display: block; margin-bottom: 5px;">Round Winner:</label>
                <select name="round${i}_winner" class="form-select" required
                  style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; background: var(--bg-input, #fff); color: inherit;">
                  <option value="">Select Winner</option>
                  <option value="1">${teamA}</option>
                  <option value="2">${teamB}</option>
                  <option value="3">Draw</option>
                </select>
              </div>
            </div>
          </div>
        `;
      }

    };

      window.toggleProofInput = function () {
        const checkbox = document.getElementById('no_proof');
        const proofInput = document.getElementById('proof');
        proofInput.disabled = checkbox.checked;
        if (checkbox.checked) proofInput.value = '';
      };

      updateRounds();
      return; 
    } else if (myMatch.status === 'unconfirmed') {
      const round = myMatch.rounds?.[0];
      const submittedBy = round?.score_submitted_by_user_id;
      const currentUserId = session.id;

      const team1 = myMatch.team1_details?.name || 'Team A';
      const team2 = myMatch.team2_details?.name || 'Team B';
      const matchWinner =
        myMatch.rounds?.[0]?.match_winner_id == '1' ? team1 :
        myMatch.rounds?.[0]?.match_winner_id == '2' ? team2 :
        'Draw';
      const gameName = myMatch.game_name;
      const formattedDate = formatDate(myMatch.start_time);
      const formattedTime = formatTime(myMatch.start_time);

      let roundResultsHTML = myMatch.rounds.map((r, index) => {
        const winner =
          r.round_winner_id == '1' ? team1 :
          r.round_winner_id == '2' ? team2 :
          'Draw';
        return `
          <div style="background: #5b6673; border: 1px solid #ccc; border-radius: 8px; padding: 15px; margin-bottom: 15px; color: white;">
            <strong>Round ${r.round_number}</strong><br>
            Round Winner : <span style="color: #f07a3f; font-weight: bold;">${winner}</span><br>
            ${team1} : ${r.team_1_score}<br>
            ${team2} : ${r.team_2_score}
          </div>
        `;
      }).join('');

      if (submittedBy == currentUserId) {
        contentDiv.innerHTML = `
          <div class="match-score-submission">
            <h2 style="text-align: center;">Confirm Match Results</h2>
            <p style="text-align: center; font-size: 18px;">
              Match Winner: <strong style="color: orange;">${matchWinner}</strong>
            </p>
            <p style="text-align: center; font-size: 16px;">${gameName}</p>
            <p style="text-align: center; font-size: 14px;">Date: <strong>${formattedDate}</strong> at <strong>${formattedTime}</strong></p>
            ${roundResultsHTML}
            <div style="text-align: center; font-size: 14px; margin-top: 15px;">
              Waiting for other team to confirm results. If results aren't confirmed in 10 mins, match will auto-confirm based on current results.
            </div>
          </div>
        `;
      } else {
        contentDiv.innerHTML = `
          <div class="match-score-submission">
            <h2 style="text-align: center;">Confirm Match Results</h2>
            <p style="text-align: center; font-size: 18px;">
              Match Winner: <strong style="color: orange;">${matchWinner}</strong>
            </p>
            <p style="text-align: center; font-size: 16px;">${gameName}</p>
            <p style="text-align: center; font-size: 14px;">Date: <strong>${formattedDate}</strong> at <strong>${formattedTime}</strong></p>
            ${roundResultsHTML}
            <div style="display: flex; justify-content: center; gap: 20px; margin-top: 20px;">
              <button class="btn-confirm" onclick="confirmMatch(${myMatch.match_id})">Confirm Results</button>
              <button class="btn-dispute" onclick="disputeMatch(${myMatch.match_id})">Dispute Results</button>
            </div>
          </div>
        `;

        setTimeout(() => {
          confirmMatch(myMatch.match_id);
        }, 600000);
      }
    } else if (myMatch.status === 'scheduled') {
      const team1Name = myMatch.team1_details?.name || 'Team 1';
      const team2Name = myMatch.team2_details?.name || 'Team 2';
    
      const formattedDate = formatDate(myMatch.start_time);
      const formattedTime = formatTime(myMatch.start_time);
    
      const gameName = myMatch.game_name;
      const teamSize = myMatch.team_size || myMatch.request_details?.team_size || 'N/A';
      const region = myMatch.region || myMatch.request_details?.region || 'N/A';
    
      const card = document.createElement('div');
      card.style.background = '#1e1e1e';
      card.style.borderRadius = '8px';
      card.style.padding = '2rem';
      card.style.marginBottom = '2rem';
      card.style.textAlign = 'center';
      card.style.color = '#fff';
    
      card.innerHTML = `
        <h3 style="font-size: 26px; margin-bottom: 1.5rem;">Upcoming Match</h3>
        <div style="display: flex; justify-content: space-around; align-items: center; flex-wrap: wrap; gap: 1rem; background: #222; padding: 1.5rem; border-radius: 10px;">
          
          <div style="text-align: center;">
            <div style="font-weight: 600; font-size: 18px;">${team1Name}</div>
            <button class="btn-primary" style="
              margin-top: 0.5rem;
              padding: 8px 16px;
              background: linear-gradient(135deg, #ff8a00, #e52e71);
              border: none;
              border-radius: 6px;
              color: white;
              font-weight: bold;
            ">View Team</button>
          </div>
    
          <div style="text-align: center;">
            <div style="font-size: 20px; font-weight: bold; margin-bottom: 10px;">${gameName} - BO3</div>
            <div><strong>Team Size:</strong> ${teamSize}</div>
            <div><strong>Date:</strong> ${formattedDate}</div>
            <div><strong>Time:</strong> ${formattedTime}</div>
            <div><strong>Region:</strong> ${region}</div>
          </div>
    
          <div style="text-align: center;">
            <div style="font-weight: 600; font-size: 18px;">${team2Name}</div>
            <button class="btn-primary" style="
              margin-top: 0.5rem;
              padding: 8px 16px;
              background: linear-gradient(135deg, #ff8a00, #e52e71);
              border: none;
              border-radius: 6px;
              color: white;
              font-weight: bold;
            ">View Team</button>
          </div>
        </div>
      `;
    
      contentDiv.appendChild(card);
    }
    
  } else {
    const info = document.createElement('p');
    info.textContent = 'You are not in a current match.';
    contentDiv.appendChild(info);
  }

  if (!myMatch || myMatch.status !== 'unconfirmed') {
    const completed = matches.filter(m => m.current_match == 0);
    renderCompletedMatches(completed);
  }

});//////////////


function renderRoundsHTML(match) {
  const team1 = match.team1_details?.name || 'Team A';
  const team2 = match.team2_details?.name || 'Team B';

  return match.rounds.map(r => {
    const winner =
      r.round_winner_id == '1' ? team1 :
      r.round_winner_id == '2' ? team2 :
      'Draw';

    return `
      <div style="background: #5b6673; border: 1px solid #ccc; border-radius: 8px; padding: 15px; margin-bottom: 15px; color: white;">
        <div style="font-weight: bold; font-size: 16px;">Round ${r.round_number}</div>
        <div style="margin-top: 5px;">
          Round Winner : <span style="color: #f07a3f; font-weight: bold;">${winner}</span>
        </div>
        <div style="margin-top: 5px;">${team1} : ${r.team_1_score}</div>
        <div>${team2} : ${r.team_2_score}</div>
      </div>
    `;
  }).join('');
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
  

  //load match requests
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
          //const response = await fetch('https://vrbattles.gg/api/matches/cancel_request', {
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


// fetch current user's matches
let backgroundMatches = [];

async function pollMatchesInBackground() {
  const session = await window.api.getSession();
  if (!session || !session.id) return;

  const result = await window.api.getMyMatches(session.id);
  if (result.status === 'success') {
    backgroundMatches = result.data || [];
    //console.log('[Background Poll] Matches updated:', backgroundMatches);
  } else {
    //console.warn('[Background Poll] Failed to fetch matches:', result.message || result);
  }
}

setInterval(pollMatchesInBackground, 5000);

pollMatchesInBackground();


document.addEventListener('submit', async (e) => {
  if (e.target.id !== 'submit-score-form') return;

  e.preventDefault();
  e.stopPropagation();

  const form = e.target;
  const submitBtn = form.querySelector('.btn-submit');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';

  const winner = form.winner.value;
  const roundsPlayed = parseInt(form.rounds_played.value);
  const proof = form.proof.value;
  const noProof = form.no_proof.checked ? 1 : 0;
  const session = cachedMatchData.session;
  const matchId = cachedMatchData.matches.find(m => m.current_match == 1)?.match_id;

  const team_scores = {};
  for (let i = 1; i <= roundsPlayed; i++) {
    team_scores[`round${i}`] = {
      team_a: form[`round${i}_team1`].value,
      team_b: form[`round${i}_team2`].value,
      winner: form[`round${i}_winner`].value
    };
  }

  const payload = {
    match_id: matchId,
    user_id: session.id,
    winner,
    proof: noProof ? 0 : proof,
    team_scores
  };

  try {
    const response = await fetch('http://localhost/api/matches/submit_scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (result.status === 'success') {
      const refetch = await fetch('http://localhost/api/fetch/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: session.id })
      });

      const refetchResult = await refetch.json();
      if (refetchResult.status === 'success') {
        cachedMatchData.matches = refetchResult.data;

        document.getElementById('my-matches-tab').classList.add('active');
        loadMyMatchTab();
      } else {
        alert('Failed to reload updated match info.');
      }
    } else {
      alert(result.message || 'Failed to submit score.');
    }
  } catch (error) {
    console.error('[Score Submit Error]', error);
    alert('An error occurred while submitting the score.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit';
  }
});


async function confirmMatch(matchId) {
  const session = await window.api.getSession();
  const userId = session?.id;
  if (!userId) return alert('Session error');

  const currentMatch = cachedMatchData.matches.find(m => m.match_id == matchId);
  if (!currentMatch) return alert('Match not found.');
  //console.log('[Current Match]', currentMatch);

  const team1_id = currentMatch.team1_id;
  const team2_id = currentMatch.team2_id;
  const team1_team_id = currentMatch.team1_details?.id;
  const team2_team_id = currentMatch.team2_details?.id;

  const game_name = currentMatch.game_name;
  const game_mode = currentMatch.game_mode || currentMatch.request_details?.team_size || 'N/A';

  const match_winner_id = currentMatch.rounds?.[0]?.match_winner_id;
  const match_loser_id = match_winner_id == 1 ? 2 : 1;
  const match_winner = match_winner_id == 1 ? team1_id : team2_id;
  const match_loser = match_loser_id == 1 ? team1_id : team2_id;

  const forfeit_value = currentMatch.rounds?.some(r => r.proof === 'Win-via-Forfeit') ? 'true' : 'false';

  const matchDetails = currentMatch.rounds?.map(r => ({
    team_1_score: parseInt(r.team_1_score),
    team_2_score: parseInt(r.team_2_score)
  })) || [];

  //console.log('[Match Details]', matchDetails);
  //console.log('[Team IDs]', { team1_id, team2_id, team1_team_id, team2_team_id });
  //console.log('[Game]', { game_name, game_mode });
  //console.log('[Match Outcome]', { match_winner_id, match_loser_id, match_winner, match_loser, forfeit_value });

  const response = await fetch('http://localhost/api/fetch/get_teams_by_ids', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ team_ids: [team1_team_id, team2_team_id] })
  });

  const allTeams = await response.json();
  //console.log('[Fetched Teams]', allTeams);
  if (allTeams.status !== 'success') return alert('Failed to fetch teams');

  const team1 = allTeams.data.find(t => parseInt(t.id) === parseInt(team1_team_id));
  const team2 = allTeams.data.find(t => parseInt(t.id) === parseInt(team2_team_id));
  if (!team1 || !team2) return alert('Teams not found');

  const extractRatings = (players) => {
    const ratings = {};
    players.forEach(p => {
      const data = typeof p.player_data === 'string'
        ? JSON.parse(p.player_data || '{}')
        : (p.player_data || {});

      const mmr = data.player_mmr || {};
      const mu = parseFloat(mmr.mu);
      const sigma = parseFloat(mmr.sigma);
      const ordinal = parseFloat(mmr.ordinal);

      //console.log(`[Player ${p.username} MMR] mu: ${mu}, sigma: ${sigma}, ordinal: ${ordinal}`);

      ratings[p.id] = {
        mu: !isNaN(mu) && mu > 0 ? mu : 25,
        sigma: !isNaN(sigma) && sigma > 0 ? sigma : 8.333
      };
    });
    return ratings;
  };

  const team1_player_ids = team1.players.map(p => p.id);
  const team2_player_ids = team2.players.map(p => p.id);
  const team1_ratings = extractRatings(team1.players);
  const team2_ratings = extractRatings(team2.players);

  //console.log('[Team 1 Players]', team1.players);
  //console.log('[Team 2 Players]', team2.players);
  //console.log('[Extracted Ratings]', { team1_ratings, team2_ratings });

  const prevRatingTeam1 = {
    mu: parseFloat(team1.mu) || 25,
    sigma: parseFloat(team1.sigma) || 8.333
  };
  const prevRatingTeam2 = {
    mu: parseFloat(team2.mu) || 25,
    sigma: parseFloat(team2.sigma) || 8.333
  };

  //console.log('[Previous Team Ratings]', { team1: prevRatingTeam1, team2: prevRatingTeam2 });

  const mmrPayload = {
    team1_player_ids,
    team2_player_ids,
    team1_ratings,
    team2_ratings,
    prevRatingTeam1,
    prevRatingTeam2,
    matchDetails
  };

  //console.log('[MMR Payload]', mmrPayload);

  const mmrResult = await window.api.calculateMMR(mmrPayload);
  //console.log('[MMR Result]', mmrResult);

  if (mmrResult.status !== 'success') return alert('Failed to calculate MMR');

  const confirmPayload = {
    match_id: matchId,
    user_id: userId,
    winner_id: match_winner,
    loser_id: match_loser,
    team_winner: team1_id === match_winner ? team1_team_id : team2_team_id,
    team_loser: team1_id === match_loser ? team1_team_id : team2_team_id,
    match_winner,
    match_loser,
    mu1: mmrResult.team1_avg.mu,
    sigma1: mmrResult.team1_avg.sigma,
    ordinal1: mmrResult.team1_avg.ordinal,
    mu2: mmrResult.team2_avg.mu,
    sigma2: mmrResult.team2_avg.sigma,
    ordinal2: mmrResult.team2_avg.ordinal,
    team1_id,
    team2_id,
    team1_team_id,
    team2_team_id,
    game_name,
    game_mode,
    forfeit_value,
    team1_ratings: JSON.stringify(mmrResult.team1_players),
    team2_ratings: JSON.stringify(mmrResult.team2_players)
  };

  //console.log('[Final Confirm Payload]', confirmPayload);

  try {
      const confirmBtn = document.querySelector('.btn-confirm');
      if (confirmBtn) confirmBtn.disabled = true;
      
    const response = await fetch('http://localhost/api/matches/confirm_match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(confirmPayload)
    });

    const result = await response.json();
    //console.log('[Confirm Match Response]', result);

    if (result.status === 'success') {
      window.uiModule.showNotification('Match confirmed successfully!', 'success');

      setTimeout(async () => {
        await preloadMatchesInBackground();
        loadMyMatchTab();
      }, 2000);
    } else {
      alert(result.message || 'Failed to confirm match.');
    }
  } catch (err) {
    //console.error('[Confirm Match Error]', err);
    alert('An error occurred while confirming match.');
  }
}/////////////







/*document.addEventListener('submit', async (e) => {
  if (e.target.id !== 'submit-score-form') return;
  e.preventDefault();

  const form = e.target;
  const submitBtn = form.querySelector('.btn-submit');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';

  const winner = form.winner.value;
  const roundsPlayed = parseInt(form.rounds_played.value);
  const proof = form.proof.value;
  const noProof = form.no_proof.checked ? 1 : 0;
  const session = cachedMatchData.session;
  const matchId = cachedMatchData.matches.find(m => m.current_match == 1)?.match_id;

  const team_scores = {};
  for (let i = 1; i <= roundsPlayed; i++) {
    team_scores[`round${i}`] = {
      team_a: form[`round${i}_team1`].value,
      team_b: form[`round${i}_team2`].value,
      winner: form[`round${i}_winner`].value
    };
  }

  const payload = {
    match_id: matchId,
    user_id: session.id,
    winner,
    proof: noProof ? 0 : proof,
    team_scores
  };

  console.log('[Submitting Payload]', payload);

  try {
    const response = await fetch('http://localhost/api/matches/submit_scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (result.status === 'success') {
      alert('Score submitted successfully!');
      // document.getElementById('my-matches-btn').click(); // enable this if needed
    } else {
      alert(result.message || 'Failed to submit score.');
    }
  } catch (error) {
    console.error('[Score Submit Error]', error);
    alert('An error occurred while submitting the score.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit';
  }
});*/



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
preloadMatchesInBackground();
setInterval(preloadMatchesInBackground, 1000);


async function loadMyMatchTab() {
  if (!cachedMatchData.session || cachedMatchData.matches.length === 0) {
    await preloadMatchesInBackground();
  }

  document.querySelectorAll('.content-section').forEach(section => {
    section.classList.remove('active');
  });
  document.getElementById('my-matches-tab').classList.add('active');

  const tab = document.getElementById('my-matches-tab');
  const contentDiv = document.getElementById('my-matches-content');
  contentDiv.innerHTML = '';

  const { session, matches } = cachedMatchData;

  if (!session || !matches || matches.length === 0) {
    contentDiv.innerHTML = '<p>No session or matches available.</p>';
    return;
  }

  const myMatch = matches.find(m =>
    (m.team1_id == session.id || m.team2_id == session.id) &&
    m.current_match == 1
  );

  if (myMatch) {
    document.getElementById('my-matches-btn').click();
    return;
  } else {
    const info = document.createElement('p');
    info.textContent = 'You are not in a current match.';
    contentDiv.appendChild(info);
  }

  if (!myMatch || myMatch.status !== 'unconfirmed') {
    const completed = matches.filter(m => m.current_match == 0);
    renderCompletedMatches(completed);
  }
}

let lastMatchStatus = null;
let lastMatchId = null;

async function watchMatchStatus() {
  try {
    const session = await window.api.getSession();
    if (!session || !session.id) return;

    const result = await window.api.getMyMatches(session.id);
    if (result.status !== 'success') return;

    const currentMatch = result.data.find(m =>
      (m.team1_id == session.id || m.team2_id == session.id) &&
      m.current_match == 1
    );

    if (!currentMatch && (lastMatchStatus !== null || lastMatchId !== null)) {
      const isTabActive = document.getElementById('my-matches-tab')?.classList.contains('active');
      if (isTabActive) {
        cachedMatchData = {
          session,
          matches: result.data
        };
        loadMyMatchTab();
      }
      lastMatchStatus = null;
      lastMatchId = null;
      return;
    }


    const currentStatus = currentMatch.status;
    const currentId = currentMatch.match_id;

    if (lastMatchStatus === null || lastMatchId === null) {
      lastMatchStatus = currentStatus;
      lastMatchId = currentId;
      return;
    }

    const statusChanged = currentStatus !== lastMatchStatus;
    const matchChanged = currentId !== lastMatchId;

    if (statusChanged || matchChanged) {
      lastMatchStatus = currentStatus;
      lastMatchId = currentId;

      const isTabActive = document.getElementById('my-matches-tab')?.classList.contains('active');
      if (isTabActive) {

        cachedMatchData = {
          session,
          matches: result.data
        };

        loadMyMatchTab();
      }
    }

  } catch (error) {
    //console.error('[watchMatchStatus Error]', error);
  }
}
setInterval(watchMatchStatus, 1000);



// Export module
window.matchfinderUIModule = {
    initMatchfinderUI,
    handleQuickMatch,
    handleCustomMatch,
    loadMatchSuggestions,
    loadOpenMatchRequests
    
}; 