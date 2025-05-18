k/*  functions/review.js   – CommonJS, no @netlify/functions needed  */
const OpenAI = require('openai');

// CORS helper ----------------------------------------------------
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

exports.handler = async function (event /*, context */) {
  // Pre-flight ----------------------------------------------------
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors };
  }

  try {
    const { appFocus, reviewFocus } = JSON.parse(event.body || '{}');

    // real OpenAI call — requires env var OPENAI_API_KEY
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    /* -----------------------------------------------------------
       Replace this demo array with the real openai response later
    ------------------------------------------------------------*/
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
      headers: cors,
      body: JSON.stringify({ suggestions }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: cors,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
