const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const { initBackendIntegration } = require('./backend-integration');
const { sequelize } = require('./backend/database');
const path = require('path');
const url = require('url');

// Keep a global reference of the window object
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    }
  });

  // Load the index.html of the app
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'renderer/index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Open the DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished initialization
app.on('ready', async () => {
  try {
    // Initialize database with force: true to recreate tables
    // WARNING: This will drop existing tables and recreate them
    // Only use this during development or when you need to update schema
    await sequelize.sync({ force: true });
    console.log('Database synchronized');
    
    // Initialize backend integration
    initBackendIntegration();
    
    // Create the main window
    createWindow();
  } catch (error) {
    console.error('Failed to initialize application:', error);
  }
});

// Quit when all windows are closed
app.on('window-all-closed', function () {
  // On macOS applications keep their menu bar active until the user quits
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  // On macOS re-create a window when dock icon is clicked and no other windows open
  if (mainWindow === null) createWindow();
});

// In this file you can include the rest of your app's specific main process code
// You can also put them in separate files and require them here.