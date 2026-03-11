import csv
import json
import time
from pathlib import Path
import requests
from tqdm import tqdm

# Config

INPUT_FILES = [
    ("scripts/data/pbdb_data_dino.csv",     "Dinosauria"),
    ("scripts/data/pbdb_data_reptilia.csv", "Reptilia")
]
OUTPUT_FILE = "public/data/taxa.json"
CACHE_FILE      = "scripts/data/image_cache.json"  # Fortschritt speichern
RATE_LIMIT_WIKI = 0.1   # Sekunden zwischen Wikipedia-Requests
RATE_LIMIT_PYLO = 0.2   # Sekunden zwischen PhyloPic-Requests




# ── Hilfsfunktionen ───────────────────────────────────────────
def get_wikipedia(wiki_slug: str) -> tuple[bool, str | None]:
    """Gibt zurück: (hat_artikel, bild_url_oder_None)"""
    try:
        url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{requests.utils.quote(wiki_slug)}"
        r = requests.get(url, timeout=10, headers={"User-Agent": "dinotime/1.0"})
        if r.status_code == 404:
            return False, None
        if r.status_code == 200:
            data = r.json()
            img = data.get("thumbnail", {}).get("source", None)
            return True, img
    except Exception:
        pass
    return False, None

def get_phylopic(genus: str) -> str | None:
    """Sucht eine Silhouette auf PhyloPic, gibt Bild-URL zurück oder None"""
    try:
        # Schritt 1: Autocomplete → UUID finden
        r = requests.get(
            "https://api.phylopic.org/autocomplete",
            params={"query": genus},
            timeout=10,
            headers={"User-Agent": "dinotime/1.0"}
        )
        if r.status_code != 200:
            return None
        matches = r.json().get("matches", [])
        if not matches:
            return None

        # Schritt 2: Node mit primaryImage laden
        r2 = requests.get(
            "https://api.phylopic.org/nodes",
            params={"filter_name": genus, "embed_primaryImage": "true", "page": 0},
            timeout=10,
            headers={"User-Agent": "dinotime/1.0"}
        )
        if r2.status_code != 200:
            return None
        nodes = r2.json().get("_embedded", {}).get("nodes", [])
        if not nodes:
            return None

        # Schritt 3: Bild-UUID → Raster-URL
        img_href = nodes[0].get("_links", {}).get("primaryImage", {}).get("href", "")
        uuid = img_href.rstrip("/").split("/")[-1]
        if not uuid:
            return None

        r3 = requests.get(
            f"https://api.phylopic.org/images/{uuid}",
            params={"embed_rasterFiles": "true"},
            timeout=10,
            headers={"User-Agent": "dinotime/1.0"}
        )
        if r3.status_code != 200:
            return None
        raster_files = r3.json().get("_links", {}).get("rasterFiles", [])
        if not raster_files:
            return None

        # Größtes verfügbares Bild nehmen
        return raster_files[-1].get("href", None)

    except Exception:
        return None

# read and concatinate files
print("📂 Lese CSV-Dateien…")
taxa = {}

for filepath, group in INPUT_FILES:
    with open(filepath, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row.get("accepted_name", "").strip()
            rank = row.get("accepted_rank", "").strip()

            # only genus and species
            if not name or rank not in ("genus", "species"):
                continue

            # tinmeinformation
            try:
                max_ma = float(row["max_ma"])
                min_ma = float(row["min_ma"])
            except (ValueError, KeyError):
                continue

            # concatinate
            if name not in taxa:
                taxa[name] = {
                    "name": name,
                    "start": max_ma,
                    "end": min_ma,
                    "rank": rank,
                    "group": group,
                    "wiki": name.replace(" ", "_"),
                }
            else:
                taxa[name]["start"] = max(taxa[name]["start"], max_ma)
                taxa[name]["end"]   = min(taxa[name]["end"],   min_ma)

taxa_list = sorted(taxa.values(), key=lambda x: -x["start"])
print(f"✅ {len(taxa_list)} Arten eingelesen")

cache_path = Path(CACHE_FILE)
cache: dict = {}
if cache_path.exists():
    with open(cache_path, encoding="utf-8") as f:
        cache = json.load(f)
    print(f"💾 Cache geladen: {len(cache)} Arten bereits verarbeitet")


# ouput

# ── API-Abfragen ───────────────────────────────────────────────
todo = [t for t in taxa_list if t["name"] not in cache]
print(f"🔍 Noch zu verarbeiten: {len(todo)} Arten\n")

for taxon in tqdm(todo, desc="Bilder suchen", unit="Art"):
    name      = taxon["name"]
    wiki_slug = taxon["wiki"]
    genus     = name.split(" ")[0]

    # 1. Wikipedia
    has_wiki, wiki_img = get_wikipedia(wiki_slug)
    time.sleep(RATE_LIMIT_WIKI)

    # 2. PhyloPic – nur wenn kein Wikipedia-Bild
    phylopic_img = None
    if not wiki_img:
        phylopic_img = get_phylopic(genus)
        time.sleep(RATE_LIMIT_PYLO)

    cache[name] = {
        "hasWiki":    has_wiki,
        "imageUrl":   wiki_img or phylopic_img,
        "isPhylopic": phylopic_img is not None and wiki_img is None,
    }

    # Cache alle 100 Arten speichern
    if len(cache) % 100 == 0:
        with open(cache_path, "w", encoding="utf-8") as f:
            json.dump(cache, f, ensure_ascii=False)

# Cache final speichern
with open(cache_path, "w", encoding="utf-8") as f:
    json.dump(cache, f, ensure_ascii=False)

# ── JSON zusammenbauen ────────────────────────────────────────
print("\n📦 Baue finale JSON…")
Path("public/data").mkdir(parents=True, exist_ok=True)

result = []
for t in taxa_list:
    entry = cache.get(t["name"], {"hasWiki": True, "imageUrl": None, "isPhylopic": False})
    result.append({
        "name":       t["name"],
        "start":      t["start"],
        "end":        t["end"],
        "rank":       t["rank"],
        "group":      t["group"],
        "wiki":       t["wiki"],
        "hasWiki":    entry["hasWiki"],
        "imageUrl":   entry["imageUrl"],
        "isPhylopic": entry["isPhylopic"],
    })

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

# ── Statistik ─────────────────────────────────────────────────
total      = len(result)
has_wiki   = sum(1 for r in result if r["hasWiki"])
has_img    = sum(1 for r in result if r["imageUrl"])
phylopic   = sum(1 for r in result if r["isPhylopic"])
wiki_img   = has_img - phylopic

print(f"\n✅ Fertig! {total} Arten exportiert")
print(f"   📖 Mit Wikipedia-Artikel: {has_wiki} ({has_wiki/total*100:.0f}%)")
print(f"   🖼️  Mit Bild (Wikipedia):  {wiki_img} ({wiki_img/total*100:.0f}%)")
print(f"   🦴  Mit Bild (PhyloPic):   {phylopic} ({phylopic/total*100:.0f}%)")
print(f"   ❌ Ohne Bild:              {total-has_img} ({(total-has_img)/total*100:.0f}%)")