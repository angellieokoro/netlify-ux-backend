// functions/review.js  (CommonJS version – works out-of-the-box)

// Only runtime deps you really need
const OpenAI = require('openai');

// Netlify passes the request as `event` (body is a string)
exports.handler = async function (event /*, context */) {
  // --- CORS pre-flight --------------------------------------------------
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders(),
    };
  }

  try {
    const { appFocus, reviewFocus } = JSON.parse(event.body || '{}');

    // 🔑  REQUIRES env var OPENAI_API_KEY
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    /* ---------------------------------------------------------------
       👉  Your real prompt / chat completion goes here.
       For demo we return two fake suggestions.
    ----------------------------------------------------------------*/
    const suggestions = [
      {
        frameId: '123ABC',
        critique: 'Low contrast',
        action: 'recolor',
        target: 'textNode1',
        params: { newColor: '#333333' },
      },
      {
        frameId: '456DEF',
        critique: 'Button colour not AA-compliant',
        action: 'recolor',
        target: 'buttonNode1',
        params: { newColor: '#007bff' },
      },
    ];

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ suggestions }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: err.message }),
    };
  }
};

// helper so we don’t repeat ourselves
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
