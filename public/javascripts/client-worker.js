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

  static async generateAccountDropdownMenu() {
    try {
      const accountDropdownMenu = document.createElement('div');
      accountDropdownMenu.classList.add('account-dropdown-menu');
      
      const response = await fetch('/account-dropdown-menu-items');
      if (!response.ok) throw new Error('Unable to fetch account dropdown menu items');
      const accountDropdownItems = await response.text();
      if (!accountDropdownItems) throw new Error('Unable to generate account dropdown menu items');

      accountDropdownMenu.innerHTML = accountDropdownItems;
      accountDropdownMenu.querySelector('.account-dropdown-menu-sign-out').addEventListener('click', ClientWorker.signUserOut);
      
      return accountDropdownMenu;
    } catch (error) {
      console.log(error);
    }
  }

  static handleAccountDropdownClick(accountDropdownMenu, event) {
    const existingDropdownMenu = document.querySelector('.account-dropdown-menu');
    if (existingDropdownMenu) {
      existingDropdownMenu.remove();
    } else {
      document.querySelector('main').appendChild(accountDropdownMenu);
    }
  }

  static async handleContactInformationButtonClick(event) {
    const eventTarget = event.target;
    
    if (eventTarget.tagName === 'BUTTON' && eventTarget.closest('div').classList.contains('property-links')) {
      event.preventDefault();
      
      const searchId = window.location.href.split('/')[window.location.href.split('/').length - 1];
      const responseForSearchRequest = await fetch(`/search-data/${searchId}`);
      const searchObject = await responseForSearchRequest.json();

      const rowId = eventTarget.closest('.search-result').dataset.rowId;
      
      const fpsWindow = document.createElement('div');
      fpsWindow.classList.add('fps-window');
      const requestForFpsWindow = await fetch('/fetch-fps-window');
      const fpsWindowBody = await requestForFpsWindow.text();
      fpsWindow.innerHTML = fpsWindowBody;
      
      fpsWindow.querySelector('.fps-iframe').src = eventTarget.dataset.link;

      // Attach Event Listener to Call Log Submit Button
      const submitCallLogButton = fpsWindow.querySelector('form.log-call .submit');
      submitCallLogButton.addEventListener('click', async function (searchId, searchObject, rowId, event) {
        event.preventDefault();
        
        // Check if the user submit anything in the form
        const callLogForm = new FormData(document.querySelector('form.log-call'));
        const inputValues = [...callLogForm.values()].some((value) => value.length > 0);

        if (inputValues) {
          // Find the row that the call log is associated with
          const row = searchObject.find((row) => Number(row.data.id) === Number(rowId));
          
          // Reminder: callLogForm is a FormData object
          const confirmedNumber = callLogForm.get('confirmed-number');
          
          // Check if the user entered a confirmed number
          if (confirmedNumber) {
            row.data.confirmedNumbers.push(confirmedNumber);
          }
          
          // Check if the user entered a call note or a contact person
          if (callLogForm.get('contact-person') || callLogForm.get('call-notes')) {
            row.data.callLogs.push({
              date: new Date(),
              contactPerson: callLogForm.get('contact-person'),
              callNotes: callLogForm.get('call-notes'),
            });
          }
          
          // Send update request to server
          try {
            const updateSearchResponse = await fetch(
              `/updateSearch/${searchId}`,
              { headers: {'Content-Type' : 'application/json'},
                method: 'PUT', 
                body: JSON.stringify(searchObject), 
              },
            );
            
            if (!updateSearchResponse.ok) {
              throw new Error('Error with this hahaha');
            }

            document.querySelector('.fps-window').remove();
          } catch (error) {
            console.log(error);
          }
        }
      }.bind(null, searchId, searchObject, rowId, event));

      // Attach Minimize Window Functionality
      const minimizeWindowButton = fpsWindow.querySelector('.fps-window-header img');
      minimizeWindowButton.addEventListener('click', function (fpsWindow, event) {
        fpsWindow.remove();
      }.bind(null, fpsWindow));

      document.querySelector('main').appendChild(fpsWindow);
    }
  }

  static handleCloseNewSearchMenu(event) {
    const newSearchMenu = document.querySelector('.new-search-menu');

    if (newSearchMenu) {
      newSearchMenu.remove();
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