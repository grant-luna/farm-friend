"use client";
import Image from 'next/image';
import styles from '../page.module.css';
import { logout } from '../actions/logout.js';

export default function AccountDropdown() {
  async function handleSignOut() {
    await logout();
    window.location.href = '/signIn';
  }

  return (
    <div className="dropstart">
      <button className="btn btn-light dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
        <Image className={styles.dropdownIcon} src='/avatar-icon.png' alt="Avatar Icon" width={100} height={100}/>
      </button>
      <ul className="dropdown-menu">
        <li onClick={handleSignOut}>
          <a className="dropdown-item" href="#">Sign Out</a>
        </li>             
      </ul>
    </div>
  );
}
