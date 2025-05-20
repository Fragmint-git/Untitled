require('dotenv').config();
const { app, BrowserWindow, ipcMain, Menu, protocol, net, nativeTheme } = require('electron');
const { initBackendIntegration, cleanupBackendIntegration } = require('./backend-integration');
const { sequelize } = require('./backend/database');
const path = require('path');
const url = require('url');
const packageJson = require('./package.json');


// Set the application name for macOS menu bar
app.name = 'VR Battles Nexus';

//const { Player } = require('./backend/database');
const { User, UserSetting } = require('./backend/database');
const { Op } = require('sequelize');
const axios = require('axios');
const crypto = require('crypto');
const Store = require('electron-store');
const store = new Store();
const { rating, rate, ordinal } = require('openskill');


const apiUrl = process.env.API_URL;
const serverKey = process.env.SERVER_KEY;
const gameVersion = process.env.GAME_VERSION;

// Keep a global reference of the window object
let mainWindow;

// Keep track of the server process
let serverProcess = null;

// Register custom protocol for serving local files EARLY
// Must be done before the app is ready or early in the ready event
protocol.registerSchemesAsPrivileged([
  { scheme: 'local-file', privileges: { secure: true, standard: true, supportFetchAPI: true } }
]);

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
    icon: __dirname + '/assets/icons/renamed/vrb-logo-' + (process.platform === 'darwin' ? '512.png' : 
            process.platform === 'win32' ? '512.ico' : '256.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      webviewTag: false
    }
  });

  mainWindow.webContents.openDevTools();

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
          //"connect-src 'self' http://localhost:*;",
          "connect-src 'self' http://localhost:* https://www.vrbattles.gg https://vrbattles.gg;",

          "media-src 'self';"
        ].join(' ')
      }
    });
  });

  // Load the index.html of the app
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'renderer/welcome.html'),
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
    // First, cleanup backend integration (Express server and its DB connection)
    console.log('Cleaning up backend integration...');
    await cleanupBackendIntegration();
    
    // The database connection is now closed by cleanupBackendIntegration/server.shutdown
    // We no longer need to close it here.
    /* 
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
    */
    
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
app.whenReady().then(async () => {
  // Set custom dock icon for macOS
  if (process.platform === 'darwin') {
    try {
      // Use path.resolve to get absolute path and handle spaces in filenames
      // Try PNG instead of ICNS for macOS - more reliable 
      const iconPath = __dirname + '/assets/icons/renamed/vrb-logo-512.png';
      app.dock.setIcon(iconPath);
      console.log('Set dock icon:', iconPath);
    } catch (iconError) {
      console.error('Failed to set dock icon:', iconError);
    }
  }
  // Register the actual handler for the protocol now that app is ready
  protocol.handle('local-file', (request) => {
    const urlPath = request.url.slice('local-file://'.length);
    const decodedPath = decodeURI(urlPath); // Decode URL-encoded characters
    const absolutePath = path.join(__dirname, decodedPath);
    console.log(`[Protocol] Handling local-file request for: ${absolutePath}`);
    // Ensure path doesn't try to escape the project directory (basic security)
    if (!absolutePath.startsWith(__dirname)) {
        console.error(`[Protocol] Invalid path request: ${absolutePath}`);
        return new Response(null, { status: 400 });
    }
    return net.fetch(url.pathToFileURL(absolutePath).toString());
  });

  try {
    // Initialize database 
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


ipcMain.handle('session:save', (event, user) => {
  store.set('userSession', user);
  return true;
});

ipcMain.handle('session:get', () => {
  return store.get('userSession');
});

//session clearing
ipcMain.handle('session:clear', () => {
  store.delete('userSession');
  return true;
});


/*ipcMain.handle('save-personal-info', async (event, formData) => {
  try {
    const user = await User.findByPk(formData.id);

    if (user) {
      await user.update({
        username: formData.username,
        ign: formData.ign,
        email: formData.email,
        platform: formData.platform
      });

      const existingSetting = await UserSetting.findOne({ where: { user_id: formData.id } });

      if (existingSetting) {
        await existingSetting.update({ time_zone: formData.timezone });
      } else {
        await UserSetting.create({ user_id: formData.id, time_zone: formData.timezone });
      }

      return { success: true, data: user };
    } else {
      return { success: false, error: 'User not found' };
    }
  } catch (err) {
    console.error('Error saving personal info:', err);
    return { success: false, error: err.message };
  }
});*/

ipcMain.handle('save-personal-info', async (event, formData) => {
  try {
    const id = formData.id;

    if (!id) {
      return { success: false, error: 'Missing user ID.' };
    }

    const response = await fetch('http://localhost/api/profile/my_profile_update', {
    //const response = await fetch('https://vrbattles.gg/api/profile/my_profile_update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        edit: true, 
        editid: id, 
        username: formData.username,
        ign: formData.ign,
        platform: formData.platform,
        timezone: formData.timezone,
        bio: formData.bio
      })
    });

    const text = await response.text();
    let result;

    try {
      result = JSON.parse(text);
    } catch (e) {
      return { success: false, error: 'Invalid JSON from API', raw: text };
    }

    if (result.status === 'success') {
      return { success: true, message: result.message };
    } else {
      return { success: false, message: result.message || 'Match request failed' };
    }    

  } catch (err) {
    console.error('API Error saving personal info:', err);
    return { success: false, error: err.message };
  }
});









/*ipcMain.handle('login', async (event, username, password) => {
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

ipcMain.handle('login', async (event, username, password) => {
  try {
    let resolvedEmail = username;

    if (!username.includes('@')) {
      const userInDb = await User.findOne({ where: { username } });
      if (userInDb) {
        resolvedEmail = userInDb.email;
      } else {
        return { success: false, message: 'User not found.' };
      }
    }

    const hashedPassword = crypto.createHash('md5').update(password).digest('hex');

    const lootlockerLogin = await axios.post('https://api.lootlocker.io/white-label-login/login', {
      email: resolvedEmail,
      password,
      remember: true
    }, {
      headers: {
        'Content-type': 'application/json',
        'is-development': 'true',
        'domain-key': process.env.LOOTLOCKER_DOMAIN_KEY
      }
    });

    const { session_token, email: lootEmail } = lootlockerLogin.data;

    const gameSession = await axios.post('https://api.lootlocker.io/game/v2/session/white-label', {
      game_key: process.env.LOOTLOCKER_GAME_KEY,
      email: lootEmail,
      token: session_token,
      game_version: process.env.GAME_VERSION || '1.0'
    }, {
      headers: {
        'Content-type': 'application/json'
      }
    });

    const { session_token: gameSessionToken, player_id: playerSessionId, wallet_id: walletId } = gameSession.data;

    let user = await User.findOne({
      where: {
        [Op.or]: [
          { username },
          { email: resolvedEmail }
        ]
      }
    });

    if (!user) {
      const uniqueUsername = `fragmint-${Math.random().toString(36).substr(2, 8)}`;
      user = await User.create({
        username: uniqueUsername,
        firstname: uniqueUsername,
        lastname: 'Fragmint',
        email: resolvedEmail,
        password: hashedPassword,
        last_login: new Date(),
        date_registered: new Date(),
        last_updated_timestamp: new Date(),
        player_session_id: playerSessionId,
        wallet_id: walletId,
        is_admin: 0,
        is_delete: 0
      });
    } else {
      await user.update({
        last_login: new Date(),
        player_session_id: playerSessionId,
        wallet_id: walletId
      });
    }

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        ign: user.ign,
        email: user.email,
        lootlocker_token: gameSessionToken,
        player_session_id: user.player_session_id,
        wallet_id: user.wallet_id,
        profile_avatar: user.profile || null,
        player_banner: user.player_banner || null
      },
      userSession: {
        id: user.id,
        email: user.email,
        username: user.username,
        platform: user.platform,
        ign: user.ign,
        player_session_id: user.player_session_id,
        wallet_id: user.wallet_id
      }
    };

  } catch (err) {
    console.error('[Login] Failed:', err?.response?.data || err.message);
    return { success: false, message: err?.response?.data?.message || 'Login failed.' };
  }
});*/







/*ipcMain.handle('register', async (event, formData) => {
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
    });

    return {
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      }
    };
  } catch (err) {
    console.error('Registration error:', err);
    return { success: false, message: 'Registration failed on server.' };
  }
});*/


ipcMain.handle('register-user', async (event, formData, file) => {
  try {
    //console.log('[Register] Incoming data:', formData);

    const {
      firstname, lastname, username, ign, platform, email,
      password, birthdate, country, region, state,
      ['timezone-select']: timezoneRaw
    } = formData;

    const timezone = timezoneRaw || formData['timezone'] || null;

    const usernameRegex = /^[A-Za-z0-9]+$/;
    const emailRegex = /^[A-Za-z0-9@._-]+$/;

    if (!usernameRegex.test(username)) return { success: false, message: 'Username should only contain letters and numbers.' };
    if (username.length > 20) return { success: false, message: 'Username must not exceed 20 characters.' };
    if (!emailRegex.test(email)) return { success: false, message: 'Invalid email format.' };

    const existingUser = await User.findOne({ where: { email } });
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUser || existingUsername) {
      //console.log('[Register] User already exists');
      return { success: false, message: 'User already exists.' };
    }

    let session_token = null;
    //console.log('[LootLocker] Attempting sign-up...');
    try {
      const signupRes = await axios.post('https://api.lootlocker.io/white-label-login/sign-up', {
        email,
        password
      }, {
        headers: {
          'Content-type': 'application/json',
          'is-development': 'true',
          'domain-key': process.env.LOOTLOCKER_DOMAIN_KEY
        }
      });
      session_token = signupRes.data?.session_token;
      //console.log('[LootLocker] Signup session token:', session_token);
    } catch (signupErr) {
      //console.warn('[LootLocker] Signup failed, attempting login...');
    }

    if (!session_token) {
      try {
        const loginRes = await axios.post('https://api.lootlocker.io/white-label-login/login', {
          email,
          password,
          remember: true
        }, {
          headers: {
            'Content-type': 'application/json',
            'is-development': 'true',
            'domain-key': process.env.LOOTLOCKER_DOMAIN_KEY
          }
        });
        session_token = loginRes.data?.session_token;
        //console.log('[LootLocker] Login session token:', session_token);
      } catch (loginErr) {
        //console.error('[LootLocker] Both sign-up and login failed.');
        return { success: false, message: 'Failed to retrieve LootLocker session token.' };
      }
    }

    //console.log('[LootLocker] Creating game session...');
    const sessionRes = await axios.post('https://api.lootlocker.io/game/v2/session/white-label', {
      game_key: process.env.LOOTLOCKER_GAME_KEY,
      email,
      token: session_token,
      game_version: process.env.GAME_VERSION || '1.0'
    }, {
      headers: {
        'Content-type': 'application/json'
      }
    });

    //console.log('[LootLocker] Game session response:', sessionRes.data);

    const gameSessionToken = sessionRes.data?.session_token;
    const playerSessionId = sessionRes.data?.player_id;
    const walletId = sessionRes.data?.wallet_id;

    //console.log('[LootLocker] Game session token:', gameSessionToken);
    //console.log('[LootLocker] Player session ID:', playerSessionId);

    if (!playerSessionId) {
      return { success: false, message: 'No player identifier returned from LootLocker.' };
    }

    let profileFilename = null;
    if (file && typeof file === 'string' && file.startsWith('data:image')) {
      //.log('[Profile Image] Processing upload...');
      const matches = file.match(/^data:(image\/\w+);base64,(.+)$/);
      if (matches) {
        const ext = matches[1].split('/')[1];
        const base64Data = matches[2];
        if ((base64Data.length * 3) / 4 > 2097152) {
          return { success: false, message: 'Profile photo must be less than 2MB.' };
        }
        profileFilename = `${Date.now()}.${ext}`;
        const uploadPath = path.join(__dirname, 'assets', 'uploads', 'profile', profileFilename);
        fs.writeFileSync(uploadPath, Buffer.from(base64Data, 'base64'));
        //console.log('[Profile Image] Saved as:', profileFilename);
      }
    }

    const hashedPassword = crypto.createHash('md5').update(password).digest('hex');

    //console.log('[Database] Creating new user...');
    const newUser = await User.create({
      firstname,
      lastname,
      username,
      ign,
      platform,
      email,
      password: hashedPassword,
      birthdate,
      country,
      region,
      state,
      date_registered: new Date(),
      last_updated_timestamp: new Date(),
      last_login: new Date(),
      is_admin: 0,
      is_delete: 0,
      profile: profileFilename,
      player_session_id: playerSessionId,
      wallet_id: walletId
    });

    if (timezone) {
      //console.log('[UserSetting] Saving timezone:', timezone);
      await UserSetting.create({ user_id: newUser.id, time_zone: timezone });
    } else {
      //console.warn('[UserSetting] No timezone provided. Skipping insert.');
    }

    try {
      //console.log('[LootLocker] Updating username...');
      const updateRes = await axios.put('https://api.lootlocker.io/game/player/name', {
        name: username
      }, {
        headers: {
          'x-session-token': gameSessionToken,
          'Content-type': 'application/json',
          'LL-Version': '2021-03-01'
        }
      });

      //console.log('[LootLocker] Update username response:', updateRes.data);

      if (!updateRes.data || updateRes.data.success !== true) {
        //console.warn('[LootLocker] Username update failed', updateRes.data);
      } else {
        //console.log('[LootLocker] Username updated successfully.');
      }

    } catch (err) {
      //console.error('[LootLocker Username Update Error]', err.response?.data || err.message);
    }

    return {
      success: true,
      data: newUser,
      lootlocker_session: {
        token: gameSessionToken,
        player_id: playerSessionId,
        wallet_id: walletId
      },
      userSession: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        ign: newUser.ign,
        player_session_id: playerSessionId,
        wallet_id: walletId
      }
    };
    
  } catch (err) {
    //console.error('Final Registration Error:', err.response?.data || err.message);
    return { success: false, message: 'Registration failed: ' + (err.response?.data?.message || err.message) };
  }
});





ipcMain.handle('get-user-by-id', async (event, id) => {
  try {
    const session = store.get('userSession');
    if (!id && (!session || !session.id)) {
      return { success: false, message: 'No session or user ID found.' };
    }

    id = id || session.id;

    const response = await fetch('http://localhost/api/fetch/user', {
    //const response = await fetch('https://vrbattles.gg/api/fetch/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });

    const text = await response.text();
    let result;

    try {
      result = JSON.parse(text);
      //console.log('[Fetch User] API Raw Result:', result);
    } catch (err) {
      return { success: false, message: 'Invalid JSON response from API', raw: text };
    }

    const user = result.user || result.data?.[0];

    if (result.status !== 'success' || !user) {
      return { success: false, message: result.message || 'Failed to fetch user' };
    }

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        ign: user.ign || '',
        email: user.email,
        platform: user.platform || '',
        timezone: user.timezone || '',
        displayName: user.username || '',
        fullName: `${user.firstname || ''} ${user.lastname || ''}`.trim(),
        phone: '',
        bio: '',
        avatar: user.profile || '',
        banner: user.player_banner || '',
        player_session_id: user.player_session_id,
        wallet_id: user.wallet_id,
        stats: {},
        mmr: {},
        teams: {}
      }
    };
  } catch (error) {
    //console.error('[Electron] API fetch error:', error);
    return { success: false, message: 'Error fetching user profile from API' };
  }
});


ipcMain.handle('teams-fetch', async (event, id) => {
  try {
    const response = await fetch('http://localhost/api/fetch/teams', {
    //const response = await fetch('https://vrbattles.gg/api/fetch/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });

    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      return { status: 'error', message: 'Invalid JSON', raw: text };
    }
  } catch (err) {
    console.error('teams-fetch failed:', err);
    return { status: 'error', message: err.message };
  }
});


ipcMain.handle('submit-match-request', async (event, matchData) => {
  try {
      const response = await fetch('http://localhost/api/matches/match_request', {
      //const response = await fetch('https://vrbattles.gg/api/matches/match_request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(matchData)
    });

    const text = await response.text();
    let result;

    try {
      result = JSON.parse(text);
    } catch (e) {
      return { success: false, message: 'Invalid JSON from API', raw: text };
    }

    if (result.status === 'success') {
      return { success: true, message: result.message };
    } else {
      return { success: false, message: result.message || 'Match request failed' };
    }
  } catch (err) {
    console.error('Match request error:', err);
    return { success: false, message: err.message };
  }
});


ipcMain.handle('get-open-match-requests', async () => {
  try {
    const response = await fetch('http://localhost/api/fetch/match_requests');
    //const response = await fetch('https://vrbattles.gg/api/fetch/match_requests');
    const text = await response.text();

    if (!text || text.trim() === '') {
      return { status: 'error', message: 'Empty response from server', data: [] };
    }

    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      return { status: 'error', message: 'Invalid JSON from server', raw: text, data: [] };
    }

    return result;
  } catch (err) {
    return { status: 'error', message: err.message, data: [] };
  }
});


ipcMain.handle('accept-match-request', async (event, matchRequestId) => {
  try {
    const currentUser = store.get('userSession');
    const userId = currentUser?.id;

    if (!matchRequestId || !userId) {
      return { success: false, message: 'Missing match request ID or user session' };
    }

    const response = await fetch('http://localhost/api/matches/accept_request', {
    //const response = await fetch('https://vrbattles.gg/api/matches/accept_request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        match_request_id: matchRequestId,
        user_id: userId,
        acceptor_user_id: userId
      })
    });

    const contentType = response.headers.get('content-type');
    const text = await response.text();

    if (contentType && contentType.includes('application/json')) {
      return JSON.parse(text);
    } else {
      console.warn('Response not JSON:', text);
      return { success: false, message: 'Non-JSON response', raw: text };
    }
  } catch (err) {
    console.error('Accept match failed:', err);
    return { success: false, message: err.message };
  }
});

ipcMain.handle('get-my-matches', async (event, userId) => {
  try {
    const response = await fetch('http://localhost/api/fetch/matches', {
    //const response = await fetch('https://vrbattles.gg/api/fetch/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId })
    });

    const text = await response.text();
    let result;

    try {
      result = JSON.parse(text);
    } catch (e) {
      return { success: false, message: 'Invalid JSON from API', raw: text };
    }

    return result;
  } catch (err) {
    console.error('[get-my-matches] Error:', err);
    return { success: false, message: err.message };
  }
});

ipcMain.handle('calculate-mmr', async (event, payload) => {
  const {
    team1_player_ids,
    team2_player_ids,
    team1_ratings,
    team2_ratings,
    prevRatingTeam1,
    prevRatingTeam2,
    matchDetails
  } = payload;

  //console.log('[MMR Input Payload]', payload);

  try {
    let updatedTeam1Players = team1_player_ids.map(id => rating({
      mu: parseFloat(team1_ratings[id]?.mu) || 25,
      sigma: parseFloat(team1_ratings[id]?.sigma) || 8.333
    }));

    let updatedTeam2Players = team2_player_ids.map(id => rating({
      mu: parseFloat(team2_ratings[id]?.mu) || 25,
      sigma: parseFloat(team2_ratings[id]?.sigma) || 8.333
    }));

    let updatedPlayer1 = rating({
      mu: parseFloat(prevRatingTeam1.mu) || 25,
      sigma: parseFloat(prevRatingTeam1.sigma) || 8.333
    });

    let updatedPlayer2 = rating({
      mu: parseFloat(prevRatingTeam2.mu) || 25,
      sigma: parseFloat(prevRatingTeam2.sigma) || 8.333
    });

    const scores = matchDetails.map(r => ({
      team1: parseFloat(r.team_1_score),
      team2: parseFloat(r.team_2_score)
    }));

    //console.log('[Initial Scores]', scores);

    for (const round of scores) {
      [updatedTeam1Players, updatedTeam2Players] = rate([updatedTeam1Players, updatedTeam2Players], {
        score: [round.team1, round.team2]
      });
    }

    for (const round of scores) {
      [updatedPlayer1, updatedPlayer2] = rate([[updatedPlayer1], [updatedPlayer2]], {
        score: [round.team1, round.team2]
      });
      updatedPlayer1 = updatedPlayer1[0];
      updatedPlayer2 = updatedPlayer2[0];
    }

    const result = {
      status: 'success',
      team1_avg: {
        mu: updatedPlayer1.mu,
        sigma: updatedPlayer1.sigma,
        ordinal: ordinal({ mu: updatedPlayer1.mu, sigma: updatedPlayer1.sigma })
      },
      team2_avg: {
        mu: updatedPlayer2.mu,
        sigma: updatedPlayer2.sigma,
        ordinal: ordinal({ mu: updatedPlayer2.mu, sigma: updatedPlayer2.sigma })
      },
      team1_players: updatedTeam1Players.map((p, i) => ({
        id: team1_player_ids[i],
        mu: p.mu,
        sigma: p.sigma,
        ordinal: ordinal({ mu: p.mu, sigma: p.sigma })
      })),
      team2_players: updatedTeam2Players.map((p, i) => ({
        id: team2_player_ids[i],
        mu: p.mu,
        sigma: p.sigma,
        ordinal: ordinal({ mu: p.mu, sigma: p.sigma })
      }))
    };

    //console.log('[MMR Calculation Result]', result);
    return result;
  } catch (err) {
    //console.error('[MMR Error]', err);
    return { status: 'error', message: err.message };
  }
});




ipcMain.handle('get-app-info', () => {
  return {
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
    productName: packageJson.build?.productName || 'VR Tournament App'
  };
});


//lootlocker
ipcMain.handle('lootlocker-login', async (event, { email, password }) => {
  try {
    const response = await axios.post('https://api.lootlocker.io/white-label-login/login', {
      email,
      password,
      remember: true
    }, {
      headers: {
        'Content-type': 'application/json',
        'is-development': 'true',
        'domain-key': process.env.LOOTLOCKER_DOMAIN_KEY
      }
    });

    return { success: true, data: response.data };
  } catch (err) {
    console.error('[LootLocker Login] Error:', err?.response?.data || err.message);
    return { success: false, message: err?.response?.data?.message || 'Login failed' };
  }
});


ipcMain.handle('lootlocker-start-session', async (event, { email, token }) => {
  try {
    const response = await axios.post('https://api.lootlocker.io/game/v2/session/white-label', {
      game_key: process.env.LOOTLOCKER_GAME_KEY,
      email,
      token,
      game_version: process.env.GAME_VERSION
    }, {
      headers: {
        'Content-type': 'application/json'
      }
    });

    return { success: true, data: response.data };
  } catch (err) {
    console.error('[LootLocker Session] Error:', err?.response?.data || err.message);
    return { success: false, message: err?.response?.data?.message || 'Session failed' };
  }
});





// In this file you can include the rest of your app's specific main process code
// You can also put them in separate files and require them here.