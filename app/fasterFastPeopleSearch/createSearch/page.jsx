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
  resultsAreGenerateable
} from './lib/helpers.js';
import { createSearch } from '../actions/createSearch.js';
import deepCopy from '../../lib/deepCopy.js';
import { RiCheckboxBlankCircleLine } from "react-icons/ri";
import { RiCheckboxCircleFill } from "react-icons/ri";
import { useImmer } from 'use-immer';

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
  const [ isGeneratable, setIsGeneratable ] = useState(false);
  const [ categories, setCategories ] = useImmer([
    { 
      type: "Primary Address", 
      headers: { "Address": [], "City": [], "State": [] },
      required: true,
      inProgress: false,
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
      inProgress: false,
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
      inProgress: false,
      completed() {
        return Object.keys(this.headers).every((header) => {
          return this.headers[header].length > 0;
        });
      }
    }
  ]);

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
        <button
          type="button"
          className="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#categoryModal">
          Get Started
        </button>
        <FileProcessModal/>      
      </CategoriesContext.Provider>
    </SearchStatusContext.Provider>
  );
}

function FileProcessModal() {
  const { categories } = useContext(CategoriesContext);
  const [ currentPage, setCurrentPage ] = useState(0);
  const maxPage = categories.length - 1;
  const [ currentHeader, setCurrentHeader ] = useState(null);
  const currentCategory = categories[currentPage];

  const stepInstructions = [
    <>
      <h4>Step 1: Select Primary Address (Required)</h4>
      <ul>
        <li>Find and select the columns for the street address, city, & state in your file.  All are required</li>
      </ul>
    </>,
    <>
      <h4>Step 2: Select Owner Name(s) (Optional)</h4>
      <ul>
        <li>Find the columns for at least one owner&#39;s first and last name.  Only one is required</li>
      </ul>
    </>,
    <>
      <h4>Step 3: Select Mail Address (Optional)</h4>
      <ul>
        <li>Find the columns for mailing address, city, and state.  All are required</li>
      </ul>
    </>
  ];
  const navTabsRef = useRef(null);
  const { isGeneratable } = useContext(SearchStatusContext);

  async function handleGenerateResults() {
    if (isGeneratable) {
      const processedFile = processFileForDatabase(parsedCsvFile, categories);
      const searchData = await createSearch(JSON.stringify(processedFile));
      const searchId = searchData.id;
      router.push(`/fasterFastPeopleSearch/searches/${searchId}`);
    }
  }

  function handleHeaderClick(event) {
    const navItem = event.currentTarget;
    const clickedHeader = navItem.querySelector('a.nav-link');
    [...navTabsRef.current.querySelectorAll('a.nav-link')].forEach((navLink) => navLink.classList.remove('active'));
    clickedHeader.classList.add('active');

    setCurrentHeader(clickedHeader.textContent);
  }

  function handleNextButtonClick() {
    setCurrentHeader(null);
    setCurrentPage(currentPage + 1);
  }

  function handlePreviousButtonClick() {
    setCurrentHeader(null);
    setCurrentPage(currentPage - 1)
  }

  return (
    <div
      className={`${styles.headerMatcherModal} modal fade`}
      id="categoryModal" 
      aria-labelledby="categoryModalLabel"
      aria-hidden="true">
        <div className={`${styles.modalDialog} modal-dialog modal-fullscreen modal-dialog-scrollable`}>
          <div className={`${styles.modalContent} modal-content`}>
            <div className="modal-header">
              <h5>{categories[currentPage].type} <span className="badge text-bg-info">{categories[currentPage].required ? ' Required' : 'Optional'}</span></h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {stepInstructions[currentPage]}
              <ul className="nav nav-tabs" ref={navTabsRef}>
                {Object.keys(currentCategory.headers).map((header, index) => {
                  const navLinkCollapseMenuId = `${currentCategory.type}-${header}-collapse`.replace(/ /g, '-').toLowerCase();
                  
                  return (
                    <li key={`${currentCategory.type}-${header}`} className={`nav-item`} onClick={handleHeaderClick}>
                      <a 
                        className={`nav-link${currentHeader === header ? ` active` : ''}`}
                        aria-current="page" 
                        data-bs-toggle="collapse"
                        href={`#${navLinkCollapseMenuId}`}
                        role="button"
                        aria-expanded="false"
                        aria-controls={navLinkCollapseMenuId}>
                        {header}
                      </a>
                    </li>
                  )
                })}
              </ul>
              {currentHeader && <ColumnSelectorDropdown currentHeader={currentHeader} currentPage={currentPage}/>}
            </div>
            <div className="modal-footer">
              <button onClick={handlePreviousButtonClick} type="button" className="btn btn-primary" disabled={currentPage === 0}>Previous</button>
              <button onClick={handleNextButtonClick} type="button" className="btn btn-primary" disabled={currentPage === maxPage}>Next</button>
            </div>
            <button onClick={handleGenerateResults}
                    className={`btn btn-primary ${styles.generateResultsButton}`}
                    disabled={!isGeneratable}
                    type="button">
              Generate Results
            </button>
          </div>
        </div>
    </div>
  )
}

function ColumnSelectorDropdown({ currentHeader, currentPage }) {
  const { parsedCsvFile } = useContext(FileContext);
  const { categories, setCategories } = useContext(CategoriesContext);
  const currentCategory = categories[currentPage];
  const sampleRow = generateSampleRow(parsedCsvFile);
  const currentHeaderMatchedColumnHeaders = currentCategory.headers[currentHeader];
  const columnIsSelected = (header) => currentHeaderMatchedColumnHeaders.includes(header);
  const sampleValue = generateHeaderSampleValue(currentHeaderMatchedColumnHeaders, sampleRow);

  const matchExamples = {
    "Address": ["123 Main", "123 Main St", "123 S Main St", "123 S Main St #42"],
    "City": ["Los Angeles", "Seattle", "Rancho Palos Verdes"],
    "State": ["CA", "California", "NY", "New York"],
    "First Owner": ["Jane Doe", "Jane P Doe", "The Jane Doe Trust"],
    "Second Owner": ["John Doe", "John P Doe", "The John P Doe Trust"],
  };

  useEffect(() => {

  }, []);

  function handleResetSelectedColumns(event) {
    event.preventDefault();
    event.stopPropagation();

    setCategories((draft) => {
      // draft === categories
      draft[currentPage].headers[currentHeader] = [];
    });
  }

  function handleSampleColumnClick(event) {
    // Make a copy of the currentCategory headers object and add the selected
    // column header to the corresponding array
    const headersCopy = JSON.parse(JSON.stringify(currentCategory.headers));
    const selectedHeader = event.currentTarget.querySelector('h6').textContent;
    
    if (columnIsSelected(selectedHeader)) {
      // if the header is already selected, remove it
      const headerIndex = headersCopy[currentHeader].findIndex((header) => header === selectedHeader);
      headersCopy[currentHeader].splice(headerIndex, 1);
    } else {
      headersCopy[currentHeader].push(selectedHeader);
    }

    // Make a copy of the currentCategory object and the categories object
    const currentCategoryCopy = {...deepCopy(currentCategory), headers: headersCopy};
    const categoriesCopy = categories.map((category) => deepCopy(category));

    // Replace the current version of currentCategory in categories with
    // the updated copy
    categoriesCopy[currentPage] = currentCategoryCopy;
    
    setCategories(categoriesCopy);
    
  }

  return (
    <>
      <div>
        <p className="badge text-bg-info">Examples of Accepted Values</p>
        <ul>
          {matchExamples[currentHeader].map((matchExample, index) => <li key={index} className="badge text-bg-light">{matchExample}</li>)}
        </ul>
       {currentHeaderMatchedColumnHeaders.length > 0 && <div>
          <div className="d-flex flex-row justify-content-around align-items-center">
            <div className="d-flex flex-column align-items-center">
              <p className="badge text-bg-info">Selected Columns:</p>
              <ul className="d-flex justify-content-start">
                {currentHeaderMatchedColumnHeaders.map((column, index) => {
                  return (
                  <li key={index} className="badge text-bg-light">
                    {column}
                  </li>);
                })}
              </ul>
            </div>
            <div className="d-flex flex-column align-items-center justify-content-center">
              <p className="badge text-bg-info">Sample Value:</p>
              <p className="badge text-bg-light">{sampleValue}</p>
            </div>
          </div>
          <button type="button" className="btn btn-light" onClick={handleResetSelectedColumns}>Reset</button>
        </div>}
        <ul className={`list-group ${styles.sampleRowContainer}`}>
          {sampleRow.map((columnPair, index) => {
            return (
              <li
                className={`list-group-item d-flex justify-content-between align-items-start ${styles.sampleColumnLi}`}
                key={index}
                onClick={handleSampleColumnClick}>
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


function RequiredHeaderModal({ requiredHeader, matchedColumnHeaderKey, uniqueId }) {
  const { parsedCsvFile } = useContext(FileContext);
  const setIsGeneratable = useContext(SearchStatusContext);
  const matchedColumnHeaderContext = useContext(MatchedColumnHeadersContext);
  const sampleRow = generateSampleRow(parsedCsvFile);
  const requiredHeaderSampleValue = generateRequiredHeaderSampleValue(matchedColumnHeaderContext.matchedColumnHeaders[matchedColumnHeaderKey][requiredHeader], sampleRow)
  const matchExamples = {
    "Address": ["123 Main", "123 Main St", "123 S Main St", "123 S Main St #42"],
    "City / State": ["Los Angeles, CA"],
    "First Owner": ["Jane Doe", "Jane P Doe", "The Jane Doe Trust"],
    "Second Owner": ["John Doe", "John P Doe", "The John P Doe Trust"],
  };

  function handleResetMatchedColumnHeaders(requiredHeader, matchedColumnHeaderKey, matchedColumnHeaderContext, event) {
    event.preventDefault();

    const { matchedColumnHeaders, setMatchedColumnHeaders} = { ...matchedColumnHeaderContext };
    setMatchedColumnHeaders({...matchedColumnHeaders, [matchedColumnHeaderKey]: {...matchedColumnHeaders[matchedColumnHeaderKey], [requiredHeader]: []}});
    if (matchedColumnHeaderKey === 'Primary Address') setIsGeneratable(false);
  }

  function handleSampleColumnClick(requiredHeader, matchedColumnHeaderKey, matchedColumnHeaderContext, event) {
    const isSampleColumn = event.target.closest('li').classList.contains('sample-column')

    if (isSampleColumn) {
      event.preventDefault();

      const { matchedColumnHeaders, setMatchedColumnHeaders} = { ...matchedColumnHeaderContext };
      const matchedColumnHeaderKeyMatchedColumns = [...matchedColumnHeaders[matchedColumnHeaderKey][requiredHeader]];
      const sampleColumn = event.target.closest('li');
      const [ sampleColumnHeader, sampleColumnValue ] = [...sampleColumn.children].map((child) => child.textContent);
      matchedColumnHeaderKeyMatchedColumns.push(sampleColumnHeader);
      
      setMatchedColumnHeaders({...matchedColumnHeaders, [matchedColumnHeaderKey]: {...matchedColumnHeaders[matchedColumnHeaderKey], [requiredHeader]: matchedColumnHeaderKeyMatchedColumns}});
    }
  }

  function handleSampleColumnHover(event) {
    const sampleColumn = event.currentTarget;

    sampleColumn.classList.add('active');
    sampleColumn.style.cursor = 'pointer';
  }

  function handleSampleColumnUnHover(event) {
    const sampleColumn = event.currentTarget;

    sampleColumn.classList.remove('active');
    sampleColumn.style.cursor = 'default';
  }

  function handleSaveMatchedColumnHeaders(requiredHeader, matchedColumnHeaderKey, matchedColumnHeaderContext) {
    const requiredHeaderInput = [...document.querySelectorAll(`.accordion-body .form-check-input`)].filter((requiredHeaderInput) => {
      return requiredHeaderInput.nextElementSibling.textContent === requiredHeader;
    }).find((requiredHeaderInput) => {
      const accordionHeaderText = requiredHeaderInput.closest('li.accordion-item').querySelector('h2.accordion-header')?.textContent;
      return matchedColumnHeaderKey === accordionHeaderText;
    });

    const requiredHeaderColumnsMatched = matchedColumnHeaderContext.matchedColumnHeaders[matchedColumnHeaderKey][requiredHeader].length > 0;
    requiredHeaderInput.checked = requiredHeaderColumnsMatched ? true : false;

    setIsGeneratable(resultsAreGenerateable(matchedColumnHeaderContext) ? true : false)
  }

  return (
    <div className="modal fade" data-bs-backdrop="static" id={uniqueId} aria-hidden="true">
      <div className="modal-dialog modal-fullscreen modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
              <h5 className="modal-title">Matching {requiredHeader}</h5>
              <button onClick={handleSaveMatchedColumnHeaders.bind(null, requiredHeader, matchedColumnHeaderKey, matchedColumnHeaderContext)} type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className={`${styles.matchExamplesContainer}`}>
                <h6>Here are examples of what we&#39;re looking for:</h6>
                <ul className={`${styles.matchExampleList}`}>
                  {matchExamples[requiredHeader].map((matchExample, index) => {
                    return <li key={index} className="badge text-bg-info">{matchExample}</li>
                  })}
                </ul>
              </div>
              <h6>Current Match: {requiredHeaderSampleValue}</h6>
              <ul className={`${styles.sampleColumns} list-group`} onClick={handleSampleColumnClick.bind(null, requiredHeader, matchedColumnHeaderKey, matchedColumnHeaderContext)}>
                {sampleRow.map((column, index) => (
                  <li
                      onMouseOver={handleSampleColumnHover}
                      onMouseLeave={handleSampleColumnUnHover}
                      className={`${styles.sampleColumn} list-group-item sample-column`}
                      key={index}
                    >
                    <h4><strong>{column.header}</strong></h4>
                    <p>{column.value}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="modal-footer">
              <button onClick={handleResetMatchedColumnHeaders.bind(null, requiredHeader, matchedColumnHeaderKey, matchedColumnHeaderContext)} type="button"  className="btn btn-light">Reset</button>
              <button onClick={handleSaveMatchedColumnHeaders.bind(null, requiredHeader, matchedColumnHeaderKey, matchedColumnHeaderContext)} type="button" data-bs-dismiss="modal" className="btn btn-primary">Save</button>
            </div>
          </div>
      </div>
    </div>
  )
}