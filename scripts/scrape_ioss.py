"""Pobiera wskaźniki Internetowego Obserwatora Statystyk Społecznych (ROPS Kraków) dla 22 powiatów Małopolski.

Strona /differenceanalysis/<id> zawiera w kodzie tablice JS z nazwami powiatów i wartościami
dla domyślnego (najnowszego) roku. Wynik: data/zrodla/ioss_powiaty.json i .csv.

Użycie: python3 scripts/scrape_ioss.py
"""
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


def get(url: str) -> str:
    r = subprocess.run(["curl", "-sSL", "-A", UA, "--max-time", "30", url], capture_output=True)
    time.sleep(0.3)  # grzecznie wobec serwera ROPS
    return r.stdout.decode("utf-8", "ignore")


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
        years = re.findall(r'<option[^>]*value="(20\d\d)"', page)
        ind["rok"] = years[0] if years else None
        ind["n"] = 0
        if labels and values:
            names, vals = json.loads(labels.group(1)), json.loads(values.group(1))
            for powiat, value in zip(names, vals):
                rows.append({**{k: ind[k] for k in ("id", "kategoria", "wskaznik", "rok")}, "powiat": powiat, "wartosc": value})
            ind["n"] = len(names)

    OUT.mkdir(parents=True, exist_ok=True)
    doc = {
        "zrodlo": BASE,
        "opis": "Wartości wskaźników IOSS (ROPS Kraków) dla 22 powiatów Małopolski, najnowszy rok domyślny na stronie analizy zróżnicowania.",
        "wskazniki": indicators,
        "dane": rows,
    }
    (OUT / "ioss_powiaty.json").write_text(json.dumps(doc, ensure_ascii=False, indent=1), encoding="utf-8")
    with open(OUT / "ioss_powiaty.csv", "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["id", "kategoria", "wskaznik", "rok", "powiat", "wartosc"])
        writer.writeheader()
        writer.writerows(rows)
    print(f"{sum(1 for i in indicators if i['n'])} wskaźników z danymi, {len(rows)} wartości")


if __name__ == "__main__":
    main()
