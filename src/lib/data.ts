import { Artist, Product } from "./types";

function demoImage(seed: string) {
  return `https://picsum.photos/seed/${seed}/600/600`;
}

function demoBanner(seed: string) {
  return `https://picsum.photos/seed/${seed}-banner/1600/500`;
}

export const artists: Artist[] = [
  {
    id: "a1",
    slug: "wonder-static",
    name: "원더 스태틱",
    genre: "드림팝 / 슈게이징",
    genreTags: ["alternative", "rock"],
    location: "서울",
    tagline: "잔상처럼 남는 기타 노이즈",
    introduction: "2019년 홍대에서 결성된 3인조 드림팝 밴드. 몽환적인 기타 톤과 나른한 보컬로 소규모 라이브 씬에서 꾸준히 팬을 늘려왔다. 두 번째 정규 앨범 《잔상》을 자체 레이블로 발매했다.",
    coverColor: "from-violet-500 to-fuchsia-500",
    imageUrl: demoImage("wonder-static"),
    bannerImage: demoBanner("wonder-static"),
    externalLinks: {
      sns: "https://instagram.com/wonderstatic",
      youtube: "https://youtube.com/@wonderstatic",
      website: "https://wonderstatic.example.com",
    },
    checkoutQuestion: "가장 좋아하는 곡은 무엇인가요?",
    supporters: ["민지", "소리", "하늘", "지우", "채원", "다은"],
    feedPosts: [
      {
        id: "post-a1-1",
        category: "녹음 비하인드",
        content: "'잔상' 3번 트랙 기타 오버더빙하다가 새벽 4시 됐어요. 노이즈 레이어를 몇 겹으로 쌓았는지 이제 기억도 안 나요.",
        mediaUrl: demoImage("a1-post1"),
        createdAt: "2026-09-10",
        likeCount: 34,
      },
      {
        id: "post-a1-2",
        category: "작업실 일상",
        content: "합주실 냉장고에 붙여둔 셋리스트가 벌써 3번째 버전이에요. 다음 공연 곡 순서 고민 중.",
        createdAt: "2026-09-05",
        likeCount: 12,
      },
      {
        id: "post-a1-3",
        category: "공연 영상",
        content: "지난주 클럽 공연 마지막 곡 영상이에요. 앰프가 반쯤 나간 상태로 쳤는데 오히려 더 노이즈답게 나왔어요.",
        mediaUrl: demoImage("a1-post3"),
        createdAt: "2026-08-28",
        likeCount: 58,
      },
    ],
  },
  {
    id: "a2",
    slug: "gasan-youth",
    name: "가산유스",
    genre: "펑크 / 개러지 록",
    genreTags: ["punk", "rock"],
    location: "인천",
    tagline: "3분 안에 끝내는 분노",
    introduction: "공단 지역을 오가며 자란 멤버들이 만든 로파이 펑크 밴드. 직설적인 가사와 거친 사운드가 특징이며, 라이브 클럽을 중심으로 활동한다.",
    coverColor: "from-orange-500 to-rose-500",
    imageUrl: demoImage("gasan-youth"),
    bannerImage: demoBanner("gasan-youth"),
    externalLinks: {
      sns: "https://instagram.com/gasanyouth",
      youtube: "https://youtube.com/@gasanyouth",
    },
    checkoutQuestion: "가산유스에게 하고 싶은 한마디는?",
    supporters: ["재현", "동욱", "수아"],
    feedPosts: [
      {
        id: "post-a2-1",
        category: "악기 연주",
        content: "드럼 튜닝 새로 했어요. 스네어 소리가 훨씬 날카로워져서 이번 EP에 딱이에요.",
        mediaUrl: demoImage("a2-post1"),
        createdAt: "2026-09-08",
        likeCount: 21,
      },
      {
        id: "post-a2-2",
        category: "가사 소개",
        content: "'공단' 후렴구는 사실 멤버 중 한 명이 야간 근무하면서 메모장에 써둔 문장이에요.",
        createdAt: "2026-08-30",
        likeCount: 15,
      },
    ],
  },
  {
    id: "a3",
    slug: "haepari",
    name: "해파리",
    genre: "포크 / 어쿠스틱",
    genreTags: ["folk", "acoustic"],
    location: "제주",
    tagline: "파도 소리를 닮은 노래",
    introduction: "제주 바닷가 마을에서 활동하는 싱어송라이터 듀오. 어쿠스틱 기타와 첼로로 계절의 감정을 담은 곡을 쓴다.",
    coverColor: "from-teal-400 to-cyan-600",
    imageUrl: demoImage("haepari"),
    bannerImage: demoBanner("haepari"),
    externalLinks: {
      website: "https://haepari.example.com",
    },
    checkoutQuestion: "요즘 어떤 계절 감정을 느끼고 있나요?",
    supporters: ["바다", "윤슬", "제주댁", "노을", "파도"],
    feedPosts: [
      {
        id: "post-a3-1",
        category: "작업실 일상",
        content: "바다 보이는 창가에 앉아서 첼로 파트 편곡 중이에요. 파도 소리가 자꾸 박자를 흔들어요.",
        mediaUrl: demoImage("a3-post1"),
        createdAt: "2026-09-06",
        likeCount: 27,
      },
      {
        id: "post-a3-2",
        category: "녹음 비하인드",
        content: "'파도의 계절' 보컬 녹음은 전부 집 화장실에서 했어요. 잔향이 제일 좋더라고요.",
        createdAt: "2026-08-22",
        likeCount: 19,
      },
    ],
  },
  {
    id: "a4",
    slug: "yeoldae",
    name: "열대야",
    genre: "신스팝 / 일렉트로닉",
    genreTags: ["electronic"],
    location: "부산",
    tagline: "한여름 밤의 신스",
    introduction: "부산 출신 신스팝 프로젝트. 80년대 신스 사운드와 현대적인 프로덕션을 결합해 여름밤의 정서를 그린다.",
    coverColor: "from-amber-400 to-pink-500",
    imageUrl: demoImage("yeoldae"),
    bannerImage: demoBanner("yeoldae"),
    externalLinks: {
      sns: "https://instagram.com/yeoldae",
      youtube: "https://youtube.com/@yeoldae",
      website: "https://yeoldae.example.com",
    },
    checkoutQuestion: "이 곡과 함께 떠오르는 여름 기억이 있다면?",
    supporters: ["여름밤", "네온", "서퍼", "해운대"],
    feedPosts: [
      {
        id: "post-a4-1",
        category: "공연 영상",
        content: "부산 해운대 야외 공연 직캠이에요. 신스 라인 노을이랑 진짜 잘 어울렸어요.",
        mediaUrl: demoImage("a4-post1"),
        createdAt: "2026-09-09",
        likeCount: 41,
      },
      {
        id: "post-a4-2",
        category: "악기 연주",
        content: "새로 산 신디사이저로 데모 하나 뽑아봤어요. 다음 싱글에 이 패치 쓸 것 같아요.",
        createdAt: "2026-08-25",
        likeCount: 23,
      },
    ],
  },
  {
    id: "a5",
    slug: "j-flow",
    name: "제이플로우",
    genre: "힙합 / 솔로",
    genreTags: ["hip-hop-rap"],
    location: "서울",
    tagline: "혼자 쓰고, 혼자 부르고, 혼자 완성한다",
    introduction: "비트 프로듀싱부터 랩까지 전부 혼자 만드는 솔로 힙합 아티스트. 자취방 작업실에서 녹음한 로파이 힙합으로 입소문을 타기 시작했다.",
    coverColor: "from-lime-500 to-emerald-600",
    imageUrl: demoImage("j-flow"),
    bannerImage: demoBanner("j-flow"),
    externalLinks: {
      sns: "https://instagram.com/jflow",
    },
    checkoutQuestion: "제이플로우 가사 중 가장 와닿았던 한 줄은?",
    supporters: ["플로우홀릭", "새벽비트", "라임"],
    feedPosts: [
      {
        id: "post-a5-1",
        category: "가사 소개",
        content: "'자취방' 2절 가사는 진짜 자취방 전기세 고지서 보고 쓴 거예요.",
        mediaUrl: demoImage("a5-post1"),
        createdAt: "2026-09-07",
        likeCount: 30,
      },
      {
        id: "post-a5-2",
        category: "작업실 일상",
        content: "오늘도 이불 위에 앉아서 믹싱. 헤드폰 없이는 이웃 눈치 보여서 못 크게 틀어요.",
        createdAt: "2026-08-18",
        likeCount: 9,
      },
    ],
  },
];

export const products: Product[] = [
  {
    id: "p1",
    artistId: "a1",
    type: "album",
    title: "잔상 (정규 2집)",
    description: "10곡이 수록된 두 번째 정규 앨범. 디지털 다운로드(FLAC/MP3)로 제공됩니다.",
    format: "디지털 앨범",
    minPrice: 0,
    suggestedPrice: 7000,
    coverColor: "from-violet-500 to-fuchsia-500",
    imageUrl: demoImage("p1-janggsang"),
    previewAudioUrl: "/audio/p1-janggsang-preview.mp3",
    secretContent: {
      title: "🔓 히든 트랙 + 데모 버전",
      message: "'잔상' 세션에서만 연주했던 미공개 데모 두 곡을 보너스로 드려요. 앨범을 구매해주셔서 고마워요!",
    },
  },
  {
    id: "p2",
    artistId: "a1",
    type: "merch",
    title: "잔상 투어 티셔츠",
    description: "앨범 발매 기념 한정 티셔츠. 100% 코튼, 국내 소량 제작.",
    format: "의류 / M~XL",
    minPrice: 25000,
    suggestedPrice: 32000,
    coverColor: "from-violet-400 to-purple-600",
    imageUrl: demoImage("p2-tshirt"),
  },
  {
    id: "p3",
    artistId: "a2",
    type: "album",
    title: "공단 EP",
    description: "4곡 EP. 라이브 세션 녹음 그대로 믹싱한 로파이 사운드.",
    format: "디지털 EP",
    minPrice: 0,
    suggestedPrice: 3000,
    coverColor: "from-orange-500 to-rose-500",
    imageUrl: demoImage("p3-gongdan"),
    secretContent: {
      title: "🔓 리허설 라이브 영상 링크",
      message: "공개된 적 없는 지하 합주실 리허설 영상 링크를 보내드려요. 시끄럽지만 진짜예요.",
    },
  },
  {
    id: "p4",
    artistId: "a2",
    type: "ticket",
    title: "가산유스 단독 공연 티켓",
    description: "10월 홍대 클럽 단독 공연 입장권 1매. 현장 수령.",
    format: "공연 티켓",
    minPrice: 15000,
    suggestedPrice: 15000,
    coverColor: "from-rose-500 to-red-600",
    imageUrl: demoImage("p4-ticket"),
  },
  {
    id: "p5",
    artistId: "a3",
    type: "album",
    title: "파도의 계절",
    description: "제주 바다를 담은 첫 정규 앨범. 8곡 수록, 리마스터 버전.",
    format: "디지털 앨범",
    minPrice: 0,
    suggestedPrice: 5000,
    coverColor: "from-teal-400 to-cyan-600",
    imageUrl: demoImage("p5-pado"),
    secretContent: {
      title: "🔓 앨범 커버 촬영 비하인드 사진",
      message: "제주 바닷가에서 찍은 비하인드 폴라로이드 스캔본을 드려요. 구매해주셔서 감사해요.",
    },
  },
  {
    id: "p6",
    artistId: "a3",
    type: "merch",
    title: "해파리 에코백",
    description: "앨범 아트워크가 프린트된 캔버스 에코백.",
    format: "굿즈",
    minPrice: 12000,
    suggestedPrice: 15000,
    coverColor: "from-cyan-400 to-blue-500",
    imageUrl: demoImage("p6-ecobag"),
  },
  {
    id: "p7",
    artistId: "a4",
    type: "album",
    title: "열대야 (싱글)",
    description: "타이틀 싱글 디지털 음원. WAV/MP3 제공.",
    format: "디지털 싱글",
    minPrice: 0,
    suggestedPrice: 1500,
    coverColor: "from-amber-400 to-pink-500",
    imageUrl: demoImage("p7-single"),
    previewAudioUrl: "/audio/p7-single-preview.mp3",
    secretContent: {
      title: "🔓 로파이 리믹스 버전",
      message: "밤 산책할 때 어울리는 로파이 리믹스 버전을 몰래 얹어드려요.",
    },
  },
  {
    id: "p8",
    artistId: "a4",
    type: "merch",
    title: "열대야 카세트 테이프",
    description: "한정 제작 카세트 테이프. 컬러 랜덤 발송.",
    format: "카세트",
    minPrice: 18000,
    suggestedPrice: 20000,
    coverColor: "from-pink-400 to-fuchsia-600",
    imageUrl: demoImage("p8-cassette"),
  },
  {
    id: "p9",
    artistId: "a5",
    type: "track",
    title: "자취방 (싱글)",
    description: "혼자 쓰고 혼자 녹음한 로파이 힙합 싱글. WAV/MP3 제공.",
    format: "디지털 싱글",
    minPrice: 0,
    suggestedPrice: 1000,
    coverColor: "from-lime-500 to-emerald-600",
    imageUrl: demoImage("p9-jachwibang"),
    secretContent: {
      title: "🔓 아카펠라 버전 + 가사 노트",
      message: "비트 없이 부른 아카펠라 버전과 손글씨 가사 노트 스캔본을 드려요.",
    },
  },
  {
    id: "p10",
    artistId: "a5",
    type: "merch",
    title: "제이플로우 캡 모자",
    description: "자취방 로고가 자수로 박힌 6패널 캡 모자.",
    format: "굿즈 / 프리사이즈",
    minPrice: 20000,
    suggestedPrice: 24000,
    coverColor: "from-emerald-500 to-lime-600",
    imageUrl: demoImage("p10-cap"),
  },
];

export function getArtistBySlug(slug: string): Artist | undefined {
  return artists.find((a) => a.slug === slug);
}

export function getArtistById(id: string): Artist | undefined {
  return artists.find((a) => a.id === id);
}

export function getProductsByArtist(artistId: string): Product[] {
  return products.filter((p) => p.artistId === artistId);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
