# Adding the Spotify Widget to Homepage

This guide explains how to add the Spotify Now Playing widget to your Homepage dashboard after installing the Spotify Backend app.

## Widget Code for services.yaml

Add the following YAML code to your Homepage's services.yaml file:

```yaml
- Spotify Now Playing:
    icon: spotify
    href: https://open.spotify.com
    description: Currently playing on Spotify
    widget:
      type: customapi
      url: http://umbrel.local:$APP_SPOTIFY_BACKEND_PORT/now-playing
      method: GET
      refreshInterval: 10000
      headers:
        - name: withCredentials
          value: "true"
      mappings:
        - field: isPlaying
          template: "{{isPlaying}}"
      customContent: |
        <div id="spotify-widget" class="spotify-container">
          <div id="auth-container" style="display: none;">
            <p>Connect your Spotify account to display your currently playing track.</p>
            <button onclick="loginToSpotify()" class="spotify-login-btn">Connect Spotify</button>
          </div>
          
          <div id="player-container" style="display: none;">
            <div class="album-art">
              <img id="album-cover" src="" alt="Album Cover">
            </div>
            
            <div class="track-info">
              <div class="track-name" id="track-name"></div>
              <div class="artist-name" id="artist-name"></div>
              <div class="album-name" id="album-name"></div>
              
              <div class="progress-container">
                <div class="progress-bar">
                  <div id="progress" class="progress"></div>
                </div>
                <div class="time-info">
                  <span id="current-time">0:00</span>
                  <span id="total-time">0:00</span>
                </div>
              </div>
              
              <div class="controls">
                <button onclick="previousTrack()" class="control-btn" id="prev-btn">
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" fill="currentColor"></path>
                  </svg>
                </button>
                <button onclick="togglePlayPause()" class="control-btn" id="play-pause-btn">
                  <svg width="24" height="24" viewBox="0 0 24 24" id="play-icon">
                    <path d="M8 5v14l11-7z" fill="currentColor"></path>
                  </svg>
                  <svg width="24" height="24" viewBox="0 0 24 24" id="pause-icon" style="display: none;">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="currentColor"></path>
                  </svg>
                </button>
                <button onclick="nextTrack()" class="control-btn" id="next-btn">
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" fill="currentColor"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <div id="no-playback" style="display: none;">
            <p>Nothing is currently playing on Spotify.</p>
            <button onclick="openSpotify()" class="spotify-open-btn">Open Spotify</button>
          </div>
        </div>

        <style>
        .spotify-container {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #121212 0%, #181818 100%);
          color: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
          max-width: 100%;
          overflow: hidden;
        }

        .spotify-login-btn, .spotify-open-btn {
          background-color: #1DB954;
          color: white;
          border: none;
          border-radius: 30px;
          padding: 10px 20px;
          font-weight: bold;
          cursor: pointer;
          transition: transform 0.2s, background-color 0.2s;
          margin: 10px 0;
        }

        .spotify-login-btn:hover, .spotify-open-btn:hover {
          background-color: #1ed760;
          transform: scale(1.05);
        }

        .album-art {
          width: 100%;
          margin-bottom: 15px;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }

        .album-art img {
          width: 100%;
          display: block;
        }

        .track-info {
          padding: 10px 0;
        }

        .track-name {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 5px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .artist-name {
          font-size: 14px;
          color: #b3b3b3;
          margin-bottom: 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .album-name {
          font-size: 12px;
          color: #b3b3b3;
          margin-bottom: 15px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .progress-container {
          margin-bottom: 15px;
        }

        .progress-bar {
          height: 4px;
          background-color: #535353;
          border-radius: 2px;
          margin-bottom: 5px;
          overflow: hidden;
        }

        .progress {
          height: 100%;
          background-color: #1DB954;
          border-radius: 2px;
          width: 0%;
        }

        .time-info {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #b3b3b3;
        }

        .controls {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 10px;
        }

        .control-btn {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 10px;
          margin: 0 10px;
          border-radius: 50%;
          transition: background-color 0.2s, transform 0.2s;
        }

        .control-btn:hover {
          background-color: rgba(255, 255, 255, 0.1);
          transform: scale(1.1);
        }

        #play-pause-btn {
          background-color: #1DB954;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        #play-pause-btn:hover {
          background-color: #1ed760;
        }

        #no-playback, #auth-container {
          text-align: center;
          padding: 20px;
        }
        </style>

        <script>
        // Function to check authentication status
        async function checkAuthStatus() {
          try {
            const response = await fetch('http://umbrel.local:$APP_SPOTIFY_BACKEND_PORT/auth-status', {
              credentials: 'include'
            });
            const data = await response.json();
            return data.authenticated;
          } catch (error) {
            console.error('Error checking auth status:', error);
            return false;
          }
        }

        // Function to handle login
        function loginToSpotify() {
          window.open('http://umbrel.local:$APP_SPOTIFY_BACKEND_PORT/login', 'spotify-login', 'width=600,height=800');
          window.addEventListener('message', (event) => {
            if (event.data === 'spotify-auth-success') {
              location.reload();
            }
          });
        }
        
        // Global variables
        let isPlaying = false;
        let currentTrackUri = '';
        let progressInterval;
        let currentProgress = 0;
        let trackDuration = 0;

        // Format time in MM:SS
        function formatTime(ms) {
          const seconds = Math.floor(ms / 1000);
          const minutes = Math.floor(seconds / 60);
          const remainingSeconds = seconds % 60;
          return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        }

        // Update progress bar
        function updateProgressBar() {
          if (!isPlaying) return;
          
          currentProgress += 1000; // Add 1 second
          const progressPercent = (currentProgress / trackDuration) * 100;
          
          document.getElementById('progress').style.width = `${Math.min(progressPercent, 100)}%`;
          document.getElementById('current-time').textContent = formatTime(currentProgress);
          
          // If we've reached the end of the track, refresh data
          if (currentProgress >= trackDuration) {
            fetchNowPlaying();
          }
        }

        // Toggle play/pause
        async function togglePlayPause() {
          const endpoint = isPlaying ? '/player/pause' : '/player/play';
          
          try {
            const response = await fetch(`http://umbrel.local:$APP_SPOTIFY_BACKEND_PORT${endpoint}`, {
              method: 'POST',
              credentials: 'include'
            });
            
            if (response.ok) {
              isPlaying = !isPlaying;
              updatePlayPauseButton();
              
              // Clear and restart progress interval if playing
              clearInterval(progressInterval);
              if (isPlaying) {
                progressInterval = setInterval(updateProgressBar, 1000);
              }
            }
          } catch (error) {
            console.error('Error toggling playback:', error);
          }
        }

        // Skip to next track
        async function nextTrack() {
          try {
            const response = await fetch('http://umbrel.local:$APP_SPOTIFY_BACKEND_PORT/player/next', {
              method: 'POST',
              credentials: 'include'
            });
            
            if (response.ok) {
              // Wait a moment for Spotify to update, then refresh
              setTimeout(fetchNowPlaying, 500);
            }
          } catch (error) {
            console.error('Error skipping to next track:', error);
          }
        }

        // Skip to previous track
        async function previousTrack() {
          try {
            const response = await fetch('http://umbrel.local:$APP_SPOTIFY_BACKEND_PORT/player/previous', {
              method: 'POST',
              credentials: 'include'
            });
            
            if (response.ok) {
              // Wait a moment for Spotify to update, then refresh
              setTimeout(fetchNowPlaying, 500);
            }
          } catch (error) {
            console.error('Error skipping to previous track:', error);
          }
        }

        // Update play/pause button appearance
        function updatePlayPauseButton() {
          const playIcon = document.getElementById('play-icon');
          const pauseIcon = document.getElementById('pause-icon');
          
          if (isPlaying) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
          } else {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
          }
        }

        // Open Spotify
        function openSpotify() {
          window.open('https://open.spotify.com', '_blank');
        }

        // Fetch currently playing track
        async function fetchNowPlaying() {
          try {
            // First check if authenticated
            const authenticated = await checkAuthStatus();
            
            if (!authenticated) {
              document.getElementById('auth-container').style.display = 'block';
              document.getElementById('player-container').style.display = 'none';
              document.getElementById('no-playback').style.display = 'none';
              return;
            }
            
            // If authenticated, fetch now playing
            const response = await fetch('http://umbrel.local:$APP_SPOTIFY_BACKEND_PORT/now-playing', {
              credentials: 'include'
            });
            
            const data = await response.json();
            
            // Hide auth container since we're authenticated
            document.getElementById('auth-container').style.display = 'none';
            
            if (data.isPlaying && data.track) {
              // Show player and hide no playback message
              document.getElementById('player-container').style.display = 'block';
              document.getElementById('no-playback').style.display = 'none';
              
              // Update track info
              document.getElementById('track-name').textContent = data.track.name;
              document.getElementById('artist-name').textContent = data.track.artist;
              document.getElementById('album-name').textContent = data.track.album;
              document.getElementById('album-cover').src = data.track.albumArt;
              document.getElementById('total-time').textContent = formatTime(data.track.duration);
              
              // Update progress
              trackDuration = data.track.duration;
              currentProgress = data.track.progress;
              const progressPercent = (currentProgress / trackDuration) * 100;
              document.getElementById('progress').style.width = `${progressPercent}%`;
              document.getElementById('current-time').textContent = formatTime(currentProgress);
              
              // Update play state
              isPlaying = data.isPlaying;
              updatePlayPauseButton();
              
              // If track changed, reset interval
              if (currentTrackUri !== data.track.uri) {
                currentTrackUri = data.track.uri;
                clearInterval(progressInterval);
                if (isPlaying) {
                  progressInterval = setInterval(updateProgressBar, 1000);
                }
              }
            } else {
              // No active playback
              document.getElementById('player-container').style.display = 'none';
              document.getElementById('no-playback').style.display = 'block';
              
              // Clear interval and reset state
              clearInterval(progressInterval);
              isPlaying = false;
              currentTrackUri = '';
            }
          } catch (error) {
            console.error('Error fetching now playing:', error);
            // Show auth container in case of error
            document.getElementById('auth-container').style.display = 'block';
            document.getElementById('player-container').style.display = 'none';
            document.getElementById('no-playback').style.display = 'none';
          }
        }

        // Initialize
        (async function() {
          await fetchNowPlaying();
          // Set up periodic refresh
          setInterval(fetchNowPlaying, 10000); // Refresh every 10 seconds
        })();
        </script>
```

## Important Notes

1. The widget code above uses `$APP_SPOTIFY_BACKEND_PORT` which will be automatically replaced with the actual port number assigned to your Spotify Backend app by Umbrel.

2. If you're using an IP address instead of `umbrel.local`, replace all instances of `umbrel.local` with your Umbrel's IP address.

3. Make sure to add this widget code to your Homepage's services.yaml file after installing the Spotify Backend app.

## Authentication

When you first add the widget, you'll need to:

1. Click the "Connect Spotify" button in the widget
2. Log in to your Spotify account and authorize the app
3. After successful authentication, the widget will display your currently playing track

## Customization

You can customize the widget appearance by modifying the CSS in the widget code. Look for the `<style>` section to change colors, sizes, and other visual elements.
