import Link from 'next/link';
import './globals.css'
import styles from './page.module.css';
import 'bootstrap/dist/css/bootstrap.css';
import BootstrapClient from './components/BootstrapClient.js';
import Image from 'next/image';

export const metadata = {
  title: 'Farm Friend',
  description: 'A componion for your fruitful farming efforts.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className={`${styles.headerLinks} navbar`} data-bs-theme="dark">
          <button 
            className="navbar-toggler" 
            type="button"
            data-bs-toggle="collapse"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <h1><Link className={styles.headerLink} href='/'>Farm Friend</Link></h1>
          <Link className={styles.navColumnLink} href='/fasterFastPeopleSearch'>Faster FastPeopleSearch</Link>
          <div className="dropdown">
            <button className="btn btn-light dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <Image className={styles.dropdownIcon} src='/avatar-icon.png' alt="Avatar Icon" width={100} height={100}/>
            </button>
            <ul className="dropdown-menu">
              <li><a className="dropdown-item" href="#">Sign Out</a></li>
              <li><a className="dropdown-item" href="#">Contact Support</a></li>
            </ul>
          </div>
        </header>
        <main className={styles.mainContent}>
          {children}
        </main>
        <BootstrapClient />
      </body>
    </html>
  )
}
