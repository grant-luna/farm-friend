"use client"
import styles from './page.module.css';
import { useState, useRef } from 'react';
import Papa from "papaparse";

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

  const [ isClicked, setIsClicked ] = useState(false);
  const [ currentSelectedProperty, setCurrentSelectedProperty ] = useState('');

  function handleInputTypeClick(event) {
    const newSelectedProperty = event.currentTarget.textContent;

    if (currentSelectedProperty === newSelectedProperty) {
      setIsClicked(!isClicked);
      setCurrentSelectedProperty('');
    } else if (isClicked) {
      setCurrentSelectedProperty(newSelectedProperty);
    } else {
      setIsClicked(!isClicked);
      setCurrentSelectedProperty(newSelectedProperty);
    }
  }

  const fileMatchMenuProps = { inputTypes, setInputTypes, currentSelectedProperty };

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
      <ul className={styles.inputTypeButtons}>
        <li type="button" onClick={handleInputTypeClick}>Primary Address</li>
        <li type="button" onClick={handleInputTypeClick}>Owner Names</li>
        <li type="button" onClick={handleInputTypeClick}>Mail Address</li>
      </ul>
      {isClicked && <HeaderMatcher parsedFile={parsedFile} fileMatchMenuProps={fileMatchMenuProps} />}
    </>
  )
}

function HeaderMatcher({ parsedFile, fileMatchMenuProps }) {
  const [ currentMatch, setCurrentMatch ] = useState('');
  const [ currentRequiredKey, setCurrentRequiredKey ] = useState('');
  const { inputTypes, setInputTypes, currentSelectedProperty } = fileMatchMenuProps;

  const propertyToMatch = fileMatchMenuProps.inputTypes.find((inputType) => {
    return inputType.type === fileMatchMenuProps.currentSelectedProperty;
  });

  const requiredKeys = Object.keys(propertyToMatch).filter((key) => {
    return key !== 'type' && key !== 'completable';
  });

  const headers = Object.keys(parsedFile[0]);

  const findSampleValue = (header, parsedFile) => {
    const matchingRow = parsedFile.find((row) => {
      return row[header] !== '';
    });
    return matchingRow[header] || 'Empty';
  };

  const sampleRow = headers.map((header) => {
    return { header, value: findSampleValue(header, parsedFile) }
  });

  function handleHeaderClick(event) {
    if (event.target.tagName === 'LI' || event.target.parentNode.tagName === 'LI') {
      
    }
  }

  function handleRequiredKeyClick(event) {
    if (event.target.tagName === 'LI') {
      // Start Here to begin finding a way to create a sample value when
      // a use clicks one of the required keys.  I have to imagine it
      // would require getting the value from sampleRow
      const sampleValues = propertyToMatch[event.target.textContent].map((columnHeader) => {
        console.log(sampleRow[columnHeader])
      });
      setCurrentRequiredKey(event.target.textContent);
    }
  }

  return (
    <div>
      <ul className={styles.requiredKeys} onClick={handleRequiredKeyClick}>
        {requiredKeys.map((requiredKey, index) => {
          return <li key={index}>{requiredKey}</li>
        })}
      </ul>
      <div className={styles.fileMatcherOptionsContainer}>
        <ul className={styles.fileMatcherOptions} onClick={handleHeaderClick}>
          {sampleRow.map((column, index) => {
            return (
              <li key={index} className={styles.fileMatcherOption}>
                <h4>{column.header}</h4>
                <p>{column.value}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  )
}