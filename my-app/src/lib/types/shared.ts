export type BookType = "SUMMA" | "TRACTATUS" | "LAB_TEXTS" | "MUNDANE";
export type SourceStatus = "REGISTERED" | "CONTESTED" | "UNCLAIMED";
export type TraitMagnitude = "MINOR" | "MAJOR" | "FREE";
export type ArtType = "TECHNIQUE" | "FORM" | "ALTERNATIVE";
export type RecoveryOutcome =
  | "FULL_RECOVERY"
  | "IMPROVEMENT"
  | "STABLE"
  | "WORSENING"
  | "CRISIS"
  | "DEATH";

export interface CurrencyConfig {
  label: string;
  abbreviation: string;
  rateToBase: number;
}

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

export type TraitContext =
  | "CASTING" | "SPONT_CASTING" | "RITUAL_CASTING" | "FAST_CASTING"
  | "CERTAMEN" | "PENETRATION"
  | "LAB_INVENTION" | "LAB_LEARNING" | "LAB_FAMILIAR" | "LAB_LONGEVITY"
  | "LAB_ITEMS" | "LAB_VIS_EXTRACTION" | "LAB_TEXTS"
  | "STUDY" | "TEACHING" | "WRITING" | "TRAINING" | "PRACTICE" | "EXPOSURE"
  | "COMBAT_INITIATIVE" | "COMBAT_ATTACK" | "COMBAT_DEFENSE" | "COMBAT_DAMAGE" | "COMBAT_SOAK"
  | "ENCUMBRANCE" | "MOVEMENT" | "FATIGUE_ROLL" | "RECOVERY_ROLL" | "AGING_ROLL"
  | "TWILIGHT_AVOIDANCE" | "TWILIGHT_COMPREHENSION" | "WARPING"
  | "GENERAL" | "SOCIAL";

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
  | "AESTHETICS"
  | "SIZE";

export interface BaseCharacteristics {
  scores: Record<string, number>;
}

export interface HumanCharacteristics extends BaseCharacteristics {
  scores: Record<CoreCharacteristicName, number>;
}

export interface BestialCharacteristics extends BaseCharacteristics {
  scores: Record<Exclude<CoreCharacteristicName, "INTELLIGENCE"> | BestialCharacteristicName, number>;
}

export interface LabCharacteristics extends BaseCharacteristics {
  scores: Record<LabCharacteristicName, number>;
}

export interface PersonalityTrait {
  name: string;
  score: number;
  essential: boolean;
  temporary: boolean;
}

export interface Reputation {
  name: string;
  type: ReputationCategory;
  score: number;
  xp: number;
  scope: string;
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
  limits: TraitContext[];
  oneTime: boolean;
  flatValue: number;
  multiplier: number;
}

export interface Trait {
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

export interface VisSource {
  id: string;
  name: string;
  artType: string;
  pawnsPerYear: number;
  harvestTime: string;
  status: SourceStatus;
}
