import * as cheerio from 'cheerio';
import {getClosestCountry, getCoordinates} from './countryService';
import {extractSectionWithAI} from './AiDestinationService';

export type SectionData = Record<
  string,
  {
    country: string;
    title: string;
    link: string;
    coordinates: {lat?: number; lng?: number};
  }[]
>;

export const scrapeDestinations = async (
  html: string,
  lang: 'en' | 'fi' = 'en',
): Promise<SectionData> => {
  const $ = cheerio.load(html);
  const sections: SectionData = {};

  for (const section of $('div.paragraph--type--accordion').toArray()) {
    const h2 = $(section).find('h2').first();
    if (!h2.length) return {};

    const sectionTitle = h2.text().trim();

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

    if (skipSections.includes(sectionTitle)) continue;

    sections[sectionTitle] = [];

    const panels = $(section).find('.accordion-panel').toArray();

    for (const panel of panels) {
      const panelHtml = $(panel).html() ?? '';

      // --- Extract panel country ---
      const id = $(panel).attr('aria-labelledby');
      let country = id ? $(`#${id}`).text().trim() : 'Unknown';
      if (country) {
        const parts = country.split(/\s+/);
        country = [...new Set(parts)].join(' ');
      }

      // ----------------------------
      //       ⬇⬇ HERE ⬇⬇
      // ----------------------------
      const extracted = await extractSectionWithAI(
        sectionTitle,
        panelHtml,
        country,
      );

      extracted.forEach((item) => {
        const isoCode = getClosestCountry(item.country, lang);
        const jsonCoords = getCoordinates(isoCode);

        sections[sectionTitle].push({
          country: item.country,
          title: item.title,
          link: item.link,
          coordinates: {
            lat: jsonCoords?.lat,
            lng: jsonCoords?.lng,
          },
        });
      });
    }
  }

  return sections;
};
