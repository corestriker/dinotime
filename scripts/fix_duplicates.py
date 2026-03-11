import json
from pathlib import Path

TAXA_FILE = "public/data/taxa.json"

print("📂 Lade taxa.json...")
with open(TAXA_FILE, encoding="utf-8") as f:
    taxa = json.load(f)

# ── Erste Art pro Bild-URL merken ─────────────────────────────
# Sortiert nach Name-Länge: kürzere Namen = Hauptgattung kommt zuerst
taxa_sorted = sorted(taxa, key=lambda t: len(t['name']))

seen_urls: set[str] = set()
fixed = 0

for t in taxa_sorted:
    url = t.get('imageUrl')
    if not url or t.get('isPhylopic'):
        continue  # PhyloPic-Bilder sind ok, die teilen sich nicht

    if url in seen_urls:
        # Duplikat – Bild und Wiki-Status entfernen
        t['imageUrl'] = None
        t['hasWiki']  = False
        fixed += 1
    else:
        seen_urls.add(url)

print(f"✅ {fixed} Duplikate bereinigt")

# Ursprüngliche Reihenfolge wiederherstellen (nach start absteigend)
taxa_result = sorted(taxa, key=lambda t: -t['start'])

with open(TAXA_FILE, "w", encoding="utf-8") as f:
    json.dump(taxa_result, f, ensure_ascii=False, separators=(',', ':'))

size = Path(TAXA_FILE).stat().st_size / 1024 / 1024
print(f"📦 taxa.json: {size:.1f} MB")