/* eslint-disable @typescript-eslint/no-unused-vars */
import mongoose from 'mongoose';
import app from '../src/app';
import dotenv from 'dotenv';
import randomstring from 'randomstring';
import {
  postMessage,
  replyToMessage,
  getMessages,
  deleteMessage,
} from './controllers/testContact';
import {MessageResponse} from '../src/types/MessageTypes';
import request from 'supertest';
import jwt from 'jsonwebtoken';
dotenv.config();

if (
  !process.env.AUTH_SERVER ||
  !process.env.CONTENT_SERVER ||
  !process.env.UPLOAD_SERVER
) {
  throw new Error(
    'Missing AUTH_SERVER, app, or UPLOAD_SERVER in environment variables',
  );
}

const AUTH_SERVER = process.env.AUTH_SERVER;
const UPLOAD_SERVER = process.env.UPLOAD_SERVER;
const ADMIN_ID = process.env.ADMIN_ID_FOR_TESTS as string;

if (!ADMIN_ID) {
  throw new Error('Missing ADMIN_ID_FOR_TESTS in environment variables');
}

/**
 * IMPORTANT: ADD YOUR ADMIN USER ID TO .env FILE TO RUN THESE TESTS,
 * WITH GOOGLE SIGN IN WE CANNOT SIGN IN A TEST USER WITHOUT UI INTERACTION
 */

describe('Contact Controller API Tests', () => {
  beforeAll(async () => {
    // Connect to the test database
    const mongoURI = process.env.DB_URL;
    if (!mongoURI) {
      throw new Error('Missing DB_URL in environment variables');
    }
    await mongoose.connect(mongoURI);
  });

  let messageId: string;

  // actual user token from database id
  const testToken = jwt.sign(
    {id: ADMIN_ID, level_name: 'Admin'},
    process.env.JWT_SECRET as string,
    {expiresIn: '3h'},
  );

  // Generate random test data for message
  const testContactMessage = {
    name: 'TestUser_' + randomstring.generate(5),
    email: randomstring.generate(5) + '@example.com',
    subject: 'Test Subject ' + randomstring.generate(5),
    message: 'This is a test message from automated tests.',
  };

  it('should post a new contact message', async () => {
    const response = await postMessage(app, testContactMessage, testToken);
    expect(response.message).toBe('Message sent successfully');
  });

  it('should get all contact messages and include the new one', async () => {
    const data = await getMessages(app, testToken);
    expect(Array.isArray(data.messages)).toBe(true);

    const found = data.messages.find(
      (msg) => msg.email === testContactMessage.email,
    );
    expect(found).toBeDefined();
    if (found) {
      messageId = found._id;
      expect(messageId).toBeDefined();
    }
  });

  it('should allow admin to reply to the message', async () => {
    const replyText = 'Thank you for your message!';
    const response = await replyToMessage(app, messageId, testToken, replyText);

    expect(response.message).toBe('Reply added successfully');
    expect(response.updatedMessage).toBeDefined();
    expect(response.updatedMessage.status).toBe('replied');
  });

  it('should allow admin to delete the message', async () => {
    const response = await deleteMessage(app, messageId, testToken);
    expect(response.message).toBe('Message deleted successfully');
    expect(response.success).toBe(true);
  });

  afterAll(async () => {
    // Close mongoose connection if opened
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });
});
