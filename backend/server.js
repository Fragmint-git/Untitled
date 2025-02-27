const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { sequelize, Tournament, Player, Match } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

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

// Initialize database
async function initializeDatabase() {
    try {
        // Sync all models with database
        await sequelize.sync({ alter: true });
        console.log('Database synchronized successfully');

        // Check if we need to seed with initial data
        const tournamentCount = await Tournament.count();
        if (tournamentCount === 0) {
            console.log('Seeding initial data...');
            // Add some sample data
            await Tournament.create({
                name: 'VR Championship 2025',
                description: 'The biggest VR tournament of the year',
                startDate: new Date('2025-03-15'),
                endDate: new Date('2025-03-20'),
                status: 'draft',
                gameType: 'Beat Saber',
                maxPlayers: 64
            });
            
            await Player.bulkCreate([
                { username: 'player1', email: 'player1@example.com', displayName: 'Pro Player 1' },
                { username: 'player2', email: 'player2@example.com', displayName: 'Pro Player 2' },
                { username: 'player3', email: 'player3@example.com', displayName: 'Pro Player 3' }
            ]);
            
            console.log('Sample data created');
        }
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

// Initialize database when server starts
initializeDatabase();

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
app.get('/api/games', async (req, res) => {
    try {
        const games = await db.getAllGames();
        res.json(games);
    } catch (error) {
        console.error('Error fetching games:', error);
        res.status(500).json({ error: 'Failed to fetch games' });
    }
});

app.get('/api/games/:id', async (req, res) => {
    try {
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

// Tournament routes
app.get('/api/tournaments', async (req, res) => {
    try {
        const tournaments = await Tournament.findAll();
        res.json(tournaments);
    } catch (error) {
        res.status(500).json({ error: error.message });
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

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;