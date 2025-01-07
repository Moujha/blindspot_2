const ArtistCard = require('../models/ArtistCard.js');

// Check if an artist card exists
async function doesArtistCardExist(userId, artistId) {
  return ArtistCard.findOne({ user_id: userId, artist_id: artistId });
}

// Create a new artist card
async function createArtistCard(userId, artistId, artistDetails) {
  return ArtistCard.create({
    user_id: userId,
    artist_id: artistId,
    discovered_at: new Date(),
    unlocked: true,
    genres: artistDetails.genres || [],
    popularity: artistDetails.popularity ?? 0,
    monthly_listeners: artistDetails.monthly_listeners ?? 0,
    image: artistDetails.image || 'default-image-url.jpg',
  });
}

/**
 * Check if the artist is discovered and unlock the card if it's the first track by the artist.
 * @param {ObjectId} userId - The user's ID.
 * @param {String} artistId - The Spotify artist ID.
 * @param {Object} artistDetails - Details of the artist (genres, popularity, etc.).
 */
async function handleArtistDiscovery(userId, artistId, artistDetails) {
  try {
    // Check if the user has already discovered this artist
    const existingCard = await doesArtistCardExist(userId, artistId);

    if (!existingCard) {
      console.log(`First track by artist ${artistId} for user ${userId}. Unlocking artist card.`);
      await createArtistCard(userId, artistId, artistDetails);
    } else {
      console.log(`User ${userId} has already discovered artist ${artistId}. No action taken.`);
    }
  } catch (error) {
    console.error('Error handling artist discovery:', error.message);
    throw error;
  }
}

module.exports = { handleArtistDiscovery };
