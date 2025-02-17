import User from '../models/User.js'; // Import the User model

/**
 * Store or update a Spotify user in the database.
 * @param {Object} spotifyUser - Spotify user profile data.
 * @param {String} access_token - Spotify access token.
 * @param {String} refresh_token - Spotify refresh token.
 * @returns {Object} - The stored or updated user document.
 */
export async function storeOrUpdateUser(spotifyUser, access_token, refresh_token) {
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

    // Check if the user has a pseudo
    const needsPseudo = !user.pseudo;
    console.log('Does the user need a pseudo?', needsPseudo);


    return { user, needsPseudo }; // Return both user and pseudo status

  } catch (error) {
    console.error('Error storing/updating user in the database:', error.message);
    throw error;
  }
}