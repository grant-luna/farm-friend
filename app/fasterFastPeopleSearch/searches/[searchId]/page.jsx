"use client";
import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { fetchSearchData } from '../../actions/fetchSearchData.js';

export default function MainContent({ params }) {
  const searchId = params.searchId;
  return <SearchResults searchId={searchId} />
}

function SearchResults({ searchId }) {
  const [searchData, setSearchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const fetchedSearchData = await fetchSearchData(searchId);
        setSearchData(fetchedSearchData.data["search_data"]);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setError(error);
        setLoading(false);
      }
    })();
  }, [searchId]);
  
  return (
    <>
      {loading && <p>Loading...</p>}
      {!loading && <ul className={`${styles.searchItems}`}>
        {searchData?.map((searchRow, index) => {
          return (
            <SearchItem searchRow={searchRow} key={index} />
          )
        })}
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
          <li><a class="dropdown-item" href={searchRow.primaryAddressLink} target="_blank"><strong>{searchRow.primaryAddress.address} | {searchRow.primaryAddress.cityState}</strong> <span className="badge text-bg-info">Primary Address</span></a></li>
          <li><a class="dropdown-item" href={searchRow.mailAddressLink} target="_blank"><strong>{searchRow.mailAddress.address} | {searchRow.mailAddress.cityState}</strong> <span className="badge text-bg-info">Mail Address</span></a></li>
        </ul>
      </div>
    </li>
  )
}