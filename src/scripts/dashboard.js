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
  
async function fetchRecentlyPlayed(lastPlayedAt = null) {
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

      // Construct the API URL
      let url = 'https://api.spotify.com/v1/me/player/recently-played?limit=50';
      if (lastPlayedAt) {
          const afterTimestamp = new Date(lastPlayedAt).getTime();
          url += `&after=${afterTimestamp}`;
      }
  
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.status === 401) {
        console.log('Access token expired. Attempting refresh...');
        await refreshAccessToken(); // Refresh token
        return fetchRecentlyPlayed(lastPlayedAt); // Retry the request
    }

      if (!response.ok) throw new Error('Failed to fetch recently played tracks');
  
      const data = await response.json();
      return data.items
    } catch (error) {
      console.error('Error while fetching recently played tracks:', error.message);
      alert('Unable to fetch recently played tracks. Please try again later.');
    }
}

async function sendTracksToBackend(tracks) {
  const userId = localStorage.getItem('spotifyUserId'); // Assume user ID is stored in localStorage

    if (!userId) {
        console.error('User ID is missing. Please log in again.');
        alert('User ID is missing. Please log in again.');
        return;
    }

    try {
        // Prepare the payload
        const payload = {
            userId: userId,
            tracks: tracks.map((track) => ({
                isrc: track.isrc,
                track_name: track.track_name,
                artist_id: track.artist_id,
                artist_name: track.artist_name,
                played_at: track.played_at,
            })),
        };

        // Send the tracks to the backend
        const response = await fetch('/spotify/save-tracks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error('Failed to save tracks to the backend');
        }

        console.log('Tracks sent successfully to backend.');
        alert('Tracks saved successfully!');
    } catch (error) {
        console.error('Error sending tracks to backend:', error.message);
        alert('Failed to save tracks. Please try again.');
    }
}

async function fetchUserTracksFromDB() {
  const userId = localStorage.getItem('spotifyUserId');

  if (!userId) {
      console.error('User ID is missing. Redirecting to login...');
      window.location.href = '/';
      return;
  }

  try {
      const response = await fetch(`/spotify/get-tracks/${userId}`);

      if (!response.ok) throw new Error('Failed to fetch user tracks from database');

      const data = await response.json(); // Parse the full response
      const tracks = data.tracks || []; // Return only the tracks array
      console.log('Tracks fetched from database:', tracks);
      return tracks;
  } catch (error) {
      console.error('Error fetching user tracks:', error.message);
      alert('Unable to load tracks. Please try again later.');
      return [];
  }
}

function groupTracksByArtist(tracks) {
    const groupedTracks = {};
  
    tracks.forEach((track) => {
      const artistId = track.artist_id; // Get the artist ID
      const trackName = track.track_name; // Get the track name
      const trackIsrc = track.isrc;

      // If the artist ID is not in the grouped object, initialize it
      if (!groupedTracks[artistId]) {
        groupedTracks[artistId] = {};
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
  const token = localStorage.getItem('spotifyAccessToken');

  if (!token) {
      alert('Access token is missing. Redirecting to login...');
      window.location.href = '/';
      return {};
  }

  const batches = [];
  while (artistIds.length) {
      batches.push(artistIds.splice(0, 50)); // Split artist IDs into chunks of 50
  }

  for (const batch of batches) {
      let retry = true;
      while (retry) {
          try {
              const response = await fetch(
                  `https://api.spotify.com/v1/artists?ids=${batch.join(',')}`,
                  { headers: { Authorization: `Bearer ${token}` } }
              );

              if (response.status === 429) {
                  const retryAfter = response.headers.get('Retry-After');
                  const waitTime = (retryAfter ? parseInt(retryAfter) : 1) * 1000;
                  console.warn(`Rate limited. Retrying in ${waitTime / 1000} seconds...`);
                  await new Promise((resolve) => setTimeout(resolve, waitTime));
              } else {
                  retry = false; // Exit loop on success or non-429 status
                  const data = await response.json();
                  data.artists.forEach((artist) => {
                      artistDetails[artist.id] = {
                          name: artist.name,
                          image: artist.images?.[0]?.url || 'default-artist-image.jpg',
                      };
                  });
              }
          } catch (error) {
              console.error('Error fetching batch artist details:', error.message);
              retry = false;
          }
      }
  }

  return artistDetails;
}
  
  
async function displayArtists(groupedTracks, artistDetails) {
  const container = document.getElementById("artists-container");
  container.innerHTML = ""; // Clear previous content

  // Step 1: Convert groupedTracks into an array of [artistId, tracks]
  const sortedArtists = Object.entries(groupedTracks).map(
    ([artistId, tracks]) => {
      // Calculate total track count for each artist
      const totalTrackCount = Object.values(tracks).reduce(
        (sum, track) => sum + track.count,
        0
      );

      return { artistId, tracks, totalTrackCount };
    }
  );

  // Step 2: Sort the array based on totalTrackCount in descending order
  sortedArtists.sort((a, b) => b.totalTrackCount - a.totalTrackCount);

  // Step 3: Render the sorted artist cards
  sortedArtists.forEach(({ artistId, tracks, totalTrackCount }) => {
    const { name, image } = artistDetails[artistId];

    // Create the artist card element
    const card = document.createElement("div");
    card.classList.add("artist-card");

    // Add the onclick event to expand the card
    card.setAttribute("onclick", "expandCard(this)");

    // Build the card content
    card.innerHTML = `
      <img src="${image}" alt="${name}" class="artist-image" />
      <div class="artist-overlay">
        <h3 class="artist-name">${name}</h3>
      </div>
      <div class="level-bar-container">
        <span class="level-text current-level">1</span>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${Math.min(
            (totalTrackCount / 100) * 100,
            100
          )}%;"></div>
        </div>
        <span class="level-text next-level">2</span>
      </div>
      <ul class="track-list" style="display: none;">
        ${Object.entries(tracks)
          .map(
            ([trackName, trackData]) =>
              `<li>${trackData.name} (x${trackData.count})</li>`
          )
          .join("")}
      </ul>
    `;

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
    const userId = urlParams.get('userId'); // Extract userId


    if (accessToken) {
        // Store tokens in localStorage for later use
        localStorage.setItem('spotifyAccessToken', accessToken);
        localStorage.setItem('spotifyRefreshToken', refreshToken);
        localStorage.setItem('spotifyTokenExpiry', Date.now() + expiresIn * 1000);

        console.log('Access Token:', accessToken);
    }

    if (userId) {
      // Store user ID in localStorage
      localStorage.setItem('spotifyUserId', userId);
      console.log('User ID:', userId);
    }

    // Clean up the URL
    window.history.replaceState({}, document.title, '/dashboard');
    }


async function main() {
    try {
        // Step: Handle tokens from the query string
        handleTokensFromQuery();

        // Step 2: Fetch last played_at timestamp from the backend
        const userTracksResponse = await fetch(`/spotify/get-tracks/${localStorage.getItem('spotifyUserId')}`);
        const { tracks: existingTracks, lastPlayedAt } = await userTracksResponse.json();

        console.log('Tracks from database:', existingTracks);
        console.log('Last Played At:', lastPlayedAt);

        // Step: Fetch recently played tracks
        const recentlyPlayedTracks = await fetchRecentlyPlayed(lastPlayedAt);
        if (!recentlyPlayedTracks && recentlyPlayedTracks.length === 0) {
            console.error('No recently played tracks available.');
            document.getElementById('artists-container').innerHTML = '<p>No recently played tracks found.</p>';
            return;
            }

        console.log('Recently Played Tracks:', recentlyPlayedTracks);

        // Step: Send tracks to the backend
        const formattedTracks = recentlyPlayedTracks.map((item) => ({
          isrc: item.track.external_ids.isrc,
          track_name: item.track.name,
          artist_id: item.track.artists[0].id,
          artist_name: item.track.artists[0].name,
          played_at: item.played_at,
        }));

        await sendTracksToBackend(formattedTracks);
        
        // Step: Get tracks from the backend
        const userTracks = await fetchUserTracksFromDB();
        if (!userTracks || userTracks.length === 0) {
          console.error('No tracks found in database.');
          document.getElementById('artists-container').innerHTML = '<p>No tracks found.</p>';
          return;
      }
      console.log('User Tracks:', userTracks);

      // Step: Group tracks by artist
      const groupedTracks = groupTracksByArtist(userTracks);
      console.log('Grouped Tracks:', groupedTracks);
  
      // Step: Fetch artist details
      const artistIds = Object.keys(groupedTracks);
      const artistDetails = await fetchArtistDetails(artistIds);
  
      // Step: Display artists and their tracks
      displayArtists(groupedTracks, artistDetails);
    } catch (error) {
        console.error('An error occurred in the main function:', error.message);
    }
    }
      

main();

document.getElementById('refresh-button').addEventListener('click', async () => {
  console.log('Refreshing tracks...');
  await main(); // Rerun the main function
  alert('Tracks refreshed successfully!');
});  
