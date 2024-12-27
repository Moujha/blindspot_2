import { getLevel } from './level-logic.js';

export async function displayArtists(groupedTracks, artistDetails) {
  const container = document.getElementById("artists-container");
  container.innerHTML = ""; // Clear previous content

  // Step 1: Convert groupedTracks into an array of [artistId, tracks]
  const sortedArtists = Object.entries(groupedTracks).map(
    ([artistId, tracks]) => {
      // Calculate total track count for each artist
      const totalTrackCount = Object.values(tracks).reduce(
        (sum, track) => sum + track.count,
        0
      );

      return { artistId, tracks, totalTrackCount };
    }
  );

  // Step 2: Sort the array based on totalTrackCount in descending order
  sortedArtists.sort((a, b) => b.totalTrackCount - a.totalTrackCount);

  // Step 3: Render the sorted artist cards
  sortedArtists.forEach(({ artistId, tracks, totalTrackCount }) => {
    const { name, image } = artistDetails[artistId];

  // Create the artist card element
  const card = document.createElement("div");
  card.classList.add("artist-card");

  // Use the getLevel function to calculate level and progress
  const { level, progress } = getLevel(totalTrackCount);

  // Add the onclick event to expand the card
  card.setAttribute("onclick", "expandCard(this)");
  
  // Sort tracks by count in descending order
  const sortedTracks = Object.entries(tracks).sort(
    (a, b) => b[1].count - a[1].count
  );

  // Build the card content
  card.innerHTML = `
    <img src="${image}" alt="${name}" class="artist-image" />
    <div class="artist-overlay">
      <h3 class="artist-name">${name}</h3>
    </div>
    <div class="level-bar-container">
      <span class="level-text current-level">${level}</span>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progress}%;"></div>
      </div>
      <span class="level-text next-level">${level + 1}</span>
    </div>
    <ul class="track-list" style="display: none;">
      ${sortedTracks
        .map(
          ([trackName, trackData]) =>
            `<li>${trackData.name} (x${trackData.count})</li>`
        )
        .join("")}
    </ul>
  `;

  // Append the card to the container
  container.appendChild(card);
  });
}