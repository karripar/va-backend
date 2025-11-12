import { Request, Response, NextFunction } from "express";
import { Budget } from "../../models/GrantModels";
import { budgetCategories } from "../../utils/constants";
import { getUserFromRequest } from "../../utils/authHelpers";

export const getBudgetCategories = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ categories: budgetCategories });
  } catch (error) {
    next(error);
  }
};

export const createOrUpdateBudgetEstimate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const { destination, grantAmount, categories, currency = 'EUR' } = req.body;

    if (!categories) {
      return res.status(400).json({ error: "Categories are required" });
    }

    // Calculate totalEstimate
    let totalEstimate = 0;
    for (const key in categories) {
      if (categories[key]?.estimatedCost) {
        totalEstimate += Number(categories[key].estimatedCost);
      }
    }

    // Calculate balance
    const balance = (grantAmount || 0) - totalEstimate;

    const budgetData = {
      userId,
      destination: destination || '',
      grantAmount: grantAmount || 0,
      categories,
      totalEstimate,
      balance,
      currency
    };

    const budget = await Budget.findOneAndUpdate(
      { userId },
      budgetData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json(budget);
  } catch (error) {
    next(error);
  }
};

export const getBudgetEstimate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);

    const budget = await Budget.findOne({ userId });

    if (!budget) {
      return res.json({
        grantAmount: 0,
        categories: {
          matkakulut: { estimatedCost: 0 },
          vakuutukset: { estimatedCost: 0 },
          asuminen: { estimatedCost: 0 },
          'ruoka ja arki': { estimatedCost: 0 },
          opintovalineet: { estimatedCost: 0 }
        },
        totalEstimate: 0,
        balance: 0,
        currency: 'EUR'
      });
    }

    res.json(budget);
  } catch (error) {
    next(error);
  }
};
