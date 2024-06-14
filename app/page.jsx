import Image from 'next/image';
import styles from './page.module.css';
import Link from 'next/link';
import { MdContacts } from "react-icons/md";

export default function Page() {
  return (
    <>
      <div className="d-flex flex-column justify-content-cneter align-items-center">
        <Image 
          src="/farm-friend-logo.png"
          width={300}
          height={300}
          alt="Farm Friend Logo"
        />
        <div className={`d-flex justify-content-center align-items-center`} style={{gap: '.5rem'}}>
          <Link href='/fasterFastPeopleSearch' className='btn btn-outline-success d-flex flex-column justify-content-center align-items-start' style={{gap: '.5rem'}}>
            <div className="d-flex align-items-center" style={{gap: '.5rem'}}>
              <MdContacts />
              <h4 style={{marginBottom: '0'}}><strong>Create a Search</strong></h4>
            </div>
            <p style={{textAlign: 'start', marginBottom: '0'}}>Upload any file you'd like and generate a list of free phone numbers</p>
          </Link>
          <Link href='/fasterFastPeopleSearch/searches' className='btn btn-outline-success d-flex flex-column justify-content-center align-items-start' style={{gap: '.5rem'}}>
            <div className="d-flex align-items-center" style={{gap: '.5rem'}}>
              <MdContacts />
              <h4 style={{marginBottom: '0'}}><strong>See Your Past Searches</strong></h4>
            </div>
            <p style={{textAlign: 'start', marginBottom: '0'}}>Search For, Filter, or Select a search from your previous searches.</p>
          </Link>
        </div>
      </div>
    </>
  )
}