import json
import os
import random
from datetime import datetime, timedelta

# Data Suppliers and Distributors
entities = [
    {"name": "PT Maju Bersama", "type": "Supplier", "address": "Jakarta"},
    {"name": "CV Berkah Abadi", "type": "Distributor", "address": "Bandung"},
    {"name": "PT Sinar Harapan", "type": "Supplier", "address": "Surabaya"},
    {"name": "UD Jaya Sentosa", "type": "Distributor", "address": "Medan"},
    {"name": "PT Global Niaga", "type": "Supplier", "address": "Semarang"},
    {"name": "CV Makmur Sejahtera", "type": "Distributor", "address": "Yogyakarta"},
    {"name": "PT Prima Utama", "type": "Supplier", "address": "Makassar"},
    {"name": "UD Sumber Rejeki", "type": "Distributor", "address": "Palembang"},
    {"name": "PT Indofood Sukses", "type": "Supplier", "address": "Bekasi"},
    {"name": "CV Tunas Muda", "type": "Distributor", "address": "Denpasar"},
    {"name": "PT Aneka Tambang", "type": "Supplier", "address": "Balikpapan"},
    {"name": "UD Mandiri Jaya", "type": "Distributor", "address": "Banjarmasin"},
    {"name": "PT United Tractors", "type": "Supplier", "address": "Samarinda"},
    {"name": "CV Citra Mandiri", "type": "Distributor", "address": "Pontianak"},
    {"name": "PT Astra International", "type": "Supplier", "address": "Tangerang"}
]

output_dir = "/home/ubuntu/tetubes_app/contracts_data"
os.makedirs(output_dir, exist_ok=True)

contracts = []

for i, entity in enumerate(entities, 1):
    file_id = f"{i:02d}"
    filename = f"DK{file_id}.json"
    
    contract_data = {
        "contract_id": f"DK{file_id}",
        "title": f"Kontrak Kerja Sama - {entity['name']}",
        "party_first": "GOR Management System",
        "party_second": entity['name'],
        "entity_type": entity['type'],
        "object_contract": f"Penyediaan layanan {entity['type'].lower()} untuk fasilitas olahraga",
        "quantity": random.randint(10, 100),
        "unit": "Unit",
        "price": random.randint(1000000, 50000000),
        "payment_type": random.choice(["cash", "TOP"]),
        "top_days": random.choice([30, 60, 90]) if random.random() > 0.5 else None,
        "start_date": (datetime.now()).strftime("%Y-%m-%d"),
        "end_date": (datetime.now() + timedelta(days=365)).strftime("%Y-%m-%d"),
        "status": "active",
        "created_at": datetime.now().isoformat()
    }
    
    with open(os.path.join(output_dir, filename), 'w') as f:
        json.dump(contract_data, f, indent=4)
    
    contracts.append(contract_data)

print(f"Successfully generated 15 contract files in {output_dir}")
