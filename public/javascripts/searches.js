import { ClientWorker } from './client-worker.js';

document.addEventListener('DOMContentLoaded', async () => {
  const accountDropdownMenu = await ClientWorker.generateAccountDropdownMenu();  
  const accountDropdownIcon = document.querySelector('.account-dropdown-icon');
  accountDropdownIcon.addEventListener('click', ClientWorker.handleAccountDropdownClick.bind(null, accountDropdownMenu));

  const userSearchesContainer = document.querySelector('ul.user-searches-container');
  userSearchesContainer.addEventListener('click', ClientWorker.handleUserSearchSelection);

  const newSearchContainer = document.querySelector('.new-search-container')
  newSearchContainer.addEventListener('click', ClientWorker.handleNewSearchClick)
});