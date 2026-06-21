import GNB from '@/components/common/GNB'
import Footer from '@/components/common/Footer'
import HeroSection from '@/components/landing/HeroSection'
import styles from './LandingPage.module.scss'

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <GNB />
      <main className={styles.main}>
        <HeroSection />
      </main>
      <Footer />
    </div>
  )
}
