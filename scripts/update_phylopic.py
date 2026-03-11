import json
import time
import requests
from tqdm import tqdm
from pathlib import Path
import csv

# ── Konfiguration ─────────────────────────────────────────────
INPUT_FILES = [
    ("scripts/data/pbdb_data_dino.csv",     "Dinosauria"),
    ("scripts/data/pbdb_data_reptilia.csv", "Reptilia"),
]
TAXA_FILE = "public/data/taxa.json"

# ── PBDB-IDs aus CSVs einlesen ────────────────────────────────
print("📂 Lese PBDB-IDs aus CSVs...")
pbdb_ids: dict[str, str] = {}  # name → accepted_no

for filepath, group in INPUT_FILES:
    with open(filepath, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row.get("accepted_name", "").strip()
            pbdb_id = row.get("accepted_no", "").strip()
            if name and pbdb_id and name not in pbdb_ids:
                pbdb_ids[name] = pbdb_id

print(f"✅ {len(pbdb_ids)} PBDB-IDs gefunden")

# ── Build-Nummer holen ────────────────────────────────────────
print("🔍 Hole PhyloPic Build-Nummer...")
r = requests.get("https://api.phylopic.org/nodes", headers={"User-Agent": "dinotime/1.0"})
build = r.json().get("build")
print(f"   Build: {build}")

# ── PhyloPic per PBDB-ID suchen ───────────────────────────────
def get_phylopic_by_pbdb_id(pbdb_id: str, build: int) -> str | None:
    try:
        # Resolve PBDB-ID → PhyloPic Node
        r = requests.get(
            f"https://api.phylopic.org/resolve/paleobiodb.org/txn/{pbdb_id}",
            params={"build": build},
            timeout=10,
            headers={"User-Agent": "dinotime/1.0"}
        )
        if r.status_code != 200:
            return None

        # Node-UUID aus dem self-Link extrahieren
        node_href = r.json().get("_links", {}).get("self", {}).get("href", "")
        node_uuid = node_href.split("/nodes/")[-1].split("?")[0]
        if not node_uuid:
            return None

        # primaryImage für diesen Node holen
        r2 = requests.get(
            f"https://api.phylopic.org/nodes/{node_uuid}",
            params={"build": build, "embed_primaryImage": "true"},
            timeout=10,
            headers={"User-Agent": "dinotime/1.0"}
        )
        if r2.status_code != 200:
            return None

        img_href = r2.json().get("_links", {}).get("primaryImage", {}).get("href", "")
        if not img_href:
            return None

        # Image-UUID → Raster-URL
        img_uuid = img_href.split("/images/")[-1].split("?")[0]
        r3 = requests.get(
            f"https://api.phylopic.org/images/{img_uuid}",
            params={"build": build},
            timeout=10,
            headers={"User-Agent": "dinotime/1.0"}
        )
        if r3.status_code != 200:
            return None

        raster_files = r3.json().get("_links", {}).get("rasterFiles", [])
        if not raster_files:
            return None

        # Mittlere Größe nehmen (nicht zu groß, nicht zu klein)
        mid = len(raster_files) // 2
        return raster_files[mid].get("href", None)

    except Exception:
        return None

# ── Taxa laden ────────────────────────────────────────────────
print("📂 Lade taxa.json...")
with open(TAXA_FILE, encoding="utf-8") as f:
    taxa = json.load(f)

# Nur die ohne Bild updaten
todo = [t for t in taxa if t["imageUrl"] is None]
print(f"🔍 {len(todo)} Arten ohne Bild → suche PhyloPic Silhouetten\n")

# ── Update-Schleife ───────────────────────────────────────────
found = 0
not_found = 0

for taxon in tqdm(todo, desc="PhyloPic suchen", unit="Art"):
    name    = taxon["name"]
    pbdb_id = pbdb_ids.get(name)

    if not pbdb_id:
        not_found += 1
        continue

    img_url = get_phylopic_by_pbdb_id(pbdb_id, build)
    time.sleep(0.2)

    if img_url:
        taxon["imageUrl"]   = img_url
        taxon["isPhylopic"] = True
        found += 1

# ── Speichern ─────────────────────────────────────────────────
with open(TAXA_FILE, "w", encoding="utf-8") as f:
    json.dump(taxa, f, ensure_ascii=False, indent=2)

print(f"\n✅ Fertig!")
print(f"   🦴 PhyloPic gefunden: {found}")
print(f"   ❌ Nicht gefunden:    {not_found}")
print(f"   📦 taxa.json aktualisiert")