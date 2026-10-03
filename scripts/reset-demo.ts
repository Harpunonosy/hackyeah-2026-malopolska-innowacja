/** Przywraca dane demo (usuwa dane gości i Jury). Uruchom przed oceną i przed finałem: npx tsx --env-file=.env.local scripts/reset-demo.ts */
import { przywrocDaneDemo } from "../lib/reset-demo";
import { db } from "../lib/db";

przywrocDaneDemo().then(async (w) => {
  console.log("Usunięto:", w);
  await db().end();
});
