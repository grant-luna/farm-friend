import Link from 'next/link';

export default function RootLayout({ children }) {
  return (
    <>
      <h1>Faster FastPeopleSearch</h1>
      <div>
        <button type="button" className="btn btn-light"><Link href='/fasterFastPeopleSearch/searches'>Searches</Link></button>
        <button type="button" className="btn btn-light"><Link href='/fasterFastPeopleSearch/createSearch'>Create New Search</Link></button>
      </div>
      {children}
    </>
  )
}
