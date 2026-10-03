import { zakonczSesjeEksperta } from "@/lib/ekspert";

export async function POST() {
  await zakonczSesjeEksperta();
  return Response.json({ ok: true });
}
