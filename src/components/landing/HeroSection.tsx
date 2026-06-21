import { useNavigate } from 'react-router-dom'
import Button from '@/components/common/Button'
import PreviewCard from './PreviewCard'
import styles from './HeroSection.module.scss'

export default function HeroSection() {
  const navigate = useNavigate()

  return (
    <section className={styles.hero}>
      <div className={styles.left}>
        <span className={styles.badge}>✦ AI-Powered Influencer Matching</span>
        <h1 className={styles.headline}>
          Find Your<br />Influencer.
        </h1>
        <p className={styles.desc}>
          브랜드 정보만 입력하면 AI가 유튜브 인플루언서를 자동 탐색하고
          콘텐츠 적합성, 리스크, 허수 여부까지 분석해드립니다.
        </p>
        <Button size="lg" onClick={() => navigate('/app')}>
          분석 시작하기 →
        </Button>
      </div>
      <div className={styles.right}>
        <PreviewCard />
      </div>
    </section>
  )
}
