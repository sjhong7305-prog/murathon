import type { CommunityPost } from "./community-storage";

export const mockPosts: CommunityPost[] = [
  {
    id: "c1",
    title: "다음 앨범 작업 근황 공유해요",
    body: "요즘 새 앨범 데모를 만들고 있어요. 어쿠스틱 버전이랑 풀밴드 버전 둘 다 시도해보는 중인데, 여러분은 어떤 편곡이 더 궁금하세요?",
    author: "원더 스태틱",
    authorType: "artist",
    createdAt: "2026-09-01T09:00:00.000Z",
    comments: [
      {
        id: "c1-cm1",
        author: "민지",
        authorType: "follower",
        message: "풀밴드 버전 완전 궁금해요! 라이브에서도 듣고 싶어요.",
        createdAt: "2026-09-01T10:00:00.000Z",
      },
      {
        id: "c1-cm2",
        author: "소리",
        authorType: "follower",
        message: "어쿠스틱도 좋을 것 같아요 두 버전 다 내주시면 안 될까요 ㅎㅎ",
        createdAt: "2026-09-01T11:20:00.000Z",
      },
    ],
  },
  {
    id: "c2",
    title: "인디 공연 다니시는 분들 팁 좀 주세요",
    body: "이번 달에 홍대/인천 쪽 공연 많이 보러 다니는데, 좋았던 공연장이나 팁 있으면 공유해주세요!",
    author: "바다",
    authorType: "follower",
    createdAt: "2026-09-03T14:00:00.000Z",
    comments: [
      {
        id: "c2-cm1",
        author: "가산유스",
        authorType: "artist",
        message: "저희 다음 공연도 놀러오세요! 홍대 라이브클럽 라인업 좋아요.",
        createdAt: "2026-09-03T15:30:00.000Z",
      },
    ],
  },
  {
    id: "c3",
    title: "이번 주말 공연 있어요 (제이플로우)",
    body: "이번 주 토요일 저녁 공덕에서 작은 쇼케이스 해요. 신곡도 처음 공개할 예정입니다.",
    author: "제이플로우",
    authorType: "artist",
    createdAt: "2026-09-05T08:00:00.000Z",
    comments: [],
  },
  {
    id: "c4",
    title: "PWYW로 후원하는 거 처음 해봤는데 신기하네요",
    body: "가격을 직접 정해서 후원하는 방식 처음 써봤는데 아티스트한테 바로 전달된다는 게 좋았어요. 다들 어떤 아티스트 후원하셨나요?",
    author: "여름밤",
    authorType: "follower",
    createdAt: "2026-09-07T18:00:00.000Z",
    comments: [
      {
        id: "c4-cm1",
        author: "재현",
        authorType: "follower",
        message: "저는 가산유스 EP 후원했어요! 0원부터 시작할 수 있어서 부담 없더라고요.",
        createdAt: "2026-09-07T19:10:00.000Z",
      },
    ],
  },
];
