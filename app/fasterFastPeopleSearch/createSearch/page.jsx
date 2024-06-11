"use client"
import styles from './page.module.css';
import { useState, createContext, useContext, useRef, useEffect } from 'react';
import Papa from "papaparse";
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import {
  generateSampleRow,
  processFileForDatabase,
  generateHeaderSampleValue,
} from './lib/helpers.js';
import { createSearch } from '../actions/createSearch.js';
import deepCopy from '../../lib/deepCopy.js';
import { RiCheckboxBlankCircleLine } from "react-icons/ri";
import { RiCheckboxCircleFill } from "react-icons/ri";
import { useImmer } from 'use-immer';
import Image from 'next/image'

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
  
  return (
    <>
      <FileContext.Provider value={{parsedCsvFile, setParsedFile}}>
        {!parsedCsvFile && <input className={styles.fileInput} type='file' accept='.csv' onChange={handleFileSelection}></input>}
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
      headers: { "Address": [], "City": [], "State": [] },
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
      headers: { "Address": [], "City": [], "State": [] },
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
          <h3>Help Us Generate Your Search Results</h3>
          <p>
            Thank you for uploading your file! Let&#39;s make sure we get the right information
            to generate your search results. Follow the steps below to choose the correct columns
            for each category. It&#39;s easy and anyone can do it!
          </p>
        </div>
        <div className="d-flex flex-column" style={{gap: '.5rem', width: '50%', margin: '0 auto'}}>
          <button
            type="button"
            className="btn btn-primary"
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
        <li>Find and select the columns for the street address, city, & state in your file.  All are required</li>
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
        <li>Find the columns for mailing address, city, and state.  All are required</li>
      </ul>
    </>
  };

  function handleCategoryToggleButton(event) {
    const currentCategoryIndex = categories.indexOf(currentCategory);

    if (currentCategoryIndex < categories.length - 1) {
      setCurrentCategory(categories[currentCategoryIndex + 1]);
      setCurrentHeaderIndex(0);
    } else {
      setCurrentCategory(categories[currentCategoryIndex - 1]);
      setCurrentHeaderIndex(0);
    }
  }

  function handleCategoryTypeClick(index, event) {
    setCurrentCategory(categories[index]);
    setCurrentHeaderIndex(0);
  }

  async function handleGenerateResults() {
    setParsedFile(processFileForDatabase(parsedCsvFile, categories));
    setReadyForCheckout(true);
  }

  function handleHeaderClick(index, event) {
    setCurrentHeaderIndex(index);
  }

  function handleNextButtonClick() {
    const headers = Object.keys(currentCategory.headers);

    setCurrentHeaderIndex(currentHeaderIndex + 1);
  }

  function handleNextCategoryButton() {
    const currentCategoryIndex = categories.indexOf(currentCategory);
    setCurrentCategory(categories[currentCategoryIndex + 1]);
    setCurrentHeaderIndex(0);
  }

  function handlePreviousCategoryButton() {
    const currentCategoryIndex = categories.indexOf(currentCategory);

    if (currentCategoryIndex) {
      setCurrentCategory(categories[currentCategoryIndex - 1]);
      setCurrentHeaderIndex(0);
    }
  }

  function handlePreviousButtonClick() {
    setCurrentHeaderIndex(currentHeaderIndex - 1);
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
            <ul className="d-flex" style={{gap: '2rem'}}>
              {categories.map((category, index) => {
                return (
                  <li
                    className={`${styles.modalHeaderCategoryType}`}
                    key={index}
                    style={{opacity: currentCategory.type === category.type ? '100%' : '50%'}}
                    onClick={handleCategoryTypeClick.bind(null, index)}>
                    <h5>
                      {category.type}{' '}
                      <span className={`badge text-bg-${category.required ? 'success' : 'light'}`}>
                        {category.required ? ' Required' : 'Optional'}
                      </span>
                    </h5>
                  </li>
                )
              })}
            </ul>
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
                      {header}
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
          <div className="modal-footer">
            <button
              className="btn btn-outline-success"
              onClick={handlePreviousCategoryButton}
              disabled={categories.indexOf(currentCategory) === 0}
            >
              Previous Category
            </button>
            <div className="d-flex" style={{gap: '.5rem'}}>
              <button
                onClick={handlePreviousButtonClick}
                type="button"
                className="btn btn-primary"
                disabled={currentHeaderIndex === 0}         
              >
                Previous
              </button>
              <button
                onClick={handleNextButtonClick}
                type="button"
                className="btn btn-primary"
                disabled={currentHeaderIndex === Object.keys(currentCategory.headers).length - 1}
              >
                Next
              </button>
            </div>
            <button
              className="btn btn-outline-success"
              onClick={handleNextCategoryButton}
              disabled={categories.indexOf(currentCategory) === categories.length - 1}
            >
              Next Category
            </button>
          </div>
          <div>
            <button
              onClick={handleGenerateResults}
              className={`btn btn-primary ${styles.generateResultsButton}`}
              disabled={!isGeneratable}
              type="button"
            >
              Generate Results
            </button>
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
  
  const columnIsSelected = (header) => currentHeaderMatchedColumnHeaders.includes(header);
  const sampleValue = generateHeaderSampleValue(currentHeaderMatchedColumnHeaders, sampleRow);

  const matchExamples = {
    "Address": ["123 Main", "123 Main St", "123 S Main St", "123 S Main St #42"],
    "City": ["Los Angeles", "Seattle", "Rancho Palos Verdes"],
    "State": ["CA", "California", "NY", "New York"],
    "First Owner": ["Jane Doe", "Jane P Doe", "The Jane Doe Trust"],
    "Second Owner": ["John Doe", "John P Doe", "The John P Doe Trust"],
  };

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
        <div className='d-flex justify-content-around'>
          <div className="d-flex flex-column align-items-center justify-content-start" style={{width: '40%'}}>
            <h6>Examples of Accepted Values</h6>
            <ul>
              {matchExamples[Object.keys(currentCategory.headers)[currentHeaderIndex]].map((matchExample, index) => <li key={index} className="badge text-bg-light">{matchExample}</li>)}
            </ul>
          </div>
          <div className="d-flex flex-column align-items-center justify-content-start flex-wrap" style={{width: '40%'}}>
            <h6>Sample Value</h6>
            <p className="badge text-bg-light text-wrap">{sampleValue}</p>
          </div>
        </div>
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
                <span className={`badge text-bg-${columnIsSelected(columnPair.header) ? 'primary' : 'light'} rounded-pill`}>{columnIsSelected(columnPair.header) ? <RiCheckboxCircleFill/> : <RiCheckboxBlankCircleLine/>}</span>
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