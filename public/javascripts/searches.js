import { ClientWorker } from './client-worker.js';

document.addEventListener('DOMContentLoaded', async () => {
  const searchesContainer = document.querySelector('ul.searches-container');
  searchesContainer.addEventListener('click', ClientWorker.handleUserSearchSelection);

  const newSearchContainer = document.querySelector('.new-search-container')
  newSearchContainer.addEventListener('click', SearchesClientWorker.handleNewSearchClick)
});

class SearchesClientWorker extends ClientWorker {
  static attachNewSearchWindowEventListeners(newSearchMenu) {  
    const closeButton = newSearchMenu.querySelector('img');
    closeButton.addEventListener('click', SearchesClientWorker.handleCloseNewSearchMenu.bind(null, newSearchMenu));
    
    const fileInput = newSearchMenu.querySelector('input[type="file"]');
    fileInput.addEventListener('change', ClientWorker.verifyFileFormat);
    
    const uploadButton = newSearchMenu.querySelector('button.submit');
    uploadButton.addEventListener('click', SearchesClientWorker.handleUploadFile);
  }

  static handleCloseNewSearchMenu(newSearchMenu, _event) {
    newSearchMenu.style.display = '';
    SearchesClientWorker.removeNewSearchMenuEventListener(newSearchMenu);
  }
  
  static async handleNewSearchClick(event) {
    event.stopPropagation();

    const newSearchMenuStyles = {
      position: 'absolute',
      backgroundColor: 'var(--white)',
      padding: '1rem',
      borderRadius: '.5rem',
      top: '25%',
      left: '25%',
      width: '50%',
      minWidth: 'max-content',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '.5rem',
      boxShadow: '10px 10px 20px 0 rgba(0, 0, 0, 0.2)',
      border: '3px solid var(--dark-font)',
      margin: '0 auto',
    };

    let newSearchMenu = document.querySelector('.new-search-menu');
    
    if (!newSearchMenu.style.display) {
      Object.assign(newSearchMenu.style, newSearchMenuStyles);
      SearchesClientWorker.attachNewSearchWindowEventListeners(newSearchMenu);
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

  static removeNewSearchMenuEventListener(newSearchMenu) {
    const closeButton = newSearchMenu.querySelector('img');
    closeButton.removeEventListener('click', SearchesClientWorker.handleCloseNewSearchMenu.bind(null, newSearchMenu));
    
    const fileInput = newSearchMenu.querySelector('input[type="file"]');
    fileInput.removeEventListener('change', ClientWorker.verifyFileFormat);
    
    const uploadButton = newSearchMenu.querySelector('button.submit');
    uploadButton.removeEventListener('click', SearchesClientWorker.handleUploadFile);
  }
}