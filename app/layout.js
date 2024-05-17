import Link from 'next/link';
import './globals.css'
import styles from './page.module.css';
import 'bootstrap/dist/css/bootstrap.css';
import BootstrapClient from './components/BootstrapClient.js';

export const metadata = {
  title: 'Farm Friend',
  description: 'A componion for your fruitful farming efforts.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className={styles.headerLinks}>
          <h1><Link className={styles.headerLink} href='/'>Farm Friend</Link></h1>
        </header>
        <nav className={styles.navColumn}>
          <Link className={styles.navColumnLink} href='/fasterFastPeopleSearch'>Faster FastPeopleSearch</Link>
        </nav>
        <main className={styles.mainContent}>
          {children}
        </main>
        <BootstrapClient />
      </body>
    </html>
  )
}
