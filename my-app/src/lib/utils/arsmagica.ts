// ─── XP / Score Conversions ───────────────────────────────────────────────────

export function artScoreFromXp(xp: number): number {
  return Math.floor((Math.sqrt(8 * xp + 1) - 1) / 2);
}

export function abilityScoreFromXp(xp: number): number {
  return Math.floor((Math.sqrt(8 * (xp / 5) + 1) - 1) / 2);
}

export function xpForArtScore(score: number): number {
  return score * (score + 1) / 2;
}

export function xpForAbilityScore(score: number): number {
  return score * (score + 1) / 2 * 5;
}

export function xpToNextArtScore(currentXp: number): number {
  const currentScore = artScoreFromXp(currentXp);
  const nextThreshold = xpForArtScore(currentScore + 1);
  return nextThreshold - currentXp;
}

export function xpToNextAbilityScore(currentXp: number): number {
  const currentScore = abilityScoreFromXp(currentXp);
  const nextThreshold = xpForAbilityScore(currentScore + 1);
  return nextThreshold - currentXp;
}

export function masteryScoreFromXp(masteryXp: number): number {
  return abilityScoreFromXp(masteryXp);
}

// ─── Encumbrance ──────────────────────────────────────────────────────────────

export function burdenFromLoad(totalLoad: number): number {
  if (totalLoad <= 0)  return 0;
  if (totalLoad <= 1)  return 1;
  if (totalLoad <= 3)  return 2;
  if (totalLoad <= 6)  return 3;
  if (totalLoad <= 10) return 4;
  if (totalLoad <= 15) return 5;
  if (totalLoad <= 21) return 6;
  if (totalLoad <= 28) return 7;
  if (totalLoad <= 36) return 8;
  if (totalLoad <= 45) return 9;
  if (totalLoad <= 55) return 10;
  let burden = 10;
  while (totalLoad > burden * (burden + 1) / 2) burden++;
  return burden;
}

export function encumbrance(totalLoad: number, strength: number): number {
  const burden = burdenFromLoad(totalLoad);
  if (strength <= 0) return burden;
  return Math.max(0, burden - strength);
}

export function movementRate(quickness: number, enc: number): number {
  return 10 + quickness - enc;
}

export function fatigueTestModifier(stamina: number, enc: number): number {
  return stamina - enc;
}

// ─── Lifting Limits ───────────────────────────────────────────────────────────

export function maxCarryBurden(strength: number): number {
  return strength + 5;
}

export function liftOverHeadBurden(strength: number): number {
  return strength + 5;
}

export function liftOffGroundBurden(strength: number): number {
  return strength + 7;
}

export function pushOrDragBurden(strength: number): number {
  return strength + 12;
}

// ─── Casting Totals ───────────────────────────────────────────────────────────

export function castingScore(
  techScore: number,
  formScore: number,
  stamina: number,
  aura: number
): number {
  return techScore + formScore + stamina + aura;
}

export function formulaicBase(
  techScore: number,
  formScore: number,
  stamina: number,
  aura: number
): number {
  return castingScore(techScore, formScore, stamina, aura);
}

export function ritualBase(
  techScore: number,
  formScore: number,
  stamina: number,
  aura: number,
  artesLiberales: number,
  philosophiae: number
): number {
  return castingScore(techScore, formScore, stamina, aura) + artesLiberales + philosophiae;
}

export function spontFatigueBase(
  techScore: number,
  formScore: number,
  stamina: number,
  aura: number
): number {
  return Math.floor(castingScore(techScore, formScore, stamina, aura) / 2);
}

export function spontNoFatigueBase(
  techScore: number,
  formScore: number,
  stamina: number,
  aura: number
): number {
  return Math.floor(castingScore(techScore, formScore, stamina, aura) / 5);
}

export function ceremonialBase(
  techScore: number,
  formScore: number,
  stamina: number,
  aura: number,
  artesLiberales: number,
  philosophiae: number
): number {
  return castingScore(techScore, formScore, stamina, aura) + artesLiberales + philosophiae;
}

export function ceremonialBaseTrunk(
  castingTotal: number,
  artesLiberales: number,
  philosophiae: number
): number {
  return castingTotal + artesLiberales + philosophiae;
}

export function magicResistance(parmaScore: number, formScore: number): number {
  return parmaScore * 5 + formScore;
}

export function fastCastingBase(quickness: number, finesse: number): number {
  return quickness + finesse;
}

export function multiCastingBase(intelligence: number, finesse: number): number {
  return intelligence + finesse;
}

export function baseTargetingBase(perception: number, finesse: number): number {
  return perception + finesse;
}

export function concentrationBase(stamina: number, concentration: number): number {
  return stamina + concentration;
}

// ─── Lab Calculations ─────────────────────────────────────────────────────────

export function labTotalBase(
  intelligence: number,
  magicTheory: number,
  aura: number
): number {
  return intelligence + magicTheory + aura;
}

export function labTotalFull(
  intelligence: number,
  magicTheory: number,
  aura: number,
  techScore: number,
  formScore: number
): number {
  return labTotalBase(intelligence, magicTheory, aura) + techScore + formScore;
}

export function visExtractedPerSeason(creoVimLabTotal: number): number {
  return Math.ceil(creoVimLabTotal / 10);
}

export function visLimitPerSeason(magicTheory: number): number {
  return magicTheory * 2;
}

export function longevityRitualBonus(creoCorpusLabTotal: number): number {
  return Math.ceil(creoCorpusLabTotal / 5);
}

export function longevityRitualVisCost(age: number): number {
  return Math.ceil(age / 5);
}

export function seasonsToInventSpell(labTotal: number, spellLevel: number): number | null {
  const progress = labTotal - spellLevel;
  if (progress <= 0) return null;
  return Math.ceil(spellLevel / progress);
}

// ─── Combat Base Totals ───────────────────────────────────────────────────────

export function initiativeBase(
  quickness: number,
  weaponInitMod: number,
  enc: number
): number {
  return quickness + weaponInitMod - enc;
}

export function attackBase(
  dexterity: number,
  combatAbility: number,
  weaponAttackMod: number
): number {
  return dexterity + combatAbility + weaponAttackMod;
}

export function defenseBase(
  quickness: number,
  combatAbility: number,
  weaponDefenseMod: number
): number {
  return quickness + combatAbility + weaponDefenseMod;
}

export function damageBase(strength: number, weaponDamageMod: number): number {
  return strength + weaponDamageMod;
}

export function soakBase(stamina: number, armorProtection: number): number {
  return stamina + armorProtection;
}

export function magiSoakBase(
  stamina: number,
  armorProtection: number,
  formBonus: number
): number {
  return soakBase(stamina, armorProtection) + formBonus;
}

export function formBonus(formScore: number): number {
  return Math.ceil(formScore / 5);
}

// ─── Spell / Magnitude ────────────────────────────────────────────────────────

export function magnitudeToLevel(magnitude: number): number {
  if (magnitude <= 1) return 5;
  return magnitude * 5;
}

export function levelToMagnitude(level: number): number {
  if (level <= 5) return 1;
  return Math.ceil(level / 5);
}

export function ritualVisCost(magnitude: number): number {
  return magnitude;
}

export function ritualCastingTime(magnitude: number): string {
  const minutes = magnitude * 15;
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
}

// ─── Upkeep & Covenant Finances ───────────────────────────────────────────────

export function labUpkeepCost(upkeepPoints: number): number {
  return Math.ceil(upkeepPoints / 10);
}

export function buildingsCost(inhabitantPoints: number): number {
  return Math.ceil(inhabitantPoints / 10);
}

export function consumablesCost(inhabitantPoints: number): number {
  return Math.ceil(inhabitantPoints / 10) * 2;
}

export function provisionsCost(inhabitantPoints: number): number {
  return Math.ceil(inhabitantPoints / 10) * 5;
}

export function wagesCost(inhabitantPoints: number): number {
  return Math.ceil(inhabitantPoints / 10) * 2;
}

export function inflationCost(
  buildings: number,
  consumables: number,
  provisions: number,
  labUpkeep: number,
  wages: number
): number {
  return Math.floor((buildings + consumables + provisions + labUpkeep + wages) / 100);
}

export function totalExpenditure(
  buildings: number,
  consumables: number,
  provisions: number,
  labUpkeep: number,
  wages: number
): number {
  const inflation = inflationCost(buildings, consumables, provisions, labUpkeep, wages);
  return buildings + consumables + provisions + labUpkeep + wages + inflation + 1; // +1 pound of Denarius
}

export function netIncome(totalIncome: number, totalExp: number, costSavings: number): number {
  return totalIncome + costSavings - totalExp;
}

// ─── Aging ────────────────────────────────────────────────────────────────────

export function agingRollBase(age: number): number {
  return Math.ceil(age / 10);
}

export function longevityRitualAgeRollModifier(age: number): number {
  return -Math.floor(age / 10);
}