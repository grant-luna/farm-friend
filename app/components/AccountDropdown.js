"use client";
import Image from 'next/image';
import styles from '../page.module.css';
import { logout } from '../actions/logout.js';
import { CgProfile } from "react-icons/cg";

export default function AccountDropdown() {
  async function handleSignOut() {
    await logout();
    window.location.href = '/signIn';
  }

  return (
    <div className="dropstart">
      <button className="btn btn-light dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
        <CgProfile size={30} />
      </button>
      <ul className="dropdown-menu">
        <li onClick={handleSignOut}>
          <a className="dropdown-item" href="#">Sign Out</a>
        </li>             
      </ul>
    </div>
  );
}
