function openCard(cardElement) {
    const modal = document.querySelector('.card-modal');
    modal.style.display = 'flex';
  
    // Copy the small card's image to the large modal
    const largeImage = modal.querySelector('.card-header img');
    const smallImage = cardElement.querySelector('.card-header img').src;
    largeImage.src = smallImage;
  }
  
  // Attach function to global scope
  window.openCard = openCard;
  
  // Close the modal when clicking outside the content
  document.querySelector('.card-modal').addEventListener('click', function (e) {
    if (e.target === this) {
      this.style.display = 'none';
    }
  });
  