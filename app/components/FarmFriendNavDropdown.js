"use client"
import Link from 'next/link';
import { BsReverseLayoutTextWindowReverse } from "react-icons/bs";


export default function FarmFriendNavDropdown() {
  function handleAsideToggle() {
    const body = document.querySelector('body');
    
    if (body.classList.contains('collapsed')) {
      body.classList.remove('collapsed');
      body.classList.add('expanded');
    } else {
      // body.className === 'expanded'
      body.classList.remove('expanded');
      body.classList.add('collapsed');
    }
  }

  return (
    <div className="dropdown">
      <button className="btn btn-light" onClick={handleAsideToggle}>
        <BsReverseLayoutTextWindowReverse />
      </button>
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