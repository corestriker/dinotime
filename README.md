# 🦕 DinoTime

> **Explore 323 million years of prehistoric life** — an interactive timeline of 11,000+ dinosaurs and reptiles with fossil locations, Wikipedia integration, and silhouettes from PhyloPic.

![DinoTime Preview](https://raw.githubusercontent.com/YOUR-USERNAME/dinotime/main/preview.png)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Data: PBDB](https://img.shields.io/badge/Data-Paleobiology%20Database-blue)](https://paleobiodb.org)

---

## ✨ Features

- **11,112 species** — dinosaurs and reptiles from the Carboniferous to the Quaternary
- **Time range slider** — dual-handle range selector with era color bands (323 Ma → today)
- **Smart search** — autocomplete jumps directly to a species and sets the time range
- **Interactive map** — fossil find locations on a dark CARTO map, with per-species highlighting
- **Species panel** — image (Wikipedia or PhyloPic silhouette), time range, taxonomy, fossil locations, and Wikipedia link
- **Two views** — List view with Dinosauria / Reptilia columns, Map view with side lists
- **Dark mode only** — clean, scientific aesthetic

---

## 🖥️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| Build Tool | [Vite](https://vitejs.dev/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Maps | [Leaflet](https://leafletjs.com/) + [react-leaflet](https://react-leaflet.js.org/) |
| Fonts | [Cinzel Decorative](https://fonts.google.com/specimen/Cinzel+Decorative) + [Inter](https://fonts.google.com/specimen/Inter) |
| Hosting | [GitHub Pages](https://pages.github.com/) |

---

## 🗂️ Data Sources

| Source | Usage | License |
|---|---|---|
| [Paleobiology Database (PBDB)](https://paleobiodb.org) | Species names, time ranges, fossil coordinates | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| [Wikipedia REST API](https://en.wikipedia.org/api/rest_v1/) | Species images and article links | Various (per image) |
| [PhyloPic](https://www.phylopic.org) | Silhouettes for species without Wikipedia images | CC0 / CC BY |
| [CARTO](https://carto.com) | Dark map tiles | © CARTO, © OpenStreetMap contributors |

---

## 🚀 Getting Started

### Prerequisites

- Node.js v20+
- npm v9+
- Python 3.10+ (for data preparation scripts)

### Installation

```bash
# Clone the repository
git clone https://github.com/corestriker/dinotime.git
cd dinotime

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build
```

### Data preparation

The species data is pre-built and lives in `public/data/taxa.json`. If you want to rebuild it from scratch:

```bash
# 1. Download occurrence data from PBDB and place CSVs in scripts/data/
#    - scripts/data/pbdb_data_dino.csv     (Dinosauria occurrences)
#    - scripts/data/pbdb_data_reptilia.csv (Reptilia occurrences)

# 2. Run the main data preparation script
#    (fetches Wikipedia images + PhyloPic silhouettes — takes several hours)
python3 scripts/prepare_data.py

# 3. Add fossil locations from the CSV coordinates
python3 scripts/add_locations.py

# 4. Fix duplicate images (keeps only the most specific species image)
python3 scripts/fix_duplicates.py
```

> ⚠️ The full data pipeline takes **2–4 hours** due to API rate limits. A pre-built `taxa.json` is included in the repository so you don't need to run it.

---

## 📁 Project Structure

```
dinotime/
├── public/
│   └── data/
│       └── taxa.json          # Pre-built species data (11k entries)
├── scripts/
│   ├── data/                  # Raw PBDB CSV files (not committed)
│   ├── prepare_data.py        # Main data pipeline
│   ├── add_locations.py       # Adds fossil coordinates
│   └── fix_duplicates.py      # Removes duplicate images
├── src/
│   ├── components/
│   │   ├── RangeSlider.tsx    # Dual-handle time range slider
│   │   ├── SearchBar.tsx      # Autocomplete species search
│   │   ├── TaxonList.tsx      # Two-column species list
│   │   ├── TaxonPanel.tsx     # Species detail panel
│   │   ├── FossilMap.tsx      # Mini map in panel
│   │   ├── MapView.tsx        # Full map view with side lists
│   │   └── LegalModal.tsx     # Impressum / Privacy / Sources
│   ├── hooks/
│   │   └── useTaxa.ts         # Data loading hook
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces
│   └── App.tsx                # Main app component
└── .github/
    └── workflows/
        └── deploy.yml         # GitHub Pages deployment
```

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/my-feature`
3. **Commit** your changes: `git commit -m 'feat: add my feature'`
4. **Push** to your branch: `git push origin feature/my-feature`
5. **Open** a Pull Request

### Ideas for contributions

- 🗺️ Paleogeographic maps (where continents were during each era)
- 📏 Body size data for species
- 🔍 Improved taxonomy filtering (family, order)
- 🌍 Multilingual support
- 📱 Mobile-optimized layout

### Commit convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```
feat:     new feature
fix:      bug fix
style:    design / CSS changes
data:     data pipeline changes
docs:     documentation
chore:    tooling, dependencies
```

---

## 📄 License

This project is open source under the [MIT License](LICENSE).

Species data is from the [Paleobiology Database](https://paleobiodb.org) and licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) — please cite PBDB if you reuse the data.

---

<p align="center">
  Built with 🦴 and curiosity &nbsp;·&nbsp;
  <a href="https://corestriker.github.io/dinotime/">Live Demo</a>
</p>
