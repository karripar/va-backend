import type {NextFunction, Request, Response} from 'express';

const {VA_CHAT_SERVICE_URL, VA_CHAT_SERVICE_API_KEY} = process.env;

/**
 * Proxy a single AI chat turn to the VA-chat-service.
 *
 * Route: POST /api/v1/ai/chat/turn
 *
 * The request body is forwarded as-is to the VA-chat-service endpoint
 * `${VA_CHAT_SERVICE_URL}/api/turn_response` and the response status,
 * headers and body are streamed back to the client.
 */
export const aiChatTurn = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!VA_CHAT_SERVICE_URL) {
      res
        .status(500)
        .json({message: 'VA_CHAT_SERVICE_URL is not configured on the server'});
      return;
    }

    const targetUrl = `${VA_CHAT_SERVICE_URL.replace(/\/$/, '')}/api/turn_response`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (VA_CHAT_SERVICE_API_KEY) {
      headers['x-service-api-key'] = VA_CHAT_SERVICE_API_KEY;
    }

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(req.body),
    });

    const contentType =
      response.headers.get('content-type') || 'application/json';
    res.status(response.status);
    res.setHeader('Content-Type', contentType);

    const text = await response.text();
    res.send(text);
  } catch (error) {
    next(error);
  }
};
