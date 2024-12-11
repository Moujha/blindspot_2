const axios = require('axios');
const querystring = require('querystring');

// Redirect the user to Spotify's authorization page
exports.redirectToSpotify = (req, res) => {
    const scopes = [
        'user-read-recently-played',
        'user-top-read',
        'user-library-read',
        'user-read-private',
    ].join(' ');

    const authUrl = `https://accounts.spotify.com/authorize?` +
        `client_id=${process.env.CLIENT_ID}&` +
        `response_type=code&` +
        `redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}&` +
        `scope=${encodeURIComponent(scopes)}`;

    res.redirect(authUrl);
};

// Handle Spotify callback and exchange authorization code for access token
exports.handleSpotifyCallback = async (req, res) => {
    const code = req.query.code;

    if (!code) {
        return res.status(400).json({ error: 'Authorization code not found' });
    }

    try {
        const tokenResponse = await axios.post(
            'https://accounts.spotify.com/api/token',
            querystring.stringify({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: process.env.REDIRECT_URI,
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        const { access_token, refresh_token, expires_in } = tokenResponse.data;

        console.log('Tokens generated:', { access_token, refresh_token, expires_in }); //log to debug

        // Store tokens in the session or redirect with a success message
        res.redirect(`/dashboard?access_token=${access_token}&refresh_token=${refresh_token}&expires_in=${expires_in}`);
        } catch (error) {
        console.error('Error exchanging authorization code for token:', error.response.data);
        res.status(500).json({ error: 'Failed to exchange authorization code for token' });
    }
};

// Refresh the access token
exports.refreshAccessToken = async (req, res) => {
    const { refresh_token } = req.body;

    if (!refresh_token) {
        return res.status(400).json({ error: 'Refresh token is required' });
    }

    try {
        const tokenResponse = await axios.post(
            'https://accounts.spotify.com/api/token',
            querystring.stringify({
                grant_type: 'refresh_token',
                refresh_token: refresh_token,
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        const { access_token, expires_in } = tokenResponse.data;

        res.json({ access_token, expires_in });
    } catch (error) {
        console.error('Error refreshing access token:', error.response.data);
        res.status(500).json({ error: 'Failed to refresh token' });
    }
};
