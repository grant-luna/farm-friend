"use client"
import { useState } from 'react';
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

// https://www.fastpeoplesearch.com/address/3445-gurnard-ave_san-pedro-ca
// https://www.fastpeoplesearch.com/address/3529-e-broadway-7_long-beach-ca
function FileMatcher({ parsedFile, setParsedFile }) {
  const [ siteAddress, setSiteAddress ] = useState(undefined);
  const [ mailAddress, setMailAddress ] = useState(undefined);
  const [ ownerName, setOwnerName ] = useState(undefined);

  return (
    <>
      <h3>File Matcher</h3>
      {!siteAddress && <p>{JSON.stringify(Object.keys(parsedFile.data[0]))}</p>}
      {siteAddress && !mailAddress && <HeaderMatchBox />}
      {siteAddress && mailAddress && <HeaderMatchBox/>}
      <div>
        <button type="button" onClick={() => setParsedFile(false)}>Start Over</button>
        <button type="button" disabled={true}>Finish</button>
      </div>
    </>
  )
}

function HeaderMatchBox() {
  return (
    <>
      
    </>
  )
}