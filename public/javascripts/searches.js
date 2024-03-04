import { ClientWorker } from './client-worker.js';

document.addEventListener('DOMContentLoaded', async () => {
  const searchesContainer = document.querySelector('ul.searches-container');
  searchesContainer.addEventListener('click', ClientWorker.handleUserSearchSelection);

  const newSearchContainer = document.querySelector('.new-search-container')
  newSearchContainer.addEventListener('click', ClientWorker.handleNewSearchClick)
});

class SearchesClientWorker extends ClientWorker {
  
}