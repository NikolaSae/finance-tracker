import sys
import io
import os
import pandas as pd
import psycopg2
import hashlib
from datetime import datetime
import logging

# Set UTF-8 encoding for the script
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Dynamic path setting for CodeSpaces
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
FOLDER_PATH = SCRIPT_DIR
os.makedirs(FOLDER_PATH, exist_ok=True)  # Create data folder if it doesn't exist

print(f"Script is running in: {SCRIPT_DIR}")
print(f"Using data folder: {FOLDER_PATH}")

print("Script is running...")

DB_PARAMS = {
    "dbname": "neondb",
    "user": "neondb_owner",
    "password": "npg_PDfXQm1ylSN8",
    "host": "ep-blue-term-a9wbahi4-pooler.gwc.azure.neon.tech",
    "port": "5432",
    "sslmode": "require"  # Removed 'options' parameter
}

def format_month_for_csv(month_str):
    try:
        month_str = str(month_str).strip()
        if not month_str or '.' not in month_str:
            return month_str
        month, year = month_str.split(".")
        month = month.zfill(2)  # Add leading zero if needed
        return f"{year}-{month}-01"  # Format as YYYY-MM-DD with day as 01
    except Exception as e:
        print(f"Error formatting month: {e}")
        return month_str


def clean_data(df):
    if df is None or df.empty:
        print("DataFrame is empty or undefined")
        return df

    column_mapping = {
        'Mesec_pruzanja_usluge': 'Mesec pružanja usluge',
        'Proizvod': 'Proizvod',
        'Provajder': 'Provajder',
        'Jedinična cena': 'Jedinicna_cena',
        'Broj transakcija': 'Broj_transakcija',
        'Fakturisan iznos': 'Fakturisan_iznos',
        'Fakturisan korigovan iznos': 'Fakturisan_korigovan_iznos',
        'Naplaćen iznos': 'Naplacen_iznos',
        'Kumulativ naplaćenih iznosa': 'Kumulativ_naplacenih_iznosa',
        'Nenaplaćen iznos': 'Nenaplacen_iznos',
        'Nenaplaćen korigovan iznos': 'Nenaplacen_korigovan_iznos',
        'Storniran iznos u tekućem mesecu iz perioda praćenja': 'Storniran_iznos_u_tekucem_mesecu_iz_perioda_pracenja',
        'Otkazan iznos': 'Otkazan_iznos',
        'Kumulativ otkazanih iznosa': 'Kumulativ_otkazanih_iznosa',
        'Iznos za prenos sredstava*': 'Iznos_za_prenos_sredstava_'  # Adjusted the column name
    }
    df.rename(columns=column_mapping, inplace=True)

    required_columns = ['Mesec pružanja usluge', 'Proizvod', 'Provajder']
    missing_columns = [col for col in required_columns if col not in df.columns]
    
    if missing_columns:
        print(f"Error: Missing required columns: {missing_columns}")
        print("Existing columns:", df.columns.tolist())
        return df

    df['Mesec pružanja usluge'] = df['Mesec pružanja usluge'].astype(str).str.strip()
    df['Proizvod'] = df['Proizvod'].astype(str).str.replace(r'[\s\u00A0]+', ' ', regex=True).str.strip()
    df['Provajder'] = df['Provajder'].str.strip()

    # Format the 'Mesec pružanja usluge' to ensure it has the correct date format
    df['Mesec pružanja usluge'] = df['Mesec pružanja usluge'].apply(lambda x: format_month_for_csv(x))
    df['Mesec pružanja usluge'] = df['Mesec pružanja usluge'].apply(lambda x: x[:10] if len(x) > 10 else x)  # Ensure correct format

    return df


def generate_unique_filename(file_name):
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    hash_object = hashlib.md5(file_name.encode())
    unique_hash = hash_object.hexdigest()[:8]  # Take first 8 characters of the MD5 hash
    return f"temp_import_{unique_hash}_{timestamp}.csv"


def process_excel_files():
    for file in os.listdir(FOLDER_PATH):
        if "Postpaid_Tracking" in file and file.lower().endswith(('.xls', '.xlsx')):  # Filter for required files
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

                    # Remove unwanted rows
                    last_row = df[df.iloc[:, 0].notnull()].index[-1]
                    rows_to_delete = list(range(max(0, last_row - 7), last_row + 1))
                    df.drop(index=rows_to_delete, inplace=True)
                    df.reset_index(drop=True, inplace=True)

                    # Filter rows
                    df = df[~df.iloc[:, 0].astype(str).str.contains("Ukupno za mesec:", na=False)]
                    df.reset_index(drop=True, inplace=True)

                    # Remove additional rows
                    rows_to_delete = [0, 1, 2, 3, 5]
                    valid_rows = [row for row in rows_to_delete if row in df.index]
                    df.drop(index=valid_rows, inplace=True)
                    df.reset_index(drop=True, inplace=True)

                    # Set header
                    df.columns = df.iloc[0]
                    df = df[1:].reset_index(drop=True)

                    # Add a new column from the filename
                    df.insert(len(df.columns), 'Provajder', tracking_value)

                    # Check for special characters
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
                    # Mapping column names from CSV to database columns
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
                        "Iznos za prenos sredstava*": "Iznos_za_prenos_sredstava_",  # Fixed the column name here
                        "Provajder": "Provajder"
                    }

                    # Rename columns
                    df.rename(columns=column_mapping, inplace=True)

                    # Save CSV
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
                        print(f"✅ Temporary file removed: {csv_filename}")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')

def import_to_postgresql(csv_path):
    try:
        logging.info(f"Connecting to PostgreSQL database...")
        conn = psycopg2.connect(**DB_PARAMS)
        cur = conn.cursor()

        # Adjusted SQL COPY statement based on the actual CSV column names
        copy_sql = """
        COPY vas_postpaid ("Proizvod", "Mesec_pruzanja_usluge", "Jedinicna_cena", "Broj_transakcija", "Fakturisan_iznos",
        "Fakturisan_korigovan_iznos", "Naplacen_iznos", "Kumulativ_naplacenih_iznosa", "Nenaplacen_iznos",
        "Nenaplacen_korigovan_iznos", "Storniran_iznos_u_tekucem_mesecu_iz_perioda_pracenja", "Otkazan_iznos",
        "Kumulativ_otkazanih_iznosa", "Iznos_za_prenos_sredstava_", "Provajder")
        FROM stdin WITH CSV HEADER DELIMITER AS ';' ENCODING 'UTF8';
        """
        with open(csv_path, 'r', encoding='utf-8-sig') as f:
            cur.copy_expert(sql=copy_sql, file=f)
        conn.commit()
        cur.close()
        conn.close()
        logging.info(f"Data imported successfully to PostgreSQL.")
    except Exception as e:
        logging.error(f"Error during import to PostgreSQL: {e}")

# Run the process
process_excel_files()
