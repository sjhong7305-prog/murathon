# MU:RATHON

가격 후원(PWYW, Pay What You Want) 구매 플로우를 갖춘 아티스트 직거래 플랫폼 프로토타입입니다.
유통사/플랫폼 수수료 없이 아티스트와 팬을 직접 연결한다는 컨셉으로, 음원·굿즈·공연 티켓을 팬이 원하는 가격에 구매할 수 있습니다.

## 구조

MU:RATHON(사용자 사이트)과 백오피스는 **서로 다른 앱**으로 따로 실행·배포합니다. npm workspaces 모노레포입니다.

| 경로 | 내용 | 포트 |
|---|---|---|
| `apps/web` | MU:RATHON 사용자 사이트 | 3000 |
| `apps/backoffice` | 운영자 백오피스 (`/backoffice`, 외부 공개 금지) | 3001 |
| `packages/db` | Prisma 스키마·클라이언트, 관리자 계정 생성 스크립트 | — |
| `packages/shared` | 두 앱이 함께 쓰는 타입·포맷 함수·히어로 이미지 경로 | — |

## 실행

```bash
cp .env.example .env   # DATABASE_URL, REVALIDATE_SECRET 채우기
npm install            # Prisma 클라이언트도 함께 생성됨

npm run dev:web          # http://localhost:3000
npm run dev:backoffice   # http://localhost:3001
```

DB 관련: `npm run db:push`(스키마 반영), `npm run db:seed`(예시 데이터), `npm run db:create-admin`(관리자 계정).

백오피스에서 상품·아티스트·히어로를 수정하면 `STOREFRONT_URL`의 `/api/revalidate`를 호출해 사용자 사이트 페이지를 새로고침합니다. 두 앱의 `REVALIDATE_SECRET`이 같아야 합니다.

## 구성

- **Next.js App Router + TypeScript + Tailwind CSS**
- 목업 데이터: `src/lib/data.ts` (아티스트 4팀, 상품 8종)
- 장바구니 상태: `src/context/cart-context.tsx` (React Context + `localStorage`)
- PWYW 가격 선택 UI: `src/components/price-selector.tsx`

## 플로우

1. `/` 홈 — 아티스트 목록 / 인기 발매작
2. `/artists/[slug]` — 아티스트 소개 및 상품 목록
3. `/products/[id]` — 상품 상세, PWYW 가격 선택, 장바구니 담기 / 바로 구매
4. `/cart` — 장바구니 (가격·수량 수정 가능)
5. `/checkout` — 구매자 정보 입력 (모의 결제, 실제 결제 없음)
6. `/checkout/success` — 주문 완료 및 요약

실제 결제/백엔드는 연동되어 있지 않은 프론트엔드 프로토타입입니다.
