export interface MockOrder {
  id: string;
  buyerNickname: string;
  productId: string;
  price: number;
  cheerMessage?: string;
  promptQuestion?: string;
  promptAnswer?: string;
  isSupporter: boolean;
  reactions: { heart: number; pray: number };
}

export const mockOrders: MockOrder[] = [
  {
    id: "MRT-DEMO1",
    buyerNickname: "민지",
    productId: "p1",
    price: 10000,
    cheerMessage: "새벽에 듣기 딱 좋아요. 다음 앨범도 기대할게요!",
    promptQuestion: "가장 좋아하는 곡은 무엇인가요?",
    promptAnswer: "3번 트랙 '잔상' 이요, 기타 톤이 미쳤어요",
    isSupporter: true,
    reactions: { heart: 12, pray: 3 },
  },
  {
    id: "MRT-DEMO2",
    buyerNickname: "하늘",
    productId: "p2",
    price: 32000,
    cheerMessage: "공연 때 입고 갈게요 ❤️",
    isSupporter: true,
    reactions: { heart: 5, pray: 0 },
  },
  {
    id: "MRT-DEMO3",
    buyerNickname: "재현",
    productId: "p3",
    price: 0,
    cheerMessage: "0원으로 듣지만 다음엔 꼭 값을 치를게요, 화이팅!",
    promptQuestion: "가산유스에게 하고 싶은 한마디는?",
    promptAnswer: "라이브가 진짜 미쳤어요 또 보러갈게요",
    isSupporter: false,
    reactions: { heart: 8, pray: 6 },
  },
  {
    id: "MRT-DEMO4",
    buyerNickname: "동욱",
    productId: "p4",
    price: 15000,
    cheerMessage: "티켓팅 성공했어요! 현장에서 뵐게요",
    promptQuestion: "가산유스에게 하고 싶은 한마디는?",
    promptAnswer: "드럼이 심장을 후려쳐요",
    isSupporter: true,
    reactions: { heart: 7, pray: 2 },
  },
  {
    id: "MRT-DEMO5",
    buyerNickname: "바다",
    productId: "p5",
    price: 8000,
    cheerMessage: "제주 여행 때 이 앨범 들으면서 운전했어요",
    promptQuestion: "요즘 어떤 계절 감정을 느끼고 있나요?",
    promptAnswer: "여름이 끝나가는 아쉬움이요",
    isSupporter: true,
    reactions: { heart: 20, pray: 1 },
  },
  {
    id: "MRT-DEMO6",
    buyerNickname: "윤슬",
    productId: "p6",
    price: 15000,
    cheerMessage: "장바구니 대신 에코백 들고 다닐게요",
    promptQuestion: "요즘 어떤 계절 감정을 느끼고 있나요?",
    promptAnswer: "가을이 오기 전 아쉬움이요",
    isSupporter: false,
    reactions: { heart: 4, pray: 1 },
  },
  {
    id: "MRT-DEMO7",
    buyerNickname: "여름밤",
    productId: "p7",
    price: 2000,
    isSupporter: false,
    reactions: { heart: 3, pray: 0 },
  },
  {
    id: "MRT-DEMO8",
    buyerNickname: "네온",
    productId: "p8",
    price: 20000,
    promptQuestion: "이 곡과 함께 떠오르는 여름 기억이 있다면?",
    promptAnswer: "고등학교 축제 무대요",
    isSupporter: true,
    reactions: { heart: 9, pray: 0 },
  },
  {
    id: "MRT-DEMO9",
    buyerNickname: "라임",
    productId: "p9",
    price: 1000,
    cheerMessage: "가사가 제 얘기 같아요",
    promptQuestion: "제이플로우 가사 중 가장 와닿았던 한 줄은?",
    promptAnswer: "'혼자 쓰고 혼자 완성한다' 그 줄이요",
    isSupporter: false,
    reactions: { heart: 6, pray: 4 },
  },
  {
    id: "MRT-DEMO10",
    buyerNickname: "플로우홀릭",
    productId: "p10",
    price: 25000,
    cheerMessage: "모자 예뻐서 삽니다 ㅋㅋ",
    isSupporter: true,
    reactions: { heart: 2, pray: 0 },
  },
];
