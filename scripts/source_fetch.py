"""Kontrolowane pobieranie publicznych źródeł; błąd nigdy nie zastępuje dobrej kopii."""
import csv
import json
import os
import subprocess
import tempfile
import time
from html.parser import HTMLParser
from pathlib import Path

UA = 'Splot-HubMI-source-import/1.0 (public ROPS knowledge snapshot)'

def fetch(url: str) -> bytes:
    r = subprocess.run(['curl', '--fail', '--silent', '--show-error', '--location', '--retry', '2', '--max-time', '45', '--max-filesize', '50000000', '-A', UA, url], capture_output=True)
    time.sleep(0.15)
    if r.returncode or not r.stdout:
        raise RuntimeError(f'Nie pobrano źródła {url}: curl {r.returncode}')
    return r.stdout

def get(url: str) -> str:
    return fetch(url).decode('utf-8', 'strict')

def atomic_json(path: Path, value, minimum: int = 1, count=None, indent=2):
    size = len(value) if count is None else count
    if size < minimum:
        raise ValueError(f'Niekompletny import {path.name}: {size}, wymagane minimum {minimum}. Zachowano poprzednią kopię.')
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, name = tempfile.mkstemp(dir=path.parent, suffix='.tmp')
    try:
        with os.fdopen(fd, 'w', encoding='utf-8') as out:
            json.dump(value, out, ensure_ascii=False, indent=indent, allow_nan=False)
            out.write('\n')
        os.replace(name, path)
    finally:
        if os.path.exists(name): os.unlink(name)

class LinkParser(HTMLParser):
    def __init__(self):
        super().__init__(); self.href=None; self.text=[]; self.items=[]
    def handle_starttag(self, tag, attrs):
        if tag == 'a': self.href=dict(attrs).get('href'); self.text=[]
        if tag == 'img' and self.href: self.text.append(dict(attrs).get('alt',''))
    def handle_data(self, data):
        if self.href: self.text.append(data)
    def handle_endtag(self, tag):
        if tag == 'a' and self.href:
            self.items.append((self.href, ' '.join(' '.join(self.text).split())))
            self.href=None

def links(html: str):
    p=LinkParser(); p.feed(html); return p.items


def atomic_csv(path: Path, header, rows):
    if not rows:
        raise ValueError('Pusty CSV; zachowano poprzednią kopię.')
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, name = tempfile.mkstemp(dir=path.parent, suffix='.tmp')
    try:
        with os.fdopen(fd, 'w', encoding='utf-8', newline='') as out:
            writer=csv.writer(out, lineterminator="\n")
            writer.writerow(header)
            writer.writerows(rows)
        os.replace(name, path)
    finally:
        if os.path.exists(name): os.unlink(name)
