import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import Sentiment from "sentiment";
import { fetchPostComments } from "../services/facebook";

const prisma = new PrismaClient();
const sentiment = new Sentiment();

export const getComments = async (req: Request, res: Response) => {
  const { postId, platform } = req.query;

  if (!postId || !platform) {
    res.status(400).send("Post ID and platform required.");
    return;
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId.toString() },
      include: {
        user: true,
      },
    });

    if (!post) {
      res.status(404).send("Post not found.");
      return;
    }

    const comments = await fetchPostComments(
      postId.toString(),
      platform.toString(),
      post.user.accessToken
    );
    const updateComments = [];

    for (let comment of comments) {
      const text = comment.message || comment.text;
      const username = comment.from?.name || comment.username;

      const analysis = sentiment.analyze(text);
      const sentimentScore = analysis.score;
      const sentimentLabel =
        sentimentScore > 0
          ? "positive"
          : sentimentScore < 0
          ? "negative"
          : "neutral";

      console.log(comment, sentimentScore, sentimentLabel);

      const dbComment = await prisma.comment.upsert({
        where: { id: comment.id },
        update: { sentimentScore, sentimentLabel },
        create: {
          id: comment.id,
          postId: post.id,
          text,
          username,
          timestamp: new Date(comment.created_time || comment.timestamp),
          sentimentScore,
          sentimentLabel,
        },
      });

      updateComments.push(dbComment);
    }

    res.json(updateComments);
  } catch (error: any) {
    console.error(error.response?.data || error.message);
    res.status(500).send("Error fetching comments.");
  }
};

export const getAllComments = async (req: Request, res: Response) => {
  const { userId, pageId, platform } = req.query;

  if (!userId || !platform) {
    res.status(400).send("User ID and platform are required.");
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId.toString() },
      include: { pages: true, posts: true },
    });

    if (!user) {
      res.status(404).send("User not found.");
      return;
    }

    let accessToken = user.accessToken;
    if (pageId) {
      accessToken = user.pages.find((page) => page.id === pageId)?.accessToken;
    }

    const updateComments = [];
    await Promise.all(
      user.posts.map(async (post) => {
        const comments = await fetchPostComments(
          post.id,
          platform.toString(),
          accessToken
        );

        for (let comment of comments) {
          const text = comment.message || comment.text;
          const username = comment.from?.name || comment.username;

          const analysis = sentiment.analyze(text);
          const sentimentScore = analysis.score;
          const sentimentLabel =
            sentimentScore > 0
              ? "positive"
              : sentimentScore < 0
              ? "negative"
              : "neutral";

          console.log(comment, sentimentScore, sentimentLabel);

          const dbComment = await prisma.comment.upsert({
            where: { id: comment.id },
            update: { sentimentScore, sentimentLabel },
            create: {
              id: comment.id,
              postId: post.id,
              text,
              username,
              timestamp: new Date(comment.created_time || comment.timestamp),
              sentimentScore,
              sentimentLabel,
            },
          });

          updateComments.push(dbComment);
        }
      })
    );

    res.json(updateComments);
  } catch (error: any) {
    console.error(error.response?.data || error.message);
    res.status(500).send("Error fetching comments.");
  }
};
