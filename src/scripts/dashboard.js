function isTokenExpired() {
    const expiryTime = localStorage.getItem('spotifyTokenExpiry');
    return !expiryTime || Date.now() > expiryTime;
}
  
async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('spotifyRefreshToken');
  
    if (!refreshToken) {
      alert('Refresh token is missing. Please log in again.');
      window.location.href = '/';
      return;
    }
  
    try {
      const response = await fetch('/spotify/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
  
      if (!response.ok) throw new Error('Failed to refresh access token');
  
      const data = await response.json();
  
      if (data.access_token) {
        localStorage.setItem('spotifyAccessToken', data.access_token);
        localStorage.setItem('spotifyTokenExpiry', Date.now() + data.expires_in * 1000);
        console.log('Access token refreshed successfully.');
      } else {
        throw new Error('Access token refresh returned invalid response.');
      }
    } catch (error) {
      console.error('Error refreshing access token:', error);
      alert('Unable to refresh access token. Please log in again.');
      window.location.href = '/';
    }
}
  
function showLoading() {
    const container = document.getElementById('artists-container');
    container.innerHTML = '<p>Loading recently played tracks...</p>';
}
  
async function fetchRecentlyPlayed() {
    showLoading();
  
    try {
      if (isTokenExpired()) {
        console.log('Token expired. Refreshing...');
        await refreshAccessToken();
      }
  
      const token = localStorage.getItem('spotifyAccessToken');
      if (!token) {
        alert('Access token is missing. Redirecting to login...');
        window.location.href = '/';
        return;
      }
  
      const response = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=10', {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (!response.ok) throw new Error('Failed to fetch recently played tracks');
  
      const data = await response.json();
      console.log(data)
      await displayArtists(data.items);
    } catch (error) {
      console.error('Error while fetching recently played tracks:', error.message);
      alert('Unable to fetch recently played tracks. Please try again later.');
    }
    }
  
async function fetchArtistImage(artist_id) {
    try {
      const token = localStorage.getItem('spotifyAccessToken');
      if (!token) {
        alert('Access token is missing. Redirecting to login...');
        window.location.href = '/';
        return 'default-artist-image.jpg';
      }
  
      const response = await fetch(`https://api.spotify.com/v1/artists/${artist_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (!response.ok) throw new Error('Failed to fetch artist details');
  
      const data = await response.json();
      return data.images?.[0]?.url || 'default-artist-image.jpg'; // Return the first available artist image or default
    } catch (error) {
      console.error('Error while fetching artist profile picture:', error.message);
      return 'default-artist-image.jpg'; // Return default image on error
    }
  }
  

async function displayArtists(tracks) {
    const container = document.getElementById('artists-container');
    container.innerHTML = ''; // Clear previous content
  
    if (tracks.length === 0) {
      container.innerHTML = '<p>No recently played tracks found.</p>';
      return;
    }
  
    for (const item of tracks) {
        const artist = item.track.artists[0]; // Get the first artist
        const trackName = item.track.name;
    
        // Fetch artist image asynchronously
        const artistImage = await fetchArtistImage(artist.id);
    
        // Create a card for the artist
        const card = document.createElement('div');
        card.classList.add('artist-card');
    
        card.innerHTML = `
          <img src="${artistImage}" alt="${artist.name}" />
          <div class="artist-info">
            <h2>${artist.name}</h2>
            <p>${trackName}</p>
          </div>
        `;
    
        container.appendChild(card);
      }
    }

function handleTokensFromQuery() {
    console.log('Handling tokens from query...');

    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    const expiresIn = urlParams.get('expires_in');

    if (accessToken) {
        // Store tokens in localStorage for later use
        localStorage.setItem('spotifyAccessToken', accessToken);
        localStorage.setItem('spotifyRefreshToken', refreshToken);
        localStorage.setItem('spotifyTokenExpiry', Date.now() + expiresIn * 1000);

        console.log('Access Token:', accessToken);
    }

    // Clean up the URL
    window.history.replaceState({}, document.title, '/dashboard');
    }

  handleTokensFromQuery();
  fetchRecentlyPlayed();
  