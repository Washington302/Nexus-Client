// src/types/ars-magica/laboratory.ts

import type { Trait, RawVisStore, LabCharacteristics, PersonalityTrait } from "./shared";

import type { Spell } from "../types";
export type ItemType = 'INVESTED' | 'LESSER' | 'CHARGED';

export interface EnchantedEffect {
  spell: Spell; 
  penetration: number;
  triggerCondition: string;
  hasLimitedUses: boolean;
  usesPerDay: number;
  isChargedItemEffect: boolean;
  remainingCharges: number;
}

export interface MagicItem {
  name: string;
  type: ItemType;
  shape: string;
  material: string;
  visCapacity: number;
  effects: EnchantedEffect[]; // Now perfectly nests the spell schema via composition
  isInstalledInLab: boolean;
  grantedVirtue?: string;
  labBonus: Record<string, number>; // e.g., {"Safety": 1, "Ignem": 2}
  creatorSigil?: string;
  isTalisman: boolean;
}

export interface SanctumChamber {
  name: string;
  purpose: string; // e.g., "Bedchamber", "Library", "Specimen Vault"
  sizeModifier: number;
  description: string;
  isSecured: boolean;
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
