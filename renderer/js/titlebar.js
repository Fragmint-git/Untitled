// Title bar functionality
document.addEventListener('DOMContentLoaded', () => {
  // Get references to title bar buttons
  const minimizeButton = document.getElementById('minimize-button');
  const maximizeButton = document.getElementById('maximize-button');
  const closeButton = document.getElementById('close-button');

  // Add event listeners for window controls
  if (minimizeButton) {
    minimizeButton.addEventListener('click', () => {
      window.api.minimizeWindow();
    });
  }

  if (maximizeButton) {
    maximizeButton.addEventListener('click', () => {
      window.api.maximizeWindow();
    });
  }

  if (closeButton) {
    closeButton.addEventListener('click', () => {
      window.api.closeWindow();
    });
  }
}); 