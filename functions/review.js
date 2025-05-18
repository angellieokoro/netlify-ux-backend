// functions/review.js

import { Handler } from '@netlify/functions'; // if using ES modules, otherwise use require
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, message: 'Review endpoint is live' }),
    };
  }

  if (event.httpMethod === 'POST') {
    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch (err) {
      return { statusCode: 400, headers, body: 'Invalid JSON' };
    }

    const { appFocus, reviewFocus, frames } = body;
    if (!appFocus || !reviewFocus || !Array.isArray(frames)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing one of appFocus, reviewFocus, frames[]' }),
      };
    }

    // Build your prompt for OpenAI
    const systemPrompt = `
You are a Figma Automation Assistant.
App goal: ${appFocus}
Review focus: ${reviewFocus}

For each frame provided, output a JSON object:
{ frameId: string, actions: Array<{ type: string, target: string, params: object }> }
Only output valid JSON.
`;
    const userPrompt = `Frames:\n${JSON.stringify(frames, null, 2)}`;

    try {
      const resp = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 800,
      });

      // extract JSON from GPT reply
      let text = resp.choices[0].message.content;
      // remove ``` fences if present
      text = text.replace(/```(?:json)?/, '').replace(/```$/, '').trim();

      const suggestions = JSON.parse(text);
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(suggestions),
      };
    } catch (err) {
      console.error(err);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: err.message }),
      };
    }
  }

  return { statusCode: 405, headers, body: 'Method Not Allowed' };
};

export { handler };

