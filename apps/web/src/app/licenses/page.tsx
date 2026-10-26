export const metadata = { title: "폰트 라이선스 | MU:RATHON" };

const FONTS = [
  {
    name: "Pretendard",
    source: "https://github.com/orioncactus/pretendard",
    note: "npm 패키지 pretendard",
  },
  {
    name: "Noto Sans KR",
    source: "https://fonts.google.com/noto/specimen/Noto+Sans+KR",
  },
  {
    name: "IBM Plex Sans KR",
    source: "https://fonts.google.com/specimen/IBM+Plex+Sans+KR",
  },
  {
    name: "Noto Serif KR",
    source: "https://fonts.google.com/noto/specimen/Noto+Serif+KR",
  },
  {
    name: "Nanum Myeongjo",
    source: "https://fonts.google.com/specimen/Nanum+Myeongjo",
  },
  {
    name: "Gowun Dodum",
    source: "https://fonts.google.com/specimen/Gowun+Dodum",
  },
  {
    name: "Gowun Batang",
    source: "https://fonts.google.com/specimen/Gowun+Batang",
  },
];

export default function LicensesPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-ink">폰트 라이선스</h1>
      <p className="mt-2 text-sm text-muted">
        아티스트 페이지 꾸미기의 글꼴 선택 기능에서 사용하는 폰트는 모두 SIL Open Font License
        1.1(OFL-1.1)로 배포됩니다. OFL은 폰트의 사용·복제·수정·재배포를 허용하는 오픈 소스
        라이선스입니다.
      </p>

      <ul className="mt-6 flex flex-col gap-4">
        {FONTS.map((font) => (
          <li key={font.name} className="rounded-xl border border-line p-4">
            <p className="font-bold text-ink">{font.name}</p>
            <p className="mt-1 text-sm text-muted">라이선스: SIL Open Font License 1.1</p>
            {font.note && <p className="text-sm text-muted">{font.note}</p>}
            <a
              href={font.source}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-sm text-accent-strong underline"
            >
              {font.source}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
