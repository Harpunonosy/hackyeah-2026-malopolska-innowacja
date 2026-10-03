/** Zapamiętuje już widziane sprawy również wtedy, gdy wypadną z pierwszej strony skrzynki. */
export function noweSprawy<T extends { id: string }>(znane: Set<string>, sprawy: T[], pierwsze = false): T[] {
  const nowe = pierwsze ? [] : sprawy.filter((s) => !znane.has(s.id));
  sprawy.forEach((s) => znane.add(s.id));
  return nowe;
}

/** Następne żądanie zaczyna się po zakończeniu poprzedniego; awaria nie zatrzymuje odświeżania. */
export function odpytywanie(pobierz: (signal: AbortSignal) => Promise<void>, coMs: number, blad: (e: unknown) => void) {
  let aktywne = true;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let kontroler: AbortController | undefined;
  async function krok() {
    kontroler = new AbortController();
    try {
      await pobierz(kontroler.signal);
    } catch (e) {
      if (aktywne) blad(e);
    } finally {
      if (aktywne) timer = setTimeout(krok, coMs);
    }
  }
  void krok();
  return () => {
    aktywne = false;
    clearTimeout(timer);
    kontroler?.abort();
  };
}
