import {Request, Response, NextFunction} from 'express';

import CustomError from '../../classes/CustomError';
import dotenv from 'dotenv';
import * as cheerio from 'cheerio';
dotenv.config();

const getDestinations = async (
  req: Request<{}, {}, { lang?: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const lang = req.query.lang || 'en';
    const url =
      lang === 'en'
        ? 'https://www.metropolia.fi/en/international-relations/partner-institutions/technology'
        : 'https://www.metropolia.fi/fi/metropoliasta/organisaatio-ja-strategia/kansainvalisyys/yhteistyokorkeakoulut/tekniikka';

    const response = await fetch(url);
    const htmlDoc = await response.text();
    const $ = cheerio.load(htmlDoc);

    const sections: Record<string, { country: string; name: string; link: string }[]> = {};

    // Loop through only accordion sections
    $('div.paragraph--type--accordion').each((_, section) => {
      const h2 = $(section).find('h2').first();
      if (!h2.length) return;

      const sectionTitle = h2.text().trim();

      // Skip unrelated H2s
      const skipSections = [
        'Metropolia University of Applied Sciences',
        'Information on the site',
        'Other services',
        'Metropolia in social media',
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

          $(panel)
            .find('a')
            .each((_, link) => {
              sections[sectionTitle].push({
                country,
                name: $(link).text().trim(),
                link: $(link).attr('href') || '',
              });
            });
        });
    });

    res.status(200).json({ destinations: sections });
  } catch (error) {
    console.error('Error fetching or parsing data:', error);
    next(new CustomError('Failed to fetch destinations', 500));
  }
};

export {getDestinations};
