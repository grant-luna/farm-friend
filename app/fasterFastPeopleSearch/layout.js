import Link from 'next/link';

export default function RootLayout({ children }) {
  return (
    <>
      <div className={`navbar`}>
        <div className="container-fluid">
          <a className="navbar-brand" href="#">Faster FastPeopleSearch</a>
          <FasterFastPeopleSearchNavBar />
        </div>
      </div>
      {children}
    </>
  )
}

function FasterFastPeopleSearchNavBar() {
  return (
    <>
       <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#fasterFastPeopleSearchNavbarContent"
          aria-controls="fasterFastPeopleSearchNavbarContent"
          aria-expanded="true"
          aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
      <div className="collapse navbar-collapse" id="fasterFastPeopleSearchNavbarContent">
          <ul className="navbar-nav">
            <li className="navbar-item">
              <Link className="nav-link" href='/fasterFastPeopleSearch/createSearch'>Create New Search</Link>
            </li>
            <li className="navbar-item">
              <Link className="nav-link" href='/fasterFastPeopleSearch/searches'>Searches</Link>        
            </li>
          </ul>
        </div>
    </>
  )
}