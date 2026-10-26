import type { Comment } from "./comment-storage";

export const mockComments: Record<string, Comment[]> = {
  p1: [
    {
      nickname: "민지",
      message: "3번 트랙 기타 톤 미쳤어요. 매일 듣고 있어요.",
      createdAt: "2026-08-02T10:00:00.000Z",
    },
    {
      nickname: "소리",
      message: "히든 트랙까지 완벽하네요 다음 앨범도 기다릴게요!",
      createdAt: "2026-08-05T10:00:00.000Z",
    },
  ],
  p3: [
    {
      nickname: "재현",
      message: "라이브 세션 그대로라 더 좋아요. 다음 공연도 갈게요.",
      createdAt: "2026-08-10T10:00:00.000Z",
    },
  ],
  p5: [
    {
      nickname: "바다",
      message: "운전할 때 듣기 딱 좋아요, 제주 생각나요.",
      createdAt: "2026-08-11T10:00:00.000Z",
    },
  ],
};
