"""Pobiera Bibliotekę Innowacji Społecznych ROPS Kraków (9 kategorii, ok. 115 innowacji).

Zapisuje data/zrodla/biblioteka_innowacji_rops.json i .csv. Imiona i nazwiska autorów (osób fizycznych)
są celowo pomijane, zostają tylko nazwy organizacji (regulamin: bez prawdziwych danych osobowych).

Użycie: python3 scripts/scrape_biblioteka.py
"""
import csv
import html
import json
import re
import subprocess
import time
from pathlib import Path

BASE = "https://rops.krakow.pl"
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36"
OUT = Path(__file__).resolve().parent.parent / "data" / "zrodla"
CATEGORIES = {
    "dla-seniorow": "Seniorzy",
    "dla-dzieci-mlodziezy-i-rodziny": "Dzieci, młodzież i rodzina",
    "dla-rynku-pracy": "Rynek pracy",
    "dla-osob-o-ograniczonej-mobilnosci": "Osoby o ograniczonej mobilności",
    "dla-osob-z-niepelnosprawnoscia-sensoryczna": "Niepełnosprawność sensoryczna",
    "dla-cudzoziemcow": "Cudzoziemcy",
    "dla-osob-z-niepelnosprawnoscia-intelektualna": "Niepełnosprawność intelektualna",
    "dla-osob-w-kryzysie-bezdomnosci": "Kryzys bezdomności",
    "dla-zdrowia-i-medycyny": "Zdrowie i medycyna",
}
# Wpis w polu "Autorzy" zostaje tylko, jeśli wygląda na organizację. Osoby fizyczne bywają wypisane
# bez myślnika, więc samo pomijanie linii z "-" nie wystarcza. Po pobraniu warto przejrzeć wynik ręcznie
# (np. firmy jednoosobowe mają w nazwie imię i nazwisko).
ORGANIZATION = re.compile(
    r"(?i)fundacj|fudacj|stowarzysz|\bsp\.|spółk|spółdziel|instytut|uniwersytet|uczelni|akadem|centrum|ośrod|"
    r"zespół|szkoł|gmin|powiat|miast|klub|parafi|caritas|\bdom\b|związek|towarzyst|grupa|\bkoło\b|federacj|urząd|"
    r"inkubator|politechnik|s\.a\.|s\.c\.|\bagh\b|pracowni|teatr|muzeum|bibliotek|kooperatyw|firma|studio|szpital|"
    r"spzoz|zakład|przychodni|poradni|hospicj|instytucj|organizacj|wojewódz|\"|„"
)
FIELDS = [
    "id", "kategoria", "nazwa", "na_czym_polega", "problem", "grupa_docelowa", "kto_moze_skorzystac",
    "czy_to_dziala", "autor_organizacja", "upowszechniana_w_projekcie", "film", "folder_pdf", "materialy_zip", "url",
]


from source_fetch import get, atomic_json, atomic_csv


def clean(fragment: str) -> str:
    fragment = re.sub(r"(?is)<br\s*/?>", "\n", fragment)
    fragment = re.sub(r"(?is)</(p|li|div|h\d)>", "\n", fragment)
    text = html.unescape(re.sub(r"(?s)<[^>]+>", "", fragment)).replace("​", "")
    text = re.sub(r"[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}", "[kontakt w źródle ROPS]", text)
    lines = [re.sub(r"[ \t\xa0]+", " ", line).strip() for line in text.split("\n")]
    return "\n".join(line for line in lines if line and line not in ("Powrót", "Drukuj"))


def absolute(url: str) -> str:
    return BASE + url if url.startswith("/") else url


def main() -> None:
    items, seen = [], set()
    for slug, category in CATEGORIES.items():
        listing = get(f"{BASE}/innowacje-spoleczne/biblioteka-innowacji-spolecznych/{slug}")
        links = list(dict.fromkeys(re.findall(
            r'href="(/innowacje-spoleczne/biblioteka-innowacji-spolecznych/' + re.escape(slug) + r',[^"#?]+)"', listing)))
        print(category, len(links))
        for link in links:
            if link in seen:
                continue
            seen.add(link)
            page = get(BASE + link)
            title = re.search(r'<h2 class="page-title">(.*?)</h2>', page, re.S)
            body_match = re.search(r'<h2 class="page-title">.*?(?=<h2 class="module__header)', page, re.S)
            body = body_match.group(0) if body_match else page
            sections = {}
            parts = re.split(r"<h4>\s*(\d)\.\s*(.*?)</h4>", body, flags=re.S)
            for i in range(1, len(parts) - 2, 3):
                sections[clean(parts[i + 1])] = clean(parts[i + 2])

            def pick(*keys):
                for heading, value in sections.items():
                    if any(k.lower() in heading.lower() for k in keys):
                        return value
                return ""

            authors = [
                line.rstrip(":").strip() for line in pick("Autor").split("\n")
                if line and not line.startswith("-") and ORGANIZATION.search(line)
            ]
            items.append({
                "id": link.split(",")[-1],
                "kategoria": category,
                "nazwa": clean(title.group(1)) if title else link.split(",")[-1],
                "na_czym_polega": pick("Na czym polega"),
                "problem": pick("Jakich problem"),
                "grupa_docelowa": pick("Grupa docelowa"),
                "kto_moze_skorzystac": pick("Kto może"),
                "czy_to_dziala": pick("Czy to działa"),
                "autor_organizacja": "; ".join("Instytut HR" if a.startswith("Instytut HR") else a for a in authors),
                "upowszechniana_w_projekcie": [
                    re.sub(r"^INNOWACJA WYBRANA DO UPOWSZECHNIANIA W RAMACH PROJEKTU\s*", "", b).strip('" ')
                    for b in re.findall(r"INNOWACJA WYBRANA[^<]*", body)
                ],
                "film": [html.unescape(u) for u in re.findall(r'href="(https?://(?:www\.)?(?:youtube\.com|youtu\.be)[^"]+)"', body)],
                "folder_pdf": [absolute(u) for u in re.findall(r'href="([^"]+\.pdf)"', body)],
                "materialy_zip": [absolute(u) for u in re.findall(r'href="([^"]+\.zip)"', body)],
                "url": BASE + link,
            })

    for item in items:
        item["autor_organizacja"] = item.pop("autor_organizacja")
    OUT.mkdir(parents=True, exist_ok=True)
    atomic_json(OUT / "biblioteka_innowacji_rops.json", items, minimum=90)
    atomic_csv(OUT / "biblioteka_innowacji_rops.csv", FIELDS,
               [["; ".join(item[k]) if isinstance(item[k], list) else item[k] for k in FIELDS] for item in items])
    print("Zapisano", len(items), "innowacji")


if __name__ == "__main__":
    main()
