document.addEventListener('DOMContentLoaded', () => {
    // Extract query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    const expiresIn = urlParams.get('expires_in');
  
    // Set the hidden userId input field
    document.getElementById('userId').value = userId;
  
    // Form submission handler
    const form = document.getElementById('pseudo-form');
    form.addEventListener('submit', async (event) => {
      event.preventDefault(); // Prevent default form submission
  
      // Get the pseudo input value
      const pseudo = document.getElementById('pseudo').value.trim();
  
      // Validate pseudo length (optional)
      if (pseudo.length < 3) {
        const errorMessage = document.getElementById('error-message');
        errorMessage.textContent = 'Pseudo must be at least 3 characters.';
        errorMessage.style.display = 'block';
        return;
      }
  
      try {
        // Send the POST request to the backend
        const response = await fetch('/users/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, pseudo }),
        });
  
        if (!response.ok) {
          const data = await response.json();
          const errorMessage = document.getElementById('error-message');
          errorMessage.textContent = data.error || 'An error occurred.';
          errorMessage.style.display = 'block';
          return;
        }
  
        // Redirect to the dashboard with tokens
        console.log('Redirecting to:', dashboardUrl);
        const dashboardUrl = `/dashboard?access_token=${accessToken}&refresh_token=${refreshToken}&expires_in=${expiresIn}`;
        window.location.href = dashboardUrl;
      } catch (error) {
        console.error('Error saving pseudo:', error);
        const errorMessage = document.getElementById('error-message');
        errorMessage.textContent = 'An error occurred. Please try again.';
        errorMessage.style.display = 'block';
      }
    });
  });
  