export function loadNavbar(containerId) {
    fetch('/src/navbar.html')
      .then((response) => response.text())
      .then((html) => {
        document.getElementById(containerId).innerHTML = html;
  
        // Highlight the active menu
        const links = document.querySelectorAll('.navbar-list li a');
        links.forEach((link) => {
          if (link.href === window.location.href) {
            link.classList.add('active');
          }
        });
      })
      .catch((error) => {
        console.error('Error loading navbar:', error);
      });
  }
  