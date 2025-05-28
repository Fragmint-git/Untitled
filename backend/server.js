const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { sequelize, Tournament, Player, Match, db } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'file://*'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Add logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
const gameImagesDir = path.join(uploadsDir, 'games');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

if (!fs.existsSync(gameImagesDir)) {
    fs.mkdirSync(gameImagesDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, gameImagesDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with original extension
        const fileExt = path.extname(file.originalname);
        const fileName = `${uuidv4()}${fileExt}`;
        cb(null, fileName);
    }
});

// File filter to only allow image files
const fileFilter = (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max file size
    }
});

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

// Serve static files from assets directory
const assetsPath = path.join(__dirname, '..', 'assets');
console.log('Serving static files from:', assetsPath);
app.use('/assets', express.static(assetsPath, {
    setHeaders: (res, filepath) => {
        // Ensure correct content type for webp images
        if (filepath.endsWith('.webp')) {
            res.setHeader('Content-Type', 'image/webp');
        }
        // Add proper caching headers
        res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    }
}));

// Initialize database
/*async function initializeDatabase() {
    try {
        // Sync all models with database
        //await sequelize.sync({ alter: true });
        await sequelize.sync({ force: false, alter: false });
        console.log('Database synchronized successfully');

        // Check if we need to seed with initial data
        const tournamentCount = await Tournament.count();
        if (tournamentCount === 0) {
            console.log('Seeding initial data...');
            
            // First create a game
            const game = await sequelize.models.Game.create({
                name: 'Echo Arena',
                developer: 'Ready At Dawn',
                releaseDate: new Date('2017-07-20'),
                description: 'Echo Arena is a zero-gravity VR sport where players compete in high-speed matches combining elements of ultimate frisbee and soccer.',
                platforms: ['Oculus', 'SteamVR'],
                genres: ['Sport', 'Action'],
                status: 'active',
                coverImage: 'echoarena.webp'  // Using .webp extension to match the actual file
            });
            
            // Add some sample data with GameId
            await Tournament.create({
                name: 'Echo Arena Championship 2025',
                description: 'The biggest zero-gravity sports tournament of the year',
                startDate: new Date('2025-03-15'),
                endDate: new Date('2025-03-20'),
                status: 'draft',
                maxPlayers: 64,
                GameId: game.id,
                prizePool: 10000,
                players: 0
            });

            // Create additional games
            await sequelize.models.Game.bulkCreate([
                {
                    name: 'Nock',
                    developer: 'Normal VR',
                    releaseDate: new Date('2022-03-10'),
                    description: 'Nock is a unique VR archery sport game that combines soccer and archery.',
                    platforms: ['Quest'],
                    genres: ['Sport', 'Action'],
                    status: 'active',
                    coverImage: 'nock.webp'  // Ensure consistent file extension
                },
                {
                    name: 'Breachers',
                    developer: 'Triangle Factory',
                    releaseDate: new Date('2023-06-15'),
                    description: 'Tactical VR shooter with destructible environments.',
                    platforms: ['Quest', 'SteamVR'],
                    genres: ['FPS', 'Tactical'],
                    status: 'active',
                    coverImage: 'Breachers.webp'  // Ensure matching case with actual file
                }
            ]);
            
            // Check if players already exist
            const playerCount = await Player.count();
            if (playerCount === 0) {
                await Player.bulkCreate([
                    { username: 'player1', email: 'player1@example.com', displayName: 'Pro Player 1' },
                    { username: 'player2', email: 'player2@example.com', displayName: 'Pro Player 2' },
                    { username: 'player3', email: 'player3@example.com', displayName: 'Pro Player 3' }
                ]);
            }
            
            console.log('Sample data created');
        }
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

// Call initializeDatabase when the server starts
initializeDatabase().catch(err => {
    console.error('Database initialization error:', err);
});*/

// API Routes
// Upload game image
app.post('/api/upload/game-image', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        // Return the file path that can be stored in the database
        const imagePath = `/uploads/games/${req.file.filename}`;
        
        res.json({ 
            success: true, 
            imagePath: imagePath,
            message: 'Image uploaded successfully'
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

// Games API
/*app.get('/api/games', async (req, res) => {
    try {
        // Check if db is defined
        if (!db || typeof db.getAllGames !== 'function') {
            console.error('db object or getAllGames method is not defined');
            // Fallback to direct model query
            const games = await sequelize.models.Game.findAll({
                order: [['name', 'ASC']]
            });
            return res.json(games);
        }
        
        const games = await db.getAllGames();
        res.json(games);
    } catch (error) {
        console.error('Error fetching games:', error);
        res.status(500).json({ error: 'Failed to fetch games' });
    }
});*/

app.get('/api/games/:id', async (req, res) => {
    try {
        // Check if db is defined
        if (!db || typeof db.getGameById !== 'function') {
            console.error('db object or getGameById method is not defined');
            // Fallback to direct model query
            const game = await sequelize.models.Game.findByPk(req.params.id);
            if (!game) {
                return res.status(404).json({ error: 'Game not found' });
            }
            return res.json(game);
        }
        
        const game = await db.getGameById(req.params.id);
        if (!game) {
            return res.status(404).json({ error: 'Game not found' });
        }
        res.json(game);
    } catch (error) {
        console.error('Error fetching game:', error);
        res.status(500).json({ error: 'Failed to fetch game' });
    }
});

app.post('/api/games', async (req, res) => {
    try {
        const newGame = await db.createGame(req.body);
        res.status(201).json(newGame);
    } catch (error) {
        console.error('Error creating game:', error);
        res.status(500).json({ error: 'Failed to create game' });
    }
});

app.put('/api/games/:id', async (req, res) => {
    try {
        const updatedGame = await db.updateGame(req.params.id, req.body);
        if (!updatedGame) {
            return res.status(404).json({ error: 'Game not found' });
        }
        res.json(updatedGame);
    } catch (error) {
        console.error('Error updating game:', error);
        res.status(500).json({ error: 'Failed to update game' });
    }
});

app.delete('/api/games/:id', async (req, res) => {
    try {
        // Get the game to find the image path
        const game = await db.getGameById(req.params.id);
        
        // Delete the game from the database
        const result = await db.deleteGame(req.params.id);
        
        if (!result) {
            return res.status(404).json({ error: 'Game not found' });
        }
        
        // If the game has an image, delete it from the filesystem
        if (game && game.coverImage && game.coverImage.startsWith('/uploads/games/')) {
            const imagePath = path.join(__dirname, '..', game.coverImage);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        
        res.json({ success: true, message: 'Game deleted successfully' });
    } catch (error) {
        console.error('Error deleting game:', error);
        res.status(500).json({ error: 'Failed to delete game' });
    }
});

// Get tournaments by game
app.get('/api/games/:id/tournaments', async (req, res) => {
    try {
        const tournaments = await db.getTournamentsByGame(req.params.id);
        res.json(tournaments);
    } catch (error) {
        console.error('Error fetching tournaments by game:', error);
        res.status(500).json({ error: 'Failed to fetch tournaments' });
    }
});

// Tournaments API
app.get('/api/tournaments', async (req, res) => {
    try {
        const tournaments = await Tournament.findAll({
            include: [{
                model: sequelize.models.Game,
                attributes: ['id', 'name', 'coverImage']
            }],
            order: [['startDate', 'DESC']]
        });

        // Transform the response to include full image URLs
        const transformedTournaments = tournaments.map(tournament => {
            const plainTournament = tournament.get({ plain: true });
            if (plainTournament.Game && plainTournament.Game.coverImage) {
                plainTournament.Game.coverImage = `/assets/images/games/GameLogos/${plainTournament.Game.coverImage}`;
            }
            return plainTournament;
        });

        res.json(transformedTournaments);
    } catch (error) {
        console.error('Error fetching tournaments:', error);
        res.status(500).json({ error: 'Failed to fetch tournaments' });
    }
});

app.post('/api/tournaments', async (req, res) => {
    try {
        const tournament = await Tournament.create(req.body);
        res.status(201).json(tournament);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/tournaments/:id', async (req, res) => {
    try {
        const tournament = await Tournament.findByPk(req.params.id, {
            include: [Player, Match]
        });
        if (!tournament) {
            return res.status(404).json({ error: 'Tournament not found' });
        }
        res.json(tournament);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Player routes
app.get('/api/players', async (req, res) => {
    try {
        const players = await Player.findAll();
        res.json(players);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/players', async (req, res) => {
    try {
        const player = await Player.create(req.body);
        res.status(201).json(player);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Match routes
app.get('/api/matches', async (req, res) => {
    try {
        const matches = await Match.findAll({
            include: [Tournament, Player]
        });
        res.json(matches);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin Settings routes
app.get('/api/admin/settings', (req, res) => {
    try {
        // For now, return mock settings data
        // In a real application, this would be fetched from a database
        const settings = {
            general: {
                siteName: 'VR Battle Royale',
                siteDescription: 'The ultimate platform for VR gaming tournaments',
                maintenanceMode: false
            },
            email: {
                enableNotifications: true,
                fromEmail: 'notifications@vrbattleroyale.com',
                smtpHost: 'smtp.example.com',
                smtpPort: '587',
                smtpUser: 'smtp_user'
            },
            tournaments: {
                maxActive: 10,
                requireApproval: true,
                registrationDays: 7
            },
            security: {
                twoFactorAuth: false,
                sessionTimeout: 60,
                maxLoginAttempts: 5
            }
        };
        
        res.json(settings);
    } catch (error) {
        console.error('Error fetching admin settings:', error);
        res.status(500).json({ error: 'Failed to fetch admin settings' });
    }
});

app.post('/api/admin/settings', (req, res) => {
    try {
        // In a real application, this would save to a database
        // For now, just log the received settings and return success
        console.log('Received settings update:', req.body);
        
        res.json({ 
            success: true, 
            message: 'Settings updated successfully'
        });
    } catch (error) {
        console.error('Error updating admin settings:', error);
        res.status(500).json({ error: 'Failed to update admin settings' });
    }
});

// Add a debug route to check static file serving
app.get('/api/debug/check-image/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const imagePath = path.join(assetsPath, 'images', 'games', 'GameLogos', filename);
        
        console.log('Debug route - checking image path:', imagePath);
        
        // Check if file exists
        if (fs.existsSync(imagePath)) {
            console.log('Image file exists:', filename);
            
            // Send file info
            const stats = fs.statSync(imagePath);
            res.json({
                exists: true,
                filename: filename,
                fullPath: imagePath,
                size: stats.size,
                lastModified: stats.mtime
            });
        } else {
            console.log('Image file does not exist:', filename);
            res.status(404).json({
                exists: false,
                filename: filename,
                fullPath: imagePath,
                message: 'File not found'
            });
        }
    } catch (error) {
        console.error('Error checking image:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add a debug route to list all available images
app.get('/api/debug/list-images', (req, res) => {
    try {
        const imageDir = path.join(assetsPath, 'images', 'games', 'GameLogos');
        console.log('Debug route - listing images in:', imageDir);
        
        if (fs.existsSync(imageDir)) {
            const files = fs.readdirSync(imageDir);
            res.json({
                directory: imageDir,
                fileCount: files.length,
                files: files
            });
        } else {
            res.status(404).json({
                error: 'Directory not found',
                directory: imageDir
            });
        }
    } catch (error) {
        console.error('Error listing images:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add a dedicated route to serve game images directly
app.get('/game-images/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const imagePath = path.join(assetsPath, 'images', 'games', 'GameLogos', filename);
        
        console.log('Game image request for:', filename);
        
        // Check if file exists
        if (fs.existsSync(imagePath)) {
            // Set appropriate content type for WebP
            if (filename.toLowerCase().endsWith('.webp')) {
                res.setHeader('Content-Type', 'image/webp');
            }
            
            // Add cache control
            res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
            
            // Send the file
            res.sendFile(imagePath);
        } else {
            console.error(`Image not found: ${filename}`);
            res.status(404).send('Image not found');
        }
    } catch (error) {
        console.error('Error serving game image:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
let server = null;

// Function to start the server
function startServer() {
    // Check if server is already running
    if (server) {
        console.log('Server is already running');
        return server;
    }
    
    // Try to find an available port
    function tryPort(port) {
        return new Promise((resolve, reject) => {
            // Create a test server to check if port is available
            const testServer = require('http').createServer();
            
            testServer.once('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    console.log(`Port ${port} is already in use. Trying next port.`);
                    // Try the next port
                    testServer.close(() => {
                        resolve(tryPort(port + 1));
                    });
                } else {
                    reject(err);
                }
            });
            
            testServer.once('listening', () => {
                // Port is available, close test server and return the port
                testServer.close(() => {
                    resolve(port);
                });
            });
            
            testServer.listen(port);
        });
    }
    
    // Find an available port starting from the default PORT
    return tryPort(PORT).then(availablePort => {
        // Update the PORT constant to the available port
        app.set('port', availablePort);
        
        // Now start the server on the available port
        server = app.listen(availablePort, () => {
            console.log(`Server is running on port ${availablePort}`);
        });
        
        // Add graceful shutdown handler
        process.on('SIGINT', () => {
            console.log('Received SIGINT. Shutting down server gracefully...');
            shutdown();
        });
        
        process.on('SIGTERM', () => {
            console.log('Received SIGTERM. Shutting down server gracefully...');
            shutdown();
        });
        
        return server;
    }).catch(err => {
        console.error('Failed to start server:', err);
        throw err;
    });
}

// Function to handle graceful shutdown
function shutdown() {
    if (!server) {
        console.log('Server is not running');
        return Promise.resolve();
    }
    
    return new Promise((resolve) => {
        console.log('Closing HTTP server...');
        server.close(() => {
            console.log('HTTP server closed.');
            // Close database connection
            sequelize.close()
                .then(() => {
                    console.log('Database connection closed.');
                    resolve();
                })
                .catch(err => {
                    console.error('Error closing database connection:', err);
                    resolve();
                });
        });
        
        // Force close after 10 seconds
        setTimeout(() => {
            console.error('Could not close connections in time, forcing shutdown');
            resolve();
        }, 10000);
    });
}

// Only start the server if this file is run directly (not when required as a module)
if (require.main === module) {
    startServer();
}

// Export the app, server, startServer and shutdown functions
module.exports = { app, server, startServer, shutdown };