// src/types/ars-magica/laboratory.ts

import type { Trait, RawVisStore, LabCharacteristics } from "./shared";

export interface LabFeature {
  id: string;
  name: string;
  isFocusFeature: boolean;
  supportedActivities: string[];
}

export interface Laboratory {
  id: string;
  ownerName: string;
  building: string;
  floor: number;
  
  // Strongly typed composition engine matching Laboratory.java!
  characteristics: LabCharacteristics; 
  
  virtues: Trait[];
  flaws: Trait[];
  features: LabFeature[];
  hasFocusFlaw: boolean;
  activitySpecializations: Record<string, number>;
  artSpecializations: Record<string, number>;
  sanctumPermittedNames: string[];
  visStore: RawVisStore;
}