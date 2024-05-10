"use client"
import styles from './page.module.css';
import { useState, useRef } from 'react';
import Papa from "papaparse";
import { v4 as uuidv4 } from 'uuid';

export default function MainContent() {
  const [ parsedFile, setParsedFile ] = useState(null);

  function handleFileSelection(event) {
    const selectedFile = event.target.files[0];

    Papa.parse(selectedFile, {
      header: true,
      complete: (result) => {
        setParsedFile(result.data);
      },
    })
  }
  
  return (
    <>
      <h1>Faster FastPeopleSearch</h1>
      {!parsedFile && <input type='file' accept='.csv' onChange={handleFileSelection}></input>}
      {parsedFile && <FileMatchMenu parsedFile={parsedFile} setParsedFile={setParsedFile}/>}
    </>
  )
}

function FileMatchMenu({ parsedFile, setParsedFile }) {
  const [isGeneratable, setIsGeneratable] = useState(false);
  const toggleGeneratableStateProps = { isGeneratable, setIsGeneratable };

  const [ inputTypes, setInputTypes ] = useState({
    "Primary Address": {"Address": [], "City / State": []},
    "Owner Names": {"First Owner": [], "Second Owner": []},
    "Mail Address": {"Address": [], "City / State": []},
  });

  const inputTypeProps = { inputTypes, setInputTypes };

  return (
    <>
      <h3>File Matcher</h3>
      <p>
        Thank you for uploading your file! Could you please help us
        generate your search results by helping us make sense of the
        file you uploaded?
      </p>
      <p>
        At minimum, we require a <strong>primary address</strong> (address, city, and state) to be able
        to generate results.  For best results, please provide matching
        information for the primary address, owner names, and mail
        address (if they exist).
      </p>
      <button onClick={handleGenerateResultsButtonClick} className={`btn btn-primary ${styles.generateResultsButton}`} disabled={!isGeneratable} type="button">Generate Results</button>
      <ul class="accordion" id="accordionExample">
        < AccordionItem key={1}
                        inputTypeProps={inputTypeProps}
                        itemName={"Primary Address"}
                        toggleId={"collapseOne"}
                        parsedFile={parsedFile}
                        toggleGeneratableStateProps={toggleGeneratableStateProps}
        />
        < AccordionItem key={2} 
                        inputTypeProps={inputTypeProps}
                        itemName={"Owner Names"}
                        toggleId={"collapseTwo"}
                        parsedFile={parsedFile}
                        toggleGeneratableStateProps={toggleGeneratableStateProps}
        />
        < AccordionItem key={3}
                        inputTypeProps={inputTypeProps}
                        itemName={"Mail Address"}
                        toggleId={"collapseThree"}
                        parsedFile={parsedFile}
                        toggleGeneratableStateProps={toggleGeneratableStateProps}
        />
      </ul>
    </>
  )

  function handleGenerateResultsButtonClick(event) {
    const primaryAddress = inputTypes["Primary Address"];
    const file = parsedFile;
    debugger;
    if (isGeneratable) {
      debugger;
    }
  }
}

function AccordionItem({ inputTypeProps, itemName, toggleId, parsedFile, toggleGeneratableStateProps}) {
  const [requiredHeaders, setRequiredHeaders] = useState(inputTypeProps.inputTypes[itemName]);
  const [isCompleted, setIsCompleted] = useState(false);

  const parsedFileHeaders = Object.keys(parsedFile[0]);

  const findColumnHeaderSampleValue = (columnHeader, parsedFile) => {
    const matchingRowWithValue = parsedFile.find((row) => {
      return row[columnHeader] !== '';
    });

    return matchingRowWithValue ? matchingRowWithValue[columnHeader] : 'Empty';
  };

  const sampleRow = parsedFileHeaders.map((header) => {
    return { header, value: findColumnHeaderSampleValue(header, parsedFile) };
  });

  return (
    <div className={`${styles.accordionItem} accordion-item`}>
      <h2 className="accordion-header">
        <button className="accordion-button collapsed" type="button"
          data-bs-toggle="collapse"
          data-bs-target={`#${toggleId}`}
          aria-expanded="false"
          aria-controls={toggleId}>
          {itemName}
        </button>
      </h2>
      <div id={toggleId} className={`accordion-collapse collapse`} data-bs-parent="#accordionExample">
        <div className={`${styles.inputTypeMatcherMenu} accordion-body`}>
          <ul className={`${styles.requiredHeaders} list-group`}>
            {Object.keys(requiredHeaders).map((requiredHeader, index) => {
              const uniqueKey = uuidv4();
              
              return (
                <>
                  <li key={index}
                      onClick={handleRequiredHeaderClick}
                      className={`${styles.requiredHeader} list-group-item`}
                      data-bs-toggle="modal"
                      data-bs-target={`#matcherModal${uniqueKey}`}
                  >
                    <input checked={columnsSelected(requiredHeader, requiredHeaders) ? true : false} class="form-check-input me-1" type="checkbox" value="" id={`checkbox${uniqueKey}`} />
                    <label class="form-check-label" for={`checkbox${uniqueKey}`} >{requiredHeader}</label>
                  </li>
                  <div className="modal fade" id={`matcherModal${uniqueKey}`} data-bs-backdrop="static">
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                      <div class="modal-content">
                        <div class="modal-header">
                          <h5 class="modal-title">Matching {requiredHeader}</h5>
                          <button type="button" onClick={() => handleSaveRequiredHeaderMatch(event, itemName, requiredHeaders, inputTypeProps)} className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                        <h6>Current Match: {generateCurrentMatch(requiredHeaders, requiredHeader, sampleRow)}</h6>
                          <ul onClick={handleSampleColumnClick.bind(null, requiredHeader)} className={`${styles.sampleColumns} list-group`}>
                            {sampleRow.map((column, index) => {
                              return (
                                <li onMouseOver={handleSampleColumnHover}
                                    onMouseLeave={handleSampleColumnUnHover}
                                    className={`${styles.sampleColumn} list-group-item d-flex justify-content-between align-items-start`}
                                    key={index}
                                  >
                                  <h4><strong>{column.header}</strong></h4>
                                  <p>{column.value}</p>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                        <div class="modal-footer">
                          <button type="button" onClick={(event) => handleResetRequiredHeaderMatch(requiredHeader)} class="btn btn-light">Reset</button>
                          <button type="button" onClick={(event) => handleSaveRequiredHeaderMatch(event, itemName, requiredHeaders, inputTypeProps)} data-bs-dismiss="modal" class="btn btn-primary">Save</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );

  function generateCurrentMatch(requiredHeaders, requiredHeader, sampleRow) {
    return requiredHeaders[requiredHeader].map((columnHeader) => {
      return sampleRow.find((row) => row.header === columnHeader).value;
    }).join(' ');
  }

  function columnsSelected(requiredHeader, requiredHeaders) {
    return requiredHeaders[requiredHeader].length > 0;
  }

  function checkIfCompleted(itemName) {
    if (itemName === 'Owner Names') {
      if (Object.keys(requiredHeaders).some((requiredHeader) => requiredHeaders[requiredHeader].length > 0 )) {
        setIsCompleted(true);
      }
    } else if (itemName === 'Primary Address' || itemName === 'Mail Address') {
      if (Object.keys(requiredHeaders).every((requiredHeader) => requiredHeaders[requiredHeader].length > 0)) {
        setIsCompleted(true);

        if (itemName === 'Primary Address') {
          toggleGeneratableStateProps.setIsGeneratable(true);
        }
      }
    }
  }

  function handleResetRequiredHeaderMatch(requiredHeader) {
    setRequiredHeaders({...requiredHeaders, [requiredHeader]: []});
    toggleGeneratableStateProps.setIsGeneratable(false);
  }

  function handleRequiredHeaderClick(event) {
    event.preventDefault();
  }

  function handleSaveRequiredHeaderMatch(event, itemName, requiredHeaders, inputTypeProps) {
    inputTypeProps.setInputTypes({...inputTypeProps.inputTypes, [itemName]: {...requiredHeaders}});
    checkIfCompleted(itemName);
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

  function handleSampleColumnClick(requiredHeader, event) {
    if (event.target.parentNode.tagName === 'LI' || event.target.tagName === 'LI') {
      event.preventDefault();

      const sampleColumn = event.target.closest('li');
      const [ sampleColumnHeader, sampleColumnValue ] = [...sampleColumn.children].map((child) => child.textContent);
      const requiredHeadersCopy = { ...requiredHeaders }
      requiredHeadersCopy[requiredHeader].push(sampleColumnHeader);
      
      setRequiredHeaders({ ...requiredHeaders, [requiredHeader]: requiredHeadersCopy[requiredHeader]} );
    }
  }
}