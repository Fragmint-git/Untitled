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

  /*if (closeButton) {
    closeButton.addEventListener('click', () => {
      window.api.clearSession();
      window.api.closeWindow();
    });
  }*/

    if (closeButton) {
      closeButton.addEventListener('click', async () => {
        try {
          const session = await window.api.getSession();
          const domainKey = window.env?.lootlockerDomainKey;
    
          if (session?.lootlocker_token && domainKey) {
            await fetch('https://api.lootlocker.io/white-label-login/logout', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'is-development': 'true',
                'domain-key': domainKey,
                'authorization': `Bearer ${session.lootlocker_token}`
              }
            });
          }
        } catch (err) {
          console.warn('[CloseButton] Failed to logout from LootLocker:', err);
        }
    
        await window.api.clearSession();
        window.api.closeWindow();
      });
    }
    
}); 