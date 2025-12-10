import * as cheerio from 'cheerio';
import {getClosestCountry, getCoordinates} from './countryService';

export type SectionData = Record<
  string,
  {
    country: string;
    title: string;
    link: string;
    studyField?: string;
    coordinates: {lat?: number; lng?: number};
  }[]
>;

// Remove repeated text in studyField
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
    const addedKeys = new Set<string>();

    for (const panel of $(section).find('.field-item').toArray()) {
      const headingText = $(panel)
        .find('h3 .field-name-field-label')
        .first()
        .text()
        .trim();
      const panelContent = $(panel)
        .find('.accordion-panel .field-item')
        .first();
      if (!panelContent.length) continue;

      const studyField = cleanField(headingText) || sectionTitle;

      let currentCountry = headingText; // fallback for Erasmus-style

      panelContent.contents().each((_, el) => {
        const $el = $(el);

        // If <p> contains a country name, update currentCountry
        if ($el.is('p') && $el.text().trim()) {
          currentCountry = $el.text().trim();
          return;
        }

        // Handle <ul><li><a>
        if ($el.is('ul')) {
          $el.find('li a').each((_, a) => {
            const title = $(a).text().trim();
            const link = $(a).attr('href') || '';
            const country = currentCountry;
            const key = `${country}|${title}|${studyField}`;
            if (addedKeys.has(key)) return;
            addedKeys.add(key);

            const isoCode = getClosestCountry(country, lang);
            const coords = getCoordinates(isoCode);

            sections[sectionTitle].push({
              country,
              title,
              link,
              studyField,
              coordinates: {lat: coords?.lat, lng: coords?.lng},
            });
          });
          return;
        }

        // Handle <p><a> directly inside panel
        $el.find('a').each((_, a) => {
          const title = $(a).text().trim();
          const link = $(a).attr('href') || '';
          const country = currentCountry;
          const key = `${country}|${title}|${studyField}`;
          if (addedKeys.has(key)) return;
          addedKeys.add(key);

          const isoCode = getClosestCountry(country, lang);
          const coords = getCoordinates(isoCode);

          sections[sectionTitle].push({
            country,
            title,
            link,
            studyField,
            coordinates: {lat: coords?.lat, lng: coords?.lng},
          });
        });
      });
    }
  }

  return sections;
};

export const scrapeHealthDestinations = async (
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
    const addedKeys = new Set<string>();

    // Each accordion item = a study field
    for (const panel of $(section).find('.field-item').toArray()) {
      // Get the study field from the <h3> heading of this accordion item
      const studyField =
        cleanField(
          $(panel).find('h3 .field-name-field-label').first().text().trim(),
        ) || 'Unknown';

      // The content panel contains the countries + universities
      const panelContent = $(panel)
        .find('.accordion-panel .field-item')
        .first();
      if (!panelContent.length) continue;

      // Each <p><span>Country</span></p> + <ul> structure
      panelContent.find('p > span').each((_, span) => {
        const country = $(span).text().trim();
        const ul = $(span).parent().next('ul');
        if (!ul.length) return;

        ul.find('li').each((_, li) => {
          const a = $(li).find('a').first();
          if (!a.length) return;

          const title = a.text().trim();
          const link = a.attr('href') || '';
          const key = `${country}|${title}|${studyField}`;
          if (addedKeys.has(key)) return;
          addedKeys.add(key);

          const isoCode = getClosestCountry(country, lang);
          const coords = getCoordinates(isoCode);

          sections[sectionTitle].push({
            country,
            title,
            link,
            studyField,
            coordinates: {lat: coords?.lat, lng: coords?.lng},
          });
        });
      });
    }
  }

  return sections;
};

export const scrapeTableDestinations = async (
  html: string,
  lang: 'en' | 'fi' = 'en',
): Promise<SectionData> => {
  const $ = cheerio.load(html);
  const sections: SectionData = {};

  for (const section of $('div.paragraph--type--accordion').toArray()) {
    const h2 = $(section).find('h2').first();
    if (!h2.length) continue;
    const sectionTitle = h2.text().trim();
    sections[sectionTitle] = [];

    const addedKeys = new Set<string>();

    for (const panel of $(section).find('.field-item').toArray()) {
      const country = $(panel)
        .find('h3 .field-name-field-label')
        .first()
        .text()
        .trim();
      const table = $(panel).find('table').first();
      if (!table.length) continue;

      table.find('tr').each((_, tr) => {
        const a = $(tr).find('td a').first();
        if (!a.length) return;

        const title = a.text().trim();
        const link = a.attr('href') || '';
        const studyField = sectionTitle;

        const key = `${country}|${title}|${studyField}`;
        if (addedKeys.has(key)) return;
        addedKeys.add(key);

        const isoCode = getClosestCountry(country, lang);
        const coords = getCoordinates(isoCode);

        sections[sectionTitle].push({
          country,
          title,
          link,
          studyField,
          coordinates: {lat: coords?.lat, lng: coords?.lng},
        });
      });
    }
  }

  return sections;
};
