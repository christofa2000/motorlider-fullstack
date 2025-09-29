export const formatCurrency = (
  value: number,
  currency = "ARS",
  locale = "es-AR"
): string =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
