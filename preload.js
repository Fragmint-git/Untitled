const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    'api', {
        // Tournament operations
        getTournaments: () => ipcRenderer.invoke('get-tournaments'),
        getTournament: (id) => ipcRenderer.invoke('get-tournament', id),
        createTournament: (tournamentData) => ipcRenderer.invoke('create-tournament', tournamentData),
        updateTournament: (id, data) => ipcRenderer.invoke('update-tournament', { id, data }),
        
        // Player operations
        getPlayers: () => ipcRenderer.invoke('get-players'),
        createPlayer: (playerData) => ipcRenderer.invoke('create-player', playerData),
        
        // Match operations
        getMatches: () => ipcRenderer.invoke('get-matches'),
        createMatch: (matchData) => ipcRenderer.invoke('create-match', matchData)
    }
);