"use client";
import styles from './page.module.css';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { verifyUser } from '../actions/verifyUser.js';
import { login } from '../actions/login.js';

export default function SignInModal() {
  const [ formData, setFormData ] = useState({
    userEmail: '',
    userPassword: '',
  });

  const [ formIsSubmittable, setFormIsSubmittable ] = useState(false);

  function handleOnChange(event) {
    const { id, value } = event.target;
    setFormData({ ...formData, [id]: value });
  }

  useEffect(() => {
    verifyFormSubmittableStatus();
  })

  function verifyFormSubmittableStatus() {
    if (Object.keys(formData).every((inputId) => {
      return formData[inputId].length > 0
    })) {
      setFormIsSubmittable(true);
    } else {
      setFormIsSubmittable(false);
    }
  }

  async function handleFormSubmission(event) {
    event.preventDefault();

    try {
      const user = await verifyUser(formData);
      login(user);
    } catch (error) {
      // display error
    }
  }

  return (
    <>
      <div className="modal-backdrop show"></div>
      <div
        className="modal show d-block"
        id="signInModal"
        tabIndex="-1"
        aria-labelledby="signInModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="signInModalLabel">Sign In</h5>
            </div>
            <div className="modal-body">
              <form className={styles.signInForm}>
                <div className="form-floating">
                  <input onChange={handleOnChange} className="form-control" id="userEmail" type="email" placeholder="Email Address"></input>
                  <label htmlFor="userEmail">Email Address</label>
                </div>
                <div className="form-floating">
                  <input onChange={handleOnChange} className="form-control" type="password" id="userPassword" placeholder="Password"></input>
                  <label htmlFor="userPassword">Password</label>
                </div>
                <div>
                  <button type="submit" onClick={handleFormSubmission} disabled={!formIsSubmittable} className="btn btn-primary">Sign In</button>
                </div>
              </form>
              <p>Already have an account? <Link className="btn btn-primary" href='/signUp'>Sign Up</Link></p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


/*
function SignInForm() {
  const [ formData, setFormData ] = useState({
    userEmail: '',
    userPassword: '',
  });

  const [ formIsSubmittable, setFormIsSubmittable ] = useState(false);

  function handleOnChange(event) {
    const { id, value } = event.target;
    setFormData({ ...formData, [id]: value });
  }

  useEffect(() => {
    verifyFormSubmittableStatus();
  })

  function verifyFormSubmittableStatus() {
    if (Object.keys(formData).every((inputId) => {
      return formData[inputId].length > 0
    })) {
      setFormIsSubmittable(true);
    } else {
      setFormIsSubmittable(false);
    }
  }

  async function handleFormSubmission(event) {
    event.preventDefault();

    try {
      const user = await verifyUser(formData);
      login(user);
    } catch (error) {
      // display error
    }
  }

  return (
    <>
      <form className={`${styles.signInForm}`}>
        <h4>Sign In</h4>
        <div className="form-floating">
          <input onChange={handleOnChange} className="form-control" id="userEmail" type="email" placeholder="nEmail Address"></input>
          <label htmlFor="userEmail">Email Address</label>
        </div>
        <div className="form-floating">
          <input onChange={handleOnChange} className="form-control" type="password" id="userPassword"  placeholder="Password"></input>
          <label htmlFor="userPassword">Password</label>
        </div>
        <div>
          <button type="submit" onClick={handleFormSubmission} disabled={!formIsSubmittable} className="btn btn-primary">Submit</button>
          <button type="button" className="btn btn-light">Reset</button>
        </div>
      </form>
      <p>Already have an account? <Link className="btn btn-primary" href='/signUp'>Sign Up</Link></p>
    </>
  )
}
*/

