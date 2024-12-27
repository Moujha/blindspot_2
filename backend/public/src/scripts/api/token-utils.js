export function isTokenExpired() {
    const expiryTime = localStorage.getItem('spotifyTokenExpiry');
    return !expiryTime || Date.now() > expiryTime;
}

export async function refreshAccessToken() {
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

export function handleTokensFromQuery() {
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