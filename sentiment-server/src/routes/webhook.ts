import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import Sentiment from "sentiment";

const router = Router();
const prisma = new PrismaClient();
const sentiment = new Sentiment();

router.post("/", async (req, res) => {
  const body = req.body;

  if (body.entry) {
    for (const entry of body.entry) {
      for (const change of entry.changes) {
        if (change.field === "comments") {
          const { id, text, username, timestamp } = change.value;
          const analysis = sentiment.analyze(text);
          const sentimentScore = analysis.score;
          const sentimentLabel =
            sentimentScore > 0
              ? "positive"
              : sentimentScore < 0
              ? "negative"
              : "neutral";

          await prisma.comment.upsert({
            where: { id },
            update: { sentimentScore, sentimentLabel },
            create: {
              id,
              postId: entry.id,
              text,
              username,
              timestamp: new Date(timestamp),
              sentimentScore,
              sentimentLabel,
            },
          });
        }
      }
    }
  }

  res.sendStatus(200);
});

export default router;
