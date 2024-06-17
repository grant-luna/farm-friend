"use client"
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchSearches } from '../actions/fetchSearches.js';
import { BsFillTrash3Fill } from "react-icons/bs";

export default function MainContent() {
  return (
    <>
      <nav className="navbar bg-dark" data-bs-theme="dark">
        <div className="container-fluid">
          <a className="navbar-brand">Past Searches</a>
          <form className="d-flex" role="search">
            <input className="form-control" type="search" placeholder="Search" aria-label="Search"></input>
            <button className="btn btn-outline-success" type="submit">Search</button>
          </form>
        </div>
      </nav>
      <SearchesContainer />
    </>
  )
}

function SearchesContainer() {
  const [searches, setSearches] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ currentPage, setCurrentPage ] = useState(1);
  const startIndex = (currentPage - 1) * 10;
  const maxPages = useRef(null);
  const visibleSearches = searches?.slice(startIndex, currentPage * 10);
  
  useEffect(() => {
    (async () => {
      try {
        const fetchedSearches = await fetchSearches();
        maxPages.current = Math.ceil((fetchedSearches.length / 10));
        debugger;       
        setSearches(fetchedSearches);        
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    })();
  }, []);

  function handlePageNumberClick(pageNumber) {
    if (pageNumber) {
      setCurrentPage(pageNumber);
    }
  }

  function handlePreviousClick() {
    if (currentPage > 1) {      
      setCurrentPage(currentPage - 1);
    }
  }

  function handleNextClick() {     
    if (currentPage !== maxPages.current) {
      setCurrentPage(currentPage + 1);
    }
  }

  return (
    <>
      {loading && <p>Loading Your Searches...</p>}
      {!loading && <div>
        <ul className="d-flex flex-wrap justify-content-center" style={{gap: '.75rem'}}>
          {visibleSearches.map((search, index) => {
            return <SearchItem key={index} search={search}/>
          })}
        </ul>        
        <div className="d-flex justify-content-center align-items-center" style={{margin: '0 auto'}}>
          <ul className="pagination">
            <li className={`page-item ${currentPage === 1 && 'disabled'}`} onClick={handlePreviousClick}>
              <a className="page-link" href="#">Previous</a>
            </li>
            {Array.from(Array(maxPages.current), (_, index) => {
              const pageNumber = index + 1;

              return (
                <li
                  key={index}
                  className={`page-item ${currentPage === pageNumber && `active`}`}
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
      </div>}
    </>
  )
}

function SearchItem({ search }) {
  const router = useRouter();

  function handleDeleteSearch() {
    
  }

  function handleSearchItemClick(searchId) {
    router.push(`/fasterFastPeopleSearch/searches/${searchId}`);
  }
  
  return (
    <li className={`card d-flex flex-column align-items-start`} style={{padding: '.5rem'}}>
      <div className="card-body">
        <h4 className="card-title">{search["search_name"]}</h4>
      </div>
      <div className="card-body">
        <ul className="list-group" style={{textAlign: 'start'}}>
          <li className="list-group-item"><strong>Date Created: </strong>{search["created_at"].toDateString()}</li>
          <li className="list-group-item"><strong>Number of Contacts: </strong>{search["search_data"].length}</li>
        </ul>
      </div>
      <div className="d-flex justify-content-between align-items-center" style={{gap: '.5rem', width: '100%'}}>
        <button
          className="btn btn-success"
          onClick={handleSearchItemClick.bind(null, search.id)}>
          See Contacts
        </button>
        <button 
          className="btn btn-light"
          type="button"
          data-bs-toggle="modal"
          data-bs-target={`#delete`}>
          <BsFillTrash3Fill />
        </button>
      </div>
    </li>
  )
}