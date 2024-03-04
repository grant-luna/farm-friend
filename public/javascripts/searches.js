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
    closeButton.addEventListener('click', SearchesClientWorker.handleCloseNewSearchMenu)
    
    const fileInput = newSearchMenu.querySelector('input[type="file"]');
    fileInput.addEventListener('change', ClientWorker.verifyFileFormat);
    
    const uploadButton = newSearchMenu.querySelector('button.submit');
    uploadButton.addEventListener('click', ClientWorker.handleUploadFile);
  }

  static handleCloseNewSearchMenu(event) {
    const newSearchMenu = document.querySelector('.new-search-menu');
    newSearchMenu.remove();
  }
  
  static async handleNewSearchClick(event) {
    event.stopPropagation();

    let newSearchMenu = document.querySelector('.new-search-menu');

    if (!newSearchMenu) {
      try {
        const response = await fetch('/newSearchWindow')
        if (!response.ok) throw new Error('Unable to fetch the New Search window');
        const newSearchHtml = await response.text();
        if (!newSearchHtml) throw new Error('Unable to create the New Search menu');
        
        const newSearchMenu = document.createElement('div');
        newSearchMenu.classList.add('new-search-menu');
        newSearchMenu.innerHTML = newSearchHtml;

        SearchesClientWorker.attachNewSearchWindowEventListeners(newSearchMenu);
        
        document.querySelector('main').appendChild(newSearchMenu);
      } catch (error) {
        console.log(error);
      }
    }
  }
}