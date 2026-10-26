import { Nanum_Pen_Script } from "next/font/google";
import type { StoryPrompts } from "@/lib/tracks-storage";

const penScript = Nanum_Pen_Script({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const QUESTIONS: { key: keyof StoryPrompts; question: string }[] = [
  { key: "origin", question: "이 곡, 어떤 순간에 떠올랐어요?" },
  { key: "struggle", question: "만들면서 제일 힘들었던 부분은요?" },
  { key: "audience", question: "이 곡을 누가, 어떤 상황에서 들어줬으면 좋겠어요?" },
];

export function ArtistStorySection({ storyPrompts }: { storyPrompts?: StoryPrompts }) {
  const answers = QUESTIONS.map(({ key, question }) => ({
    question,
    answer: storyPrompts?.[key]?.trim(),
  })).filter((item) => item.answer);

  if (answers.length === 0) return null;

  return (
    <section className="mt-10">
      <p className="text-sm font-bold text-ink">아티스트의 이야기</p>

      <div
        className="relative mt-3 -rotate-[0.4deg] rounded-lg border p-6 shadow-[0_10px_28px_-16px_rgba(42,42,42,0.35)] sm:p-8"
        style={{
          backgroundColor: "#F3EAD3",
          borderColor: "#E2D2A6",
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -top-3 left-6 text-5xl text-[#E2D2A6]"
        >
          “
        </span>

        <div className="flex flex-col gap-5">
          {answers.map(({ question, answer }) => (
            <div key={question}>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8a7a54]">
                {question}
              </p>
              <p
                className={`${penScript.className} mt-1 text-2xl leading-snug text-[#3a2f1c] sm:text-[28px]`}
              >
                {answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
