import { Link } from 'react-router-dom'
import styles from './GNB.module.scss'

export default function GNB() {
  return (
    <header className={styles.gnb}>
      <Link to="/" className={styles.logo}>IN-Fit</Link>
    </header>
  )
}
