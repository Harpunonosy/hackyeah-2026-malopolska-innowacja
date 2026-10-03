import { zakonczSesje } from "@/lib/sesja";

export async function POST() {
  await zakonczSesje();
  return Response.json({ ok: true });
}
