import styles from './page.module.css';
import Link from 'next/link';

export default function SignInForm() {
  return (
    <>
      <form className={styles.signInForm}>
        <h4>Sign In</h4>
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
      <p>Already have an account? <Link href='/signUp'>Sign Up</Link></p>
    </>
  )
}