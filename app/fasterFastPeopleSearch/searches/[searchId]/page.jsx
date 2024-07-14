"use client";
import { useState, useEffect } from 'react';
import { useImmer } from 'use-immer'
import styles from './page.module.css';
import { fetchSearchData } from '../../actions/fetchSearchData.js';
import { gatherContactInformation } from '../../actions/gatherContactInformation';
import { IoIosClose } from "react-icons/io";
import { MdContactPhone } from "react-icons/md";
import { MdContactSupport } from "react-icons/md";


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
          className="btn btn-success dropdown-toggle"
          type="button"
          id={`dropdownMenuButton${index}`}
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          Contact Information
        </button>
        <ul className="dropdown-menu" aria-labelledby={`dropdownMenuButton${index}`}>
          <li>
            <a className="dropdown-item" href={searchRow["Primary Address"]["FastPeopleSearch Url"]} target="_blank">
              <strong>
                {searchRow["Primary Address"]["Street Address"]} | {`${searchRow["Primary Address"]["City"]} ${searchRow["Primary Address"]["State"]} `}
              </strong>
              <span className="badge text-bg-light">Primary Address</span>
            </a>
          </li>
          <li>
            <a className="dropdown-item" href={searchRow["Mail Address"]["FastPeopleSearch Url"]} target="_blank">
              <strong>
                {searchRow["Mail Address"]["Street Address"]} | {`${searchRow["Mail Address"]["City"]} ${searchRow["Mail Address"]["State"]} `}
              </strong>
              <span className="badge text-bg-light">Mail Address</span>
            </a>
          </li>
        </ul>
      </div>
    </li>
  );
}
