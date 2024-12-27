const axios = require('axios');
const Track = require('../models/Track'); // Import Track model


// Saves tracks to backend
exports.saveTracks = async (req, res) => {
    const { userId, tracks } = req.body;

  if (!userId || !tracks) {
    return res.status(400).json({ error: 'User ID and tracks are required.' });
  }

  try {
    // Prepare track data for insertion
    const trackDocuments = tracks.map((track) => ({
      user_id: userId,
      isrc: track.isrc,
      track_name: track.track_name, //we may have an issue here > track.external_ids.isrc
      artist_id: track.artist_id,
      artist_name: track.artist_name,
      played_at: new Date(track.played_at),
      fetched_at: Date.now(),
    }));

    // Insert or update tracks
    await Track.insertMany(trackDocuments, { ordered: false });

    return res.status(200).json({ message: 'Tracks saved successfully.' });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error (ignoring duplicates)
      console.log('Some tracks already exist in the database.');
      return res.status(200).json({ message: 'Tracks saved with some duplicates.' });
    }
    console.error('Error saving tracks:', error.message);
    return res.status(500).json({ error: 'Failed to save tracks.' });
  }
};

// Gets tracks from backend
exports.getUserTracks = async (req, res) => {
    const { userId } = req.params; // Extract userId from URL
    
    try {
        if (!userId) {
          return res.status(400).json({ error: 'User ID is required.' });
        }
    
    // Query tracks for the given user ID
    const userTracks = await Track.find({ user_id: userId }).sort({ played_at: -1 });

    // Get the latest played_at timestamp
    const lastPlayedAt = userTracks.length > 0 ? userTracks[0].played_at : null;

    return res.status(200).json({ tracks: userTracks, lastPlayedAt });
    
} catch (error) {
    console.error('Error fetching user tracks:', error.message);
    return res.status(500).json({ error: 'Failed to fetch user tracks.' });
    }
};
