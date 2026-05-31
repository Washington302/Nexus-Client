import type { Laboratory } from '$lib/types/laboratory';
import type { ExtraordinaryVis } from '$lib/types/shared';
import type { StandardVis } from '$lib/types';

const standardVis: StandardVis[] = [
  { art: "Creo", pawns: 12 },
  { art: "Corpus", pawns: 4 },
  { art: "Vim", pawns: 20 },
  { art: "Rego", pawns: 5 },
  { art: "Terram", pawns: 8 },
];

const extraordinaryVis: ExtraordinaryVis[] = [
  { id: "vis_ded_001", name: "Mottled Phoenix Feather", sourceType: "DEDICATED", arts: ["Creo", "Ignem"], pawns: 2 },
  { id: "vis_inf_002", name: "Phial of Putrid Black Blood (Vis Prava)", sourceType: "INFERNAL", arts: ["Perdo"], pawns: 3 },
  { id: "vis_fae_003", name: "Never-Melting Icicle of Winter Frost", sourceType: "FAERIE", arts: ["Muto", "Aquam"], pawns: 1 },
  { id: "vis_div_004", name: "Weeping Alabaster Saint Fragment", sourceType: "DIVINE", arts: ["Creo", "Corpus"], pawns: 1 },
  { id: "vis_spl_005", name: "Seed of the Phortos Oak", sourceType: "SPELL_LIKE", arts: ["Creo", "Herbam"], pawns: 1, effect: { description: "Grows a massive oak tree in 6 seconds.", level: 45 } },
];

export const lab: Laboratory = {
  id: "lab_aldric_01",
  ownerName: "Aldric of Bonisagus",
  building: "North Tower",
  floor: 3,
  characteristics: {
    scores: {
      SIZE: 1,
      REFINEMENT: 1,
      GENERAL_QUALITY: 0,
      UPKEEP: 1,
      SAFETY: 2,
      WARPING: 0,
      HEALTH: 1,
      AESTHETICS: -1,
    },
  },
  personalityTraits: [
    { name: "Meticulous", score: 3, essential: false, temporary: false },
  ],
  virtues: {
    Spotless: {

      type: "Supernatural",
      magnitude: "FREE",
      description: "The lab is immaculately maintained; +1 Health.",
      flaw: false,
      active: true,
      replaceable: true,
      effects: [{ tag: "LAB_HEALTH_BONUS", scope: "", limits: [], oneTime: false, flatValue: 1, multiplier: 1 }],
    },
  },
  flaws: {},
  features: [
    { name: "Dedicated notes shelf", isFocusFeature: false, supportedActivities: [] },
    { name: "Specimen cabinet", isFocusFeature: false, supportedActivities: ["Corpus"] },
  ],
  hasFocusFlaw: false,
  activitySpecializations: { Corpus: 2, Creo: 1 },
  artSpecializations: { Corpus: 2 },
  sanctumPermittedNames: ["Aldric of Bonisagus"],
  magicItems: [],
  sanctumChambers: [],
  visStock: {
    standard: standardVis,
    extraordinary: extraordinaryVis,
  },
};
