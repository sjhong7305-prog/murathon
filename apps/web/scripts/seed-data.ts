import type { ProductType } from "@muraton/shared/types";
import { getCosUrl } from "../src/lib/cos-storage";

function demoImage(seed: string) {
  return getCosUrl("albums", `${seed}-cover.jpg`);
}

function demoBanner(seed: string) {
  return getCosUrl("artists", `${seed}-banner.jpg`);
}

function demoProfileImage(seed: string) {
  return getCosUrl("artists", `${seed}-profile.jpg`);
}

function demoPreviewAudio(seed: string) {
  return getCosUrl("tracks", `${seed}-preview.mp3`);
}

interface SeedArtist {
  id: string;
  slug: string;
  name: string;
  genre: string;
  genreTags?: string[];
  location: string;
  tagline: string;
  introduction: string;
  coverColor: string;
  imageUrl?: string;
  bannerImage?: string;
  externalLinks?: { sns?: string; youtube?: string; website?: string };
  checkoutQuestion?: string;
  supporters?: string[];
}

interface SeedTrack {
  trackNumber: number;
  title: string;
  durationSec: number;
  isTitle?: boolean;
}

interface SeedProduct {
  id: string;
  artistId: string;
  type: ProductType;
  title: string;
  description: string;
  format?: string;
  minPrice: number;
  suggestedPrice: number;
  coverColor: string;
  imageUrl?: string;
  previewAudioUrl?: string;
  secretContent?: { title: string; message: string };
  longDescription?: string;
  releaseDate?: string;
  credits?: string;
  durationSec?: number;
  tracks?: SeedTrack[];
}

export const seedArtists: SeedArtist[] = [
  {
    id: "a1",
    slug: "wonder-static",
    name: "원더 스태틱",
    genre: "드림팝 / 슈게이징",
    genreTags: ["alternative", "rock"],
    location: "서울",
    tagline: "잔상처럼 남는 기타 노이즈",
    introduction:
      "2019년 홍대에서 결성된 3인조 드림팝 밴드. 몽환적인 기타 톤과 나른한 보컬로 소규모 라이브 씬에서 꾸준히 팬을 늘려왔다. 두 번째 정규 앨범 《잔상》을 자체 레이블로 발매했다.",
    coverColor: "from-violet-500 to-fuchsia-500",
    imageUrl: demoProfileImage("wonder-static"),
    bannerImage: demoBanner("wonder-static"),
    externalLinks: {
      sns: "https://instagram.com/wonderstatic",
      youtube: "https://youtube.com/@wonderstatic",
      website: "https://wonderstatic.example.com",
    },
    checkoutQuestion: "가장 좋아하는 곡은 무엇인가요?",
    supporters: ["민지", "소리", "하늘", "지우", "채원", "다은"],
  },
  {
    id: "a2",
    slug: "gasan-youth",
    name: "가산유스",
    genre: "펑크 / 개러지 록",
    genreTags: ["punk", "rock"],
    location: "인천",
    tagline: "3분 안에 끝내는 분노",
    introduction:
      "공단 지역을 오가며 자란 멤버들이 만든 로파이 펑크 밴드. 직설적인 가사와 거친 사운드가 특징이며, 라이브 클럽을 중심으로 활동한다.",
    coverColor: "from-orange-500 to-rose-500",
    imageUrl: demoProfileImage("gasan-youth"),
    bannerImage: demoBanner("gasan-youth"),
    externalLinks: {
      sns: "https://instagram.com/gasanyouth",
      youtube: "https://youtube.com/@gasanyouth",
    },
    checkoutQuestion: "가산유스에게 하고 싶은 한마디는?",
    supporters: ["재현", "동욱", "수아"],
  },
  {
    id: "a3",
    slug: "haepari",
    name: "해파리",
    genre: "포크 / 어쿠스틱",
    genreTags: ["folk", "acoustic"],
    location: "제주",
    tagline: "파도 소리를 닮은 노래",
    introduction:
      "제주 바닷가 마을에서 활동하는 싱어송라이터 듀오. 어쿠스틱 기타와 첼로로 계절의 감정을 담은 곡을 쓴다.",
    coverColor: "from-teal-400 to-cyan-600",
    imageUrl: demoProfileImage("haepari"),
    bannerImage: demoBanner("haepari"),
    externalLinks: { website: "https://haepari.example.com" },
    checkoutQuestion: "요즘 어떤 계절 감정을 느끼고 있나요?",
    supporters: ["바다", "윤슬", "제주댁", "노을", "파도"],
  },
  {
    id: "a4",
    slug: "yeoldae",
    name: "열대야",
    genre: "신스팝 / 일렉트로닉",
    genreTags: ["electronic"],
    location: "부산",
    tagline: "한여름 밤의 신스",
    introduction:
      "부산 출신 신스팝 프로젝트. 80년대 신스 사운드와 현대적인 프로덕션을 결합해 여름밤의 정서를 그린다.",
    coverColor: "from-amber-400 to-pink-500",
    imageUrl: demoProfileImage("yeoldae"),
    bannerImage: demoBanner("yeoldae"),
    externalLinks: {
      sns: "https://instagram.com/yeoldae",
      youtube: "https://youtube.com/@yeoldae",
      website: "https://yeoldae.example.com",
    },
    checkoutQuestion: "이 곡과 함께 떠오르는 여름 기억이 있다면?",
    supporters: ["여름밤", "네온", "서퍼", "해운대"],
  },
  {
    id: "a5",
    slug: "j-flow",
    name: "제이플로우",
    genre: "힙합 / 솔로",
    genreTags: ["hip-hop-rap"],
    location: "서울",
    tagline: "혼자 쓰고, 혼자 부르고, 혼자 완성한다",
    introduction:
      "비트 프로듀싱부터 랩까지 전부 혼자 만드는 솔로 힙합 아티스트. 자취방 작업실에서 녹음한 로파이 힙합으로 입소문을 타기 시작했다.",
    coverColor: "from-lime-500 to-emerald-600",
    imageUrl: demoProfileImage("j-flow"),
    bannerImage: demoBanner("j-flow"),
    externalLinks: { sns: "https://instagram.com/jflow" },
    checkoutQuestion: "제이플로우 가사 중 가장 와닿았던 한 줄은?",
    supporters: ["플로우홀릭", "새벽비트", "라임"],
  },
];

export const seedProducts: SeedProduct[] = [
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
    previewAudioUrl: demoPreviewAudio("p1-janggsang"),
    secretContent: {
      title: "🔓 히든 트랙 + 데모 버전",
      message: "'잔상' 세션에서만 연주했던 미공개 데모 두 곡을 보너스로 드려요. 앨범을 구매해주셔서 고마워요!",
    },
    longDescription:
      "2019년 결성 이후 소규모 라이브 씬을 돌며 쌓아온 몽환적인 기타 톤과 나른한 보컬을\n두 번째 정규 앨범에 담았습니다.\n\n1년 반 동안 홍대의 작은 합주실에서 밤마다 모여 완성한 앨범으로, 앰프 노이즈와 리버브를\n의도적으로 남겨 라이브의 질감을 그대로 살렸습니다. 타이틀곡 '잔상'은 사라져가는 기억에\n대한 곡이고, 나머지 트랙들은 그 기억을 붙잡으려는 다양한 시도들을 담았습니다.\n\n끝까지 들어주시면 마지막 트랙 뒤에 숨겨둔 짧은 리프라이즈도 만나보실 수 있어요.",
    releaseDate: "2025-03-14",
    credits: "작사·작곡 원더 스태틱 | 믹싱 김도윤 | 마스터링 스튜디오 온음",
    tracks: [
      { trackNumber: 1, title: "잔상", durationSec: 214, isTitle: true },
      { trackNumber: 2, title: "홍대입구역", durationSec: 198 },
      { trackNumber: 3, title: "노이즈 러브레터", durationSec: 231 },
      { trackNumber: 4, title: "밤의 온도", durationSec: 187 },
      { trackNumber: 5, title: "슈게이즈", durationSec: 245 },
      { trackNumber: 6, title: "안개 속에서", durationSec: 203 },
      { trackNumber: 7, title: "리버브", durationSec: 176 },
      { trackNumber: 8, title: "두 번째 겨울", durationSec: 219 },
      { trackNumber: 9, title: "잔향", durationSec: 192 },
      { trackNumber: 10, title: "잔상 (Reprise)", durationSec: 94 },
    ],
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
    longDescription:
      "인천 공단 지역을 오가며 자란 멤버들이 자취방 겸 합주실에서 하루 만에 녹음한 4곡짜리 EP입니다.\n오버더빙 없이 라이브로 친 연주를 그대로 믹싱했고, 앰프 끝음까지 잘라내지 않았습니다.\n\n직설적인 가사와 거친 사운드로 공단 주변의 풍경과 감정을 담았습니다.",
    releaseDate: "2024-11-02",
    tracks: [
      { trackNumber: 1, title: "공단", durationSec: 142, isTitle: true },
      { trackNumber: 2, title: "3교대", durationSec: 128 },
      { trackNumber: 3, title: "퇴근길", durationSec: 155 },
      { trackNumber: 4, title: "가산유스", durationSec: 137 },
    ],
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
    longDescription:
      "제주 바닷가 마을에서 활동하는 어쿠스틱 듀오의 첫 정규 앨범입니다.\n어쿠스틱 기타와 첼로만으로 사계절 바다의 표정을 담아냈습니다.\n\n2023년 겨울부터 2024년 가을까지, 계절이 바뀔 때마다 같은 해변에서 녹음한 곡들을 모았고\n이번에 리마스터링을 거쳐 다시 공개합니다.",
    releaseDate: "2024-09-21",
    credits: "기타·보컬 해파리 | 첼로 이온 | 녹음 제주 앞바다 스튜디오",
    tracks: [
      { trackNumber: 1, title: "파도의 계절", durationSec: 224, isTitle: true },
      { trackNumber: 2, title: "봄의 해변", durationSec: 201 },
      { trackNumber: 3, title: "여름 소나기", durationSec: 189 },
      { trackNumber: 4, title: "물빛", durationSec: 212 },
      { trackNumber: 5, title: "가을 항구", durationSec: 197 },
      { trackNumber: 6, title: "첫눈", durationSec: 233 },
      { trackNumber: 7, title: "겨울 파도", durationSec: 206 },
      { trackNumber: 8, title: "다시, 봄", durationSec: 178 },
    ],
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
    previewAudioUrl: demoPreviewAudio("p7-single"),
    secretContent: {
      title: "🔓 로파이 리믹스 버전",
      message: "밤 산책할 때 어울리는 로파이 리믹스 버전을 몰래 얹어드려요.",
    },
    longDescription:
      "80년대 신스 사운드와 현대적인 프로덕션을 결합한 신스팝 프로젝트 열대야의 타이틀 싱글입니다.\n부산의 한여름 밤, 에어컨 없이 버틴 기억을 신스 리프에 담았습니다.",
    releaseDate: "2025-07-01",
    tracks: [{ trackNumber: 1, title: "열대야", durationSec: 211, isTitle: true }],
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
    durationSec: 163,
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
