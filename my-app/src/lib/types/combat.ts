// src/types/ars-magica/combat.ts

export type WoundType = "LIGHT" | "MEDIUM" | "HEAVY" | "INCAPACITATED" | "DEAD";
export type FatigueLevel = "Fresh" | "Winded" | "Weary" | "Tired" | "Dazed" | "Unconscious";
export type WeaponCostCategory = "Inexpensive" | "Standard" | "Expensive";
export type Coverage = "FULL" | "PARTIAL" | "NONE";
export type ArmorQuality = "STANDARD" | "FINE" | "POOR";
export type CostTier = "INEXPENSIVE" | "STANDARD" | "EXPENSIVE" | "RICH";

export interface Wound {
  type: WoundType;
  penalty: number;
  maxWounds: number;
  currentWounds: number;
}

export interface Weapon {
  name: string;
  ability: string;            // Skill requirement: e.g., "Brawl", "Single Weapon"
  baseInitiativeMod: number;
  baseAttackMod: number;
  baseDefenseMod: number;
  baseDamageMod: number;
  minimumStrength: number;
  load: number;
  cost: WeaponCostCategory;
  missile: boolean;           // Aligns with @JsonProperty("missile")
  range: number;              // Paces
  requiresTwoHands: boolean;  // Aligns with @JsonProperty("requiresTwoHands")
  shield: boolean;            // Aligns with @JsonProperty("shield")
  equipped: boolean;          // Aligns with @JsonProperty("equipped")
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