import User from '../models/User.js'; // Import the User schema

// Save or update a user's pseudo
export const savePseudo = async (req, res) => {
    const { userId, pseudo } = req.body; // Get userId and pseudo from the request body
  
    try {
      // Check if the pseudo is already taken
      const existingUser = await User.findOne({ pseudo });
      if (existingUser) {
        return res.status(400).json({ error: 'Pseudo already exists. Please choose another.' });
      }
  
      // Update the user with the new pseudo
      const user = await User.findByIdAndUpdate(
        userId,
        { pseudo },
        { new: true } // Return the updated user
      );
  
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }
  
      res.status(200).json({ message: 'Pseudo saved successfully.', user });
    } catch (error) {
      console.error('Error saving pseudo:', error.message);
      res.status(500).json({ error: 'Failed to save pseudo.' });
    }
  };

export const getUserList = async (req, res) => {
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
