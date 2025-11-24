import request from "supertest";
import { Application } from "express";

export type InstructionLink = {
  _id: string;
  stepIndex: number;
  labelFi?: string;
  labelEn?: string;
  label?: string;
  href: string;
  isExternal: boolean;
  isFile: boolean;
};

export type InstructionVisibility = {
  _id: string;
  stepIndex: number;
  isVisible: boolean;
};

export type GetLinksResponse = InstructionLink[];

export type UpdateLinkResponse = {
  message: string;
  link: InstructionLink;
};

export type GetVisibilityResponse = InstructionVisibility[];

export type ToggleVisibilityResponse = {
  message: string;
  visibility: InstructionVisibility;
};

//
// ===== GET /instructions/links =====
//
const getInstructionLinks = (url: string | Application): Promise<GetLinksResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .get("/api/v1/instructions/links")
      .expect(200, (err, response) => {
        if (err) return reject(err);

        const links: GetLinksResponse = response.body;

        expect(Array.isArray(links)).toBe(true);

        links.forEach((l) => {
          expect(l._id).toBeDefined();
          expect(typeof l.stepIndex).toBe("number");
          expect(typeof l.href).toBe("string");
          expect(typeof l.isExternal).toBe("boolean");
          expect(typeof l.isFile).toBe("boolean");
        });

        resolve(links);
      });
  });
};

//
// ===== PUT /instructions/links/:linkId =====
//
const updateInstructionLink = (
  url: string | Application,
  linkId: string,
  token: string,
  data: Partial<{ href: string; isExternal: boolean; isFile: boolean }>
): Promise<UpdateLinkResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .put(`/api/v1/instructions/links/${linkId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(data)
      .expect(200, (err, response) => {
        if (err) return reject(err);

        const result = response.body as UpdateLinkResponse;

        expect(result.message).toBe("Link updated successfully");
        expect(result.link).toBeDefined();

        Object.entries(data).forEach(([key, val]) => {
          expect(result.link[key as keyof InstructionLink]).toBe(val);
        });

        resolve(result);
      });
  });
};

//
// ===== Faulty update (400 expected) =====
//
const updateFaultyInstructionLink = (
  url: string | Application,
  linkId: string,
  token: string,
  data: Partial<{ href: string; isExternal: boolean; isFile: boolean }>
): Promise<request.Response> => {
  return new Promise((resolve, reject) => {
    request(url)
      .put(`/api/v1/instructions/links/${linkId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(data)
      .expect(400, (err, response) => {
        if (err) return reject(err);
        resolve(response);
      });
  });
};

//
// ===== GET /instructions/visibility =====
//
const getInstructionVisibility = (
  url: string | Application
): Promise<GetVisibilityResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .get("/api/v1/instructions/visibility")
      .expect(200, (err, response) => {
        if (err) return reject(err);

        const visibility: GetVisibilityResponse = response.body;

        expect(Array.isArray(visibility)).toBe(true);

        visibility.forEach((v) => {
          expect(v._id).toBeDefined();
          expect(typeof v.stepIndex).toBe("number");
          expect(typeof v.isVisible).toBe("boolean");
        });

        resolve(visibility);
      });
  });
};

//
// ===== PUT /instructions/visibility/:stepIndex =====
//
const toggleInstructionVisibility = (
  url: string | Application,
  stepIndex: number,
  token: string
): Promise<ToggleVisibilityResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .put(`/api/v1/instructions/visibility/${stepIndex}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200, (err, response) => {
        if (err) console.log(err);
        if (err) return reject(err);

        const result = response.body as ToggleVisibilityResponse;

        expect(result.message).toContain(`Step ${stepIndex}`);
        expect(result.visibility).toBeDefined();
        expect(result.visibility.stepIndex).toBe(stepIndex);

        resolve(result);
      });
  });
};

//
// ===== Faulty toggle =====
//
const toggleFaultyInstructionVisibility = (
  url: string | Application,
  stepIndex: number,
  token: string
): Promise<request.Response> => {
  return new Promise((resolve, reject) => {
    request(url)
      .put(`/api/v1/instructions/visibility/${stepIndex}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(400, (err, response) => {
        if (err) return reject(err);
        resolve(response);
      });
  });
};

export {
  getInstructionLinks,
  updateInstructionLink,
  updateFaultyInstructionLink,
  getInstructionVisibility,
  toggleInstructionVisibility,
  toggleFaultyInstructionVisibility,
};
