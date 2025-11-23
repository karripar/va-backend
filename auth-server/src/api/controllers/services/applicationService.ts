import { Request, Response, NextFunction } from "express";
import Application from '../../models/ApplicationModel';
import ApplicationStage from '../../models/ApplicationStageModel';
import UserApplicationProgress from '../../models/UserApplicationProgressModel';
import { requiredDocuments } from "../../../utils/constants";
import { getUserFromRequest, validateSourceType } from "../../../utils/authHelpers";

export const getApplicationStages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);

    // Fetch stage definitions
    const stageDefinitions = await ApplicationStage.find().sort({ order: 1 });

    // Fetch user's progress for all stages
    const userProgress = await UserApplicationProgress.find({ userId });

    // Create a map for quick lookup of user progress
    const progressMap = new Map(
      userProgress.map(p => [p.stageId, p])
    );

    // Merge stage definitions with user progress
    const stages = stageDefinitions.map(stage => {
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
        status: progress?.status || 'not_started',
        completedAt: progress?.completedAt || null
      };
    });

    res.json({ stages });
  } catch (error) {
    next(error);
  }
};

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

export const createApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const { phase, data } = req.body;

    if (!phase || !data) {
      return res.status(400).json({ error: "Phase and data are required" });
    }

    let userApp = await Application.findOne({ userId });

    if (userApp) {
      const existingPhase = userApp.applications.find(app => app.phase === phase);
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

export const updateApplicationPhase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const { phase } = req.params;
    const data = req.body;

    const userApp = await Application.findOne({ userId });
    if (!userApp) {
      return res.status(404).json({ error: "Application not found" });
    }

    const phaseIndex = userApp.applications.findIndex(app => app.phase === phase);

    if (phaseIndex === -1) {
      userApp.applications.push({
        phase,
        data,
        documents: [],
        submittedAt: null,
        status: "draft",
      });
    } else {
      const existingPhase = userApp.applications[phaseIndex];
      existingPhase.data = { ...existingPhase.data, ...data };
    }

    userApp.currentPhase = phase;
    await userApp.save();
    res.json(userApp);
  } catch (error) {
    next(error);
  }
};

export const getApplicationDocuments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const { phase } = req.params;

    const userApp = await Application.findOne({ userId });
    if (!userApp) {
      return res.status(404).json({ error: "Application not found" });
    }

    const phaseApp = userApp.applications.find(app => app.phase === phase);
    if (!phaseApp) {
      return res.status(404).json({ error: "Phase not found" });
    }

    res.json(phaseApp.documents);
  } catch (error) {
    next(error);
  }
};

export const addApplicationDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const { phase, documentType, fileName, fileUrl, sourceType, notes } = req.body;

    if (!phase || !documentType || !fileUrl || !sourceType) {
      return res.status(400).json({ error: "Phase, document type, file URL, and source type are required" });
    }

    if (!validateSourceType(sourceType)) {
      return res.status(400).json({ error: "Invalid source type" });
    }

    const userApp = await Application.findOne({ userId });
    if (!userApp) {
      return res.status(404).json({ error: "Application not found" });
    }

    const phaseApp = userApp.applications.find(app => app.phase === phase);
    if (!phaseApp) {
      return res.status(404).json({ error: "Phase not found" });
    }

    const existingDoc = phaseApp.documents.find(doc => doc.documentType === documentType);
    if (existingDoc) {
      return res.status(400).json({ error: "Document type already uploaded for this phase" });
    }

    const newDocument: Record<string, unknown> = {
      id: Date.now().toString(),
      applicationId: `app-${userId}-${Date.now()}`,
      applicationPhase: phase,
      documentType,
      fileName: fileName || `document-${Date.now()}.ext`,
      fileUrl,
      sourceType,
      addedAt: new Date().toISOString(),
      addedBy: userId,
      isAccessible: true,
      accessPermission: "public",
      isRequired: false,
    };

    if (notes) {
      newDocument.notes = notes;
    }

    phaseApp.documents.push(newDocument);
    await userApp.save();
    res.status(201).json(newDocument);
  } catch (error) {
    next(error);
  }
};

export const removeApplicationDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const { documentId } = req.params;

    const userApp = await Application.findOne({ userId });
    if (!userApp) {
      return res.status(404).json({ error: "Application not found" });
    }

    let documentFound = false;

    for (const phaseApp of userApp.applications) {
      const docIndex = phaseApp.documents.findIndex(doc => doc.id === documentId);

      if (docIndex !== -1) {
        phaseApp.documents.splice(docIndex, 1);
        documentFound = true;
        break;
      }
    }

    if (!documentFound) {
      return res.status(404).json({ error: "Document not found" });
    }

    await userApp.save();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const submitApplicationPhase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const { phase } = req.params;

    const userApp = await Application.findOne({ userId });
    if (!userApp) {
      return res.status(404).json({ error: "Application not found" });
    }

    const phaseApp = userApp.applications.find(app => app.phase === phase);
    if (!phaseApp) {
      return res.status(404).json({ error: "Phase not found" });
    }

    const phaseRequiredDocs = requiredDocuments[phase as keyof typeof requiredDocuments] || [];
    const uploadedDocTypes = phaseApp.documents.map(doc => doc.documentType);
    const missingDocs = phaseRequiredDocs.filter(
      required => !uploadedDocTypes.includes(required.type)
    );

    if (missingDocs.length > 0) {
      return res.status(400).json({
        error: "Missing required documents",
        missingDocuments: missingDocs.map(doc => doc.name)
      });
    }

    phaseApp.submittedAt = new Date().toISOString();
    phaseApp.status = "submitted";

    await userApp.save();
    console.log(`Application phase ${phase} submitted for user ${userId}`);

    res.json(userApp);
  } catch (error) {
    next(error);
  }
};

export const approveApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { reviewNotes, phase } = req.body;
    const reviewerId = getUserFromRequest(req);

    if (!phase) {
      return res.status(400).json({ error: "Phase is required" });
    }

    const userApp = await Application.findOne({ userId: id });
    if (!userApp) {
      return res.status(404).json({ error: "Application not found" });
    }

    const phaseApp = userApp.applications.find(app => app.phase === phase);
    if (!phaseApp) {
      return res.status(404).json({ error: "Phase not found" });
    }

    phaseApp.status = "approved";
    phaseApp.reviewedBy = reviewerId;
    phaseApp.reviewNotes = reviewNotes;
    phaseApp.reviewedAt = new Date().toISOString();

    await userApp.save();
    console.log(`Application phase ${phase} approved for user ${id}`);

    res.json(userApp);
  } catch (error) {
    next(error);
  }
};

export const getRequiredDocuments = (req: Request, res: Response) => {
  try {
    const { phase } = req.params;
    const docs = requiredDocuments[phase as keyof typeof requiredDocuments];

    if (!docs) {
      return res.status(404).json({ error: "Phase not found" });
    }

    res.json(docs);
  } catch {
    res.status(500).json({ error: 'Failed to get required documents' });
  }
};

export const updateStageStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const { stageId } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['not_started', 'in_progress', 'pending_review', 'completed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status value',
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Check if stage exists
    const stage = await ApplicationStage.findOne({ id: stageId });
    if (!stage) {
      return res.status(404).json({
        error: 'Stage not found',
        message: `Application stage with ID '${stageId}' does not exist`
      });
    }

    // Update or create user progress
    const updateData: Record<string, unknown> = {
      status,
      completedAt: status === 'completed' ? new Date() : null
    };

    const progress = await UserApplicationProgress.findOneAndUpdate(
      { userId, stageId },
      { $set: updateData },
      { new: true, upsert: true }
    );

    // Build response with stage details and progress
    const response = {
      id: stage.id,
      phase: stage.phase,
      title: stage.title,
      description: stage.description,
      status: progress.status,
      requiredDocuments: stage.requiredDocuments,
      optionalDocuments: stage.optionalDocuments,
      deadline: stage.deadline,
      completedAt: progress.completedAt,
      updatedAt: progress.updatedAt
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};
