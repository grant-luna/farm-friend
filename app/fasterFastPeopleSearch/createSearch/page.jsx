"use client"
import styles from './page.module.css';
import { useState, createContext, useContext, useRef, useEffect } from 'react';
import Papa from "papaparse";
import { useRouter } from 'next/navigation';
import {
  checkIfHeaderIsCurrentHeader,
  columnIsSelected,
  generateHeaderSampleValue,
  generateTooltipMessage,
  generateSampleRow,
  processFileForDatabase,
} from './lib/helpers.js';
import { createSearch } from '../actions/createSearch.js';
import deepCopy from '../../lib/deepCopy.js';
import { RiCheckboxBlankCircleLine } from "react-icons/ri";
import { RiCheckboxCircleFill } from "react-icons/ri";
import { useImmer } from 'use-immer';
import Image from 'next/image'
import { Tooltip } from 'react-tooltip';

const FileContext = createContext();

export default function MainContent() {
  const [ parsedCsvFile, setParsedFile ] = useState(null);
  

  function handleFileSelection(event) {
    const selectedFile = event.target.files[0];

    Papa.parse(selectedFile, {
      header: true,
      complete: (result) => {
        setParsedFile(result.data);
      },
    });
  }

  const introductionText = (
    <div className="d-flex flex-column align-items-center" style={{margin: '0 auto', padding: '3rem'}}>      
      <div
        className="d-flex justify-content-center align-items-center"
        style={{gap: '.5rem'}}>        
        <h2>Upload a File</h2>
      </div>         
      <Image 
        src="/computer-waiting-for-file.png"
        alt="A computer eagerly awaiting a file to be uploaded by the user."
        width={300}
        height={300}        
      />
      <p style={{width: '50%', margin: '0 auto'}}>
        Upload a file to start organizing your information to help us generate free contact
        information for you.  You'll select the required column headers from your file which we'll
        use to generate results for you.
      </p>
      <input className={styles.fileInput} type='file' accept='.csv' onChange={handleFileSelection}></input>
    </div>
  )
  
  return (
    <>
      <FileContext.Provider value={{parsedCsvFile, setParsedFile}}>
        {!parsedCsvFile && introductionText}
        {parsedCsvFile && <FileProcessMenu/>}
      </FileContext.Provider>
    </>
  );
}

const SearchStatusContext = createContext();
const CategoriesContext = createContext();

function FileProcessMenu() {
  const { setParsedFile } = useContext(FileContext);
  const [ isGeneratable, setIsGeneratable ] = useState(false);
  const [ categories, setCategories ] = useImmer([
    { 
      type: "Primary Address", 
      headers: { "Street Address": [], "City": [], "State": [] },
      required: true,
      inProgress() {
        return Object.keys(this.headers).some((header) => {
          return this.headers[header].length > 0;
        });
      },
      completed() {
        return Object.keys(this.headers).every((header) => {
          return this.headers[header].length > 0;
        });
      }
    },
    { 
      type: "Owner Names",
      headers: { "First Owner": [], "Second Owner": [] },
      required: false,
      inProgress() {
        return Object.keys(this.headers).some((header) => {
          return this.headers[header].length > 0;
        });
      },
      completed() {
        return Object.keys(this.headers).some((header) => {
          return this.headers[header].length > 0
        });
      }
    },
    { 
      type: "Mail Address",
      headers: { "Street Address": [], "City": [], "State": [] },
      required: false,
      inProgress() {
        return Object.keys(this.headers).some((header) => {
          return this.headers[header].length > 0;
        });
      },
      completed() {
        return Object.keys(this.headers).every((header) => {
          return this.headers[header].length > 0;
        });
      }
    }
  ]);

  function handleResetParsedFile() {
    setParsedFile(null);
  }

  return (
    <SearchStatusContext.Provider value={{ isGeneratable, setIsGeneratable}}>
      <CategoriesContext.Provider value={{ categories, setCategories }}>        
        <div className={styles.fileMatchMenuInstructionsContainer}>
          <Image 
            src="/file-upload-success.png"
            alt="A person jumping for joy after successfully uploading an image"
            width={300}
            height={300}
          />
          <h3>Nice work!</h3>
          <p>
            Let&#39;s make sure we get the right information
            to generate your search results. Follow the steps below to choose the correct columns
            for each category
          </p>
        </div>
        <div className="d-flex flex-column" style={{gap: '.5rem', width: '50%', margin: '0 auto'}}>
          <button
            type="button"
            className="btn btn-success"
            data-bs-toggle="modal"
            data-bs-target="#categoryModal">
            Finalize Search Results
          </button>
          <button
            type="button"
            className="btn btn-light"
            onClick={handleResetParsedFile}>
            Reset
          </button>
        </div>
        <FileProcessModal/>      
      </CategoriesContext.Provider>
    </SearchStatusContext.Provider>
  );
}

function FileProcessModal() {
  const { categories } = useContext(CategoriesContext);
  const { isGeneratable, setIsGeneratable } = useContext(SearchStatusContext);
  const { parsedCsvFile, setParsedFile } = useContext(FileContext);

  const [ currentCategory, setCurrentCategory ] = useState(categories[0]);
  const [ currentHeaderIndex, setCurrentHeaderIndex ] = useState(0);
  const [ readyForCheckout, setReadyForCheckout ] = useState(false);
  
  const navTabsRef = useRef(null);
  
  const stepInstructions = {
    "Primary Address": <>
      <h4>Step 1: Select Primary Address (Required)</h4>
      <ul>
        <li>Find and select the columns for the street street address, city, & state in your file.  All are required</li>
      </ul>
    </>,
    "Owner Names":  <>
      <h4>Step 2: Select Owner Name(s) (Optional)</h4>
      <ul>
        <li>Find the columns for at least one owner&#39;s first and last name.  Only one is required</li>
      </ul>
    </>,
    "Mail Address": <>
      <h4>Step 3: Select Mail Address (Optional)</h4>
      <ul>
        <li>Find the columns for mailing street address, city, and state.  All are required</li>
      </ul>
    </>
  };

  async function handleGenerateResults() {
    if (isGeneratable) {
      setParsedFile(processFileForDatabase(parsedCsvFile, categories));
      setReadyForCheckout(true);
    }
  }

  function handleHeaderClick(index, event) {
    setCurrentHeaderIndex(index);
  }

  function handleNextButtonClick() {        
    setCurrentHeaderIndex(currentHeaderIndex + 1);       
  }

  function handleNextCategoryButton() {
    const requiredCategories = categories.filter((category) => category.required);    
    const checkIfCurrentCategoryIsRequiredAndIncomplete = currentCategory.required && !currentCategory.completed();
    const currentCategoryIsRequiredAndIncomplete = checkIfCurrentCategoryIsRequiredAndIncomplete;
    
    if (!currentCategoryIsRequiredAndIncomplete) {
      const currentCategoryIndex = categories.indexOf(currentCategory);
      setCurrentCategory(categories[currentCategoryIndex + 1]);
      setCurrentHeaderIndex(0);
    };              
  }

  function handlePreviousCategoryButton() {
    const currentCategoryIndex = categories.indexOf(currentCategory);

    if (currentCategoryIndex) {
      setCurrentCategory(categories[currentCategoryIndex - 1]);
      setCurrentHeaderIndex(0);
    }
  }

  useEffect(() => {
    const incompleteRequiredCategories = () => {  
      const inProgressRequiredCategories = categories.filter((category) => category.required);
      return inProgressRequiredCategories.length > 0 && inProgressRequiredCategories.some((inProgressRequiredCategory) => !inProgressRequiredCategory.completed());
    }

    const allInProgressCategoriesCompleted = () => {
      const inProgressCategories = categories.filter((category) => category.inProgress());
      return inProgressCategories.every((category) => category.completed());
    };

    const inProgressRequiredCategories = categories.filter((category) => category.required && category.inProgress());
    if (inProgressRequiredCategories.length > 0) {    
      if (isGeneratable && incompleteRequiredCategories()) {        
        setIsGeneratable(false);
      } else {
        setIsGeneratable(allInProgressCategoriesCompleted());
      }
    }    
  }, [categories]);

  return (
    <div
      className={`${styles.headerMatcherModal} modal fade`}
      id="categoryModal"
      aria-labelledby="categoryModalLabel"
      aria-hidden="true"
    >
      <div
        className={`${styles.modalDialog} modal-dialog modal-fullscreen modal-dialog-scrollable`}
        style={{ top: '5%', width: '80%', height: '80%', margin: '0 auto'}}
      >
        {readyForCheckout && <SearchCheckoutModal /> || 
        <div className={`${styles.modalContent} modal-content`}>
          <div className="modal-header">
            <h5>
              {currentCategory.type}{' '}
              <span className={`badge text-bg-${currentCategory.required ? 'success' : 'light'}`}>
                {currentCategory.required ? ' Required' : 'Optional'}
              </span>
            </h5>            
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            {stepInstructions[currentCategory.type]}
            <ul className="nav nav-tabs" ref={navTabsRef}>
              {Object.keys(currentCategory.headers).map((header, index) => {
                const navLinkCollapseMenuId = `${currentCategory.type}-${header}-collapse`
                  .replace(/ /g, '-')
                  .toLowerCase();
  
                return (
                  <li
                    key={`${currentCategory.type}-${header}`}
                    className="nav-item"
                    onClick={handleHeaderClick.bind(null, index)}                    
                  >
                    <a
                      className={`nav-link${Object.keys(currentCategory.headers)[currentHeaderIndex] === header ? ' active' : ''}`}
                      aria-current="page"
                      data-bs-toggle="collapse"
                      href={`#${navLinkCollapseMenuId}`}
                      role="button"
                      aria-expanded="false"
                      aria-controls={navLinkCollapseMenuId}
                    >
                      {header} <small className={`badge ${currentCategory.headers[header].length > 0 ? 'text-bg-success' : 'text-bg-light'}`}>{currentCategory.headers[header].length > 0 ? <RiCheckboxCircleFill /> : <RiCheckboxBlankCircleLine />}</small>
                    </a>                    
                  </li>
                );
              })}
            </ul>
            <ColumnSelectorDropdown
              currentCategory={currentCategory}
              setCurrentCategory={setCurrentCategory}
              currentHeaderIndex={currentHeaderIndex}
            />
          </div>
          <div className="modal-footer d-flex flex-column justify-content-center">           
            <div className="d-flex justify-content-between align-items-center" style={{width: '100%'}}>
              <button
                className="btn btn-outline-success"
                onClick={handlePreviousCategoryButton}
                disabled={categories.indexOf(currentCategory) === 0}
              >
                Previous Category
              </button>
              <div className="d-flex justify-content-center" style={{gap: '.25rem'}}>
                <button
                  className="btn btn-outline-success"
                  onClick={handleNextCategoryButton}
                  data-tooltip-id="next-category-tooltip"
                  data-tooltip-content="Hello there"
                  disabled={categories.indexOf(currentCategory) === categories.length - 1}
                >
                  {`Next Category `} 
                  <span className="badge text-bg-success">
                    Recommended
                  </span>
                </button>
                <Tooltip id="next-category-tooltip"/>                
                <button
                  onClick={handleGenerateResults}
                  className={`btn btn-info`}              
                  type="button"            
                  data-tooltip-id="generate-results-tooltip"
                  data-tooltip-content={isGeneratable ? 'Great job!' : generateTooltipMessage(categories)}
                  style={{opacity: isGeneratable ? '100%' : '50%'}}
                >
                  Generate Results
                </button>    
                <Tooltip id="generate-results-tooltip" type={isGeneratable ? 'success' : 'error'}/>
              </div>
            </div>
          </div>         
        </div>}
      </div>
    </div>
  );
}

function ColumnSelectorDropdown({ currentCategory, setCurrentCategory, currentHeaderIndex }) {
  const { parsedCsvFile } = useContext(FileContext);
  const { categories, setCategories } = useContext(CategoriesContext);

  const sampleRow = generateSampleRow(parsedCsvFile);
  const currentHeaderMatchedColumnHeaders = currentCategory.headers[Object.keys(currentCategory.headers)[currentHeaderIndex]];    

  function handleResetSelectedColumns(event) {
    event.preventDefault();
    event.stopPropagation();

    const currentHeader = Object.keys(currentCategory.headers)[currentHeaderIndex];
    const headersCopy = { ...deepCopy(currentCategory.headers) };
    headersCopy[currentHeader] = [];

    const currentCategoryCopy = { ...currentCategory, headers: headersCopy };
    const categoriesCopy = categories.map((category) => {
      return category.type === currentCategoryCopy.type ? currentCategoryCopy : category;
    });
    
    setCurrentCategory(currentCategoryCopy);
    setCategories(categoriesCopy);
  }

  function handleSampleColumnClick(columnPair, event) {
    const currentHeader = Object.keys(currentCategory.headers)[currentHeaderIndex];
    const headersCopy = { ...deepCopy(currentCategory.headers) };
    
    if (!headersCopy[currentHeader].includes(columnPair.header)) {
      headersCopy[currentHeader].push(columnPair.header);
    } else {
      const selectedHeaderIndex = headersCopy[currentHeader].indexOf(columnPair.header);
      headersCopy[currentHeader].splice(selectedHeaderIndex, 1);
    }

    const currentCategoryCopy = { ...currentCategory, headers: headersCopy };

    const categoriesCopy = categories.map((category) => {
      return category.type === currentCategoryCopy.type ? currentCategoryCopy : category;
    });
    
    setCurrentCategory(currentCategoryCopy);
    setCategories(categoriesCopy);
  }

  return (
    <>
      <div className="d-flex flex-column"style={{padding: '.5rem', gap: '.5rem'}}>
        <ul className='d-flex justify-content-around'>          
          {Object.keys(currentCategory.headers).map((header, index) => {          
            const sampleValue = generateHeaderSampleValue(currentCategory.headers[header], sampleRow);
            return (
              <li
                key={index}
                className="d-flex flex-column align-items-center justify-content-start"
                style={{width: '25%'}}>
                <h4 className={`badge text-bg-${checkIfHeaderIsCurrentHeader(currentHeaderIndex, currentCategory, header) ? 'info' : 'light'}`}>{header}</h4>
                <p>{sampleValue}</p>
              </li>
            )
          })}
        </ul>
        <button type="button" className="btn btn-light" onClick={handleResetSelectedColumns}>Reset</button>
        <ul className={`list-group ${styles.sampleRowContainer}`}>
          {sampleRow.map((columnPair, index) => {
            return (
              <li
                className={`list-group-item d-flex justify-content-between align-items-start ${styles.sampleColumnLi}`}
                key={index}
                onClick={handleSampleColumnClick.bind(null, columnPair)}>
                <div>
                <div className="d-flex flex-column justify-content-start align-items-start">
                  <h6><strong>{columnPair.header}</strong></h6>
                  <p>{columnPair.value}</p>
                </div>
                </div>
                <span className={`badge text-bg-${columnIsSelected(columnPair.header, currentHeaderMatchedColumnHeaders) ? 'primary' : 'light'} rounded-pill`}>{columnIsSelected(columnPair.header, currentHeaderMatchedColumnHeaders) ? <RiCheckboxCircleFill/> : <RiCheckboxBlankCircleLine/>}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </>
  )
}

function SearchCheckoutModal() {
  const { parsedCsvFile } = useContext(FileContext);
  const [ buttonIsDisabled, setButtonIsDisabled ] = useState(true);
  const router = useRouter();

  const [ checkoutObject, setCheckoutObject ] = useImmer({
    data: JSON.stringify(parsedCsvFile),
    searchName: '',
  });

  async function handleFinalizeCheckout() {
    try {
      const newSearch = await createSearch(JSON.stringify(checkoutObject));
      const closeModalButton = document.querySelector('#closeSearchCheckoutButton');
      closeModalButton.click();
      router.push(`/fasterFastPeopleSearch/searches/${newSearch.id}`);
    } catch (error) {
      // display createSearch error
    }
  }

  function handleSearchNameChange(event) {
    const searchNameInput = event.currentTarget;
    
    setCheckoutObject((draft) => {
      draft.searchName = searchNameInput.value;
    });
  }

  useEffect(() => {
    setTimeout(() => {
      setButtonIsDisabled(false);
    }, 4000)
  }, [])
  
  return (
    <div className={`modal-content`}>
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
      <div className="modal-body d-flex flex-column justify-content-around">
        <div className="d-flex justify-content-center align-items-center">
          <Image src="/farm-friend-logo.png" alt="Farm Friend Logo" width={200} height={200}></Image>
        </div>
        <div>
          <h5>Finalizing Your Results</h5>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
        <form className="form-floating d-flex flex-column" style={{gap: '.75rem', width: '60%', margin: '0 auto'}}>
          <input 
            type="text"
            className="form-control"
            id="searchName"
            placeholder={``}
            onChange={handleSearchNameChange}>
          </input>
          <label htmlFor="searchName">Want to Name Your Search? Type Here</label>
          <button
            type="button"
            className="btn btn-primary"
            disabled={buttonIsDisabled}
            onClick={handleFinalizeCheckout}>
            See Results
          </button>
        </form>
      </div>
    </div>
  )
}