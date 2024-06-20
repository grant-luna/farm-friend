"use client"
import Link from 'next/link';

export default function FarmFriendNavDropdown() {  
  return (
    <div className="dropdown">
      <button 
          className="btn btn-outline-light dropdown-toggle"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          style={{color: 'black'}}>
          Farm Friend
        </button>
      <ul className="dropdown-menu">
        <li>
          <Link className="dropdown-item" href='/fasterFastPeopleSearch'>Faster FastPeopleSearch</Link>
        </li>
      </ul>
    </div>
  )
}