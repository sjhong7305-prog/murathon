import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { CreateAdminForm } from "./create-admin-form";
import { revokeSessionAction } from "./actions";
import { formatDate, formatDateTime } from "@/lib/format";

export default async function BackofficeAdminsPage() {
  const session = await requireAdmin();

  const [admins, mySessions, auditLogs] = await Promise.all([
    prisma.user.findMany({ where: { isAdmin: true }, orderBy: { createdAt: "asc" } }),
    prisma.session.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.auditLog.findMany({
      include: { actor: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-black text-ink">관리자</h1>

        <div className="mt-4 flex flex-col gap-2">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="flex items-center justify-between rounded-xl border border-line bg-surface p-3 text-sm"
            >
              <span className="font-semibold text-ink">{admin.email}</span>
              <span className="text-xs text-muted">
                가입일 {formatDate(admin.createdAt)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-bold text-ink">관리자 추가</h2>
        <div className="max-w-md">
          <CreateAdminForm />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-ink">내 활성 세션</h2>
        <div className="flex flex-col gap-2">
          {mySessions.map((s) => {
            const revoke = revokeSessionAction.bind(null, s.id);
            const isCurrent = s.id === session.id;
            return (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-xl border border-line bg-surface p-3 text-sm"
              >
                <div>
                  <p className="text-ink">
                    {formatDateTime(s.createdAt)}
                    {isCurrent && (
                      <span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-bold text-accent-strong">
                        현재 세션
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted">만료 {formatDateTime(s.expiresAt)}</p>
                </div>
                {!isCurrent && (
                  <form action={revoke}>
                    <button
                      type="submit"
                      className="text-xs font-semibold text-muted hover:text-rose-600"
                    >
                      로그아웃
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-ink">감사 로그 (최근 30건)</h2>
        <div className="overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="px-4 py-2 font-semibold">시각</th>
                <th className="px-4 py-2 font-semibold">관리자</th>
                <th className="px-4 py-2 font-semibold">액션</th>
                <th className="px-4 py-2 font-semibold">대상</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-muted">
                    기록이 없습니다.
                  </td>
                </tr>
              )}
              {auditLogs.map((log) => (
                <tr key={log.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-2 text-xs text-muted">
                    {formatDateTime(log.createdAt)}
                  </td>
                  <td className="px-4 py-2 text-ink">{log.actor.email}</td>
                  <td className="px-4 py-2 font-mono text-xs text-accent-strong">{log.action}</td>
                  <td className="px-4 py-2 font-mono text-xs text-muted">
                    {log.targetType} · {log.targetId.slice(0, 12)}…
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
