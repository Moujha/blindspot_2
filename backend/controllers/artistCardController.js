const { handleArtistDiscovery } = require('../services/artistCardService.js');

/**
 * Controller to handle artist discovery.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.discoverArtist = async (req, res) => {
  const { userId, artistId, artistDetails } = req.body;

  try {
    // Call the service function to handle artist discovery
    await handleArtistDiscovery(userId, artistId, artistDetails);
    res.status(200).json({ message: 'Artist discovery handled successfully.' });
  } catch (error) {
    console.error('Error in artist discovery controller:', error.message);
    res.status(500).json({ error: 'Failed to handle artist discovery.' });
  }
};
