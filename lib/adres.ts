/** Publiczny adres Splotu (linki w webhookach, kodach QR, widżecie). Na Vercelu z adresu produkcyjnego. */
export function adresBazowy(): string {
  if (process.env.SPLOT_URL) return process.env.SPLOT_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}
