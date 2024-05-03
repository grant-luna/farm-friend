import Link from 'next/link';
import './globals.css'
import styles from './page.module.css';

export const metadata = {
  title: 'Farm Friend',
  description: 'A componion for your fruitful farming efforts.',
}

export default function RootLayout({ children }) {
  const plainLinkStyles = { color: 'white', textDecoration: 'none' };

  return (
    <html lang="en">
      <body>
        <header>
          <h1><Link className={styles.headerLink} href='/'>Farm Friend</Link></h1>
        </header>
        <nav className={styles.navColumn}>
          <Link className={styles.navColumnLink} href='/fasterFastPeopleSearch'>Faster FastPeopleSearch</Link>
        </nav>
        <main className={styles.mainContent}>
          {children}
        </main>
      </body>
    </html>
  )
}

// style={{...plainLinkStyles, fontSize: '1.5rem'}}
// style={{...plainLinkStyles, fontSize: '1.25rem'}}
