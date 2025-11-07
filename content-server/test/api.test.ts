/* eslint-disable @typescript-eslint/no-unused-vars */
import mongoose from "mongoose";
import app from "../src/app";
import dotenv from "dotenv";
import randomstring from "randomstring";
import {
  getContacts,
  addContact,
  updateContact,
  deleteContact,
} from "./controllers/testContact";
import jwt from "jsonwebtoken";
import request from "supertest";
import userModel from "../src/api/models/userModel"; // adjust if path differs
import { UserInfo } from "../src/types/LocalTypes";

dotenv.config();

if (!process.env.AUTH_SERVER || !process.env.CONTENT_SERVER || !process.env.UPLOAD_SERVER) {
  throw new Error("Missing AUTH_SERVER, CONTENT_SERVER, or UPLOAD_SERVER in environment variables");
}

// USE api2.test.ts TO CREATE MORE TESTS, makes this file less cluttered because there are more coming

describe("Admin Contact Information API Tests", () => {
  let testUser: UserInfo;
  let testToken: string;
  let contactId: string;

  beforeAll(async () => {
    const mongoURI = process.env.DB_URL;
    if (!mongoURI) throw new Error("Missing DB_URL in environment variables");
    await mongoose.connect(mongoURI);

    // Create mock admin user
    testUser = await userModel.create({
      name: "Test Admin",
      userName:  "TestAdmin",
      email: `admin_${randomstring.generate(5)}@example.com`,
      user_level_id: 2, // Admin level
      googleId: randomstring.generate(12),
    });

    // Sign token for admin
    testToken = jwt.sign(
      {
        id: testUser.id,
        level_name: "Admin",
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "3h" }
    );
  });

  // Generate random test data
  const testContactData = {
    name: "Contact_" + randomstring.generate(5),
    title: "Coordinator",
    email: "contact_" + randomstring.generate(5) + "@example.com",
  };

  it("should allow admin to add a new contact entry", async () => {
    const result = await addContact(app, testContactData, testToken);
    expect(result.message).toBe("Admin contact added successfully");
    expect(result.contact).toBeDefined();
    contactId = result.contact._id;
  });

  it("should retrieve all admin contacts and include the new one", async () => {
    const result = await getContacts(app, testToken);
    expect(Array.isArray(result.contacts)).toBe(true);
    const found = result.contacts.find(
      (c) => c.email === testContactData.email
    );
    expect(found).toBeDefined();
    expect(found?.name).toBe(testContactData.name);
  });

  it("should allow admin to update a contact entry", async () => {
    const updates = { title: "Updated Coordinator" };
    const result = await updateContact(app, contactId, testToken, updates);
    expect(result.message).toBe("Contact updated successfully");
    expect(result.contact.title).toBe(updates.title);
  });

  it("should allow admin to delete a contact entry", async () => {
    const result = await deleteContact(app, contactId, testToken);
    expect(result.message).toBe("Contact deleted successfully");
    expect(result.success).toBe(true);
  });

  afterAll(async () => {
    if (testUser) {
      await userModel.findByIdAndDelete(testUser.id);
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });
});
