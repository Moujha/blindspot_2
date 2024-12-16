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
  
      const response = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=50', {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (!response.ok) throw new Error('Failed to fetch recently played tracks');
  
      const data = await response.json();
      return data.items
    } catch (error) {
      console.error('Error while fetching recently played tracks:', error.message);
      alert('Unable to fetch recently played tracks. Please try again later.');
    }
}

function groupTracksByArtist(tracks) {
    const groupedTracks = {};
  
    tracks.forEach((item) => {
      const artistId = item.track.artists[0].id; // Get the artist ID
      const trackName = item.track.name; // Get the track name
  
      // If the artist ID is not in the grouped object, initialize it
      if (!groupedTracks[artistId]) {
        groupedTracks[artistId] = [];
      }
  
    // If the track is already in the artist's object, increment its count
    if (groupedTracks[artistId][trackName]) {
        groupedTracks[artistId][trackName].count += 1;
      } else {
        // Otherwise, add the track with an initial count of 1
        groupedTracks[artistId][trackName] = {
          name: trackName,
          count: 1,
        };
      }
    });
    return groupedTracks;

  }
  
async function fetchArtistDetails(artistIds) {
    const artistDetails = {};

    for (const artistId of artistIds) {
        try {
        const token = localStorage.getItem('spotifyAccessToken');
        if (!token) {
            alert('Access token is missing. Redirecting to login...');
            window.location.href = '/';
            return;
        }

        const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to fetch artist details');

        const data = await response.json();

        // Store the artist details in the object
        artistDetails[artistId] = {
            name: data.name,
            image: data.images?.[0]?.url || 'default-artist-image.jpg',
        };
        } catch (error) {
        console.error(`Error fetching details for artist ${artistId}:`, error.message);
        artistDetails[artistId] = {
            name: 'Unknown Artist',
            image: 'default-artist-image.jpg',
        };
        }
    }
    return artistDetails;
    }
  
  
  async function displayArtists(groupedTracks, artistDetails) {
    const container = document.getElementById('artists-container');
    container.innerHTML = ''; // Clear previous content
  
    // Step 1: Convert groupedTracks into an array of [artistId, tracks]
    const sortedArtists = Object.entries(groupedTracks).map(([artistId, tracks]) => {
      // Calculate total track count for each artist
      const totalTrackCount = Object.values(tracks).reduce((sum, track) => sum + track.count, 0);
  
      return { artistId, tracks, totalTrackCount };
    });
  
    // Step 2: Sort the array based on totalTrackCount in descending order
    sortedArtists.sort((a, b) => b.totalTrackCount - a.totalTrackCount);
  
    // Step 3: Render the sorted artist cards
    sortedArtists.forEach(({ artistId, tracks, totalTrackCount }) => {
      const { name, image } = artistDetails[artistId];
  
      // Create the artist card element
      const card = document.createElement('div');
      card.classList.add('artist-card');
  
      // Create the track list element (hidden initially)
      const trackList = document.createElement('ul');
      trackList.classList.add('track-list');
      trackList.style.display = 'none'; // Hide initially
  
      // Populate the track list
      Object.entries(tracks).forEach(([trackName, trackData]) => {
        const trackItem = document.createElement('li');
        trackItem.textContent = `${trackData.name} (x${trackData.count})`;
        trackList.appendChild(trackItem);
      });
  
      // Create the toggle button
      const toggleButton = document.createElement('button');
      toggleButton.textContent = '+';
      toggleButton.classList.add('toggle-button');
  
      // Add click event to toggle the track list
      toggleButton.addEventListener('click', () => {
        if (trackList.style.display === 'none') {
          trackList.style.display = 'block'; // Show tracks
          toggleButton.textContent = '-';
        } else {
          trackList.style.display = 'none'; // Hide tracks
          toggleButton.textContent = '+';
        }
      });
  
      // Build the card content
      card.innerHTML = `
        <img src="${image}" alt="${name}" />
        <div class="artist-info">
          <h2>${name}</h2>
          <p>Total Tracks Played: ${totalTrackCount}</p>
        </div>
      `;
  
      // Append elements to the card
      card.appendChild(toggleButton);
      card.appendChild(trackList);
  
      // Append the card to the container
      container.appendChild(card);
    });
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

async function main() {
    try {
        // Step 1: Handle tokens from the query string
        handleTokensFromQuery();
    
        // Step 2: Fetch recently played tracks
        const recentlyPlayedTracks = await fetchRecentlyPlayed();
        if (!recentlyPlayedTracks || recentlyPlayedTracks.length === 0) {
            console.error('No recently played tracks available.');
            document.getElementById('artists-container').innerHTML = '<p>No recently played tracks found.</p>';
            return;
            }

        console.log('Recently Played Tracks:', recentlyPlayedTracks);

        // Step 3: Group tracks by artist
        const groupedTracks = groupTracksByArtist(recentlyPlayedTracks);
        console.log('Grouped Tracks:', groupedTracks);
    
        // Step 4: Fetch artist details
        const artistIds = Object.keys(groupedTracks);
        const artistDetails = await fetchArtistDetails(artistIds);
    
        // Step 5: Display artists and their tracks
        displayArtists(groupedTracks, artistDetails);
    } catch (error) {
        console.error('An error occurred in the main function:', error.message);
    }
    }
      

main();