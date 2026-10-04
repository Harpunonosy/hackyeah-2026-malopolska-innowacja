import opracowania from '@/data/zrodla/opracowania_rops.json';
import baza from '@/data/zrodla/materialy_rops.json';
import type { FaktRaportu } from './wiedza';
export const dokumenty = baza.dokumenty;
export const dataPobrania = baza.pobrano;
export const zrodlaRops = baza.zrodla;
const normalizuj=(s:string)=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ł/g,'l');
export function znajdzMaterialy(tekst='',rodzaj='',temat='') {
  const slowa=normalizuj(tekst).split(/\s+/).filter(Boolean);
  return dokumenty.filter(d=>(!rodzaj||d.rodzaj===rodzaj)&&(!temat||d.tematy.includes(temat))&&slowa.every(s=>normalizuj(d.tytul+' '+d.tematy.join(' ')).includes(s)));
}
export function zrodlaOdpowiedzi(indeksy:number[], fragmenty:FaktRaportu[]):FaktRaportu[] {
  return [...new Set(indeksy)].filter(n=>Number.isInteger(n)&&n>=1&&n<=fragmenty.length).map(n=>fragmenty[n-1]);
}

export const opracowaniaRops = opracowania.fragmenty.flatMap(f => {
 const d=dokumenty.find(d=>d.id===f.dokument);
 return d && d.sha256 === f.sha256 ? [{...f,zrodlo:d.tytul,strona:f.strona,url:`${d.plik}#page=${f.strona}`}] : [];
});
