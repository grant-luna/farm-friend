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
                <button className="btn btn-primary" type="button" data-bs-toggle="offcanvas" href={`#searchRowPrimaryAddress${index}Offcanvas`} aria-controls={`searchRowPrimaryAddress${index}Offcanvas`}>
                  Contact Information
                </button>
                <FastPeopleSearchOffcanvas index={index} addressType={"Primary Address"} fastPeopleSearchLink={searchRow.primaryAddressLink} />
              </div>
              <div>
                <h3>Mail Address</h3>
                <p><strong>Address: </strong>{searchRow.mailAddress.address}</p>
                <p><strong>City / State: </strong>{searchRow.mailAddress.cityState}</p>
                <button className="btn btn-primary" type="button" data-bs-toggle="offcanvas" href={`#searchRowMailAddress${index}Offcanvas`} aria-controls={`searchRowPrimaryAddress${index}Offcanvas`}>
                    Contact Information
                </button>
                <FastPeopleSearchOffcanvas index={index} addressType={"Mail Address"} fastPeopleSearchLink={searchRow.mailAddressLink} />
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

function FastPeopleSearchOffcanvas({ index, addressType, fastPeopleSearchLink}) {
  return (
    <div className="offcanvas offcanvas-start" id={`searchRow${addressType.replace(/ /g, '')}${index}Offcanvas`}>
      <div className="offcanvas-header">
        <h5 className="offcanvas-title" id="offcanvasExampleLabel">Offcanvas</h5>
        <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div className="offcanvas-body">
        <div>
          Some text as placeholder. In real life you can have the elements you have chosen. Like, text, images, lists, etc.
        </div>
        <div className="dropdown mt-3">
          <button className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
            Dropdown button
          </button>
          <ul className="dropdown-menu">
            <li><a className="dropdown-item" href="#">Action</a></li>
            <li><a className="dropdown-item" href="#">Another action</a></li>
            <li><a className="dropdown-item" href="#">Something else here</a></li>
          </ul>
        </div>
      </div>
    </div>
  )
}