import request from "supertest";
import { Application } from "express";
import { ProfileResponse } from "va-hybrid-types/contentTypes";

type MessageResponse = {
  message: string;
};

// GET /api/v1/users/profile
const getUserProfile = (
  url: string | Application,
  token: string
): Promise<ProfileResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .get("/api/v1/users/profile")
      .set("Authorization", `Bearer ${token}`)
      .expect(200, (err, response) => {
        if (err) return reject(err);
        const user: ProfileResponse = response.body;
        expect(user._id).toBeDefined();
        expect(user.email).toBeDefined();
        resolve(user);
      });
  });
};

// GET /api/v1/users/search/by-email/:email
const searchUsersByEmail = (
  url: string | Application,
  email: string,
  token: string
): Promise<{ users?: ProfileResponse[] }> => {
  return new Promise((resolve, reject) => {
    request(url)
      .get(`/api/v1/users/search/by-email/${email}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200, (err, response) => {
        if (err) return reject(err);
        const data = response.body;
        expect(Array.isArray(data.users)).toBe(true);
        resolve(data);
      });
  });
};

// DELETE /api/v1/users/:id
const deleteUser = (
  url: string | Application,
  userId: string,
  token: string
): Promise<MessageResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .delete(`/api/v1/users/${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200, (err, response) => {
        if (err) return reject(err);
        const result: MessageResponse = response.body;
        expect(result.message).toBeDefined();
        resolve(result);
      });
  });
};

// PUT /api/v1/users/block/:id
const toggleBlockUser = (
  url: string | Application,
  userId: string,
  token: string
): Promise<MessageResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .put(`/api/v1/users/block/${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200, (err, response) => {
        if (err) return reject(err);
        const result: MessageResponse = response.body;
        expect(result.message).toMatch(/User successfully (blocked|unblocked)/);
        resolve(result);
      });
  });
};

// GET /api/v1/users/blocked/users
const getBlockedUsers = (
  url: string | Application,
  token: string
): Promise<{ blockedUsers: Partial<ProfileResponse>[] }> => {
  return new Promise((resolve, reject) => {
    request(url)
      .get("/api/v1/users/blocked/users")
      .set("Authorization", `Bearer ${token}`)
      .expect(200, (err, response) => {
        if (err) return reject(err);
        const data = response.body;
        expect(Array.isArray(data.blockedUsers)).toBe(true);
        resolve(data);
      });
  });
};

export {
  getUserProfile,
  searchUsersByEmail,
  deleteUser,
  toggleBlockUser,
  getBlockedUsers,
};
