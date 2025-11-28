import { Request, Response, NextFunction } from "express";
import Application from "../../models/ApplicationModel";
import ApplicationStage from "../../models/ApplicationStageModel";
import UserApplicationProgress from "../../models/UserApplicationProgressModel";
import LinkDocument from "../../models/LinkDocumentModel";
import { requiredDocuments as rawRequiredDocs } from "../../../utils/constants";
import { getUserFromRequest, validateSourceType } from "../../../utils/authHelpers";
import {
  ApplicationPhase,
  ExtendedApplicationDocument,
  DocumentSourceType,
  ExtendedApplicationStatus,
} from "va-hybrid-types/contentTypes";

// -------------------------
// TYPES
// -------------------------

// Fix TS error: requiredDocuments[phase] string index
type RequiredDoc = { type: string; name: string };

type RequiredDocumentsMap = Record<ApplicationPhase, RequiredDoc[]>;

const requiredDocuments = rawRequiredDocs as RequiredDocumentsMap;

// -------------------------
// GET APPLICATION STAGES
// -------------------------

export const getApplicationStages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const stageDefinitions = await ApplicationStage.find().sort({ order: 1 });
    const userProgress = await UserApplicationProgress.find({ userId });

    const progressMap = new Map(userProgress.map((p) => [p.stageId, p]));

    const stages = stageDefinitions.map((stage) => {
      const progress = progressMap.get(stage.id);

      return {
        id: stage.id,
        phase: stage.phase,
        title: stage.title,
        description: stage.description,
        requiredDocuments: stage.requiredDocuments,
        optionalDocuments: stage.optionalDocuments,
        externalLinks: stage.externalLinks,
        deadline: stage.deadline,
        status: progress?.status ?? "not_started",
        completedAt: progress?.completedAt ?? null,
      };
    });

    res.json({ stages });
  } catch (error) {
    next(error);
  }
};

// -------------------------
// GET APPLICATIONS
// -------------------------

export const getApplications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const userApplications = await Application.findOne({ userId });

    if (!userApplications) {
      return res.json({ userId, applications: [], currentPhase: null });
    }

    res.json(userApplications);
  } catch (error) {
    next(error);
  }
};

// -------------------------
// CREATE APPLICATION
// -------------------------

export const createApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const { phase, data } = req.body as { phase: ApplicationPhase; data: unknown };

    if (!phase || !data) {
      return res.status(400).json({ error: "Phase and data are required" });
    }

    let userApp = await Application.findOne({ userId });

    if (userApp) {
      const existingPhase = userApp.applications.find((app) => app.phase === phase);
      if (existingPhase) {
        return res.status(400).json({ error: "Application phase already exists" });
      }

      userApp.applications.push({
        phase,
        data,
        documents: [],
        submittedAt: null,
        status: "draft",
      });

      await userApp.save();
    } else {
      userApp = await Application.create({
        userId,
        applications: [
          {
            phase,
            data,
            documents: [],
            submittedAt: null,
            status: "draft",
          },
        ],
        currentPhase: phase,
      });
    }

    res.status(201).json(userApp);
  } catch (error) {
    next(error);
  }
};

// -------------------------
// UPDATE APPLICATION PHASE
// -------------------------

export const updateApplicationPhase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const { phase } = req.params as { phase: ApplicationPhase };
    const data = req.body;

    const userApp = await Application.findOne({ userId });

    if (!userApp) return res.status(404).json({ error: "Application not found" });

    const index = userApp.applications.findIndex((app) => app.phase === phase);

    if (index === -1) {
      userApp.applications.push({
        phase,
        data,
        documents: [],
        submittedAt: null,
        status: "draft",
      });
    } else {
      const existing = userApp.applications[index];
      existing.data = { ...existing.data, ...data };
    }

    userApp.currentPhase = phase;
    await userApp.save();

    res.json(userApp);
  } catch (error) {
    next(error);
  }
};

// -------------------------
// GET DOCUMENTS FOR A PHASE
// -------------------------

export const getApplicationDocuments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const { phase } = req.params as { phase: ApplicationPhase };

    const userApp = await Application.findOne({ userId });
    if (!userApp) return res.status(404).json({ error: "Application not found" });

    const phaseApp = userApp.applications.find((app) => app.phase === phase);
    if (!phaseApp) return res.status(404).json({ error: "Phase not found" });

    res.json(phaseApp.documents);
  } catch (error) {
    next(error);
  }
};

// Adding the link
export const addApplicationDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let userId: string;

    try {
      userId = getUserFromRequest(req);
    } catch {
      const localUser = (res as unknown as { locals?: { user?: { _id: string } } }).locals?.user;
      if (localUser?._id) userId = localUser._id.toString();
      else return res.status(401).json({ error: "User not authenticated" });
    }

    const {
      phase,
      documentType,
      fileName,
      fileUrl,
      sourceType,
      notes,
    }: {
      phase: ApplicationPhase;
      documentType: string;
      fileName?: string;
      fileUrl: string;
      sourceType: DocumentSourceType;
      notes?: string;
    } = req.body;

    if (!phase || !documentType || !fileUrl || !sourceType)
      return res.status(400).json({ error: "Missing mandatory fields" });

    if (!validateSourceType(sourceType))
      return res.status(400).json({ error: "Invalid source type" });

    let userApp = await Application.findOne({ userId });
    if (!userApp) {
      userApp = await Application.create({
        userId,
        applications: [
          {
            phase,
            data: {},
            documents: [],
            submittedAt: null,
            status: "draft",
          },
        ],
        currentPhase: phase,
      });
    }

    let phaseApp = userApp.applications.find((a) => a.phase === phase);
    if (!phaseApp) {
      userApp.applications.push({
        phase,
        data: {},
        documents: [],
        submittedAt: null,
        status: "draft",
      });
      phaseApp = userApp.applications.find((a) => a.phase === phase);
    }

    if (!phaseApp) {
      return res.status(500).json({ error: "Phase creation failed" });
    }

    const now = Date.now();
    const docId = `doc-${now}-${Math.floor(Math.random() * 10000)}`;

    const newDocument: ExtendedApplicationDocument = {
      id: docId,
      applicationId: `app-${userId}-${now}`,
      applicationPhase: phase,
      documentType,
      fileName: fileName ?? `document-${now}.ext`,
      fileUrl,
      sourceType,
      addedAt: new Date().toISOString(),
      addedBy: userId,
      isAccessible: true,
      accessPermission: "public",
      isRequired: false,
      status: "uploaded",
    };

    phaseApp.documents.push(newDocument);

    try {
      await LinkDocument.create({
        id: newDocument.id,
        userId,
        name: newDocument.fileName,
        url: newDocument.fileUrl,
        sourceType,
        addedAt: newDocument.addedAt,
        isAccessible: true,
        accessPermission: "public",
        notes: notes ?? null,
        applicationId: newDocument.applicationId,
        applicationPhase: newDocument.applicationPhase,
        documentType: newDocument.documentType,
        addedBy: userId,
      });
    } catch (err) {
      console.warn("LinkDocument creation skipped:", err);
    }

    await userApp.save();
    res.status(201).json(newDocument);
  } catch (error) {
    next(error);
  }
};

// -------------------------
// REMOVE DOCUMENT
// -------------------------

export const removeApplicationDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const { documentId } = req.params as { documentId: string };

    const userApp = await Application.findOne({ userId });
    if (!userApp) return res.status(404).json({ error: "Application not found" });

    let removed = false;

    for (const phaseApp of userApp.applications) {
      const index = phaseApp.documents.findIndex((doc) => doc.id === documentId);
      if (index !== -1) {
        phaseApp.documents.splice(index, 1);
        removed = true;
        break;
      }
    }

    if (!removed) return res.status(404).json({ error: "Document not found" });

    await userApp.save();

    try {
      await LinkDocument.deleteOne({ id: documentId });
    } catch (err) {
      console.warn("Failed to delete global LinkDocument:", err);
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// -------------------------
// SUBMIT PHASE
// -------------------------

export const submitApplicationPhase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const { phase } = req.params as { phase: ApplicationPhase };

    const userApp = await Application.findOne({ userId });
    if (!userApp) return res.status(404).json({ error: "Application not found" });

    const phaseApp = userApp.applications.find((app) => app.phase === phase);
    if (!phaseApp) return res.status(404).json({ error: "Phase not found" });

    const required = requiredDocuments[phase] ?? [];
    const uploadedTypes = phaseApp.documents.map((d) => d.documentType);

    const missing = required.filter((reqDoc: RequiredDoc) => !uploadedTypes.includes(reqDoc.type));

    if (missing.length > 0) {
      return res.status(400).json({
        error: "Missing required documents",
        missingDocuments: missing.map((doc: RequiredDoc) => doc.name),
      });
    }

    phaseApp.submittedAt = new Date().toISOString();
    phaseApp.status = "submitted";

    await userApp.save();
    res.json(userApp);
  } catch (error) {
    next(error);
  }
};

// -------------------------
// APPROVE APPLICATION PHASE
// -------------------------

export const approveApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    const { reviewNotes, phase } = req.body as { reviewNotes?: string; phase: ApplicationPhase };
    const reviewerId = getUserFromRequest(req);

    if (!phase) return res.status(400).json({ error: "Phase is required" });

    const userApp = await Application.findOne({ userId: id });
    if (!userApp) return res.status(404).json({ error: "Application not found" });

    const phaseApp = userApp.applications.find((app) => app.phase === phase);
    if (!phaseApp) return res.status(404).json({ error: "Phase not found" });

    phaseApp.status = "approved";
    phaseApp.reviewedBy = reviewerId;
    phaseApp.reviewNotes = reviewNotes;
    phaseApp.reviewedAt = new Date().toISOString();

    await userApp.save();

    res.json(userApp);
  } catch (error) {
    next(error);
  }
};

// -------------------------
// GET REQUIRED DOCUMENTS
// -------------------------

export const getRequiredDocuments = (req: Request, res: Response) => {
  const { phase } = req.params as { phase: ApplicationPhase };

  const docs = requiredDocuments[phase];
  if (!docs) return res.status(404).json({ error: "Phase not found" });

  return res.json(docs);
};

// -------------------------
// UPDATE STAGE STATUS
// -------------------------

export const updateStageStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const { stageId } = req.params as { stageId: string };
    const { status } = req.body as { status: ExtendedApplicationStatus };

    const validStatuses: ExtendedApplicationStatus[] = [
      "not_started",
      "in_progress",
      "pending_review",
      "completed",
      "approved",
      "rejected",
      "draft",
      "submitted",
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid status",
        message: `Valid: ${validStatuses.join(", ")}`,
      });
    }

    const stage = await ApplicationStage.findOne({ id: stageId });
    if (!stage) return res.status(404).json({ error: "Stage not found" });

    const updateData = {
      status,
      completedAt: status === "completed" ? new Date() : null,
    };

    const progress = await UserApplicationProgress.findOneAndUpdate(
      { userId, stageId },
      { $set: updateData },
      { new: true, upsert: true }
    );

    res.json({
      id: stage.id,
      phase: stage.phase,
      title: stage.title,
      description: stage.description,
      status: progress.status,
      requiredDocuments: stage.requiredDocuments,
      optionalDocuments: stage.optionalDocuments,
      deadline: stage.deadline,
      completedAt: progress.completedAt,
      updatedAt: progress.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};

