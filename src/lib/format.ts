const euroFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function formatEuros(valeur: number): string {
  return euroFormatter.format(valeur);
}

export function formatSigned(valeur: number): string {
  const formatted = formatEuros(Math.abs(valeur));
  return valeur > 0 ? `+${formatted}` : valeur < 0 ? `-${formatted}` : formatted;
}
