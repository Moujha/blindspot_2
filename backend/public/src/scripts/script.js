// Determine the base URL dynamically
const isLocalhost = window.location.hostname === 'localhost';
const baseUrl = isLocalhost
    ? 'http://localhost:3000' // Local backend URL
    : 'https://your-app.onrender.com'; // Render backend URL

// Spotify Client ID (Safe to expose)
const clientId = 'c2fd787be177437799de06b6062ddc9a'; 

// Redirect URI dynamically set
const redirectUri = isLocalhost
    ? 'http://localhost:3000/spotify/callback' // Local callback
    : 'https://your-app.onrender.com/spotify/callback'; // Render callback



const scopes = [
    'user-read-private',
    'user-read-email', // Add more scopes based on your API needs
];

function spotifyLogin() {
    const authUrl = `${baseUrl}/spotify/auth`;
    window.location.href = authUrl; // Redirect user to Spotify's authorization page
}

function attachLoginEvent() {
    document.getElementById('spotify-login').addEventListener('click', spotifyLogin);
}

// Handling the code in the redirectUri page
function handleAuthorizationCode() {
    const urlParams = new URLSearchParams(window.location.search);
    const authorizationCode = urlParams.get('code');

    if (authorizationCode) {
        console.log('Authorization Code:', authorizationCode);

        // Exchange the authorization code for an access token
        exchangeAuthorizationCodeForToken(authorizationCode);

        // Clean up the URL
        window.history.replaceState({}, document.title, '/');
    }
}

function exchangeAuthorizationCodeForToken(code) {
    fetch(`${baseUrl}/spotify/callback`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.access_token) {
            console.log('Access Token:', data.access_token);
            // Store the token for later use
            localStorage.setItem('spotifyAccessToken', data.access_token);
        } else {
            console.error('Error exchanging authorization code for token:', data);
        }
    })
    .catch(error => {
        console.error('Error fetching token:', error);
    });
}





// Attach the login event listener
attachLoginEvent();
// Handle the authorization code on page load
handleAuthorizationCode();
