import {Request, Response, NextFunction} from 'express';
import CustomError from '../../classes/CustomError';
import dotenv from 'dotenv';
import * as cheerio from 'cheerio';

dotenv.config();

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

export {getDestinations};
