import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const MAX_LABEL_LENGTH = 30;

/** Lets the signed-in member edit their own public-facing feed-attribution profile (name/role label shown on their posts). */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const membership = session?.user.artistMemberships.find((m) => m.artistId === id);
  if (!membership) {
    return NextResponse.json({ error: "본인 아티스트 계정만 수정할 수 있어요." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const displayName = typeof body?.displayName === "string" ? body.displayName.trim().slice(0, MAX_LABEL_LENGTH) : "";
  const roleLabel = typeof body?.roleLabel === "string" ? body.roleLabel.trim().slice(0, MAX_LABEL_LENGTH) : "";

  const updated = await prisma.artistMember.update({
    where: { id: membership.id },
    data: {
      displayName: displayName || null,
      roleLabel: roleLabel || null,
    },
  });

  return NextResponse.json({ displayName: updated.displayName, roleLabel: updated.roleLabel });
}
