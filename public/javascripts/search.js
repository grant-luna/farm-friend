import { ClientWorker } from './client-worker.js';
import { findSearchIdFromUrl } from './find-search-id-from-url.js';

document.addEventListener('DOMContentLoaded', async () => {
  const searchResults = document.querySelector('.search-results');
  searchResults.addEventListener('click', SearchClientWorker.handleContactInformationButtonClick);
  searchResults.addEventListener('click', SearchClientWorker.displayCallLogsMenu);
});

class SearchClientWorker extends ClientWorker {
  static async handleContactInformationButtonClick(event) {
    const eventTarget = event.target;
    
    if (eventTarget.tagName === 'BUTTON' && eventTarget.closest('div').classList.contains('property-links')) {
      event.preventDefault();
      
      const searchId = findSearchIdFromUrl();
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

  static async handleCallLogsMenuLogCallSubmission(event) {
    event.preventDefault();
    event.stopPropagation();

    const userInputs = [...document.querySelectorAll('.log-call-form input, .log-call-form textarea')].map((element) => element.value);
    
    if (userInputs.some((input) => input)) {
      try {
        const callLogFormData = new FormData(document.querySelector('.log-call-form'));
        const searchId = findSearchIdFromUrl();
        const searchDataResponse = await fetch(`/search-data/${searchId}`);
        

        if (!searchDataResponse.ok) throw new Error('Unable to access the requested search data');
        const searchData = await searchDataResponse.json()
        debugger;
        const confirmedNumber = callLogFormData.get('confirmed-number');
      } catch (error) {
        console.error('Error: ', error);
      }

    }


  }

  static hideCallLogsMenu(event) {
    const callLogsMenu = event.target.closest('div.call-logs-menu');
    const hideCallLogMenuButton = event.currentTarget;
    hideCallLogMenuButton.removeEventListener('click', SearchClientWorker.hideCallLogMenuButton);
    callLogsMenu.remove();
  }

  static hideLogCall(event) {
    const callLogForm = document.querySelector('.log-call-form');
    callLogForm.style.opacity = '0';
    const callLogFormInputs = callLogForm.querySelectorAll('input, textarea');
    [...callLogFormInputs].forEach((input) => input.value = '');
    const callLogFormSubmitButton = callLogForm.querySelector('button[type="submit"]');

  }

  static displayLogCallForm(event) {
    const logCallForm = document.querySelector('.log-call-form');
    logCallForm.style.opacity = '100%';
    const logCallFormSubmitButton = logCallForm.querySelector('button[type="submit"]');
    logCallFormSubmitButton.addEventListener('click', SearchClientWorker.handleCallLogsMenuLogCallSubmission);
  }

  static async displayCallLogsMenu(event) {
    const closestDiv = event.target.closest('div');
    const existingCallLogsMenu = document.querySelector('.call-logs-menu');

    if (closestDiv && !existingCallLogsMenu && closestDiv.classList.contains('call-log-icon')) {
      event.stopPropagation();

      try {
        const searchResult = event.target.closest('.search-result');
        const rowId = searchResult.dataset.rowId;
        const searchId = window.location.pathname.split('/')[window.location.pathname.split('/').length - 1];
        const callLogs = await fetch(`/call-logs/${searchId}/${rowId}`);
        const html = await callLogs.text();
        
        // Construct Call Log Menu
        const callLogsMenu = document.createElement('div');
        callLogsMenu.classList.add('call-logs-menu');
        callLogsMenu.innerHTML = html;
        const hideCallLogMenuButton = callLogsMenu.querySelector('.hide-call-log-menu-icon');
        hideCallLogMenuButton.addEventListener('click', SearchClientWorker.hideCallLogsMenu)
        const logCallButton = callLogsMenu.querySelector('.call-logs-menu-header .log-a-call-button');
        logCallButton.addEventListener('click', SearchClientWorker.displayLogCallForm)
        const hideLogCall = callLogsMenu.querySelector('.log-call-form img');
        hideLogCall.addEventListener('click', SearchClientWorker.hideLogCall)

        searchResult.insertAdjacentElement('afterend', callLogsMenu);
      } catch (error) {
        console.error('Error: ', error);
      }
    }
  }
}