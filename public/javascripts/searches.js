document.addEventListener('DOMContentLoaded', () => {
  const clientWorker = new ClientWorker();

  const uploadButton = document.querySelector('button.submit');
  uploadButton.addEventListener('click', clientWorker.handleFileUpload);
  
  const signOutButton = document.querySelector('button.sign-out');
  signOutButton.addEventListener('click', clientWorker.signUserOut);
});

class ClientWorker {
  async handleFileUpload(event) {
    
  }

  async signUserOut(event) {
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
  }
}