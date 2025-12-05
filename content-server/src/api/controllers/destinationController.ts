import {Request, Response, NextFunction} from 'express';
import CustomError from '../../classes/CustomError';
import dotenv from 'dotenv';
import DestinationModel from '../models/destinationModel';
import {
  scrapeDestinations,
  scrapeTableDestinations,
  scrapeHealthDestinations,
} from '../services/scraperService';
import DestinationUrlModel from '../models/destinationUrlModel';

dotenv.config();

/**
 * @module controllers/destinationController
 * @description Controller functions for handling destinations and destination URLs,
 * including fetching, updating, and deleting URL entries, and retrieving destination data
 * with caching support.
 */

/**
 * @function getDestinationUrls
 * @description Retrieves all destination URLs from the database.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object returning an array of destination URLs.
 * @param {NextFunction} next - Express next middleware for error handling.
 *
 * @returns {Promise<void>} Responds with:
 * - 200: Array of destination URLs.
 * - 500: If fetching fails.
 *
 * @example
 * // GET /api/v1/destinations/metropolia/destinations/destination-urls
 * getDestinationUrls(req, res, next);
 */
const getDestinationUrls = async (
  req: Request<{}, {}, {}>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const urls = await DestinationUrlModel.find();
    res.status(200).json({urls});
  } catch (error) {
    console.error('Error fetching destination URLs:', error);
    next(new CustomError('Failed to fetch destination URLs', 500));
  }
};

/**
 * @function deleteDestinationUrl
 * @description Deletes a destination URL by ID. Only accessible to admin users.
 *
 * @param {Request<{ id: string }>} req - Express request object containing URL ID in params.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware for error handling.
 *
 * @returns {Promise<void>} Responds with:
 * - 200: When the URL is successfully deleted.
 * - 403: If the user is not an admin.
 * - 404: If the URL does not exist.
 * - 500: On server errors.
 *
 * @example
 * // DELETE /api/v1/destinations/metropolia/destinations/destination-url/:id
 * deleteDestinationUrl(req, res, next);
 */
const deleteDestinationUrl = async (
  req: Request<{id: string}, {}, {}>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {id} = req.params;
    const adminUser = res.locals.user;
    if (!adminUser || ![2, 3].includes(adminUser.user_level_id)) {
      return next(new CustomError('Unauthorized, admin access required', 403));
    }

    const deletedEntry = await DestinationUrlModel.findByIdAndDelete(id);
    if (!deletedEntry) {
      return next(new CustomError('Destination URL not found', 404));
    }

    res.status(200).json({message: 'Destination URL deleted successfully'});
  } catch (error) {
    console.error('Error deleting destination URL:', error);
    next(new CustomError('Failed to delete destination URL', 500));
  }
};

/**
 * @function updateDestinationUrl
 * @description Updates or creates a destination URL entry for a specific field and language.
 * Only accessible to admin users.
 *
 * @param {Request<{}, {}, { field: string; lang: string; url: string }>} req - Express request object containing `field`, `lang`, and `url` in body.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware for error handling.
 *
 * @returns {Promise<void>} Responds with:
 * - 200: When the URL is successfully updated or created.
 * - 403: If the user is not an admin.
 * - 500: On server errors.
 *
 * @example
 * // PUT /api/v1/destinations/metropolia/destinations/destination-url
 * // Body: { field: "tech", lang: "en", url: "https://example.com/tech" }
 * updateDestinationUrl(req, res, next);
 */
const updateDestinationUrl = async (
  req: Request<{}, {}, {field: string; lang: string; url: string}>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {field, lang, url} = req.body;
    const adminUser = res.locals.user;
    if (!adminUser || ![2, 3].includes(adminUser.user_level_id)) {
      return next(new CustomError('Unauthorized, admin access required', 403));
    }

    const updatedEntry = await DestinationUrlModel.findOneAndUpdate(
      {field, lang},
      {url, lastModified: new Date(), updatedBy: adminUser._id},
      {upsert: true, new: true},
    );

    res.status(200).json({
      message: 'Destination URL updated successfully',
      entry: updatedEntry,
    });
  } catch (error) {
    console.error('Error updating destination URL:', error);
    next(new CustomError('Failed to update destination URL', 500));
  }
};

interface Destination {
  country: string;
  title: string;
  link: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}


/**
 * @function getDestinations
 * @description Retrieves destination data for a given field and language.
 * Uses caching: if cached data is less than 3 days old, it will be returned instead of scraping.
 * Otherwise, it fetches the destination URL, scrapes the HTML content, stores it in the database, and returns it.
 *
 * @param {Request<{}, {}, { lang?: string; field?: string }>} req - Express request object with optional `lang` and `field` query parameters.
 * @param {Response} res - Express response object returning destination sections.
 * @param {NextFunction} next - Express next middleware for error handling.
 *
 * @returns {Promise<void>} Responds with:
 * - 200: Array of destination sections.
 * - 404: If no URL configured for requested field/language.
 * - 500: On scraping or server errors.
 *
 * @example
 * // GET /api/v1/destinations/metropolia/destinations?field=tech&lang=en
 * getDestinations(req, res, next);
 */
const isValidDestination = (dest: Destination) =>
  dest &&
  typeof dest.country === 'string' &&
  typeof dest.title === 'string' &&
  typeof dest.link === 'string' &&
  dest.coordinates &&
  typeof dest.coordinates.lat === 'number' &&
  typeof dest.coordinates.lng === 'number';

  const getDestinations = async (
  req: Request<{}, {}, {lang?: string; field?: string}>,
  res: Response,
  next: NextFunction,
  ) => {
  try {
  const lang = 'en';
  const validFields = ['tech', 'health', 'business', 'culture'];
  const field =
  req.query.field && validFields.includes(req.query.field as string)
  ? (req.query.field as string)
  : 'tech';

  // 30 day cache to reduce scraping load
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const cached = await DestinationModel.findOne({field, lang});

  if (cached && cached.lastUpdated && cached.lastUpdated > thirtyDaysAgo) {
    console.log('Using cached data');
    return res.status(200).json({destinations: cached.sections || {}});
  }

  const destinationUrlEntry = await DestinationUrlModel.findOne({
    field,
    lang,
  });
  if (!destinationUrlEntry) {
    return next(
      new CustomError(
        'No URL configured for the requested field and language',
        404,
      ),
    );
  }

  const url = destinationUrlEntry.url;
  const response = await fetch(url);
  const htmlDoc = await response.text();

  let sections: Record<string, Destination[]> = {};

  if (field === 'business') {
    sections = (await scrapeTableDestinations(htmlDoc, lang as 'en' | 'fi')) as Record<string, Destination[]>;
    for (const section in sections) {
      sections[section] = sections[section].map(dest => ({
        ...dest,
        coordinates: {
          lat: dest.coordinates.lat ?? 0,
          lng: dest.coordinates.lng ?? 0,
        },
      }));
    }
  } else if (field === 'health') {
    sections = (await scrapeHealthDestinations(htmlDoc, lang as 'en' | 'fi')) as Record<string, Destination[]>;
    for (const section in sections) {
      sections[section] = sections[section].map(dest => ({
        ...dest,
        coordinates: {
          lat: dest.coordinates.lat ?? 0,
          lng: dest.coordinates.lng ?? 0,
        },
      }));
    }
  } else {
    sections = (await scrapeDestinations(htmlDoc, lang as 'en' | 'fi')) as Record<string, Destination[]>;
    for (const section in sections) {
      sections[section] = sections[section].map(dest => ({
        ...dest,
        coordinates: {
          lat: dest.coordinates.lat ?? 0,
          lng: dest.coordinates.lng ?? 0,
        },
      }));
    }
  }

  // Validate sections
  const sectionsValidated: Record<string, Destination[]> = {};
  for (const [sectionTitle, dests] of Object.entries(sections)) {
    sectionsValidated[sectionTitle] = dests.filter(isValidDestination);
  }

  await DestinationModel.findOneAndUpdate(
    {field, lang},
    {sections: sectionsValidated, lastUpdated: new Date()},
    {upsert: true, new: true},
  );

  res.status(200).json({destinations: sectionsValidated});

  } catch (error) {
  console.error('Error fetching or parsing data:', error);
  next(new CustomError('Failed to fetch destinations', 500));
  }
  };

export {
  getDestinations,
  updateDestinationUrl,
  getDestinationUrls,
  deleteDestinationUrl,
};
