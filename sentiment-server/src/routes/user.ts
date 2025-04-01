import { Request, Response, Router } from "express";
import axios from "axios";
import { PrismaClient } from "@prisma/client";
import Sentiment from "sentiment";

const router = Router();
const prisma = new PrismaClient();
const sentiment = new Sentiment();

async function summarizeSentiment(comments: any[]) {
  const API_URL = "https://api.deepseek.com/v1/chat/completions";
  const API_KEY = process.env.DEEPSEEK_API_KEY;

  const formattedComments = comments
    .map((c, i) => `${i + 1}. '${c.text}'`)
    .join("\n");

  const prompt = `Analyze the following social media comments and provide a sentiment breakdown along with a concise summary of the overall sentiment trends. Identify whether the majority of comments are positive, negative, or neutral, and highlight any common themes or emotions present.\n\nComments:\n${formattedComments}\n\nProvide a sentiment breakdown (e.g., X% positive, Y% negative, Z% neutral) and a 2-3 sentence summary of the overall sentiment trends.`;
  console.log(prompt);

  const payload = {
    text: prompt,
    max_length: 80,
    min_length: 30,
  };

  console.log(payload);
  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/summarize",
      payload,
      {
        headers: { Authorization: `Bearer YOUR_HUGGINGFACE_API_TOKEN` },
      }
    );
    return response.data.summary;
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    return "Error summarizing sentiment.";
  }
}
router.get("/posts", async (req: Request, res: Response) => {
  const { userId, platform, pageId } = req.query;
  console.log(
    "Fetching posts for user:",
    userId,
    "page ",
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
    console.log(accessToken);
    const apiUrl =
      platform === "facebook"
        ? `https://graph.facebook.com/me/posts?fields=id,message,created_time,permalink_url&access_token=${accessToken}`
        : `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,timestamp&access_token=${accessToken}`;

    const postsResponse = await axios.get(apiUrl);
    const posts = postsResponse.data.data;
    const fbPosts = [];

    for (const post of posts) {
      await prisma.post.upsert({
        where: { id: post.id },
        update: { message: post.message || post.caption },
        create: {
          id: post.id,
          // userId: user.id,
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

    console.log({ fbPosts });

    res.json(fbPosts);
  } catch (error: any) {
    console.error(error.response?.data || error.message);
    res.status(500).send("Error fetching posts.");
  }
});

router.get("/comments", async (req, res) => {
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

    const apiUrl =
      platform === "facebook"
        ? `https://graph.facebook.com/${postId}/comments?fields=id,message,from,created_time&access_token=${post.user.accessToken}`
        : `https://graph.facebook.com/${postId}/comments?fields=id,text,username,timestamp&access_token=${post.user.accessToken}`;

    const commentsResponse = await axios.get(apiUrl);
    const comments = commentsResponse.data.data;
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

      await prisma.comment.upsert({
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

      const dbComment = await prisma.comment.findUnique({
        where: { id: postId.toString() },
        include: {
          post: true,
        },
      });
      updateComments.push(dbComment);
    }

    res.json(updateComments);
  } catch (error: any) {
    console.error(error.response?.data || error.message);
    res.status(500).send("Error fetching comments.");
  }
});
router.get("/comments/all", async (req, res) => {
  const { userId, pageId, platform } = req.query;
  if (!userId || !platform) {
    res.status(400).send("Post ID and platform required.");
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
        const apiUrl =
          platform === "facebook"
            ? `https://graph.facebook.com/${post.id}/comments?fields=id,message,from,created_time&access_token=${accessToken}`
            : `https://graph.facebook.com/${post.id}/comments?fields=id,text,username,timestamp&access_token=${accessToken}`;

        const commentsResponse = await axios.get(apiUrl);
        const comments = commentsResponse.data.data;

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
});

export default router;
