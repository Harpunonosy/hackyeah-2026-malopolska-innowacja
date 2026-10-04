/** API formularzy zawsze zwraca JSON, także przy utracie sieci/HTML od proxy.
 * Dzięki temu istniejąca obsługa r.ok odblokowuje formularz i pozwala ponowić wysyłkę. */
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const anuluj = () => controller.abort();
  if (init?.signal?.aborted) controller.abort();
  else init?.signal?.addEventListener("abort", anuluj, { once: true });
  const timer = setTimeout(()=>controller.abort(),125_000);
  try {
    const r = await fetch(input,{...init,signal:controller.signal});
    if (!r.headers.get('content-type')?.includes('application/json')) {
      return Response.json({blad:'serwer'},{status:r.ok?502:r.status});
    }
    // Odczyt treści też może zostać przerwany przez utratę połączenia.
    const dane=await r.json();
    const headers = new Headers(r.headers);
    headers.delete("content-length"); headers.delete("content-encoding");
    return Response.json(dane,{status:r.status,headers});
  } catch {
    return Response.json({blad:'siec'},{status:503});
  } finally { clearTimeout(timer); init?.signal?.removeEventListener("abort", anuluj); }
}
