import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인한 팬만 변경할 수 있어요." }, { status: 401 });
  }
  const { collectionPrivacy } = await req.json();
  if (collectionPrivacy !== "PUBLIC" && collectionPrivacy !== "PRIVATE") {
    return NextResponse.json({ error: "collectionPrivacy must be PUBLIC or PRIVATE" }, { status: 400 });
  }
  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { collectionPrivacy },
  });
  return NextResponse.json({ collectionPrivacy: user.collectionPrivacy });
}
