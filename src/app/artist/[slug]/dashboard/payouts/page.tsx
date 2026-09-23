import { requireArtistMember } from "@/lib/auth";
import { payoutInfoAction } from "./actions";

export default async function PayoutInfoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { artist } = await requireArtistMember(slug);
  const action = payoutInfoAction.bind(null, slug);

  return (
    <div className="max-w-md">
      <p className="text-sm font-semibold text-accent-strong">💳 정산 정보</p>
      <h1 className="mt-1 text-2xl font-black text-ink">출금받을 계좌를 등록해주세요</h1>
      <p className="mt-2 text-sm text-muted">
        음원을 공개하거나 출금을 요청하려면 정산 정보가 필요해요. (프로토타입이므로 실제 계좌 확인은
        이루어지지 않습니다)
      </p>

      {artist.payoutStatus === "PENDING" && (
        <p className="mt-4 rounded-lg border border-accent/30 bg-accent/5 px-3 py-2 text-sm font-semibold text-accent-strong">
          확인 대기 중이에요. 등록 정보를 다시 제출하면 갱신돼요.
        </p>
      )}

      <form action={action} className="mt-6 flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm text-muted">은행</label>
          <input
            required
            name="bankName"
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
            placeholder="예: 국민은행"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">계좌번호</label>
          <input
            required
            name="accountNumber"
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
            placeholder="000-0000-0000"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">예금주</label>
          <input
            required
            name="accountHolder"
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
            placeholder={artist.name}
          />
        </div>

        <button
          type="submit"
          className="mt-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-accent-strong"
        >
          정산 정보 제출
        </button>
      </form>
    </div>
  );
}
