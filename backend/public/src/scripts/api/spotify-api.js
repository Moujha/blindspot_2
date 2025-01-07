import { isTokenExpired, refreshAccessToken } from './token-utils.js';

function showLoading() {
    const container = document.getElementById('artists-container');
    container.innerHTML = '<p>Loading recently played tracks...</p>';
}

export async function fetchRecentlyPlayed(lastPlayedAt = null) {
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

export async function fetchArtistDetails(artistIds) {
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
                          genres: artist.genres || [],
                          popularity: artist.popularity || null,
                          monthly_listeners: artist.followers?.total || null,
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
  

export async function fetchSingleArtistDetails(artistIds, accessToken) {
    if (!accessToken) {
      throw new Error('Access token is required to fetch artist details.');
    }
  
    // Ensure artistIds is an array
    artistIds = Array.isArray(artistIds) ? artistIds : [artistIds];
  
    const artistDetails = {};
  
    try {
      const batches = [];
      while (artistIds.length) {
        batches.push(artistIds.splice(0, 50)); // Split into batches of 50
      }
  
      for (const batch of batches) {
        let retry = true;
        while (retry) {
          try {
            const response = await axios.get(
              `https://api.spotify.com/v1/artists?ids=${batch.join(',')}`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );
  
            retry = false; // Exit retry loop on success
  
            response.data.artists.forEach((artist) => {
              artistDetails[artist.id] = {
                name: artist.name,
                image: artist.images?.[0]?.url || 'default-artist-image.jpg',
                genres: artist.genres || [],
                popularity: artist.popularity || null,
                monthly_listeners: artist.followers?.total || null,
              };
            });
          } catch (error) {
            if (error.response?.status === 429) {
              const retryAfter = error.response.headers['retry-after'] || 1;
              const waitTime = parseInt(retryAfter) * 1000;
              console.warn(`Rate limited. Retrying in ${waitTime / 1000} seconds...`);
              await new Promise((resolve) => setTimeout(resolve, waitTime));
            } else {
              retry = false;
              console.error('Error fetching artist details:', error.message);
              throw error;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in fetchArtistDetails:', error.message);
      throw error;
    }
  
    return artistDetails;
  }
  