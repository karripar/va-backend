import express from 'express';
import {body, query} from 'express-validator';
const router = express.Router();
import {validationErrors} from '../../middlewares';
import {getDestinations} from '../controllers/destinationController';

/**
 * @apiDefine DataGroup Data
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
   * @api {get} /data/metropolia/destinations Get Metropolia partner destinations
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
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "destinations": [
   *         {
   *           "country": "Country Name",
   *           "title": "Institution Name",
   *           "link": "http://institution-link.com"
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

export default router;
