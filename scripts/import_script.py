import sys
import io
import os
import pandas as pd
import psycopg2
import hashlib
from datetime import datetime
import logging
# Postavljanje UTF-8 kodiranja za ceo script
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

print("Script is running...")

DB_PARAMS = {
    "dbname": "newdb",
    "user": "postgres",
    "password": "postgres",
    "host": "localhost",
    "port": "5432",
    "options": "-c client_encoding=utf8"
}

FOLDER_PATH = "/xampp-8-telekom/htdocs/finance-tracker/data"

def format_month_for_csv(month_str):
    try:
        month_str = str(month_str).strip()
        if not month_str or '.' not in month_str:
            return month_str
        month, year = month_str.split(".")
        month = month.zfill(2)  # Dodaje nulu ako treba
        return f"{year}-{month}"  # Format YYYY-MM
    except Exception as e:
        print(f"Error formatting month: {e}")
        return month_str


def clean_data(df):
    # Check if dataframe is empty or columns are missing
    if df is None or df.empty:
        print("DataFrame is empty or undefined")
        return df

    # Rename columns to match CSV format
    column_mapping = {
        'Mesec_pruzanja_usluge': 'Mesec pružanja usluge',
        'Proizvod': 'Proizvod',
        'Provajder': 'Provajder'
    }
    df.rename(columns=column_mapping, inplace=True)

    # Check if the required columns exist after renaming
    required_columns = ['Mesec pružanja usluge', 'Proizvod', 'Provajder']
    missing_columns = [col for col in required_columns if col not in df.columns]
    
    if missing_columns:
        print(f"Error: Missing required columns: {missing_columns}")
        print("Existing columns:", df.columns.tolist())  # Debugging info
        return df
    
    print(df.head())  # Debugging info

    # Trim spaces in relevant columns
    df['Mesec pružanja usluge'] = df['Mesec pružanja usluge'].astype(str).str.strip()
    df['Proizvod'] = df['Proizvod'].astype(str).str.replace(r'[\s\u00A0]+', ' ', regex=True).str.strip()
    df['Provajder'] = df['Provajder'].str.strip()

    # Ensure 'Mesec pružanja usluge' is in the correct format (YYYY-MM)
    df['Mesec pružanja usluge'] = df['Mesec pružanja usluge'].apply(lambda x: format_month_for_csv(x))

    # Ensure no values in the 'Mesec pružanja usluge' column are longer than 7 characters
    df['Mesec pružanja usluge'] = df['Mesec pružanja usluge'].apply(lambda x: x[:7] if len(x) > 7 else x)

    return df

# Funkcija za obrada excel fajlova
def generate_unique_filename(file_name):
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    hash_object = hashlib.md5(file_name.encode())
    unique_hash = hash_object.hexdigest()[:8]  # Take first 8 characters of the MD5 hash
    return f"temp_import_{unique_hash}_{timestamp}.csv"

def process_excel_files():
    for file in os.listdir(FOLDER_PATH):
        if "Postpaid_Tracking" in file and file.lower().endswith(('.xls', '.xlsx')):
            file_path = os.path.join(FOLDER_PATH, file)
            print(f"\nProcessing file: {file_path}")

            try:
                xls = pd.ExcelFile(file_path)
            except Exception as e:
                print(f"Error opening {file_path}: {e}")
                continue

            tracking_value = file.split("Postpaid_Tracking_")[1][:10] if "Postpaid_Tracking_" in file else "Unknown"

            for sheet_name in xls.sheet_names:
                print(f"\nProcessing sheet: {sheet_name}")
                try:
                    df = pd.read_excel(xls, sheet_name=sheet_name, header=None)
                except Exception as e:
                    print(f"Error reading sheet {sheet_name}: {e}")
                    continue

                if df.empty:
                    print(f"Sheet {sheet_name} is empty, skipping.")
                    continue

                try:
                    # Clean the data
                    df = clean_data(df)
                    if df.empty:
                        print("Skipping empty dataframe.")
                        continue

                    # Brisanje redova
                    last_row = df[df.iloc[:, 0].notnull()].index[-1]
                    rows_to_delete = list(range(max(0, last_row - 7), last_row + 1))
                    df.drop(index=rows_to_delete, inplace=True)
                    df.reset_index(drop=True, inplace=True)

                    # Filtriranje redova
                    df = df[~df.iloc[:, 0].astype(str).str.contains("Ukupno za mesec:", na=False)]
                    df.reset_index(drop=True, inplace=True)

                    # Brisanje dodatnih redova
                    rows_to_delete = [0, 1, 2, 3, 5]
                    valid_rows = [row for row in rows_to_delete if row in df.index]
                    df.drop(index=valid_rows, inplace=True)
                    df.reset_index(drop=True, inplace=True)

                    # Postavljanje headera
                    df.columns = df.iloc[0]
                    df = df[1:].reset_index(drop=True)

                    # Dodajemo novu kolonu A sa vrednošću iz imena fajla
                    df.insert(len(df.columns), 'Provajder', tracking_value)

                    # Provera specijalnih karaktera
                    problematic_chars = df.map(lambda x: '\u274c' in str(x)).any().any()
                    if problematic_chars:
                        print("⚠️ Warning: Special characters detected!")
                        print(df.map(lambda x: x if '\u274c' in str(x) else None).dropna(how='all'))

                except Exception as e:
                    print(f"Processing error: {e}")
                    continue

                # CSV Export
                try:
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    csv_filename = f"temp_import_{sheet_name}_{timestamp}.csv"
                    csv_file_path = os.path.join(FOLDER_PATH, csv_filename)
                    
                    # Saving the CSV with properly formatted month
                    df['Mesec pružanja usluge'] = df['Mesec pružanja usluge'].apply(lambda x: format_month_for_csv(x))
                    # Mapiranje naziva kolona iz CSV u nazive kolona iz baze
                    column_mapping = {
                        "Proizvod": "Proizvod",
                        "Mesec pružanja usluge": "Mesec_pruzanja_usluge",
                        "Jedinična cena": "Jedinicna_cena",
                        "Broj transakcija": "Broj_transakcija",
                        "Fakturisan iznos": "Fakturisan_iznos",
                        "Fakturisan korigovan iznos": "Fakturisan_korigovan_iznos",
                        "Naplaćen iznos": "Naplacen_iznos",
                        "Kumulativ naplaćenih iznosa": "Kumulativ_naplacenih_iznosa",
                        "Nenaplaćen iznos": "Nenaplacen_iznos",
                        "Nenaplaćen korigovan iznos": "Nenaplacen_korigovan_iznos",
                        "Storniran iznos u tekućem mesecu iz perioda praćenja": "Storniran_iznos_u_tekucem_mesecu_iz_perioda_pracenja",
                        "Otkazan iznos": "Otkazan_iznos",
                        "Kumulativ otkazanih iznosa": "Kumulativ_otkazanih_iznosa",
                        "Iznos za prenos sredstava*": "Iznos_za_prenos_sredstava*",
                        "Provajder": "Provajder"
                    }

                    # Preimenuj kolone
                    df.rename(columns=column_mapping, inplace=True)

                    # Sada možeš sačuvati CSV sa ispravnim nazivima
                    df.to_csv(
                        csv_file_path, 
                        index=False, 
                        header=True, 
                        sep=";", 
                        encoding='utf-8-sig', 
                        errors='replace'
                    )
                    print(f"✅ CSV saved: {csv_file_path}")

                    # PostgreSQL Import
                    import_to_postgresql(csv_file_path)
                    print(f"✅ Successfully imported: {csv_filename}")

                except Exception as e:
                    print(f"❌ Export/Import error: {e}")
                finally:
                    if 'csv_file_path' in locals() and os.path.exists(csv_file_path):
                        #os.remove(csv_file_path)
                        print(f"✅ Temporary file removed: {csv_filename}")



# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')

def import_to_postgresql(csv_path):
    try:
        logging.info(f"Connecting to PostgreSQL database...")
        conn = psycopg2.connect(**DB_PARAMS)
        cur = conn.cursor()

        # Create temporary table with the same structure as the main table
        staging_table = "temp_vas_postpaid"
        logging.info(f"Creating temporary table {staging_table}...")
        cur.execute(f"CREATE TEMP TABLE {staging_table} (LIKE vas_postpaid INCLUDING ALL);")
        conn.commit()

        logging.info(f"Loading data from CSV {csv_path} into staging table...")
        # COPY SQL command to load CSV data into the staging table
        copy_sql = f"""
        COPY {staging_table} (
            "Proizvod", "Mesec_pruzanja_usluge", "Jedinicna_cena",
            "Broj_transakcija", "Fakturisan_iznos", 
            "Fakturisan_korigovan_iznos", "Naplacen_iznos",
            "Kumulativ_naplacenih_iznosa", "Nenaplacen_iznos",
            "Nenaplacen_korigovan_iznos", 
            "Storniran_iznos_u_tekucem_mesecu_iz_perioda_pracenja",
            "Otkazan_iznos", "Kumulativ_otkazanih_iznosa", 
            "Iznos_za_prenos_sredstava*", "Provajder"
        )
        FROM STDIN WITH (
        FORMAT CSV, HEADER, DELIMITER ';', NULL ''
        )
        """
        with open(csv_path, 'r', encoding='utf-8-sig', errors='replace') as f:
            cur.copy_expert(copy_sql, f)
        conn.commit()

        logging.info("Data imported successfully. Now performing UPSERT into the main table.")
        upsert_sql = """
        INSERT INTO vas_postpaid (
            "Proizvod", "Mesec_pruzanja_usluge", "Jedinicna_cena",
            "Broj_transakcija", "Fakturisan_iznos", 
            "Fakturisan_korigovan_iznos", "Naplacen_iznos",
            "Kumulativ_naplacenih_iznosa", "Nenaplacen_iznos",
            "Nenaplacen_korigovan_iznos", 
            "Storniran_iznos_u_tekucem_mesecu_iz_perioda_pracenja",
            "Otkazan_iznos", "Kumulativ_otkazanih_iznosa", 
            "Iznos_za_prenos_sredstava*", "Provajder"
        )
        SELECT 
            "Proizvod", "Mesec_pruzanja_usluge", "Jedinicna_cena",
            "Broj_transakcija", "Fakturisan_iznos", 
            "Fakturisan_korigovan_iznos", "Naplacen_iznos",
            "Kumulativ_naplacenih_iznosa", "Nenaplacen_iznos",
            "Nenaplacen_korigovan_iznos", 
            "Storniran_iznos_u_tekucem_mesecu_iz_perioda_pracenja",
            "Otkazan_iznos", "Kumulativ_otkazanih_iznosa", 
            "Iznos_za_prenos_sredstava*", "Provajder"
        FROM temp_vas_postpaid
        ON CONFLICT ("Proizvod", "Mesec_pruzanja_usluge", "Provajder")
        DO UPDATE SET
            "Jedinicna_cena" = EXCLUDED."Jedinicna_cena",
            "Broj_transakcija" = EXCLUDED."Broj_transakcija",
            "Fakturisan_iznos" = EXCLUDED."Fakturisan_iznos",
            "Fakturisan_korigovan_iznos" = EXCLUDED."Fakturisan_korigovan_iznos",
            "Naplacen_iznos" = EXCLUDED."Naplacen_iznos",
            "Kumulativ_naplacenih_iznosa" = EXCLUDED."Kumulativ_naplacenih_iznosa",
            "Nenaplacen_iznos" = EXCLUDED."Nenaplacen_iznos",
            "Nenaplacen_korigovan_iznos" = EXCLUDED."Nenaplacen_korigovan_iznos",
            "Storniran_iznos_u_tekucem_mesecu_iz_perioda_pracenja" = EXCLUDED."Storniran_iznos_u_tekucem_mesecu_iz_perioda_pracenja",
            "Otkazan_iznos" = EXCLUDED."Otkazan_iznos",
            "Kumulativ_otkazanih_iznosa" = EXCLUDED."Kumulativ_otkazanih_iznosa",
            "Iznos_za_prenos_sredstava*" = EXCLUDED."Iznos_za_prenos_sredstava*";
        """
        
        cur.execute(upsert_sql)
        conn.commit()

        logging.info("Data successfully inserted into the main table.")
    except Exception as e:
        logging.error(f"❌ Error while importing to PostgreSQL: {e}")
    finally:
        if conn:
            cur.close()
            conn.close()
            logging.info("Database connection closed.")



# Pokretanje obrade fajlova
process_excel_files()
