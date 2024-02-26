import { FileValidator } from './file-validator.js';

document.addEventListener('DOMContentLoaded', async () => {
  const accountDropdownMenu = await ClientWorker.generateAccountDropdownMenu();  
  const accountDropdownIcon = document.querySelector('.account-dropdown-icon');
  accountDropdownIcon.addEventListener('click', ClientWorker.handleAccountDropdownClick.bind(null, accountDropdownMenu));

  const userSearchesContainer = document.querySelector('ul.user-searches-container');
  userSearchesContainer.addEventListener('click', ClientWorker.handleUserSearchSelection);

  const newSearchContainer = document.querySelector('.new-search-container')
  newSearchContainer.addEventListener('click', ClientWorker.handleNewSearchClick)
});

class ClientWorker {
  static attachNewSearchWindowEventListeners(newSearchMenu) {
    const closeButton = newSearchMenu.querySelector('img');
    closeButton.addEventListener('click', ClientWorker.handleCloseNewSearchMenu)
    
    const fileInput = newSearchMenu.querySelector('input[type="file"]');
    fileInput.addEventListener('change', ClientWorker.verifyFileFormat);
    
    const uploadButton = newSearchMenu.querySelector('button.submit');
    uploadButton.addEventListener('click', ClientWorker.handleUploadFile);
  }

  static handleAccountDropdownClick(accountDropdownMenu, event) {
    const existingDropdownMenu = document.querySelector('.account-dropdown-menu');
    if (existingDropdownMenu) {
      existingDropdownMenu.remove();
    } else {
      document.querySelector('header').appendChild(accountDropdownMenu);
    }
  }

  static handleCloseNewSearchMenu(event) {
    const newSearchMenu = document.querySelector('.new-search-menu');

    if (newSearchMenu) {
      newSearchMenu.remove();
    }
  }
  
  static async generateAccountDropdownMenu() {
    try {
      const accountDropdownMenu = document.createElement('ul');
      accountDropdownMenu.classList.add('account-dropdown-menu');
      
      const response = await fetch('/account-dropdown-menu-items');
      if (!response.ok) throw new Error('Unable to fetch account dropdown menu items');
      const accountDropdownItems = await response.text();
      if (!accountDropdownItems) throw new Error('Unable to generate account dropdown menu items');

      accountDropdownMenu.innerHTML = accountDropdownItems;
      return accountDropdownMenu;
    } catch (error) {
      console.log(error);
    }
  }

  static handleAccountDropdownMenuClick(event) {
    
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

        ClientWorker.attachNewSearchWindowEventListeners(newSearchMenu);
        
        document.querySelector('main').appendChild(newSearchMenu);
      } catch (error) {
        console.log(error);
      }
    }
  }
  
  static handleUploadFile(event) {
    event.preventDefault();

    const fileInput = document.querySelector('input[type="file"]').files[0];
    const fileNameInput = document.querySelector('form.file-upload input[type="text"]').value;
    
    try {
      if (!fileInput || !fileNameInput) throw new Error('Mssing either a file name or a file for a search.')
      
      const fileReader = new FileReader();
      fileReader.addEventListener('load', async (event) => {
        const csvString = event.target.result;
        const parsedCsvString = Papa.parse(csvString, { header: true }).data;
        
        const postRequestConfiguration = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(parsedCsvString),
        }

        const response = await fetch('/search', postRequestConfiguration);
        if (!response.ok) throw new Error('Error with creating your search');
        window.location.href = response.url;
      });
  
      fileReader.addEventListener('error', (event) => {
        console.error('Error reading file:', event.target.error);
      });
  
      if (fileInput) {
        fileReader.readAsText(fileInput);
      }
    } catch (error) {
      console.log(error);
    }
  }

  static async handleUserSearchSelection(event) {
    event.stopPropagation();
    
    const searchId = event.target.closest('li').dataset.id;
    const response = await fetch(`/search/${searchId}`);
    if (response.ok) {
      window.location.href = response.url;
    }
  }

  static async signUserOut(event) {
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

  static async verifyFileFormat(event) {
    const fileInput = event.target.files[0];
    const fileReader = new FileReader();

    fileReader.addEventListener('load', async (event) => {
      const csvString = event.target.result;
      const parsedCsvString = await Papa.parse(csvString, { header: true }).data;
      const csvHeaders = Object.keys(parsedCsvString[0]);
      
      if (!FileValidator.isValidHeading(csvHeaders)) {
        console.log('Unsupported File Format');
      }
    });

    if (fileInput) {
      fileReader.readAsText(fileInput);
    }
  }
}