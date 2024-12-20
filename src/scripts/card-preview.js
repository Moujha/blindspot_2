document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".btn");
    
    buttons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const action = e.target.textContent.trim();
        alert(`Button clicked: ${action}`);
      });
    });
  });
  