// src/types/ars-magica/laboratory.ts

import type { Trait, RawVisStore, LabCharacteristics, PersonalityTrait } from "./shared";
export type LabUsage = 'LIGHT' | 'TYPICAL' | 'HEAVY';
export type ItemType = 'INVESTED' | 'LESSER' | 'CHARGED';
import type { Spell } from "../types";



export interface LabPointCalculations {
  labUsage: LabUsage;
  basePoints: number;      // from calculateLabPoints(upkeepScore)
  adjustedPoints: number;  // basePoints × multiplier
  costInPounds: number;    // adjustedPoints / 10
}

export interface EnchantedEffect {
  spell: Spell; 
  penetration: number;
  triggerCondition: string;
  hasLimitedUses: boolean;
  usesPerDay: number;
  chargedItemEffect: boolean;
  remainingCharges: number;
}

export interface MagicItem {
  name: string;
  type: ItemType;
  shape: string;
  material: string;
  visCapacity: number;
  effects: EnchantedEffect[]; 
  installedInLab: boolean;
  grantedVirtue?: string;
  labBonus: Record<string, number>; // e.g., {"Safety": 1, "Ignem": 2}
  creatorSigil?: string;
  talisman: boolean;
}

export interface SanctumChamber {
  name: string;
  floorAreaSqFt: number; // e.g., "Bedchamber", "Library", "Specimen Vault"
  description: string;
}
export interface LabFeature {
  name: string;
  isFocusFeature: boolean;
  supportedActivities: string[];
}

export interface Laboratory {
  id: string;
  ownerName: string;
  building: string;
  floor: number;
  characteristics: LabCharacteristics;
  virtues: Record<string, Trait>;
  flaws: Record<string, Trait>;
  features: LabFeature[];
  hasFocusFlaw: boolean;
  personalityTraits: PersonalityTrait[];
  activitySpecializations: Record<string, number>;
  artSpecializations: Record<string, number>;
  sanctumPermittedNames: string[];
  magicItems: MagicItem[];
  sanctumChambers: SanctumChamber[];
  visStore: RawVisStore;
}
