import { FileValidator } from './file-validator.js';

document.addEventListener('DOMContentLoaded', () => {
  const clientWorker = new ClientWorker();

  const fileInput = document.querySelector('input[type="file"]');
  fileInput.addEventListener('change', clientWorker.verifyFileFormat);

  const uploadButton = document.querySelector('button.submit');
  uploadButton.addEventListener('click', clientWorker.handleUploadFile);
  
  const signOutButton = document.querySelector('button.sign-out');
  signOutButton.addEventListener('click', clientWorker.signUserOut);
});

class ClientWorker {
  handleUploadFile(event) {
    event.preventDefault();

    const fileInput = document.querySelector('input[type="file"]').files[0];
    const fileNameInput = document.querySelector('input[type="text"]').value;

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

  async signUserOut(event) {
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

  async verifyFileFormat(event) {
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