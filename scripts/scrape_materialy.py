"""Indeks wszystkich raportów i publikacji ROPS. Pliki PDF pozostają u wydawcy.
python3 scripts/scrape_materialy.py --pdf-library /path/to/pypdf.whl
Pobiera PDF do cache poza repo, weryfikuje format i liczbę stron; nie kopiuje danych autorów.
"""
import argparse
import hashlib
import io
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin
from source_fetch import get, fetch, links, atomic_json
BASE='https://rops.krakow.pl'
REPORTS=BASE+'/badania-analizy-raporty/raporty-z-badan'
PUBLICATIONS=BASE+'/innowacje-spoleczne/publikacje-ze-swiata-innowacji'
MAP=BASE+'/mpliki/IS/IWS_20/za._nr_2._Mapa_Wyzwa_Spoecznych.pdf'
CANVAS=BASE+'/mpliki/IS/Moj_folder/INNO_AGH_-_SOCIAL_CANVAS.pdf'
TITLES={'Pocz_kropki_Publikacja_IWS.pdf':'Połącz kropki — publikacja Inkubatora Włączenia Społecznego','Innowacje_spoleczne_dla_dostepnosci.pdf':'Innowacje społeczne dla dostępności','InnMalopolska_przewodnik_po_innowacjach.pdf':'Przewodnik po innowacjach społecznych','InnMalopolska_Guide_to_social_innovations_MIIS_ENG.pdf':'Guide to social innovations','INNO_AGH_-_SOCIAL_CANVAS.pdf':'Kanwa innowacji społecznych INNO AGH'}
TOPICS={'opieka':['opiek','senior','starsz','domy pomocy'],'rodzina':['rodzin','piecz','dziec'],'dostepnosc':['dostęp','niepełnospraw','niezależn'],'wspolpraca':['współprac','organizac','sektor','jst'],'ekonomia':['ekonom','przedsiębior','reintegr','pes',' ps'],'innowacje':['innowac','canvas','kropki'],'wyzwania':['diagnoz','wyzwan','potrzeb','bezdom','przemoc']}

def main():
    args=argparse.ArgumentParser();args.add_argument('--pdf-library');args=args.parse_args()
    if args.pdf_library:sys.path.insert(0,args.pdf_library)
    from pypdf import PdfReader
    now=datetime.now(timezone.utc).isoformat(timespec='seconds')
    cache=Path('/tmp/splot-compliance-source-cache');cache.mkdir(exist_ok=True)
    report_html=get(REPORTS);publication_html=get(PUBLICATIONS)
    entries=[(urljoin(BASE,u),t,'raport',REPORTS) for u,t in links(report_html) if '/pliki-do-pobrania/wpis,' in u]
    entries += [(urljoin(BASE,u),TITLES.get(u.split('/')[-1],t),'publikacja',PUBLICATIONS) for u,t in links(publication_html) if u.lower().endswith('.pdf')]
    entries += [(MAP,'Mapa Wyzwań Społecznych','mapa',MAP),(CANVAS,TITLES['INNO_AGH_-_SOCIAL_CANVAS.pdf'],'kanwa',CANVAS)]
    result=[];seen=set()
    for url,title,kind,collection in entries:
        if url in seen:continue
        seen.add(url)
        if url==CANVAS:kind='kanwa'
        slug=hashlib.sha256(url.encode()).hexdigest()[:16]
        path=cache/(slug+'.pdf')
        raw=fetch(url)
        if not raw.startswith(b'%PDF'):
            candidates=[urljoin(BASE,u) for u,_ in links(raw.decode()) if u.lower().endswith('.pdf')]
            if not candidates:raise RuntimeError('Brak PDF: '+url)
            download=candidates[0];raw=fetch(download)
        else:download=url
        reader=PdfReader(io.BytesIO(raw));pages=len(reader.pages)
        if not pages:raise RuntimeError('Pusty PDF: '+url)
        path.write_bytes(raw)
        year=re.match(r'^(20\d{2})',title)
        topics=[k for k,terms in TOPICS.items() if any(t in title.lower() for t in terms)] or ['wyzwania']
        result.append({'id':slug,'tytul':title,'rodzaj':kind,'rok':int(year.group(1)) if year else None,'url':url,'plik':download,'kolekcja':collection,'strony':pages,'tematy':topics,'jezyk':'en' if 'Guide' in title else 'pl','sha256':hashlib.sha256(raw).hexdigest()})
        print(kind, pages, title, flush=True)
    doc={'pobrano':now,'wydawca':'ROPS Kraków','zakres':'Wszystkie dokumenty PDF znalezione w dwóch kolekcjach organizatora oraz Mapa Wyzwań i kanwa INNO AGH. Indeks zawiera metadane, bez danych osobowych autorów i respondentów.','zrodla':[REPORTS,PUBLICATIONS,MAP,CANVAS],'dokumenty':result}
    atomic_json(Path(__file__).resolve().parent.parent/'data/zrodla/materialy_rops.json',doc,minimum=30,count=len(result))
    print('OK',len(result),'dokumentów')
if __name__=='__main__':main()
