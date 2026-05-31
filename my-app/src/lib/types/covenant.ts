import type { VisSource, RawVisStore, Trait, Reputation } from "./shared";
import type { Laboratory, MagicItem } from "./laboratory";
import type { Book } from "./shared";

export type CovenantSeason = "SPRING" | "SUMMER" | "AUTUMN" | "WINTER";

export interface Covenant {
  id: string;
  userId: string;
  campaignId: string;

  name: string;
  tribunal: string;
  saga: string;
  season: CovenantSeason;
  foundingYear: number;
  currentYear: number;
  governance: string;
  charter: string;

  auraType: string;
  auraLevel: number;
  regioLevels: number[];
  aegisLevel: number;

  magiIds: string[];
  companionIds: string[];
  namedGrogIds: string[];

  grogs: number;
  specialists: number;
  craftsmen: number;
  laborers: number;
  servants: number;
  teamsters: number;
  livingConditionsMagi: number;
  livingConditionsMundane: number;
  baseLoyalty: number;
  prevailingLoyaltyScore: number;
  currentLoyaltyPoints: number;

  annualIncomeSilver: number;
  buildingsExpenditure: number;
  consumablesExpenditure: number;
  provisionsExpenditure: number;
  wagesExpenditure: number;
  laboratoriesExpenditure: number;
  weaponsArmorExpenditure: number;
  writingMaterialsExpenditure: number;
  miscExpenditure: number;
  costSavingsSilver: number;

  reputations: Reputation[];

  boons: Record<string, Trait>;
  hooks: Record<string, Trait>;

  // Sub-collections (fetched separately from endpoints)
  books?: Book[];
  labTextLevels?: number;
  castingTabletLevels?: number;
  laboratories?: Laboratory[];
  visSources?: VisSource[];
  visStocks?: RawVisStore;
  magicItems?: MagicItem[];
}

export interface LibraryInventory {
  id: string;
  covenantId: string;
  books: Book[];
  labTextLevels: number;
  castingTabletLevels: number;
}

export interface CovenantLaboratories {
  id: string;
  covenantId: string;
  laboratories: Laboratory[];
}

export interface CovenantVisInventory {
  id: string;
  covenantId: string;
  visSources: VisSource[];
  visStocks: RawVisStore;
}

export interface CovenantMagicItemInventory {
  id: string;
  covenantId: string;
  magicItems: MagicItem[];
}
