import {Request, Response, NextFunction} from 'express';
import CustomError from '../../classes/CustomError';
import dotenv from 'dotenv';
import * as cheerio from 'cheerio';

dotenv.config();

/**
 * Controller: getDestinations
 *
 * Fetches and parses destination partner data from Metropolia’s public websites.
 *
 * The function reads the query parameters `lang` and `field` to determine which
 * environment variable contains the corresponding URL. It then fetches that HTML page,
 * parses it using Cheerio, and extracts structured information about international
 * exchange destinations (e.g., Erasmus, Nordplus, Bilateral Agreements, etc.).
 *
 * ---
 * **Environment Variables**
 * - Each combination of `field` and `lang` must be defined as an environment variable, e.g.:
 *   - `TECH_PARTNERS_EN`
 *   - `HEALTH_PARTNERS_FI`
 *   - `BUSINESS_PARTNERS_EN`
 *   - `CULTURE_PARTNERS_FI`
 *
 * ---
 * **Request Query Parameters**
 * @param {string} [lang='en'] - The language code (e.g. `'en'` or `'fi'`).
 * @param {string} [field='tech'] - The study field (`'tech'`, `'health'`, `'business'`, or `'culture'`).
 *
 * ---
 * **Responses**
 * - **200 OK**
 *   ```json
 *   {
 *     "destinations": {
 *       "Erasmus": [
 *         { "country": "SWEDEN", "title": "KTH Royal Institute of Technology", "link": "https://kth.se" },
 *         { "country": "GERMANY", "title": "Technische Universität Berlin", "link": "https://tu-berlin.de" }
 *       ],
 *       "Nordplus": [
 *         { "country": "DENMARK", "title": "Copenhagen School of Design and Technology", "link": "https://kea.dk" }
 *       ],
 *       "Bilateral Agreements": [
 *         { "country": "JAPAN", "title": "Tokyo Metropolitan University", "link": "https://tmu.ac.jp" }
 *       ],
 *       "Other exchange destinations": [
 *         { "country": "CANADA", "title": "University of Ottawa", "link": "https://uottawa.ca" }
 *       ]
 *     }
 *   }
 *   ```
 *
 * - **400 Bad Request**
 *   - Returned when query parameters are invalid or no matching environment variable is found.
 *
 * - **500 Internal Server Error**
 *   - Returned when fetching or parsing data fails (e.g., network error, missing content, or invalid HTML).
 *
 * ---
 * **Throws**
 * - `CustomError('Invalid field or language parameter', 400)` if query validation fails.
 * - `CustomError('Failed to fetch destinations', 500)` if a network or parsing error occurs.
 *
 * ---
 * **Example**
 * ```http
 * GET /api/v1/data/metropolia/destinations?lang=en&field=tech
 * Authorization: Bearer <token>
 * ```
 *
 * **Example Output**
 * ```json
 * {
 *   "destinations": {
 *     "Erasmus": [...],
 *     "Nordplus": [...],
 *     "Bilateral Agreements": [...],
 *     "Other exchange destinations": [...]
 *   }
 * }
 * ```
 *
 * ---
 * @function getDestinations
 * @async
 * @param {Request} req - Express request object with optional `lang` and `field` query parameters.
 * @param {Response} res - Express response object used to return parsed destination data.
 * @param {NextFunction} next - Express middleware function for error handling.
 * @returns {Promise<void>} JSON response containing categorized destination sections or an error.
 */

const getDestinations = async (
  req: Request<{}, {}, {lang?: string; field?: string}>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const lang = (req.query.lang as string) || 'en';

    const validFields = ['tech', 'health', 'business', 'culture'];
    const field =
      req.query.field && validFields.includes(req.query.field as string)
        ? (req.query.field as string)
        : 'tech';

    const envKey = `${String(field).toUpperCase()}_PARTNERS_${String(
      lang,
    ).toUpperCase()}`;
    const url = process.env[envKey as keyof NodeJS.ProcessEnv];

    if (!url) {
      return next(new CustomError('Invalid field or language parameter', 400));
    }

    const response = await fetch(url);
    const htmlDoc = await response.text();
    const $ = cheerio.load(htmlDoc);

    const sections: Record<
      string,
      {country: string; title: string; link: string}[]
    > = {};

    // Loop through only accordion sections
    $('div.paragraph--type--accordion').each((_, section) => {
      const h2 = $(section).find('h2').first();
      if (!h2.length) return;

      const sectionTitle = h2.text().trim();

      // Skip unrelated H2 sections
      const skipSections = [
        'Metropolia University of Applied Sciences',
        'Information on the site',
        'Other services',
        'Metropolia in social media',
        'Metropolia Ammattikorkeakoulu',
        'Tietoa sivustosta',
        'Palvelut muualla',
        'Metropolia somessa',
      ];
      if (skipSections.includes(sectionTitle)) return;

      sections[sectionTitle] = [];

      $(section)
        .find('.accordion-panel')
        .each((_, panel) => {
          const id = $(panel).attr('aria-labelledby');
          let country = id ? $(`#${id}`).text().trim() : 'Unknown';

          // Clean duplicated words (e.g. "SWEDEN SWEDEN")
          if (country) {
            const parts = country.split(/\s+/);
            country = [...new Set(parts)].join(' ');
          }

          // Handle <a> links
          $(panel)
            .find('a')
            .each((_, link) => {
              sections[sectionTitle].push({
                country,
                title: $(link).text().trim(),
                link: $(link).attr('href') ?? '',
              });
            });

          // Fallback: if no <a> tags, add plain text
          if ($(panel).find('a').length === 0) {
            const plainText = $(panel).text().trim();
            if (plainText) {
              sections[sectionTitle].push({
                country,
                title: plainText,
                link: '',
              });
            }
          }
        });
    });

    res.status(200).json({destinations: sections});
  } catch (error) {
    console.error('Error fetching or parsing data:', error);
    next(new CustomError('Failed to fetch destinations', 500));
  }
};

export { getDestinations };
