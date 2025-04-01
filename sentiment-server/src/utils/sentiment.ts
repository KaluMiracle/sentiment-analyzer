import axios from "axios";

export async function summarizeSentiment(comments: any[]) {
  const API_URL = "http://127.0.0.1:8000/summarize";

  const formattedComments = comments
    .map((c, i) => `${i + 1}. '${c.text}'`)
    .join("\n");

  const prompt = `Analyze the following social media comments and provide a sentiment breakdown along with a concise summary of the overall sentiment trends. Identify whether the majority of comments are positive, negative, or neutral, and highlight any common themes or emotions present.\n\nComments:\n${formattedComments}\n\nProvide a sentiment breakdown (e.g., X% positive, Y% negative, Z% neutral) and a 2-3 sentence summary of the overall sentiment trends.`;

  const payload = {
    text: prompt,
    max_length: 80,
    min_length: 30,
  };

  try {
    const response = await axios.post(API_URL, payload, {
      headers: { Authorization: `Bearer YOUR_HUGGINGFACE_API_TOKEN` },
    });
    return response.data.summary;
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    return "Error summarizing sentiment.";
  }
}
