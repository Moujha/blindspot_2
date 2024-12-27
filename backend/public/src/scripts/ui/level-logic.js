// Function to calculate level and progress based on total tracks
export function getLevel(totalTracks) {
    let level = 1;
    let tracksForNextLevel = 1; // Tracks required for the next level
    let tracksSpent = 0; // Tracks already accounted for previous levels
  
    while (totalTracks >= tracksSpent + tracksForNextLevel) {
      tracksSpent += tracksForNextLevel;
      level++;
  
      // Logic for increasing tracks required for each level
      if (level === 2) {
        tracksForNextLevel = 3; // Level 2 requires 3 tracks
      } else if (level >= 3 && level <= 10) {
        tracksForNextLevel = 5; // Levels 3-10 require 5 additional tracks
      } else {
        tracksForNextLevel = 10; // Level 11+ requires 10 additional tracks
      }
    }
  
    // Calculate progress percentage within the current level
    const progress = ((totalTracks - tracksSpent) / tracksForNextLevel) * 100;
  
    return {
      level,
      progress: Math.min(progress, 100), // Ensure it doesn't exceed 100%
    };
  }
  