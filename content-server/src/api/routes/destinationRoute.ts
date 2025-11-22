import express from 'express';
import {body, param, query} from 'express-validator';
const router = express.Router();
import {authenticate, validationErrors} from '../../middlewares';
import {getDestinations, updateDestinationUrl, getDestinationUrls, deleteDestinationUrl} from '../controllers/destinationController';

/**
 * @apiDefine DestinationGroup Destinations
 * APIs for fetching data from external sources. Such as scraping Metropolia's pages.
 */

/**
 * @apiDefine token Autenthication required in the form of Bearer token in Authorization header.
 * @apiHeader {String} Authorization Bearer token.
 */

/**
 * @apiDefine unauthorized Unauthorized
 * @apiError (401 Unauthorized) Unauthorized Missing or invalid authentication token.
 * @apiErrorExample {json} Unauthorized-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Unauthorized"
 *     }
 */

router.post(
  '/test',
  body('message').isString().withMessage('Message must be a string'),
  validationErrors,
  (req, res) => {
    const {message} = req.body;
    res.status(200).json({message: `Received: ${message}`});
  },
);

router.get(
  /**
   * @api {get} /destinations/metropolia/destinations Get Metropolia partner destinations
   * @apiName GetMetropoliaDestinations
   * @apiGroup DataGroup
   * @apiVersion 1.0.0
   *
   * @apiDescription Fetches and returns a list of Metropolia's partner destinations by scraping the relevant Metropolia webpage.
   * Supports both English and Finnish languages.
   * @apiPermission none
   *
   * @apiQuery {String} [lang=en] Language of the destinations list. Either "en" for English or "fi" for Finnish. Default is "en".
   * @apiQuery {String} [field] Optional field to filter destinations by specific study field. Defaults to technology if not provided. Current options are "tech", "health", "business" and "culture".
   *
   * @apiSuccess {Object[]} destinations List of partner destinations.
   * @apiSuccess {String} destinations.country Country of the partner institution.
   * @apiSuccess {String} destinations.title Name of the partner institution.
   * @apiSuccess {String} destinations.link URL link to the partner institution.
   * @apiSuccess {object} destinations.coordinates Coordinates of the partner institution (if available).
   * @apiSuccess {Number} destinations.coordinates.lat Latitude of the partner institution.
   * @apiSuccess {Number} destinations.coordinates.lng Longitude of the partner institution.
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "destinations": [
   *         {
   *           "country": "Country Name",
   *           "title": "Institution Name",
   *           "link": "http://institution-link.com",
   *           "coordinates": {
   *            "lat": 60.192059,
   *            "lng": 24.945831
   *            }
   *         },
   *         ...
   *       ]
   *     }
   *
   * @apiError (500 Internal Server Error) InternalServerError Failed to fetch or parse the destinations data.
   * @apiErrorExample {json} InternalServerError-Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "message": "Failed to fetch destinations"
   *     }
   *
   * @apiError (400 Bad Request) BadRequest Invalid query parameter.
   * @apiErrorExample {json} BadRequest-Response:
   *     HTTP/1.1 400 Bad Request
   *     {
   *       "message": "lang must be a string"
   *     }
   */

  '/metropolia/destinations',
  query('lang')
    .optional()
    .isString()
    .isIn(['en', 'fi'])
    .withMessage("lang must be either 'en' or 'fi'"),
  query('field')
    .optional()
    .isString()
    .isIn(['health', 'tech', 'business', 'culture'])
    .withMessage('field must be a string'),
  validationErrors,
  getDestinations,
);

router.put(
  /**
   * @api {put} /destinations/metropolia/destination-url Update Metropolia destination URL
   * @apiName UpdateMetropoliaDestinationURL
   * @apiGroup DataGroup
   * @apiVersion 1.0.0
   *
   * @apiDescription Updates the URL used to scrape Metropolia partner destinations for a specific field and language.
   * This endpoint is restricted to admin users only.
   *
   * @apiPermission token
   *
   * @apiBody {String} field Study field for which the URL is being set. Options are "tech", "health", "business", or "culture".
   * @apiBody {String} lang Language of the destinations list. Either "en" for English or "fi" for Finnish.
   * @apiBody {String} url The new URL to be used for scraping partner destinations.
   *
   * @apiSuccess {String} message Confirmation message.
   * @apiSuccess {Object} entry The updated destination URL entry.
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "message": "Destination URL updated successfully",
   *       "entry": {
   *         "field": "tech",
   *         "lang": "en",
   *         "url": "http://new-destination-url.com",
   *         "lastModified": "2024-01-01T00:00:00.000Z",
   *         "updatedBy": "adminUserId"
   *       }
   *     }
   *
   * @apiError (401 Unauthorized) Unauthorized Missing or invalid authentication token.
   * @apiError (403 Forbidden) Forbidden User is not an admin.
   * @apiError (400 Bad Request) BadRequest Missing or invalid fields in the request body.
   * @apiError (500 Internal Server Error) InternalServerError Failed to update the destination URL.
   * @apiErrorExample {json} InternalServerError-Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "message": "Failed to update destination URL"
   *     }
   */

  '/metropolia/destination-url',
  body('field')
    .isString()
    .isIn(['tech', 'health', 'business', 'culture'])
    .withMessage('field must be one of: tech, health, business, culture'),
  body('lang')
    .isString()
    .isIn(['en', 'fi'])
    .withMessage("lang must be either 'en' or 'fi'"),
  body('url').isURL().withMessage('url must be a valid URL'),
  validationErrors,
  authenticate,
  updateDestinationUrl,
);

router.get(
  /**
   * @api {get} /destinations/metropolia/destination-urls Get all Metropolia destination URLs
   * @apiName GetMetropoliaDestinationURLs
   * @apiGroup DataGroup
   * @apiVersion 1.0.0
   *
   * @apiDescription Retrieves all configured Metropolia destination URLs for different fields and languages.
   * This endpoint is restricted to admin users only.
   * @apiPermission token
   *
   * @apiSuccess {Object[]} urls List of destination URL entries.
   * @apiSuccess {String} urls.field Study field (e.g., "tech", "health").
   * @apiSuccess {String} urls.lang Language of the destinations list ("en" or "fi").
   * @apiSuccess {String} urls.url The configured URL for scraping.
   * @apiSuccess {Date} urls.lastModified Timestamp of the last modification.
   * @apiSuccess {String} urls.updatedBy ID of the admin user who last updated the entry.
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "urls": [
   *         {
   *           "field": "tech",
   *           "lang": "en",
   *           "url": "http://destination-url.com",
   *           "lastModified": "2024-01-01T00:00:00.000Z",
   *           "updatedBy": "adminUserId"
   *         },
   *         ...
   *       ]
   *     }
   * @apiError (401 Unauthorized) Unauthorized Missing or invalid authentication token.
   * @apiError (403 Forbidden) Forbidden User is not an admin.
   * @apiError (500 Internal Server Error) InternalServerError Failed to retrieve destination URLs.
   * @apiErrorExample {json} InternalServerError-Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "message": "Failed to retrieve destination URLs"
   *     }
   */
  '/metropolia/destination-urls',
  authenticate,
  getDestinationUrls,
);

router.delete(
  /**
 * @api {delete} /destinations/metropolia/destination-url/:id Delete Metropolia destination URL
 * @apiName DeleteMetropoliaDestinationURL
 * @apiGroup DataGroup
 * @apiVersion 1.0.0
 *
 * @apiDescription Deletes a specific Metropolia destination URL entry by its ID.
 * This endpoint is restricted to admin users only.
 *
 * @apiPermission token
 *
 * @apiParam {String} id Unique identifier of the destination URL entry to be deleted.
 *
 * @apiSuccess {String} message Confirmation message.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Destination URL deleted successfully"
 *     }
 *
 * @apiError (401 Unauthorized) Unauthorized Missing or invalid authentication token.
 * @apiError (403 Forbidden) Forbidden User is not an admin.
 * @apiError (400 Bad Request) BadRequest Invalid destination URL ID.
 * @apiError (404 Not Found) NotFound Destination URL entry not found.
 * @apiError (500 Internal Server Error) InternalServerError Failed to delete the destination URL.
 * @apiErrorExample {json} InternalServerError-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "message": "Failed to delete destination URL"
 *     }
 */
  '/metropolia/destination-url/:id',
  authenticate,
  param('id').isMongoId().withMessage('Invalid destination URL ID'),
  deleteDestinationUrl,
);

export default router;
