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

  // Detect exact repeated halves (like "Oral HygieneOral Hygiene")
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

    const panels = $(section).find('.accordion-panel').toArray();

    // --- Batch all panel HTMLs ---
    const panelData = panels.map((panel) => {
      const panelHtml = $(panel).html() ?? '';

      // --- Get study field ---
      const labelId = $(panel).attr('aria-labelledby');
      let studyField = 'Unknown';
      if (labelId) {
        const labelElem = $(`#${labelId}`);
        if (labelElem.length) {
          const fieldDiv = labelElem
            .find('.field-name-field-label')
            .addBack('.field-name-field-label')
            .first();
          if (fieldDiv.length) {
            studyField = fieldDiv.text().trim();
          }
        }
      }

      // --- Extract panel country ---
      let country = labelId ? $(`#${labelId}`).text().trim() : 'Unknown';
      if (country) {
        const parts = country.split(/\s+/);
        country = [...new Set(parts)].join(' ');
      }

      return { panelHtml, country, studyField };
    });

    // --- Combine all panel HTMLs for one AI call ---
    const combinedHtml = panelData.map((p) => p.panelHtml).join('\n\n');

    // Use the first studyField and country as fallback
    const fallbackStudyField = panelData[0]?.studyField ?? 'Unknown';
    const fallbackCountry = panelData[0]?.country ?? 'Unknown';

    const extracted = await extractSectionWithAI(
      sectionTitle,
      combinedHtml,
      fallbackCountry,
      fallbackStudyField
    );

    extracted.forEach((item) => {
      const isoCode = getClosestCountry(item.country, lang);
      const jsonCoords = getCoordinates(isoCode);

      sections[sectionTitle].push({
        country: item.country,
        title: item.title,
        link: item.link,
        studyField: cleanField(item.studyField ?? fallbackStudyField),
        coordinates: {
          lat: jsonCoords?.lat,
          lng: jsonCoords?.lng,
        },
      });
    });
  }

  return sections;
};
