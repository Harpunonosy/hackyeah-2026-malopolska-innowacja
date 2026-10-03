'use client';
import { useState, type FormEvent, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Wybor } from '@/components/ui/wybor';
import { LekcjaSchema, type EdycjaLekcji, type MaterialLekcji } from '@/lib/akademia';

const pole = 'min-h-12 w-full min-w-0 rounded-xl border-2 border-line-soft bg-card p-3 text-fg focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2';
function Pole({id,tytul,children}: {id:string;tytul:string;children:ReactNode}) {
  return <div className="min-w-0 space-y-2"><label className="block font-bold" htmlFor={id}>{tytul}</label>{children}</div>;
}
const pusta = (): EdycjaLekcji => ({szkic:{slug:'',tytul:'',minuty:3,akapity:[''],latwe:[''],quiz:[{pytanie:'',odpowiedzi:['',''],poprawna:0}],zrodla:[{nazwa:'',url:''}]}, opublikowana:null,revision:0,updatedAt:null,publishedAt:null});

export function EdytorAkademii({lekcje,gotowa}: {lekcje:EdycjaLekcji[];gotowa:boolean}) {
  const t = useTranslations('akademiaCentrala');
  const [lista,setLista] = useState(lekcje);
  const [wybrana,setWybrana] = useState<EdycjaLekcji>(lekcje[0] ?? pusta());
  const [klucz,setKlucz] = useState(0);
  const [brudna,setBrudna] = useState(false);
  const [trwa,setTrwa] = useState(false);
  function wybierz(l: EdycjaLekcji) {
    if (brudna && !window.confirm(t('porzuc'))) return;
    setWybrana(l); setKlucz(k=>k+1); setBrudna(false);
  }
  return <div className="space-y-6">
    <section aria-labelledby="lekcje-h" className="space-y-3">
      <h2 id="lekcje-h" className="text-2xl font-bold">{t('wybierz')}</h2>
      <ul className="grid gap-2 md:grid-cols-2">{lista.map(l=><li key={l.szkic.slug}>
        <button type="button" disabled={trwa} aria-pressed={wybrana.szkic.slug===l.szkic.slug} className={`${pole} text-left aria-pressed:border-fg`} onClick={()=>wybierz(l)}>
          <strong className="break-words">{l.szkic.tytul}</strong><span className="mt-1 block text-sm">{l.revision===0 ? t('bazowa') : l.opublikowana ? t('opublikowana') : t('szkic')}</span>
        </button>
      </li>)}</ul>
      <Button type="button" wariant="obrys" disabled={trwa} onClick={()=>wybierz(pusta())}>{t('nowa')}</Button>
    </section>
    <Formularz key={klucz} poczatkowa={wybrana} gotowa={gotowa} zmieniona={()=>setBrudna(true)} trwa={setTrwa} zapisano={l=>{
      setLista(ls=>ls.some(x=>x.szkic.slug===l.szkic.slug) ? ls.map(x=>x.szkic.slug===l.szkic.slug ? l : x) : [...ls,l]);
      setWybrana(l); setBrudna(false);
    }}/>
  </div>;
}
function Formularz({poczatkowa,gotowa,zmieniona,zapisano,trwa}: {poczatkowa:EdycjaLekcji;gotowa:boolean;zmieniona:()=>void;zapisano:(l:EdycjaLekcji)=>void;trwa:(v:boolean)=>void}) {
  const t = useTranslations('akademiaCentrala');
  const [l,setL] = useState(poczatkowa.szkic);
  const [stan,setStan] = useState(poczatkowa);
  const [busy,setBusy] = useState(false);
  const [komunikat,setKomunikat] = useState('');
  const [bledy,setBledy] = useState<string[]>([]);
  const [opublikowana,setOpublikowana] = useState(Boolean(poczatkowa.opublikowana));
  function zmien(p: Partial<MaterialLekcji>) {setL(x=>({...x,...p}));zmieniona();setKomunikat('');setBledy([]);}
  async function wyslij(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const akcja = (e.nativeEvent as SubmitEvent).submitter?.getAttribute('value') === 'publikuj' ? 'publikuj' : 'szkic';
    const walidacja = LekcjaSchema.safeParse({...l,akapity:podziel(l.akapity.join('\n\n')),latwe:podziel(l.latwe.join('\n\n'))});
    if (!walidacja.success) {setBledy([...new Set(walidacja.error.issues.map(i=>i.path.join('.')))]);setKomunikat(t('walidacja'));return;}
    setBusy(true);trwa(true);setBledy([]);setKomunikat('');
    try {
      const res = await fetch('/api/admin/akademia',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({lekcja:walidacja.data,akcja,revision:stan.revision}),signal:AbortSignal.timeout(20000)});
      const w = await res.json();
      if (!res.ok) {setKomunikat(w.blad==='konflikt' ? t('konflikt') : w.blad==='brak_dostepu' ? t('brakDostepu') : w.blad==='migracja' ? t('migracja') : t('blad'));return;}
      const zapis = w.lekcja as EdycjaLekcji;
      setStan(zapis);setL(zapis.szkic);setOpublikowana(akcja==='publikuj' || opublikowana);zapisano(zapis);
      setKomunikat(akcja==='publikuj' ? t('publikacjaOk') : t('szkicOk'));
    } catch {setKomunikat(t('blad'));}
    finally {setBusy(false);trwa(false);}
  }
  const podziel = (s:string) => s.split(/\n\s*\n/u).map(x=>x.trim()).filter(Boolean);
  const nazwy: Record<string,string> = {slug:t('slug'),tytul:t('tytulLekcji'),minuty:t('minuty'),akapity:t('tresc'),latwe:t('latwe'),quiz:t('quiz'),zrodla:t('zrodla')};
  return <form onSubmit={wyslij} className="karta min-w-0 space-y-6 p-4 sm:p-6">
    <h2 className="text-2xl font-bold">{t('edytuj')}</h2>
    <p className="text-muted">{t('rozdzielenie')}</p>
    <fieldset disabled={busy || !gotowa} className="min-w-0 space-y-5">
      <Pole id="ak-tytul" tytul={t('tytulLekcji')}><input id="ak-tytul" className={pole} required maxLength={200} value={l.tytul} onChange={e=>zmien({tytul:e.target.value})}/></Pole>
      <Pole id="ak-slug" tytul={t('slug')}><input id="ak-slug" className={pole} required readOnly={stan.revision>0 || Boolean(poczatkowa.szkic.slug)} pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={100} value={l.slug} onChange={e=>zmien({slug:e.target.value})} aria-describedby="ak-slug-hint"/><p id="ak-slug-hint" className="text-sm text-muted">{t('slugOpis')}</p></Pole>
      <Pole id="ak-minuty" tytul={t('minuty')}><input id="ak-minuty" className={pole} type="number" min={1} max={120} required value={l.minuty} onChange={e=>zmien({minuty:Number(e.target.value)})}/></Pole>
      <p id="ak-akapity-hint" className="text-muted">{t('akapityOpis')}</p>
      <Pole id="ak-tresc" tytul={t('tresc')}><textarea id="ak-tresc" className={pole} rows={10} required aria-describedby="ak-akapity-hint" value={l.akapity.join('\n\n')} onChange={e=>zmien({akapity:e.target.value.split('\n\n')})}/></Pole>
      <Pole id="ak-latwe" tytul={t('latwe')}><textarea id="ak-latwe" className={pole} rows={8} required aria-describedby="ak-akapity-hint" value={l.latwe.join('\n\n')} onChange={e=>zmien({latwe:e.target.value.split('\n\n')})}/></Pole>
      <section aria-labelledby="ak-quiz-h" className="space-y-4">
        <h3 id="ak-quiz-h" className="text-xl font-bold">{t('quiz')}</h3>
        {l.quiz.map((q,i)=><fieldset key={i} className="min-w-0 space-y-3 rounded-xl border-2 border-line-soft p-3">
          <legend className="font-bold">{t('pytanieNr',{n:i+1})}</legend>
          <Pole id={`ak-q-${i}`} tytul={t('pytanie')}><input id={`ak-q-${i}`} required maxLength={500} className={pole} value={q.pytanie} onChange={e=>zmien({quiz:l.quiz.map((x,j)=>j===i ? {...x,pytanie:e.target.value} : x)})}/></Pole>
          {q.odpowiedzi.map((o,j)=><Pole key={j} id={`ak-q-${i}-odp-${j}`} tytul={t('odpowiedzNr',{n:j+1})}>
            <input id={`ak-q-${i}-odp-${j}`} required maxLength={500} className={pole} value={o} onChange={e=>zmien({quiz:l.quiz.map((x,k)=>k===i ? {...x,odpowiedzi:x.odpowiedzi.map((a,b)=>b===j ? e.target.value : a)} : x)})}/>
          </Pole>)}
          <Wybor nazwa={`ak-poprawna-${i}`} legenda={t('poprawna')} wartosc={String(q.poprawna)} opcje={q.odpowiedzi.map((_,j)=>[String(j),t('odpowiedzNr',{n:j+1})])} zmien={v=>zmien({quiz:l.quiz.map((x,j)=>j===i ? {...x,poprawna:Number(v)} : x)})}/>
          <div className="flex flex-wrap gap-2">
            {q.odpowiedzi.length<6 && <Button type="button" wariant="obrys" onClick={()=>zmien({quiz:l.quiz.map((x,j)=>j===i ? {...x,odpowiedzi:[...x.odpowiedzi,'']} : x)})}>{t('dodajOdp')}</Button>}
            {q.odpowiedzi.length>2 && <Button type="button" wariant="obrys" onClick={()=>zmien({quiz:l.quiz.map((x,j)=>j===i ? {...x,odpowiedzi:x.odpowiedzi.slice(0,-1),poprawna:Math.min(x.poprawna,x.odpowiedzi.length-2)} : x)})}>{t('usunOdp')}</Button>}
            {l.quiz.length>1 && <Button type="button" wariant="obrys" onClick={()=>zmien({quiz:l.quiz.filter((_,j)=>j!==i)})}>{t('usunPytanie',{n:i+1})}</Button>}
          </div>
        </fieldset>)}
        {l.quiz.length<10 && <Button type="button" wariant="obrys" onClick={()=>zmien({quiz:[...l.quiz,{pytanie:'',odpowiedzi:['',''],poprawna:0}]})}>{t('dodajPytanie')}</Button>}
      </section>
      <section aria-labelledby="ak-zrodla-h" className="space-y-4">
        <h3 id="ak-zrodla-h" className="text-xl font-bold">{t('zrodla')}</h3>
        <p id="ak-url-hint" className="text-muted">{t('urlOpis')}</p>
        {l.zrodla.map((z,i)=><fieldset key={i} className="min-w-0 space-y-3 rounded-xl border-2 border-line-soft p-3">
          <legend className="font-bold">{t('zrodloNr',{n:i+1})}</legend>
          <Pole id={`ak-z-${i}`} tytul={t('zrodloNazwa')}><input id={`ak-z-${i}`} className={pole} required maxLength={300} value={z.nazwa} onChange={e=>zmien({zrodla:l.zrodla.map((x,j)=>j===i ? {...x,nazwa:e.target.value} : x)})}/></Pole>
          <Pole id={`ak-url-${i}`} tytul={t('url')}><input id={`ak-url-${i}`} className={pole} required maxLength={2000} aria-describedby="ak-url-hint" value={z.url} onChange={e=>zmien({zrodla:l.zrodla.map((x,j)=>j===i ? {...x,url:e.target.value} : x)})}/></Pole>
          {l.zrodla.length>1 && <Button type="button" wariant="obrys" onClick={()=>zmien({zrodla:l.zrodla.filter((_,j)=>j!==i)})}>{t('usunZrodlo',{n:i+1})}</Button>}
        </fieldset>)}
        {l.zrodla.length<15 && <Button type="button" wariant="obrys" onClick={()=>zmien({zrodla:[...l.zrodla,{nazwa:'',url:''}]})}>{t('dodajZrodlo')}</Button>}
      </section>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" name="akcja" value="szkic" wariant="obrys">{t('zapisz')}</Button>
        <Button type="submit" name="akcja" value="publikuj">{t('publikuj')}</Button>
      </div>
    </fieldset>
    <p role="status" className="font-bold">{busy ? t('trwa') : komunikat}</p>
    {bledy.length>0 && <ul className="list-inside list-disc">{bledy.map(b=><li key={b}>{nazwy[b.split('.')[0]] ?? b}</li>)}</ul>}
    {opublikowana && stan.szkic.slug && <p><Link href={`/wiedza/akademia/${stan.szkic.slug}`} className="inline-flex min-h-12 items-center font-bold underline">{t('zobacz')}</Link></p>}
  </form>;
}
