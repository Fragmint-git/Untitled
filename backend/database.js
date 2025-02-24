const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const fs = require('fs');

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

// Define Models
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
        type: DataTypes.TEXT
    },
    startDate: {
        type: DataTypes.DATE
    },
    endDate: {
        type: DataTypes.DATE
    },
    status: {
        type: DataTypes.ENUM('draft', 'active', 'completed'),
        defaultValue: 'draft'
    },
    gameType: {
        type: DataTypes.STRING
    },
    maxPlayers: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
});

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
    email: {
        type: DataTypes.STRING,
        validate: {
            isEmail: true
        }
    },
    displayName: {
        type: DataTypes.STRING
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    }
});

const Match = sequelize.define('Match', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    startTime: {
        type: DataTypes.DATE
    },
    status: {
        type: DataTypes.ENUM('scheduled', 'in_progress', 'completed'),
        defaultValue: 'scheduled'
    },
    round: {
        type: DataTypes.INTEGER
    },
    score: {
        type: DataTypes.JSON
    }
});

// Define Relationships
Tournament.hasMany(Match);
Match.belongsTo(Tournament);

Player.belongsToMany(Tournament, { through: 'PlayerTournament' });
Tournament.belongsToMany(Player, { through: 'PlayerTournament' });

Match.belongsToMany(Player, { through: 'MatchPlayer' });
Player.belongsToMany(Match, { through: 'MatchPlayer' });

// Export models and sequelize instance
module.exports = {
    sequelize,
    Tournament,
    Player,
    Match
};