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
      {parsedFile && <FileMatchMenu parsedFile={parsedFile} setParsedFile={setParsedFile}/>}
    </>
  )
}

// https://www.fastpeoplesearch.com/address/3445-gurnard_san-pedro-ca
// https://www.fastpeoplesearch.com/address/3445-gurnard-ave_san-pedro-ca
// https://www.fastpeoplesearch.com/address/3529-e-broadway-7_long-beach-ca
function FileMatchMenu({ parsedFile, setParsedFile }) {
  const [ primaryAddress, setPrimaryAddress ] = useState(undefined);
  const [ mailAddress, setMailAddress ] = useState(undefined);
  const [ ownerName, setOwnerNames ] = useState(undefined);

  return (
    <>
      <h3>File Matcher</h3>
      {!primaryAddress && <FileHeaderSelector parsedFile={parsedFile} setterFunction={setPrimaryAddress}/>}
      {primaryAddress && !mailAddress && <FileHeaderSelector parsedFile={parsedFile} setterFunction={setMailAddress}/>}
      {primaryAddress && mailAddress && <FileHeaderSelector parsedFile={parsedFile} setterFunction={setOwnerNames}/>}
      <div>
        <button type="button" disabled={true} onClick={() => setParsedFile(false)}>Start Over</button>
        <button type="button" disabled={true} onClick={() => setParsedFile(false)}>New File</button>
        <button type="button" disabled={true}>Finish</button>
      </div>
    </>
  )
}

function FileHeaderSelector({ parsedFile, setterFunction }) {
  // primary address | mail address | owner name
  const [ currentlyMatching, setCurrentlyMatching ] = useState('primary address');
  // true | false
  const [ isHovered, setIsHovered ] = useState(false);
  const [ currentMatch, setCurrentMatch ] = useState('');
  const [ matchedHeaders, setMatchedHeaders ] = useState({
    "primary address": {address: [], cityState: []},
    "mail address": {address: [], cityState: []},
    "owner names": { firstOwner: [], secondOwner: []},
  });

  // { [key: string]: string }
  let firstRow = parsedFile.data[0];
  const fileHeaders = Object.keys(parsedFile.data[0]);
  const sampleFormats = {
    address: '123 N Main St #525 | 5010 Main St | 123 Main',
    ownerName: 'Jane Doe',
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
              <HeaderListItem key={index} header={header} sampleValue={firstRow[header]}/>
            );
          })}
          {isHovered && <p className={styles.scrollNotification}>Scroll to See More</p>}
        </ul>
      </div>
    </>
  )
}

function HeaderListItem({ index, header, sampleValue = 'N/A' }) {
  function handleColumnHeaderSelection(setCurrentMatch, event) {
    const selectedValue = event.currentTarget.querySelector('p')?.textContent;
  }
  
  return (
    <li key={index} onClick={handleColumnHeaderSelection}>
      <div className="row-sample">
        <h3>{header}</h3>
        <p>{sampleValue}</p>
      </div>
    </li>
  )
}