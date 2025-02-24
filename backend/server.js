const express = require('express');
const { sequelize, Tournament, Player, Match } = require('./database');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

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
    console.log(`API server running on port ${PORT}`);
});

module.exports = app;