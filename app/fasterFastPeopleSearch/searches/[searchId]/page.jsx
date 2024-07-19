"use client";
import { useState, useEffect, useRef } from 'react';
import { useImmer } from 'use-immer'
import styles from './page.module.css';
import { fetchSearchData } from '../../actions/fetchSearchData.js';
import { gatherContactInformation } from '../../actions/gatherContactInformation';
import { IoIosClose } from "react-icons/io";
import { MdContactPhone } from "react-icons/md";
import { MdContactSupport } from "react-icons/md";
import { checkIfSimilarName } from './lib/checkIfSimilarName.js';
import { v4 as uuidv4 } from 'uuid';
import { MdOutlineDataSaverOn } from "react-icons/md";
import { Tooltip } from 'react-tooltip'
import { validateAddress } from './actions/validateAddress.js';

export default function MainContent({ params }) {
  const searchId = params.searchId;
  return <SearchResults searchId={searchId} />
}

function SearchResults({ searchId }) {
  const [searchData, setSearchData] = useImmer(null);  
  const [ originalSearchData, setOriginalSearchData ] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ searchValue, setSearchValue ] = useState('');
  const [ searchFilter, setSearchFilter ] = useState(null);

  const categories = ["Primary Address", 'Owner Names', 'Mail Address'] ;

  function handleSearch(event) {
    const newSearchValue = event.currentTarget.value;
    
    setSearchData((draft) => {    
      if (newSearchValue === '') {
        draft.search_data = originalSearchData.search_data;
      } else {
        const searchValueRegexp = new RegExp(newSearchValue, 'i');

        const filteredSearches = originalSearchData.search_data.filter((search) => {
          let searchCategories = Object.keys(search);
          if (searchFilter) {
            searchCategories = searchCategories.filter((header) => header === searchFilter);
          }
        
          return searchCategories.some((category) => {
            const categoryHeaders = Object.keys(search[category]);
          
            return categoryHeaders.some((header) => {
              return searchValueRegexp.test(search[category][header]);
            });          
          });        
        });
      
        draft.search_data = filteredSearches;
      }
    });
    
    setSearchValue(newSearchValue);
  }
  
  function handleRemoveSearchFilter() {
    setSearchFilter(null);
  }
  
  function handleSelectSearchFilter(event) {
    const searchFilter = event.currentTarget.textContent;
    setSearchValue('');
    setSearchFilter(searchFilter);
  }

  useEffect(() => {
    (async () => {
      try {
        const fetchedSearchData = await fetchSearchData(searchId);
        
        if (fetchedSearchData.error) {
          console.error('Error accessing search data:', fetchSearchData.error);
          return;
        }
        
        setSearchData(fetchedSearchData);
        if (!originalSearchData) {
          setOriginalSearchData(fetchedSearchData);
        }
        setLoading(false);
      } catch (error) {        
        console.error(error);
        setLoading(false);
      }
    })();
  }, [searchId, searchFilter]);
  
  return (
    <>
      {loading && (
        <div className="d-flex flex-column justify-content-center align-items-center" style={{height: '60vh', gap: '.5rem'}}>
          <div className="d-flex align-items-center" style={{gap: '.5rem'}}>
            <h2 style={{marginBottom: '0rem'}}>Loading Contacts</h2>
            <MdContactPhone size={40} color="#0E611F"/>
          </div>
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      {!loading && <div>
        <nav className="navbar navbar-expand-lg bg-body-tertiary">
          <div className="container-fluid">
            <a className="navbar-brand" href="#">{searchData["search_name"]}</a>
            <button 
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#pastSearchesNavbarDropdown"
              aria-controls="pastSearchesNavbarDropdown"
              aria-expanded="false"
              aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="pastSearchesNavbarDropdown">
              <ul className="navbar-nav">                
                <li className="nav-item d-flex align-items-center">
                  <input
                    className="form-control me-2"
                    type="search"
                    placeholder="Search"
                    aria-label="Search"
                    onChange={handleSearch}
                    value={searchValue}/>
                    <div className="nav-item dropdown" style={{outline: '1px solid black', borderRadius: '.25rem'}}>
                      <a
                        className="nav-link dropdown-toggle d-flex align-items-center"
                        href="#"
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        style={{gap: '.5rem'}}>
                        {searchFilter && <IoIosClose onClick={handleRemoveSearchFilter} size={24}/>}
                        {searchFilter || 'Search Filter'}
                      </a>
                      <ul className="dropdown-menu dropdown-menu-dark">
                        {categories.map((category, index) => {
                          return <li onClick={handleSelectSearchFilter} key={index} className="dropdown-item">{category}</li>
                        })}
                      </ul>
                    </div>
                </li>     
              </ul>
            </div>
          </div>        
        </nav>
        <div style={{marginTop: '1rem'}}>          
          <div className="d-flex justify-content-center" style={{gap: '1rem'}}>
            <p><strong>Date Created: </strong> {searchData["created_at"].toDateString()}</p>
            <p><strong>Number of Contacts: </strong> {searchData["search_data"].length}</p>
          </div>
        </div>
        <ul className={`${styles.searchItems}`}>
          {searchData["search_data"]?.map((searchRow, index) => {
            return (
              <SearchItem searchRow={searchRow} key={index} />
            )
          })}
          {searchData['search_data'].length === 0 && (
            <div className="d-flex flex-column align-items-center" style={{height: '60vh'}}>
              <div className="d-flex align-items-center justify-content-between" style={{gap: '.5rem'}}>
                <h4>No Matching Contacts</h4>
                <MdContactSupport size={40}/>    
              </div>      
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
        </ul>
      </div>}
    </>
  )
}

function SearchItem({ searchRow, index }) {  
  const searchItemOffCanvasId = useRef(uuidv4());

  return (
    <li className={`${styles.searchItem} card text-start`}>
      <div className="card-body">
        <h5 className="card-title">{searchRow["Primary Address"]["Street Address"]}</h5>
        <p className="card-text">{`${searchRow["Primary Address"]["City"]} ${searchRow["Primary Address"]["State"]}`}</p>
      </div>
      <div className="card-header">
        Owned By:
      </div>
      <ul className="list-group list-group-flush">
        {Object.keys(searchRow["Owner Names"]).filter((owner) => {
          return searchRow["Owner Names"][owner].length > 0;
        }).map((owner, index) => {
          return <li className={`list-group-item`} key={index}>{`${searchRow["Owner Names"][owner]}`}</li>
        })}
      </ul>
      <div className="card-body dropdown">
        <button
          className="btn btn-success"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target={`#${searchItemOffCanvasId.current}`}
          aria-controls={searchItemOffCanvasId.current}
        >
          More Information
        </button>
        <SearchRowOffCanvas id={searchItemOffCanvasId.current} searchRow={searchRow} />
        <ul className="dropdown-menu" aria-labelledby={`dropdownMenuButton${index}`}>
          <li>
            <a className="dropdown-item" href={searchRow["Primary Address"]["FastPeopleSearch Url"]} target="_blank">
              <strong>
                {searchRow["Primary Address"]["Street Address"]} | {`${searchRow["Primary Address"]["City"]} ${searchRow["Primary Address"]["State"]}`}
              </strong>
              <span className="badge text-bg-light">Primary Address</span>
            </a>
          </li>
          <li>
            <a className="dropdown-item" href={searchRow["Mail Address"]["FastPeopleSearch Url"]} target="_blank">
              <strong>
                {searchRow["Mail Address"]["Street Address"]} | {`${searchRow["Mail Address"]["City"]} ${searchRow["Mail Address"]["State"]}`}
              </strong>
              <span className="badge text-bg-light">Mail Address</span>
            </a>
          </li>          
        </ul>
      </div>
    </li>
  );
}

function SearchRowOffCanvas({ id, searchRow }) {
  const [ validatedPrimaryAddress, setValidatedPrimaryAddress ] = useState(null);
  
  return (
    <div
      className="offcanvas offcanvas-end"
      data-bs-scroll="true"
      data-bs-backdrop="true"
      tabIndex="-1"
      id={id}
      aria-labelledby={id}
    >
      <div className="offcanvas-header" style={{backgroundColor: '#F8F9FA', borderBottom: '1px solid black'}}>
        <h5 className="offcanvas-title d-flex flex-column">
          {searchRow["Primary Address"]["Street Address"]}
          <small><em>{`${searchRow["Primary Address"]["City"]}, ${searchRow["Primary Address"]["State"]}`}</em></small>
        </h5>
        <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div className="offcanvas-body d-flex flex-column" style={{gap: '.5rem', overflowY: 'auto'}}>
        <div className="d-flex flex-column align-items-start" style={{borderBottom: '1px solid black'}}>
          <h5>Property Owners</h5>
          <ul className="d-flex" style={{padding: '0', gap: '.5rem'}}>
            {Object.keys(searchRow["Owner Names"]).map((ownerName, index) => {
              return <li key={index}>{searchRow["Owner Names"][ownerName]}</li>
            })}  
          </ul>
        </div>
        <ul className='d-flex flex-column' style={{gap: '.5rem', width: '100%'}}>
          {Object.keys(searchRow).filter((searchRowKey) => Object.keys(searchRow[searchRowKey]).includes("City")).map((searchRowKey, index) => {
            return < SearchRowOffCanvasAddress key={index} addressType={searchRowKey} addressData={ searchRow[searchRowKey] } searchRow={searchRow} />
          })}
        </ul>
        <div className="d-flex flex-column align-items-start" style={{borderBottom: '1px solid black', padding: '.5rem', gap: '.5rem'}}>
          <h5>Notes</h5>
          <div className="form-floating" style={{width: '100%'}}>
            <textarea
              className="form-control"
              placeholder="Leave a note here"
              id={`floatingTextArea${id}`}
              style={{height: '100px', width: '100%', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'}}>
            </textarea>
            <label htmlFor={`floatingTextArea${id}`}>Leave a Note</label>            
          </div>
          <div className="d-flex justify-content-end" style={{width: '100%'}}>
            <button className="btn btn-outline-success" style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>Save</button>
            <button className="btn btn-outline-light" style={{color: 'black'}}>Clear</button>
          </div>    
        </div>
      </div>
    </div>
  )
}

function SearchRowOffCanvasAddress({ addressType, addressData, searchRow }) {
  const [ fetchedContactInformation, setFetchedContactInformation ] = useImmer(null);
  const [ loadingContactInformation, setLoadingContactInformation ] = useState(false);

  async function handleContactInformationLinkClick(event) {
    event.preventDefault();

    setLoadingContactInformation(true);

    try {
      const fastPeopleSearchUrl = addressData["FastPeopleSearch Url"];
      let htmlContent = await gatherContactInformation(fastPeopleSearchUrl);

      const parser = new DOMParser();
      htmlContent = parser.parseFromString(htmlContent, 'text/html');

      const contactInformationContainers = [...htmlContent.querySelectorAll('div.card-block')];
      const ownerNames = Object.values(searchRow["Owner Names"]).map(ownerName => {
        return ownerName.trim().replace(/\s+/g, ' ');
      });

      const matchingContacts = contactInformationContainers.filter(container => {
        if (container instanceof HTMLElement) {
          const ownerNameSpan = container.querySelector('span.larger');
          const currentOwnerName = ownerNameSpan?.textContent;

          if (currentOwnerName) {
            return ownerNames.some(ownerName => {
              const trimmedOwnerName = ownerName.trim().replace(/\s+/g, ' ');
              return /[a-z]+i/.test(trimmedOwnerName) && checkIfSimilarName(trimmedOwnerName, currentOwnerName);
            });
          }
        }
        return false;
      });

      const phoneNumbers = matchingContacts.map(matchingContact => {
        const phoneNumberLinks = [...matchingContact.querySelectorAll('a[href*="-"], a[href*="("], a[href*=")"], a[href*="."]')].filter(link => {
          const href = link.getAttribute('href');
          return href && /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(href);
        });
        return phoneNumberLinks;
      }).map(potentialPhoneNumbers => {
        return potentialPhoneNumbers.filter(potentialPhoneNumber => {
          return /\(\d{3}\)\s\d{3}-\d{4}/.test(potentialPhoneNumber.textContent);
        });
      }).map(phoneNumberBatch => phoneNumberBatch.map(phoneNumberElement => phoneNumberElement.textContent));

      const contactInformationResults = Object.values(searchRow["Owner Names"]).reduce((resultObject, name, index) => {
        resultObject[name] = phoneNumbers[index];
        return resultObject;
      }, {});

      setFetchedContactInformation(contactInformationResults);
    } catch (error) {
      console.error('Error fetching contact information:', error);
    } finally {
      setLoadingContactInformation(false);
    }
  }

  return (
    <>
      <li className="d-flex flex-column" style={{gap: '.5rem', padding: '.5rem', border: '1px solid black', borderRadius: '.25rem', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'}}>
        <div className="d-flex flex-column">
          <h5>{addressType}</h5>
          <div className="d-flex flex-column">
            <p style={{marginBottom: '0'}}>{addressData["Street Address"]}</p>
            <small><em>{`${addressData["City"]}, ${addressData["State"]}`}</em></small>
          </div>          
        </div>
        <div className="d-flex flex-column" style={{gap: '.25rem'}}>
          <div className="dropdown">
            <button
              className="btn btn-outline-success dropdown-toggle"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false">
              Confirmed Numbers
            </button>
            <ul className="dropdown-menu">
              {addressData.confirmedNumbers.map((confirmedNumber, index) => {
                return <li key={index}><a className="dropdown-item" href={`tel:${confirmedNumber}`}>{confirmedNumber}</a></li>
              })}              
            </ul>
          </div>
          {(!fetchedContactInformation && !loadingContactInformation && <button className="btn btn-success" onClick={handleContactInformationLinkClick}>Get Contact Information</button>) || (
            !fetchedContactInformation && loadingContactInformation && <button className="btn btn-outline-success">Loading ...</button>
          ) || (
            <div className="d-flex flex-column" style={{padding: '.5rem', border: '1px solid black', borderRadius: '.25rem'}}>
              <h5>Available Contact Information</h5>
              <ul style={{padding: '0'}}>
                {Object.keys(fetchedContactInformation)?.map((ownerName, index) => {
                  return (
                    <li
                      key={index} style={{marginBottom: '.75rem'}}>
                      <h6>{ownerName}</h6>
                      <ul style={{padding: '0'}}>
                        {fetchedContactInformation[ownerName].map((phoneNumber, index) => {
                          return (
                            <li
                              className="btn btn-outline-light d-flex justify-content-center align-items-center"
                              style={{color: 'black', gap: '.5rem', width: 'max-content', border: '1px solid black'}}
                              key={index}>                              
                              <a
                                href={`tel:${phoneNumber}`}
                                data-tooltip-id={`call-number-tooltip-${index}`}
                                data-tooltip-content="Call Number"
                                data-tooltip-place="top">
                                {phoneNumber}
                              </a>
                              <Tooltip id={`call-number-tooltip-${index}`} />
                              <a
                                data-tooltip-id={`confirm-number-tooltip-${index}`}
                                data-tooltip-content="Confirm Number"
                                data-tooltip-place="top">
                                <MdOutlineDataSaverOn size={20}/>
                              </a>
                              <Tooltip id={`confirm-number-tooltip-${index}`} />
                              <a
                                data-tooltip-id={`delete-number-tooltip-${index}`}
                                data-tooltip-content="Delete Number"
                                data-tooltip-place="top">
                                <IoIosClose size={24}/>
                              </a>
                              <Tooltip id={`delete-number-tooltip-${index}`} />                                                      
                            </li>
                          )
                        })}
                      </ul>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
          <button className="btn btn-outline-success">See Aerial View</button>
        </div>        
      </li>
      
    </>    
  )
}