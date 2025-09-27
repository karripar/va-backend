/* eslint-disable @typescript-eslint/no-unused-vars */
import mongoose from 'mongoose';
import app from '../src/app';
import {MessageResponse} from '../src/types/MessageTypes';
import randomstring from 'randomstring';
// import {getFavorites} from '../test/controllers/testFavorites';
import dotenv from 'dotenv';

dotenv.config();

describe('GET /api/v1', () => {
  beforeAll(async () => {
    if (!process.env.DB_URL) {
      throw new Error('DB_URL is not defined');
    }
    await mongoose.connect(process.env.DB_URL);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should do something', async () => {
    console.log('This is a placeholder test. Replace with actual tests.');
    expect(true).toBe(true);
  });

  it('Should fetch all destination partner schools from Metropolia', async () => {
    const res = await fetch('http://localhost:3002/api/v1/data/metropolia/destinations');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('destinations');
    expect(data.destinations).toBeInstanceOf(Object);
    expect(data.destinations.length).toBeGreaterThan(0);
  });
});
