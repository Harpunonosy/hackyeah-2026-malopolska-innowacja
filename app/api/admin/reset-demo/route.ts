import { przywrocDaneDemo } from "@/lib/reset-demo";
import { czyAdmin } from "@/lib/sesja";

export async function POST() {
  if (!(await czyAdmin())) return Response.json({ blad: "brak_dostepu" }, { status: 401 });
  return Response.json({ usuniete: await przywrocDaneDemo() });
}
