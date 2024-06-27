"use client"
import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useImmer } from 'use-immer';
import Image from 'next/image';
import { Tooltip } from 'react-tooltip';
import toast, { Toaster } from 'react-hot-toast';
import { CategoriesContext, FileContext } from '../page.jsx'; // Adjust the path to your context file
import { createSearch } from '../../actions/createSearch.js';
import { createTemplate } from '../../actions/createTemplate.js';
import { FiAlertCircle } from 'react-icons/fi';
import { MdOutlineIncompleteCircle } from 'react-icons/md';
import { VscNotebookTemplate } from 'react-icons/vsc';
import { MdOutlineArrowDropDownCircle } from 'react-icons/md';


export default function SearchCheckoutModal() {
  const [ templateCreationRequested, setTemplateCreationRequested ] = useState(false);
  const [ templateName, setTemplateName ] = useState('');
  const { categories } = useContext(CategoriesContext);
  const { parsedCsvFile } = useContext(FileContext);
  const router = useRouter();

  const [ checkoutObject, setCheckoutObject ] = useImmer({
    data: JSON.stringify(parsedCsvFile),
    searchName: '',
  });

  function searchCheckoutModalComplete() {
    if (!/^\s*\S.*$/.test(checkoutObject.searchName)) {
      return false;
    }

    if (templateCreationRequested && !/^\s*\S.*$/.test(templateName)) {
      return false;
    } 

    return true;
  }
  debugger;
  function displayCheckoutError(errorMessage) {
    toast.error(errorMessage);
  }

  async function handleFinalizeCheckout() {
    if (searchCheckoutModalComplete()) {
      try {
        if (templateCreationRequested) {
          
          const newTemplateResponse = await createTemplate(JSON.stringify(categories), templateName);

          if (newTemplateResponse.error) {
            console.error('Error creating new template in createSearch.', error);
          }
        }
  
        const newSearch = await createSearch(JSON.stringify(checkoutObject));
        if (newSearch.error) {
          displayCheckoutError(newSearch.error);
          return;
        }
        const closeModalButton = document.querySelector('#closeSearchCheckoutButton');
        closeModalButton.click();
        router.push(`/fasterFastPeopleSearch/searches/${newSearch.id}`);
      } catch (error) {
        console.error(error);
      }
    }    
  }

  function handleSearchNameChange(event) {
    const searchNameInput = event.currentTarget;
    
    setCheckoutObject((draft) => {
      draft.searchName = searchNameInput.value;
    });
  }

  function handleTemplateNameChange(event) {
    const newTemplateName = event.currentTarget.value;

    setTemplateName(newTemplateName);
  }
  
  return (
    <div className={`modal-content`}>
      <Toaster />
      <div className="modal-header">
        <h2>Checkout</h2>
        <button
          type="button"
          className="btn-close"
          data-bs-dismiss="modal"
          aria-label="Close"
          id='closeSearchCheckoutButton'
        ></button>
      </div>
      <div className="modal-body d-flex flex-column justify-content-center" style={{gap: '.5rem'}}>
        <div className="d-flex flex-column justify-content-center align-items-center">
          <Image src="/farm-friend-logo.png" alt="Farm Friend Logo" width={200} height={200}></Image>
          <div>
            <h5>Finalizing Your Results</h5>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
        <div className="d-flex flex-column justify-content-center align-items-center">
          {templateCreationRequested && (
            <form className="form-floating d-flex flex-column" style={{gap: '.75rem', width: '60%', margin: '0 auto'}}>  
              <input 
                type="text"
                className="form-control"
                id="templateName"
                placeholder="Template Name"
                onChange={handleTemplateNameChange}
              >
              </input>
              <label htmlFor="templateName">Name Your Template</label>
            </form>
          ) || (
            <div className="d-flex flex-column justify-content-center align-items-center" style={{width: '100%', padding: '.5rem', borderRadius: '.25rem', outline: '1px solid #0E611F', gap: '.5rem'}}>
              <p style={{marginBottom: '0'}}>Would you like to <button className="btn btn-outline-success" onClick={() => setTemplateCreationRequested(true)}>Create a Template</button> for this search?</p>
              <p
                className="btn btn-outline-light"
                style={{marginBottom: '0', color: '#0E611F'}}
                data-bs-toggle="collapse"
                href="#templateInformationCollapse"
                role="button"
                aria-expanded="false"
                aria-controls="templateInformationCollapse">
                How this helps
              </p>
              <div className="collapse" id="templateInformationCollapse">
                <div className="card card-body">
                  The next time you upload a file with the same format, you can skip the column selection process and have results generated instantly!
                </div>
              </div>
              </div>
          )}          
        </div>
        <form className="form-floating d-flex flex-column" style={{gap: '.75rem', width: '60%', margin: '0 auto'}}>          
          <input 
            type="text"
            className="form-control"
            id="searchName"
            placeholder="Search Name"
            onChange={handleSearchNameChange}>
          </input>
          <label htmlFor="searchName">Name Your Search</label>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleFinalizeCheckout}
            style={{opacity: (searchCheckoutModalComplete() ? '100%' : '50%')}}
            data-tooltip-id="search-checkout-modal-generate-results-tooltip"
            data-tooltip-content={searchCheckoutModalComplete() ? 'Great job!' : 'Input values must not be empty or blank.'}
            >
            Generate Results
          </button>
          <Tooltip id="search-checkout-modal-generate-results-tooltip"/>
        </form>
      </div>
    </div>
  )
}