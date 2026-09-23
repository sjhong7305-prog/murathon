import Link from "next/link";
import { CoverArt } from "@/components/cover-art";
import { formatDate } from "@/lib/format";

export interface TicketItem {
  productId: string;
  title: string;
  coverColor: string;
  imageUrl?: string | null;
  artistName: string;
  artistSlug: string;
  eventName?: string;
  venue?: string;
  eventAt?: string;
  admissionCode?: string;
}

function TicketCard({ ticket }: { ticket: TicketItem }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-line bg-surface p-3">
      <div className="w-20 shrink-0">
        <CoverArt gradient={ticket.coverColor} label={ticket.title} imageUrl={ticket.imageUrl ?? undefined} hideLabel />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-ink">{ticket.eventName ?? ticket.title}</p>
        <Link href={`/artists/${ticket.artistSlug}`} className="text-xs text-muted hover:text-accent-strong">
          {ticket.artistName}
        </Link>
        <p className="mt-1 text-xs text-ink">
          {ticket.eventAt ? formatDate(ticket.eventAt) : "일정 미정"}
          {ticket.venue ? ` · ${ticket.venue}` : ""}
        </p>
        {ticket.admissionCode && (
          <p className="mt-1.5 inline-block rounded-lg bg-cream px-2 py-1 font-mono text-xs font-bold text-accent-strong">
            예매번호 {ticket.admissionCode}
          </p>
        )}
      </div>
    </div>
  );
}

export function TicketSection({ tickets }: { tickets: TicketItem[] }) {
  // eslint-disable-next-line react-hooks/purity -- server component, "now" only needs to be fresh per request
  const now = Date.now();
  const upcoming = tickets
    .filter((t) => t.eventAt && new Date(t.eventAt).getTime() >= now)
    .sort((a, b) => new Date(a.eventAt!).getTime() - new Date(b.eventAt!).getTime());
  const past = tickets
    .filter((t) => !t.eventAt || new Date(t.eventAt).getTime() < now)
    .sort((a, b) => new Date(b.eventAt ?? 0).getTime() - new Date(a.eventAt ?? 0).getTime());

  if (tickets.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-surface p-6 text-center">
        <p className="text-sm text-muted">아직 구매한 티켓이 없어요.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h3 className="mb-3 text-sm font-bold text-ink">다가오는 공연 ({upcoming.length})</h3>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted">예정된 공연이 없어요.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {upcoming.map((t) => (
              <TicketCard key={t.productId} ticket={t} />
            ))}
          </div>
        )}
      </section>
      <section>
        <h3 className="mb-3 text-sm font-bold text-ink">지난 공연 ({past.length})</h3>
        {past.length === 0 ? (
          <p className="text-sm text-muted">지난 공연이 없어요.</p>
        ) : (
          <div className="flex flex-col gap-2 opacity-70">
            {past.map((t) => (
              <TicketCard key={t.productId} ticket={t} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
