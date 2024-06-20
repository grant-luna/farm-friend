import FasterFastPeopleSearchNavbar from './components/FasterFastPeopleSearchNavbar.js';
import styles from './page.module.css';

export default function RootLayout({ children }) {
  return (
    <div>
      <FasterFastPeopleSearchNavbar />
      {children}
    </div>
  )
}