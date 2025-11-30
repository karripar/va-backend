import {Request, Response, NextFunction} from 'express';
import {Document} from 'va-hybrid-types/contentTypes';
import User from '../../models/userModel';
import {getUserFromRequest, validateSourceType} from '../../../utils/authHelpers';

export const addDocument = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getUserFromRequest(req, res);
    const {name, url, sourceType, notes} = req.body;

    if (!name || !url || !sourceType) {
      return res
        .status(400)
        .json({error: 'Name, URL, and sourceType are required'});
    }

    if (!validateSourceType(sourceType)) {
      return res.status(400).json({error: 'Invalid source type'});
    }

    const user = await User.findOne({_id: userId});
    if (!user) {
      return res.status(404).json({error: 'User not found'});
    }

    const newDoc = {
      id: Date.now().toString(),
      name,
      url,
      sourceType,
      addedAt: new Date().toISOString(),
      isAccessible: true,
      accessPermission: 'public',
    } as unknown as Document;

    if (notes) {
      (newDoc as Record<string, unknown>).notes = notes;
    }

    user.documents.push(newDoc.id);
    await user.save();
    res.json(newDoc);
  } catch (error) {
    next(error);
  }
};

export const removeDocument = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getUserFromRequest(req, res);
    const {docId} = req.params;

    const user = await User.findOne({googleId: userId});
    if (!user) {
      return res.status(404).json({error: 'User not found'});
    }

    const docIndex = user.documents.findIndex(
      (docIdParam) => docIdParam === docId,
    );
    if (docIndex === -1) {
      return res.status(404).json({error: 'Document not found'});
    }

    user.documents.splice(docIndex, 1);
    await user.save();
    res.json({message: 'Document removed successfully'});
  } catch (error) {
    next(error);
  }
};
