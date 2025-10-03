export const formatCurrency = (
  valueInCents: number,
  currency = "ARS",
  locale = "es-AR"
): string =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valueInCents / 100);
