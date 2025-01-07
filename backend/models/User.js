import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    spotify_id: {
      type: String,
      required: true,
      unique: true, // Spotify user ID is unique
    },
    pseudo: {
      type: String,
      required: true,
      unique: true, // Spotify user ID is unique
    },
    access_token: {
      type: String,
      required: true,
    },
    refresh_token: {
      type: String,
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

export default mongoose.model('User', userSchema);
