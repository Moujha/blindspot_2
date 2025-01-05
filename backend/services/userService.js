const User = require('../models/User'); // Import the User model

/**
 * Store or update a Spotify user in the database.
 * @param {Object} spotifyUser - Spotify user profile data.
 * @param {String} access_token - Spotify access token.
 * @param {String} refresh_token - Spotify refresh token.
 * @returns {Object} - The stored or updated user document.
 */
async function storeOrUpdateUser(spotifyUser, access_token, refresh_token) {
  try {
   
    // Log incoming data for debugging
    console.log('MongoDB StoreOrUpdate User:');
    console.log('Spotify User:', spotifyUser);
    console.log('Access Token:', access_token);
    console.log('Refresh Token:', refresh_token);
    console.log('UserId:', spotifyUser.id);
        
    const user = await User.findOneAndUpdate(
      { spotify_id: spotifyUser.id }, // Query: Find user by Spotify ID
      {
        spotify_id: spotifyUser.id,
        access_token,
        refresh_token,
        updated_at: Date.now(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true } // Options
    );

    return user;
  } catch (error) {
    console.error('Error storing/updating user in the database:', error.message);
    throw error;
  }
}

module.exports = { storeOrUpdateUser };
