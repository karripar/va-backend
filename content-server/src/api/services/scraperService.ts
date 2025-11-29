import * as cheerio from 'cheerio';
import { getClosestCountry, getCoordinates } from './countryService';
import { extractSectionWithAI } from './AiDestinationService';

export type SectionData = Record<
  string,
  {
    country: string;
    title: string;
    link: string;
    studyField?: string;
    coordinates: { lat?: number; lng?: number };
  }[]
>;

function cleanField(field: string): string {
  if (!field) return '';
  let cleaned = field.trim();
  for (let i = 1; i <= Math.floor(cleaned.length / 2); i++) {
    const first = cleaned.slice(0, i);
    const second = cleaned.slice(i, i * 2);
    if (first === second) {
      cleaned = first;
      break;
    }
  }
  return cleaned;
}

export const scrapeDestinations = async (
  html: string,
  lang: 'en' | 'fi' = 'en',
): Promise<SectionData> => {
  const $ = cheerio.load(html);
  const sections: SectionData = {};

  for (const section of $('div.paragraph--type--accordion').toArray()) {
    const h2 = $(section).find('h2').first();
    if (!h2.length) continue;
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

    const panels = $(section).find('.field-item').toArray();

    for (const panel of panels) {
      const label = $(panel).find('.field-name-field-label').first().text().trim() || 'Unknown';
      const panelContent = $(panel).find('.field-name-field-content');

      // Check for multiple-country (health-style) panels
      if (panelContent.find('p > span').length > 0) {
        panelContent.find('p > span').each((_, span) => {
          const country = $(span).text().trim();
          const ul = $(span).parent().next('ul');
          if (!ul.length) return;

          ul.find('li').each((_, li) => {
            const a = $(li).find('a').first();
            if (!a.length) return;

            const title = a.text().trim();
            const link = a.attr('href') || '';
            const studyField = cleanField(label);

            const isoCode = getClosestCountry(country, lang);
            const coords = getCoordinates(isoCode);

            sections[sectionTitle].push({
              country,
              title,
              link,
              studyField,
              coordinates: { lat: coords?.lat, lng: coords?.lng },
            });
          });
        });
      } else {
        // Fallback: normal single-country panel → AI extraction
        const panelHtml = $(panel).html() ?? '';
        const fallbackCountry = label;
        const fallbackStudyField = label;

        const extracted = await extractSectionWithAI(sectionTitle, panelHtml, fallbackCountry, fallbackStudyField);

        extracted.forEach((item) => {
          const country = item.country?.trim() || fallbackCountry;
          const isoCode = getClosestCountry(country, lang);
          const coords = getCoordinates(isoCode);

          sections[sectionTitle].push({
            country,
            title: item.title,
            link: item.link,
            studyField: cleanField(item.studyField || fallbackStudyField),
            coordinates: { lat: coords?.lat, lng: coords?.lng },
          });
        });
      }
    }
  }

  return sections;
};
