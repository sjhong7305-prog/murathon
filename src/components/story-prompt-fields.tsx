const FIELD_CLASS =
  "w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent";

const QUESTIONS = [
  {
    key: "origin" as const,
    question: "이 곡, 어떤 순간에 떠올랐어요?",
    placeholder: "예: 새벽에 버스 막차를 놓치고 걸어가다가, 문득 멜로디가 떠올랐어요.",
  },
  {
    key: "struggle" as const,
    question: "만들면서 제일 힘들었던 부분은요?",
    placeholder: "예: 후렴 가사를 스무 번쯤 갈아엎었어요. 감정은 있는데 말이 안 따라와서.",
  },
  {
    key: "audience" as const,
    question: "이 곡을 누가, 어떤 상황에서 들어줬으면 좋겠어요?",
    placeholder: "예: 퇴근길 지하철에서, 오늘 하루를 잘 버틴 사람이 들어줬으면 해요.",
  },
];

export function StoryPromptFields({
  origin,
  struggle,
  audience,
  onOriginChange,
  onStruggleChange,
  onAudienceChange,
}: {
  origin: string;
  struggle: string;
  audience: string;
  onOriginChange: (value: string) => void;
  onStruggleChange: (value: string) => void;
  onAudienceChange: (value: string) => void;
}) {
  const values = { origin, struggle, audience };
  const setters = {
    origin: onOriginChange,
    struggle: onStruggleChange,
    audience: onAudienceChange,
  };

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="text-sm font-bold text-ink">✍️ 이 곡에 대한 이야기 (선택)</p>
      <p className="mt-1 text-xs text-muted">
        답하고 싶은 질문에만 편하게 적어주세요. 비워두고 넘어가도 괜찮아요 — 팬들에게 이 곡의 뒷이야기를 전하고 싶을 때만 채워주시면 됩니다.
      </p>

      <div className="mt-4 flex flex-col gap-4">
        {QUESTIONS.map(({ key, question, placeholder }) => (
          <div key={key}>
            <label className="mb-1 block text-sm text-muted">{question}</label>
            <textarea
              value={values[key]}
              onChange={(e) => setters[key](e.target.value)}
              rows={2}
              className={FIELD_CLASS}
              placeholder={placeholder}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
