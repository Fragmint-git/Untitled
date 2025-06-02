/**
 * Admin Panel Entry Point
 * Loads the admin module and initializes the admin panel
 */

// Load admin module
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Loading admin panel...');
    
    try {
        // Load the main admin module
        await loadScript('../js/modules/admin/admin.js');
        
        // Initialize the admin panel
        if (window.adminModule) {
            window.adminModule.init();
        } else {
            console.error('Admin module not found');
        }
    } catch (error) {
        console.error('Error initializing admin panel:', error);
        showErrorMessage('Failed to initialize admin panel. Please refresh the page.');
    }
});

// Helper function to load a script
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = (error) => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(script);
    });
}

// Show error message
function showErrorMessage(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    document.body.appendChild(errorElement);
}

// Admin Panelt
import ReleaseNotes from './modules/admin/release-notes.js';

document.addEventListener('DOMContentLoaded', function() {
    ReleaseNotes.init();
    
    const adminMenuLinks = document.querySelectorAll('.admin-menu-link');
    const adminSections = document.querySelectorAll('.admin-section');
    
    adminMenuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            if (this.closest('.back-to-app')) return;

            adminMenuLinks.forEach(l => l.classList.remove('active'));
            adminSections.forEach(s => s.classList.remove('active'));

            this.classList.add('active');

            const sectionId = 'admin-' + this.dataset.section;
            const targetSection = document.getElementById(sectionId);
            if (targetSection) targetSection.classList.add('active');

            if (this.dataset.section === 'matches') {
                loadAdminMatches();
            } else if (this.dataset.section === 'teams') {
                loadAdminTeams();
            } else if (this.dataset.section === 'disputes') {
                loadDisputedMatches();
            } else if (this.dataset.section === 'games' && window.adminGamesTabModule) {
                window.adminGamesTabModule.initGamesTab();
            } else if (this.dataset.section === 'players' && window.adminGamesTabModule) {
                loadAdminPlayers();
            }


        });
    });

    
    // Admin settings form submission
    const adminSettingsForm = document.getElementById('admin-settings-form');
    if (adminSettingsForm) {
        adminSettingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Here would be the code to save settings
            alert('Settings saved successfully!');
        });
    }
    
    // Populate admin dashboard with sample data
    //populateDashboardData();
    loadAdminMatches();
    loadAdminTeams();
    loadDisputedMatches();
})

// Sample data for admin dashboard
/*function populateDashboardData() {
    // Update stat counts
    const gamesEl = document.getElementById('total-games-count');
    if (gamesEl) gamesEl.textContent = '12';

    const tournamentsEl = document.getElementById('total-tournaments-count');
    if (tournamentsEl) tournamentsEl.textContent = '24';

    const playersEl = document.getElementById('total-players-count');
    if (playersEl) playersEl.textContent = '345';

    const activeEl = document.getElementById('active-tournaments-count');
    if (activeEl) activeEl.textContent = '5';

    
    // Sample activity data
    const activities = [
        { time: '2 hours ago', message: 'New tournament created: Spring Championship 2023' },
        { time: '3 hours ago', message: 'Player JohnDoe123 registered for Summer Cup' },
        { time: '5 hours ago', message: 'New game added: Cosmic Clash VR' },
        { time: '1 day ago', message: 'Tournament concluded: Winter Series Finals' },
        { time: '2 days ago', message: 'System maintenance completed' }
    ];
    
    // Populate activity list
    const activityList = document.getElementById('recent-activity-list');
    if (activityList) {
        activityList.innerHTML = '';
        
        activities.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <div class="activity-time">${activity.time}</div>
                <div class="activity-message">${activity.message}</div>
            `;
            activityList.appendChild(activityItem);
        });
    }
} */





// GAMES STARTS =================================================================================

/*async function loadAdminGames() {
    try {
        const res = await window.api.getAllGames();
        const tbody = document.getElementById('games-table-body');
        tbody.innerHTML = '';

        if (Array.isArray(res?.data)) {
            res.data.forEach(game => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${game.id}</td>
                    <td><img src="${game.logo}" alt="Logo" style="width: 60px; height: 60px; object-fit: cover;"></td>
                    <td>${game.date_created?.split(' ')[0] || 'N/A'}</td>
                    <td>${game.name}</td>
                    <td>${game.status || 'Open'}</td>
                    <td><button class="btn-primary">EDIT</button></td>
                `;
                row.querySelector('button')?.addEventListener('click', () => {
                    loadGameEditor(game);
                });

                tbody.appendChild(row);
            });
        } else {
            tbody.innerHTML = `<tr><td colspan="6">No games found</td></tr>`;
        }
    } catch (err) {
        console.error('Error loading games:', err);
        document.getElementById('games-table-body').innerHTML = `<tr><td colspan="6">Failed to load games</td></tr>`;
    }
}*/


function loadGameEditor(game) {
    document.querySelectorAll('.admin-section').forEach(sec => {
        sec.classList.remove('active');
        sec.style.display = 'none';
    });

    document.getElementById('admin-game-edit').classList.add('active');
    document.getElementById('admin-game-edit').style.display = 'block';

    const container = document.getElementById('edit-game-container');
    container.innerHTML = `
        <div style="text-align: center; margin-bottom: 2rem;">
            <h2 style="font-size: 1.8rem; font-weight: bold;">EDIT GAME #${game.id}</h2>
            <h3 style="font-size: 1.4rem; margin-top: 0.5rem;">${game.name}</h3>
            <button id="delete-game-btn" class="btn-danger" style="margin-top: 1rem; padding: 0.5rem 1.5rem; font-size: 1rem;">DELETE</button>
        </div>

        <div style="max-width: 800px; margin: 2rem auto; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 2rem;">
            <div style="flex: 1; min-width: 240px; text-align: center;">
                <img src="${game.logo}" alt="Game Logo" style="width: 160px; height: 160px; object-fit: cover; border: 2px solid orange; border-radius: 8px; margin-bottom: 1rem;">
                <input type="file" id="edit-game-logo" class="form-control" style="margin-top: 0.5rem;">
            </div>

            <div style="flex: 2; min-width: 300px;">
                <div style="margin-bottom: 1.25rem;">
                    <label style="font-weight: bold; display: block; margin-bottom: 0.3rem;">Game Name</label>
                    <input id="edit-game-name" class="form-control" value="${game.name}" style="padding: 0.65rem; width: 100%; border-radius: 6px;">
                </div>

                <div style="margin-bottom: 1.25rem;">
                    <label style="font-weight: bold; display: block; margin-bottom: 0.3rem;">Game Bio</label>
                    <textarea id="edit-game-bio" rows="5" class="form-control" style="padding: 0.65rem; width: 100%; border-radius: 6px;">${game.bio || ''}</textarea>
                </div>

                <div>
                    <label style="font-weight: bold; display: block; margin-bottom: 0.3rem;">Status</label>
                    <select id="edit-game-status" class="form-control" style="padding: 0.65rem; width: 100%; border-radius: 6px;">
                        <option value="1" ${game.status === 'Open' ? 'selected' : ''}>Open</option>
                        <option value="0" ${game.status === 'Closed' ? 'selected' : ''}>Closed</option>
                    </select>
                </div>
            </div>
        </div>

        <div style="text-align: center; margin-top: 2.5rem;">
            <button id="save-game-btn" class="btn-primary" style="padding: 0.75rem 2rem; font-size: 1rem;">SAVE</button>
        </div>
    `;


    document.getElementById('back-to-games-btn')?.addEventListener('click', () => {
        document.querySelectorAll('.admin-section').forEach(sec => {
            sec.classList.remove('active');
            sec.style.display = 'none';
        });

        const gamesSection = document.getElementById('admin-games');
        gamesSection.classList.add('active');
        gamesSection.style.display = 'block';
        loadAdminGames();
    });

    document.getElementById('save-game-btn')?.addEventListener('click', async () => {
    const payload = {
        editid: game.id,
        name: document.getElementById('edit-game-name').value,
        game_bio: document.getElementById('edit-game-bio').value,
        status: document.getElementById('edit-game-status').value
    };


        try {
            //const res = await fetch('http://localhost/api/games/games_update', {
            const res = await fetch('https://vrbattles.gg/api/games/games_update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await res.json();
            window.adminModule.showMessage(result.message || 'Game saved', result.status || 'success');
        } catch (err) {
            window.adminModule.showMessage('Error saving game.', 'error');
        }
    });

    document.getElementById('delete-game-btn')?.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to delete this game?')) return;

        try {
            //const res = await fetch('http://localhost/api/games/delete', {
            const res = await fetch('https://vrbattles.gg/api/games/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: game.id })
            });

            const result = await res.json();
            window.adminModule.showMessage(result.message || 'Game deleted', result.status || 'success');
            document.getElementById('back-to-games-btn')?.click();
        } catch (err) {
            window.adminModule.showMessage('Error deleting game.', 'error');
        }
    });
}
window.loadGameEditor = loadGameEditor;

// GAMES STARTS =================================================================================





// MATCHES STARTS =================================================================================

//load matches
async function loadAdminMatches() {
    try {
        const res = await window.api.getAllMatches();
        const tbody = document.getElementById('matches-table-body');
        tbody.innerHTML = '';

        if (Array.isArray(res?.data)) {
            res.data.forEach(match => {
                if (match.status === 'disputed' || match.status === 'match-disputed') return;

                const row = document.createElement('tr');

                row.innerHTML = `
                    <td>${match.match_id}</td>
                    <td>${match.game_name}</td>
                    <td>${match.game_mode || ''}</td>
                    <td>${match.status}</td>
                    <td>${match.start_time?.slice(0, 16)}</td>
                    <td>${match.team1_details?.name || match.team1_id}</td>
                    <td>${match.team2_details?.name || match.team2_id}</td>
                    <td>${
                        Number(match.winner_id) === 1
                            ? (match.team1_details?.name || match.team1_id)
                            : Number(match.winner_id) === 2
                                ? (match.team2_details?.name || match.team2_id)
                                : Number(match.winner_id) === 3
                                    ? 'Draw'
                                    : 'N/A'
                    }</td>
                    <td>
                        <button class="btn-primary">EDIT</button>
                    </td>
                `;

                row.querySelector('button')?.addEventListener('click', () => {
                    loadMatchEditor(match);
                });

                tbody.appendChild(row);
            });

        } else {
            tbody.innerHTML = `<tr><td colspan="9">No matches found</td></tr>`;
        }
    } catch (err) {
        console.error('Error fetching matches:', err);
        const tbody = document.getElementById('matches-table-body');
        tbody.innerHTML = `<tr><td colspan="9">Failed to load matches</td></tr>`;
    }
}

//edit matches
function loadMatchEditor(match) {
    document.querySelectorAll('.admin-section').forEach(sec => {
        sec.classList.remove('active');
        sec.style.display = 'none';
    });

    const matchEditSection = document.getElementById('admin-match-edit');
    matchEditSection.classList.add('active');
    matchEditSection.style.display = 'block';

    document.querySelectorAll('.admin-menu-link').forEach(link => link.classList.remove('active'));
    document.querySelector('.admin-menu-link[data-section="match-edit"]')?.classList.add('active');

    const container = document.getElementById('edit-match-container');

    let roundsHTML = '';
    if (Array.isArray(match.rounds) && match.rounds.length > 0) {
        match.rounds.forEach((round, index) => {
            roundsHTML += `
                <h3 style="margin-bottom: 0.5rem; font-size: 1.25rem;">Round ${round.round_number}</h3>
                <div style="display: flex; justify-content: center; gap: 2rem; margin-bottom: 1.5rem;">
                    <label style="display: flex; flex-direction: column; align-items: center; font-size: 1rem;">
                        ${match.team1_details?.name || 'Team 1'}:
                        <input type="number" class="score-input" data-round="${round.round_number}" data-team="1" value="${round.team_1_score || 0}"
                            style="width: 120px; padding: 0.6rem; background: #111; color: white; border: none; border-radius: 6px; text-align: center; font-size: 1rem;">
                    </label>
                    <label style="display: flex; flex-direction: column; align-items: center; font-size: 1rem;">
                        ${match.team2_details?.name || 'Team 2'}:
                        <input type="number" class="score-input" data-round="${round.round_number}" data-team="2" value="${round.team_2_score || 0}"
                            style="width: 120px; padding: 0.6rem; background: #111; color: white; border: none; border-radius: 6px; text-align: center; font-size: 1rem;">
                    </label>
                </div>
            `;
        });

        roundsHTML += `
            <div style="text-align: center; margin-bottom: 2rem;">
                <button id="save-scores-btn" class="btn-primary" style="padding: 0.75rem 2rem; font-size: 1rem;">SAVE SCORES</button>
            </div>
        `;
    }

    container.innerHTML = `
        <div style="max-width: 800px; margin: 0 auto; text-align: center; margin-bottom: 50px">
            <h3 style="margin-bottom: 0.3rem; font-size: 1.5rem;">EDIT MATCH # ${match.match_id}</h3>
            <p style="margin-bottom: 0.2rem; font-size: 1.1rem;">(${match.game_name} - ${match.game_mode})</p>
            <p style="font-weight: bold; margin-bottom: 0.2rem; font-size: 1.1rem;">
                ${match.team1_details?.name || match.team1_id} VS ${match.team2_details?.name || match.team2_id}
            </p>
            <p style="margin-bottom: 2rem; font-size: 1rem;">${match.start_time?.slice(0, 16)}</p>

            <button class="btn-danger" style="margin-bottom: 2rem; font-size: 1rem; padding: 0.5rem 1.2rem;">DELETE</button>

            ${roundsHTML}

            <div style="display: flex; justify-content: center; align-items: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
                <label style="font-size: 1rem;">Winner</label>
                <select id="edit-match-winner" class="form-control" style="padding: 0.6rem 1rem; font-size: 1rem;">
                    <option value="">Select</option>
                    <option value="1" ${match.winner_id == 1 ? 'selected' : ''}>${match.team1_details?.name || 'Team 1'}</option>
                    <option value="2" ${match.winner_id == 2 ? 'selected' : ''}>${match.team2_details?.name || 'Team 2'}</option>
                    <option value="3" ${match.winner_id == 3 ? 'selected' : ''}>Draw</option>
                </select>

                <label style="font-size: 1rem;">Match Status</label>
                <select id="edit-match-status" class="form-control" style="padding: 0.6rem 1rem; font-size: 1rem;">
                    <option value="confirmed" ${match.status === 'confirmed' ? 'selected' : ''}>confirmed</option>
                    <option value="disputed" ${match.status === 'disputed' ? 'selected' : ''}>disputed</option>
                    <option value="match-disputed" ${match.status === 'match-disputed' ? 'selected' : ''}>match-disputed</option>
                    <option value="pending" ${match.status === 'pending' ? 'selected' : ''}>pending</option>
                </select>
            </div>

            <button id="save-status-btn" class="btn-primary" style="padding: 0.75rem 2rem; font-size: 1rem;">SAVE STATUS</button>
        </div>
    `;

    document.getElementById('save-scores-btn')?.addEventListener('click', () => {
        submitMatchScores(
            match.match_id,
            match.team1_team_id,
            match.team2_team_id
        );
    });

    document.getElementById('save-status-btn')?.addEventListener('click', () => {
        submitMatchStatus(
            match.match_id
        );
    });
}

//save match scores
async function submitMatchScores(matchId, team1Id, team2Id) {
    const scoreInputs = document.querySelectorAll('.score-input');
    const scores = {};

    scoreInputs.forEach(input => {
        const round = input.dataset.round;
        const team = input.dataset.team;
        if (!scores[round]) scores[round] = {};
        scores[round][`team${team}_score`] = parseInt(input.value) || 0;
    });

    const payload = {
        editid: matchId,
        team1_team_id: team1Id,
        team2_team_id: team2Id,
        scores: scores
    };

    try {
        //const res = await fetch('http://localhost/api/matches/save_match_scores', {
        const res = await fetch('https://vrbattles.gg/api/matches/save_match_scores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await res.json();
        if (result.status === 'success') {
            window.adminModule.showMessage('Scores saved successfully.', 'success');
        } else {
            window.adminModule.showMessage(result.message || 'Failed to save scores.', 'error');
        }
    } catch (err) {
        //console.error('Error saving scores:', err);
        window.adminModule.showMessage('Error saving scores.', 'error');
    }
}

//save match status
async function submitMatchStatus(matchId) {
    const winnerId = document.getElementById('edit-match-winner')?.value;
    const matchStatus = document.getElementById('edit-match-status')?.value;

    if (!matchStatus) {
        window.adminModule.showMessage('Please select a match status.', 'error');
        return;
    }

    const payload = {
        editid: matchId,
        winner_id: winnerId || null,
        match_status: matchStatus
    };

    try {
        //const res = await fetch('http://localhost/api/matches/save_match_status', {
        const res = await fetch('https://vrbattles.gg/api/matches/save_match_status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await res.json();
        if (result.status === 'success') {
            window.adminModule.showMessage('Match status saved.', 'success');
        } else {
            window.adminModule.showMessage(result.message || 'Failed to save match status.', 'error');
        }
    } catch (err) {
        console.error('Error saving match status:', err);
        window.adminModule.showMessage('Error saving match status.', 'error');
    }
}

// MATCHES ENDS ===================================================================================





// TEAMS STARTS ===================================================================================

//load teams
async function loadAdminTeams() {
    try {
        const res = await window.api.getAllTeams();
        //console.log('[Teams API Response]', res);

        const tbody = document.getElementById('teams-table-body');
        tbody.innerHTML = '';

        if (Array.isArray(res?.data)) {
            res.data.forEach(team => {
                const playerData = Array.isArray(team.players) && team.players.length > 0
                ? (team.players.find(p => p.player_data) || {}).player_data || {}
                : {};

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${team.id}</td>
                    <td><img src="${team.logo || ''}" alt="Logo" style="width: 40px; height: 40px;"></td>
                    <td>${team.name}</td>
                    <td>${team.date_created?.split(' ')[0] || ''}</td>
                    <td>${team.matches || 0}</td>
                    <td>${team.wins || 0}</td>
                    <td>${team.losses || 0}</td>
                    <td>${team.forfeits || 0}</td>
                    <td>${team.mu || 0}</td>
                    <td>${team.sigma || 0}</td>
                    <td>${team.ordinal || 0}</td>
                    <td><button class="btn-primary">EDIT</button></td>
                `;
                row.querySelector('button')?.addEventListener('click', () => {
                    loadTeamEditor(team);
                });

                tbody.appendChild(row);
            });
        } else {
            tbody.innerHTML = `<tr><td colspan="12">No teams found</td></tr>`;
        }
    } catch (err) {
        console.error('Error fetching teams:', err);
        const tbody = document.getElementById('teams-table-body');
        tbody.innerHTML = `<tr><td colspan="12">Failed to load teams</td></tr>`;
    }
}

function loadTeamEditor(team) {
    document.querySelectorAll('.admin-section').forEach(sec => {
        sec.classList.remove('active');
        sec.style.display = 'none';
    });

    const section = document.getElementById('admin-team-edit');
    section.classList.add('active');
    section.style.display = 'block';

    let teamOwnerUsername = 'Unknown';
    const teamOwner = team.players?.find(p => p.id === team.created_by_id);
    if (teamOwner) {
        teamOwnerUsername = teamOwner.username || 'Unknown';
    }

    const container = document.getElementById('edit-team-container');
    container.innerHTML = `
        <h3 style="text-align: center; margin-bottom: 0.5rem; font-size: 1.6rem; font-weight: bold;">EDIT TEAM #${team.id} : ${team.name.toUpperCase()}</h3>
        <p style="text-align: center; margin-bottom: 2rem; font-size: 1rem;">
            ( ${team.game_name || 'Unknown'} - ${team.game_mode || 'N/A'} )<br>
            <span>Created by : ( ${team.created_by_id || 'N/A'} ) ${teamOwnerUsername}</span>
        </p>

        <div style="display: flex; justify-content: center; gap: 3rem; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 320px; max-width: 400px;">
                <div style="display: grid; grid-template-columns: auto 1fr; gap: 0.75rem 1rem; align-items: center; margin-bottom: 1.5rem;">
                    <input type="hidden" id="editid" value="${team.id}">
                    <label>Team Name</label>
                    <input id="team-name-input" value="${team.name}" class="form-control" style="background: #000; color: white;">
                    <label>Bio</label>
                    <input id="team-bio-input" value="${team.bio || ''}" class="form-control" style="background: #000; color: white;">
                    <label>Logo</label>
                    <input type="file" id="team-logo-input" class="form-control" style="background: #000; color: white;">
                </div>

                <div style="display: grid; grid-template-columns: auto 80px; gap: 0.75rem 1.5rem; margin-top: 2rem; align-items: center;">
                    <label>Matches</label><input id="team-matches" value="${team.matches}" class="form-control" style="background: #000; color: white;">
                    <label>Wins</label><input id="team-wins" value="${team.wins}" class="form-control" style="background: #000; color: white;">
                    <label>Losses</label><input id="team-losses" value="${team.losses}" class="form-control" style="background: #000; color: white;">
                    <label>Forfeits</label><input id="team-forfeits" value="${team.forfeits}" class="form-control" style="background: #000; color: white;">
                    <label>Tournament Wins</label><input id="team-tournament-wins" value="${team.tournament_wins}" class="form-control" style="background: #000; color: white;">
                    <label>Earnings</label><input id="team-earnings" value="${team.earnings}" class="form-control" style="background: #000; color: white;">
                </div>
            </div>
        </div>

        <div style="text-align: center; margin-top: 2.5rem;">
            <button id="save-team-btn" class="btn-primary" style="padding: 0.75rem 2rem; font-size: 1rem;">SAVE DETAILS</button>
        </div>

        <div style="margin-top: 3rem; text-align: center; font-weight: bold; font-size: 1.1rem;">MMR Stats</div>

        <div style="display: grid; grid-template-columns: auto 120px; gap: 0.5rem 1rem; justify-content: center; max-width: 400px; margin: 1.5rem auto 0; align-items: center;">
            <label>Previous Mu:</label><div>${parseFloat(team.mu || 0).toFixed(5)}</div>
            <label>Current Mu:</label><input id="team-current-mu" class="form-control" value="${parseFloat(team.mu || 0).toFixed(5)}" disabled style="background: #000; color: white;">

            <label>Previous Sigma:</label><div>${parseFloat(team.sigma || 0).toFixed(5)}</div>
            <label>Current Sigma:</label><input id="team-current-sigma" class="form-control" value="${parseFloat(team.sigma || 0).toFixed(5)}" disabled style="background: #000; color: white;">

            <label>Previous Ordinal:</label><div>${parseFloat(team.ordinal || 0).toFixed(5)}</div>
            <label>Current Ordinal:</label><input id="team-current-ordinal" class="form-control" value="${parseFloat(team.odrinal || 0).toFixed(5)}" disabled style="background: #000; color: white;">
        </div>

        <div style="margin-top: 2rem; display: flex; justify-content: center; gap: 1rem;">
            <button id="generate-mmr-btn" class="btn-primary">GENERATE</button>
            <button id="save-mmr-btn" class="btn-primary" style="display: none;">SAVE MMR</button>
        </div>
    `;

    document.getElementById('generate-mmr-btn')?.addEventListener('click', () => {
        const mu = parseFloat(team.mu) || 25;
        const sigma = parseFloat(team.sigma) || 8.333;
        const ordinal = mu - 3 * sigma;

        document.getElementById('team-current-mu').value = mu.toFixed(5);
        document.getElementById('team-current-sigma').value = sigma.toFixed(5);
        document.getElementById('team-current-ordinal').value = ordinal.toFixed(5);

        document.getElementById('save-mmr-btn')?.style.setProperty('display', 'inline-block');
    });

    document.getElementById('save-team-btn')?.addEventListener('click', async () => {
        const btn = document.getElementById('save-team-btn');
        if (btn.disabled) return;
        btn.disabled = true;
        const originalText = btn.textContent;
        btn.textContent = 'Saving...';

        const payload = {
            editid: document.getElementById('editid').value,
            name: document.getElementById('team-name-input').value,
            bio: document.getElementById('team-bio-input').value,
            matches: parseInt(document.getElementById('team-matches').value) || 0,
            wins: parseInt(document.getElementById('team-wins').value) || 0,
            losses: parseInt(document.getElementById('team-losses').value) || 0,
            forfeits: parseInt(document.getElementById('team-forfeits').value) || 0,
            tournament_wins: parseInt(document.getElementById('team-tournament-wins').value) || 0,
            earnings: parseInt(document.getElementById('team-earnings').value) || 0
        };

        //console.log('[Team Save] Payload to send:', payload);

        try {
            //const res = await fetch('http://localhost/api/teams/teams_update', {
            const res = await fetch('https://vrbattles.gg/api/teams/teams_update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            //console.log('[Team Save] Raw response:', res);

            const result = await res.json();

            //console.log('[Team Save] Parsed response:', result);

            window.adminModule.showMessage(result.message || 'Error saving team', result.status || 'error');
        } catch (err) {
            //console.error('[Team Save] Error during fetch:', err);
            window.adminModule.showMessage('Failed to save team details.', 'error');
        }

        btn.disabled = false;
        btn.textContent = originalText;
    });

    document.getElementById('save-mmr-btn')?.addEventListener('click', async () => {
        const btn = document.getElementById('save-mmr-btn');
        if (btn.disabled) return;

        btn.disabled = true;
        const originalText = btn.textContent;
        btn.textContent = 'Saving...';

        const payload = {
            editid: document.getElementById('editid').value,
            mu: parseFloat(document.getElementById('team-current-mu')?.value) || 0,
            sigma: parseFloat(document.getElementById('team-current-sigma')?.value) || 0,
            ordinal: parseFloat(document.getElementById('team-current-ordinal')?.value) || 0
        };

        //console.log('[Team MMR Save] Payload:', payload);

        try {
            //const res = await fetch('http://localhost/api/teams/mmr_update', {
            const res = await fetch('https://vrbattles.gg/api/teams/mmr_update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await res.json();
            //console.log('[Team MMR Save] Response:', result);
            window.adminModule.showMessage(result.message || 'Error saving MMR', result.status || 'error');
        } catch (err) {
            //console.error('[Team MMR Save] Error:', err);
            window.adminModule.showMessage('Failed to save team MMR.', 'error');
        }

        btn.disabled = false;
        btn.textContent = originalText;
    });


}

// TEAMS ENDS =====================================================================================





// DISPUTES STARTS ================================================================================

//load disputes
async function loadDisputedMatches() {
    try {
        const res = await window.api.getAllMatches();
        //console.log('[Disputes API Response]', res);

        const tbody = document.getElementById('disputes-table-body');
        tbody.innerHTML = '';

        if (Array.isArray(res?.data)) {
            const disputed = res.data.filter(match =>
                match.status === 'disputed' || match.status === 'match-disputed' || 
                match.status === 'tournament-disputed' || match.status === 'tournamnet-match-disputed'
            );

            if (disputed.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9">No disputes found</td></tr>`;
                return;
            }

            disputed.forEach(match => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${match.match_id}</td>
                    <td>${match.game_name}</td>
                    <td>${match.game_mode || ''}</td>
                    <td>${match.status}</td>
                    <td>${match.start_time?.slice(0, 16) || ''}</td>
                    <td>${match.team1_details?.name || match.team1_id}</td>
                    <td>${match.team2_details?.name || match.team2_id}</td>
                    <td><button class="btn-primary resolve-btn">RESOLVE</button></td>
                `;
                tbody.appendChild(row);
                row.querySelector('.resolve-btn')?.addEventListener('click', () => {
                    loadDisputeResolver(match);
                });
            });
        } else {
            tbody.innerHTML = `<tr><td colspan="9">No disputes found</td></tr>`;
        }
    } catch (err) {
        console.error('Error fetching disputes:', err);
        const tbody = document.getElementById('disputes-table-body');
        tbody.innerHTML = `<tr><td colspan="9">Failed to load disputes</td></tr>`;
    }
}

//save dispute
function loadDisputeResolver(match) {
    
    document.querySelectorAll('.admin-section').forEach(sec => {
        sec.classList.remove('active');
        sec.style.display = 'none';
    });

    const section = document.getElementById('admin-dispute-resolve');
    section.classList.add('active');
    section.style.display = 'block';

    const container = document.getElementById('resolve-dispute-container');

    const statusOptions = [
        'in-progress',
        'unconfirmed',
        'confirmed',
        'disputed',
        'match-disputed',
        'tournament-in-progress',
        'tournament-unconfirmed',
        'tournament-match-confirmed',
        'tournament-disputed',
        'tournament-match-disputed'
    ];

    container.innerHTML = `
    <div style="max-width: 800px; margin: 0 auto; text-align: center; margin-bottom: 50px">
        <h3 style="margin-bottom: 0.3rem; font-size: 1.5rem;">DISPUTE MATCH #${match.match_id}</h3>
        <p style="margin-bottom: 0.2rem; font-size: 1.1rem;">(${match.game_name} - ${match.game_mode || 'N/A'})</p>
        <p style="font-weight: bold; font-size: 1.1rem;">
            ${match.team1_details?.name || 'Team 1'} <span style="opacity: 0.5;">VS</span> ${match.team2_details?.name || 'Team 2'}
        </p>
        <p style="font-weight: bold; margin-bottom: 2rem; font-size: 1.1rem;">
            <span style="font-weight: normal; font-size: 0.95rem; opacity: 0.7;">
                ${new Date(match.start_time).toLocaleString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                })}
            </span>
        </p>


        ${match.rounds.map(round => `
            <h3 style="margin-bottom: 0.5rem; font-size: 1.25rem;">Round ${round.round_number}</h3>
            <div style="display: flex; justify-content: center; gap: 2rem; margin-bottom: 1.5rem;">
                <label style="display: flex; flex-direction: column; align-items: center; font-size: 1rem;">
                    ${match.team1_details?.name || 'Team 1'}:
                    <input type="number" class="score-input" data-round="${round.round_number}" data-team="1" value="${round.team_1_score || 0}"
                        style="width: 120px; padding: 0.6rem; background: #000; color: white; border: none; border-radius: 6px; text-align: center; font-size: 1rem;">
                </label>
                <label style="display: flex; flex-direction: column; align-items: center; font-size: 1rem;">
                    ${match.team2_details?.name || 'Team 2'}:
                    <input type="number" class="score-input" data-round="${round.round_number}" data-team="2" value="${round.team_2_score || 0}"
                        style="width: 120px; padding: 0.6rem; background: #000; color: white; border: none; border-radius: 6px; text-align: center; font-size: 1rem;">
                </label>
            </div>
        `).join('')}

        <div style="text-align: center; margin-bottom: 2rem;">
            <button id="save-scores-btn" class="btn-primary" style="padding: 0.75rem 2rem; font-size: 1rem;">SAVE SCORES</button>
        </div>

        <p style="font-size: 0.85rem; opacity: 0.6; margin-top: 1.5rem; color: #111;">
            Note: P- stands for previous uncalculated mmr before the match results. Newly calculated values will appear on the input fields.
        </p>

        <div id="mmr-results" style="display: flex; justify-content: space-evenly; flex-wrap: wrap; margin-top: 2rem;">
            ${[match.team1_details, match.team2_details].map((teamDetails, i) => {
                const key = i + 1;

                const prevMu = parseFloat(teamDetails?.mu || 0).toFixed(5);
                const prevSigma = parseFloat(teamDetails?.sigma || 0).toFixed(5);
                const prevOrdinal = parseFloat(teamDetails?.ordinal || 0).toFixed(5);

                return `
                <div style="min-width: 250px; text-align: center;">
                    <h4 style="margin-bottom: 0.5rem;">${teamDetails?.name || `Team ${key}`}</h4>

                    <p style="font-size: 0.9rem;">P-Mu: ${prevMu}</p>
                    <input class="mmr-input" data-type="mu" data-team="${key}" value="0.00000" disabled
                        style="margin-bottom: 0.5rem; width: 120px; padding: 0.6rem; text-align: center; background: #000; color: #fff; border: none; border-radius: 6px;">

                    <p style="font-size: 0.9rem;">P-Sigma: ${prevSigma}</p>
                    <input class="mmr-input" data-type="sigma" data-team="${key}" value="0.00000" disabled
                        style="margin-bottom: 0.5rem; width: 120px; padding: 0.6rem; text-align: center; background: #000; color: #fff; border: none; border-radius: 6px;">

                    <p style="font-size: 0.9rem;">P-Ordinal: ${prevOrdinal}</p>
                    <input class="mmr-input" data-type="ordinal" data-team="${key}" value="0.00000" disabled
                        style="margin-bottom: 0.5rem; width: 120px; padding: 0.6rem; text-align: center; background: #000; color: #fff; border: none; border-radius: 6px;">
                </div>
                `;
            }).join('')}

        </div>

        <div style="text-align: center; margin: 2rem 0 2rem;">
            <button id="generate-mmr-btn" class="btn-primary" style="padding: 0.75rem 2rem; font-size: 1rem;">GENERATE MMR</button>
        </div>

        <div id="save-mmr-wrapper" style="display: none; text-align: center; margin-bottom: 2rem;">
            <button id="save-mmr-btn" class="btn-primary" style="padding: 0.75rem 2rem; font-size: 1rem;">SAVE MMR</button>
        </div>

        <div style="display: flex; justify-content: center; align-items: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
            <label style="font-size: 1rem;">Dispute Status</label>
            <select id="dispute-status-select" class="form-control" style="padding: 0.6rem 1rem; font-size: 1rem; background: #000; color: white; border: none; border-radius: 6px;">
                ${statusOptions.map(status => `
                    <option value="${status}" ${match.status === status ? 'selected' : ''}>${status}</option>
                `).join('')}
            </select>
        </div>

        <div style="text-align: center;">
            <button id="save-status-btn" class="btn-primary" style="padding: 0.75rem 2rem; font-size: 1rem;">SAVE STATUS</button>
        </div>
    </div>
    `;

    document.getElementById('generate-mmr-btn')?.addEventListener('click', async () => {
    const matchId = match.match_id;
    const team1_team_id = match.team1_details?.id;
    const team2_team_id = match.team2_details?.id;

    const matchDetails = match.rounds.map(r => ({
        team_1_score: parseInt(r.team_1_score),
        team_2_score: parseInt(r.team_2_score)
    }));

    //const response = await fetch('http://localhost/api/fetch/get_teams_by_ids', {
    const response = await fetch('https://vrbattles.gg/api/fetch/get_teams_by_ids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_ids: [team1_team_id, team2_team_id] })
    });

    const allTeams = await response.json();
    if (allTeams.status !== 'success') {
        window.adminModule.showMessage('Failed to fetch teams', 'error');
        return;
    }

    const team1 = allTeams.data.find(t => parseInt(t.id) === parseInt(team1_team_id));
    const team2 = allTeams.data.find(t => parseInt(t.id) === parseInt(team2_team_id));

    const extractRatings = (players) => {
        const ratings = {};
        players.forEach(p => {
        const data = typeof p.player_data === 'string'
            ? JSON.parse(p.player_data || '{}')
            : (p.player_data || {});
        const mmr = data.player_mmr || {};
        const mu = parseFloat(mmr.mu);
        const sigma = parseFloat(mmr.sigma);
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

    const prevRatingTeam1 = {
        mu: parseFloat(team1.mu) || 25,
        sigma: parseFloat(team1.sigma) || 8.333
    };
    const prevRatingTeam2 = {
        mu: parseFloat(team2.mu) || 25,
        sigma: parseFloat(team2.sigma) || 8.333
    };

    const mmrPayload = {
        team1_player_ids,
        team2_player_ids,
        team1_ratings,
        team2_ratings,
        prevRatingTeam1,
        prevRatingTeam2,
        matchDetails
    };

    const mmrResult = await window.api.calculateMMR(mmrPayload);
    if (mmrResult.status !== 'success') {
        window.adminModule.showMessage('Failed to calculate MMR', 'error');
        return;
    }

    const setMMRInput = (team, key, value) => {
        const input = document.querySelector(`.mmr-input[data-team="${team}"][data-type="${key}"]`);
        if (input) {
        input.value = parseFloat(value).toFixed(5);
        input.disabled = false;
        }
    };

    setMMRInput('1', 'mu', mmrResult.team1_avg.mu);
    setMMRInput('1', 'sigma', mmrResult.team1_avg.sigma);
    setMMRInput('1', 'ordinal', mmrResult.team1_avg.ordinal);
    setMMRInput('2', 'mu', mmrResult.team2_avg.mu);
    setMMRInput('2', 'sigma', mmrResult.team2_avg.sigma);
    setMMRInput('2', 'ordinal', mmrResult.team2_avg.ordinal);

    document.getElementById('save-mmr-wrapper').style.display = 'block';
    });

    document.getElementById('save-scores-btn')?.addEventListener('click', async () => {
        const btn = document.getElementById('save-scores-btn');
        if (btn.disabled) return;

        btn.disabled = true;
        const originalText = btn.textContent;
        btn.textContent = 'Saving...';


        const scoreInputs = document.querySelectorAll('.score-input');
        const scores = {};

        scoreInputs.forEach(input => {
            const round = input.dataset.round;
            const team = input.dataset.team;
            if (!scores[round]) scores[round] = {};
            scores[round][`team${team}_score`] = parseInt(input.value) || 0;
        });

        const payload = {
            editid: match.match_id,
            team1_team_id: match.team1_details?.id,
            team2_team_id: match.team2_details?.id,
            scores
        };

        try {
            //const res = await fetch('http://localhost/api/disputes/save_scores', {
            const res = await fetch('https://vrbattles.gg/api/disputes/save_scores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await res.json();
            window.adminModule.showMessage(result.message || 'Error saving scores', result.status || 'error');
        } catch (err) {
            console.error('Dispute Save Scores Error:', err);
            window.adminModule.showMessage('Failed to save scores.', 'error');
        }

        btn.disabled = false;
        btn.textContent = originalText;
    });

    document.getElementById('save-mmr-btn')?.addEventListener('click', async () => {
        const btn = document.getElementById('save-mmr-btn');
        if (btn.disabled) return;

        btn.disabled = true;
        const originalText = btn.textContent;
        btn.textContent = 'Saving...';

        const team1 = {};
        const team2 = {};

        document.querySelectorAll('.mmr-input').forEach(input => {
            const team = input.dataset.team;
            const type = input.dataset.type;
            const value = parseFloat(input.value) || 0;

            if (team === '1') team1[type] = value;
            else if (team === '2') team2[type] = value;
        });

        const payload = {
            editid: match.match_id,
            mu1: team1.mu,
            sigma1: team1.sigma,
            ordinal1: team1.ordinal,
            mu2: team2.mu,
            sigma2: team2.sigma,
            ordinal2: team2.ordinal,
            team1_ratings: JSON.stringify(match.team1_details?.players || []),
            team2_ratings: JSON.stringify(match.team2_details?.players || [])
        };

        try {
            //const res = await fetch('http://localhost/api/disputes/save_mmr', {
            const res = await fetch('https://vrbattles.gg/api/disputes/save_mmr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await res.json();
            window.adminModule.showMessage(result.message || 'Error saving MMR', result.status || 'error');
        } catch (err) {
            console.error('Dispute Save MMR Error:', err);
            window.adminModule.showMessage('Failed to save MMR.', 'error');
        }

        btn.disabled = false;
        btn.textContent = originalText;
    });

    document.getElementById('save-status-btn')?.addEventListener('click', async () => {
        const btn = document.getElementById('save-status-btn');
        if (btn.disabled) return;

        btn.disabled = true;
        const originalText = btn.textContent;
        btn.textContent = 'Saving...';

        const selectedStatus = document.getElementById('dispute-status-select')?.value;

        const payload = {
            editid: match.match_id,
            match_status: selectedStatus
        };

        try {
            //const res = await fetch('http://localhost/api/disputes/save_status', {
            const res = await fetch('https://vrbattles.gg/api/disputes/save_status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await res.json();
            if (result.status === 'success') {
                window.adminModule.showMessage('Match status updated.', 'success');
            } else {
                window.adminModule.showMessage(result.message || 'Failed to update status.', 'error');
            }
        } catch (err) {
            console.error('Dispute Save Status Error:', err);
            window.adminModule.showMessage('Error updating status.', 'error');
        }

        btn.disabled = false;
        btn.textContent = originalText;
    });

}


// DISPUTES ENDS =================================================================================





// PLAYERS STARTS =================================================================================

window.editPlayer = function (player) {
    document.querySelectorAll('.admin-section').forEach(sec => {
        sec.classList.remove('active');
        sec.style.display = 'none';
    });

    const section = document.getElementById('admin-player-edit');
    section.classList.add('active');
    section.style.display = 'block';

    const container = document.getElementById('edit-player-container');
    container.innerHTML = `
        <div style="text-align: center; margin-bottom: 1rem;">
            <h2 style="margin: 0;">EDIT PLAYER #${player.id}</h2>
            <h3 style="margin-bottom: 1.5rem;">${player.username}</h3>
            <button id="delete-player-btn" class="btn-danger" style="margin-bottom: 2rem;">DELETE</button>
        </div>

        <div style="display: flex; flex-direction: row; flex-wrap: wrap; justify-content: center; gap: 3rem; margin-bottom: 2rem;">
            <!-- Avatar -->
            <div style="text-align: center; flex: 0 0 180px;">
                <img src="${player.profile || '/assets/images/default-avatar.png'}" 
                    alt="Avatar"
                    style="width: 150px; height: 150px; border: 2px solid orange; object-fit: cover; border-radius: 8px; margin-bottom: 0.5rem;">
                <input type="file" id="edit-player-avatar" class="form-control">
            </div>

            <!-- Form Fields -->
            <div style="min-width: 300px; max-width: 500px; flex: 1;">
                <div class="form-row" style="margin-bottom: 10px">
                    <label>Player First Name</label>
                    <input id="edit-player-firstname" class="form-control" value="${player.firstname || ''}">
                </div>

                <div class="form-row" style="margin-bottom: 10px">
                    <label>Player Last Name</label>
                    <input id="edit-player-lastname" class="form-control" value="${player.lastname || ''}">
                </div>

                <div class="form-row" style="margin-bottom: 10px">
                    <label>Player Username</label>
                    <input id="edit-player-username" class="form-control" value="${player.username || ''}">
                </div>

                <div class="form-row" style="margin-bottom: 10px">
                    <label>Tournament Wins</label>
                    <input id="edit-player-wins" class="form-control" value="${player.tournament_wins || 0}">
                </div>

                <div class="form-row" style="margin-bottom: 10px">
                    <label>Earnings</label>
                    <input id="edit-player-earnings" class="form-control" value="${player.earnings || 0}">
                </div>

                <div class="form-row" style="margin-bottom: 10px">
                    <label>Player IGN</label>
                    <input id="edit-player-ign" class="form-control" value="${player.ign || ''}">
                </div>

                <div class="form-row" style="margin-bottom: 10px">
                    <label>Platform</label>
                    <select id="edit-player-platform" class="form-control">
                        <option ${player.platform === 'PC' ? 'selected' : ''}>PC</option>
                        <option ${player.platform === 'PSVR' ? 'selected' : ''}>PSVR</option>
                        <option ${player.platform === 'Quest' ? 'selected' : ''}>Quest</option>
                    </select>
                </div>

                <div class="form-row" style="margin-bottom: 10px">
                    <label>Time Zone</label>
                    <select id="edit-player-timezone" class="form-control"></select>
                </div>

            </div>
        </div>

        <!-- Save Button -->
        <div style="text-align: center; margin-top: 2rem;">
            <button id="save-player-btn" class="btn-primary" style="padding: 0.75rem 2rem;">SAVE</button>
        </div>

        <!-- Player Teams -->
        <div style="margin-top: 4rem;">
            <h3 style="text-align: center;">Player Teams</h3>
            <p style="text-align: center;">No teams found for this player.</p>
        </div>
    `;
    loadTimezones('edit-player-timezone', player.timezone);

    document.getElementById('back-to-players-btn')?.addEventListener('click', () => {
        document.querySelectorAll('.admin-section').forEach(sec => {
            sec.classList.remove('active');
            sec.style.display = 'none';
        });

        const gamesSection = document.getElementById('admin-players');
        gamesSection.classList.add('active');
        gamesSection.style.display = 'block';
    });
    

    document.getElementById('save-player-btn')?.addEventListener('click', async () => {
    const formData = new FormData();

    formData.append('editid', player.id);
    formData.append('firstname', document.getElementById('edit-player-firstname').value);
    formData.append('lastname', document.getElementById('edit-player-lastname').value);
    formData.append('username', document.getElementById('edit-player-username').value);
    formData.append('tournament_wins', document.getElementById('edit-player-wins').value);
    formData.append('earnings', document.getElementById('edit-player-earnings').value);
    formData.append('ign', document.getElementById('edit-player-ign').value);
    formData.append('platform', document.getElementById('edit-player-platform').value);
    formData.append('timezone-select', document.getElementById('edit-player-timezone').value);

    const session = await window.api.getSession();

    if (session?.lootlocker_token) {
        formData.append('admin_session_token', session.lootlocker_token);
    }

    const fileInput = document.getElementById('edit-player-avatar');
    if (fileInput?.files?.length > 0) {
        formData.append('logo', fileInput.files[0]);
    }

    try {
        //const res = await fetch('http://localhost/api/players/update', {
        const res = await fetch('https://vrbattles.gg/api/players/update', {
            method: 'POST',
            body: formData
        });

        const result = await res.json();
        window.adminModule.showMessage(result.message || 'Player updated.', result.status || 'success');
    } catch (err) {
        window.adminModule.showMessage('Error saving player.', 'error');
        console.error('Player save error:', err);
    }
});


};



// PLAYERS ENDS =================================================================================


//BACK BUTTON
document.getElementById('back-to-matches-btn')?.addEventListener('click', () => {
    document.querySelectorAll('.admin-section').forEach(sec => {
        sec.classList.remove('active');
        sec.style.display = 'none';
    });

    const matchesSection = document.getElementById('admin-matches');
    matchesSection.classList.add('active');
    matchesSection.style.display = 'block';

    document.querySelectorAll('.admin-menu-link').forEach(link => link.classList.remove('active'));
    document.querySelector('.admin-menu-link[data-section="matches"]')?.classList.add('active');

    loadAdminMatches();
});

document.getElementById('back-to-disputes-btn')?.addEventListener('click', () => {
    document.querySelectorAll('.admin-section').forEach(sec => {
        sec.classList.remove('active');
        sec.style.display = 'none';
    });

    const disputesSection = document.getElementById('admin-disputes');
    disputesSection.classList.add('active');
    disputesSection.style.display = 'block';

    document.querySelectorAll('.admin-menu-link').forEach(link => link.classList.remove('active'));
    document.querySelector('.admin-menu-link[data-section="disputes"]')?.classList.add('active');

    loadDisputedMatches();
});

document.getElementById('back-to-teams-btn')?.addEventListener('click', () => {
    document.querySelectorAll('.admin-section').forEach(sec => {
        sec.classList.remove('active');
        sec.style.display = 'none';
    });

    const disputesSection = document.getElementById('admin-teams');
    disputesSection.classList.add('active');
    disputesSection.style.display = 'block';

    document.querySelectorAll('.admin-menu-link').forEach(link => link.classList.remove('active'));
    document.querySelector('.admin-menu-link[data-section="teams"]')?.classList.add('active');

    loadDisputedMatches();
});

document.getElementById('back-to-games-btn')?.addEventListener('click', () => {
    document.querySelectorAll('.admin-section').forEach(sec => {
        sec.classList.remove('active');
        sec.style.display = 'none';
    });

    const section = document.getElementById('admin-games');
    section.classList.add('active');
    section.style.display = 'block';

    document.querySelectorAll('.admin-menu-link').forEach(link => link.classList.remove('active'));
    document.querySelector('.admin-menu-link[data-section="games"]')?.classList.add('active');

    if (window.adminGamesTabModule) {
        window.adminGamesTabModule.loadGames(); // ✅ only this once
    }
});



function loadTimezones(selectId, selectedValue = '') {
    const timezoneSelect = document.getElementById(selectId);
    if (!timezoneSelect) return;

    const timezones = Intl.supportedValuesOf("timeZone") || [];

    timezoneSelect.innerHTML = '';
    timezones.forEach(tz => {
        const option = new Option(tz, tz);
        if (tz === selectedValue) option.selected = true;
        timezoneSelect.appendChild(option);
    });
}

