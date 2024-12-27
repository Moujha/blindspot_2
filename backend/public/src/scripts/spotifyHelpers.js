import axios from 'axios';

/**
 * Check if a token is expired.
 */
export function isTokenExpired(expiryTime) {
    return !expiryTime || Date.now() > expiryTime;
}

/**
 * Refresh Spotify access token.
 */
export async function refreshAccessToken(refreshToken) {
    try {
        const response = await axios.post('https://accounts.spotify.com/api/token', null, {
            params: {
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: process.env.CLIENT_ID, // Pass these securely
                client_secret: process.env.CLIENT_SECRET,
            },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        return response.data; // { access_token, expires_in, ... }
    } catch (error) {
        console.error('Error refreshing Spotify token:', error.message);
        throw new Error('Failed to refresh Spotify token');
    }
}

/**
 * Fetch recently played tracks.
 */
export async function fetchRecentlyPlayed(accessToken, lastPlayedAt = null) {
    try {
        let url = 'https://api.spotify.com/v1/me/player/recently-played?limit=50';
        if (lastPlayedAt) {
            const afterTimestamp = new Date(lastPlayedAt).getTime();
            url += `&after=${afterTimestamp}`;
        }

        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        return response.data.items || [];
    } catch (error) {
        console.error('Error fetching recently played tracks:', error.message);
        throw new Error('Failed to fetch recently played tracks');
    }
}

/**
 * Fetch artist details.
 */
export async function fetchArtistDetails(accessToken, artistIds) {
    const artistDetails = {};

    for (const artistId of artistIds) {
        try {
            const response = await axios.get(`https://api.spotify.com/v1/artists/${artistId}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            artistDetails[artistId] = {
                name: response.data.name,
                image: response.data.images?.[0]?.url || 'default-artist-image.jpg',
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

/**
 * Group tracks by artist.
 */
export function groupTracksByArtist(tracks) {
    const groupedTracks = {};

    tracks.forEach((track) => {
        const artistId = track.artist_id;
        const trackName = track.track_name;

        if (!groupedTracks[artistId]) {
            groupedTracks[artistId] = {};
        }

        if (groupedTracks[artistId][trackName]) {
            groupedTracks[artistId][trackName].count += 1;
        } else {
            groupedTracks[artistId][trackName] = {
                name: trackName,
                count: 1,
            };
        }
    });

    return groupedTracks;
}

