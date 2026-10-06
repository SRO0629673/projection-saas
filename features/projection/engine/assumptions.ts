import type { SectorAssumption } from "@/features/projection/types";

type SectorProfile = readonly [
  string,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

const sectorProfiles: readonly SectorProfile[] = [
  ["Trading - General", 0.1, 0.88, 0.03, 0.01, 0.04, 0.1, 0.25, 20, 30, 40],
  ["Trading - Apparel/Textile", 0.1, 0.85, 0.03, 0.01, 0.05, 0.1, 0.3, 20, 35, 45],
  ["Trading - Grocery/Kirana", 0.08, 0.9, 0.03, 0.01, 0.03, 0.1, 0.25, 5, 20, 30],
  ["Trading - Supermarket", 0.1, 0.87, 0.04, 0.02, 0.04, 0.1, 0.35, 3, 25, 35],
  ["Trading - Pharmacy/Medical", 0.1, 0.82, 0.04, 0.01, 0.06, 0.1, 0.3, 15, 40, 45],
  ["Trading - Hardware/Building material", 0.1, 0.84, 0.04, 0.01, 0.06, 0.1, 0.3, 25, 35, 50],
  ["Trading - Electronics/Appliances", 0.1, 0.87, 0.03, 0.01, 0.05, 0.1, 0.3, 15, 30, 45],
  ["Trading - Jewellery", 0.1, 0.9, 0.02, 0.01, 0.04, 0.1, 0.25, 10, 20, 60],
  ["Trading - Auto parts/Spares", 0.1, 0.85, 0.04, 0.01, 0.06, 0.1, 0.3, 30, 35, 45],
  ["Trading - Footwear", 0.1, 0.84, 0.03, 0.01, 0.06, 0.1, 0.3, 15, 35, 45],
  ["Trading - Stationery/Books", 0.1, 0.82, 0.04, 0.01, 0.07, 0.1, 0.3, 15, 30, 45],
  ["Trading - FMCG distribution", 0.1, 0.9, 0.03, 0.01, 0.03, 0.1, 0.3, 20, 15, 25],
  ["Manufacturing - General/Light", 0.12, 0.6, 0.12, 0.05, 0.09, 0.15, 0.65, 45, 40, 30],
  ["Manufacturing - Wood products/Furniture", 0.1, 0.55, 0.13, 0.04, 0.1, 0.15, 0.6, 30, 30, 30],
  ["Manufacturing - Garment/Apparel", 0.12, 0.6, 0.15, 0.03, 0.07, 0.15, 0.55, 45, 40, 30],
  ["Manufacturing - Food/Agro processing", 0.12, 0.65, 0.08, 0.05, 0.08, 0.15, 0.6, 30, 30, 25],
  ["Manufacturing - Bakery/Confectionery", 0.12, 0.45, 0.18, 0.06, 0.13, 0.15, 0.55, 15, 20, 15],
  ["Manufacturing - Engineering/Fabrication", 0.12, 0.58, 0.14, 0.06, 0.1, 0.15, 0.65, 50, 40, 30],
  ["Manufacturing - Plastics/Packaging", 0.12, 0.62, 0.1, 0.07, 0.09, 0.15, 0.65, 45, 40, 30],
  ["Manufacturing - Printing", 0.12, 0.5, 0.15, 0.06, 0.13, 0.15, 0.65, 40, 35, 30],
  ["Manufacturing - Bricks/Cement products", 0.1, 0.5, 0.15, 0.08, 0.1, 0.15, 0.65, 20, 25, 30],
  ["Manufacturing - Chemicals/Cosmetics", 0.12, 0.55, 0.1, 0.06, 0.12, 0.15, 0.6, 45, 40, 30],
  ["Manufacturing - Dairy/Milk products", 0.12, 0.7, 0.07, 0.05, 0.08, 0.15, 0.6, 20, 20, 15],
  ["Manufacturing - Rice/Flour mill", 0.1, 0.8, 0.04, 0.04, 0.06, 0.15, 0.6, 20, 20, 30],
  ["Manufacturing - Steel/Metal fabrication", 0.12, 0.65, 0.1, 0.06, 0.09, 0.15, 0.65, 45, 40, 30],
  ["Services - Professional (CA/Consult)", 0.1, 0, 0.4, 0.02, 0.28, 0.15, 0.7, 30, 15, 0],
  ["Services - General", 0.1, 0.1, 0.35, 0.04, 0.3, 0.15, 0.6, 20, 20, 5],
  ["Services - Food service/Restaurant", 0.12, 0.32, 0.25, 0.06, 0.27, 0.15, 0.6, 3, 20, 8],
  ["Services - Transport/Logistics", 0.1, 0, 0.2, 0.35, 0.2, 0.2, 0.75, 30, 15, 0],
  ["Services - Salon/Beauty", 0.12, 0.15, 0.3, 0.06, 0.24, 0.15, 0.65, 0, 15, 10],
  ["Services - Clinic/Healthcare", 0.12, 0.2, 0.3, 0.05, 0.2, 0.15, 0.65, 10, 20, 15],
  ["Services - Hospital/Nursing home", 0.12, 0.22, 0.28, 0.06, 0.19, 0.15, 0.7, 20, 25, 15],
  ["Services - Hotel/Lodging", 0.1, 0.18, 0.22, 0.1, 0.25, 0.15, 0.7, 10, 20, 10],
  ["Services - Education/Coaching", 0.12, 0.05, 0.45, 0.04, 0.26, 0.15, 0.6, 5, 10, 0],
  ["Services - IT/Software", 0.15, 0, 0.45, 0.03, 0.22, 0.2, 0.55, 45, 15, 0],
  ["Services - Gym/Fitness", 0.1, 0.05, 0.3, 0.08, 0.27, 0.2, 0.7, 0, 15, 5],
  ["Services - Auto repair/Garage", 0.1, 0.35, 0.2, 0.05, 0.2, 0.15, 0.6, 10, 25, 20],
  ["Services - Laundry/Dry cleaning", 0.1, 0.15, 0.25, 0.1, 0.25, 0.2, 0.7, 5, 15, 5],
];

export const DEFAULT_SECTOR_ASSUMPTIONS: Record<string, SectorAssumption> = Object.fromEntries(
  sectorProfiles.map(([sectorName, salesGrowth, materialCostPct, wagesPct, powerFuelPct, overheadPct, depreciation, fixedAssetSharePct, debtorDays, creditorDays, stockDays]) => [
    sectorName,
    {
      sectorName,
      salesGrowth,
      depreciation,
      materialCostPct,
      wagesPct,
      powerFuelPct,
      overheadPct,
      fixedAssetSharePct,
      debtorDays,
      creditorDays,
      stockDays,
    },
  ]),
);

export function getSectorDefaults(sector: string): SectorAssumption {
  return DEFAULT_SECTOR_ASSUMPTIONS[sector] ?? DEFAULT_SECTOR_ASSUMPTIONS["Trading - General"];
}
