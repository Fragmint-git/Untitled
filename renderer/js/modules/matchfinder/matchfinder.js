/**
 * Matchfinder Module
 * Handles matchmaking functionality and player pairing
 */

// Function to find suitable matches for a player
async function findMatches(playerId, tournamentId) {
    try {
        // Get tournament details
        const tournament = await window.api.getTournament(tournamentId);
        
        // Get all players in the tournament
        const players = tournament.Players || [];
        
        // Filter out the current player and already matched players
        const availablePlayers = players.filter(player => 
            player.id !== playerId && 
            player.status === 'available'
        );
        
        // Sort players by skill rating or other criteria
        const rankedPlayers = rankPlayersBySkill(availablePlayers);
        
        return rankedPlayers;
    } catch (error) {
        console.error('Error finding matches:', error);
        throw error;
    }
}

// Function to rank players by skill level
function rankPlayersBySkill(players) {
    return players.sort((a, b) => {
        // Add your ranking logic here
        // For now, just sort by win rate if available
        const aWinRate = calculateWinRate(a);
        const bWinRate = calculateWinRate(b);
        return bWinRate - aWinRate;
    });
}

// Calculate player win rate
function calculateWinRate(player) {
    if (!player.matchesPlayed || player.matchesPlayed === 0) {
        return 0;
    }
    return (player.matchesWon || 0) / player.matchesPlayed;
}

// Function to create a match between players
async function createMatch(player1Id, player2Id, tournamentId) {
    try {
        const matchData = {
            tournamentId: tournamentId,
            player1Id: player1Id,
            player2Id: player2Id,
            status: 'scheduled',
            startTime: new Date(),
            // Add any additional match settings
        };
        
        const match = await window.api.createMatch(matchData);
        return match;
    } catch (error) {
        console.error('Error creating match:', error);
        throw error;
    }
}

// Function to get match suggestions for a tournament
async function getMatchSuggestions(tournamentId) {
    try {
        const tournament = await window.api.getTournament(tournamentId);
        const players = tournament.Players || [];
        const suggestions = [];
        
        // Create pairs of players based on skill level and availability
        for (let i = 0; i < players.length; i++) {
            if (players[i].status !== 'available') continue;
            
            for (let j = i + 1; j < players.length; j++) {
                if (players[j].status !== 'available') continue;
                
                suggestions.push({
                    player1: players[i],
                    player2: players[j],
                    compatibilityScore: calculateCompatibilityScore(players[i], players[j])
                });
            }
        }
        
        // Sort suggestions by compatibility score
        return suggestions.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    } catch (error) {
        console.error('Error getting match suggestions:', error);
        throw error;
    }
}

// Calculate compatibility score between two players
function calculateCompatibilityScore(player1, player2) {
    // Add your compatibility scoring logic here
    // This could include factors like:
    // - Skill level difference
    // - Previous match history
    // - Player preferences
    // - Time zone compatibility
    // For now, return a simple random score
    return Math.random();
}

// Export module
window.matchfinderModule = {
    findMatches,
    createMatch,
    getMatchSuggestions,
    rankPlayersBySkill,
    calculateCompatibilityScore
}; 