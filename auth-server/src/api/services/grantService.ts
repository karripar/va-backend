import { Request, Response, NextFunction } from "express";
import { Grant, Kela, Budget } from "../models/GrantModels";
import { erasmusGrantTypes } from "../../utils/constants";
import { getUserFromRequest } from "../../utils/authHelpers";

export const getErasmusGrantTypes = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ grantTypes: erasmusGrantTypes });
  } catch (error) {
    next(error);
  }
};

export const applyForErasmusGrant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const { grantType, destination, program, estimatedAmount } = req.body;

    if (!grantType || !destination || !program) {
      return res.status(400).json({
        error: "Missing required fields",
        details: "grantType, destination, and program are required"
      });
    }

    const grantTypeInfo = erasmusGrantTypes.find(gt => gt.type === grantType);
    if (!grantTypeInfo) {
      return res.status(400).json({ error: "Invalid grant type" });
    }

    const newGrant = await Grant.create({
      userId,
      grantType,
      title: grantTypeInfo.title,
      description: grantTypeInfo.description,
      status: "in_progress",
      estimatedAmount: estimatedAmount || 0,
      documents: [],
      destination,
      program
    });

    res.status(201).json(newGrant);
  } catch (error) {
    next(error);
  }
};

export const updateErasmusGrant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const { grantId } = req.params;
    const updates = req.body;

    const grant = await Grant.findOneAndUpdate(
      { _id: grantId, userId },
      updates,
      { new: true }
    );

    if (!grant) {
      return res.status(404).json({ error: "Grant not found" });
    }

    res.json(grant);
  } catch (error) {
    next(error);
  }
};

export const getUserErasmusGrants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const grants = await Grant.find({ userId });
    res.json({ grants });
  } catch (error) {
    next(error);
  }
};

// ===== KELA SUPPORT =====

export const applyForKelaSupport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const { destination, monthlyAmount, duration, studyAbroadConfirmation } = req.body;

    if (!destination || !monthlyAmount || !duration || studyAbroadConfirmation === undefined) {
      return res.status(400).json({
        error: "Missing required fields",
        details: "destination, monthlyAmount, duration, and studyAbroadConfirmation are required"
      });
    }

    const totalAmount = monthlyAmount * duration;

    const kelaApplication = await Kela.create({
      userId,
      status: "in_progress",
      monthlyAmount,
      duration,
      totalAmount,
      studyAbroadConfirmation,
      applicationSubmitted: false,
      documents: [],
      destination
    });

    res.status(201).json(kelaApplication);
  } catch (error) {
    next(error);
  }
};

export const updateKelaSupport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const { kelaId } = req.params;
    const updates = req.body;

    const kela = await Kela.findOneAndUpdate(
      { _id: kelaId, userId },
      updates,
      { new: true }
    );

    if (!kela) {
      return res.status(404).json({ error: "Kela support application not found" });
    }

    res.json(kela);
  } catch (error) {
    next(error);
  }
};

export const getKelaSupport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const support = await Kela.findOne({ userId });
    res.json(support);
  } catch (error) {
    next(error);
  }
};

// ===== GRANT CALCULATOR =====

export const calculateTotalGrants = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { destination, program, baseAmount, travelDistance, greenTravel, inclusionSupport, currency } = req.body;

    if (!destination || !program || baseAmount === undefined || !currency) {
      return res.status(400).json({
        error: "Missing required fields",
        details: "destination, program, baseAmount, and currency are required"
      });
    }

    const breakdown: Record<string, number> = {
      baseGrant: baseAmount
    };

    // Calculate travel grant based on distance
    if (travelDistance) {
      if (travelDistance >= 2000) {
        breakdown.travelGrant = 275;
      } else if (travelDistance >= 1000) {
        breakdown.travelGrant = 180;
      } else if (travelDistance >= 500) {
        breakdown.travelGrant = 180;
      } else {
        breakdown.travelGrant = 23;
      }
    } else {
      breakdown.travelGrant = 0;
    }

    breakdown.greenTravelSupplement = greenTravel ? 50 : 0;
    breakdown.inclusionSupport = inclusionSupport ? 250 : 0;

    const totalEstimated = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

    res.json({
      destination,
      program,
      breakdown,
      totalEstimated,
      currency
    });
  } catch (error) {
    next(error);
  }
};

// ===== GRANT SEARCH =====

export const searchGrants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const { destination, program, minAmount, maxAmount } = req.query;

    const query: Record<string, unknown> = { userId };

    if (destination) {
      query.destination = destination;
    }
    if (program) {
      query.program = program;
    }

    const grants = await Grant.find(query);

    let results = grants as unknown as Array<Record<string, unknown>>;

    if (minAmount) {
      results = results.filter((grant: Record<string, unknown>) =>
        (grant.estimatedAmount as number || 0) >= Number(minAmount)
      );
    }

    if (maxAmount) {
      results = results.filter((grant: Record<string, unknown>) =>
        (grant.estimatedAmount as number || 0) <= Number(maxAmount)
      );
    }

    res.json({ results, total: results.length });
  } catch (error) {
    next(error);
  }
};

// ===== ALL GRANTS SUMMARY =====

export const getAllGrantsSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);

    const grants = await Grant.find({ userId });
    const kela = await Kela.findOne({ userId });
    const budgets = await Budget.find({ userId });

    let totalEstimatedSupport = 0;

    grants.forEach((grant) => {
      totalEstimatedSupport += grant.estimatedAmount || 0;
    });

    if (kela) {
      totalEstimatedSupport += kela.totalAmount || 0;
    }

    res.json({
      grants,
      erasmusGrants: grants,
      kelaSupport: kela,
      budgetEstimate: budgets.length > 0 ? budgets[0] : null,
      totalEstimatedSupport
    });
  } catch (error) {
    next(error);
  }
};
