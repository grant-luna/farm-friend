import Link from 'next/link';
import './globals.css'

export const metadata = {
  title: 'Farm Friend',
  description: 'A componion for your fruitful farming efforts.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header>
          <h1><Link href='/'>Farm Friend</Link></h1>
        </header>
        <nav>
          <ul>
            <li><Link href='/fasterFastPeopleSearch'>Faster FastPeopleSearch</Link></li>
          </ul>
        </nav>
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}
