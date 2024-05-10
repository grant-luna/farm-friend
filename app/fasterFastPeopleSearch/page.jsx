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
  const [ inputTypes, setInputTypes ] = useState([
    { type: 'Primary Address', address: [], cityState: [], completable: false },
    { type: 'Owner Names', firstOwner: [], secondOwner: [], completable: false },
    { type: 'Mail Address', address: [], cityState: [], completable: false }
  ]);

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
      <ul class="accordion" id="accordionExample">
        < AccordionItem key={uuidv4()} itemName={"Primary Address"} toggleId={"collapseOne"} parsedFile={parsedFile} />
        < AccordionItem key={uuidv4()} itemName={"Owner Names"} toggleId={"collapseTwo"} parsedFile={parsedFile}/>
        < AccordionItem key={uuidv4()} itemName={"Mail Address"} toggleId={"collapseThree"} parsedFile={parsedFile}/>
      </ul>
    </>
  )
}

function AccordionItem({ itemName, toggleId, parsedFile }) {
  const [isCompleted, setIsCompleted] = useState(false);

  function findRequiredHeaders(itemName) {
    return itemName === 'Owner Names' ? { "First Owner": [], "Second Owner": [] } : { "Address": [], "City / State": [] };
  }

  const [requiredHeaders, setRequiredHeaders] = useState(findRequiredHeaders(itemName));

  const headers = Object.keys(parsedFile[0]);

  const findSampleValue = (header, parsedFile) => {
    const matchingRow = parsedFile.find((row) => {
      return row[header] !== '';
    });

    return matchingRow ? matchingRow[header] : 'Empty';
  };

  const sampleRow = headers.map((header) => {
    return { header, value: findSampleValue(header, parsedFile) };
  });

  function generateCurrentMatch(requiredHeaders, requiredHeader, sampleRow) {
    return requiredHeaders[requiredHeader].map((columnHeader) => {
      return sampleRow.find((row) => row.header === columnHeader).value;
    }).join(' ');
  }

  function checkIfCompleted(itemName) {
    if (itemName === 'Owner Names') {
      if (Object.keys(requiredHeaders).some((requiredHeader) => requiredHeaders[requiredHeader].length > 0 )) {
        setIsCompleted(true);
      } else {
        setIsCompleted(false);
      }
    } else if (itemName === 'Primary Address' || iteName === 'Mail Address') {
      if (Object.keys(requiredHeaders).every((requiredHeader) => requiredHeaders[requiredHeader].length > 0)) {
        setIsCompleted(true);
      } else {
        setIsCompleted(false);
      }
    }
  }

  function handleAccordionItemClick(event) {
    
  }

  function handleRequiredHeaderClick(event) {
    event.preventDefault();
  }

  function handleResetRequiredHeaderMatch(requiredHeader) {
    setRequiredHeaders({...requiredHeaders, [requiredHeader]: []});
  }

  function handleCancelRequiredHeaderMatch(requiredHeader) {
    setRequiredHeaders({...requiredHeaders, [requiredHeader]: []});
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

  return (
    <div onClick={handleAccordionItemClick} className={`${styles.accordionItem} accordion-item`}>
      <h2 className="accordion-header">
        <button className="accordion-button collapsed" type="button"
          data-bs-toggle="collapse"
          data-bs-target={`#${toggleId}`}
          aria-expanded="false"
          aria-controls={toggleId}>
          {`${itemName}: ${isCompleted}`}
        </button>
      </h2>
      <div id={toggleId} className={`accordion-collapse collapse`} data-bs-parent="#accordionExample">
        <div className={`${styles.inputTypeMatcherMenu} accordion-body`}>
          <ul className={`${styles.requiredHeaders} list-group`}>
            {Object.keys(requiredHeaders).map((requiredHeader, index) => {
              const uniqueKey = uuidv4();

              /*
              func
              */

              return (
                <>
                  <li key={index} onClick={handleRequiredHeaderClick} className={`${styles.requiredHeader} list-group-item`} data-bs-toggle="modal" data-bs-target={`#matcherModal${uniqueKey}`}>
                    <input class="form-check-input me-1" type="checkbox" value="" id={`checkbox${uniqueKey}`} />
                    <label class="form-check-label" for={`checkbox${uniqueKey}`} >{requiredHeader}</label>
                  </li>
                  <div className="modal fade" id={`matcherModal${uniqueKey}`} data-bs-backdrop="static">
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                      <div class="modal-content">
                        <div class="modal-header">
                          <h5 class="modal-title">Matching {requiredHeader}</h5>
                          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
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
                          <button type="button"  onClick={(event) => handleCancelRequiredHeaderMatch(requiredHeader)} class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                          <button type="button" onClick={(event) => checkIfCompleted(itemName, requiredHeader)} data-bs-dismiss="modal" class="btn btn-primary">Save</button>
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
}