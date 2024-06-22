import Image from 'next/image';
import Link from 'next/link';
import { MdContacts } from "react-icons/md";
import { IoSearchCircle } from "react-icons/io5";

export default function Page() {
  const linkStyles = {gap: '.5rem', color: 'black', width: '300px', outline: '1px solid black', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)'};

  return (
    <>
      <div style={{marginTop: '5rem'}} className="d-flex flex-column justify-content-cneter align-items-center">
        <Image 
          src="/farm-friend-logo.png"
          width={200}
          height={200}
          alt="Farm Friend Logo"
        />
        <div className={`d-flex justify-content-center align-items-center`} style={{gap: '.5rem'}}>
          <Link href='/fasterFastPeopleSearch/createSearch' className='btn btn-outline-light d-flex flex-column justify-content-center align-items-start' style={linkStyles}>
            <div className="d-flex align-items-center" style={{gap: '.5rem'}}>
              <IoSearchCircle size={40} color="#008080"/>
              <h4 style={{marginBottom: '0'}}><strong>Create a Search</strong></h4>
            </div>
            <p style={{textAlign: 'start', marginBottom: '0'}}>Upload any file you&apos;d like and generate a list of free phone numbers</p>
          </Link>
          <Link href='/fasterFastPeopleSearch/searches' className='btn btn-outline-light d-flex flex-column justify-content-center align-items-start' style={linkStyles}>
            <div className="d-flex align-items-center" style={{gap: '.5rem'}}>
              <MdContacts size={35} color="#F4C430"/>
              <h4 style={{marginBottom: '0'}}><strong>Past Searches</strong></h4>
            </div>
            <p style={{textAlign: 'start', marginBottom: '0'}}>Search For, Filter, or Select a search from your previous searches.</p>
          </Link>
        </div>
      </div>
    </>
  )
}