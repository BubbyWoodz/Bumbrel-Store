const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Configuration
let config = {
  clientId: process.env.CLIENT_ID || '2cb48d760172450e93b9123949084f90',
  clientSecret: process.env.CLIENT_SECRET || 'e1f41a0c4ef64e1f939c79f53e461069',
  refreshToken: process.env.REFRESH_TOKEN || 'AQAp0INkFfIS_Ruvr_YpyL8FsGOe0e7nA0IjWG1RmR3dH7tEKihw-DsAuQZR_cxSZWjs0BvFuN_8RyfCgrqWE4RVb5GhpeOPTGr4LQzjz39NPeYMOB_PUrNqqcSllOAJPEU'
};

// Data directory for persistence
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

// Create data directory if it doesn't exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load config from file if it exists
if (fs.existsSync(CONFIG_FILE)) {
  try {
    const savedConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    config = { ...config, ...savedConfig };
  } catch (error) {
    console.error('Error loading config:', error);
  }
}

// Store the access token
let accessToken = '';
let tokenExpiry = 0;
let lastPlayingInfo = null;
let lastApiCallTime = 0;
let apiCallStatus = { success: true, message: 'Ready' };

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Save config to file
function saveConfig() {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Error saving config:', error);
  }
}

// Middleware to ensure we have a valid access token
async function ensureAccessToken() {
  const now = Date.now();
  
  // If token is expired or doesn't exist, refresh it
  if (now >= tokenExpiry || !accessToken) {
    try {
      const response = await axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        params: {
          grant_type: 'refresh_token',
          refresh_token: config.refreshToken
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(config.clientId + ':' + config.clientSecret).toString('base64')
        }
      });
      
      accessToken = response.data.access_token;
      // Set expiry to 50 minutes (3000 seconds) to be safe (actual expiry is 1 hour)
      tokenExpiry = now + (response.data.expires_in - 600) * 1000;
      console.log('Token refreshed, expires in', response.data.expires_in, 'seconds');
      apiCallStatus = { success: true, message: 'Token refreshed successfully' };
    } catch (error) {
      console.error('Error refreshing token:', error.response ? error.response.data : error.message);
      apiCallStatus = { 
        success: false, 
        message: 'Failed to refresh token: ' + (error.response ? JSON.stringify(error.response.data) : error.message)
      };
      throw new Error('Failed to refresh access token');
    }
  }
  return accessToken;
}

// Web interface routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API routes
app.get('/api/config', (req, res) => {
  // Send config without sensitive data
  const safeConfig = {
    clientId: config.clientId,
    clientSecret: '********', // Hide actual secret
    refreshToken: config.refreshToken.substring(0, 10) + '...',
    status: apiCallStatus,
    lastApiCall: lastApiCallTime ? new Date(lastApiCallTime).toISOString() : null,
    lastPlaying: lastPlayingInfo
  };
  res.json(safeConfig);
});

app.post('/api/config', (req, res) => {
  const { clientId, clientSecret, refreshToken } = req.body;
  
  if (clientId) config.clientId = clientId;
  if (clientSecret) config.clientSecret = clientSecret;
  if (refreshToken) config.refreshToken = refreshToken;
  
  // Reset token state to force refresh
  accessToken = '';
  tokenExpiry = 0;
  
  saveConfig();
  res.json({ success: true, message: 'Configuration updated' });
});

// Get currently playing track
app.get('/currently-playing', async (req, res) => {
  try {
    lastApiCallTime = Date.now();
    const token = await ensureAccessToken();
    const response = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    lastPlayingInfo = response.data;
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching currently playing:', error.response ? error.response.data : error.message);
    apiCallStatus = { 
      success: false, 
      message: 'Error fetching currently playing: ' + (error.response ? JSON.stringify(error.response.data) : error.message)
    };
    res.status(error.response ? error.response.status : 500).json({
      error: error.response ? error.response.data : error.message
    });
  }
});

// Get playback state
app.get('/playback-state', async (req, res) => {
  try {
    lastApiCallTime = Date.now();
    const token = await ensureAccessToken();
    const response = await axios.get('https://api.spotify.com/v1/me/player', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching playback state:', error.response ? error.response.data : error.message);
    apiCallStatus = { 
      success: false, 
      message: 'Error fetching playback state: ' + (error.response ? JSON.stringify(error.response.data) : error.message)
    };
    res.status(error.response ? error.response.status : 500).json({
      error: error.response ? error.response.data : error.message
    });
  }
});

// Play
app.post('/play', async (req, res) => {
  try {
    lastApiCallTime = Date.now();
    const token = await ensureAccessToken();
    await axios.put('https://api.spotify.com/v1/me/player/play', {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    apiCallStatus = { success: true, message: 'Play command sent successfully' };
    res.json({ success: true });
  } catch (error) {
    console.error('Error playing track:', error.response ? error.response.data : error.message);
    apiCallStatus = { 
      success: false, 
      message: 'Error playing track: ' + (error.response ? JSON.stringify(error.response.data) : error.message)
    };
    res.status(error.response ? error.response.status : 500).json({
      error: error.response ? error.response.data : error.message
    });
  }
});

// Pause
app.post('/pause', async (req, res) => {
  try {
    lastApiCallTime = Date.now();
    const token = await ensureAccessToken();
    await axios.put('https://api.spotify.com/v1/me/player/pause', {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    apiCallStatus = { success: true, message: 'Pause command sent successfully' };
    res.json({ success: true });
  } catch (error) {
    console.error('Error pausing track:', error.response ? error.response.data : error.message);
    apiCallStatus = { 
      success: false, 
      message: 'Error pausing track: ' + (error.response ? JSON.stringify(error.response.data) : error.message)
    };
    res.status(error.response ? error.response.status : 500).json({
      error: error.response ? error.response.data : error.message
    });
  }
});

// Next track
app.post('/next', async (req, res) => {
  try {
    lastApiCallTime = Date.now();
    const token = await ensureAccessToken();
    await axios.post('https://api.spotify.com/v1/me/player/next', {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    apiCallStatus = { success: true, message: 'Next track command sent successfully' };
    res.json({ success: true });
  } catch (error) {
    console.error('Error skipping to next track:', error.response ? error.response.data : error.message);
    apiCallStatus = { 
      success: false, 
      message: 'Error skipping to next track: ' + (error.response ? JSON.stringify(error.response.data) : error.message)
    };
    res.status(error.response ? error.response.status : 500).json({
      error: error.response ? error.response.data : error.message
    });
  }
});

// Previous track
app.post('/previous', async (req, res) => {
  try {
    lastApiCallTime = Date.now();
    const token = await ensureAccessToken();
    await axios.post('https://api.spotify.com/v1/me/player/previous', {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    apiCallStatus = { success: true, message: 'Previous track command sent successfully' };
    res.json({ success: true });
  } catch (error) {
    console.error('Error skipping to previous track:', error.response ? error.response.data : error.message);
    apiCallStatus = { 
      success: false, 
      message: 'Error skipping to previous track: ' + (error.response ? JSON.stringify(error.response.data) : error.message)
    };
    res.status(error.response ? error.response.status : 500).json({
      error: error.response ? error.response.data : error.message
    });
  }
});

// Test connection
app.get('/api/test-connection', async (req, res) => {
  try {
    lastApiCallTime = Date.now();
    const token = await ensureAccessToken();
    const response = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    apiCallStatus = { success: true, message: 'Connection test successful' };
    res.json({ 
      success: true, 
      message: 'Connection successful', 
      user: response.data.display_name,
      email: response.data.email
    });
  } catch (error) {
    console.error('Connection test failed:', error.response ? error.response.data : error.message);
    apiCallStatus = { 
      success: false, 
      message: 'Connection test failed: ' + (error.response ? JSON.stringify(error.response.data) : error.message)
    };
    res.status(error.response ? error.response.status : 500).json({
      success: false,
      error: error.response ? error.response.data : error.message
    });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Spotify proxy server listening at http://0.0.0.0:${port}`);
});
