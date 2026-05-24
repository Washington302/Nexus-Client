// src/types/ars-magica/character.ts

import type {
  Trait,
  RawVisStore,
  PersonalityTrait,
  Reputation,
  Characteristics,
} from "./shared"; // ◄ Added imports
import type { Wound, Weapon, Armor, FatigueLevel } from "./combat";
import type { Laboratory } from "./laboratory";
import type { HumanCharacteristics } from "./shared";

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
  level: number;
  magnitude: number;
  range: string;
  duration: string;
  target: string;
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
  type: "MAGUS" | "COMPANION" | "GROG";
  
  // Matches backend tracking block for physical/mental capabilities
  characteristics: HumanCharacteristics; // ◄ Added characteristics to character
  
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
}
