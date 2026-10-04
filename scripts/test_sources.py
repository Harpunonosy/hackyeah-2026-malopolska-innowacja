import unittest
from unittest.mock import patch
from pathlib import Path
import tempfile
import subprocess
from source_fetch import fetch, atomic_json, links

class SourceTests(unittest.TestCase):
    def test_http_failure_rejected(self):
        with patch('source_fetch.subprocess.run', return_value=subprocess.CompletedProcess([],22,b'Forbidden',b'403')):
            with self.assertRaises(RuntimeError): fetch('https://rops.krakow.pl/test')
    def test_empty_refresh_preserves_previous_copy(self):
        with tempfile.TemporaryDirectory() as d:
            p=Path(d)/'source.json';p.write_text('[1,2]')
            with self.assertRaises(ValueError): atomic_json(p,[],minimum=1)
            self.assertEqual(p.read_text(),'[1,2]')
    def test_discover_links_with_nested_title_and_encoded_url(self):
        self.assertEqual(links('<a href="/a?x=1&amp;y=2"><strong>Raport</strong> 2026</a>'),[('/a?x=1&y=2','Raport 2026')])


class IossYearTest(unittest.TestCase):
    def test_selected_year_is_not_the_first_available_year(self):
        from scrape_ioss import selected_year
        self.assertEqual(selected_year('<option value="2024">2024</option><option value="2023" selected="selected">2023</option>'), '2023')
        self.assertIsNone(selected_year('<option value="2024">2024</option>'))

if __name__=='__main__': unittest.main()
