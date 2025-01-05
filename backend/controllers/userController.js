const User = require('../models/User'); // Import the User schema
const Track = require('../models/Track'); // Import Track model

const getUserList = async (req, res) => {
  try {
    // Aggregate users with their collection size
    const users = await User.aggregate([
      {
        $lookup: {
          from: 'tracks', // The name of the tracks collection
          localField: '_id', // Field in users
          foreignField: 'user_id', // Field in tracks
          as: 'userTracks', // The resulting array
        },
      },
      {
        $addFields: {
          collectionSize: { $size: '$userTracks' }, // Count the tracks for each user
        },
      },
      {
        $project: {
          pseudo: 1, // Include userId
          collectionSize: 1, // Include collectionSize
        },
      },
      {
        $sort: { collectionSize: -1 }, // Sort by collectionSize descending
      },
    ]);

    res.status(200).json(users); // Respond with the aggregated users
  } catch (error) {
    console.error('Error fetching user list:', error.message);
    res.status(500).json({ error: 'Failed to fetch user list' });
  }
};

module.exports = { getUserList };
