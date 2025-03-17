import pandas as pd
import csv
import glob
import os
import re
import logging
import psycopg2
import sys
sys.stdout.reconfigure(encoding='utf-8')

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')

# DB parameters for PostgreSQL connection
DB_PARAMS = {
    "dbname": "newdb",
    "user": "postgres",
    "password": "postgres",
    "host": "localhost",  # Adjust as necessary
    'port': '5432'        # Adjust as necessary
}

def convert_to_float(val):
    """Konvertuje vrednost u float uklanjajući hiljadarske zareze, ako je moguće."""
    if isinstance(val, str):
        val = val.replace(",", "").strip()
        try:
            return float(val)
        except ValueError:
            logging.warning(f"Could not convert {val} to float.")
            return None
    try:
        return float(val)
    except:
        logging.warning(f"Could not convert {val} to float.")
        return None

def extract_provider(filename):
    """Izvlači 10 karaktera koji dolaze posle 'Servis__MicropaymentMerchantReport_' u nazivu fajla."""
    match = re.search(r"Servis__MicropaymentMerchantReport_(\S{10})", filename)
    return match.group(1) if match else "unknown"

def clean_date(date_val):
    """Popravlja format datuma: uklanja nevidljive znakove i prelamanje redova."""
    if isinstance(date_val, str):
        date_val = date_val.strip()  # Uklanja razmake sa početka i kraja
        date_val = re.sub(r'\s+', ' ', date_val)  # Menja sve vrste razmaka i novih redova sa jednim razmakom
        date_val = date_val.replace(" ", "")  # Briše sve razmake
        date_val = date_val.rstrip('.')  # Uklanja poslednju tačku ako postoji
    return date_val

def process_excel(input_file):
    """Processes a single Excel file and returns a list of records for CSV."""
    df = pd.read_excel(input_file, sheet_name=3, header=None)
    rows = df.fillna("").values.tolist()
    
    if not rows:
        print(f"Fajl {input_file} je prazan.")
        return []

    header = [str(x).strip() for x in rows[0]]
    date_cols = header[3:-1] if header[-1].upper() == "TOTAL" else header[3:]

    current_group = "prepaid"  # Default value in case of empty cells
    output_records = []
    
    # Extract the provider from the filename
    provider = extract_provider(input_file)
    print(f"Extracted provider: {provider}")  # Log the extracted provider

    i = 1
    while i < len(rows):
        row = [str(x).strip() for x in rows[i]]
        if not any(row):
            i += 1
            continue

        # Skip rows where the second column contains "total" (case-insensitive)
        if "total" in row[1].lower():
            print(f"Skipping row due to 'total' in column B: {row}")  # Log skipped rows
            i += 1
            continue

        if i == 1 and ("servis" in row[0].lower() or "izveštaj" in row[0].lower()):
            i += 1
            continue

        for kw in ["prepaid", "postpaid", "total"]:
            if kw in row[0].lower():
                current_group = kw
                i += 1
                break
        else:
            if row[0]:
                service_name = row[0]
                price = convert_to_float(row[1])

                quantity_values = row[3:-1] if header[-1].upper() == "TOTAL" else row[3:]

                if i + 1 < len(rows):
                    next_row = [str(x).strip() for x in rows[i+1]]
                    amount_values = next_row[3:-1] if header[-1].upper() == "TOTAL" else next_row[3:]
                else:
                    amount_values = ["" for _ in range(len(date_cols))]

                for j, date_val in enumerate(date_cols):
                    cleaned_date = clean_date(date_val)  # Clean the date value
                    quantity = convert_to_float(quantity_values[j]) if j < len(quantity_values) else None
                    amount = convert_to_float(amount_values[j]) if j < len(amount_values) else None
                    record = {
                        "Provajder": provider,  # Ensure the provider is correctly added to the record
                        "grupa": current_group,
                        "naziv_servisa": service_name,
                        "cena": price,
                        "date": cleaned_date,
                        "broj_transakcija": quantity,
                        "ukupno": amount
                    }
                    print(f"Adding record: {record}")  # Log the record being added
                    output_records.append(record)
                i += 2
            else:
                i += 1

    return output_records


def process_all_files(folder_path, output_file):
    """Processes all the appropriate files in the folder and merges data into one output file."""
    file_pattern = os.path.join(folder_path, "Servis__MicropaymentMerchantReport_*.xls*")
    files = glob.glob(file_pattern)

    all_data = []
    for file in files:
        print(f"Obradjujem: {file}")
        all_data.extend(process_excel(file))

    if all_data:
        fieldnames = ["Provajder", "grupa", "naziv_servisa", "cena", "date", "broj_transakcija", "ukupno"]
        try:
            with open(output_file, "w", newline="", encoding="utf-8-sig") as fout:
                writer = csv.DictWriter(fout, fieldnames=fieldnames)
                writer.writeheader()  # Write header first
                writer.writerows(all_data)  # Write data rows
                logging.info(f"Processed data saved to {output_file}")
        except Exception as e:
            logging.error(f"❌ Error saving CSV: {e}")
    else:
        logging.warning("No data to process.")



def sanitize_row(row):
    """Sanitize and validate the CSV row data."""
    
    # Sanitize and format the date (dd.mm.yyyy) -> yyyy-mm-dd
    sanitized_date = row.get('date', '').replace('"', '').replace('\n', '').replace('\r', '') if row.get('date') else None
    
    # Make sure date is in valid format, i.e., dd.mm.yyyy -> yyyy-mm-dd
    if sanitized_date and len(sanitized_date) == 10:
        try:
            # Split by dot and reverse to create yyyy-mm-dd format
            formatted_date = "-".join(sanitized_date.split(".")[::-1])  # Reverse dd.mm.yyyy to yyyy-mm-dd
        except Exception as e:
            logging.warning(f"Error formatting date {sanitized_date}: {e}")
            formatted_date = None
    else:
        formatted_date = None

    # Validate numeric fields (cena, broj transakcija, ukupno)
    try:
        cena = float(row.get('cena', 0))
    except ValueError:
        cena = None

    try:
        broj_transakcija = float(row.get('broj_transakcija', 0))
    except ValueError:
        broj_transakcija = None

    try:
        ukupno = float(row.get('ukupno', 0))
    except ValueError:
        ukupno = None

    # Return the sanitized and validated row
    return {
        "Provajder" : row.get("Provajder"),
        'grupa': row.get('grupa'),
        "naziv_servisa" : row.get("naziv_servisa"),
        'cena': cena,
        'date': formatted_date,
        "broj_transakcija" : row.get("broj_transakcija"),
        'ukupno': ukupno
    }

def clean_csv(output_file):
    """Čisti izlazni CSV fajl:
    - Briše redove gde `group` počinje sa `total`
    - Popunjava prazne vrednosti u `group` sa `"prepaid"`
    """
    df = pd.read_csv(output_file)

    # Uklanjanje redova gde `group` počinje sa "total"
    df = df[~df["grupa"].str.lower().str.startswith("total", na=False)]

    # Popunjavanje praznih vrednosti u `group` sa "prepaid"
    df["grupa"] = df["grupa"].fillna("prepaid")
    df.loc[df["grupa"] == "", "grupa"] = "prepaid"

    # Sanitize each row
    sanitized_data = []
    for _, row in df.iterrows():
        sanitized_row = sanitize_row(row)
        sanitized_data.append(sanitized_row)

    # Create a DataFrame from the sanitized data
    sanitized_df = pd.DataFrame(sanitized_data)

    # Ponovno čuvanje CSV-a sa odgovarajućim encoding-om i formatom
    try:
        sanitized_df.to_csv(output_file, index=False, encoding='utf-8-sig')  # Save with utf-8-sig encoding
        logging.info(f"Čišćenje završeno. Finalni podaci su sačuvani u {output_file}")
    except Exception as e:
        logging.error(f"❌ Error saving CSV: {e}")

def import_to_postgresql(csv_path):
    try:
        logging.info(f"Connecting to PostgreSQL database...")
        conn = psycopg2.connect(**DB_PARAMS)
        cur = conn.cursor()

        logging.info("Connection to database established.")

        # Create temporary table with the same structure as the main table
        staging_table = "temp_vas_servisi"
        logging.info(f"Creating temporary table {staging_table}...")
        cur.execute(f"CREATE TEMP TABLE {staging_table} (LIKE vas_servisi INCLUDING ALL);")
        conn.commit()

        logging.info(f"Loading data from CSV {csv_path} into staging table...")
        # COPY SQL command to load CSV data into the staging table
        copy_sql = f"""
        COPY {staging_table} (
            "Provajder", "grupa", "naziv_servisa", "cena", "date", "broj_transakcija", "ukupno"
        )
        FROM STDIN WITH (
        FORMAT CSV, HEADER, DELIMITER ',', NULL ''
        )
        """
        with open(csv_path, 'r', encoding='utf-8-sig', errors='replace') as f:
            cur.copy_expert(copy_sql, f)
        conn.commit()

        logging.info("Data loaded into staging table successfully. Now performing UPSERT into the main table.")

        # UPSERT query to insert or update data in the main table
        upsert_sql = """
        INSERT INTO vas_servisi (
            "Provajder", "grupa", "naziv_servisa", "cena", "date", "broj_transakcija", "ukupno"
        )
        SELECT 
            "Provajder", "grupa", "naziv_servisa", "cena", "date", "broj_transakcija", "ukupno"
        FROM temp_vas_servisi
        ON CONFLICT ("grupa", "naziv_servisa", "Provajder", "date", "cena")
        DO UPDATE SET
            "cena" = EXCLUDED."cena",
            "broj_transakcija" = EXCLUDED."broj_transakcija",
            "ukupno" = EXCLUDED."ukupno"
        RETURNING *;
        """

        cur.execute(upsert_sql)
        conn.commit()

        # Check if any rows were inserted/updated
        updated_rows = cur.fetchall()
        if updated_rows:
            logging.info(f"Data successfully inserted/updated: {len(updated_rows)} rows.")
        else:
            logging.info("No data inserted or updated.")

    except Exception as e:
        logging.error(f"❌ Error while importing to PostgreSQL: {e}")
    finally:
        if conn:
            cur.close()
            conn.close()
            logging.info("Database connection closed.")

# Pokretanje obrade fajlova
folder_path = "E:/xampp-8-telekom/htdocs/finance-tracker/scripts/data/vas/"
output_file = "E:/xampp-8-telekom/htdocs/finance-tracker/scripts/data/output.csv"
process_all_files(folder_path, output_file)

# Čišćenje CSV fajla (ako je potrebno)
clean_csv(output_file)

# Uvoz podataka u PostgreSQL (ako je potrebno)
import_to_postgresql(output_file)
print(f"✅ Successfully imported: {output_file}")
