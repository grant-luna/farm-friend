import { ClientWorker } from './client-worker.js';

document.addEventListener('DOMContentLoaded', async () => {
  const accountDropdownMenu = await ClientWorker.generateAccountDropdownMenu();  
  const accountDropdownIcon = document.querySelector('.account-dropdown-icon');
  accountDropdownIcon.addEventListener('click', ClientWorker.handleAccountDropdownClick.bind(null, accountDropdownMenu));
});