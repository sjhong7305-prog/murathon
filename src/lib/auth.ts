import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, ACTIVE_ARTIST_COOKIE } from "@/lib/session-cookie";
import { COVER_COLORS } from "@/lib/cover-colors";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 1000 * 60 * 15;

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

async function setSessionCookie(userId: string) {
  const session = await prisma.session.create({
    data: { userId, expiresAt: new Date(Date.now() + SESSION_TTL_MS) },
  });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, session.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: session.expiresAt,
  });
}

/** Sets (or, with null, clears) which artist profile the header's mode switch is currently pointed at. */
export async function setActiveArtistCookie(artistId: string | null) {
  const cookieStore = await cookies();
  if (!artistId) {
    cookieStore.delete(ACTIVE_ARTIST_COOKIE);
    return;
  }
  cookieStore.set(ACTIVE_ARTIST_COOKIE, artistId, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: { include: { artistMemberships: { include: { artist: true } } } } },
  });

  if (!session || session.expiresAt < new Date()) return null;
  return session;
}

/**
 * The artist profile the header's mode switch currently points at, validated against the
 * session's own memberships (so a stale cookie from a left/deleted profile can't leak access).
 */
export async function getActiveArtistId(
  user: NonNullable<Awaited<ReturnType<typeof getSession>>>["user"]
): Promise<string | null> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(ACTIVE_ARTIST_COOKIE)?.value;
  if (!cookieValue) return null;
  const isMember = user.artistMemberships.some((m) => m.artistId === cookieValue);
  return isMember ? cookieValue : null;
}

/** Call at the top of any artist dashboard page. Redirects if not logged in or not a member of this artist. */
export async function requireArtistMember(slug: string) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  const membership = session.user.artistMemberships.find((m) => m.artist.slug === slug);
  if (!membership) {
    redirect("/");
  }
  return { user: session.user, artist: membership.artist, membership };
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user || user.isAdmin) {
    return { ok: false, error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    return { ok: false, error: `너무 많은 로그인 시도로 잠겼습니다. ${minutes}분 후 다시 시도하세요.` };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    const failedLoginCount = user.failedLoginCount + 1;
    const lockedUntil =
      failedLoginCount >= MAX_FAILED_ATTEMPTS ? new Date(Date.now() + LOCKOUT_MS) : null;
    await prisma.user.update({ where: { id: user.id }, data: { failedLoginCount, lockedUntil } });
    return { ok: false, error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginCount: 0, lockedUntil: null },
  });
  await setSessionCookie(user.id);

  return { ok: true };
}

export async function logoutUser() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (sessionId) {
    await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
  }
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(ACTIVE_ARTIST_COOKIE);
}

function slugify(base: string) {
  const cleaned = base
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return cleaned || "artist";
}

export async function uniqueArtistSlug(base: string) {
  const slugBase = slugify(base);
  let slug = slugBase;
  let n = 1;
  while (await prisma.artist.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${slugBase}-${n}`;
  }
  return slug;
}

/** Single signup path for every account — no role. Intent (fan/artist) only decides the post-signup redirect. */
export async function signup(input: {
  email: string;
  password: string;
  nickname: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const email = input.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { ok: false, error: "이미 가입된 이메일이에요." };

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, nickname: input.nickname.trim() },
  });

  await setSessionCookie(user.id);
  return { ok: true };
}

/** Creates a new artist profile owned by an already-logged-in user, and makes it the active mode. */
export async function createArtistProfile(
  userId: string,
  input: { name: string; slug: string; bio?: string; genre?: string; imageUrl?: string }
): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
  const name = input.name.trim();
  if (!name) return { ok: false, error: "활동명을 입력해주세요." };

  const slug = input.slug.trim().toLowerCase();
  if (!SLUG_PATTERN.test(slug)) {
    return { ok: false, error: "slug는 영문 소문자, 숫자, 하이픈만 사용할 수 있어요." };
  }
  if (await prisma.artist.findUnique({ where: { slug } })) {
    return { ok: false, error: "이미 사용 중인 slug예요." };
  }

  const genre = input.genre?.trim() ?? "";
  const coverColor = COVER_COLORS[Math.floor(Math.random() * COVER_COLORS.length)];

  const artist = await prisma.artist.create({
    data: {
      userId,
      slug,
      name,
      genre,
      genreTags: genre ? [genre] : [],
      location: "미정",
      tagline: genre ? `${genre} 아티스트` : "아직 소개를 작성하지 않았어요.",
      introduction: input.bio?.trim() || "아직 소개글을 작성하지 않았어요.",
      coverColor,
      imageUrl: input.imageUrl?.trim() || null,
      members: { create: { userId, role: "OWNER" } },
    },
  });

  await setActiveArtistCookie(artist.id);
  return { ok: true, slug: artist.slug };
}
