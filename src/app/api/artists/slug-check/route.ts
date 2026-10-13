import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADDRESS_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Used by /artist/new's live address-availability check as the user types. */
export async function GET(req: NextRequest) {
  const address = (req.nextUrl.searchParams.get("slug") ?? "").trim().toLowerCase();

  if (!ADDRESS_PATTERN.test(address)) {
    return NextResponse.json({ available: false, reason: "invalid" });
  }

  const existing = await prisma.artist.findUnique({ where: { slug: address } });
  return NextResponse.json({ available: !existing });
}
