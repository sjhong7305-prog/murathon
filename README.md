# MU:RATHON

가격 후원(PWYW, Pay What You Want) 구매 플로우를 갖춘 아티스트 직거래 플랫폼 프로토타입입니다.
유통사/플랫폼 수수료 없이 아티스트와 팬을 직접 연결한다는 컨셉으로, 음원·굿즈·공연 티켓을 팬이 원하는 가격에 구매할 수 있습니다.

## 실행

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인할 수 있습니다.

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
