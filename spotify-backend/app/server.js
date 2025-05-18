require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const SpotifyWebApi = require('spotify-web-api-node');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Environment variables from Umbrel
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;
const SESSION_SECRET = process.env.SESSION_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;

// Middleware
app.use(cors({
  origin: FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: SESSION_SECRET || 'spotify-widget-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Serve static files
app.use(express.static('public'));

// Create Spotify API client
const spotifyApi = new SpotifyWebApi({
  clientId: SPOTIFY_CLIENT_ID,
  clientSecret: SPOTIFY_CLIENT_SECRET,
  redirectUri: SPOTIFY_REDIRECT_URI
});

// Helper function to refresh token when expired
const refreshAccessToken = async (refreshToken) => {
  try {
    spotifyApi.setRefreshToken(refreshToken);
    const data = await spotifyApi.refreshAccessToken();
    const accessToken = data.body['access_token'];
    
    // Update the API instance
    spotifyApi.setAccessToken(accessToken);
    
    return {
      accessToken,
      expiresIn: data.body['expires_in']
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw error;
  }
};

// Middleware to check and refresh token
const withSpotifyToken = async (req, res, next) => {
  if (!req.session.refreshToken) {
    return res.status(401).json({ error: 'Not authenticated with Spotify' });
  }

  try {
    // Check if token is expired or about to expire (within 5 minutes)
    const tokenExpirationTime = req.session.tokenExpirationTime || 0;
    const isExpired = Date.now() > tokenExpirationTime - 300000; // 5 minutes buffer
    
    if (isExpired) {
      const { accessToken, expiresIn } = await refreshAccessToken(req.session.refreshToken);
      req.session.accessToken = accessToken;
      req.session.tokenExpirationTime = Date.now() + expiresIn * 1000;
      spotifyApi.setAccessToken(accessToken);
    } else {
      spotifyApi.setAccessToken(req.session.accessToken);
    }
    
    next();
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Failed to refresh token' });
  }
};

// Routes

// Home route
app.get('/', (req, res) => {
  res.send('Spotify Widget Backend is running!');
});

// Login route
app.get('/login', (req, res) => {
  const scopes = [
    'user-read-private',
    'user-read-email',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing'
  ];
  
  const state = Math.random().toString(36).substring(2, 15);
  req.session.state = state;
  
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
  res.redirect(authorizeURL);
});

// Callback route
app.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  
  // Check state to prevent CSRF attacks
  if (state !== req.session.state) {
    return res.status(400).send('State mismatch error');
  }
  
  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    
    // Save tokens in session
    req.session.accessToken = data.body['access_token'];
    req.session.refreshToken = data.body['refresh_token'];
    req.session.tokenExpirationTime = Date.now() + data.body['expires_in'] * 1000;
    
    // Set tokens on API object
    spotifyApi.setAccessToken(req.session.accessToken);
    spotifyApi.setRefreshToken(req.session.refreshToken);
    
    // Redirect to success page
    res.redirect('/spotify-success.html');
  } catch (error) {
    console.error('Error getting tokens:', error);
    res.status(400).send(`Error getting tokens: ${error.message}`);
  }
});

// Check authentication status
app.get('/auth-status', (req, res) => {
  if (req.session.accessToken && req.session.refreshToken) {
    res.json({ authenticated: true });
  } else {
    res.json({ authenticated: false });
  }
});

// Get currently playing track
app.get('/now-playing', withSpotifyToken, async (req, res) => {
  try {
    const data = await spotifyApi.getMyCurrentPlaybackState();
    
    if (data.body && data.body.is_playing) {
      const track = data.body.item;
      res.json({
        isPlaying: true,
        track: {
          name: track.name,
          artist: track.artists.map(artist => artist.name).join(', '),
          album: track.album.name,
          albumArt: track.album.images[0]?.url,
          duration: track.duration_ms,
          progress: data.body.progress_ms,
          uri: track.uri
        }
      });
    } else {
      res.json({ isPlaying: false });
    }
  } catch (error) {
    console.error('Error getting current playback:', error);
    res.status(500).json({ error: 'Failed to get current playback' });
  }
});

// Playback control endpoints
app.post('/player/play', withSpotifyToken, async (req, res) => {
  try {
    await spotifyApi.play();
    res.json({ success: true });
  } catch (error) {
    console.error('Error starting playback:', error);
    res.status(500).json({ error: 'Failed to start playback' });
  }
});

app.post('/player/pause', withSpotifyToken, async (req, res) => {
  try {
    await spotifyApi.pause();
    res.json({ success: true });
  } catch (error) {
    console.error('Error pausing playback:', error);
    res.status(500).json({ error: 'Failed to pause playback' });
  }
});

app.post('/player/next', withSpotifyToken, async (req, res) => {
  try {
    await spotifyApi.skipToNext();
    res.json({ success: true });
  } catch (error) {
    console.error('Error skipping to next track:', error);
    res.status(500).json({ error: 'Failed to skip to next track' });
  }
});

app.post('/player/previous', withSpotifyToken, async (req, res) => {
  try {
    await spotifyApi.skipToPrevious();
    res.json({ success: true });
  } catch (error) {
    console.error('Error skipping to previous track:', error);
    res.status(500).json({ error: 'Failed to skip to previous track' });
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
