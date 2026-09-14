export type AuthorType = "artist" | "follower";

export interface CommunityComment {
  id: string;
  author: string;
  authorType: AuthorType;
  message: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  title: string;
  body: string;
  author: string;
  authorType: AuthorType;
  createdAt: string;
  comments: CommunityComment[];
}

const POSTS_KEY = "muraton-community-posts";
const COMMENTS_KEY = "muraton-community-comments";

function readLocalPosts(): CommunityPost[] {
  try {
    const raw = window.localStorage.getItem(POSTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function readCommentsMap(): Record<string, CommunityComment[]> {
  try {
    const raw = window.localStorage.getItem(COMMENTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getLocalPosts(): CommunityPost[] {
  return readLocalPosts();
}

export function addLocalPost(input: {
  title: string;
  body: string;
  author: string;
  authorType: AuthorType;
}): CommunityPost {
  const post: CommunityPost = {
    id: `local-${Date.now().toString(36)}`,
    title: input.title.trim(),
    body: input.body.trim(),
    author: input.author.trim() || "익명",
    authorType: input.authorType,
    createdAt: new Date().toISOString(),
    comments: [],
  };
  const posts = readLocalPosts();
  window.localStorage.setItem(POSTS_KEY, JSON.stringify([post, ...posts]));
  return post;
}

export function getLocalComments(postId: string): CommunityComment[] {
  return readCommentsMap()[postId] ?? [];
}

export function addLocalComment(
  postId: string,
  input: { author: string; authorType: AuthorType; message: string }
): CommunityComment {
  const comment: CommunityComment = {
    id: `local-${Date.now().toString(36)}`,
    author: input.author.trim() || "익명",
    authorType: input.authorType,
    message: input.message.trim(),
    createdAt: new Date().toISOString(),
  };
  const map = readCommentsMap();
  const existing = map[postId] ?? [];
  map[postId] = [...existing, comment];
  window.localStorage.setItem(COMMENTS_KEY, JSON.stringify(map));
  return comment;
}
