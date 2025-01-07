import axios from 'axios';
import querystring from 'querystring';
import { storeOrUpdateUser } from '../services/userService.js'; // Import the modular DB function


// Redirect the user to Spotify's authorization page
export const redirectToSpotify = (req, res) => {
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
export const handleSpotifyCallback = async (req, res) => {
    console.log('Spotify Callback Hit!'); // Log to confirm the route is hit
    console.log('Request Body:', req.body); // Log the request body to debug
    console.log('Request Query:', req.query); // Log the query parameters to debug

    const code = req.query.code;

    console.log('Sending authorization code to Spotify:', code);

    if (!code) {
        return res.status(400).json({ error: 'Authorization code not found' });
    }

    try {
        // Exchange the code for an access token and refresh token
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

        // Retrieve Spotify User Profile
        const userProfileResponse = await axios.get('https://api.spotify.com/v1/me', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        const spotifyUser = userProfileResponse.data; 
        console.log('Spotify User Profile:', spotifyUser);

        // Call the modular function to store/update user in the database
        const { user, needsPseudo } = await storeOrUpdateUser(spotifyUser, access_token, refresh_token);
        console.log('User stored/updated in the database:', user);
     
        console.log('Tokens generated:', { access_token, refresh_token, expires_in }); //log to debug

        if (needsPseudo) {
            // Redirect to pseudo creation screen if pseudo is missing
            if (needsPseudo) {
                // Redirect to create-pseudo with tokens
                return res.redirect(
                  `/create-pseudo?userId=${user._id}&access_token=${access_token}&refresh_token=${refresh_token}&expires_in=${expires_in}`
                );
              }        }

        // Otherwise redirect to front-end with userId and tokens
        res.redirect(`/dashboard?userId=${user._id}&access_token=${access_token}&refresh_token=${refresh_token}&expires_in=${expires_in}`);
        } catch (error) {
            console.error(
                'Error exchanging authorization code for token:',
                error.response?.data || error.message
            );
            res.status(500).json({ error: 'Failed to exchange authorization code for token' });
        }
};

// Refresh the access token
export const refreshAccessToken = async (req, res) => {
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
