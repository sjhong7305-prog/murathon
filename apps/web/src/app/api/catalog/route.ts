import { NextResponse } from "next/server";
import { getAllArtists, getAllProducts } from "@/lib/data";

export async function GET() {
  const [artists, products] = await Promise.all([getAllArtists(), getAllProducts()]);
  return NextResponse.json({ artists, products });
}
