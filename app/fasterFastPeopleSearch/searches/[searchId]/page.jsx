"use client";
import { useState, useEffect } from 'react';
import styles from './page.module.css';
import Image from 'next/image';

export default function MainContent({ params }) {
  const searchId = params.searchId;
  return <SearchResults searchId={searchId} />
}

function SearchResults({ searchId }) {
  const [searchData, setSearchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSearchData(searchId) {
      try {
        const fetchedData = await fetch(`/fasterFastPeopleSearch/findSearch/${searchId}`, {
          method: 'GET',
        });
        const parsedData = await fetchedData.json();
        const searchData = JSON.parse(parsedData["search_data"]);
        
        setSearchData(searchData);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setError(error);
        setLoading(false);
      }
    }

    fetchSearchData(searchId);
  }, [searchId])
  
  return (
    <>
      {!loading && <ul className={`${styles.searchItems}`}>
        {searchData.map((searchRow, index) => {
          return (
            <SearchItem searchRow={searchRow} key={index} />
          )
        })};
      </ul>}
    </>
  )
}

function SearchItem({ searchRow, index}) {
  return (
    <li className={`${styles.searchItem} card text-start`}>
      <div className="card-body">
        <h5 className="card-title">{searchRow.primaryAddress.address}</h5>
        <p className="card-text">{searchRow.primaryAddress.cityState}</p>
      </div>
      <div className="card-header">
        Owned By:
      </div>
      <ul className="list-group list-group-flush">
        {Object.keys(searchRow.ownerNames).filter((owner) => {
          return searchRow.ownerNames[owner].length > 0;
        }).map((owner, index) => {
          return <li className={`list-group-item`} key={index}>{`${searchRow.ownerNames[owner]}`}</li>
        })}
      </ul>
      <div className="card-body dropdown">
        <button
          className="btn btn-primary dropdown-toggle" 
          href="#" role="button" 
          data-bs-toggle="dropdown" 
          >
          Contact Information
        </button>
        <ul class="dropdown-menu">
          <li><a class="dropdown-item" href="#">Primary Address Contact Information</a></li>
          <li><a class="dropdown-item" href="#">Mail Address Contact Information</a></li>
        </ul>
      </div>
      <SearchItemOffCanvas searchRow={searchRow} index={index}/>
    </li>
  )
}

function SearchItemOffCanvas({ searchRow, index }) {
  return (
    <div
      className={`offcanvas offcanvas-end text-bg-dark`}
      data-bs-scroll="true"
      data-bs-backdrop="false"
      id={`searchItem${index}Offcanvas`}
      aria-labelledby={`searchItem${index}OffcanvasLabel`}
    >
      <div className="offcanvas-header">
        <h5 className="offcanvas-title" id={`searchItem${index}OffcanvasLabel`}>Contact Information</h5>
        <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div className="offcanvas-body">
        <div className>
          {JSON.stringify(searchRow)}
        </div>
      </div>
    </div>
  )
}