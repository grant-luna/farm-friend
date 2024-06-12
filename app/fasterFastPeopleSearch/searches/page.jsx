"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchSearches } from '../actions/fetchSearches.js';
import { BsFillTrash3Fill } from "react-icons/bs";

export default function MainContent() {
  return (
    <>
      <h2>Searches</h2>
      <SearchesContainer />
    </>
  )
}

function SearchesContainer() {
  const [searches, setSearches] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    (async () => {
      try {
        const fetchedSearches = await fetchSearches();
        
        setSearches(fetchedSearches);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      {loading && <p>Loading Your Searches...</p>}
      {!loading && <ul className="d-flex flex-wrap justify-content-center" style={{gap: '.75rem'}}>
        {searches.map((search, index) => {
          return <SearchItem key={index} search={search}/>
        })}
      </ul>}
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
          className="btn btn-primary"
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