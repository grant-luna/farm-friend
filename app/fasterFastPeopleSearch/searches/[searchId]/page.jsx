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
  
  
  useEffect(() => {
    (async () => {
      try {
        const fetchedSearchData = await fetchSearchData(searchId);
        window.location.
        setSearchData(fetchedSearchData.data["search_data"]);
        setLoading(false);
      } catch (error) {
        // display error
        console.error(error);
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

function SearchItem({ searchRow, index }) {
  return (
    <li className={`${styles.searchItem} card text-start`}>
      <div className="card-body">
        <h5 className="card-title">{searchRow["Primary Address"]["Address"]}</h5>
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
          className="btn btn-primary dropdown-toggle"
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
                {searchRow["Primary Address"]["Address"]} | {`${searchRow["Primary Address"]["City"]} ${searchRow["Primary Address"]["State"]} `}
              </strong>
              <span className="badge text-bg-info">Primary Address</span>
            </a>
          </li>
          <li>
            <a className="dropdown-item" href={searchRow["Mail Address"]["FastPeopleSearch Url"]} target="_blank">
              <strong>
                {searchRow["Mail Address"]["Address"]} | {`${searchRow["Mail Address"]["City"]} ${searchRow["Mail Address"]["State"]} `}
              </strong>
              <span className="badge text-bg-info">Mail Address</span>
            </a>
          </li>
        </ul>
      </div>
    </li>
  );
}
