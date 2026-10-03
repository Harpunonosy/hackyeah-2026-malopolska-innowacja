import { czyAdmin } from '@/lib/sesja';
import { ZapisLekcji } from '@/lib/akademia';
import { BrakMagazynuAkademii, KonfliktAkademii, lekcjeDoEdycji, zapiszLekcje } from '@/lib/akademia-baza';

export async function GET() {
  if (!(await czyAdmin())) return Response.json({blad:'brak_dostepu'}, {status:401});
  try { return Response.json(await lekcjeDoEdycji(), {headers:{'Cache-Control':'no-store'}}); }
  catch { return Response.json({blad:'odczyt'}, {status:503}); }
}
export async function POST(req: Request) {
  if (!(await czyAdmin())) return Response.json({blad:'brak_dostepu'}, {status:401});
  const w = ZapisLekcji.safeParse(await req.json().catch(()=>null));
  if (!w.success) return Response.json({blad:'walidacja', pola:w.error.issues.map(i=>i.path.join('.'))}, {status:400});
  try {
    return Response.json({ok:true,lekcja:await zapiszLekcje(w.data.lekcja,w.data.akcja,w.data.revision)});
  } catch (e) {
    if (e instanceof KonfliktAkademii) return Response.json({blad:'konflikt'}, {status:409});
    if (e instanceof BrakMagazynuAkademii) return Response.json({blad:'migracja'}, {status:503});
    return Response.json({blad:'zapis'}, {status:503});
  }
}
