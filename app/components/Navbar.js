"use client";
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar({ isNavCollapsed, handleToggle }) {
  function toggleNavBar() {
    
  }

  return (
    <div
      className="navbar navbar-expand-md navbar-light bg-light"
      style={isNavCollapsed ? navbarStyles.collapsed : navbarStyles.expanded}
    >
      <div className="container-fluid">
        <a className="navbar-brand" href="#">Faster FastPeopleSearch</a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#fasterFastPeopleSearchNavbarContent"
          aria-controls="fasterFastPeopleSearchNavbarContent"
          aria-expanded={!isNavCollapsed}
          aria-label="Toggle navigation"
          onClick={handleToggle}
        >
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
      </div>
    </div>
  );
}
