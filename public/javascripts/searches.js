document.addEventListener('DOMContentLoaded', () => {
  const signOutButton = document.querySelector('button.sign-out');
  signOutButton.addEventListener('click', async (event) => {
    try {
      const response = await fetch('/sign-out', { method: 'POST' });
      if (response.ok) {
        window.location.href = response.url;
      } else {
        console.error('Error signing out:', response.statusText);
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  });
});