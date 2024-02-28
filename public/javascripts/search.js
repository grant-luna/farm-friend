import { ClientWorker } from './client-worker.js';

document.addEventListener('DOMContentLoaded', async () => {
  const accountDropdownMenu = await ClientWorker.generateAccountDropdownMenu();  
  const accountDropdownIcon = document.querySelector('.account-dropdown-icon');
  accountDropdownIcon.addEventListener('click', ClientWorker.handleAccountDropdownClick.bind(null, accountDropdownMenu));
  const searchResults = document.querySelector('.search-results');
  searchResults.addEventListener('click', (event) => {
    const eventTarget = event.target;
    
    if (eventTarget.tagName === 'A' && eventTarget.closest('div').classList.contains('property-links')) {
      event.preventDefault();
      debugger;
      const fpsWindow = document.createElement('div');
      fpsWindow.classList.add('fps-window');
      const iframe = document.createElement('iframe');
      iframe.classList.add('fpsIframe');
      iframe.src = event.target.href;
      fpsWindow.appendChild(iframe);
      document.querySelector('main').appendChild(fpsWindow);
    }
  });
});