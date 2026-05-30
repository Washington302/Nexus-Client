import type { CoreCharacteristicName } from "$lib/types/shared";
import { table } from "console";

export interface FrontendAgingResult {
  outcome:
    | "NO_EFFECT"
    | "APPARENT_AGE_INCREASE"
    | "AGING_POINT"
    | "DECREPITUDE_GAINED";
  crisisTriggered: boolean;
  affectedCharacteristic: CoreCharacteristicName | null;

  // The processed mutations that we will send down to save in the database
  updatedDecrepitudePoints: number;
  updatedAgingPoints: Record<string, number>;
  updatedCharacteristics: Record<CoreCharacteristicName, number>;
}

export function evaluateAgingRoll(
  agingTotal: number,
  characteristicChoice: CoreCharacteristicName,
  currentDecrepitudePoints: number,
  agingPoints: Record<string, number>,
  characteristics: Record<CoreCharacteristicName, number>,
): FrontendAgingResult {
  const result: FrontendAgingResult = {
    outcome: "NO_EFFECT",
    crisisTriggered: false,
    affectedCharacteristic: null,
    updatedDecrepitudePoints: currentDecrepitudePoints,
    updatedAgingPoints: { ...agingPoints },
    updatedCharacteristics: { ...characteristics },
  };

  let targetChar: CoreCharacteristicName | null = null;

  // 1. Resolve Outcome Thresholds
  if (agingTotal <= 2) {
    result.outcome = "NO_EFFECT";
  } else if (agingTotal <= 9) {
    result.outcome = "APPARENT_AGE_INCREASE";
  } else if (agingTotal <= 12) {
    result.outcome = "AGING_POINT";
    targetChar = characteristicChoice;
  } else if (agingTotal === 13) {
    result.updatedDecrepitudePoints += 1;
    result.outcome = "DECREPITUDE_GAINED";
    result.crisisTriggered = true;
  } else if (agingTotal <= 21) {
    result.outcome = "AGING_POINT";
    const table: Record<number, CoreCharacteristicName> = {
      14: "QUICKNESS",
      15: "STAMINA",
      16: "PERCEPTION",
      17: "STRENGTH",
      18: "COMMUNICATION",
      19: "DEXTERITY",
      20: "PRESENCE",
      21: "INTELLIGENCE",
    };
    targetChar = table[agingTotal] || "STAMINA";
  } else {
    result.updatedDecrepitudePoints += 1;
    result.outcome = "DECREPITUDE_GAINED";
    result.crisisTriggered = true;
  }

  // 2. Handle Aging Points & Stat Degradation Math internally on Frontend
  if (targetChar) {
    result.affectedCharacteristic = targetChar;
    const currentPoints = (result.updatedAgingPoints[targetChar] || 0) + 1;
    result.updatedAgingPoints[targetChar] = currentPoints;

    const charValue = result.updatedCharacteristics[targetChar] || 0;
    // Rule: If aging points exceed the absolute value of the stat, decrease the score
    if (currentPoints > Math.abs(charValue)) {
      result.updatedCharacteristics[targetChar] = charValue - 1;
      result.updatedAgingPoints[targetChar] = 0; // Reset point pool per rules
    }
  }

  return result;
}
