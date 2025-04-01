import { Router } from "express";
import axios from "axios";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

const APP_ID = process.env.APP_ID!;
const APP_SECRET = process.env.APP_SECRET!;
const REDIRECT_URI = process.env.REDIRECT_URI!;

router.get("/", (req, res) => {
  const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${APP_ID}&redirect_uri=${REDIRECT_URI}&scope=instagram_basic,instagram_manage_comments,pages_show_list,pages_read_engagement,pages_manage_posts,pages_read_user_content&response_type=code`;
  res.redirect(authUrl);
});

// router.get("/callback", async (req, res) => {
//   const { code } = req.query;
//   if (!code) {
//     res.status(400).send("Authorization code missing.");
//     return;
//   }

//   try {
//     const tokenResponse = await axios.post(
//       `https://graph.facebook.com/v18.0/oauth/access_token`,
//       null,
//       {
//         params: {
//           client_id: APP_ID,
//           client_secret: APP_SECRET,
//           redirect_uri: REDIRECT_URI,
//           code: code,
//         },
//       }
//     );

//     const accessToken = tokenResponse.data.access_token;

//     const fbResponse = await axios.get(
//       `https://graph.facebook.com/me/accounts?fields=id,name,email,access_token&access_token=${accessToken}`
//     );

//     const {
//       id: facebookId,
//       access_token,
//       name,
//       email,
//     } = fbResponse.data.data[0];
//     let instagramId = null;

//     try {
//       const pages = await axios.get(
//         `https://graph.facebook.com/me/accounts?fields=instagram_business_account{id}&access_token=${accessToken}`
//       );
//       if (pages.data.data.length > 0) {
//         instagramId = pages.data.data[0].instagram_business_account?.id;
//       }
//     } catch (err) {
//       console.warn("No Instagram business account linked.");
//     }

//     const user = await prisma.user.upsert({
//       where: { facebookId },
//       update: { accessToken: access_token, instagramId, name },
//       create: {
//         facebookId,
//         accessToken: access_token,
//         instagramId,
//         name,
//         email: "",
//       },
//     });

//     res.json({ message: "User authenticated", user });
//   } catch (error: any) {
//     console.error(error.response?.data || error.message);
//     res.status(500).send("Error fetching access token.");
//   }
// });
router.post("/callback", async (req, res) => {
  const { accessToken, userId, photoUrl, name } = req.body;
  if (!accessToken) {
    res.status(400).send("accessToken missing.");
    return;
  }
  console.log(accessToken, userId, photoUrl, name);

  try {
    await prisma.user.upsert({
      where: { id: userId },
      update: { accessToken: accessToken, photoUrl, name },
      create: {
        id: userId,
        accessToken,
        photoUrl,
        name,
        email: "",
      },
    });
    console.log(
      `https://graph.facebook.com/me/accounts?fields=id,name,email,access_token,picture&access_token=${accessToken}`
    );
    const fbResponse = await axios.get(
      `https://graph.facebook.com/me/accounts?fields=id,name,email,access_token,picture&access_token=${accessToken}`
    );

    await Promise.all(
      fbResponse.data.data.map(async (account: any) => {
        const { id, access_token, name, picture } = account;
        let instagramId = "";

        try {
          const igResponse = await axios.get(
            `https://graph.facebook.com/v19.0/${id}?fields=instagram_business_account,username,profile_picture_url,followers_count,access_token&access_token=${accessToken}`
          );
          if (igResponse.data.data.length > 0) {
            instagramId =
              igResponse.data.data[0].instagram_business_account?.id;
          }
        } catch (err) {
          console.warn("No Instagram business account linked.");
        }

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
});

export default router;
