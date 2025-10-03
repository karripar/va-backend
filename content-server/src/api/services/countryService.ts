import { search } from 'fast-fuzzy';
import coords from '../../utils/coords.json';
import countryToISO from '../../utils/countryToISO.json';

const normalize = (str: string) =>
  str.trim().toLowerCase().replace(/\s+/g, ' ');

export const getClosestCountry = (countryName: string) => {
  const countryNames = Object.keys(countryToISO);
  const normalizedInput = normalize(countryName);
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
