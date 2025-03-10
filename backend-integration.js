const { ipcMain } = require('electron');
const { Tournament, Player, Match, Game, sequelize } = require('./backend/database');
const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

// Keep track of the Express server
let serverPort = 3000; // Default port
let expressServer = null;

// Initialize backend API integration
function initBackendIntegration() {
    // Start the Express server
    try {
        // Import the server module
        const serverModule = require('./backend/server');
        
        // Start the server using the exported function
        serverModule.startServer().then(server => {
            expressServer = server;
            
            // Get the actual port the server is running on
            serverPort = expressServer.address().port;
            console.log(`Express server is running on port ${serverPort}`);
            
            // Log server port for debugging
            if (serverPort !== 3000) {
                console.log(`Note: Server is using port ${serverPort} instead of default port 3000`);
                console.log(`All image URLs will be constructed with port ${serverPort}`);
            }
            
            // Add a listener to detect port changes
            expressServer.on('listening', () => {
                const newPort = expressServer.address().port;
                if (newPort !== serverPort) {
                    console.log(`Server port changed from ${serverPort} to ${newPort}`);
                    serverPort = newPort;
                }
            });
        }).catch(error => {
            console.error('Error starting Express server:', error);
        });
    } catch (error) {
        console.error('Failed to start Express server:', error);
    }
    
    // Handle store-related IPC events
    ipcMain.handle('get-featured-items', async () => {
        try {
            // Mock data for now - replace with actual database queries later
            return [
                {
                    id: 1,
                    name: 'VR Battles Pro Bundle',
                    price: 99.99,
                    image: '../assets/bundles/pro-bundle.png',
                    description: 'Get everything you need to start your VR tournament journey'
                },
                // Add more featured items as needed
            ];
        } catch (error) {
            console.error('Error fetching featured items:', error);
            throw error;
        }
    });

    ipcMain.handle('get-special-offers', async () => {
        try {
            // Mock data for now - replace with actual database queries later
            return [
                {
                    id: 1,
                    name: 'Tournament Starter Pack',
                    originalPrice: 49.99,
                    price: 29.99,
                    discount: 40,
                    image: '../assets/store/starter-pack.png'
                },
                // Add more special offers as needed
            ];
        } catch (error) {
            console.error('Error fetching special offers:', error);
            throw error;
        }
    });

    ipcMain.handle('get-new-releases', async () => {
        try {
            // Mock data for now - replace with actual database queries later
            return [
                {
                    id: 1,
                    name: 'Premium Theme Pack',
                    price: 19.99,
                    image: '../assets/themes/premium-pack.png',
                    releaseDate: new Date()
                },
                // Add more new releases as needed
            ];
        } catch (error) {
            console.error('Error fetching new releases:', error);
            throw error;
        }
    });

    ipcMain.handle('get-top-sellers', async () => {
        try {
            // Mock data for now - replace with actual database queries later
            return [
                {
                    id: 1,
                    name: 'VR Battles T-Shirt',
                    price: 24.99,
                    image: '../assets/merch/tshirt.png',
                    soldCount: 150
                },
                // Add more top sellers as needed
            ];
        } catch (error) {
            console.error('Error fetching top sellers:', error);
            throw error;
        }
    });

    ipcMain.handle('get-recommended-items', async () => {
        try {
            // Mock data for now - replace with actual database queries later
            return [
                {
                    id: 1,
                    name: 'Tournament Manager Pro',
                    price: 39.99,
                    image: '../assets/store/tournament-manager.png',
                    rating: 4.8
                },
                // Add more recommended items as needed
            ];
        } catch (error) {
            console.error('Error fetching recommended items:', error);
            throw error;
        }
    });

    ipcMain.handle('get-category-items', async (event, category) => {
        try {
            // Mock data for now - replace with actual database queries later
            const categoryItems = {
                merch: [
                    {
                        id: 1,
                        name: 'VR Battles Hoodie',
                        price: 49.99,
                        image: '../assets/merch/hoodie.png'
                    }
                ],
                themes: [
                    {
                        id: 1,
                        name: 'Dark Pro Theme',
                        price: 9.99,
                        image: '../assets/themes/dark-pro.png'
                    }
                ]
                // Add more categories as needed
            };
            return categoryItems[category] || [];
        } catch (error) {
            console.error('Error fetching category items:', error);
            throw error;
        }
    });

    ipcMain.handle('add-to-cart', async (event, itemId) => {
        try {
            // Mock success response - replace with actual cart functionality later
            return { success: true, message: 'Item added to cart successfully' };
        } catch (error) {
            console.error('Error adding item to cart:', error);
            throw error;
        }
    });
    
    // Game operations
    ipcMain.handle('get-games', async () => {
        try {
            const games = await Game.findAll({
                attributes: [
                    'id', 'name', 'developer', 'releaseDate', 'description',
                    'platforms', 'genres', 'status', 'coverImage'
                ],
                order: [['name', 'ASC']]
            });
            
            // Transform the response to include full image URLs
            const transformedGames = games.map(game => {
                const plainGame = game.get({ plain: true });
                
                // Process cover image
                if (plainGame.coverImage) {
                    plainGame.coverImage = getServerImageUrl(plainGame.coverImage);
                    // Only log a short message to avoid console spam
                    console.log(`Game ${plainGame.name} image processed`);
                }
                
                return plainGame;
            });
            
            return transformedGames;
        } catch (error) {
            console.error('Error fetching games:', error);
            throw error;
        }
    });

    ipcMain.handle('get-game', async (event, id) => {
        try {
            const game = await Game.findByPk(id, {
                include: [Tournament],
                nest: true,
                raw: true // Return plain JavaScript objects
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
            return game.toJSON(); // Return plain object
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
            return game.toJSON(); // Return plain object
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
                include: [{
                    model: Game,
                    attributes: ['id', 'name', 'coverImage']
                }],
                attributes: [
                    'id', 'name', 'description', 'startDate', 'endDate',
                    'status', 'maxPlayers', 'prizePool', 'players'
                ],
                order: [['startDate', 'DESC']]
            });

            // Transform the response to include full image URLs
            const transformedTournaments = tournaments.map(tournament => {
                const plainTournament = tournament.get({ plain: true });
                
                // Process game cover image
                if (plainTournament.Game && plainTournament.Game.coverImage) {
                    plainTournament.Game.coverImage = getServerImageUrl(plainTournament.Game.coverImage);
                    // Only log a short message to avoid console spam
                    console.log(`Tournament ${plainTournament.name} game image processed`);
                }
                
                return {
                    ...plainTournament,
                    prizePool: parseFloat(plainTournament.prizePool || 0),
                    players: parseInt(plainTournament.players || 0),
                    maxPlayers: parseInt(plainTournament.maxPlayers || 32)
                };
            });

            console.log(`Fetched tournaments: ${tournaments.length}`);
            return transformedTournaments;
        } catch (error) {
            console.error('Error fetching tournaments:', error);
            throw error;
        }
    });

    ipcMain.handle('get-tournament', async (event, id) => {
        try {
            const tournament = await Tournament.findByPk(id, {
                include: [Player, Match, Game],
                nest: true,
                raw: true // Return plain JavaScript objects
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
            return tournament.toJSON(); // Return plain object
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
            return tournament.toJSON(); // Return plain object
        } catch (error) {
            console.error(`Error updating tournament ${id}:`, error);
            throw error;
        }
    });

    // Handle player-related IPC events
    ipcMain.handle('get-players', async () => {
        try {
            const players = await Player.findAll({
                raw: true // Return plain JavaScript objects
            });
            return players;
        } catch (error) {
            console.error('Error fetching players:', error);
            throw error;
        }
    });

    ipcMain.handle('create-player', async (event, playerData) => {
        try {
            const player = await Player.create(playerData);
            return player.toJSON(); // Return plain object
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
            return player.toJSON(); // Return plain object
        } catch (error) {
            console.error(`Error updating player ${id}:`, error);
            throw error;
        }
    });

    // Handle match-related IPC events
    ipcMain.handle('get-matches', async () => {
        try {
            const matches = await Match.findAll({
                include: [Tournament, Player],
                nest: true,
                raw: true // Return plain JavaScript objects
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
            return match.toJSON(); // Return plain object
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
            return match.toJSON(); // Return plain object
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

// Function to clean up backend resources
function cleanupBackendIntegration() {
    return new Promise((resolve, reject) => {
        try {
            console.log('Cleaning up backend integration...');
            
            // Use the exported shutdown function if possible
            if (expressServer) {
                const serverModule = require('./backend/server');
                if (typeof serverModule.shutdown === 'function') {
                    console.log('Using server module shutdown function...');
                    serverModule.shutdown().then(resolve).catch(resolve);
                } else {
                    // Fallback to manual shutdown
                    console.log('Closing Express server manually...');
                    if (expressServer.listening) {
                        expressServer.close((err) => {
                            if (err) {
                                console.warn('Error closing Express server:', err);
                            } else {
                                console.log('Express server closed successfully');
                            }
                            resolve();
                        });
                    } else {
                        resolve();
                    }
                }
                
                // Set a timeout in case server.close() hangs
                setTimeout(() => {
                    console.log('Express server close timeout - forcing continuation');
                    resolve();
                }, 3000);
            } else {
                resolve();
            }
        } catch (error) {
            console.error('Error during backend cleanup:', error);
            resolve(); // Continue shutdown even if there's an error
        }
    });
}

// When getting games or tournaments, construct the image URLs using the actual port
function getServerImageUrl(filename) {
    if (!filename) return null;
    
    console.log(`Processing image path: ${filename}`);
    
    // Handle already absolute URLs
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
        console.log(`Using existing URL: ${filename}`);
        return filename;
    }
    
    // If the image is referenced with a direct path to assets, use it directly
    if (filename.startsWith('/assets/')) {
        console.log(`Using direct asset path: ${filename}`);
        return filename;
    }
    
    // Remove leading slash if present
    const cleanFilename = filename.startsWith('/') ? filename.substring(1) : filename;
    
    // If it's a path with assets, extract just the filename
    const parts = cleanFilename.split('/');
    const imageFilename = parts[parts.length - 1];
    
    // Default to a placeholder image if server port isn't available yet
    if (!serverPort) {
        console.warn('Server port not available yet, using placeholder image for:', imageFilename);
        return '/assets/default-game-cover.png';
    }
    
    // Log the image URL being constructed for debugging
    const imageUrl = `http://localhost:${serverPort}/game-images/${imageFilename}`;
    console.log(`Constructed server image URL: ${imageUrl}`);
    
    // Construct URL with the actual port the server is running on
    return imageUrl;
}

module.exports = {
    initBackendIntegration,
    cleanupBackendIntegration
};