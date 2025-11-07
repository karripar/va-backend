import request from "supertest";
import { Application } from "express";
//import { MessageResponse } from "../../src/types/MessageTypes";

type AdminContactInput = {
  name: string;
  title: string;
  email: string;
};

type AdminContactResponse = {
  _id: string;
  name: string;
  title: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

type GetContactsResponse = {
  contacts: AdminContactResponse[];
};

type AddContactResponse = {
  message: string;
  contact: AdminContactResponse;
};

type UpdateContactResponse = {
  message: string;
  contact: AdminContactResponse;
};

type DeleteContactResponse = {
  success: boolean;
  message: string;
};

/**
 * GET /api/v1/contact/contacts
 * Retrieves all admin contact entries.
 */
const getContacts = (
  url: string | Application,
  token: string
): Promise<GetContactsResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .get("/api/v1/contact/contacts")
      .set("Authorization", `Bearer ${token}`)
      .expect(200, (err, response) => {
        if (err) return reject(err);
        const data: GetContactsResponse = response.body;
        expect(Array.isArray(data.contacts)).toBe(true);
        data.contacts.forEach((c) => {
          expect(c.name).toBeDefined();
          expect(c.email).toBeDefined();
          expect(c.title).toBeDefined();
        });
        resolve(data);
      });
  });
};

/**
 * POST /api/v1/contact/contacts
 * Adds a new admin contact (admin only).
 */
const addContact = (
  url: string | Application,
  data: AdminContactInput,
  token: string
): Promise<AddContactResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post("/api/v1/contact/contacts")
      .set("Authorization", `Bearer ${token}`)
      .send(data)
      .expect(201, (err, response) => {
        if (err) return reject(err);
        const result: AddContactResponse = response.body;
        expect(result.message).toBe("Admin contact added successfully");
        expect(result.contact).toBeDefined();
        expect(result.contact.name).toBe(data.name);
        expect(result.contact.email).toBe(data.email);
        expect(result.contact.title).toBe(data.title);
        resolve(result);
      });
  });
};


const addFaultyContact = (
  url: string | Application,
  data: Partial<AdminContactInput>,
  token: string
): Promise<request.Response> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post("/api/v1/contact/contacts")
      .set("Authorization", `Bearer ${token}`)
      .send(data)
      .expect(400, (err, response) => {
        if (err) return reject(err);
        resolve(response);
      });
  });
};

/**
 * PUT /api/v1/contact/contacts/:id
 * Updates an existing admin contact (admin only).
 */
const updateContact = (
  url: string | Application,
  id: string,
  token: string,
  data: Partial<AdminContactInput>
): Promise<UpdateContactResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .put(`/api/v1/contact/contacts/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(data)
      .expect(200, (err, response) => {
        if (err) return reject(err);
        const result: UpdateContactResponse = response.body;
        expect(result.message).toBe("Contact updated successfully");
        expect(result.contact).toBeDefined();
        Object.entries(data).forEach(([key, val]) =>
          expect(result.contact[key as keyof AdminContactResponse]).toBe(val)
        );
        resolve(result);
      });
  });
};

/**
 * DELETE /api/v1/contact/contacts/:id
 * Deletes an admin contact (admin only).
 */
const deleteContact = (
  url: string | Application,
  id: string,
  token: string
): Promise<DeleteContactResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .delete(`/api/v1/contact/contacts/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200, (err, response) => {
        if (err) return reject(err);
        const result: DeleteContactResponse = response.body;
        expect(result.success).toBe(true);
        expect(result.message).toBe("Contact deleted successfully");
        resolve(result);
      });
  });
};

export { getContacts, addContact, updateContact, deleteContact, addFaultyContact };
