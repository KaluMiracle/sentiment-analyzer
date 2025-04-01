import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import {
  fetchFacebookPages,
  fetchInstagramBusinessAccount,
} from "../services/facebook";

const prisma = new PrismaClient();

export const getAuthUrl = (req: Request, res: Response) => {
  const APP_ID = process.env.APP_ID!;
  const REDIRECT_URI = process.env.REDIRECT_URI!;
  const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${APP_ID}&redirect_uri=${REDIRECT_URI}&scope=instagram_basic,instagram_manage_comments,pages_show_list,pages_read_engagement,pages_manage_posts,pages_read_user_content&response_type=code`;
  res.redirect(authUrl);
};

export const handleCallback = async (req: Request, res: Response) => {
  const { accessToken, userId, photoUrl, name } = req.body;

  if (!accessToken) {
    res.status(400).send("accessToken missing.");
    return;
  }

  console.log(accessToken, userId, photoUrl, name);

  try {
    // Upsert user in the database
    await prisma.user.upsert({
      where: { id: userId },
      update: { accessToken, photoUrl, name },
      create: {
        id: userId,
        accessToken,
        photoUrl,
        name,
        email: "",
      },
    });

    // Fetch Facebook pages
    const pages = await fetchFacebookPages(accessToken);

    // Upsert pages in the database
    await Promise.all(
      pages.map(async (page: any) => {
        const { id, access_token, name, picture } = page;

        // Fetch Instagram business account
        const instagramBusinessAccount = await fetchInstagramBusinessAccount(
          id,
          accessToken
        );
        const instagramId = instagramBusinessAccount
          ? instagramBusinessAccount.id
          : "";

        await prisma.page.upsert({
          where: { id },
          update: {
            accessToken: access_token,
            name,
            photoUrl: picture.data.url,
          },
          create: {
            id,
            userId,
            accessToken: access_token,
            name,
            photoUrl: picture.data.url,
            instagramId,
          },
        });
      })
    );

    // Fetch the updated user with pages
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        pages: true,
      },
    });

    console.log("User data:", user);
    res.json(user);
  } catch (error: any) {
    console.error(error.response?.data || error.message);
    res.status(500).send("Error fetching access token.");
  }
};
