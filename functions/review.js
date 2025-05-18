// functions/review.js

// If you need OpenAI, make sure openai is in your dependencies 
// and OPENAI_API_KEY is set in your Netlify site settings or .env.
const { OpenAI } = require("openai");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

exports.handler = async function(event, context) {
  // 1) Preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: "",
    };
  }

  // 2) Simple GET sanity check
  if (event.httpMethod === "GET") {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        ok: true,
        message: "Review endpoint is live",
      }),
    };
  }

  // 3) POST → parse, (optionally call OpenAI), echo back
  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (err) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ ok: false, error: "Invalid JSON" }),
    };
  }

  // **If** you want to call OpenAI here, e.g.:
  // const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  // const aiRes = await client.chat.completions.create({ … });
  // return { … body: JSON.stringify({ ok: true, data: aiRes }) };

  // For now we just echo:
  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({ ok: true, received: body }),
  };
};
