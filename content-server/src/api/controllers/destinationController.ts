import { Request, Response, NextFunction } from 'express';
import CustomError from '../../classes/CustomError';
import dotenv from 'dotenv';
import DestinationModel from '../models/destinationModel';
import { scrapeDestinations } from '../services/scraperService';

dotenv.config();

// Controller to handle destination requests and caching
const getDestinations = async (
  req: Request<{}, {}, { lang?: string; field?: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const lang = (req.query.lang as string) || 'en';
    const validFields = ['tech', 'health', 'business', 'culture'];
    const field =
      req.query.field && validFields.includes(req.query.field as string)
        ? (req.query.field as string)
        : 'tech';

    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const cached = await DestinationModel.findOne({ field, lang });

    if (cached && cached.lastUpdated > threeDaysAgo) {
      return res.status(200).json({ destinations: cached.sections });
    }

    const envKey = `${String(field).toUpperCase()}_PARTNERS_${String(
      lang
    ).toUpperCase()}`;
    const url = process.env[envKey as keyof NodeJS.ProcessEnv];
    if (!url) {
      return next(new CustomError('Invalid field or language parameter', 400));
    }

    const response = await fetch(url);
    const htmlDoc = await response.text();
    const sections = await scrapeDestinations(htmlDoc);

    await DestinationModel.findOneAndUpdate(
      { field, lang },
      { sections, lastUpdated: new Date() },
      { upsert: true, new: true }
    );

    res.status(200).json({ destinations: sections });
  } catch (error) {
    console.error('Error fetching or parsing data:', error);
    next(new CustomError('Failed to fetch destinations', 500));
  }
};

export { getDestinations };
