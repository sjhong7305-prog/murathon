import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginRequired } from "@/components/login-required";

export default async function FollowerMyPage() {
  const session = await getSession();
  if (!session) {
    return (
      <LoginRequired
        title="팬 로그인이 필요해요"
        description="로그인하면 나의 컬렉션과 후원 기록을 볼 수 있어요."
      />
    );
  }
  redirect(`/fans/${session.user.id}`);
}
