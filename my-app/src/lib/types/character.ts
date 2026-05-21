export type ArtType = 'TECHNIQUE' | 'FORM';
export type CharacterType = 'MAGUS' | 'COMPANION' | 'GROG';
export type AbilityCategory = 'ARCANE' | 'ACADEMIC' | 'GENERAL' | 'MARTIAL' | 'SUPERNATURAL';
export type WoundType = 'LIGHT' | 'MEDIUM' | 'HEAVY' | 'INCAPACITATED' | 'DEAD';
export type FatigueLevel = 'Fresh' | 'Winded' | 'Weary' | 'Tired' | 'Dazed' | 'Unconscious';
export type ReputationType = 'HERMETIC' | 'LOCAL' | 'NOBLE' | 'CHURCH';
export type Complexion = 'SANGUINE' | 'PHLEGMATIC' | 'CHOLERIC' | 'MELANCHOLIC';
export type Coverage = 'FULL' | 'PARTIAL' | 'NONE';
export type ArmorQuality = 'STANDARD' | 'FINE' | 'POOR';
export type CostTier = 'INEXPENSIVE' | 'STANDARD' | 'EXPENSIVE' | 'RICH';
export type EffectMagnitude = 'FREE' | 'MINOR' | 'MAJOR';

export interface Effect {
  tag: string;
  scope: string;
  flatValue: number;
  multiplier: number;
}

export interface VirtueFlaw {
  title: string;
  type: string;
  magnitude: EffectMagnitude;
  description: string;
  transitionStage: string;
  effects: Effect[];
  flaw: boolean;
  replaceable: boolean;
}

export interface Art {
  name: string;
  exp: number;
  score: number;
  type: ArtType;
}

export interface Spell {
  name: string;
  technique: string;
  form: string;
  magnitude: number;
  range: string;
  duration: string;
  target: string;
  masteryXp: number;
  mastery: number;
  notes: string;
}

export interface LabVirtueFlaw extends VirtueFlaw {}

export interface Laboratory {
  id: string;
  name: string;
  building: string;
  floor: number;
  ownerName: string;
  size: number;
  refinement: number;
  generalQuality: number;
  upkeep: number;
  safety: number;
  warping: number;
  health: number;
  aesthetics: number;
  virtues: LabVirtueFlaw[];
  flaws: LabVirtueFlaw[];
  activitySpecializations: Record<string, number>;
  artSpecializations: Record<string, number>;
  personalityTraits: Record<string, number>;
  features: string[];
  baseSafety: number;
  upkeepPoints: number;
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
  spells: Spell[];
  arts: Record<string, Art>;
}

export interface Ability {
  name: string;
  exp: number;
  score: number;
  specialty: string;
  category: AbilityCategory;
}

export interface Characteristics {
  intelligence: number;
  perception: number;
  strength: number;
  stamina: number;
  presence: number;
  communication: number;
  dexterity: number;
  quickness: number;
}

export interface WoundTrack {
  type: WoundType;
  penalty: number;
  maxWounds: number;
  currentWounds: number;
}

export interface PersonalityTrait {
  name: string;
  score: number;
  complexion: Complexion;
  essential: boolean;
  temporary: boolean;
}

export interface Reputation {
  name: string;
  type: ReputationType;
  score: number;
  xp: number;
  scope: string;
}

export interface Weapon {
  name: string;
  ability: string;
  baseInitiativeMod: number;
  baseAttackMod: number;
  baseDefenseMod: number;
  baseDamageMod: number;
  minimumStrength: number;
  load: number;
  cost: string;
  range: number;
  equipped: boolean;
  shield: boolean;
  missile: boolean;
  requiresTwoHands: boolean;
}

export interface Armor {
  id: string;
  materialName: string;
  coverage: Coverage;
  protection: number;
  load: number;
  quality: ArmorQuality;
  perceptionPenalty: number;
  costTier: CostTier;
  purchasePoints: number;
  damageLevels: number;
  targetSize: number;
  worn: boolean;
  magical: boolean;
}

export interface AgingPoints {
  Intelligence: number;
  Stamina: number;
  Quickness: number;
}

export interface Character {
  userId: string;
  gameSystem: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  player: string;
  description: string;
  portraitUrl: string;
  type: CharacterType;
  hermeticData: HermeticData;
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
  covenantId: string;
  covenant: string;
  track: WoundTrack[];
  currentFatigueLevel: FatigueLevel;
  fatiguePenalty: number;
  characteristics: Characteristics;
  weapons: Weapon[];
  armor: Armor[];
  age: number;
  size: number;
  confidence: number;
  equipment: string;
  abilities: Ability[];
  virtues: VirtueFlaw[];
  flaws: VirtueFlaw[];
  personalityTraits: PersonalityTrait[];
  reputations: Reputation[];
  warpingPoints: number;
  decrepitudePoints: number;
  agingPoints: AgingPoints;
  magus: boolean;
  totalWoundPenalty: number;
  totalLoad: number;
  encumbrance: number;
  totalArmorProtection: number;
  equippedDefenseModifier: number;
  labUpkeepPoints: number;
}