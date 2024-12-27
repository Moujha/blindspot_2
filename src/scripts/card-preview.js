document.addEventListener("DOMContentLoaded", () => {
    // Expanded View Variables
    const expandedView = document.getElementById("expanded-view");
    const expandedImage = expandedView.querySelector(".expanded-image");
    const expandedName = expandedView.querySelector(".expanded-name");
    const expandedTrackList = expandedView.querySelector(".expanded-track-list");
  
    // Expand Card Functionality
    window.expandCard = function (card) {
      // Get the artist's details
      const artistImage = card.querySelector(".artist-image").src;
      const artistName = card.querySelector(".artist-name").textContent;
      const trackList = card.querySelector(".track-list").innerHTML;
  
      // Populate the expanded view
      expandedImage.src = artistImage;
      expandedName.textContent = artistName;
      expandedTrackList.innerHTML = trackList;
  
      // Show the expanded view
      expandedView.classList.remove("hidden");
  
      // Hide the grid view
      document.getElementById("artists-container").classList.add("hidden");
    };
  
    window.closeExpandedView = function () {
      // Hide the expanded view
      expandedView.classList.add("hidden");
  
      // Show the grid view
      document.getElementById("artists-container").classList.remove("hidden");
    };
  
    // Dummy data for levels and progression
    const dummyData = [
      { level: 1, nextLevel: 2, progress: 40 },
      { level: 2, nextLevel: 3, progress: 75 },
      { level: 3, nextLevel: 4, progress: 20 },
    ];
  
    // Select all artist cards
    const artistCards = document.querySelectorAll(".artist-card");
  
    artistCards.forEach((card, index) => {
      const data = dummyData[index % dummyData.length]; // Cycle through dummy data
  
      // Set the level text
      card.querySelector(".current-level").textContent = data.level;
      card.querySelector(".next-level").textContent = data.nextLevel;
  
      // Set the progress fill width
      card.querySelector(".progress-fill").style.width = `${data.progress}%`;
    });
  });
  