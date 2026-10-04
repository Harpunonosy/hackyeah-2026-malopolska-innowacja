"""Pobiera wskaźniki Internetowego Obserwatora Statystyk Społecznych (ROPS Kraków) dla 22 powiatów Małopolski.

Strona /differenceanalysis/<id> zawiera w kodzie tablice JS z nazwami powiatów i wartościami
dla domyślnego (najnowszego) roku. Wynik: data/zrodla/ioss_powiaty.json i .csv.

Użycie: python3 scripts/scrape_ioss.py
"""
from datetime import datetime, timezone
import csv
import html
import json
import re
import subprocess
import time
from pathlib import Path

BASE = "https://obserwator.rops.krakow.pl"
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36"
OUT = Path(__file__).resolve().parent.parent / "data" / "zrodla"


from source_fetch import get, atomic_json, atomic_csv


def selected_year(page: str):
    # IOSS może pokazywać dane starsze od pierwszej pozycji listy lat.
    options = re.findall(r'<option\b[^>]*>', page)
    for option in options:
        if re.search(r'\bselected(?:\s|=|>)', option):
            year = re.search(r'value=[\"\'](20\d{2})[\"\']', option)
            if year:
                return year.group(1)
    return None


def main() -> None:
    home = get(BASE + "/")
    links = [
        (m.start(), int(m.group(1)), html.unescape(re.sub(r"<[^>]+>", "", m.group(2))).strip())
        for m in re.finditer(r'<a[^>]*href="/differenceanalysis/(\d+)"[^>]*>(.*?)</a>', home, re.S)
    ]
    heads = [
        (m.start(), html.unescape(m.group(1)).strip())
        for m in re.finditer(r'data-target="#submenu_\d+"[^>]*>\s*([^<]+)', home)
    ]

    def category_at(pos: int):
        cat = None
        for p, h in heads:
            if p < pos:
                cat = h
        return cat

    indicators, seen = [], set()
    for pos, ind_id, name in links:
        if ind_id not in seen:
            seen.add(ind_id)
            indicators.append({"id": ind_id, "kategoria": category_at(pos), "wskaznik": name})
    print(len(indicators), "wskaźników")

    rows = []
    for ind in indicators:
        page = get(f"{BASE}/differenceanalysis/{ind['id']}")
        labels = re.search(r"myChartLabelsmyChart0\s*=\s*(\[[^\]]*\])", page)
        values = re.search(r"myChartValuesmyChart0\s*=\s*(\[[^\]]*\])", page)
        ind["rok"] = selected_year(page)
        ind["n"] = 0
        if labels and values:
            if not ind["rok"]:
                raise ValueError(f"Brak potwierdzonego roku dla wskaźnika {ind['id']}")
            names, vals = json.loads(labels.group(1)), json.loads(values.group(1))
            if len(names) != len(vals) or len(names) != 22:
                raise ValueError(f"Niepełny zestaw powiatów: {ind['id']}")
            for powiat, value in zip(names, vals):
                if isinstance(value, float) and value != value:
                    value = None  # NaN nie jest poprawnym JSON-em
                rows.append({**{k: ind[k] for k in ("id", "kategoria", "wskaznik", "rok")}, "jednostki": None, "powiat": powiat, "wartosc": value})
            ind["n"] = len(names)

    # Stabilna kolejność ułatwia redakcyjny przegląd różnic. Wszystkie wartości
    # nadal pochodzą z bieżącego pobrania; usunięte rekordy nie wracają z kopii.
    previous = OUT / "ioss_powiaty.json"
    if previous.exists():
        old = json.loads(previous.read_text())
        rank_rows = {(r["id"], r["powiat"]): i for i, r in enumerate(old["dane"])}
        rank_ids = {r["id"]: i for i, r in enumerate(old["wskazniki"])}
        rows.sort(key=lambda r: rank_rows.get((r["id"], r["powiat"]), len(rank_rows)))
        indicators.sort(key=lambda r: rank_ids.get(r["id"], len(rank_ids)))
    OUT.mkdir(parents=True, exist_ok=True)
    doc = {
        "zrodlo": BASE,
        "pobrano": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "opis": "Wartości wskaźników IOSS (ROPS Kraków) dla 22 powiatów Małopolski, najnowszy rok domyślny na stronie analizy zróżnicowania.",
        "wskazniki": indicators,
        "dane": rows,
    }
    atomic_json(OUT / "ioss_powiaty.json", doc, minimum=3000, count=len(rows), indent=1)
    fields=["id", "kategoria", "wskaznik", "rok", "powiat", "wartosc"]
    atomic_csv(OUT / "ioss_powiaty.csv", fields, [[r[k] for k in fields] for r in rows])
    print(f"{sum(1 for i in indicators if i['n'])} wskaźników z danymi, {len(rows)} wartości")


if __name__ == "__main__":
    main()
