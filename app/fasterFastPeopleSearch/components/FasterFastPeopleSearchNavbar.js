"use client";
import Link from 'next/link';

export default function FasterFastPeopleSearchNavbar() {
  return (
    <nav className="navbar navbar-expand-lg bg-dark" data-bs-theme="dark">
      <div className="container-fluid">
        <Link className="navbar-brand" href="#">Faster FastPeopleSearch</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link active" href="/fasterFastPeopleSearch/searches">Past Searches</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link active" href="/fasterFastPeopleSearch/createSearch">Create New Search</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}
