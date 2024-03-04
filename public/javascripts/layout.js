import { ClientWorker } from './client-worker.js'

document.addEventListener('DOMContentLoaded', () => {
  const accountDropdownIcon = document.querySelector('.account-dropdown-icon');
  if (accountDropdownIcon) {
    accountDropdownIcon.addEventListener('click', ClientWorker.handleAccountDropdownToggleDisplay);
  }
});
