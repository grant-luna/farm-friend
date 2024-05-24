"use client"
import styles from './page.module.css';
import { useState, createContext, useContext } from 'react';
import Papa from "papaparse";
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

const FileContext = createContext();

export default function MainContent() {
  const [ parsedFile, setParsedFile ] = useState(null);

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
      <FileContext.Provider value={{parsedFile, setParsedFile}}>
        {!parsedFile && <input className={styles.fileInput} type='file' accept='.csv' onChange={handleFileSelection}></input>}
        {parsedFile && <FileMatchMenu parsedFile={parsedFile} setParsedFile={setParsedFile}/>}
      </FileContext.Provider>
    </>
  );
}

function FileMatchMenu() {
  const [ isGeneratable, setIsGeneratable ] = useState(false);
  const router = useRouter();

  const [ matchedColumnHeaders, setMatchedColumnHeaders ] = useState({
    "Primary Address": {"Address": [], "City / State": []},
    "Owner Names": {"First Owner": [], "Second Owner": []},
    "Mail Address": {"Address": [], "City / State": []},
  });

  const matchedColumnHeadersKeys = Object.keys(matchedColumnHeaders);

  return (
    <>
      <h3>File Matcher</h3>
      <p>
        Thank you for uploading your file! Could you please help us
        generate your search results by helping us make sense of the
        file you uploaded?
      </p>
      <p>
        At minimum, we require a <strong>Primary Address</strong> (address, city, and state)
        to generate results.
      </p>
      <p>
        For best results, please provide matching information for a Primary Address, Owner Name(s), and a Mail Address.
      </p>
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
              <AccordionBody toggleId={index} requiredHeaders={requiredHeaders}/>
            </li>
          );
        })}
      </ul>
      <button className={`btn btn-primary ${styles.generateResultsButton}`} disabled={!isGeneratable} type="button">Generate Results</button>
    </>
  );
}

function AccordionBody({ toggleId, requiredHeaders }) {
  return (
    <div id={`accordion-item-${toggleId}`} className="accordion-collapse collapse" data-bs-parent="#accordionMenu">
      <div className="accordion-body">
        <ul className={`${styles.requiredHeaders} list-group`}>
          {requiredHeaders.map((requiredHeader, index) => {
            const uniqueId = uuidv4();
            
            return (
              <li key={index}>
                <RequiredHeader requiredHeader={requiredHeader} uniqueId={uniqueId}/>
                <RequiredHeaderModal requiredHeader={requiredHeader} requiredHeaders={requiredHeaders} uniqueId={uniqueId}/>
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

function RequiredHeaderModal({ requiredHeader, requiredHeaders, uniqueId }) {
  const { parsedFile } = useContext(FileContext);

  return (
    <div class="modal fade" data-bs-backdrop="static" id={uniqueId} aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div className="modal-header">
              <h5 className="modal-title">Matching {requiredHeader}</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <h6>Current Match:</h6>
              <p>{JSON.stringify(parsedFile)}</p>
              <ul className={`${styles.sampleColumns} list-group`}>
                
              </ul>
            </div>
            <div className="modal-footer">
              <button type="button"  className="btn btn-light">Reset</button>
              <button type="button" data-bs-dismiss="modal" className="btn btn-primary">Save</button>
            </div>
          </div>
      </div>
    </div>
  )
}

/*
function RequiredHeaderModal({ requiredHeader, itemName, requiredHeaders, setRequiredHeaders, toggleGeneratableStateProps, inputTypeProps, uniqueKey, sampleRow, setIsCompleted }) {
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

  function generateCurrentMatch(requiredHeaders, requiredHeader, sampleRow) {
    return requiredHeaders[requiredHeader].map((columnHeader) => {
      return sampleRow.find((row) => row.header === columnHeader).value;
    }).join(' ');
  }

  function handleResetRequiredHeaderMatch(requiredHeader) {
    setRequiredHeaders({...requiredHeaders, [requiredHeader]: []});
    toggleGeneratableStateProps.setIsGeneratable(false);
  }

  function handleSaveRequiredHeaderMatch(event, itemName, requiredHeaders, inputTypeProps) {
    inputTypeProps.setInputTypes({...inputTypeProps.inputTypes, [itemName]: {...requiredHeaders}});
    checkIfCompleted(itemName);
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

  return (
    <div className="modal fade" id={`matcherModal${uniqueKey}`} data-bs-backdrop="static">
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Matching {requiredHeader}</h5>
            <button type="button" onClick={() => handleSaveRequiredHeaderMatch(event, itemName, requiredHeaders, inputTypeProps)} className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <h6>Current Match: {generateCurrentMatch(requiredHeaders, requiredHeader, sampleRow)}</h6>
            <ul onClick={handleSampleColumnClick.bind(null, requiredHeader)} className={`${styles.sampleColumns} list-group`}>
              {sampleRow.map((column, index) => (
                <li onMouseOver={handleSampleColumnHover}
                    onMouseLeave={handleSampleColumnUnHover}
                    className={`${styles.sampleColumn} list-group-item d-flex justify-content-between align-items-start`}
                    key={index}
                  >
                  <h4><strong>{column.header}</strong></h4>
                  <p>{column.value}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={(event) => handleResetRequiredHeaderMatch(requiredHeader)} className="btn btn-light">Reset</button>
            <button type="button" onClick={(event) => handleSaveRequiredHeaderMatch(event, itemName, requiredHeaders, inputTypeProps)} data-bs-dismiss="modal" className="btn btn-primary">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
*/

/*

function RequiredHeader({ index, requiredHeader, requiredHeaders, uniqueKey }) {
  function columnsSelected(requiredHeader, requiredHeaders) {
    return requiredHeaders[requiredHeader].length > 0;
  }

  function handleRequiredHeaderClick(event) {
    event.preventDefault();
  }

  return (
    <div key={index}
        onClick={handleRequiredHeaderClick}
        className={`${styles.requiredHeader} list-group-item`}
        data-bs-toggle="modal"
        data-bs-target={`#matcherModal${uniqueKey}`}
    >
      <input checked={columnsSelected(requiredHeader, requiredHeaders) ? true : false} className="form-check-input me-1" type="checkbox" value="" id={`checkbox${uniqueKey}`} />
      <label className="form-check-label" htmlFor={`checkbox${uniqueKey}`}>{requiredHeader}</label>
    </div>
  );
}

*/

/*
function FileMatchMenu({ parsedFile }) {
  const [isGeneratable, setIsGeneratable] = useState(false);
  const toggleGeneratableStateProps = { isGeneratable, setIsGeneratable };
  const router = useRouter();

  const [ inputTypes, setInputTypes ] = useState({
    "Primary Address": {"Address": [], "City / State": []},
    "Owner Names": {"First Owner": [], "Second Owner": []},
    "Mail Address": {"Address": [], "City / State": []},
  });

  const inputTypeProps = { inputTypes, setInputTypes };

  async function handleGenerateResultsButtonClick() {
    if (isGeneratable) {

      const processedFile = JSON.stringify(parsedFile.map((row) => {
        const primaryAddressLink = createFastPeopleSearchLink(row, inputTypes["Primary Address"]);
        const mailAddressLink = createFastPeopleSearchLink(row, inputTypes["Mail Address"]);

        return {
          primaryAddressLink,
          mailAddressLink,
          primaryAddress: {
            address: inputTypes["Primary Address"]["Address"].map((header) => row[header]).join(' '),
            cityState: inputTypes["Primary Address"]["City / State"].map((header) => row[header]).join(' '),
          },
          mailAddress: {
            address: inputTypes["Mail Address"]["Address"].map((header) => row[header]).join(' '),
            cityState: inputTypes["Mail Address"]["City / State"].map((header) => row[header]).join(' '),
          },
          ownerNames: {
            firstOwner: inputTypes["Owner Names"]["First Owner"].map((header) => row[header]).join(' '),
            secondOwner: inputTypes["Owner Names"]["Second Owner"].map((header) => row[header]).join(' '),
          }
        }
      }));
      
      try {
        const response = await fetch('/fasterFastPeopleSearch/createSearch/api', {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
          },
          body: processedFile,
        });

        const responseData = await response.json()
        const insertedData = responseData.rows[0];
        const searchId = insertedData.id;
        router.push(`/fasterFastPeopleSearch/searches/${searchId}`);
      } catch (error) {
        console.error('Error while generating results:', error);
      }
    }
  }
  
  function createFastPeopleSearchLink(fileRow, headers) {
    const addressHeaders = headers["Address"];
    const cityStateHeaders = headers["City / State"];

    const address = addressHeaders.map((addressHeader) => {
      return fileRow[addressHeader]?.replace(/[^0-9a-z ]/gi, '');
    }).join(' ')

    const cityState = cityStateHeaders.map((cityStateHeader) => {
      return fileRow[cityStateHeader];
    }).join(' ');
    
    return `http://www.fastpeoplesearch.com/address/${address}_${cityState}`.replace(/ /g, '-');
  }

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
      <ul className="accordion" id="accordionExample">
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
*/