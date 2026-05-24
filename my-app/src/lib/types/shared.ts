export type BookType = "SUMMA" | "TRACTATUS";
export type SourceStatus = "REGISTERED" | "CONTESTED" | "UNCLAIMED";
export type TraitMagnitude = "MINOR" | "MAJOR" | "FREE";
export type VisSourceType =
  | "STANDARD"
  | "DEDICATED"
  | "FAERIE"
  | "INFERNAL"
  | "DIVINE"
  | "SPELL_LIKE";
export type ReputationCategory =
  | "HERMETIC"
  | "ACADEMIC"
  | "ARTIST"
  | "HOUSE"
  | "LOCAL"
  | "ECCLESIASTICAL";


// src/types/ars-magica/shared.ts

// String literal lists exactly mirroring the backend CharacteristicType.java enum segments
export type CoreCharacteristicName = 
  | "INTELLIGENCE" 
  | "PERCEPTION" 
  | "STRENGTH" 
  | "STAMINA"
  | "PRESENCE" 
  | "COMMUNICATION" 
  | "DEXTERITY" 
  | "QUICKNESS";

export type BestialCharacteristicName = "CUNNING";

export type LabCharacteristicName = 
  | "REFINEMENT"
  | "GENERAL_QUALITY"
  | "UPKEEP"
  | "SAFETY"
  | "WARPING"
  | "HEALTH"
  | "AESTHETICS";

/**
 * Universal Shared Key present across all classifications.
 * Every entity (Magus, Dragon, or Lab Room) has a Size score.
 */
export interface BaseEntityCharacteristics {
  SIZE: number;
}

/**
 * For Humans/Magi (Companions, Grogs, Magus types)
 */
export interface HumanCharacteristics extends BaseEntityCharacteristics {
  scores: Record<CoreCharacteristicName, number>;
}

/**
 * For Beasts (Animals, Monsters, Spirits)
 * Swaps Intelligence out for Cunning tracking rules
 */
export interface BestialCharacteristics extends BaseEntityCharacteristics {
  scores: Record<Exclude<CoreCharacteristicName, "INTELLIGENCE"> | BestialCharacteristicName, number>;
}

/**
 * For Workspace Environments (Laboratories)
 */
export interface LabCharacteristics extends BaseEntityCharacteristics {
  scores: Record<LabCharacteristicName, number>;
}

export type AllCharacteristicNames =
  | CoreCharacteristicName
  | LabCharacteristicName;

/**
 * Aligns with nexus.api.nexuscore.ArsMagica.Models.Characteristics composition pattern.
 */
export interface Characteristics {
  // Maps directly to the backend's internal dictionary mapping scores
  scores: Record<AllCharacteristicNames, number>;
}

/**
 * Aligns with nexus.api.nexuscore.ArsMagica.Models.Shared.PersonalityTrait
 */
export interface PersonalityTrait {
  name: string; // e.g., "Brave", "Greedy"
  score: number; // Constrained between -10 and 10 on backend
  essential: boolean; // Maps to @JsonProperty("essential")
  temporary: boolean; // Maps to @JsonProperty("temporary")
}

/**
 * Aligns with nexus.api.nexuscore.ArsMagica.Models.Character.Reputation
 */
export interface Reputation {
  name: string; // e.g., "Pious", "Oaths-giver"
  type: ReputationCategory; // Vetted strict categorization list
  score: number; // Public validation tracker (-10 to 10)
  xp: number; // Accumulator tracking score transitions
  scope: string; // e.g., "Order of Hermes", "Local Village"
}
export interface Book {
  title: string;
  author: string;
  subject: string;
  type: BookType;
  level: number;
  quality: number;
  language: string;
  condition: number;
}

export interface TraitEffect {
  tag: string;
  scope: string;
  flatValue: number;
  multiplier: number;
}

export interface Trait {
  title: string;
  type: string;
  magnitude: TraitMagnitude;
  description?: string;
  flaw: boolean;
  active: boolean;
  replaceable: boolean;
  transitionStage?: string;
  effects: TraitEffect[];
}

export interface StandardVis {
  art: string;
  pawns: number;
}

export interface ExtraordinaryVis {
  id: string;
  name: string;
  sourceType: VisSourceType;
  arts: string[];
  pawns: number;
  effect?: {
    description: string;
    level: number;
  };
}

export interface RawVisStore {
  standard: StandardVis[];
  extraordinary: ExtraordinaryVis[];
}

// Keep your old VisSource model too since it handles structural income generation streams
export interface VisSource {
  id: string;
  name: string;
  artType: string;
  pawnsPerYear: number;
  harvestTime: string;
  status: "REGISTERED" | "CONTESTED" | "UNCLAIMED";
}
