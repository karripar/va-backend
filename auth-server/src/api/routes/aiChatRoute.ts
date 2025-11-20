import express from 'express';
import {aiChatTurn} from '../controllers/aiChatController';

const router = express.Router();

/**
 * @api {post} /api/v1/ai/chat/turn Proxy AI chat turn
 * @apiName ProxyAIChatTurn
 * @apiGroup AIChat
 *
 * @apiDescription
 * Forwards the request body to the internal VA-chat-service endpoint
 * and streams the response back to the client.
 */
router.post('/turn', aiChatTurn);

export default router;
