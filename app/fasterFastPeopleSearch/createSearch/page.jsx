"use client"
import styles from './page.module.css';
import { useState, createContext, useContext } from 'react';
import Papa from "papaparse";
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import {
  generateSampleRow,
  generateRequiredHeaderSampleValue,
  processFileForDatabase,
  resultsAreGenerateable
} from './lib/helpers.js';
import { createSearch } from '../actions/createSearch.js';


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
        {parsedCsvFile && <FileMatchMenu parsedCsvFile={parsedCsvFile} setParsedFile={setParsedFile}/>}
      </FileContext.Provider>
    </>
  );
}

const SetIsGeneratableContext = createContext();
const MatchedColumnHeadersContext = createContext();

function FileMatchMenu() {
  const { parsedCsvFile } = useContext(FileContext);
  const [ isGeneratable, setIsGeneratable ] = useState(false);
  const router = useRouter();

  const [ matchedColumnHeaders, setMatchedColumnHeaders ] = useState({
    "Primary Address": {"Address": [], "City / State": []},
    "Owner Names": {"First Owner": [], "Second Owner": []},
    "Mail Address": {"Address": [], "City / State": []},
  });

  const matchedColumnHeadersKeys = Object.keys(matchedColumnHeaders);

  async function handleGenerateResults() {
    if (isGeneratable) {
      const processedFile = processFileForDatabase(parsedCsvFile, matchedColumnHeaders);
      
      const searchData = await createSearch(JSON.stringify(processedFile));
      const searchId = searchData.id;
      router.push(`/fasterFastPeopleSearch/searches/${searchId}`);
    }
  }

  return (
    <SetIsGeneratableContext.Provider value={setIsGeneratable}>
      <MatchedColumnHeadersContext.Provider value={{ matchedColumnHeaders, setMatchedColumnHeaders }}>
        <div className={`${styles.fileMatchMenuInstructionsContainer}`}>
          <h3>Help Us Generate Your Search Results</h3>
          <p>
          Thank you for uploading your file! Let&#39;s make sure we get the right information 
          to generate your search results. Follow the steps below to choose the correct columns 
          for each category. It&#39;s easy and anyone can do it!
          </p>
          <p>
            For any item you select below, you will be asked to choose the column headers for 
            each category of the item that can be used to re-create the required field.  For example,
            in the Primary Address item, you will be asked to choose the columns which can ultimately
            re-create an Address and a City / State.
          </p>
          <InstructionSteps />
        </div>
        <div>
          <ul className="accordion" id="accordionMenu">
            {matchedColumnHeadersKeys.map((matchedColumnHeaderKey, index) => {
              const requiredHeaders = Object.keys(matchedColumnHeaders[matchedColumnHeaderKey]);
              return (
                <li key={index} className="accordion-item">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed" 
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target={`#accordion-item-${index}`}
                            aria-expanded="false"
                            aria-controls={`accordion-item-${index}`}
                    >
                      {matchedColumnHeaderKey}
                    </button>
                  </h2>
                  <AccordionBody toggleId={index} requiredHeaders={requiredHeaders} matchedColumnHeaderKey={matchedColumnHeaderKey}/>
                </li>
              );
            })}
          </ul>
        </div>
        <button onClick={handleGenerateResults}
                className={`btn btn-primary ${styles.generateResultsButton}`}
                disabled={!isGeneratable}
                type="button">
                Generate Results
        </button>
      </MatchedColumnHeadersContext.Provider>
    </SetIsGeneratableContext.Provider>
  );
}

function AccordionBody({ toggleId, requiredHeaders, matchedColumnHeaderKey }) {
  return (
    <div id={`accordion-item-${toggleId}`} className="accordion-collapse collapse" data-bs-parent="#accordionMenu">
      <div className="accordion-body">
        <ul className={`${styles.requiredHeaders} list-group`}>
          {requiredHeaders.map((requiredHeader, index) => {
            const uniqueId = uuidv4();
            
            return (
              <li key={index}>
                <RequiredHeader requiredHeader={requiredHeader} uniqueId={uniqueId}/>
                <RequiredHeaderModal requiredHeader={requiredHeader} matchedColumnHeaderKey={matchedColumnHeaderKey} uniqueId={uniqueId}/>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function RequiredHeader({ requiredHeader, uniqueId }) {
  function handleRequiredHeaderClick(event) {
    event.preventDefault();
  }

  return (
    <div
        onClick={handleRequiredHeaderClick}
        className={`${styles.requiredHeader} list-group-item`}
        data-bs-toggle="modal"
        data-bs-target={`#${uniqueId}`}
    >
      <input className="form-check-input" type="checkbox" value=""/>
      <label className="form-check-label">{requiredHeader}</label>
    </div>
  );
}

function RequiredHeaderModal({ requiredHeader, matchedColumnHeaderKey, uniqueId }) {
  const { parsedCsvFile } = useContext(FileContext);
  const setIsGeneratable = useContext(SetIsGeneratableContext);
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
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
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

function InstructionSteps() {
  const [ stepPage, setStepPage ] = useState(0);

  const stepsHtmlFragments = [
    <>
      <h4>Step 1: Select Primary Address (Required)</h4>
      <ul>
        <li>Find and select the columns for the street address & city/state in your file</li>
      </ul>
    </>,
    <>
      <h4>Step 2: Select Owner Name(s) (Optional)</h4>
      <ul>
        <li>Find the columns for the owner&#39;s first and last name.</li>
      </ul>
    </>,
    <>
      <h4>Step 3: Select Mail Address (Optional)</h4>
      <ul>
        <li>Find the columns for mailing address, city, and state.</li>
      </ul>
    </>
  ]

  function handleNextStepClick() {
    setStepPage(stepPage + 1)
  }

  function handlePreviousStepClick() {
    setStepPage(stepPage - 1);
  }

  return (
    <div className={styles.instructionSteps}>
      <InstructionStep stepPage={stepPage}/>
      <div>
        <button className="btn btn-primary" type="button" disabled={stepPage === 0} onClick={handlePreviousStepClick}>Previous</button>
        <button className="btn btn-primary" type="button" disabled = {stepPage === stepsHtmlFragments.length - 1} onClick={handleNextStepClick}>Next</button>
      </div>
    </div>
  )
}

function InstructionStep({ stepPage }) {
  if (stepPage === 0) {
    return (
      <>
        <h4>Step 1: Select Primary Address (Required)</h4>
        <ul>
          <li>Find and select the columns for the street address & city/state in your file</li>
        </ul>
      </>
    )
  } else if (stepPage === 1) {
    return (
      <>
        <h4>Step 2: Select Owner Name(s) (Optional)</h4>
        <ul>
          <li>Find the columns for the owner&#39;s first and last name.</li>
        </ul>
      </>
    );
  } else if (stepPage === 2) {
    return (
      <>
        <h4>Step 3: Select Mail Address (Optional)</h4>
        <ul>
          <li>Find the columns for mailing address, city, and state.</li>
        </ul>
      </>
    );
  }
}