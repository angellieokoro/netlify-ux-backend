import fetch from 'node-fetch';

exports.handler = async function(event, context) {
  const { httpMethod, body } = event;

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // 1) Pre-flight CORS
  if (httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  // 2) Simple GET health‐check
  if (httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, message: 'Review function is live' }),
    };
  }

  // 3) POST handler from Figma plugin
  if (httpMethod === 'POST') {
    try {
      const { appFocus, reviewFocus, frames } = JSON.parse(body);
      const FIGMA_FILE_ID = process.env.FIGMA_FILE_ID;
      const FIGMA_TOKEN   = process.env.FIGMA_TOKEN;
      const OPENAI_KEY    = process.env.OPENAI_API_KEY;

      // (Optional) Fetch Figma file JSON for context
      const figmaResp = await fetch(
        `https://api.figma.com/v1/files/${FIGMA_FILE_ID}`,
        { headers: { 'X-FIGMA-TOKEN': FIGMA_TOKEN } }
      );
      const figmaJson = await figmaResp.json();

      // Call OpenAI
      const openaiResp = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_KEY}`,
            'Content-Type':  'application/json',
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "You are a Figma-savvy UX engineer. Given an app goal, a review focus, and a list of frame names, return JSON suggestions:\n" +
                  "[{ frameId:string, actions:[{type, target, params}] }]",
              },
              {
                role: "user",
                content: JSON.stringify({ appFocus, reviewFocus, frames }),
              },
            ],
          }),
        }
      );
      const { choices } = await openaiResp.json();
      const suggestions = JSON.parse(choices[0].message.content);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(suggestions),
      };
    } catch (err) {
      console.error('Review function error:', err);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: err.message }),
      };
    }
  }

  // 4) Method not allowed
  return {
    statusCode: 405,
    headers,
    body: 'Method Not Allowed',
  };
};

