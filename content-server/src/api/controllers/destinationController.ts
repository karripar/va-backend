import { Request, Response, NextFunction } from 'express';
import CustomError from '../../classes/CustomError';
import dotenv from 'dotenv';
import DestinationModel from '../models/destinationModel';
import { scrapeDestinations } from '../services/scraperService';
import DestinationUrlModel from '../models/destinationUrlModel';

dotenv.config();

const getDestinationUrls = async (
  req: Request<{}, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const urls = await DestinationUrlModel.find();
    res.status(200).json({ urls });
  } catch (error) {
    console.error('Error fetching destination URLs:', error);
    next(new CustomError('Failed to fetch destination URLs', 500));
  }
};

const deleteDestinationUrl = async (
  req: Request<{ id: string }, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const adminUser = res.locals.user;
    if (!adminUser || adminUser.user_level_id !== 2) {
      return next(new CustomError('Unauthorized, admin access required', 403));
    }

    const deletedEntry = await DestinationUrlModel.findByIdAndDelete(id);
    if (!deletedEntry) {
      return next(new CustomError('Destination URL not found', 404));
    }

    res.status(200).json({ message: 'Destination URL deleted successfully' });
  } catch (error) {
    console.error('Error deleting destination URL:', error);
    next(new CustomError('Failed to delete destination URL', 500));
  }
};

const updateDestinationUrl = async (
  req: Request<{}, {}, { field: string; lang: string; url: string;}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { field, lang, url } = req.body;

    const adminUser = res.locals.user;
    if (!adminUser || adminUser.user_level_id !== 2) {
      return next(new CustomError('Unauthorized, admin access required', 403));
    }

    const updatedEntry = await DestinationUrlModel.findOneAndUpdate(
      { field, lang },
      { url, lastModified: new Date(), updatedBy: adminUser._id },
      { upsert: true, new: true }
    );


    res.status(200).json({ message: 'Destination URL updated successfully', entry: updatedEntry });
  } catch (error) {
    console.error('Error updating destination URL:', error);
    next(new CustomError('Failed to update destination URL', 500));
  }
}


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
      console.log('Using cached data');
      return res.status(200).json({ destinations: cached.sections });
    }

    const destinationUrlEntry = await DestinationUrlModel.findOne({ field, lang });
    if (!destinationUrlEntry) {
      return next(new CustomError('No URL configured for the requested field and language', 404));
    }

    const url = destinationUrlEntry.url;

    const response = await fetch(url);
    const htmlDoc = await response.text();
    const sections = await scrapeDestinations(htmlDoc, lang as "en" | "fi");

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

export { getDestinations, updateDestinationUrl, getDestinationUrls, deleteDestinationUrl };
