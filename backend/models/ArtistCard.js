import mongoose from 'mongoose';

const artistCardSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }, // Link to User model
    artist_id: {
      type: String,
      required: true,
    }, // Spotify Artist ID
    discovered_at: {
      type: Date,
      default: Date.now,
    }, // Date the artist was discovered
    unlocked: {
        type: Boolean,
        default: false, // False by default, indicating the card is not yet unlocked
    },
    genres: {
      type: [String], // Array of genres (strings)
      default: [],
    },
    popularity: {
      type: Number, // Spotify popularity score
    },
    monthly_listeners: {
      type: Number, // Monthly listeners from Spotify
    },
    image: {
      type: String, // URL of the artist's image
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Ensure unique combination of user_id and artist_id
artistCardSchema.index({ user_id: 1, artist_id: 1 }, { unique: true });

export default mongoose.model('ArtistCard', artistCardSchema);
