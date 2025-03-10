const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    'api', {
        // Store operations
        getFeaturedItems: () => ipcRenderer.invoke('get-featured-items'),
        getSpecialOffers: () => ipcRenderer.invoke('get-special-offers'),
        getNewReleases: () => ipcRenderer.invoke('get-new-releases'),
        getTopSellers: () => ipcRenderer.invoke('get-top-sellers'),
        getRecommendedItems: () => ipcRenderer.invoke('get-recommended-items'),
        getCategoryItems: (category) => ipcRenderer.invoke('get-category-items', category),
        addToCart: (itemId) => ipcRenderer.invoke('add-to-cart', itemId),
        
        // Game operations
        getGames: () => ipcRenderer.invoke('get-games'),
        getGame: (id) => ipcRenderer.invoke('get-game', id),
        createGame: (gameData) => ipcRenderer.invoke('create-game', gameData),
        updateGame: (id, data) => ipcRenderer.invoke('update-game', { id, data }),
        deleteGame: (id) => ipcRenderer.invoke('delete-game', id),
        
        // Tournament operations
        getTournaments: () => ipcRenderer.invoke('get-tournaments'),
        getTournament: (id) => ipcRenderer.invoke('get-tournament', id),
        createTournament: (tournamentData) => ipcRenderer.invoke('create-tournament', tournamentData),
        updateTournament: (id, data) => ipcRenderer.invoke('update-tournament', { id, data }),
        
        // Player operations
        getPlayers: () => ipcRenderer.invoke('get-players'),
        createPlayer: (playerData) => ipcRenderer.invoke('create-player', playerData),
        updatePlayer: (id, data) => ipcRenderer.invoke('update-player', { id, data }),
        
        // Match operations
        getMatches: () => ipcRenderer.invoke('get-matches'),
        createMatch: (matchData) => ipcRenderer.invoke('create-match', matchData),
        updateMatch: (id, data) => ipcRenderer.invoke('update-match', { id, data }),
        
        // Database operations
        getDatabaseTables: () => ipcRenderer.invoke('get-database-tables'),
        getTableData: (tableName) => ipcRenderer.invoke('get-table-data', tableName),
        
        // Add quit application function
        quitApp: () => ipcRenderer.invoke('quit-app')
    }
);