# InFit — 프로젝트 CLAUDE.md

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프레임워크 | React 18 + Vite + TypeScript |
| 스타일 | SCSS (CSS Modules) |
| 상태관리 | Zustand |
| HTTP | axios |
| 차트 | Recharts |
| AI | Gemini API (gemini-1.5-flash) |
| 데이터 | YouTube Data API v3 |
| 배포 | Vercel |

## 실행 명령어

```bash
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 미리보기
```

## 폴더 구조

```
src/
  components/
    common/      # GNB, Footer, Button, Badge, Modal
    search/      # SearchInput, ChannelCard, ChannelDropdown
    analyzing/   # StepProgress, LoadingSpinner
    result/      # ScoreCard, RadarChart, BarChart, ImagePanel, TextPanel, RiskPanel
  pages/         # HomePage, AnalyzingPage, ResultPage, NotFoundPage
  stores/        # searchStore, analysisStore, resultStore (Zustand)
  services/      # infit.ts — API 호출
  styles/        # SCSS 변수·믹스인·리셋·글로벌
  utils/         # scoring.ts, formatters.ts
api/             # Vercel Serverless Functions (5개)
docs/            # PRD, 학술보고서, 노트북
```

## 환경변수

`.env.example` 참고. Vercel 대시보드에도 동일하게 등록 필요.

- `YOUTUBE_API_KEY`
- `GEMINI_API_KEY`

## 경로 alias

`@/` → `src/` (vite.config.ts + tsconfig.app.json 설정 완료)

## 개발 현황 (마일스톤)

- [x] M1 환경 구성
- [ ] M2 검색 기능
- [ ] M3 분석 파이프라인
- [ ] M4 결과 대시보드
- [ ] M5 QA & 배포
