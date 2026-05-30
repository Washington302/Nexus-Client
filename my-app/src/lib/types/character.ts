// src/types/ars-magica/character.ts

import type {
  Trait,
  RawVisStore,
  PersonalityTrait,
  Reputation,
  HumanCharacteristics,
} from "./shared";
import type { Wound, Weapon, Armor, FatigueLevel } from "./combat";
import type { Laboratory } from "./laboratory";


export type CharacterType = "MAGUS" | "COMPANION" | "GROG";
export type AbilityCategory =
  | "ARCANE"
  | "ACADEMIC"
  | "GENERAL"
  | "MARTIAL"
  | "SUPERNATURAL";

export interface Spell {
  name: string;
  technique: string;
  form: string;
  base: number;
  level: number;
  magnitude: number;
  range: string;
  duration: string;
  target: string;
  requisites: Record<string, MagicalArt>;
  masteryXp: number;
  mastery: number;
  notes: string;
}

export interface MagicalArt {
  name: string;
  exp: number;
  score: number;
  type: "TECHNIQUE" | "FORM";
}

export interface HermeticData {
  house: string;
  wizardsSigil: string;
  domusMagna: string;
  primus: string;
  parens: string;
  covenantOfApprenticeship: string;
  twilightPending: boolean;
  laboratory: Laboratory;
  spells: Record<string, Spell>;
  arts: Record<string, MagicalArt>;
  rawVis: RawVisStore; // Personal inventory store tracking standard/extraordinary vis items
}

export interface Ability {
  name: string;
  exp: number;
  score: number;
  specialty: string;
  category: AbilityCategory;
}

export interface Character {
  id: string;
  userId: string;
  campaignId: string;
  name: string;
  player: string;               // ← removed
  description: string;          // ← removed
  portraitUrl: string;          // ← removed
  type: "MAGUS" | "COMPANION" | "GROG";

  // Physical description
  birthName: string;            // ← removed
  yearBorn: number;             // ← removed
  gender: string;               // ← removed
  raceNationality: string;      // ← removed
  placeOfOrigin: string;        // ← removed
  religion: string;             // ← removed
  titleProfession: string;      // ← removed
  height: number;               // ← removed
  weight: number;               // ← removed
  hair: string;                 // ← removed
  eyes: string;                 // ← removed
  handedness: string;           // ← removed

  // Campaign context
  saga: string;                 // ← removed
  setting: string;              // ← removed
  currentYear: number;          // ← removed
  covenantId: string;           // ← removed
  covenant: string;             // ← removed
  age: number;                  // ← removed
  size: number;                 // ← removed
  confidence: number;           // ← removed
  equipment: string;            // ← removed

  characteristics: HumanCharacteristics;
  hermeticData?: HermeticData;
  track: Wound[];
  currentFatigueLevel: FatigueLevel;
  fatiguePenalty: number;
  weapons: Weapon[];
  armor: Armor[];
  abilities: Record<string, Ability>;
  virtues: Record<string, Trait>;
  flaws: Record<string, Trait>;
  agingPoints: Record<string, number>;
  personalityTraits: PersonalityTrait[];
  reputations: Reputation[];
  warpingPoints: number;
  decrepitudePoints: number;

  // Derived combat values
  totalWoundPenalty: number;    // ← removed
  totalLoad: number;            // ← removed
  encumbrance: number;          // ← removed
  totalArmorProtection: number; // ← removed
  equippedDefenseModifier: number; // ← removed
  labUpkeepPoints: number;      // ← removed
  magus: boolean;               // ← removed
}