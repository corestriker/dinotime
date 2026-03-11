import csv
import json
from pathlib import Path

INPUT_FILES = [
    ("scripts/data/pbdb_data_dino.csv",     "Dinosauria"),
    ("scripts/data/pbdb_data_reptilia.csv", "Reptilia"),
]
TAXA_FILE = "public/data/taxa.json"

# ── Koordinaten pro Art sammeln ───────────────────────────────
print("📂 Lese Koordinaten...")
locations: dict[str, list[list[float]]] = {}

for filepath, group in INPUT_FILES:
    with open(filepath, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row.get("accepted_name", "").strip()
            if not name:
                continue
            try:
                lat = float(row["lat"])
                lng = float(row["lng"])
            except (ValueError, KeyError):
                continue

            if name not in locations:
                locations[name] = []

            # Max 10 Fundorte pro Art speichern (sonst wird JSON riesig)
            if len(locations[name]) < 10:
                locations[name].append([round(lat, 2), round(lng, 2)])

print(f"✅ {len(locations)} Arten mit Koordinaten")

# ── In taxa.json einfügen ─────────────────────────────────────
print("📂 Lade taxa.json...")
with open(TAXA_FILE, encoding="utf-8") as f:
    taxa = json.load(f)

found = 0
for t in taxa:
    coords = locations.get(t["name"], [])
    t["locations"] = coords
    if coords:
        found += 1

print(f"✅ {found} Arten mit Fundorten versehen")

# ── Speichern ─────────────────────────────────────────────────
with open(TAXA_FILE, "w", encoding="utf-8") as f:
    # Minifiziert speichern:
    json.dump(taxa, f, ensure_ascii=False, separators=(',', ':'))

# ── Dateigröße ────────────────────────────────────────────────
size = Path(TAXA_FILE).stat().st_size / 1024 / 1024
print(f"📦 taxa.json: {size:.1f} MB")