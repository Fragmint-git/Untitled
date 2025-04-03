require('dotenv').config();
const { app, BrowserWindow, ipcMain, Menu, protocol, net, nativeTheme } = require('electron');
const { initBackendIntegration, cleanupBackendIntegration } = require('./backend-integration');
const { sequelize } = require('./backend/database');
const path = require('path');
const url = require('url');

//const { Player } = require('./backend/database');
const { User } = require('./backend/database');
const { Op } = require('sequelize');

const apiUrl = process.env.API_URL;
const serverKey = process.env.SERVER_KEY;
const gameVersion = process.env.GAME_VERSION;

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
    await sequelize.sync({ force: false });
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

ipcMain.handle('save-personal-info', async (event, formData) => {
  try {
    const user = await User.findByPk(formData.id);

    if (user) {
      await user.update({
        displayName: formData.displayName,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio
      });

      return { success: true, data: user };
    } else {
      return { success: false, error: 'User not found' };
    }
  } catch (err) {
    console.error('Error saving personal info:', err);
    return { success: false, error: err.message };
  }
});



ipcMain.handle('login', async (event, username, password) => {
  try {
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { username: username },
          { email: username }
        ]
      }
    });

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    if (user.password !== password) {
      return { success: false, message: 'Incorrect password' };
    }

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        account_type: user.account_type
      }
    };
  } catch (error) {
    console.error('Login failed:', error);
    return { success: false, message: 'Login failed due to server error' };
  }
});


ipcMain.handle('register', async (event, formData) => {
  try {
    const { username, email, password } = formData;

    const existing = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }]
      }
    });

    if (existing) {
      return { success: false, message: 'Username or email already exists.' };
    }

    const newUser = await User.create({
      username,
      email,
      password,
      account_type: 'user'
    });

    return {
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        account_type: newUser.account_type
      }
    };
  } catch (err) {
    console.error('Registration error:', err);
    return { success: false, message: 'Registration failed on server.' };
  }
});

ipcMain.handle('get-user-by-id', async (event, id) => {
  try {
    const user = await User.findByPk(id);

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName || '',
        fullName: user.fullName || '',
        phone: user.phone || '',
        bio: user.bio || '',
        account_type: user.account_type
      }
    };
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return { success: false, message: 'Error fetching user profile.' };
  }
});


// In this file you can include the rest of your app's specific main process code
// You can also put them in separate files and require them here.