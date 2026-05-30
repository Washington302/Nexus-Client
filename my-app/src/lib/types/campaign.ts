// src/types/ars-magica/campaign.ts

export type CampaignRole = "OWNER" | "STORYTELLER" | "PLAYER" | "SPECTATOR";

const defaultCurrencies = [
  { label: 'Pounds', abbreviation: '£', rateToBase: 1 },
  { label: 'Shillings', abbreviation: 's', rateToBase: 20 },
  { label: 'Pence', abbreviation: 'd', rateToBase: 240 },
]

export type GovernanceType = 
  | "PRIVATE_VIEW" 
  | "SHARED_READ_ONLY" 
  | "COVENANT_JOINT_GOVERNANCE";

/**
 * Embedded inner-class representing membership in a campaign sandbox.
 * Aligns with nexus.api.nexuscore.Generic.Models.Campaign.CampaignMember
 */
export interface CampaignMember {
  userId: string;
  displayName: string;
  role: CampaignRole;
}

/**
 * Structural tracker mapping character permission rules across players.
 * Aligns with nexus.api.nexuscore.Generic.Models.Campaign.SharedResourceMeta
 */
export interface SharedResourceMeta {
  resourceId: string;   // References ArsCharacter.id
  ownerUserId: string;  // Original player creator ID
  governance: GovernanceType;
}

/**
 * Base generic campaign model mirroring your database collection blueprint.
 * Aligns with nexus.api.nexuscore.Generic.Models.Campaign
 */
export interface Campaign {
  id: string;
  name: string;
  gameSystem: string;   // e.g., "ARS_MAGICA"
  ownerUserId: string;  // Master creator
  members: CampaignMember[];
  sharedCharacters: SharedResourceMeta[];
  createdAt: string;    // Maps from Instant audit stamps
  updatedAt: string;    // Maps from Instant audit stamps
}

/**
 * Extends the generic Campaign boundary with game-system specific configurations.
 * Aligns with nexus.api.nexuscore.ArsMagica.Models.ArsMagicaSaga
 */
export interface ArsMagicaSaga extends Campaign {
  covenantId: string;   // Explicit binding link to the shared Covenant record
  tribunalRegion: string; // e.g., "Greater Alps", "Rhine"
  allowHouseMercereVirtues: boolean;
}