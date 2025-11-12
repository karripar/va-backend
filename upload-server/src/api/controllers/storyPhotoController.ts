import { Request, Response, NextFunction } from "express";

export const uploadStoryPhoto = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { photoUrl, photoType } = req.body;

    if (!photoUrl) {
      return res.status(400).json({ error: 'Photo URL is required' });
    }

    // Validate photo type
    if (photoType && !['cover', 'gallery'].includes(photoType)) {
      return res.status(400).json({ error: 'Invalid photo type. Must be "cover" or "gallery"' });
    }

    // In a real implementation, this would:
    // 1. Validate the uploaded file
    // 2. Optimize/resize the image
    // 3. Upload to cloud storage (AWS S3, Cloudinary, etc.)
    // 4. Return the public URL

    // For now, we just validate and return the URL
    res.json({
      success: true,
      photoUrl,
      photoType: photoType || 'gallery',
      message: 'Photo uploaded successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const deleteStoryPhoto = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { photoUrl } = req.body;

    if (!photoUrl) {
      return res.status(400).json({ error: 'Photo URL is required' });
    }

    // In a real implementation, this would delete the photo from cloud storage

    res.json({
      success: true,
      message: 'Photo deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
