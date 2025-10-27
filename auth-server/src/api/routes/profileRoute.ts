import { Router } from "express";
import {
  getProfilePage,
  updateProfile,
  createProfile,
  addFavorite,
  getProfile,
  removeFavorite,
  addDocument,
  removeDocument,
  getApplications,
  createApplication,
  updateApplicationPhase,
  getApplicationDocuments,
  addApplicationDocument,
  removeApplicationDocument,
  submitApplicationPhase,
  approveApplication,
  getRequiredDocuments,
  uploadApplicationDocument,
} from "../controllers/profileController";

const router = Router();

router.get("/", getProfile);
router.post("/", createProfile);

// Specific routes MUST come before parameterized routes
router.get("/applications", getApplications);
router.post("/applications", createApplication);
router.put("/applications/:phase", updateApplicationPhase);
router.get("/applications/:phase/documents", getApplicationDocuments);
router.get("/applications/:phase/required-documents", getRequiredDocuments);
router.post("/applications/documents", addApplicationDocument);
router.delete("/applications/documents/:documentId", removeApplicationDocument);
router.post("/applications/:phase/submit", submitApplicationPhase);
router.post("/applications/:id/approve", approveApplication);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
router.post("/applications/upload", uploadApplicationDocument as any, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      fileUrl: `/uploads/documents/${req.file.filename}`,
      message: 'File uploaded successfully'
    });
  } catch {
  res.status(500).json({ error: 'Failed to uplaod the file' });
  }
});

router.post("/favorites", addFavorite);
router.delete("/favorites", removeFavorite);

router.post("/documents", addDocument);
router.delete("/documents/:docId", removeDocument);

// Parameterized routes come LAST
router.get("/:id", getProfilePage);
router.put("/:id", updateProfile);

export default router;
