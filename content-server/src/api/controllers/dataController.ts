import {Request, Response, NextFunction} from 'express';

import CustomError from '../../classes/CustomError';
import dotenv from 'dotenv';
import * as cheerio from 'cheerio';
dotenv.config();

const getDestinations = async (
  req: Request<{}, {}, {lang?: string}>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const lang = req.query.lang || 'en';
    const url =
      lang === 'en'
        ? `https://www.metropolia.fi/en/international-relations/partner-institutions/technology`
        : 'https://www.metropolia.fi/fi/metropoliasta/organisaatio-ja-strategia/kansainvalisyys/yhteistyokorkeakoulut/tekniikka';

    const response = await fetch(url);
    const htmlDoc = await response.text();

    const $ = cheerio.load(htmlDoc);

    const destinations: {country: string; name: string; link: string}[] = [];

    $('.accordion-panel').each((_, panel) => {
      // aria-labelledby points to the header element's ID
      const id = $(panel).attr('aria-labelledby');
      let country = id ? $(`#${id}`).text().trim() : 'Unknown';

      // Clean up duplicated words (e.g. "SWEDEN SWEDEN")
      if (country) {
        const parts = country.split(/\s+/); // split by whitespace
        const unique = [...new Set(parts)]; // keep only unique parts (eg. "New Zealand") 
        country = unique.join(' ');
      }

      // grab all links inside lists
      $(panel)
        .find('a')
        .each((_, link) => {
          destinations.push({
            country,
            name: $(link).text().trim(),
            link: $(link).attr('href') || '',
          });
        });
    });

    res.status(200).json({destinations});
  } catch (error) {
    console.error('Error fetching or parsing data:', error);
    next(new CustomError('Failed to fetch destinations', 500));
  }
};

export {getDestinations};
