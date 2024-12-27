export function groupTracksByArtist(tracks) {
    const groupedTracks = {};
  
    tracks.forEach((track) => {
      const artistId = track.artist_id; // Get the artist ID
      const trackName = track.track_name; // Get the track name
      const trackIsrc = track.isrc;

      // If the artist ID is not in the grouped object, initialize it
      if (!groupedTracks[artistId]) {
        groupedTracks[artistId] = {};
      }
  
    // If the track is already in the artist's object, increment its count
    if (groupedTracks[artistId][trackName]) {
        groupedTracks[artistId][trackName].count += 1;
      } else {
        // Otherwise, add the track with an initial count of 1
        groupedTracks[artistId][trackName] = {
          name: trackName,
          count: 1,
        };
      }
    });
    return groupedTracks;
  }