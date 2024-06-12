import Link from 'next/link';
import Image from 'next/image';
import './globals.css'
import styles from './page.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import BootstrapClient from './components/BootstrapClient';
import AccountDropdown from './components/AccountDropdown.js';
import { BsBell } from "react-icons/bs";

export const metadata = {
  title: 'Farm Friend',
  description: 'A companion for your fruitful farming efforts.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav className={`${styles.mainNavbar} d-flex justify-content-between align-items-center`} style={{padding: '1rem'}}>      
          <FarmFriendNavDropdown />
          <AccountDropdown />
        </nav>
      
        <main className={`${styles.mainContent}`}>
          {children}
        </main>
        <BootstrapClient />
      </body>
    </html>
  );
}

function FarmFriendNavDropdown() {
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
