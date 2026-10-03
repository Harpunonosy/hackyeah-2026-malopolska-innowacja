import { existsSync } from "node:fs";
import { chromium } from "playwright-core";

/** Chrome systemowy lub przeglądarka pobrana przez Playwright. Ścieżkę można podać w SPLOT_BROWSER_PATH. */
export function przegladarkaTestowa(channel = process.env.SPLOT_BROWSER_CHANNEL) {
  const executablePath = process.env.SPLOT_BROWSER_PATH ?? (existsSync("/usr/bin/google-chrome") ? "/usr/bin/google-chrome" : undefined);
  return chromium.launch({ executablePath, channel, args: ["--no-sandbox"] });
}
