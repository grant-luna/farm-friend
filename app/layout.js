import Link from 'next/link';
import Image from 'next/image';
import './globals.css'
import styles from './page.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import BootstrapClient from './components/BootstrapClient';
import AccountDropdown from './components/AccountDropdown.js';

export const metadata = {
  title: 'Farm Friend',
  description: 'A companion for your fruitful farming efforts.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="navbar-expanded">
        <nav className={`navbar`} data-bs-theme="dark">
          <div className="container-fluid">
          <button
            className="navbar-toggler" 
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#navbarContent"
            aria-controls="navbarContent"
            aria-expanded="true"
            aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className={`offcanvas offcanvas-start`} data-bs-backdrop="false" id="navbarContent">
            <div className="offcanvas-header">
              <h5 className="offcanvas-title" id="offcanvasNavbarLabel">Farm Friend</h5>
              <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body">
              <ul className ="navbar-nav">
                <li className="nav-item">
                  <Link className="nav-link" href='/fasterFastPeopleSearch'>Faster FastPeopleSearch</Link>
                </li>
              </ul>
            </div>
          </div>
            <Link href='/'>
              <Image src='/farm-friend-logo.png' alt="Farm Friend Logo" width={100} height={100}/>
            </Link>
            <AccountDropdown />
          </div>
        </nav>
        <main className={styles.mainContent}>
          {children}
        </main>
        <BootstrapClient />
      </body>
    </html>
  );
}
