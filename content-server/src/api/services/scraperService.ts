import * as cheerio from 'cheerio';
import { getClosestCountry, getCoordinates } from './countryService';

export type SectionData = Record<
  string,
  { country: string; title: string; link: string; coordinates: { lat?: number; lon?: number } }[]
>;

export const scrapeDestinations = async (html: string): Promise<SectionData> => {
  const $ = cheerio.load(html);
  const sections: SectionData = {};

  $('div.paragraph--type--accordion').each((_, section) => {
    const h2 = $(section).find('h2').first();
    if (!h2.length) return;

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
    if (skipSections.includes(sectionTitle)) return;

    sections[sectionTitle] = [];

    $(section).find('.accordion-panel').each((_, panel) => {
      const id = $(panel).attr('aria-labelledby');
      let country = id ? $(`#${id}`).text().trim() : 'Unknown';
      if (country) {
        const parts = country.split(/\s+/);
        country = [...new Set(parts)].join(' ');
      }

      const isoCode = getClosestCountry(country);
      const jsonCoords = getCoordinates(isoCode);

      const addEntry = (title: string, link: string) => {
        sections[sectionTitle].push({
          country,
          title,
          link,
          coordinates: { lat: jsonCoords?.lat, lon: jsonCoords?.lon },
        });
      };

      $(panel).find('a').each((_, link) => {
        addEntry($(link).text().trim(), $(link).attr('href') ?? '');
      });

      if ($(panel).find('a').length === 0) {
        const plainText = $(panel).text().trim();
        if (plainText) addEntry(plainText, '');
      }
    });
  });

  return sections;
};
