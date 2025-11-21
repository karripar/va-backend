import { Request, Response, NextFunction } from "express";
import { Document } from "va-hybrid-types/contentTypes";
import Profile from "../models/ProfileModel";
import { getUserFromRequest, validateSourceType } from "../../utils/authHelpers";

export const addDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const { name, url, sourceType, notes } = req.body;

    if (!name || !url || !sourceType) {
      return res.status(400).json({ error: "Name, URL, and sourceType are required" });
    }

    if (!validateSourceType(sourceType)) {
      return res.status(400).json({ error: "Invalid source type" });
    }

    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const newDoc = {
      id: Date.now().toString(),
      name,
      url,
      sourceType,
      addedAt: new Date().toISOString(),
      isAccessible: true,
      accessPermission: "public"
    } as unknown as Document;

    if (notes) {
      (newDoc as Record<string, unknown>).notes = notes;
    }

    profile.documents.push(newDoc);
    await profile.save();
    res.json(newDoc);
  } catch (error) {
    next(error);
  }
};

export const removeDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const { docId } = req.params;

    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const docIndex = profile.documents.findIndex((doc) => doc.id === docId);
    if (docIndex === -1) {
      return res.status(404).json({ error: "Document not found" });
    }

    profile.documents.splice(docIndex, 1);
    await profile.save();
    res.json({ message: "Document removed successfully" });
  } catch (error) {
    next(error);
  }
};
