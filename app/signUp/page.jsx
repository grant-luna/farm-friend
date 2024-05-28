"use client";
import styles from './page.module.css';
import { useState, useEffect, createContext, useContext } from 'react';
import Link from 'next/link';
import { validateFormInputs } from './lib/helpers.js';
import bcrypt from 'bcryptjs';

const ErrorObjectContext = createContext();
export default function SignUpForm() {
  const [ formIsEmpty, setFormIsEmpty ] = useState(true);
  const [ formIsSubmittable, setFormIsSubmittable ] = useState(false);

  const [formData, setFormData] = useState({
    userFirstName: '',
    userLastName: '',
    userEmail: '',
    userPassword: ''
  });

  const [ errorObject, setErrorObject ] = useState(
    {
      userFirstName: { message: undefined },
      userLastName: { message: undefined },
      userEmail: { message: undefined },
      userPassword: { message: undefined },
      errorsExist() {
        return Object.keys(this).some((userInputId) => this[userInputId].message !== undefined);
      }
    }
  );

  useEffect(() => {
    validateFormInputs(formData, errorObject, setErrorObject);
    setFormIsSubmittable(!errorObject.errorsExist());
    if (Object.keys(formData).some((userInputId) => formData[userInputId].length > 0)) {
      setFormIsEmpty(false);
    } else {
      setFormIsEmpty(true);
    }
  }, [formData]);

  function handleOnChange(event) {
    const { id, value } = event.target;
    setFormData({ ...formData, [id]: value });
  }

  async function handleSubmitForm(event) {
    event.preventDefault();

    if (!errorObject.errorsExist()) {
      try {
        const response = await fetch('/api/signUp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        const responseData = await response.json();
        debugger;
      } catch (error) {
        console.log('Error:',)
      }
    }
  }

  return (
    <>
      <ErrorObjectContext.Provider value={{ errorObject, setErrorObject }}>
        <h4>Sign Up</h4>
        <form onSubmit={handleSubmitForm} className={`${styles.signUpForm}`}>
          <div className="form-floating">
            <input 
              className={`form-control ${!formIsEmpty && (errorObject.userFirstName.message ? 'is-invalid' : 'is-valid')}`}
              id="userFirstName" 
              type="text" 
              placeholder="First Name" 
              value={formData.userFirstName} 
              onChange={handleOnChange} 
            />
            <InputFeedback userInputId={'userFirstName'} />
            <label htmlFor="userFirstName">First Name</label>
          </div>
          <div className="form-floating">
            <input 
              className={`form-control ${!formIsEmpty && (errorObject.userLastName.message ? 'is-invalid' : 'is-valid')}`}
              id="userLastName" 
              type="text" 
              placeholder="Last Name" 
              value={formData.userLastName} 
              onChange={handleOnChange} 
            />
            <InputFeedback userInputId={'userLastName'} />
            <label htmlFor="userLastName">Last Name</label>
          </div>
          <div className="form-floating">
            <input 
              className={`form-control ${!formIsEmpty && (errorObject.userEmail.message ? 'is-invalid' : 'is-valid')}`}
              id="userEmail" 
              type="email" 
              placeholder="Email Address" 
              value={formData.userEmail} 
              onChange={handleOnChange} 
            />
            <InputFeedback userInputId={'userEmail'} />
            <label htmlFor="userEmail">Email Address</label>
          </div>
          <div className="form-floating">
            <input 
              className={`form-control ${!formIsEmpty && (errorObject.userPassword.message ? 'is-invalid' : 'is-valid')}`}
              type="password" 
              id="userPassword" 
              placeholder="Password" 
              value={formData.userPassword} 
              onChange={handleOnChange} 
            />
            <InputFeedback userInputId={'userPassword'} />
            <label htmlFor="userPassword">Password</label>
          </div>
          <div>
            <button
              type="submit" 
              className={`btn btn-${formIsSubmittable ? 'primary' : 'light'}`}
              disabled={errorObject.errorsExist()}
            >
              Create Account
            </button>
            <button type="button" className="btn btn-light" onClick={() => setFormData({
              userFirstName: '',
              userLastName: '',
              userEmail: '',
              userPassword: ''
            })}>Reset</button>
          </div>
        </form>
        <p>Already have an account? <Link className="btn btn-primary" href='/signIn'>Sign In</Link></p>
      </ErrorObjectContext.Provider>
    </>
  );
}

function InputFeedback({ userInputId }) {
  const { errorObject } = useContext(ErrorObjectContext);

  return (
    <>
      <div className="valid-feedback">
        Looks good!
      </div>
      <div className="invalid-feedback">
        {errorObject[userInputId].message}
      </div>
    </>
  )
}