const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }, // Link to User model
    isrc: {
      type: String,
      required: true,
    }, // Track unique identifier
    track_name: {
      type: String,
      required: true,
    },
    artist_id: {
      type: String,
      required: true,
    },
    artist_name: {
      type: String,
      required: true,
    },
    played_at: {
      type: Date,
      required: true, // Timestamp when the track was played
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Prevent duplicates: unique combination of user_id, isrc, and played_at
trackSchema.index({ user_id: 1, isrc: 1, played_at: 1 }, { unique: true });

module.exports = mongoose.model('Track', trackSchema);
