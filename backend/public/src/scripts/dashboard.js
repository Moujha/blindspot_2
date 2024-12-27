import { fetchRecentlyPlayed, fetchArtistDetails } from './api/spotify-api.js';
import { sendTracksToBackend, fetchUserTracksFromDB } from './api/backend-api.js';
import { displayArtists } from './ui/artist-cards.js';
import { groupTracksByArtist } from './utils/group-utils.js';
import { handleTokensFromQuery } from './api/token-utils.js';


  
async function main() {
    try {
        // Step: Handle tokens from the query string
        handleTokensFromQuery();

        // Fetch user tracks from the backend
        const userTracks = await fetchUserTracksFromDB();
        const lastPlayedAt = userTracks.lastPlayedAt || null;
        console.log('Tracks from database:', userTracks);
        console.log('Last Played At:', lastPlayedAt);

        // Step: Fetch recently played tracks
        const recentlyPlayedTracks = await fetchRecentlyPlayed(lastPlayedAt);
        if (!recentlyPlayedTracks && recentlyPlayedTracks.length === 0) {
            console.error('No recently played tracks available.');
            document.getElementById('artists-container').innerHTML = '<p>No recently played tracks found.</p>';
            return;
            }

        console.log('Recently Played Tracks:', recentlyPlayedTracks);

        // Step: Send tracks to the backend
        const formattedTracks = recentlyPlayedTracks.map((item) => ({
          isrc: item.track.external_ids.isrc,
          track_name: item.track.name,
          artist_id: item.track.artists[0].id,
          artist_name: item.track.artists[0].name,
          played_at: item.played_at,
        }));

        await sendTracksToBackend(formattedTracks);
        

      // Step: Group tracks by artist
      const groupedTracks = groupTracksByArtist(userTracks);
      console.log('Grouped Tracks:', groupedTracks);
  
      // Step: Fetch artist details
      const artistIds = Object.keys(groupedTracks);
      const artistDetails = await fetchArtistDetails(artistIds);
  
      // Step: Display artists and their tracks
      displayArtists(groupedTracks, artistDetails);
    } catch (error) {
        console.error('An error occurred in the main function:', error.message);
    }
    }
      

main();

document.getElementById('refresh-button').addEventListener('click', async () => {
  console.log('Refreshing tracks...');
  await main(); // Rerun the main function
  console.log('Tracks refreshed successfully!');
});  
