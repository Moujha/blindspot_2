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

  // Extract query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const accessToken = urlParams.get('access_token');
  const refreshToken = urlParams.get('refresh_token');
  const expiresIn = urlParams.get('expires_in');
  const userId = urlParams.get('userId'); // Extract userId

  // Check if tokens are in query string or localStorage
  const storedAccessToken = localStorage.getItem('spotifyAccessToken');
  const storedRefreshToken = localStorage.getItem('spotifyRefreshToken');
  const storedUserId = localStorage.getItem('spotifyUserId');

  // Use query parameters if available, otherwise fallback to stored tokens
  const finalAccessToken = accessToken || storedAccessToken;
  const finalRefreshToken = refreshToken || storedRefreshToken;
  const finalUserId = userId || storedUserId;

  if (!finalAccessToken || !finalRefreshToken || !finalUserId) {
    console.error('Missing tokens or user ID. Redirecting to login.');
    window.location.href = '/';
    return;
  }

  // Store tokens in localStorage
  if (accessToken) {
    localStorage.setItem('spotifyAccessToken', finalAccessToken);
    localStorage.setItem('spotifyRefreshToken', finalRefreshToken);
    localStorage.setItem('spotifyTokenExpiry', Date.now() + expiresIn * 1000);
    console.log('Access Token stored:', finalAccessToken);
  }

  // Store user ID in localStorage
  if (userId) {
    localStorage.setItem('spotifyUserId', finalUserId);
    console.log('User ID stored:', finalUserId);
  }

  // Clean up the URL
  window.history.replaceState({}, document.title, '/dashboard');
}