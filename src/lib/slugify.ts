const NON_LATIN = /[^a-z0-9]+/g;
const MULTIPLE_DASH = /-{2,}/g;
const EDGE_DASH = /^-+|-+$/g;
const DIACRITICS = /[\u0300-\u036f]/g;

export const slugify = (value: string): string => {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(DIACRITICS, "")
    .replace(NON_LATIN, "-")
    .replace(MULTIPLE_DASH, "-")
    .replace(EDGE_DASH, "")
    .trim();
};