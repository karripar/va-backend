import request from "supertest";
import { Application } from "express";

type DestinationItem = {
  country: string;
  title: string;
  link: string;
};

type GetDestinationsResponse = {
  destinations: Record<string, DestinationItem[]>;
};

type DestinationUrlEntry = {
  _id: string;
  field: string;
  lang: string;
  url: string;
  lastModified?: string;
  updatedBy?: string;
};

/**
 * GET /api/v1/destinations/metropolia/destinations
 * Fetches destinations with optional language and field query parameters.
 */
const getDestinations = (
  url: string | Application,
  token: string,
  lang: string = "en",
  field: string = "tech"
): Promise<GetDestinationsResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .get("/api/v1/destinations/metropolia/destinations")
      .set("Authorization", `Bearer ${token}`)
      .query({ lang, field })
      .expect(200)
      .end((err, response) => {
        if (err) return reject(err);

        const data: GetDestinationsResponse = response.body;

        // Structure expectations
        expect(data).toHaveProperty("destinations");
        expect(typeof data.destinations).toBe("object");

        // Validate the first available section (if any)
        const sectionNames = Object.keys(data.destinations);
        if (sectionNames.length > 0) {
          const firstSection = data.destinations[sectionNames[0]];
          expect(Array.isArray(firstSection)).toBe(true);
          firstSection.forEach((entry) => {
            expect(entry.country).toBeDefined();
            expect(entry.title).toBeDefined();
            expect(entry.link).toBeDefined();
          });
        }

        resolve(data);
      });
  });
};

/**
 * GET /api/v1/destinations — Invalid field or language
 * Should return 400 with an error message.
 */
const getDestinationsInvalidParams = (
  url: string | Application,
  token: string,
  lang = "xx", // non-existent language
  field = "invalidField"
): Promise<request.Response> => {
  return new Promise((resolve, reject) => {
    request(url)
      .get("/api/v1/destinations/metropolia/destinations")
      .set("Authorization", `Bearer ${token}`)
      .query({ lang, field })
      .expect(400)
      .end((err, response) => {
        if (err) return reject(err);
        expect(response.body.message).toBe(
          "lang must be either 'en' or 'fi', field must be a string"
        );
        resolve(response);
      });
  });
};

/**
 * GET /api/v1/destinations/destination-urls
 * Fetches all destination URL entries.
 */
const getDestinationUrls = (
  url: string | Application,
  token: string
): Promise<DestinationUrlEntry[]> => {
  return new Promise((resolve, reject) => {
    request(url)
      .get("/api/v1/destinations/metropolia/destination-urls")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .end((err, response) => {
        if (err) return reject(err);
        const urls: DestinationUrlEntry[] = response.body.urls;
        expect(Array.isArray(urls)).toBe(true);
        urls.forEach((entry) => {
          expect(entry.field).toBeDefined();
          expect(entry.lang).toBeDefined();
          expect(entry.url).toBeDefined();
        });
        resolve(urls);
      });
  });
};

/**
 * PUT /api/v1/destinations/metropolia/destination-url
 * Updates or creates a destination URL entry.
 */
const updateDestinationUrl = (
  url: string | Application,
  token: string,
  field: string,
  lang: string,
  newUrl: string
): Promise<DestinationUrlEntry> => {
  return new Promise((resolve, reject) => {
    request(url)
      .put("/api/v1/destinations/metropolia/destination-url")
      .set("Authorization", `Bearer ${token}`)
      .send({ field, lang, url: newUrl })
      .expect(200)
      .end((err, response) => {
        if (err) return reject(err);
        const entry: DestinationUrlEntry = response.body.entry;
        expect(entry.field).toBe(field);
        expect(entry.lang).toBe(lang);
        expect(entry.url).toBe(newUrl);
        resolve(entry);
      });
  });
};

/**
 * DELETE /api/v1/destinations/destination-url/:id
 * Deletes a destination URL entry by ID.
 */
const deleteDestinationUrl = (
  url: string | Application,
  token: string,
  id: string
): Promise<request.Response> => {
  return new Promise((resolve, reject) => {
    request(url)
      .delete(`/api/v1/destinations/metropolia/destination-url/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .end((err, response) => {
        if (err) return reject(err);
        expect(response.body.message).toBe("Destination URL deleted successfully");
        resolve(response);
      });
  });
};

export {
  getDestinations,
  getDestinationsInvalidParams,
  getDestinationUrls,
  updateDestinationUrl,
  deleteDestinationUrl,
  GetDestinationsResponse,
  DestinationUrlEntry,
};
