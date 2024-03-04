import { ClientWorker } from './client-worker.js';

document.addEventListener('DOMContentLoaded', async () => {
  const searchesContainer = document.querySelector('ul.searches-container');
  searchesContainer.addEventListener('click', ClientWorker.handleUserSearchSelection);

  const newSearchContainer = document.querySelector('.new-search-container')
  newSearchContainer.addEventListener('click', SearchesClientWorker.handleNewSearchClick)
});

class SearchesClientWorker extends ClientWorker {
  static attachNewSearchWindowEventListeners(newSearchMenu) {  
    const closeButton = newSearchMenu.querySelector('img');
    closeButton.addEventListener('click', SearchesClientWorker.handleCloseNewSearchMenu.bind(null, newSearchMenu));
    
    const fileInput = newSearchMenu.querySelector('input[type="file"]');
    fileInput.addEventListener('change', ClientWorker.verifyFileFormat);
    
    const uploadButton = newSearchMenu.querySelector('button.submit');
    uploadButton.addEventListener('click', ClientWorker.handleUploadFile);
  }

  static handleCloseNewSearchMenu(newSearchMenu, _event) {
    newSearchMenu.style.display = '';
    SearchesClientWorker.removeNewSearchMenuEventListener(newSearchMenu);
  }
  
  static async handleNewSearchClick(event) {
    event.stopPropagation();

    const newSearchMenuStyles = {
      position: 'absolute',
      backgroundColor: 'var(--white)',
      padding: '1rem',
      borderRadius: '.5rem',
      top: '25%',
      left: '25%',
      width: '50%',
      minWidth: 'max-content',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '.5rem',
      boxShadow: '10px 10px 20px 0 rgba(0, 0, 0, 0.2)',
      border: '3px solid var(--dark-font)',
      margin: '0 auto',
    };

    let newSearchMenu = document.querySelector('.new-search-menu');
    
    if (!newSearchMenu.style.display) {
      Object.assign(newSearchMenu.style, newSearchMenuStyles);
      SearchesClientWorker.attachNewSearchWindowEventListeners(newSearchMenu);
    }
  }

  static removeNewSearchMenuEventListener(newSearchMenu) {
    const closeButton = newSearchMenu.querySelector('img');
    closeButton.removeEventListener('click', SearchesClientWorker.handleCloseNewSearchMenu.bind(null, newSearchMenu));
    
    const fileInput = newSearchMenu.querySelector('input[type="file"]');
    fileInput.removeEventListener('change', ClientWorker.verifyFileFormat);
    
    const uploadButton = newSearchMenu.querySelector('button.submit');
    uploadButton.removeEventListener('click', ClientWorker.handleUploadFile);
  }
}