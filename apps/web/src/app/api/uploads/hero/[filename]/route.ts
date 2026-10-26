import { serveHeroUpload } from "@muraton/shared/hero-uploads";

export async function GET(_req: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  return serveHeroUpload(filename);
}
