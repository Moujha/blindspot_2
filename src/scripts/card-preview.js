document.addEventListener("DOMContentLoaded", () => {
    const expandedView = document.getElementById("expanded-view");
    const expandedImage = expandedView.querySelector(".expanded-image");
    const expandedName = expandedView.querySelector(".expanded-name");
    const expandedTrackList = expandedView.querySelector(".expanded-track-list");
    
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
  });
  