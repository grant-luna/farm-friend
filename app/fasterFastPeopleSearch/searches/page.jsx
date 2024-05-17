"use client"
import styles from './page.module.css';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
    async function findSearches() {
      try {
        const fetchedSearches = await fetch('/fasterFastPeopleSearch/findSearches');
        const parsedSearches = await fetchedSearches.json();
        setSearches(parsedSearches.rows)
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    }

    findSearches()
  })

  return (
    <>
      <p>Searches</p>
      {!loading && <ul>
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
    <li className={styles.searchItem} onClick={() => handleSearchItemClick(search.id)}>{search.id}</li>
  )
}