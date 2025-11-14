import { search } from 'fast-fuzzy';
import coords from '../../utils/coords.json';
import countryToISO from '../../utils/countryToISO.json';
import finCountryToISO from '../../utils/finCountryToISO.json';

const normalize = (str: string) =>
  str.trim().toLowerCase().replace(/\s+/g, ' ');

// Handle common abbreviations / aliases
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

// Choose correct country dictionary based on language
const getCountryDictionary = (lang: "en" | "fi") => {
  switch (lang) {
    case "fi":
      return finCountryToISO;
    default:
      return countryToISO;
  }
};

export const getClosestCountry = (countryName: string, lang: "en" | "fi" = "en") => {
  const dictionary = getCountryDictionary(lang);
  const normalizedInput = normalize(countryName);

  // Check alias only in English (since aliases like UK, USA are English-specific)
  if (lang === "en" && aliases[countryName]) {
    return dictionary[aliases[countryName] as keyof typeof dictionary];
  }

  const countryNames = Object.keys(dictionary);
  const normalizedCandidates = countryNames.map(normalize);

  const bestMatch = search(normalizedInput, normalizedCandidates)[0];
  if (!bestMatch) return undefined;

  const originalName = countryNames.find(name => normalize(name) === bestMatch);
  return originalName
    ? dictionary[originalName as keyof typeof dictionary]
    : undefined;
};

export const getCoordinates = (isoCode?: string) => {
  return isoCode && isoCode in coords
    ? coords[isoCode as keyof typeof coords]
    : undefined;
};

// Shortcut: country name -> coordinates
export const getCoordinatesFromName = (countryName: string, lang: "en" | "fi" = "en") => {
  const isoCode = getClosestCountry(countryName, lang);
  return getCoordinates(isoCode);
};
