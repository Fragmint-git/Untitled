const { ipcMain } = require('electron');
const { Tournament, Player, Match } = require('./backend/database');

// Initialize backend API integration
function initBackendIntegration() {
    // Handle tournament-related IPC events
    ipcMain.handle('get-tournaments', async () => {
        try {
            const tournaments = await Tournament.findAll();
            return tournaments;
        } catch (error) {
            console.error('Error fetching tournaments:', error);
            throw error;
        }
    });

    ipcMain.handle('get-tournament', async (event, id) => {
        try {
            const tournament = await Tournament.findByPk(id, {
                include: [Player, Match]
            });
            return tournament;
        } catch (error) {
            console.error(`Error fetching tournament ${id}:`, error);
            throw error;
        }
    });

    ipcMain.handle('create-tournament', async (event, tournamentData) => {
        try {
            const tournament = await Tournament.create(tournamentData);
            return tournament;
        } catch (error) {
            console.error('Error creating tournament:', error);
            throw error;
        }
    });

    ipcMain.handle('update-tournament', async (event, { id, data }) => {
        try {
            const tournament = await Tournament.findByPk(id);
            if (!tournament) {
                throw new Error('Tournament not found');
            }
            await tournament.update(data);
            return tournament;
        } catch (error) {
            console.error(`Error updating tournament ${id}:`, error);
            throw error;
        }
    });

    // Handle player-related IPC events
    ipcMain.handle('get-players', async () => {
        try {
            const players = await Player.findAll();
            return players;
        } catch (error) {
            console.error('Error fetching players:', error);
            throw error;
        }
    });

    ipcMain.handle('create-player', async (event, playerData) => {
        try {
            const player = await Player.create(playerData);
            return player;
        } catch (error) {
            console.error('Error creating player:', error);
            throw error;
        }
    });

    // Handle match-related IPC events
    ipcMain.handle('get-matches', async () => {
        try {
            const matches = await Match.findAll({
                include: [Tournament, Player]
            });
            return matches;
        } catch (error) {
            console.error('Error fetching matches:', error);
            throw error;
        }
    });

    ipcMain.handle('create-match', async (event, matchData) => {
        try {
            const match = await Match.create(matchData);
            return match;
        } catch (error) {
            console.error('Error creating match:', error);
            throw error;
        }
    });

    console.log('Backend integration initialized');
}

module.exports = { initBackendIntegration };