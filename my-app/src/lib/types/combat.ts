export type WoundType = "LIGHT" | "MEDIUM" | "HEAVY" | "INCAPACITATED" | "DEAD";
export type FatigueLevel = "Fresh" | "Winded" | "Weary" | "Tired" | "Dazed" | "Unconscious";
export type WeaponCostCategory = "Inexpensive" | "Standard" | "Expensive";
export type Coverage = "PARTIAL" | "FULL";
export type ArmorQuality = "SHODDY" | "STANDARD" | "SUPERIOR" | "EXCELLENT" | "WONDROUS";
export type CostTier = "INEXPENSIVE" | "STANDARD" | "EXPENSIVE";

export interface Wound {
  type: WoundType;
  penalty: number;
  maxWounds: number;
  currentWounds: number;
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
  cost: WeaponCostCategory;
  missile: boolean;
  range: number;
  requiresTwoHands: boolean;
  shield: boolean;
  equipped: boolean;
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
