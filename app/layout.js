import Link from 'next/link';
import './globals.css'
import styles from './page.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import BootstrapClient from './components/BootstrapClient';
import AccountDropdown from './components/AccountDropdown';

export const metadata = {
  title: 'Farm Friend',
  description: 'A companion for your fruitful farming efforts.',
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
          <AccountDropdown />
        </header>
        <main className={styles.mainContent}>
          {children}
        </main>
        <BootstrapClient />
      </body>
    </html>
  );
}
