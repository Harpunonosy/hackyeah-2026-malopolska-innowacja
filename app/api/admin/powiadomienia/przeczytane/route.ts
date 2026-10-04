import { z } from 'zod';
import { czyAdmin } from '@/lib/sesja';
import { db } from '@/lib/db';
export async function POST(req: Request) {
 if (!(await czyAdmin())) return Response.json({blad:'brak_dostepu'},{status:401});
 const w=z.object({ids:z.array(z.string().uuid()).max(150)}).safeParse(await req.json().catch(()=>null));
 if(!w.success)return Response.json({blad:'walidacja'},{status:400});
 await db().query("update powiadomienia set przeczytane_at=coalesce(przeczytane_at,now()) where adresat='rops' and id=any($1::uuid[])",[w.data.ids]);
 return Response.json({ok:true});
}
