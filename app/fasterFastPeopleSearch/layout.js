import Link from 'next/link';

export default function RootLayout({ children }) {
  return (
    <>
      <h1>Faster FastPeopleSearch</h1>
      <div className={` navbar bg-body-tertiary`}>
        <Link href='/fasterFastPeopleSearch/searches'>Searches</Link>
        <Link href='/fasterFastPeopleSearch/createSearch'>Create New Search</Link>
      </div>
      {children}
    </>
  )
}
