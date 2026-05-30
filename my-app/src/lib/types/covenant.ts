// src/types/ars-magica/covenant.ts

import type { Book, VisSource, RawVisStore, Trait, Reputation } from "./shared";
import type { Laboratory, MagicItem } from "./laboratory";

export type CovenantSeason = "SPRING" | "SUMMER" | "AUTUMN" | "WINTER";

export interface Covenant {
  id: string;
  userId: string;
  campaignId: string;

  // Core identity
  name: string;
  tribunal: string;
  saga: string;
  season: CovenantSeason;
  foundingYear: number;
  currentYear: number;
  governance: string;
  charter: string;

  // ─── Aura & Regios ──────────────────────────────────────────────────────────
  auraType: string; // e.g. "Magic", "Faerie", "Divine", "Infernal"
  auraLevel: number;
  regioLevels: number[]; // Ascending aura levels within the regio
  aegisLevel: number; // Level of the Aegis of the Hearth currently cast

  // ─── Inhabitants ────────────────────────────────────────────────────────────
  magiIds: string[]; // References to Character documents
  companionIds: string[];
  namedGrogIds: string[];

  // Population counts (unnamed covenfolk)
  grogs: number;
  specialists: number;
  craftsmen: number;
  laborers: number;
  servants: number;
  teamsters: number;
  livingConditionsMagi: number;
  livingConditionsMundane: number;
  // Loyalty tracking
  baseLoyalty: number;
  prevailingLoyaltyScore: number;
  currentLoyaltyPoints: number;

  // ─── Library ────────────────────────────────────────────────────────────────
  books: Book[];
  labTextLevels: number; // Total levels of lab texts held
  castingTabletLevels: number; // Total levels of casting tablets held

  // ─── Vis ────────────────────────────────────────────────────────────────────
  visSources: VisSource[]; // Income streams — where vis comes from
  visStocks: RawVisStore; // Vault inventory — standard & extraordinary

  // ─── Laboratories ───────────────────────────────────────────────────────────
  laboratories: Laboratory[];

  // ─── Finances ───────────────────────────────────────────────────────────────
  // Income
  annualIncomeSilver: number;

  // Fixed yearly expenditures (directly from ArM5 sheet categories)
  buildingsExpenditure: number;
  consumablesExpenditure: number;
  provisionsExpenditure: number;
  wagesExpenditure: number;
  laboratoriesExpenditure: number;
  weaponsArmorExpenditure: number;
  writingMaterialsExpenditure: number;
  miscExpenditure: number; // Catch-all for sundry charges
  magicItems: MagicItem[];
  // Cost savings offset against expenditure
  costSavingsSilver: number;

  // ─── Boons & Hooks ──────────────────────────────────────────────────────────
  boons: Record<string, Trait>;
  hooks: Record<string, Trait>;

  // ─── Reputations ────────────────────────────────────────────────────────────
  reputations: Reputation[];
}
