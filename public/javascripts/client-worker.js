import { FileValidator } from './file-validator.js';

export class ClientWorker {
  static attachNewSearchWindowEventListeners(newSearchMenu) {
    const closeButton = newSearchMenu.querySelector('img');
    closeButton.addEventListener('click', ClientWorker.handleCloseNewSearchMenu)
    
    const fileInput = newSearchMenu.querySelector('input[type="file"]');
    fileInput.addEventListener('change', ClientWorker.verifyFileFormat);
    
    const uploadButton = newSearchMenu.querySelector('button.submit');
    uploadButton.addEventListener('click', ClientWorker.handleUploadFile);
  }

  static handleAccountDropdownToggleDisplay(_event) {
    const accountDropdownMenu = document.querySelector('.account-dropdown-menu');
    const signOutButton = document.querySelector('.account-dropdown-menu-sign-out');

    // Check if Account Dropdown Menu exists and doesn't have a display
    if (accountDropdownMenu && !accountDropdownMenu.style.display) {
      const accountDropdownMenuStyles = {
        position: 'absolute',
        top: '-.1rem',
        right: '0',
        backgroundColor: 'var(--dark-blue)',
        zIndex: '2',
        color: 'var(--white)',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '.15rem',
        width: '240px',
      }
      
      signOutButton.addEventListener('click', ClientWorker.handleSignOut);
      Object.assign(accountDropdownMenu.style, accountDropdownMenuStyles);
    } else {
      signOutButton.removeEventListener('click', ClientWorker.handleSignOut);
      accountDropdownMenu.style.display = '';
    }
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

  static async handleSignOut(event) {
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
        
        // Add 'data' property to the object prior to adding the search into the database
        const dataProperty = {
          confirmedNumbers: [],
          callLogs: [],
        }
        parsedCsvString.forEach((row, index) => {
          row.data = { ...dataProperty, id: index };
        });
        
        const postRequestConfiguration = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({fileNameInput, parsedCsvString}),
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
    const closestLi = event.target.closest('li');
    
    if (closestLi.classList.contains('user-search-container')) {
      event.stopPropagation();

      const searchId = closestLi.dataset.id;
      try {
        if (event.target.classList.contains('delete-icon')) {
          const deleteSearchResponse = await fetch(
            `/search/${searchId}`,
            { method: 'DELETE' }
          );
          if (!deleteSearchResponse.ok) throw new Error('Unable to delete the requested search');
          location.reload();
        } else {
          const response = await fetch(`/search/${searchId}`);

          if (!response.ok) throw new Error('Unable to locate the requested search');
          window.location.href = response.url;
        }
      } catch (error) {

      }
    }

    if (event.target.classList.contains('delete-icon')) {
      event.stopPropagation();
    } else {
      const searchId = event.target.closest('li').dataset.id;
      const response = await fetch(`/search/${searchId}`);
      
      if (response.ok) {
        window.location.href = response.url;
      }
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