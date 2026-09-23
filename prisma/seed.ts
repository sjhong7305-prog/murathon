import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { seedArtists as artists, seedProducts as products } from "./seed-data";
import { mockPosts } from "../src/lib/mock-community";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const dummyPasswordHash = await bcrypt.hash("murathon-demo", 10);

  for (const artist of artists) {
    await prisma.user.upsert({
      where: { id: `user-${artist.id}` },
      update: {},
      create: {
        id: `user-${artist.id}`,
        email: `${artist.slug}@murathon.demo`,
        passwordHash: dummyPasswordHash,
        nickname: artist.name,
      },
    });

    await prisma.artist.upsert({
      where: { id: artist.id },
      update: {
        slug: artist.slug,
        name: artist.name,
        genre: artist.genre,
        genreTags: artist.genreTags ?? [],
        location: artist.location,
        tagline: artist.tagline,
        introduction: artist.introduction,
        coverColor: artist.coverColor,
        imageUrl: artist.imageUrl,
        bannerImage: artist.bannerImage,
        snsLink: artist.externalLinks?.sns,
        youtubeLink: artist.externalLinks?.youtube,
        websiteLink: artist.externalLinks?.website,
        checkoutQuestion: artist.checkoutQuestion,
      },
      create: {
        id: artist.id,
        userId: `user-${artist.id}`,
        slug: artist.slug,
        name: artist.name,
        genre: artist.genre,
        genreTags: artist.genreTags ?? [],
        location: artist.location,
        tagline: artist.tagline,
        introduction: artist.introduction,
        coverColor: artist.coverColor,
        imageUrl: artist.imageUrl,
        bannerImage: artist.bannerImage,
        snsLink: artist.externalLinks?.sns,
        youtubeLink: artist.externalLinks?.youtube,
        websiteLink: artist.externalLinks?.website,
        checkoutQuestion: artist.checkoutQuestion,
      },
    });
  }

  for (const artist of artists) {
    await prisma.artistMember.upsert({
      where: { artistId_userId: { artistId: artist.id, userId: `user-${artist.id}` } },
      update: {},
      create: { artistId: artist.id, userId: `user-${artist.id}`, role: "OWNER" },
    });
  }

  for (const artist of artists) {
    for (const nickname of artist.supporters ?? []) {
      await prisma.supporter.upsert({
        where: { artistId_nickname: { artistId: artist.id, nickname } },
        update: {},
        create: { artistId: artist.id, nickname },
      });
    }
  }

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        artistId: product.artistId,
        type: product.type.toUpperCase() as "ALBUM" | "TRACK" | "MERCH" | "TICKET",
        title: product.title,
        description: product.description,
        format: product.format,
        minPrice: product.minPrice,
        suggestedPrice: product.suggestedPrice,
        coverColor: product.coverColor,
        imageUrl: product.imageUrl,
        previewAudioUrl: product.previewAudioUrl,
        secretTitle: product.secretContent?.title,
        secretMessage: product.secretContent?.message,
        longDescription: product.longDescription,
        releaseDate: product.releaseDate ? new Date(product.releaseDate) : null,
        credits: product.credits,
        durationSec: product.durationSec,
      },
      create: {
        id: product.id,
        artistId: product.artistId,
        type: product.type.toUpperCase() as "ALBUM" | "TRACK" | "MERCH" | "TICKET",
        title: product.title,
        description: product.description,
        format: product.format,
        minPrice: product.minPrice,
        suggestedPrice: product.suggestedPrice,
        coverColor: product.coverColor,
        imageUrl: product.imageUrl,
        previewAudioUrl: product.previewAudioUrl,
        secretTitle: product.secretContent?.title,
        secretMessage: product.secretContent?.message,
        longDescription: product.longDescription,
        releaseDate: product.releaseDate ? new Date(product.releaseDate) : null,
        credits: product.credits,
        durationSec: product.durationSec,
      },
    });

    if (product.tracks) {
      await prisma.albumTrack.deleteMany({ where: { productId: product.id } });
      for (const track of product.tracks) {
        await prisma.albumTrack.create({
          data: {
            productId: product.id,
            trackNumber: track.trackNumber,
            title: track.title,
            durationSec: track.durationSec,
            isTitle: track.isTitle ?? false,
          },
        });
      }
    }
  }

  for (const post of mockPosts) {
    await prisma.communityPost.upsert({
      where: { id: post.id },
      update: {},
      create: {
        id: post.id,
        title: post.title,
        body: post.body,
        authorNickname: post.author,
        authorType: post.authorType === "artist" ? "ARTIST" : "FOLLOWER",
        tags: post.tags,
        attachedProductId: post.attachedProductId ?? null,
        createdAt: new Date(post.createdAt),
        comments: {
          create: post.comments.map((comment) => ({
            id: comment.id,
            authorNickname: comment.author,
            authorType: comment.authorType === "artist" ? "ARTIST" : "FOLLOWER",
            message: comment.message,
            createdAt: new Date(comment.createdAt),
          })),
        },
      },
    });
  }

  console.log(
    `Seeded ${artists.length} artists, ${products.length} products, and ${mockPosts.length} community posts.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
