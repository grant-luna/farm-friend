"use client"
import styles from './page.module.css';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchSearches } from '../actions/fetchSearches.js';

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
        console.log(fetchedSearches);
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
      {!loading && <ul className={styles.searchesContainer}>
        {searches.map((search, index) => {
          return <SearchItem key={index} search={search}/>
        })}
      </ul>}
    </>
  )
}

function SearchItem({ search }) {
  const router = useRouter();

  function handleSearchItemClick(searchId) {
    router.push(`/fasterFastPeopleSearch/searches/${searchId}`);
  }
  
  return (
    <li className={styles.searchItem} onClick={handleSearchItemClick.bind(null, search.id)}>
      {search.id}
      {search["created_at"].toDateString()}
    </li>
  )
}