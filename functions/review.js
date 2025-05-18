// netlify/functions/review.js

// Netlify Function entrypoint
exports.handler = async (event, context) => {
  // 1) Common headers for CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // 2) Preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: '',
    };
  }

  // 3) Simple GET health-check
  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        message: 'Review endpoint is live',
      }),
    };
  }

  // 4) POST: run your AI review
  if (event.httpMethod === 'POST') {
    let payload;
    try {
      payload = JSON.parse(event.body);
    } catch (err) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid JSON body' }),
      };
    }

    const { appFocus, reviewFocus, frames } = payload;

    try {
      // Example: call your OpenAI backend (replace URL if you use Netlify Env var)
      const AI_ENDPOINT = process.env.AI_ENDPOINT_URL; 
      const AI_KEY      = process.env.AI_API_KEY;

      const aiRes = await fetch(AI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_KEY}`,
        },
        body: JSON.stringify({ appFocus, reviewFocus, frames }),
      });
      if (!aiRes.ok) {
        throw new Error(`AI API returned ${aiRes.status}`);
      }
      const suggestions = await aiRes.json();

      // 5) Return the suggestions
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

  // 6) Method not allowed
  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method Not Allowed' }),
  };
};

