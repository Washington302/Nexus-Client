// src/types/ars-magica/covenant.ts

import type { Book, VisSource, RawVisStore, Trait } from "./shared";
import type { Laboratory } from "./laboratory";

export type CovenantSeason = "SPRING" | "SUMMER" | "AUTUMN" | "WINTER";

export interface Covenant {
  id: string;
  userId: string;
  campaignId: string;
  name: string;
  tribunal: string;
  saga: string;
  season: CovenantSeason;
  
  // Catalogs and Asset lists
  books: Book[];
  visSources: VisSource[];   // Where your income comes from
  visStocks: RawVisStore;    // The actual vault inventory ledger (standard/extraordinary)
  laboratories: Laboratory[];
  boons: Trait[];
  hooks: Trait[];
}