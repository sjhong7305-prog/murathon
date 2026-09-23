import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

/**
 * Self-service "delete" for an artist's own ALBUM/TRACK release — used by the "릴리즈 관리" list on
 * the artist dashboard. Scoped to ALBUM/TRACK only: MERCH/TICKET stay admin-managed via backoffice.
 *
 * This is a soft delete (status -> UNPUBLISHED), never a hard `prisma.product.delete`. Fans who
 * already bought the release keep full library/streaming access (see getFanCollectionProfile /
 * stream-auth, which key off OrderItem ownership, not status) — only Store/Artist Profile
 * discovery and new purchases are cut off (getAllProducts / getProductsByArtist filter on
 * status, and the cart/orders routes reject adding an unpublished product). Media in COS is
 * deliberately left in place since legacy buyers still need to stream it.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; productId: string }> }
) {
  const { id, productId } = await params;
  const session = await getSession();
  if (!session || !session.user.artistMemberships.some((m) => m.artistId === id)) {
    return NextResponse.json({ error: "본인 아티스트 계정만 삭제할 수 있어요." }, { status: 403 });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.artistId !== id) {
    return NextResponse.json({ error: "음원을 찾을 수 없어요." }, { status: 404 });
  }
  if (product.type !== "ALBUM" && product.type !== "TRACK") {
    return NextResponse.json({ error: "음원 릴리즈만 이 화면에서 삭제할 수 있어요." }, { status: 400 });
  }
  if (product.status === "UNPUBLISHED") {
    return NextResponse.json({ error: "이미 삭제된 음원이에요." }, { status: 404 });
  }

  await prisma.product.update({ where: { id: productId }, data: { status: "UNPUBLISHED" } });

  return NextResponse.json({ ok: true });
}
