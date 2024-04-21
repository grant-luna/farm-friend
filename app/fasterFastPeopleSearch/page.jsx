"use client"
import styles from './page.module.css';
import { useState, useRef } from 'react';
import Papa from "papaparse";

export default function Page() {
  const [ parsedFile, setParsedFile ] = useState(null);

  function handleFileSelection(event) {
    const selectedFile = event.target.files[0];

    Papa.parse(selectedFile, {
      header: true,
      complete: (result) => {
        setParsedFile(result);
      },
      error: () => {
        console.log('Error reading file');
      }
    })
  }
  
  return (
    <>
      <h1>Faster FastPeopleSearch</h1>
      {!parsedFile && <input type='file' accept='.csv' onChange={handleFileSelection}></input>}
      {parsedFile && <FileMatcher parsedFile={parsedFile} setParsedFile={setParsedFile}/>}
    </>
  )
}

// https://www.fastpeoplesearch.com/address/3445-gurnard_san-pedro-ca
// https://www.fastpeoplesearch.com/address/3445-gurnard-ave_san-pedro-ca
// https://www.fastpeoplesearch.com/address/3529-e-broadway-7_long-beach-ca
function FileMatcher({ parsedFile, setParsedFile }) {
  const [ siteAddress, setSiteAddress ] = useState(undefined);
  const [ mailAddress, setMailAddress ] = useState(undefined);
  const [ ownerName, setOwnerName ] = useState(undefined);

  return (
    <>
      <h3>File Matcher</h3>
      {!siteAddress && <FileHeaderSelector parsedFile={parsedFile} setterFunction={setSiteAddress}/>}
      {siteAddress && !mailAddress && <FileHeaderSelector parsedFile={parsedFile} setterFunction={setMailAddress}/>}
      {siteAddress && mailAddress && <FileHeaderSelector parsedFile={parsedFile} setterFunction={setOwnerName}/>}
      <div>
        <button type="button" onClick={() => setParsedFile(false)}>Start Over</button>
        <button type="button" disabled={true}>Finish</button>
      </div>
    </>
  )
}

function FileHeaderSelector({ parsedFile, setterFunction }) {
  // site address | mail address | owner name
  const [ currentlyMatching, setCurrentlyMatching ] = useState('site address');
  // true | false
  const [ isHovered, setIsHovered ] = useState(false);
  const [ currentMatch, setCurrentMatch ] = useState('');
  const [ matchedHeaders, setMatchedHeaders ] = useState({
    "site address": [],
    "mail address": [],
    "owner name": []
  });

  // { [key: string]: string }
  let firstRow = parsedFile.data[0];
  const fileHeaders = Object.keys(parsedFile.data[0]);
  const sampleFormats = {
    address: '123 N Main St #525 | 5010 Main St | 123 Main',
    ownerName: 'Jane Doe',
  }

  function handleColumnHeaderSelection(setCurrentMatch, event) {
    const selectedValue = event.currentTarget.querySelector('p')?.textContent;

  }

  function handleMouseOut(event) {
    setIsHovered(false);
  }

  function handleMouseOver(event) {
    setIsHovered(true)
  }

  return (
    <>
      <div className={styles.matchBoxHeader}>
        <div className={styles.matchBoxInstructions}>
          <h2>Please help us create the {currentlyMatching} from your file by selecting the boxes needed to re-create the {currentlyMatching}</h2>
          <div className={styles.matchBoxExamples}>
            <h4>Examples</h4>
            <p>{currentlyMatching === 'owner name' ? sampleFormats.ownerName : sampleFormats.address}</p>
          </div>
          <p>Matched {currentlyMatching}: {currentMatch}</p>
        </div>
      </div>
      <div className={styles.headerBox} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
        <ul className={styles.headerList}>
          {Object.keys(firstRow).map((header, index) => {
            return (
            <li key={index} onClick={handleColumnHeaderSelection.bind(null, setCurrentMatch)}>
              <div className="row-sample">
                <h3>{header}</h3>
                <p>{firstRow[header] || 'N/A'}</p>
              </div>
            </li>
            );
          })}
          {isHovered && <p className={styles.scrollNotification}>Scroll to See More</p>}
        </ul>
      </div>
    </>
  )
}