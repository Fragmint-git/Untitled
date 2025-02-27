const { ipcMain } = require('electron');
const { Tournament, Player, Match, Game, sequelize } = require('./backend/database');
const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

// Initialize backend API integration
function initBackendIntegration() {
    // Start the Express server
    const startExpressServer = () => {
        try {
            const server = require('./backend/server');
            console.log('Express server started successfully');
        } catch (error) {
            console.error('Failed to start Express server:', error);
        }
    };
    
    // Start the Express server
    startExpressServer();
    
    // Handle game-related IPC events
    ipcMain.handle('get-games', async () => {
        try {
            const games = await Game.findAll({
                order: [['name', 'ASC']]
            });
            return games;
        } catch (error) {
            console.error('Error fetching games:', error);
            throw error;
        }
    });

    ipcMain.handle('get-game', async (event, id) => {
        try {
            const game = await Game.findByPk(id, {
                include: [Tournament]
            });
            return game;
        } catch (error) {
            console.error(`Error fetching game ${id}:`, error);
            throw error;
        }
    });

    ipcMain.handle('create-game', async (event, gameData) => {
        try {
            const game = await Game.create(gameData);
            return game;
        } catch (error) {
            console.error('Error creating game:', error);
            throw error;
        }
    });

    ipcMain.handle('update-game', async (event, { id, data }) => {
        try {
            const game = await Game.findByPk(id);
            if (!game) {
                throw new Error('Game not found');
            }
            await game.update(data);
            return game;
        } catch (error) {
            console.error(`Error updating game ${id}:`, error);
            throw error;
        }
    });

    ipcMain.handle('delete-game', async (event, id) => {
        try {
            const game = await Game.findByPk(id);
            if (!game) {
                throw new Error('Game not found');
            }
            await game.destroy();
            return { success: true };
        } catch (error) {
            console.error(`Error deleting game ${id}:`, error);
            throw error;
        }
    });

    // Handle tournament-related IPC events
    ipcMain.handle('get-tournaments', async () => {
        try {
            const tournaments = await Tournament.findAll({
                include: [Game]
            });
            return tournaments;
        } catch (error) {
            console.error('Error fetching tournaments:', error);
            throw error;
        }
    });

    ipcMain.handle('get-tournament', async (event, id) => {
        try {
            const tournament = await Tournament.findByPk(id, {
                include: [Player, Match, Game]
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

    ipcMain.handle('update-player', async (event, { id, data }) => {
        try {
            const player = await Player.findByPk(id);
            if (!player) {
                throw new Error('Player not found');
            }
            await player.update(data);
            return player;
        } catch (error) {
            console.error(`Error updating player ${id}:`, error);
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

    ipcMain.handle('update-match', async (event, { id, data }) => {
        try {
            const match = await Match.findByPk(id);
            if (!match) {
                throw new Error('Match not found');
            }
            await match.update(data);
            return match;
        } catch (error) {
            console.error(`Error updating match ${id}:`, error);
            throw error;
        }
    });

    // Add these to your existing IPC handlers
    ipcMain.handle('get-database-tables', async () => {
        try {
            const [results] = await sequelize.query(`
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name NOT LIKE 'sqlite_%'
            `);
            return results.map(r => r.name);
        } catch (error) {
            console.error('Error fetching database tables:', error);
            throw error;
        }
    });

    ipcMain.handle('get-table-data', async (event, tableName) => {
        try {
            // Validate table name to prevent SQL injection
            const validTables = await sequelize.query(`
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name NOT LIKE 'sqlite_%'
            `);
            
            const tableNames = validTables[0].map(r => r.name);
            if (!tableNames.includes(tableName)) {
                throw new Error('Invalid table name');
            }
            
            const [results] = await sequelize.query(`SELECT * FROM "${tableName}" LIMIT 100`);
            return results;
        } catch (error) {
            console.error(`Error fetching data from ${tableName}:`, error);
            throw error;
        }
    });

    console.log('Backend integration initialized');
}

module.exports = { initBackendIntegration };