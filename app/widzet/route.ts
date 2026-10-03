import { getTranslations } from "next-intl/server";
import { TELEFONY_KRYZYSOWE } from "@/lib/kryzys";
import { KRAJOWE_SKROTY, normalizujPowiat } from "@/lib/powiaty";

// Widżet „Znajdź pomoc” do osadzenia (iframe) na stronach gmin, OPS i bibliotek.
// Samodzielna, lekka strona bez nagłówka Splotu. Wyszukuje przez /api/v1/dopasuj.
// Osadzanie na innych stronach dopuszcza nagłówek frame-ancestors (next.config.ts).

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function GET(req: Request) {
  const t = await getTranslations("widzet");
  const u = new URL(req.url);
  const powiat = normalizujPowiat(u.searchParams.get("powiat"));
  const nazwaPowiatu = powiat ? KRAJOWE_SKROTY[powiat] ?? powiat : null;
  const baza = u.origin;
  const teksty = {
    szukam: t("szukam"), wyniki: t("wyniki"), najblizsze: t("najblizsze"), brak: t("brak"), ktoWdrozy: t("ktoWdrozy"),
    otworz: t("otworz"), zglos: t("zglos"), blad: t("blad"), zaDuzo: t("zaDuzo"), kryzys: t("kryzys"), nowaKarta: t("nowaKarta"),
  };
  const telefony = TELEFONY_KRYZYSOWE.map((x) => ({ numer: x.numer, wyswietl: "wyswietl" in x ? x.wyswietl : x.numer, opis: x.opis, rodzaje: x.rodzaje }));

  const html = `<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${esc(t("tytulStrony"))}</title>
<style>
:root{--fg:#14213d;--bg:#fff;--muted:#3d4a66;--line:#8a94a8;--accent:#ffd400;--primary:#b3261e;--card:#f6f7fb}
@media (prefers-color-scheme:dark){:root{--fg:#f2f4f8;--bg:#0f172a;--muted:#c4cad6;--line:#64748b;--card:#1e293b;--primary:#ff8a80}}
*{box-sizing:border-box}
body{margin:0;font:18px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:var(--fg);background:var(--bg)}
main{padding:16px;max-width:720px}
h1{font-size:1.6rem;margin:0 0 .25rem;line-height:1.2}
h2{font-size:1.25rem;margin:1rem 0 .5rem;line-height:1.3}
label{display:block;font-weight:700;margin:.75rem 0 .25rem}
textarea{display:block;width:100%;min-height:6.5rem;font:inherit;padding:.75rem;border:2px solid var(--line);border-radius:12px;background:var(--bg);color:var(--fg)}
textarea:hover{border-color:var(--fg)}
.pomoc{color:var(--muted);margin:.25rem 0 .75rem;font-size:.95rem}
button,.przycisk{display:inline-flex;align-items:center;min-height:48px;padding:.5rem 1.25rem;font:inherit;font-weight:700;border-radius:999px;border:2px solid var(--fg);background:var(--fg);color:var(--bg);cursor:pointer;text-decoration:none}
.przycisk{background:transparent;color:var(--fg)}
button[disabled]{opacity:.6;cursor:wait}
:focus-visible{outline:3px solid var(--accent);outline-offset:3px;box-shadow:0 0 0 6px var(--fg)}
a{color:var(--fg);text-underline-offset:.2em}
ol{padding:0;list-style:none;margin:0}
li.karta{background:var(--card);border:2px solid var(--line);border-radius:16px;padding:12px 16px;margin:0 0 12px}
li.karta h3{margin:0 0 .25rem;font-size:1.1rem}
.kryzys{border:3px solid var(--primary);border-radius:16px;padding:12px 16px;margin:12px 0}
.kryzys a{font-weight:700;font-size:1.2rem}
.stopka{color:var(--muted);font-size:.9rem;margin-top:1.5rem}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
</style>
</head>
<body>
<main>
<h1>${esc(t("tytul"))}</h1>
<p>${esc(nazwaPowiatu ? t("wstepPowiat", { powiat: nazwaPowiatu }) : t("wstep"))}</p>
<form id="f">
<label for="tekst">${esc(t("etykieta"))}</label>
<textarea id="tekst" name="tekst" rows="4" maxlength="1500" minlength="3" required aria-describedby="pomoc"></textarea>
<p id="pomoc" class="pomoc">${esc(t("pomoc"))}</p>
<button id="b" type="submit">${esc(t("szukaj"))}</button>
</form>
<p id="s" role="status"></p>
<div id="w"></div>
<p class="stopka">${esc(t("stopka"))} <a href="${baza}" target="_blank" rel="noopener">Splot <span class="sr">${esc(t("nowaKarta"))}</span></a></p>
</main>
<script>
(function(){
var T=${JSON.stringify(teksty)},TEL=${JSON.stringify(telefony)},POWIAT=${JSON.stringify(powiat)},BAZA=${JSON.stringify(baza)};
var f=document.getElementById("f"),s=document.getElementById("s"),w=document.getElementById("w"),b=document.getElementById("b");
function el(tag,txt,cls){var e=document.createElement(tag);if(txt)e.textContent=txt;if(cls)e.className=cls;return e}
function link(href,txt,cls,bezSr){var a=el("a",txt,cls);a.href=BAZA+href;a.target="_blank";a.rel="noopener";if(!bezSr)a.appendChild(el("span"," "+T.nowaKarta,"sr"));return a}
f.addEventListener("submit",function(e){
e.preventDefault();var tekst=f.tekst.value.trim();if(tekst.length<3)return;
b.disabled=true;w.innerHTML="";s.textContent=T.szukam;
fetch("/api/v1/dopasuj",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({tekst:tekst,powiat:POWIAT||undefined,rola:"mieszkaniec"})})
.then(function(r){if(r.status===429)throw new Error("429");if(!r.ok)throw new Error("x");return r.json()})
.then(function(d){
s.textContent="";
if(d.kryzys){var k=el("div",null,"kryzys");k.appendChild(el("p",T.kryzys));var ul=el("ul");TEL.filter(function(t){return t.rodzaje.indexOf(d.kryzys)>=0}).forEach(function(t){var li=el("li");var a=el("a",t.wyswietl);a.href="tel:"+t.numer;li.appendChild(a);li.appendChild(document.createTextNode(" · "+t.opis));ul.appendChild(li)});k.appendChild(ul);w.appendChild(k)}
var karty=d.dopasowania.length?d.dopasowania:d.najblizsze;
var h=el("h2",d.dopasowania.length?T.wyniki:(karty.length?T.najblizsze:T.brak));h.tabIndex=-1;w.appendChild(h);
var ol=el("ol");karty.slice(0,3).forEach(function(c){var li=el("li",null,"karta");li.appendChild(el("h3",c.nazwa));li.appendChild(el("p",c.dlaczego));if(c.ktoMozeWdrozyc){var p=el("p");p.appendChild(el("strong",T.ktoWdrozy+" "));p.appendChild(document.createTextNode(c.ktoMozeWdrozyc));li.appendChild(p)}li.appendChild(link(c.link,T.otworz,null,true));ol.appendChild(li)});
w.appendChild(ol);var z=el("p");z.appendChild(link("/problem",T.zglos,"przycisk"));w.appendChild(z);h.focus();
})
.catch(function(e){s.textContent=e.message==="429"?T.zaDuzo:T.blad})
.finally(function(){b.disabled=false});
});
})();
</script>
</body>
</html>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=300" } });
}
