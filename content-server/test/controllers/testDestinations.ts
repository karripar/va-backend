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

/**
 * GET /api/v1/data/metropolia/destinations
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
      .get("/api/v1/data/metropolia/destinations")
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
      .get("/api/v1/data/metropolia/destinations")
      .set("Authorization", `Bearer ${token}`)
      .query({ lang, field })
      .expect(400)
      .end((err, response) => {
        if (err) return reject(err);
        expect(response.body.message).toBe("lang must be either 'en' or 'fi', field must be a string");
        resolve(response);
      });
  });
};


export {
  getDestinations,
  getDestinationsInvalidParams,
  GetDestinationsResponse,
};
