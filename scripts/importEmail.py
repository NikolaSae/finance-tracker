# scripts/importEmail.py
import sys
import os
import json
import re
from pathlib import Path
from email import policy
from email.parser import BytesParser
from extract_msg import Message

def obradi_fajl(putanja: str):
    rezultat = {
        'status': 'success',
        'servisni_zahtev': None,
        'telefoni': [],
        'servis': None,
        'reklamacija_odobrena': None,  # Додато поље за статус рекламације
        'datumi': {},
        'greske': []
    }

    try:
        # Прочитај фајл
        if putanja.endswith('.msg'):
            msg = Message(putanja)
            tekst = msg.body
            naslov = msg.subject
        else:
            with open(putanja, 'rb') as f:
                msg = BytesParser(policy=policy.default).parse(f)
                tekst = msg.get_content()
                naslov = msg.get('Subject', '')

        # 1. Сервисни захтев
        sz_match = re.search(r'\b1-\d{12}\b', naslov)
        if sz_match:
            rezultat['servisni_zahtev'] = sz_match.group()

        # 2. Телефонски бројеви
        telefoni = re.findall(r'\b3816\d{8}\b', tekst)
        rezultat['telefoni'] = telefoni

        # 3. Датуми
        datumi_patterns = {
            'pocetak': r'aktivirao\s+uslugu\s+(\d{2}\.\d{2}\.\d{4})',
            'kraj': r'deaktivacija\s+usluge\s+je\s+usledila\s+(\d{2}\.\d{2}\.\d{4})'
        }

        for kljuc, pattern in datumi_patterns.items():
            match = re.search(pattern, tekst, re.IGNORECASE)
            if match:
                rezultat['datumi'][kljuc] = match.group(1)

        # 4. Сервис
        servisi = ["1554APC", "1554GAMES", "1554VIDEO"]
        for servis in servisi:
            if re.search(servis, tekst, re.IGNORECASE):
                rezultat['servis'] = servis
                break

        # 5. Статус рекламације (враћена логика)
        reklamacija_terms = {
            'ne vidimo uslova za storniranje': False,
            'odobravamo povrat novca': True
        }
        
        for term, status in reklamacija_terms.items():
            if re.search(term, tekst, re.IGNORECASE):
                rezultat['reklamacija_odobrena'] = status
                break

    except Exception as e:
        rezultat['status'] = 'error'
        rezultat['greske'].append(str(e))

    return rezultat

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Korišćenje: python importEmail.py <putanja_do_fajla> <output_dir>")
        sys.exit(1)

    ulazni_fajl = sys.argv[1]
    izlazni_dir = sys.argv[2]

    try:
        rezultat = obradi_fajl(ulazni_fajl)
        izlazni_fajl = Path(izlazni_dir) / f"{Path(ulazni_fajl).stem}_result.json"
        
        with open(izlazni_fajl, 'w') as f:
            json.dump(rezultat, f, indent=2, ensure_ascii=False)

        print(json.dumps({
            'status': 'success',
            'poruka': 'Obrada završena',
            'putanja': str(izlazni_fajl)
        }))

    except Exception as e:
        print(json.dumps({
            'status': 'error',
            'poruka': str(e)
        }))
        sys.exit(1)