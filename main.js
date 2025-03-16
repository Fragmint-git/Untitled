const { app, BrowserWindow, ipcMain, Menu, protocol, net, nativeTheme } = require('electron');
const { initBackendIntegration, cleanupBackendIntegration } = require('./backend-integration');
const { sequelize } = require('./backend/database');
const path = require('path');
const url = require('url');

// Keep a global reference of the window object
let mainWindow;

// Keep track of the server process
let serverProcess = null;

function createWindow() {
  // Force dark mode
  nativeTheme.themeSource = 'dark';
  
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    darkTheme: true,
    backgroundColor: '#1e1e1e',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      webviewTag: false
    }
  });

  // Set Content Security Policy
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' http://localhost:3000;",
          "script-src 'self' 'unsafe-inline';",
          "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;",
          "img-src 'self' data: file: http://localhost:* https://randomuser.me local-file://*;",
          "font-src 'self' https: https://cdnjs.cloudflare.com;",
          "connect-src 'self' http://localhost:*;",
          "media-src 'self';"
        ].join(' ')
      }
    });
  });

  // Register protocol for serving local files
  protocol.handle('local-file', (request) => {
    const url = request.url.slice('local-file://'.length);
    return net.fetch('file://' + path.normalize(`${__dirname}/${url}`));
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

// Handle graceful shutdown
async function gracefulShutdown() {
  console.log('Initiating graceful shutdown...');
  
  try {
    // First, cleanup backend integration (Express server)
    console.log('Cleaning up backend integration...');
    await cleanupBackendIntegration();
    
    // Close database connection with a timeout
    if (sequelize) {
      console.log('Closing database connection...');
      try {
        // Wait for any pending transactions to complete
        await Promise.race([
          sequelize.close(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database close timeout')), 5000)
          )
        ]);
      } catch (dbError) {
        console.warn('Database close warning:', dbError);
        // Continue shutdown even if database close has issues
      }
    }
    
    // Close the main window if it exists
    if (mainWindow) {
      console.log('Closing main window...');
      mainWindow.destroy();
    }
    
    // Quit the application
    console.log('Quitting application...');
    app.exit(0); // Use app.exit(0) instead of app.quit() to ensure immediate exit
  } catch (error) {
    console.error('Error during shutdown:', error);
    // Force quit if graceful shutdown fails
    process.exit(1);
  }
}

// Add a forceful exit after timeout if graceful shutdown gets stuck
function forceQuitAfterTimeout() {
  const FORCE_QUIT_TIMEOUT = 10000; // 10 seconds
  console.log(`Will force quit after ${FORCE_QUIT_TIMEOUT/1000} seconds if graceful shutdown fails`);
  
  setTimeout(() => {
    console.error('Graceful shutdown took too long - forcing exit');
    process.exit(1);
  }, FORCE_QUIT_TIMEOUT);
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
    
    // Handle window control IPC events
    ipcMain.handle('window-minimize', () => {
      if (mainWindow) mainWindow.minimize();
    });
    
    ipcMain.handle('window-maximize', () => {
      if (mainWindow) {
        if (mainWindow.isMaximized()) {
          mainWindow.unmaximize();
        } else {
          mainWindow.maximize();
        }
      }
    });
    
    ipcMain.handle('window-close', () => {
      if (mainWindow) mainWindow.close();
    });
    
    // Handle IPC quit request
    ipcMain.handle('quit-app', async () => {
      forceQuitAfterTimeout(); // Set up force quit timer
      await gracefulShutdown();
    });
  } catch (error) {
    console.error('Failed to initialize application:', error);
  }
});

// Quit when all windows are closed
app.on('window-all-closed', function () {
  // On macOS applications keep their menu bar active until the user quits
  if (process.platform !== 'darwin') {
    forceQuitAfterTimeout(); // Set up force quit timer  
    gracefulShutdown();
  }
});

app.on('activate', function () {
  // On macOS re-create a window when dock icon is clicked and no other windows open
  if (mainWindow === null) createWindow();
});

// Handle the quit event
let isQuitting = false; // Move this outside the event handler

app.on('before-quit', async (event) => {
  // This event can be called multiple times if shutdown is slow, only handle it once
  if (!isQuitting) {
    isQuitting = true;
    event.preventDefault();
    forceQuitAfterTimeout(); // Set up force quit timer
    await gracefulShutdown();
  }
});

// In this file you can include the rest of your app's specific main process code
// You can also put them in separate files and require them here.