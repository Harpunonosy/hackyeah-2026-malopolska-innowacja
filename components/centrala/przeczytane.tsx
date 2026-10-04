"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/fetch-klient';
import { Button } from '@/components/ui/button';
export function Przeczytane({ids}:{ids:string[]}) {
 const router=useRouter();const [pracuje,setPracuje]=useState(false);const [blad,setBlad]=useState(false);
 return <div><Button disabled={pracuje||!ids.length} wariant="obrys" onClick={async()=>{
  setPracuje(true);setBlad(false);
  const r=await apiFetch('/api/admin/powiadomienia/przeczytane',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({ids})});
  setPracuje(false);if(r.ok)router.refresh();else setBlad(true);
 }}>Oznacz wyświetlone powiadomienia ROPS jako przeczytane</Button>{blad&&<p role="alert">Nie udało się zapisać. Spróbuj ponownie.</p>}</div>;
}
