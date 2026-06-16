# Nutrition pipeline data

## `cofid.json` (generated, then committed)

Whole-food nutrition comes from the UK **CoFID** dataset (PHE / McCance &
Widdowson's *Composition of Foods Integrated Dataset*, Crown copyright, Open
Government Licence). The dataset is not redistributed here — generate it once
from the official spreadsheet and commit the resulting `cofid.json`.

1. Download the spreadsheet from gov.uk (search **"Composition of foods
   integrated dataset (CoFID)"**) — the file is
   `McCance_Widdowsons_Composition_of_Foods_Integrated_Dataset_2021.xlsx`
   (~4.4 MB). The download is firewalled from some CI/sandbox networks, so do
   this on a normal machine.
2. Convert it:

   ```sh
   npm run nutrition:cofid -- /path/to/CoFID_2021.xlsx
   ```

   This writes `scripts/nutrition/data/cofid.json` (≈3,300 foods, per-100g
   macros + sodium joined from the inorganics sheet).
3. Spot-check banana / onion / lentils look sane, then commit `cofid.json`.

Until this file exists the pipeline still runs — it just resolves everything via
Open Food Facts instead of preferring CoFID for whole foods.
