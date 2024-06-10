import FasterFastPeopleSearchNavbar from './components/FasterFastPeopleSearchNavbar.js';

export default function RootLayout({ children }) {
  return (
    <>
      <FasterFastPeopleSearchNavbar />
      {children}
    </>
  )
}