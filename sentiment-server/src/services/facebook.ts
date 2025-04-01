import axios from "axios";

export const fetchFacebookPages = async (accessToken: string) => {
  const url = `https://graph.facebook.com/me/accounts?fields=id,name,email,access_token,picture&access_token=${accessToken}`;
  try {
    const response = await axios.get(url);
    return response.data.data; // Return the list of pages
  } catch (error: any) {
    console.error(
      "Error fetching Facebook pages:",
      error.response?.data || error.message
    );
    throw new Error("Failed to fetch Facebook pages.");
  }
};

export const fetchInstagramBusinessAccount = async (
  pageId: string,
  accessToken: string
) => {
  const url = `https://graph.facebook.com/v19.0/${pageId}?fields=instagram_business_account,username,profile_picture_url,followers_count,access_token&access_token=${accessToken}`;
  try {
    const response = await axios.get(url);
    return response.data.instagram_business_account || null; // Return Instagram business account if available
  } catch (error: any) {
    console.warn("No Instagram business account linked for page:", pageId);
    return null; // Return null if no Instagram business account is linked
  }
};

export const fetchPostComments = async (
  postId: string,
  platform: string,
  accessToken: string
) => {
  const apiUrl =
    platform === "facebook"
      ? `https://graph.facebook.com/${postId}/comments?fields=id,message,from,created_time&access_token=${accessToken}`
      : `https://graph.facebook.com/${postId}/comments?fields=id,text,username,timestamp&access_token=${accessToken}`;

  try {
    const response = await axios.get(apiUrl);
    return response.data.data; // Return the list of comments
  } catch (error: any) {
    console.error(
      "Error fetching comments for post:",
      postId,
      error.response?.data || error.message
    );
    throw new Error("Failed to fetch comments.");
  }
};

export const fetchFacebookPosts = async (accessToken: string) => {
  const apiUrl = `https://graph.facebook.com/me/posts?fields=id,message,created_time,permalink_url&access_token=${accessToken}`;
  try {
    const response = await axios.get(apiUrl);
    return response.data.data; // Return the list of posts
  } catch (error: any) {
    console.error(
      "Error fetching Facebook posts:",
      error.response?.data || error.message
    );
    throw new Error("Failed to fetch Facebook posts.");
  }
};

export const fetchInstagramMedia = async (accessToken: string) => {
  const apiUrl = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,timestamp&access_token=${accessToken}`;
  try {
    const response = await axios.get(apiUrl);
    return response.data.data; // Return the list of media
  } catch (error: any) {
    console.error(
      "Error fetching Instagram media:",
      error.response?.data || error.message
    );
    throw new Error("Failed to fetch Instagram media.");
  }
};
