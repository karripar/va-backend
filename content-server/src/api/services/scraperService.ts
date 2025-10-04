import * as cheerio from 'cheerio';
import {getClosestCountry, getCoordinates} from './countryService';

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
  lang: "en" | "fi" = "en"
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

        // Iterate through each <li> individually to handle <strong> elements
        let subsectionLabel = '';
        $(panel).find('li').each((_, li) => {
          const liChildren = $(li).contents().toArray();

          let previousTitle: string | null = null;
          liChildren.forEach(el => {
            // Update global subsection label if <strong> found
            if (el.type === 'tag' && el.name === 'strong') {
              subsectionLabel = $(el).text().trim();
              return;
            }

            // Handle links
            if (el.type === 'tag' && el.name === 'a') {
              const title = $(el).text().trim();
              const link = $(el).attr('href') ?? '';
              previousTitle = subsectionLabel ? `${subsectionLabel}: ${title}` : title;

              sections[sectionTitle].push({
                country,
                title: previousTitle,
                link,
                coordinates: { lat: jsonCoords?.lat, lng: jsonCoords?.lng },
              });
              return;
            }

            // Handle plain text
            if (el.type === 'text') {
              let text = $(el).text().trim();
              if (!text) return;

              // Remove leading commas/whitespace
              text = text.replace(/^,?\s*/, '');
              if (text) {
                // Attach to previous <a> title if exists
                if (previousTitle) {
                  sections[sectionTitle][sections[sectionTitle].length - 1].title += `, ${text}`;
                } else {
                  sections[sectionTitle].push({
                    country,
                    title: subsectionLabel ? `${subsectionLabel}: ${text}` : text,
                    link: '',
                    coordinates: { lat: jsonCoords?.lat, lng: jsonCoords?.lng },
                  });
                }
              }
            }
          });
        });


        // Fallback: if no <li> exists, grab plain text or <a> tags at panel level
        if ($(panel).find('li').length === 0) {
          $(panel)
            .find('a')
            .each((_, link) => {
              sections[sectionTitle].push({
                country,
                title: $(link).text().trim(),
                link: $(link).attr('href') ?? '',
                coordinates: {lat: jsonCoords?.lat, lng: jsonCoords?.lng},
              });
            });

          if ($(panel).find('a').length === 0) {
            const plainText = $(panel).text().trim();
            if (plainText) {
              sections[sectionTitle].push({
                country,
                title: plainText,
                link: '',
                coordinates: {lat: jsonCoords?.lat, lng: jsonCoords?.lng},
              });
            }
          }
        }
      });
  });

  return sections;
};
