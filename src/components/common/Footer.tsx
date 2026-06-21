import styles from './Footer.module.scss'

const STACK = ['React 18', 'TypeScript', 'Vite', 'SCSS', 'Zustand', 'Gemini API', 'YouTube Data API']

export default function Footer() {
  return (
    <footer className={styles.footer}>
      {STACK.map((tech) => (
        <span key={tech} className={styles.chip}>{tech}</span>
      ))}
    </footer>
  )
}
