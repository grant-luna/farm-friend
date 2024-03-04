import { ClientWorker } from './client-worker.js';

document.addEventListener('DOMContentLoaded', async () => {
  const searchResults = document.querySelector('.search-results');
  searchResults.addEventListener('click', SearchClientWorker.handleContactInformationButtonClick);
});

class SearchClientWorker extends ClientWorker {
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
}