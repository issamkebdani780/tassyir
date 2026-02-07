// Vercel Serverless Function
// Place this file at: api/submit.js

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get data from request body
    const { name, email, phone, timestamp } = req.body;

    // Validate required fields
    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Forward to n8n webhook
    const n8nResponse = await fetch(
      'https://tassyir.app.n8n.cloud/webhook-test/bd488373-c129-4b6f-a420-ca6bc7398876',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          timestamp: timestamp || new Date().toISOString(),
        }),
      }
    );

    // Check if n8n request was successful
    if (!n8nResponse.ok) {
      console.error('n8n webhook error:', await n8nResponse.text());
      return res.status(500).json({ error: 'Failed to submit to webhook' });
    }

    // Get response from n8n
    const n8nData = await n8nResponse.json().catch(() => ({}));

    // Return success
    return res.status(200).json({
      success: true,
      message: 'Form submitted successfully',
      data: n8nData,
    });
  } catch (error) {
    console.error('Error in submit handler:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}