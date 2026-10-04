type Pole = { nr: number; tresc: string };
type Schemat = { pola: { nr: number; pole: string; limit: number | null }[] };
export function bledyWniosku(pola: Pole[], schemat: Schemat): string[] {
  const bledy: string[] = [];
  if (new Set(pola.map(p => p.nr)).size !== pola.length || pola.some(p => !schemat.pola.some(s => s.nr === p.nr))) bledy.push('Nieprawidłowe lub powtórzone numery pól.');
  for (const pole of schemat.pola) {
    const tresc=pola.find(p=>p.nr===pole.nr)?.tresc.trim() ?? '';
    if (!tresc || /\buzupełnij\b/i.test(tresc)) bledy.push(`Uzupełnij pole: ${pole.pole}.`);
    else if (tresc.length > (pole.limit ?? 4000)) bledy.push(`Skróć pole: ${pole.pole} (maks. ${pole.limit ?? 4000} znaków).`);
  }
  return bledy;
}
export function naborOtwarty(n: {aktywny: boolean; otwarty_od?: string | Date | null; otwarty_do?: string | Date | null}, teraz = new Date()): boolean {
  const kalendarz = new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Warsaw',year:'numeric',month:'2-digit',day:'2-digit'});
  const dzis = kalendarz.format(teraz);
  const data = (d: string | Date) => d instanceof Date ? kalendarz.format(d) : d.slice(0,10);
  return n.aktywny && (!n.otwarty_od || data(n.otwarty_od) <= dzis) && (!n.otwarty_do || data(n.otwarty_do) >= dzis);
}
