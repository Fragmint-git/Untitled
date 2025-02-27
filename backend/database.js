const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');
const store = new Store();

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(dataDir, 'tournament.db'),
    logging: false
});

// Define Game model
const Game = sequelize.define('Game', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    developer: {
        type: DataTypes.STRING,
        allowNull: false
    },
    releaseDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    platforms: {
        type: DataTypes.TEXT, // Stored as JSON string
        allowNull: false,
        get() {
            const rawValue = this.getDataValue('platforms');
            return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value) {
            this.setDataValue('platforms', JSON.stringify(value));
        }
    },
    genres: {
        type: DataTypes.TEXT, // Stored as JSON string
        allowNull: false,
        get() {
            const rawValue = this.getDataValue('genres');
            return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value) {
            this.setDataValue('genres', JSON.stringify(value));
        }
    },
    coverImage: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'active'
    }
});

// Define Tournament model
const Tournament = sequelize.define('Tournament', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'upcoming'
    },
    maxPlayers: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 32
    }
});

// Define Player model
const Player = sequelize.define('Player', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    displayName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'active'
    }
});

// Define Match model
const Match = sequelize.define('Match', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    startTime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'scheduled'
    },
    result: {
        type: DataTypes.TEXT, // Stored as JSON string
        allowNull: true,
        get() {
            const rawValue = this.getDataValue('result');
            return rawValue ? JSON.parse(rawValue) : null;
        },
        set(value) {
            this.setDataValue('result', JSON.stringify(value));
        }
    }
});

// Define relationships
Game.hasMany(Tournament, {
    foreignKey: {
        name: 'GameId',
        allowNull: false
    },
    onDelete: 'CASCADE'
});
Tournament.belongsTo(Game);

Tournament.hasMany(Match, {
    foreignKey: {
        name: 'TournamentId',
        allowNull: false
    },
    onDelete: 'CASCADE'
});
Match.belongsTo(Tournament);

// Many-to-many relationship between Tournament and Player
const TournamentPlayer = sequelize.define('TournamentPlayer', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }
});

Tournament.belongsToMany(Player, { through: TournamentPlayer });
Player.belongsToMany(Tournament, { through: TournamentPlayer });

// Many-to-many relationship between Match and Player
const MatchPlayer = sequelize.define('MatchPlayer', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }
});

Match.belongsToMany(Player, { through: MatchPlayer });
Player.belongsToMany(Match, { through: MatchPlayer });

// Database operations
const db = {
    // Game operations
    getAllGames: async () => {
        try {
            const games = await Game.findAll({
                order: [['name', 'ASC']]
            });
            
            // Add tournament count to each game
            const gamesWithCount = await Promise.all(games.map(async (game) => {
                const count = await Tournament.count({
                    where: { GameId: game.id }
                });
                
                const gameData = game.toJSON();
                gameData.tournamentCount = count;
                return gameData;
            }));
            
            return gamesWithCount;
        } catch (error) {
            console.error('Error getting all games:', error);
            throw error;
        }
    },
    
    getGameById: async (id) => {
        try {
            const game = await Game.findByPk(id);
            if (!game) return null;
            
            const tournamentCount = await Tournament.count({
                where: { GameId: game.id }
            });
            
            const gameData = game.toJSON();
            gameData.tournamentCount = tournamentCount;
            
            return gameData;
        } catch (error) {
            console.error(`Error getting game with id ${id}:`, error);
            throw error;
        }
    },
    
    createGame: async (gameData) => {
        try {
            const game = await Game.create(gameData);
            return game.toJSON();
        } catch (error) {
            console.error('Error creating game:', error);
            throw error;
        }
    },
    
    updateGame: async (id, gameData) => {
        try {
            const game = await Game.findByPk(id);
            if (!game) return null;
            
            // If there's a new cover image and the old one exists, delete the old one
            if (gameData.coverImage && game.coverImage && 
                gameData.coverImage !== game.coverImage && 
                game.coverImage.startsWith('/uploads/games/')) {
                
                const oldImagePath = path.join(__dirname, '..', game.coverImage);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            
            await game.update(gameData);
            return game.toJSON();
        } catch (error) {
            console.error(`Error updating game with id ${id}:`, error);
            throw error;
        }
    },
    
    deleteGame: async (id) => {
        try {
            const game = await Game.findByPk(id);
            if (!game) return false;
            
            await game.destroy();
            return true;
        } catch (error) {
            console.error(`Error deleting game with id ${id}:`, error);
            throw error;
        }
    },
    
    getTournamentsByGame: async (gameId) => {
        try {
            const tournaments = await Tournament.findAll({
                where: { GameId: gameId },
                order: [['startDate', 'ASC']]
            });
            
            // Add player count to each tournament
            const tournamentsWithCount = await Promise.all(tournaments.map(async (tournament) => {
                const count = await TournamentPlayer.count({
                    where: { TournamentId: tournament.id }
                });
                
                const tournamentData = tournament.toJSON();
                tournamentData.playerCount = count;
                return tournamentData;
            }));
            
            return tournamentsWithCount;
        } catch (error) {
            console.error(`Error getting tournaments for game with id ${gameId}:`, error);
            throw error;
        }
    },
    
    // Tournament operations
    // ... existing tournament operations ...
    
    // Player operations
    // ... existing player operations ...
    
    // Match operations
    // ... existing match operations ...
};

// Initialize database
const initDatabase = async () => {
    try {
        await sequelize.sync();
        console.log('Database synchronized successfully');
    } catch (error) {
        console.error('Error synchronizing database:', error);
        throw error;
    }
};

// Initialize database on module load
initDatabase();

module.exports = {
    db,
    sequelize,
    Game,
    Tournament,
    Player,
    Match,
    TournamentPlayer,
    MatchPlayer
};