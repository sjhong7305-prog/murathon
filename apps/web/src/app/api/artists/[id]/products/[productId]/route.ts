import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@muraton/db";
import { getSession } from "@/lib/auth";
import { validatePriceFields } from "@/lib/price-validation";
import type { ReleaseType } from "@muraton/shared/types";

const RELEASE_TYPES: ReleaseType[] = ["single", "ep", "album"];

async function assertOwnsTrackProduct(id: string, productId: string) {
  const session = await getSession();
  if (!session || !session.user.artistMemberships.some((m) => m.artistId === id)) {
    return { error: NextResponse.json({ error: "본인 아티스트 계정만 수정할 수 있어요." }, { status: 403 }) };
  }
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.artistId !== id) {
    return { error: NextResponse.json({ error: "음원을 찾을 수 없어요." }, { status: 404 }) };
  }
  if (product.type !== "TRACK") {
    return { error: NextResponse.json({ error: "음원 릴리즈만 이 화면에서 수정할 수 있어요." }, { status: 400 }) };
  }
  return { product };
}

/**
 * Self-service edit for an artist's own TRACK release (single-track upload wizard only — ALBUM
 * tracklists stay backoffice-only). Only touches the Product row; the paired Track rights-
 * registration row (see POST /api/artists/[id]/tracks) is untouched by this route.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; productId: string }> }
) {
  const { id, productId } = await params;
  const check = await assertOwnsTrackProduct(id, productId);
  if ("error" in check) return check.error;

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "요청 형식이 올바르지 않아요." }, { status: 400 });
  }

  const title = String(body.title ?? "").trim();
  const description = String(body.description ?? "").trim();
  if (!title || !description) {
    return NextResponse.json({ error: "제목과 설명을 입력해주세요." }, { status: 400 });
  }
  const genre = typeof body.genre === "string" ? body.genre.trim() : "";

  if (!RELEASE_TYPES.includes(body.releaseType)) {
    return NextResponse.json({ error: "릴리즈 유형을 선택해주세요." }, { status: 400 });
  }

  const priceCheck = validatePriceFields(body.minPrice, body.suggestedPrice);
  if (!priceCheck.ok) {
    return NextResponse.json({ error: priceCheck.error }, { status: 400 });
  }

  const status = String(body.status ?? "PUBLISHED");
  if (status !== "PUBLISHED" && status !== "UNPUBLISHED") {
    return NextResponse.json({ error: "공개 상태가 올바르지 않아요." }, { status: 400 });
  }

  const durationSec =
    typeof body.durationSec === "number" && Number.isFinite(body.durationSec) ? Math.round(body.durationSec) : null;

  const updated = await prisma.product.update({
    where: { id: productId },
    data: {
      title,
      description,
      genre: genre || null,
      imageUrl: typeof body.imageUrl === "string" && body.imageUrl ? body.imageUrl : null,
      previewAudioUrl: typeof body.previewAudioUrl === "string" && body.previewAudioUrl ? body.previewAudioUrl : null,
      durationSec,
      minPrice: priceCheck.minPrice,
      suggestedPrice: priceCheck.suggestedPrice,
      releaseType: body.releaseType.toUpperCase() as "SINGLE" | "EP" | "ALBUM",
      status,
    },
  });

  return NextResponse.json({ ok: true, productId: updated.id });
}

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
