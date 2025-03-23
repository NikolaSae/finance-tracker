import pandas as pd
import psycopg2
from datetime import datetime

# Putanja do CSV fajla
csv_file = "humanitarni_ugovori.csv"
table_name = "HumanitarniUgovori"

# Učitavanje CSV fajla u DataFrame
df = pd.read_csv(csv_file)

# Funkcija za konverziju formata datuma
def parse_date(date_str):
    try:
        return datetime.strptime(date_str, "%m/%d/%Y").strftime("%Y-%m-%d %H:%M:%S")
    except:
        return None

# Formatiranje datuma
df['datumPocetka'] = df['datumPocetka'].apply(parse_date)
df['datumIstekka'] = df['datumIstekka'].apply(parse_date)

# Povezivanje sa bazom
DB_PARAMS = {
    "dbname": "neondb",
    "user": "neondb_owner",
    "password": "npg_PDfXQm1ylSN8",
    "host": "ep-blue-term-a9wbahi4-pooler.gwc.azure.neon.tech",
    "port": "5432",
    "sslmode": "require"
}
conn = psycopg2.connect(**DB_PARAMS)
cur = conn.cursor()

# Kreiranje tabele ako ne postoji
create_table_query = f"""
CREATE TABLE IF NOT EXISTS {table_name} (
    id SERIAL PRIMARY KEY,
    "kratkiBroj" VARCHAR(20) UNIQUE,
    "humanitarnaOrganizacija" VARCHAR(255),
    ugovor VARCHAR(255),
    "datumPocetka" TIMESTAMP(3),
    "datumIstekka" TIMESTAMP(3),
    telefon VARCHAR(20),
    email VARCHAR(255),
    pib VARCHAR(20),
    racun VARCHAR(50),
    banka VARCHAR(100),
    mb VARCHAR(20),
    "userId" INTEGER,
    "updatedUserId" INTEGER,
    aneks_1 TEXT,
    aneks_2 TEXT,
    aneks_3 TEXT,
    aneks_4 TEXT,
    aneks_5 TEXT,
    aneks_6 TEXT
);
"""
cur.execute(create_table_query)

# Unos podataka iz DataFrame-a u bazu
for _, row in df.iterrows():
    insert_query = f"""
    INSERT INTO "{table_name}" (
        "kratkiBroj", "humanitarnaOrganizacija", ugovor, "datumPocetka", "datumIstekka", 
        racun, banka, pib, mb, telefon, email, "userId", "updatedUserId", 
        aneks_1, aneks_2, aneks_3, aneks_4, aneks_5, aneks_6
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
    """
    cur.execute(insert_query, (
        str(row['kratkiBroj']) if pd.notnull(row['kratkiBroj']) else None,
        row['humanitarnaOrganizacija'],
        row['ugovor'],
        str(row['datumPocetka']) if pd.notnull(row['datumPocetka']) else '1970-01-01',
        row['datumIstekka'],
        row['racun'],
        row['banka'],
        str(row['pib']) if pd.notnull(row['pib']) else None,
        str(row['mb']) if pd.notnull(row['mb']) else None,
        None,  # telefon
        None,  # email
        None,  # userId
        None,  # updatedUserId
        None,  # aneks_1
        None,  # aneks_2
        None,  # aneks_3
        None,  # aneks_4
        None,  # aneks_5
        None   # aneks_6
    ))

# Potvrda promena i zatvaranje konekcije
conn.commit()
cur.close()
conn.close()

print("CSV fajl uspešno importovan u PostgreSQL bazu!")
