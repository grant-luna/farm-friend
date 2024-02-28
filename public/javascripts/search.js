import { ClientWorker } from './client-worker.js';

document.addEventListener('DOMContentLoaded', async () => {
  const searchResults = document.querySelector('.search-results');
  searchResults.addEventListener('click', ClientWorker.handleContactInformationButtonClick);
  const accountDropdownMenu = await ClientWorker.generateAccountDropdownMenu();  
  const accountDropdownIcon = document.querySelector('.account-dropdown-icon');
  accountDropdownIcon.addEventListener('click', ClientWorker.handleAccountDropdownClick.bind(null, accountDropdownMenu));
});