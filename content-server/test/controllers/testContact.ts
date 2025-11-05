import request from 'supertest';
import { Application } from 'express';
import { MessageResponse } from '../../src/types/MessageTypes';
import { ContactMessageInput, ContactMessageResponse } from 'va-hybrid-types/contentTypes';

type ContactReplyResponse = {
  message: string;
  updatedMessage: ContactMessageResponse;
}

type DeleteContactResponse = {
  success: boolean;
  message: string;
}

/**
 * POST /api/v1/contact/message
 * Creates a new contact message.
 */
const postMessage = (
  url: string | Application,
  data: ContactMessageInput,
  token: string
): Promise<MessageResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post('/api/v1/contact/message')
      .set('Authorization', `Bearer ${token}`)
      .send(data)
      .expect(201, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const message: MessageResponse = response.body;
          expect(message.message).toBe('Message sent successfully');
          resolve(message);
        }
      });
  });
};

/**
 * PUT /api/v1/contact/message/reply/:id
 * Admin replies to a contact message.
 */
const replyToMessage = (
  url: string | Application,
  id: string,
  token: string,
  message: string
): Promise<ContactReplyResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post(`/api/v1/contact/message/reply/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ message })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const msgResponse: ContactReplyResponse = response.body;
          expect(msgResponse.message).toBe('Reply added successfully');
          expect(msgResponse.updatedMessage).toBeDefined();
          expect(msgResponse.updatedMessage.status).toBe('replied');
          resolve(msgResponse);
        }
      });
  });
};

/**
 * GET /api/v1/contact/messages
 * Fetches all contact messages.
 */
const getMessages = (
  url: string | Application,
  token: string
): Promise<{ messages: ContactMessageResponse[] }> => {
  return new Promise((resolve, reject) => {
    request(url)
      .get('/api/v1/contact/messages')
      .set('Authorization', `Bearer ${token}`)
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const data = response.body;
          expect(Array.isArray(data.messages)).toBe(true);
          data.messages.forEach((msg: ContactMessageResponse) => {
            expect(msg.name).toBeDefined();
            expect(msg.email).toBeDefined();
            expect(msg.subject).toBeDefined();
            expect(msg.message).toBeDefined();
          });
          resolve(data);
        }
      });
  });
};

/**
 * DELETE /api/v1/contact/message/:id
 * Deletes a contact message (admin only).
 */
const deleteMessage = (
  url: string | Application,
  id: string,
  token: string
): Promise<DeleteContactResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .delete(`/api/v1/contact/message/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const message: DeleteContactResponse = response.body;
          expect(message.success).toBe(true);
          expect(message.message).toBe('Message deleted successfully');
          resolve(message);
        }
      });
  });
};

export { postMessage, replyToMessage, getMessages, deleteMessage };
