export async function sendTracksToBackend(tracks) {
    const userId = localStorage.getItem('spotifyUserId'); // Assume user ID is stored in localStorage
  
      if (!userId) {
          console.error('User ID is missing. Please log in again.');
          alert('User ID is missing. Please log in again.');
          return;
      }
  
      try {
          // Prepare the payload
          const payload = {
              userId: userId,
              tracks: tracks.map((track) => ({
                  isrc: track.isrc,
                  track_name: track.track_name,
                  artist_id: track.artist_id,
                  artist_name: track.artist_name,
                  played_at: track.played_at,
              })),
          };
  
          // Send the tracks to the backend
          const response = await fetch('/spotify/save-tracks', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
          });
  
          if (!response.ok) {
              throw new Error('Failed to save tracks to the backend');
          }
  
          console.log('Tracks sent successfully to backend.');
      } catch (error) {
          console.error('Error sending tracks to backend:', error.message);
          alert('Failed to save tracks. Please try again.');
      }
  }
  
export async function fetchUserTracksFromDB() {
    const userId = localStorage.getItem('spotifyUserId');
  
    if (!userId) {
        console.error('User ID is missing. Redirecting to login...');
        window.location.href = '/';
        return;
    }
  
    try {
        const response = await fetch(`/spotify/get-tracks/${userId}`);
  
        if (!response.ok) throw new Error('Failed to fetch user tracks from database');
  
        const data = await response.json(); // Parse the full response
        const tracks = data.tracks || []; // Return only the tracks array
        console.log('Tracks fetched from database:', tracks);
        return tracks;
    } catch (error) {
        console.error('Error fetching user tracks:', error.message);
        alert('Unable to load tracks. Please try again later.');
        return [];
    }
  }


  export async function fetchUsers() {
    try {
      const response = await fetch('/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const users = await response.json();
      return users;
    } catch (error) {
      console.error('Error fetching users:', error.message);
      throw error; // Let the calling function handle the error
    }
  }
  