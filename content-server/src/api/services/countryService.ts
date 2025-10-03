import { search } from 'fast-fuzzy';
import coords from '../../utils/coords.json';
import countryToISO from '../../utils/countryToISO.json';

const normalize = (str: string) =>
  str.trim().toLowerCase().replace(/\s+/g, ' ');

// Handle common abbreviations / aliases that fuzzy search might misinterpret
const aliases: Record<string, string> = {
  UK: "United Kingdom",
  GB: "United Kingdom",
  US: "United States",
  USA: "United States",
  UAE: "United Arab Emirates",
  ROK: "South Korea",
  "S. Korea": "South Korea",
  "N. Korea": "North Korea",
  "Republic of Korea": "South Korea",
};

export const getClosestCountry = (countryName: string) => {
  const normalizedInput = normalize(countryName);

  // Check alias first (without normalization to preserve keys like "UK")
  if (aliases[countryName]) {
    return countryToISO[aliases[countryName] as keyof typeof countryToISO];
  }

  const countryNames = Object.keys(countryToISO);
  const normalizedCandidates = countryNames.map(normalize);

  const bestMatch = search(normalizedInput, normalizedCandidates)[0];
  if (!bestMatch) return undefined;

  const originalName = countryNames.find(name => normalize(name) === bestMatch);
  return originalName
    ? countryToISO[originalName as keyof typeof countryToISO]
    : undefined;
};

export const getCoordinates = (isoCode?: string) => {
  return isoCode && isoCode in coords
    ? coords[isoCode as keyof typeof coords]
    : undefined;
};

// Shortcut: go directly from country name -> coordinates
export const getCoordinatesFromName = (countryName: string) => {
  const isoCode = getClosestCountry(countryName);
  return getCoordinates(isoCode);
};
