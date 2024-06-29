"use client";
import styles from './page.module.css';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { verifyUser } from '../actions/verifyUser.js';
import { login } from '../actions/login.js';
import toast, { Toaster } from 'react-hot-toast';

export default function SignInModal() {
  const [ formData, setFormData ] = useState({
    userEmail: '',
    userPassword: '',
  });

  const [ formIsSubmittable, setFormIsSubmittable ] = useState(false);

  function displayErrorToast(errorMessage) {
    toast.error(errorMessage);    
  }

  function handleOnChange(event) {
    const { id, value } = event.target;
    setFormData({ ...formData, [id]: value });
  }

  useEffect(() => {
    verifyFormSubmittableStatus();
  });

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
      const verifyUserResponse = await verifyUser(formData);
      if (verifyUserResponse.error) {
        displayErrorToast(verifyUserResponse.error);        
        return;
      }      
      login(verifyUserResponse);
    } catch (error) {
      console.error('Failed login attempt:', error);      
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
              <Toaster />
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
              <p>Looking to set up a free account? <Link className="btn btn-primary" href='/signUp'>Sign Up</Link></p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
