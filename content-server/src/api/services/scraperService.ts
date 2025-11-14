import * as cheerio from 'cheerio';
import { getClosestCountry, getCoordinates } from './countryService';

export type SectionData = Record<
  string,
  {
    country: string;
    title: string;
    link: string;
    coordinates: { lat?: number; lng?: number };
  }[]
>;

// --- Utility function to normalize colon/semicolon entries ---
const cleanEntry = (text: string) => {
  text = text.replace(/\s+/g, ' ').trim();

  // Remove trailing colons
  text = text.replace(/:$/g, '');

  // Replace multiple colons/semicolons with comma except the first colon
  const parts = text.split(':').map(p => p.trim());
  if (parts.length > 1) {
    const first = parts[0];
    const rest = parts.slice(1).join(', ');
    text = `${first}: ${rest}`;
  }

  // Replace remaining semicolons with commas
  text = text.replace(/;/g, ', ');

  // Clean up multiple commas and spaces
  text = text.replace(/\s+,/g, ',').replace(/,+/g, ',').trim();

  return text;
};

export const scrapeDestinations = async (
  html: string,
  lang: 'en' | 'fi' = 'en'
): Promise<SectionData> => {
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

    $(section)
      .find('.accordion-panel')
      .each((_, panel) => {
        const id = $(panel).attr('aria-labelledby');
        let country = id ? $(`#${id}`).text().trim() : 'Unknown';
        if (country) {
          const parts = country.split(/\s+/);
          country = [...new Set(parts)].join(' ');
        }

        const isoCode = getClosestCountry(country, lang);
        const jsonCoords = getCoordinates(isoCode);

        // --- Process each <li> ---
        $(panel)
          .find('li')
          .each((_, li) => {
            const liContent = $(li).contents().toArray();

            const combinedParts: string[] = [];

            liContent.forEach(node => {
              if (node.type === 'text') {
                const txt = $(node).text().trim();
                if (txt) combinedParts.push(txt);
              } else if (node.type === 'tag' && node.name === 'a') {
                const title = $(node).text().trim();
                const href = $(node).attr('href') ?? '';
                combinedParts.push(title);
                combinedParts.push(`__LINK__${href}__`);
              }
            });

            // Join all text parts
            let fullText = combinedParts
              .map(p => p.replace(/^:|:$/g, '').trim())
              .join(': ');

            // Extract link
            let link = '';
            const linkMatch = fullText.match(/__LINK__(.*?)__/);
            if (linkMatch) {
              link = linkMatch[1];
              fullText = fullText.replace(/__LINK__.*?__/, '').trim();
            }

            fullText = cleanEntry(fullText);

            sections[sectionTitle].push({
              country,
              title: fullText,
              link,
              coordinates: { lat: jsonCoords?.lat, lng: jsonCoords?.lng },
            });
          });

        // --- Fallback if no <li> exists ---
        if ($(panel).find('li').length === 0) {
          $(panel)
            .find('a')
            .each((_, linkEl) => {
              const title = cleanEntry($(linkEl).text().trim());
              sections[sectionTitle].push({
                country,
                title,
                link: $(linkEl).attr('href') ?? '',
                coordinates: { lat: jsonCoords?.lat, lng: jsonCoords?.lng },
              });
            });

          if ($(panel).find('a').length === 0) {
            const plainText = cleanEntry($(panel).text().trim());
            if (plainText) {
              sections[sectionTitle].push({
                country,
                title: plainText,
                link: '',
                coordinates: { lat: jsonCoords?.lat, lng: jsonCoords?.lng },
              });
            }
          }
        }
      });
  });

  return sections;
};
