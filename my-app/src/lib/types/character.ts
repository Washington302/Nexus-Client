import type {
  Trait,
  RawVisStore,
  PersonalityTrait,
  Reputation,
  BaseCharacteristics,
  ArtType,
} from "./shared";
import type { Wound, FatigueLevel } from "./combat";

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
  type: ArtType;
}

export interface HermeticData {
  house: string;
  wizardsSigil: string;
  domusMagna: string;
  primus: string;
  parens: string;
  covenantOfApprenticeship: string;
  twilightPending: boolean;
  arts: Record<string, MagicalArt>;
  spells?: Record<string, Spell>;
}

export interface Ability {
  name: string;
  exp: number;
  score: number;
  specialty: string;
  category: AbilityCategory;
}

export interface Activity {
  type: string;
  target: string;
  xp: number;
  description: string;
}

export interface ActivitySummary {
  id: string;
  characterId: string;
  year: number;
  season: "SPRING" | "SUMMER" | "AUTUMN" | "WINTER";
  notes: string;
  activities: Activity[];
}

export interface ArsCharacter {
  id: string;
  userId: string;
  gameSystem: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  player: string;
  description: string;
  portraitUrl: string;

  type: CharacterType;
  hermeticData?: HermeticData;

  birthName: string;
  yearBorn: number;
  gender: string;
  raceNationality: string;
  placeOfOrigin: string;
  religion: string;
  titleProfession: string;
  height: number;
  weight: number;
  hair: string;
  eyes: string;
  handedness: string;

  saga: string;
  setting: string;
  currentYear: number;
  campaignId: string;
  covenantId: string;
  covenant: string;

  track: Wound[];
  currentFatigueLevel: FatigueLevel;
  fatiguePenalty: number;
  yearLog: ActivitySummary[];

  characteristics: BaseCharacteristics;

  age: number;
  size: number;
  confidence: number;
  equipment: string;

  virtues: Record<string, Trait>;
  flaws: Record<string, Trait>;
  personalityTraits: PersonalityTrait[];
  reputations: Reputation[];

  warpingPoints: number;
  decrepitudePoints: number;
  agingPoints: Record<string, number>;

  magus: boolean;

  abilities?: Record<string, Ability>;
  visStore?: import('./shared').RawVisStore;
}

export interface EquipmentInventory {
  id: string;
  characterId: string;
  weapons: import("./combat").Weapon[];
  armor: import("./combat").Armor[];
  mundaneEquipmentNotes: string;
}

export interface AbilitiesInventory {
  id: string;
  characterId: string;
  abilities: Record<string, Ability>;
}

export interface Grimoire {
  id: string;
  characterId: string;
  spells: Record<string, Spell>;
}

export interface VisInventory {
  id: string;
  characterId: string;
  visStore: RawVisStore;
}

export interface Laboratories {
  id: string;
  characterId: string;
  covenantId: string;
  laboratoryDetails: import("./laboratory").Laboratory;
}
