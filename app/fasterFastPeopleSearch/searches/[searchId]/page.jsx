"use client";
import { useState, useEffect } from 'react';
import styles from './page.module.css';

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

  function handleContactInformationClick(contactInformationLink) {
    
  }

  return (
    <>
      {!loading && <ul>
        {searchData.map((searchRow, index) => {
          return (
            <li className={styles.searchItem} key={index}>
              <div>
                <h3>Primary Address</h3>
                <p><strong>Address: </strong>{searchRow.primaryAddress.address}</p>
                <p><strong>City / State: </strong>{searchRow.primaryAddress.cityState}</p>
                <button className="btn btn-primary" type="button" onClick={() => handleContactInformationClick(searchRow.primaryAddressLink)}>Contact Information</button>
              </div>
              <div>
                <h3>Mail Address</h3>
                <p><strong>Address: </strong>{searchRow.mailAddress.address}</p>
                <p><strong>City / State: </strong>{searchRow.mailAddress.cityState}</p>
                <button className="btn btn-primary" type="button" onClick={() => handleContactInformationClick(searchRow.mailAddressLink)}>Contact Information</button>
              </div>
              <div>
                <h3>Owner Name</h3>
                <p><strong>First Owner: </strong>{searchRow.ownerNames.firstOwner}</p>
                <p><strong>Second Owner: </strong>{searchRow.ownerNames.secondOwner}</p>
              </div>
            </li>
          )
        })};
      </ul>}
    </>
  )
}