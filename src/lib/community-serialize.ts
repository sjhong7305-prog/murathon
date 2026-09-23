export function serializeCommunityPost(post: {
  id: string;
  title: string;
  body: string;
  authorNickname: string;
  authorType: "ARTIST" | "FOLLOWER";
  tags: string[];
  createdAt: Date;
  attachedProduct:
    | {
        id: string;
        title: string;
        type: "ALBUM" | "TRACK" | "MERCH" | "TICKET";
        coverColor: string;
        imageUrl: string | null;
        previewAudioUrl: string | null;
        suggestedPrice: number;
        artist: { name: string };
      }
    | null;
  comments: {
    id: string;
    authorNickname: string;
    authorType: "ARTIST" | "FOLLOWER";
    message: string;
    createdAt: Date;
  }[];
}) {
  return {
    id: post.id,
    title: post.title,
    body: post.body,
    author: post.authorNickname,
    authorType: post.authorType.toLowerCase() as "artist" | "follower",
    tags: post.tags,
    createdAt: post.createdAt,
    attachedProduct: post.attachedProduct
      ? {
          id: post.attachedProduct.id,
          title: post.attachedProduct.title,
          type: post.attachedProduct.type.toLowerCase() as "album" | "track" | "merch" | "ticket",
          coverColor: post.attachedProduct.coverColor,
          imageUrl: post.attachedProduct.imageUrl ?? undefined,
          previewAudioUrl: post.attachedProduct.previewAudioUrl ?? undefined,
          suggestedPrice: post.attachedProduct.suggestedPrice,
          artistName: post.attachedProduct.artist.name,
        }
      : null,
    comments: post.comments.map((c) => ({
      id: c.id,
      author: c.authorNickname,
      authorType: c.authorType.toLowerCase() as "artist" | "follower",
      message: c.message,
      createdAt: c.createdAt,
    })),
  };
}
