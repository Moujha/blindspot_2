import cron from 'node-cron';
import axios from 'axios';
import User from './models/User.js'; // Import User model
import Track from './models/Track.js'; // Import Track model

const refreshSpotifyToken = async (refreshToken) => {
    try {
        const response = await axios.post(
            'https://accounts.spotify.com/api/token',
            new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
            }).toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        return response.data.access_token;
    } catch (error) {
        console.error('Error refreshing Spotify token:', error.message);
        throw new Error('Unable to refresh Spotify token');
    }
};

// Function to fetch new tracks for a user
async function fetchAndStoreTracksForUser(user) {
    try {
        console.log(`Fetching tracks for user: ${user.spotify_id}`);

        // Use the user's access token
        let accessToken = user.access_token;

        // Refresh token if the current access token is likely expired
        if (isTokenExpired(user.updated_at)) {
            console.log(`Refreshing token for user: ${user.spotify_id}`);
            accessToken = await refreshSpotifyToken(user.refresh_token);

            // Save the new access token in the database
            await User.findByIdAndUpdate(user._id, {
                access_token: accessToken,
                updated_at: new Date(),
            });
        }

        // Get the last played_at timestamp for this user
        const lastPlayedTrack = await Track.findOne({ user_id: user._id }).sort({ played_at: -1 });
        const lastPlayedAt = lastPlayedTrack ? new Date(lastPlayedTrack.played_at).getTime() : null;

        // Construct Spotify API URL
        let url = 'https://api.spotify.com/v1/me/player/recently-played?limit=50';
        if (lastPlayedAt) {
            url += `&after=${lastPlayedAt}`;
        }

        // Fetch recently played tracks from Spotify
        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const newTracks = response.data.items || [];
        console.log(`Fetched ${newTracks.length} new tracks for user: ${user.spotify_id}`);

        // Format and save tracks to the database
        const formattedTracks = newTracks.map((item) => ({
            user_id: user._id,
            isrc: item.track.external_ids?.isrc,
            track_name: item.track.name,
            artist_id: item.track.artists[0].id,
            artist_name: item.track.artists[0].name,
            played_at: item.played_at,
        }));

        await Track.insertMany(formattedTracks, { ordered: false }); // Ignore duplicates
        console.log(`Saved ${formattedTracks.length} tracks for user: ${user.spotify_id}`);
    } catch (error) {
        console.error(`Error fetching tracks for user ${user.spotify_id}:`, error.message);
    }
}

// Helper function to check if a token is expired
function isTokenExpired(updatedAt) {
    const tokenAge = Date.now() - new Date(updatedAt).getTime();
    return tokenAge > 3600 * 1000; // Tokens expire after 1 hour
}

// Cron job to fetch tracks for all users
cron.schedule('*/15 * * * *', async () => {
    console.log('Running periodic track fetch...');

    try {
        // Get all users from the database
        const users = await User.find();

        // Fetch tracks for each user
        for (const user of users) {
            await fetchAndStoreTracksForUser(user);
        }

        console.log('Periodic track fetch completed.');
    } catch (error) {
        console.error('Error during periodic track fetch:', error.message);
    }
});
