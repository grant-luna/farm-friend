"use client"
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchSearches } from '../actions/fetchSearches.js';
import Link from 'next/link'
import { HiDotsVertical } from "react-icons/hi";
import styles from './page.module.css';
import { updateSearchName } from '../actions/updateSearchName.js';
import { deleteSearch } from '../actions/deleteSearch.js';
import { CiCirclePlus } from "react-icons/ci";
import { Tooltip } from 'react-tooltip'
import { FaSortAmountDownAlt } from "react-icons/fa";
import {
  findMatchingSearches,
  sortByContactsAscending,
  sortByContactsDescending,
  sortByNewestSearches,
  sortByOldestSearches,
} from './lib/helpers.js'


export default function MainContent() {
  const [searches, setSearches] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [ searchCritera, setSearchCriteria ] = useState('');
  
  const [ currentPage, setCurrentPage ] = useState(Number(localStorage.currentPage) || 1);
  const startIndex = (currentPage - 1) * 10;
  const maxPages = useRef(null);
  const visibleSearches = searches?.slice(startIndex, currentPage * 10);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        let fetchedSearches = await fetchSearches();
        maxPages.current = Math.ceil((fetchedSearches.length / 10));

        setSearches(sortByNewestSearches(fetchedSearches));        
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    })();
  }, []);

  function handleCreateNewSearchContainerClick() {
    router.push('/fasterFastPeopleSearch/createSearch');
  }

  function handlePageNumberClick(pageNumber) {
    if (pageNumber) {
      localStorage.currentPage = pageNumber;
      setCurrentPage(pageNumber);
    }
  }

  function handlePreviousClick() {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      localStorage.currentPage = newPage;      
      setCurrentPage(newPage);
    }
  }

  function handleNextClick() {     
    if (currentPage !== maxPages.current) {
      const newPage = currentPage + 1;
      localStorage.currentPage = newPage;
      setCurrentPage(currentPage + 1);
    }
  }

  async function handleSearchPastSearches(event) {
    const newSearchCriteria = event.currentTarget.value;

    if (newSearchCriteria === '') {
      const fetchedSearches = await fetchSearches();
      maxPages.current = Math.ceil((fetchedSearches.length / 10));
      setSearches(sortByNewestSearches(fetchedSearches));
    } else {
      const matchingSearches = findMatchingSearches(searches, newSearchCriteria);
      maxPages.current = Math.ceil((matchingSearches.length / 10));
      setSearches(matchingSearches);
    }
    
    setSearchCriteria(newSearchCriteria);
  }

  function handleSortSearches(sortingFunction) {
    setSearches(sortingFunction(searches));
  }

  return (
    <div>
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">Past Searches</a>
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
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle d-flex align-items-center"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{gap: '.5rem'}}>
                  Sort Searches
                  <FaSortAmountDownAlt size={20} />              
                </a>
                <ul className="dropdown-menu dropdown-menu-dark">
                  <li className="dropdown-item" onClick={handleSortSearches.bind(null, sortByNewestSearches)} href="#">Sort by Date Created (Newest First)</li>
                  <li className="dropdown-item" onClick={handleSortSearches.bind(null, sortByOldestSearches)} href="#">Sort by Date Created (Oldest First)</li>
                  <li className="dropdown-item" onClick={handleSortSearches.bind(null, sortByContactsDescending)} href="#">Sort by # of Contacts (Descending)</li>
                  <li className="dropdown-item" onClick={handleSortSearches.bind(null, sortByContactsAscending)} href="#">Sort by # of Contacts (Ascending)</li>
                </ul>
              </li>
              <li className="nav-item">
                <input
                  onChange={handleSearchPastSearches}
                  className="form-control me-2"
                  type="search"
                  placeholder="Search"
                  aria-label="Search"
                  value={searchCritera}/>
              </li>
            </ul>
          </div>
        </div>        
      </nav>
      {loading && (
        <div className="d-flex flex-column justify-content-center align-items-center" style={{height: '60vh'}}>
          <h4>Loading Your Searches...</h4>          
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      {!loading && (
        <div className="bg-body-tertiary">
          <div className={`${styles.searchesContainer}`}>
            <ul className={`${styles.searchItems}`}>
              <div onClick={handleCreateNewSearchContainerClick}>
                <button
                  style={{width: '100%', height: '100%', gap: '.5rem'}}
                  className="d-flex justify-content-center align-items-center btn btn-outline-success">
                  <h6 style={{marginBottom: '0'}}>Create New Search</h6>
                  <CiCirclePlus size={25}/>
                </button>
              </div>
              {visibleSearches.map((search, index) => {
                return <SearchItem key={`${search["search_name"]}-${index}`} search={search}/>
              })}
             {currentPage === maxPages && (
               <div onClick={handleCreateNewSearchContainerClick}>
                  <button
                    style={{width: '100%', height: '100%', gap: '.5rem'}}
                    className="d-flex justify-content-center align-items-center btn btn-outline-success">
                    <h6 style={{marginBottom: '0'}}>Create New Search</h6>
                    <CiCirclePlus size={25}/>
                  </button>
                </div>
             )}
            </ul>             
          </div>
          <div className={`d-flex justify-content-center align-items-center`} style={{margin: '0 auto'}}>
            <ul className="pagination">
              <li className={`page-item ${currentPage === 1 && 'disabled'}`} onClick={handlePreviousClick}>
                <a className="page-link" href="#">Previous</a>
              </li>
              {Array.from(Array(maxPages.current), (_, index) => {
                const pageNumber = index + 1;
              
                return (
                  <li
                    key={index}
                    className={`page-item ${Number(currentPage) === pageNumber && `active`}`}
                    onClick={handlePageNumberClick.bind(null, pageNumber)}>
                    <a className="page-link" href="#">{pageNumber}</a>
                  </li>
                )
              })}
              <li className={`page-item ${currentPage === maxPages.current && `disabled`}`} onClick={handleNextClick}>
                <a className="page-link" href="#">Next</a>
              </li>
            </ul>
          </div>  
        </div>
      )}
    </div>
  )
}

function SearchItem({ search }) {
  const [ searchItemHovered, setSearchitemHovered ] = useState(false);
  const [ searchitemDropdownDisplayed, setSearchItemDropdownDisplayed ] = useState(false);
  const [ searchItemEditRequested, setSearchitemEditRequested ] = useState(false);
  const [ searchItemDeleteRequested, setSearchItemDeleteRequested ] = useState(false);
  const router = useRouter(); 

  function handleEditSearchNameClick(event) {
    event.preventDefault();
    event.stopPropagation();

    setSearchitemEditRequested(true);
  }

  function handleDeleteSearchClick(event) {
    event.stopPropagation();
    event.stopPropagation();
    setSearchItemDeleteRequested(true);
  }

  function handleLinkMouseEnter(event) {
    if (event.target === event.currentTarget) {
      event.target.style.textDecoration = 'underline';
      event.target.style.cursor = 'pointer'; // Corrected property name
    }    
  }

  function handleLinkMouseLeave(event) {
    if (event.target === event.currentTarget) {
      event.target.style.textDecoration = 'none';
      event.target.style.cursor = 'pointer'; // Corrected property name
    }
  }

  function handleSearchItemMouseEnter(event) {
    event.currentTarget.style.backgroundColor = '#F5F8FA';
    event.currentTarget.style.cursor = 'pointer';    
    setSearchitemHovered(true);
  }

  function handleSearchItemMouseLeave(event) {
    event.currentTarget.style.backgroundColor = 'white';        
    setSearchitemHovered(false);
  }

  function handleSearchItemClick(searchId, event) {
    event.preventDefault();
    router.push(`/fasterFastPeopleSearch/searches/${searchId}`);
  }

  function handleSearchItemOptionsClick(event) {
    event.stopPropagation();
    setSearchItemDropdownDisplayed(!searchitemDropdownDisplayed);
  }
  
  return (
    <li
      className="d-flex flex-column align-items-center"
      style={{border: '1px solid grey', padding: '.5rem', borderRadius: '.25rem', gap: '.25rem'}}
      onClick={handleSearchItemClick.bind(null, search.id)}
      onMouseEnter={handleSearchItemMouseEnter}
      onMouseLeave={handleSearchItemMouseLeave}>
      <div className="d-flex flex-column align-items-start">
        <div className="d-flex align-items-start justify-content-between" style={{width: '100%'}}>
          {searchItemEditRequested &&  <EditSearchNameContainer search={search} setSearchitemEditRequested={setSearchitemEditRequested}/> ||
          <h6>
            <Link
              style={{color: '#0091AE', textDecoration: 'none'}}
              href="#"
              onMouseEnter={handleLinkMouseEnter}
              onMouseLeave={handleLinkMouseLeave}>
              {search["search_name"]}
            </Link>
          </h6>}
          <div className="d-flex justify-items-end align-items-center">
            <HiDotsVertical 
              className="dropdown-toggle"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              onClick={handleSearchItemOptionsClick}
            />
             <ul className="dropdown-menu dropdown-menu-dark">
              <li onClick={handleEditSearchNameClick}><a className="dropdown-item">Edit Search Name</a></li>            
              <li onClick={handleDeleteSearchClick}><a className="dropdown-item" href="#">Delete Search</a></li>              
            </ul>
          </div>          
        </div>        
        <ul className="list-group" style={{textAlign: 'start'}}>
          <li className="list-group-item"><strong>Date Created: </strong>{search["created_at"].toDateString()}</li>
          <li className="list-group-item"><strong>Number of Contacts: </strong>{search["search_data"].length}</li>
        </ul>        
      </div>
      <div style={{width: '90%', outline: '1px solid grey', margin: '0 auto'}}></div>
      {searchItemDeleteRequested && <DeleteSearchContainer search={search} setSearchItemDeleteRequested={setSearchItemDeleteRequested}/>}
    </li>
  )
}

function EditSearchNameContainer({ search, setSearchitemEditRequested }) {
  const [searchName, setSearchName ] = useState(search["search_name"])

  function handleCancelEditSearchName() {
    setSearchitemEditRequested(false);
  }

  function handleInputChange(event) {
    setSearchName(event.currentTarget.value);
  }

  async function handleSaveEditSearchName(event) {
    const searchName = event.currentTarget.parentNode.querySelector('input')?.value;

    if (searchName.length > 0 && searchName !== search["search_name"]) {
      try {
        const updateSearchNameAttempt = await updateSearchName(search, searchName);
        if (updateSearchNameAttempt.success) {
          setSearchitemEditRequested(false);
          window.location.reload();
        }
      } catch (error) {
        // Display Error
      }
    }
  }

  return (
    <div className="d-flex justify-content-start align-items-center" style={{gap: '.25rem'}} onClick={(event) => event.stopPropagation()}>
      <input
        className="form-control"
        type="text"
        placeholder={searchName}
        value={searchName}
        aria-label="Search"
        onChange={handleInputChange}/>
      <button
        className="btn btn-outline-success"
        type="submit"
        onClick={handleSaveEditSearchName}
        data-tooltip-id="edit-search-name-tooltip"
        data-tooltip-content="This is already the current search's name.">
        Save
      </button>
      {searchName === search["search_name"] && <Tooltip id="edit-search-name-tooltip" />}
      <button className="btn btn-light" type="submit" onClick={handleCancelEditSearchName}>Cancel</button>
    </div>
  )
}

function DeleteSearchContainer({ search, setSearchItemDeleteRequested }) {
  function handleCancelDeleteSearch() {
    setSearchItemDeleteRequested(false);
  }

  async function handleDeleteSearch() {  
    try {
      const deleteSearchAttempt = await deleteSearch(search.id);
      if (deleteSearchAttempt.success) {
        setSearchItemDeleteRequested(false);
        window.location.reload();      
      }
    } catch (error) {
      // throw error
    }
  }

  return (
    <div className="d-flex justify-content-start align-items-center" style={{gap: '.25rem'}} onClick={(event) => event.stopPropagation()}>
      <small>Delete {search["search_name"]}?</small>
      <button className="btn btn-outline-danger" type="submit" onClick={handleDeleteSearch}>Delete</button>
      <button className="btn btn-light" type="submit" onClick={handleCancelDeleteSearch}>Cancel</button>
    </div>
  )
}