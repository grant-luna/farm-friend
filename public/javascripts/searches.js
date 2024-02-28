import { ClientWorker } from './client-worker.js';

document.addEventListener('DOMContentLoaded', async () => {
  const accountDropdownMenu = await ClientWorker.generateAccountDropdownMenu();  
  const accountDropdownIcon = document.querySelector('.account-dropdown-icon');
  accountDropdownIcon.addEventListener('click', ClientWorker.handleAccountDropdownClick.bind(null, accountDropdownMenu));

  const searchesContainer = document.querySelector('ul.searches-container');
  searchesContainer.addEventListener('click', ClientWorker.handleUserSearchSelection);

  const newSearchContainer = document.querySelector('.new-search-container')
  newSearchContainer.addEventListener('click', ClientWorker.handleNewSearchClick)
});