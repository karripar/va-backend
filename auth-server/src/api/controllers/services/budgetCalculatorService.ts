import { Request, Response, NextFunction } from "express";
import { CalculatorHistory } from "../../models/BudgetCalculatorModel";

// Save calculator history
export const saveCalculatorHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, calculation, result, timestamp } = req.body;

    // Validation
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_USER_ID', message: 'User ID is required' }
      });
    }

    if (!calculation) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_BUDGET_DATA', message: 'Calculation is required' }
      });
    }

    if (calculation.length > 100) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_BUDGET_DATA', message: 'Calculation exceeds 100 characters' }
      });
    }

    if (result === undefined || result === null) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_BUDGET_DATA', message: 'Result is required' }
      });
    }

    if (typeof result !== 'number') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_BUDGET_DATA', message: 'Result must be a number' }
      });
    }

    const historyEntry = new CalculatorHistory({
      userId,
      calculation,
      result,
      timestamp: timestamp || new Date()
    });

    await historyEntry.save();

    res.json({
      success: true,
      historyId: historyEntry._id.toString()
    });
  } catch (error) {
    next(error);
  }
};

// Get calculator history
export const getCalculatorHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_USER_ID', message: 'User ID is required' }
      });
    }

    const history = await CalculatorHistory.find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .select('_id calculation result timestamp');

    const formattedHistory = history.map(entry => ({
      historyId: entry._id.toString(),
      calculation: entry.calculation,
      result: entry.result,
      timestamp: entry.timestamp
    }));

    res.json({
      success: true,
      data: formattedHistory
    });
  } catch (error) {
    next(error);
  }
};
