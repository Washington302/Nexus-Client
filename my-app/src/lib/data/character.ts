import type { Character } from '$lib/types/character';

export const character: Character = {
  userId: "user_kaleb",
  gameSystem: "Ars Magica 5th Edition",
  createdAt: "1220-03-14T00:00:00.000Z",
  updatedAt: "1220-03-14T00:00:00.000Z",
  name: "Aldric of Bonisagus",
  player: "Kaleb",
  description: "A methodical Bonisagus researcher whose love of Corpus magic borders on obsession. Quiet in council, relentless in the laboratory.",
  portraitUrl: "",
  type: "MAGUS",
  hermeticData: {
    house: "Bonisagus",
    wizardsSigil: "A faint smell of pine resin accompanies all his spells",
    domusMagna: "Durenmar",
    primus: "Murion",
    parens: "Severin of Bonisagus",
    covenantOfApprenticeship: "Coeris",
    twilightPending: false,
    laboratory: {
      id: "lab_aldric_01",
      name: "The Still Chamber",
      building: "North Tower",
      floor: 3,
      ownerName: "Aldric of Bonisagus",
      size: 0,
      refinement: 2,
      generalQuality: 1,
      upkeep: 0,
      safety: 1,
      warping: 0,
      health: 1,
      aesthetics: 2,
      virtues: [
        {
          title: "Spotless",
          type: "Supernatural",
          magnitude: "FREE",
          description: "The lab is immaculately maintained; +1 Health.",
          transitionStage: "",
          effects: [{ tag: "LAB_HEALTH_BONUS", scope: "", flatValue: 1, multiplier: 1 }],
          flaw: false,
          replaceable: true
        }
      ],
      flaws: [],
      activitySpecializations: { Corpus: 2, Creo: 1 },
      artSpecializations: { Corpus: 2 },
      personalityTraits: { Methodical: 3 },
      features: ["Dedicated notes shelf", "Specimen cabinet"],
      baseSafety: 1,
      upkeepPoints: 2
    },
    spells: [
      {
        name: "The Chirurgeon's Healing Touch",
        technique: "Creo",
        form: "Corpus",
        magnitude: 4,
        range: "Touch",
        duration: "Momentary",
        target: "Individual",
        masteryXp: 15,
        mastery: 1,
        notes: "Heals a Medium wound."
      },
      {
        name: "Sight of the True Form",
        technique: "Intellego",
        form: "Corpus",
        magnitude: 3,
        range: "Per",
        duration: "Momentary",
        target: "Individual",
        masteryXp: 0,
        mastery: 0,
        notes: "Reveals the true human form beneath any transformation."
      }
    ],
    arts: {
      Creo:      { name: "Creo",      exp: 55, score: 10, type: "TECHNIQUE" },
      Intellego: { name: "Intellego", exp: 21, score: 6,  type: "TECHNIQUE" },
      Muto:      { name: "Muto",      exp: 6,  score: 3,  type: "TECHNIQUE" },
      Perdo:     { name: "Perdo",     exp: 1,  score: 1,  type: "TECHNIQUE" },
      Rego:      { name: "Rego",      exp: 10, score: 4,  type: "TECHNIQUE" },
      Animal:    { name: "Animal",    exp: 1,  score: 1,  type: "FORM" },
      Aquam:     { name: "Aquam",     exp: 1,  score: 1,  type: "FORM" },
      Auram:     { name: "Auram",     exp: 1,  score: 1,  type: "FORM" },
      Corpus:    { name: "Corpus",    exp: 91, score: 13, type: "FORM" },
      Herbam:    { name: "Herbam",    exp: 1,  score: 1,  type: "FORM" },
      Ignem:     { name: "Ignem",     exp: 6,  score: 3,  type: "FORM" },
      Imaginem:  { name: "Imaginem",  exp: 1,  score: 1,  type: "FORM" },
      Mentem:    { name: "Mentem",    exp: 6,  score: 3,  type: "FORM" },
      Terram:    { name: "Terram",    exp: 1,  score: 1,  type: "FORM" },
      Vim:       { name: "Vim",       exp: 10, score: 4,  type: "FORM" },
    }
  },
  birthName: "Aldric Brenner",
  yearBorn: 1180,
  gender: "Male",
  raceNationality: "Frankish",
  placeOfOrigin: "Cologne",
  religion: "Catholic (nominal)",
  titleProfession: "Magus, Researcher",
  height: 1.79,
  weight: 74,
  hair: "Dark brown, close-cropped",
  eyes: "Grey",
  handedness: "Right",
  saga: "The Rhine Tribunal",
  setting: "Mythic Europe, 1220 AD",
  currentYear: 1220,
  covenantId: "cov_fengheld",
  covenant: "Fengheld",
  track: [
    { type: "LIGHT",        penalty: -1,  maxWounds: 5, currentWounds: 0 },
    { type: "MEDIUM",       penalty: -3,  maxWounds: 5, currentWounds: 0 },
    { type: "HEAVY",        penalty: -5,  maxWounds: 5, currentWounds: 0 },
    { type: "INCAPACITATED",penalty: -10, maxWounds: 5, currentWounds: 0 },
  ],
  currentFatigueLevel: "Fresh",
  fatiguePenalty: 0,
  characteristics: {
    intelligence: 3,
    perception: 1,
    strength: -1,
    stamina: 0,
    presence: 0,
    communication: 1,
    dexterity: -1,
    quickness: 0
  },
  weapons: [
    {
      name: "Dagger",
      ability: "Single Weapon",
      baseInitiativeMod: -1,
      baseAttackMod: 2,
      baseDefenseMod: 0,
      baseDamageMod: 3,
      minimumStrength: -3,
      load: 1,
      cost: "Inexpensive",
      range: 0,
      equipped: true,
      shield: false,
      missile: false,
      requiresTwoHands: false
    }
  ],
  armor: [
    {
      id: "armor_robes",
      materialName: "Heavy woolen robes",
      coverage: "PARTIAL",
      protection: 0,
      load: 0.5,
      quality: "STANDARD",
      perceptionPenalty: 0,
      costTier: "INEXPENSIVE",
      purchasePoints: 0,
      damageLevels: 0,
      targetSize: 0,
      worn: true,
      magical: false
    }
  ],
  age: 40,
  size: 0,
  confidence: 3,
  equipment: "Writing kit, anatomy texts (4), specimen jars, laboratory notebook",
  abilities: [
    { name: "Magic Theory",      exp: 75, score: 5, specialty: "Corpus",             category: "ARCANE"   },
    { name: "Latin",             exp: 50, score: 4, specialty: "Hermetic usage",      category: "ACADEMIC" },
    { name: "Artes Liberales",   exp: 30, score: 3, specialty: "Rhetoric",            category: "ACADEMIC" },
    { name: "Finesse",           exp: 30, score: 3, specialty: "Precision",           category: "ARCANE"   },
    { name: "Concentration",     exp: 30, score: 3, specialty: "Lab work",            category: "ARCANE"   },
    { name: "Parma Magica",      exp: 30, score: 3, specialty: "Corpus",              category: "ARCANE"   },
    { name: "Philosophiae",      exp: 50, score: 4, specialty: "Natural philosophy",  category: "ACADEMIC" },
    { name: "Penetration",       exp: 5,  score: 2, specialty: "Corpus",              category: "ARCANE"   },
    { name: "Area Lore (Rhine)", exp: 15, score: 2, specialty: "Covenants",           category: "GENERAL"  },
    { name: "Single Weapon",     exp: 15, score: 2, specialty: "Dagger",              category: "MARTIAL"  },
  ],
  virtues: [
    {
      title: "The Gift",
      type: "Special", magnitude: "FREE",
      description: "The ability to work Hermetic magic.",
      transitionStage: "", effects: [], flaw: false, replaceable: false
    },
    {
      title: "Hermetic Magus",
      type: "Social", magnitude: "FREE",
      description: "Member of the Order of Hermes.",
      transitionStage: "",
      effects: [{ tag: "SOCIAL_STATUS", scope: "Hermetic", flatValue: 0, multiplier: 1 }],
      flaw: false, replaceable: false
    },
    {
      title: "Affinity with Corpus",
      type: "Hermetic", magnitude: "MINOR",
      description: "XP in Corpus counts as 1.5× for advancement.",
      transitionStage: "",
      effects: [{ tag: "ART_XP_MULTIPLIER", scope: "Corpus", flatValue: 0, multiplier: 1.5 }],
      flaw: false, replaceable: false
    },
    {
      title: "Puissant Magic Theory",
      type: "Hermetic", magnitude: "MINOR",
      description: "+2 to all Magic Theory totals.",
      transitionStage: "",
      effects: [{ tag: "ABILITY_SCORE_FLAT_BONUS", scope: "Magic Theory", flatValue: 2, multiplier: 1 }],
      flaw: false, replaceable: false
    },
    {
      title: "Elemental Magic",
      type: "Hermetic", magnitude: "MAJOR",
      description: "You have been trained to manipulate the elemental Forms (Aquam, Auram, Ignem, and Terram) as a connected whole rather than four separate Arts.\n\nWhenever you gain experience from a source dedicated to one of these Arts, you gain half the Source Quality (rounded up) in experience points in each of the other three Arts.\n\nFor example, if you studied Ignem from a book with a Source Quality of 13, you would gain 7 experience points in each of Aquam, Auram, and Terram.\n\nDuring character creation, assign all your experience points in Arts. Then assign half the experience points assigned to each of the elemental Forms to each of the other elemental Forms. Do not add these bonus experience points until you have finished calculating all of them.\n\nIf a spell with one of these Forms as its primary Form has another element as a requisite, you use the primary Form to calculate totals, even if the requisite is lower.",
      transitionStage: "",
      effects: [{ tag: "ABILITY_SCORE_FLAT_BONUS", scope: "Magic Theory", flatValue: 2, multiplier: 1 }],
      flaw: false, replaceable: false
    },
    {
      title: "Cyclic Magic (positive)",
      type: "Hermetic", magnitude: "MINOR",
description: "Your magic is attuned to some cycle of nature (solar, lunar, or seasonal).\n\nAt those times, you receive a +3 bonus to all Casting Scores. The bonus also applies to Lab Totals if the positive part of the cycle covers the whole season.\n\nThe cycle must be regular and approved by the storyguide, and the length of time when the bonus applies must equal the time when it does not.",
      transitionStage: "",
      effects: [{ tag: "ABILITY_SCORE_FLAT_BONUS", scope: "Magic Theory", flatValue: 2, multiplier: 1 }],
      flaw: false, replaceable: false
    },
  ],
  flaws: [
    {
      title: "Blatant Gift",
      type: "Hermetic", magnitude: "MAJOR",
      description: "Animals and people react strongly and negatively to his presence.",
      transitionStage: "",
      effects: [{ tag: "PERSONALITY_TRAIT", scope: "mundane social", flatValue: -6, multiplier: 1 }],
      flaw: true, replaceable: false
    },
    {
      title: "Obsessed (Corpus research)",
      type: "Personality", magnitude: "MINOR",
      description: "Prioritizes Corpus research above almost all else.",
      transitionStage: "",
      effects: [{ tag: "PERSONALITY_TRAIT", scope: "Obsessed", flatValue: 3, multiplier: 1 }],
      flaw: true, replaceable: false
    },
  ],
  personalityTraits: [
    { name: "Dedicated",   score: 3, complexion: "SANGUINE",   essential: false, temporary: false },
    { name: "Introverted", score: 2, complexion: "PHLEGMATIC",  essential: false, temporary: false },
    { name: "Methodical",  score: 3, complexion: "MELANCHOLIC", essential: true,  temporary: false },
  ],
  reputations: [
    { name: "Promising Corpus researcher", type: "HERMETIC", score: 1, xp: 5, scope: "Rhine Tribunal" }
  ],
  warpingPoints: 3,
  decrepitudePoints: 0,
  agingPoints: { Intelligence: 0, Stamina: 0, Quickness: 0 },
  magus: true,
  totalWoundPenalty: 0,
  totalLoad: 1.5,
  encumbrance: 0,
  totalArmorProtection: 0,
  equippedDefenseModifier: 0,
  labUpkeepPoints: 2
};