import { Request, Response } from 'express';
import fetch from 'node-fetch';

export const sendChatMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, userId } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Message is required.' });
      return;
    }

    const webhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!webhookUrl) {
      res.status(500).json({ error: 'Webhook URL is not configured.' });
      return;
    }

    console.log('Sending data to webhook:', { message, userId });

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, userId }),
    });

    const data = await response.json();

    // Log the full response from the webhook
    console.log('Full response from webhook:', data);

    // Check if the response contains the expected "response" field
    const aiResponse = data.response || 'No response from AI.';
    res.status(200).json({ response: aiResponse });
  } catch (error: any) {
    console.error('Error in sendChatMessage:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};