import Image from 'next/image';

export default function Page() {
  return (
    <>
      <div className="d-flex flex-column justify-content-cneter align-items-center">
        <h4>Welcome to Farm Friend</h4>
        <Image 
          src="/farm-friend-logo.png"
          width={300}
          height={300}
          alt="Farm Friend Logo"
        />
        <p>To get started select an application from the navigation menu.</p>
      </div>
    </>
  )
}