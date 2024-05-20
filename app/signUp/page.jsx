"use client"
import styles from './page.module.css';
import Link from 'next/link';
import { signUp } from '../lib/signUp.js';

export default function SignUpForm() {
  return (
    <>
      <h4>Sign Up</h4>
      <form action={signUp} className={styles.signUpForm}>
        <div className="form-floating">
          <input className="form-control" id="userFirstName" type="text" placeholder="First Name"></input>
          <label for="userFirstName">First Name</label>
        </div>
        <div className="form-floating">
          <input className="form-control" id="userLastName" type="text" placeholder="Last Name"></input>
          <label for="userLastName">Last Name</label>
        </div>
        <div className="form-floating">
          <input className="form-control" id="userEmail" type="email" placeholder="nEmail Address"></input>
          <label for="userEmail">Email Address</label>
        </div>
        <div className="form-floating">
          <input className="form-control" type="password" id="userPassword"  placeholder="Password"></input>
          <label for="userPassword">Password</label>
        </div>
        <div>
          <button type="submit" className="btn btn-primary">Submit</button>
        </div>
      </form>
      <p>Already have an account? <Link href='/signIn'>Sign In</Link></p>
    </>
  )
}