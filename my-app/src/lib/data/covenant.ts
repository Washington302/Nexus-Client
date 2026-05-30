import type { Covenant } from '$lib/types/covenant';

export const covenantData: Covenant = {
  "id": "c6b8a8b2-10f4-4a41-b8ef-f39b1a50f112",
  "userId": "usr_9921_magus_master",
  "campaignId": "camp_alps_saga_2026",
  "name": "Semita Avis",
  "tribunal": "Greater Alps",
  "saga": "The Echoes of Valais",
  "foundingYear": 1195,
  "currentYear": 1220,
  "livingConditionsMagi": 2,
  "livingConditionsMundane": 0,
  "season": "SPRING",
  "governance": "Democratic Council of Magi",
  "auraType": "Magic",
  "magicItems": [
  ],
  "auraLevel": 5,
  "regioLevels": [
    3,
    7
  ],
  "magiIds": [
    "mag_ex_miscellanea_boreas",
    "mag_bonisagus_lucia",
    "mag_tremere_karl"
  ],
  "companionIds": [
    "comp_scholar_jacques",
    "comp_ranger_elena"
  ],
  "namedGrogIds": [
    "grog_shield_marian",
    "grog_scout_hugh",
    "grog_cook_gertrud"
  ],
  "grogs": 12,
  "specialists": 3,
  "craftsmen": 4,
  "laborers": 8,
  "servants": 6,
  "teamsters": 2,
  "baseLoyalty": 50,
  "prevailingLoyaltyScore": 65,
  "currentLoyaltyPoints": 62,
  "books": [
    {
      "title": "The Flight of Birds and Winds",
      "author": "Boreas of Ex Miscellanea",
      "subject": "Auram",
      "type": "SUMMA",
      "level": 14,
      "quality": 11,
      "language": "Latin",
      "condition": 5
    },
    {
      "title": "De Natura Elementorum",
      "author": "Unknown Jerbiton",
      "subject": "Ignem",
      "type": "SUMMA",
      "level": 10,
      "quality": 15,
      "language": "Latin",
      "condition": 4
    }
  ],
  "labTextLevels": 45,
  "castingTabletLevels": 15,
  "laboratories": [
    {
      "id": "lab_boreas_tower",
      "ownerName": "Boreas",
      "building": "The North Spire",
      "floor": 4,
      "characteristics": {
        "scores": {
          "REFINEMENT": 1,
          "GENERAL_QUALITY": 1,
          "UPKEEP": 1,
          "SAFETY": 1,
          "WARPING": 0,
          "HEALTH": 1,
          "AESTHETICS": 1,
          "SIZE": 0
        }
      },
      "personalityTraits": [
        {
          "name": "Breezy",
          "score": 2,
          "essential": true,
          "temporary": false
        }
      ],
      "virtues": {
        "virtue_mt_view": {
          "title": "Mountain View",
          "type": "Site",
          "magnitude": "MINOR",
          "description": "An inspiring view over the high Alpine peaks.",
          "transitionStage": "ESTABLISHED",
          "effects": [
            {
              "tag": "LAB_BONUS_AURA",
              "scope": "Auram",
              "flatValue": 1,
              "multiplier": 0.0
            }
          ],
          "flaw": false,
          "active": true,
          "replaceable": false
        }
      },
      "flaws": {
        "flaw_difficult_access": {
          "title": "Difficult Access",
          "type": "Structure",
          "magnitude": "MINOR",
          "description": "Requires climbing a steep winding staircase up the spire cliffside.",
          "transitionStage": "ESTABLISHED",
          "effects": [
            {
              "tag": "SAFETY_PENALTY",
              "scope": "General",
              "flatValue": -1,
              "multiplier": 0.0
            }
          ],
          "flaw": true,
          "active": true,
          "replaceable": false
        }
      },
      "features": [
        {
          "name": "Windchime Array",
          "supportedActivities": [
            "Experimentation",
            "Auram Spells"
          ],
          "isFocusFeature": true
        }
      ],
      "hasFocusFlaw": false,
      "activitySpecializations": {
        "enchanment": 1,
        "spellPreparation": 2
      },
      "artSpecializations": {
        "auram": 2,
        "animal": 1
      },
      "sanctumPermittedNames": [
        "Boreas",
        "Marian"
      ],
      visStore: {
        standard: [
          { art: "Auram", pawns: 5 },
          { art: "Vim", pawns: 3 }
        ],
        extraordinary: []
    },
      "magicItems": [
        {
          "name": "The Feathered Ring",
          "type": "INVESTED",
          "shape": "Ring",
          "material": "Silver-plated Bronze",
          "visCapacity": 4,
          "effects": [
            {
              "spell": {
                "name": "Rise of the Warm Zephyr",
                "technique": "Rego",
                "form": "Auram",
                "base": 4,
                "magnitude": 3,
                "level": 15,
                "range": "Personal",
                "duration": "Concentration",
                "target": "Individual",
                "masteryXp": 0,
                "mastery": 0,
                "requisites": {},
                "notes": "Allows the wearer to gently float vertically upwards."
              },
              "penetration": 0,
              "triggerCondition": "Rubbing the feather engraving thrice",
              "hasLimitedUses": false,
              "usesPerDay": 0,
              "remainingCharges": 0,
              "chargedItemEffect": false
            }
          ],
          "grantedVirtue": "None",
          "labBonus": {},
          "creatorSigil": "A tiny swirling gust engraving",
          "talisman": false,
          "installedInLab": false
        }
      ],
      "sanctumChambers": [
        {
          "floorAreaSqFt": 250,
          "description": "A sparsely decorated room containing an iron bedframe and heavy woolen drapes.",
          "name": "Boreas Sleeping Quarters"
        }
      ]
    }
  ],
  "visSources": [
    {
      "id": "src_cliff_feathers",
      "name": "The Eagle's Roost Cliff",
      "artType": "Auram",
      "pawnsPerYear": 4,
      "harvestTime": "Autumn Equinox",
      "status": "REGISTERED"
    },
    {
      "id": "src_frozen_tarn",
      "name": "The Tarn of Blue Ice",
      "artType": "Aquam",
      "pawnsPerYear": 2,
      "harvestTime": "Midwinter Solstice",
      "status": "REGISTERED"
    }
  ],
  "visStocks": {
    "standard": [
      {
        "art": "Auram",
        "pawns": 14
      },
      {
        "art": "Creo",
        "pawns": 6
      },
      {
        "art": "Vim",
        "pawns": 8
      }
    ],
    "extraordinary": [
      {
        "id": "ex_vis_storm_glass",
        "name": "Lightning-Struck Obsidian Fragment",
        "sourceType": "DEDICATED",
        "arts": [
          "Ignem",
          "Auram"
        ],
        "pawns": 3,
        "effect": {
          "description": "Double casting stability bonuses when spent on weather magic.",
          "level": 3
        }
      }
    ]
  },
  "annualIncomeSilver": 240,
  "buildingsExpenditure": 45,
  "consumablesExpenditure": 30,
  "provisionsExpenditure": 75,
  "wagesExpenditure": 60,
  "costSavingsSilver": 20,
  "laboratoriesExpenditure": 15,
  "weaponsArmorExpenditure": 10,
  "writingMaterialsExpenditure": 5,
  "miscExpenditure": 0,
  "reputations": [
    {
      "name": "Defenders of the Pass",
      "type": "LOCAL",
      "score": 2,
      "xp": 14,
      "scope": "Local Alpine Peasants"
    }
  ],
  "aegisLevel": 20,
  "charter": "We, the Magi of Semita Avis, pledge mutual defense, shared custody of the libraries, and an equal division of the harvested vis windfall...",
  "boons": {
    "boon_healthy_feature": {
      "title": "Healthy Environment",
      "type": "Site",
      "magnitude": "MINOR",
      "description": "Fresh, crisp alpine wind makes the community resilient against natural illnesses.",
      "transitionStage": "PERMANENT",
      "effects": [
        {
          "tag": "HEALTH_MODIFIER",
          "scope": "Covenant-wide",
          "flatValue": 1,
          "multiplier": 0.0
        }
      ],
      "flaw": false,
      "active": true,
      "replaceable": false
    }
  },
  "hooks": {
    "hook_isolated": {
      "title": "Isolated Location",
      "type": "Site",
      "magnitude": "MINOR",
      "description": "Deep within mountainous terrain. Trade caravans struggle to reach the site safely during winter.",
      "transitionStage": "PERMANENT",
      "effects": [
        {
          "tag": "LOGISTICS_PENALTY_WINTER",
          "scope": "Trade",
          "flatValue": -2,
          "multiplier": 0.0
        }
      ],
      "flaw": true,
      "active": true,
      "replaceable": false
    }
  }
}