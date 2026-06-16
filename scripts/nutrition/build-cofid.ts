// One-off: convert the PHE CoFID spreadsheet → committed data/cofid.json.
//
//   npm run nutrition:cofid -- <path-to-CoFID.xlsx>
//
// CoFID (McCance & Widdowson's Composition of Foods Integrated Dataset, gov.uk,
// Open Government Licence) reports every value per 100 g of edible portion, which
// maps straight onto our Per100g. Proximates and sodium live on separate sheets
// joined by Food Code. Column order shifts between editions, so we locate the
// header row and match columns by name fragments rather than fixed indices.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import * as XLSX from "xlsx";

import type { FoodRecord, Per100g } from "./types";

const here = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(here, "data", "cofid.json");

type Cell = string | number | undefined;
type Grid = Cell[][];

/** CoFID sentinels: "Tr" (trace) → 0, "N"/"" (not measured) → undefined. */
function cofNum(v: Cell): number | undefined {
  if (typeof v === "number") return Number.isFinite(v) ? v : undefined;
  if (typeof v !== "string") return undefined;
  const s = v.trim();
  if (s === "" || s.toUpperCase() === "N") return undefined;
  if (s.toLowerCase() === "tr") return 0;
  const n = Number.parseFloat(s.replace(/,/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

function sheetToGrid(wb: XLSX.WorkBook, name: string): Grid {
  return XLSX.utils.sheet_to_json<Cell[]>(wb.Sheets[name], {
    header: 1,
    blankrows: false,
    raw: true,
  });
}

/** Find the sheet whose name contains any of the fragments (case-insensitive). */
function findSheet(wb: XLSX.WorkBook, ...frags: string[]): string | null {
  const lower = wb.SheetNames.map((n) => n.toLowerCase());
  for (const f of frags) {
    const i = lower.findIndex((n) => n.includes(f.toLowerCase()));
    if (i !== -1) return wb.SheetNames[i];
  }
  return null;
}

/** The header row is the first row containing a cell that mentions "Food Name". */
function findHeaderRow(grid: Grid): number {
  for (let i = 0; i < Math.min(grid.length, 8); i++) {
    if (
      grid[i]?.some(
        (c) => typeof c === "string" && /food\s*name/i.test(c),
      )
    ) {
      return i;
    }
  }
  return 0;
}

/** Index of the first header cell matching any fragment; -1 if none. */
function col(header: Cell[], ...frags: string[]): number {
  return header.findIndex(
    (c) =>
      typeof c === "string" &&
      frags.some((f) => c.toLowerCase().includes(f.toLowerCase())),
  );
}

function pick(row: Cell[], idx: number): Cell {
  return idx >= 0 ? row[idx] : undefined;
}

function main() {
  const src = process.argv[2];
  if (!src) {
    console.error(
      "Usage: npm run nutrition:cofid -- <path-to-CoFID.xlsx>\n" +
        "Download from gov.uk: 'Composition of foods integrated dataset (CoFID)'.",
    );
    process.exit(1);
  }

  const wb = XLSX.read(readFileSync(src), { type: "buffer" });

  const proxName = findSheet(wb, "proximates", "proximate") ?? wb.SheetNames[0];
  const prox = sheetToGrid(wb, proxName);
  const ph = findHeaderRow(prox);
  const phead = prox[ph];

  const cCode = col(phead, "food code", "code");
  const cName = col(phead, "food name", "name");
  const cKcal = col(phead, "energy", "kcal");
  const cProtein = col(phead, "protein");
  const cFat = col(phead, "fat");
  const cCarb = col(phead, "carbohydrate");
  const cSugar = col(phead, "total sugars", "sugars");
  const cFibreAoac = col(phead, "aoac fibre", "fibre, aoac", "fibre (aoac)");
  const cFibreEnglyst = col(phead, "englyst fibre", "fibre");
  const cSatFat = col(phead, "satd", "saturated");

  if (cName < 0 || cKcal < 0) {
    console.error(
      `Could not locate Food Name / Energy columns in sheet "${proxName}".`,
    );
    process.exit(1);
  }

  // Sodium lives on the inorganics sheet, keyed by Food Code.
  const sodiumByCode = new Map<string, number>();
  const inorgName = findSheet(wb, "inorganics", "inorganic", "minerals");
  if (inorgName && cCode >= 0) {
    const inorg = sheetToGrid(wb, inorgName);
    const ih = findHeaderRow(inorg);
    // The inorganics sheet leaves the Food Code header blank — it's still in
    // column 0, so fall back to that when the header match fails.
    let iCode = col(inorg[ih], "food code", "code");
    if (iCode < 0) iCode = 0;
    const iSodium = col(inorg[ih], "sodium");
    if (iCode >= 0 && iSodium >= 0) {
      for (let r = ih + 1; r < inorg.length; r++) {
        const code = String(pick(inorg[r], iCode) ?? "").trim();
        const na = cofNum(pick(inorg[r], iSodium));
        if (code && na !== undefined) sodiumByCode.set(code, na);
      }
    }
  }

  const records: FoodRecord[] = [];
  for (let r = ph + 1; r < prox.length; r++) {
    const row = prox[r];
    const name = String(pick(row, cName) ?? "").trim();
    const kcal = cofNum(pick(row, cKcal));
    if (!name || kcal === undefined) continue;

    const code = cCode >= 0 ? String(pick(row, cCode) ?? "").trim() : "";
    const fibre =
      cofNum(pick(row, cFibreAoac)) ?? cofNum(pick(row, cFibreEnglyst)) ?? 0;

    const per100g: Per100g = {
      calories: Math.round(kcal),
      protein_g: cofNum(pick(row, cProtein)) ?? 0,
      carbs_g: cofNum(pick(row, cCarb)) ?? 0,
      fat_g: cofNum(pick(row, cFat)) ?? 0,
      fibre_g: fibre,
      sugar_g: cofNum(pick(row, cSugar)),
      sodium_mg: code ? sodiumByCode.get(code) : undefined,
      saturatedFat_g: cofNum(pick(row, cSatFat)),
    };

    records.push({
      source: "cofid",
      id: code || `cofid:${records.length}`,
      displayName: name,
      per100g,
    });
  }

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(records, null, 2) + "\n");
  console.log(
    `Wrote ${records.length} CoFID foods → ${OUT_PATH}` +
      ` (sodium for ${sodiumByCode.size} via "${inorgName ?? "—"}").`,
  );
}

main();
