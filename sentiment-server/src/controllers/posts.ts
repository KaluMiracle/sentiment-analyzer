import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { summarizeSentiment } from "../utils/sentiment";
import { fetchFacebookPosts, fetchInstagramMedia } from "../services/facebook";

const prisma = new PrismaClient();

export const getPosts = async (req: Request, res: Response) => {
  const { userId, platform, pageId } = req.query;

  console.log(
    "Fetching posts for user:",
    userId,
    "page:",
    pageId,
    "on platform:",
    platform
  );

  if (!userId || !platform) {
    res.status(400).send("User ID and platform required.");
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId.toString() },
      include: { pages: true },
    });

    if (!user) {
      res.status(404).send("User not found.");
      return;
    }

    let accessToken = user.accessToken;
    if (pageId) {
      accessToken = user.pages.find((page) => page.id === pageId)?.accessToken;
    }

    let posts = [];
    if (platform === "facebook") {
      posts = await fetchFacebookPosts(accessToken);
    } else if (platform === "instagram") {
      posts = await fetchInstagramMedia(accessToken);
    }

    const fbPosts = [];

    for (const post of posts) {
      await prisma.post.upsert({
        where: { id: post.id },
        update: { message: post.message || post.caption },
        create: {
          id: post.id,
          userId: userId.toString(),
          pageId: pageId ? pageId.toString() : null,
          platform: platform.toString(),
          message: post.message || post.caption,
          mediaUrl: post.media_url || post.permalink_url,
          permalink: post.permalink_url || post.permalink,
          timestamp: new Date(post.created_time || post.timestamp),
        },
      });

      const dbPost = await prisma.post.findUnique({
        where: { id: post.id },
        include: {
          user: true,
          comments: true,
        },
      });

      summarizeSentiment(dbPost.comments).then((summary) =>
        console.log("Sentiment Summary:", summary)
      );

      fbPosts.push(dbPost);
    }

    res.json(fbPosts);
  } catch (error: any) {
    console.error(error.response?.data || error.message);
    res.status(500).send("Error fetching posts.");
  }
};
