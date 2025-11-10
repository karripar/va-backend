import mongoose from "mongoose";
import app from "../src/app";
import dotenv from "dotenv";
import randomstring from "randomstring";
import {
  getContacts,
  addContact,
  updateContact,
  deleteContact,
  addFaultyContact,
} from "./controllers/testContact";
import {
  //getDestinations,
  getDestinationsInvalidParams,
  getDestinationUrls,
  updateDestinationUrl,
  deleteDestinationUrl,
  DestinationUrlEntry
} from "./controllers/testDestinations";
import jwt from "jsonwebtoken";
import userModel from "../src/api/models/userModel"; // adjust if path differs
import { UserInfo } from "../src/types/LocalTypes";

dotenv.config();

if (
  !process.env.AUTH_SERVER ||
  !process.env.CONTENT_SERVER ||
  !process.env.UPLOAD_SERVER
) {
  throw new Error(
    "Missing AUTH_SERVER, CONTENT_SERVER, or UPLOAD_SERVER in environment variables"
  );
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
      userName: "TestAdmin",
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
    expect(result.contact).toBeDefined();
    contactId = result.contact._id;
  });

  it("should reject adding a contact with missing fields", async () => {
    const faultyData = {
      name: "Incomplete Contact",
      // Missing email and title
    };
    await addFaultyContact(app, faultyData, testToken);
  });

  it("should retrieve all admin contacts and include the new one", async () => {
    await getContacts(app, testToken);
  });

  it("should allow admin to update a contact entry", async () => {
    const updates = { title: "Updated Coordinator" };
    await updateContact(app, contactId, testToken, updates);
  });

  it("should allow admin to delete a contact entry", async () => {
    await deleteContact(app, contactId, testToken);
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

/* -----------------------------------------------------------
   Destination Scraper / Partner Data API Tests
------------------------------------------------------------ */

describe("Destination Scraper Controller Tests", () => {
  let testUser: UserInfo;
  let testToken: string;
  let testDestinationUrlId: string;

  beforeAll(async () => {
    const mongoURI = process.env.DB_URL;
    if (!mongoURI) throw new Error("Missing DB_URL in environment variables");
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoURI);
    }

    // Create mock admin user (reuse schema)
    testUser = await userModel.create({
      name: "Test Destination Admin",
      userName: "DestinationAdmin",
      email: `destadmin_${randomstring.generate(5)}@example.com`,
      user_level_id: 2,
      googleId: randomstring.generate(12),
    });

    // Sign token
    testToken = jwt.sign(
      {
        id: testUser.id,
        level_name: "Admin",
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "3h" }
    );
  });

  /*it("should fetch destinations with valid parameters", async () => {
    await getDestinations(app, testToken, "en", "tech");
  });*/

  it("should return 400 for invalid field or language", async () => {
    await getDestinationsInvalidParams(app, testToken, "xx", "invalidField");
  });

  it("should fetch all destination URLs", async () => {
    const urls: DestinationUrlEntry[] = await getDestinationUrls(app, testToken);
    expect(urls.length).toBeGreaterThanOrEqual(0);

    // Save one ID for update/delete tests
    if (urls.length > 0) {
      testDestinationUrlId = urls[0]._id;
    }
  });

  it("should create/update a destination URL entry", async () => {
    const field = "tech";
    const lang = "en";
    const url = `https://example.com/${randomstring.generate(5)}`;
    const updatedEntry = await updateDestinationUrl(app, testToken, field, lang, url);

    expect(updatedEntry).toBeDefined();
    expect(updatedEntry.url).toBe(url);

    // Save the new entry ID for deletion test
    testDestinationUrlId = updatedEntry._id;
  });

  it("should delete a destination URL entry", async () => {
    if (!testDestinationUrlId) return;

    await deleteDestinationUrl(app, testToken, testDestinationUrlId);
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
