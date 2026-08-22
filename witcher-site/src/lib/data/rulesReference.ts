import type { RulesDoc } from '@ui/rules-types';

// Transcribed from the printable Witcher TRPG rules reference sheet that ships
// alongside it at static/rules/. Keep the two in sync: if the PDF is re-cut,
// re-transcribe here rather than letting them drift.
export const rulesReference: RulesDoc = {
	system: 'The Witcher TRPG',
	pdfHref: '/rules/the-witcher-trpg-rules-reference.pdf',
	pdfLabel: '4 pages · 42 KB · the same reference, laid out for print',
	groups: [
		{
			id: 'core',
			title: 'Dice, Checks & Character',
			sections: [
				{
					id: 'core-resolution',
					title: 'Core Resolution',
					blocks: [
						{ kind: 'formula', text: '1d10 + Skill Base vs. Difficulty (DC)' },
						{
							kind: 'prose',
							text: 'Roll meets or beats the DC to succeed. A tie fails. If a character lacks a Skill Base, roll the die and add the governing Statistic instead.'
						},
						{
							kind: 'prose',
							text: 'Opposed Checks: both sides roll; higher total wins. On a tie, the defender (the one reacting) succeeds; if neither side is reacting, it’s a draw and the action must be repeated.'
						},
						{
							kind: 'prose',
							text: 'Percentile Rolls: roll 1d10 twice — first die = tens, second = ones. 0 & 0 = 100.'
						}
					]
				},
				{
					id: 'exploding-dice',
					title: 'Exploding Dice',
					blocks: [
						{
							kind: 'prose',
							text: 'When a 10 is rolled on a Skill Check, add 10 to the total and roll again, adding that result too. Keep rolling and adding as long as 10s keep coming up.'
						},
						{
							kind: 'prose',
							text: 'When a 1 is rolled, roll again and subtract that result from the total. If the second roll is also a 10, subtract 10 and roll (and subtract) again. A Skill Check result can never drop below 1.'
						},
						{
							kind: 'note',
							text: '1s and 10s explode on Skill Checks only — not on damage or percentile rolls.'
						}
					]
				},
				{
					id: 'difficulty-table',
					title: 'Difficulty Table',
					blocks: [
						{
							kind: 'table',
							columns: ['Difficulty', 'DC', 'Example'],
							rows: [
								['Easy', '10', 'Picking a simple lock'],
								['Average', '14', 'Picking an average lock'],
								['Challenging', '18', 'Picking a well-made lock'],
								['Difficult', '20', 'Cracking a vault'],
								['Nearly Impossible', '30', 'Cracking a masterwork vault']
							]
						},
						{
							kind: 'note',
							text: 'The GM sets the DC directly (DC:X) or from this table when none is given.'
						}
					]
				},
				{
					id: 'modifiers',
					title: 'Modifiers',
					blocks: [
						{
							kind: 'table',
							columns: ['Level', 'Value'],
							rows: [
								['Mild', '±1'],
								['Moderate', '±3'],
								['Major', '±5']
							]
						},
						{
							kind: 'prose',
							text: 'Bonuses and penalties for circumstance (tools, lighting, distraction, terrain, position) are added before comparing to the DC. Multiple modifiers stack.'
						},
						{
							kind: 'note',
							text: 'Multiple attackers: Mild (−1) to Defense per enemy beyond the first in melee range.'
						}
					]
				},
				{
					id: 'save-checks',
					title: 'Save Checks',
					blocks: [
						{ kind: 'formula', text: '1d10 vs. Save Stat' },
						{
							kind: 'prose',
							text: 'Used whenever a character risks being stunned or killed. Roll under the Save value to succeed; equal or higher fails (stunned or dying, per effect).'
						},
						{
							kind: 'note',
							text: 'LUCK points may be spent to raise a Save by 1 each, or add a Mild (+1) to any Skill Check.'
						}
					]
				},
				{
					id: 'statistics',
					title: 'Statistics',
					blocks: [
						{
							kind: 'defs',
							items: [
								{ term: 'INT — Intelligence', text: 'Memory, perception, deduction' },
								{ term: 'REF — Reflexes', text: 'Unarmed/melee combat, riding' },
								{ term: 'DEX — Dexterity', text: 'Ranged combat, sleight of hand, stealth' },
								{ term: 'BODY', text: 'Strength, endurance' },
								{ term: 'SPD — Speed', text: 'Movement per turn' },
								{ term: 'EMP — Empathy', text: 'Social skills, performance' },
								{ term: 'CRA — Craft', text: 'Making/using things, medicine' },
								{ term: 'WILL', text: 'Magic, intimidation, courage' },
								{ term: 'LUCK', text: 'Pool spent for +1 bonuses or +1 Save' }
							]
						}
					]
				},
				{
					id: 'derived-stats',
					title: 'Derived Stats',
					blocks: [
						{
							kind: 'defs',
							items: [
								{ term: 'HP', text: 'Lethal damage pool' },
								{ term: 'STA — Stamina', text: 'Non-lethal damage pool & spell fuel' },
								{ term: 'VIGOR', text: 'Threshold of STA spendable per round on magic before it hurts you' },
								{ term: 'SAVE', text: 'Target for Save Checks' },
								{ term: 'REC — Recovery', text: 'HP/STA regained per rest period' },
								{ term: 'LEAP', text: 'Movement in difficult terrain / climbing / swimming' }
							]
						}
					]
				},
				{
					id: 'worked-example',
					title: 'Skill Check — Worked Example',
					blocks: [
						{
							kind: 'prose',
							text: 'Andras wows a crowd with lute playing: roll 1d10 → 6, + Performance Skill Base 14 = 20 total. If the DC was Average (14), that’s a clean success.'
						},
						{
							kind: 'note',
							text: 'No matching Skill Base? Roll 1d10 + the governing Statistic instead (e.g. no Performance → roll + EMP).'
						}
					]
				},
				{
					id: 'racial-class-traits',
					title: 'Racial & Class Traits',
					blocks: [
						{
							kind: 'defs',
							items: [
								{
									term: 'Witcher',
									text: '+1 Awareness; no penalty in dim light; no Courage Check vs. Intimidation but −4 EMP; +1 permanent REF & DEX (can exceed 10)'
								},
								{
									term: 'Human',
									text: '+1 Deduction; Mild (+1) Charisma/Seduction/Persuasion vs. other humans; re-roll a failed Courage/Resist Coercion 3× per session'
								},
								{
									term: 'Dwarf',
									text: '+1 Business; +1 Physique; reduce physical damage taken by 2 (after Armor, before location multiplier)'
								},
								{
									term: 'Elf',
									text: '+1 Fine Arts; +2 Archery, draws/strings a bow free; beasts treat them as friendly'
								}
							]
						},
						{
							kind: 'note',
							text: 'Every Profession also grants a unique Defining Skill — a special, class-specific ability rolled like a Skill Check (e.g. Witcher Training, Healing Hands, Busking, Practiced Paranoia).'
						}
					]
				}
			]
		},
		{
			id: 'skills-combat',
			title: 'Skills & Combat',
			sections: [
				{
					id: 'skills',
					title: 'Skills',
					blocks: [
						{
							kind: 'table',
							caption: 'Governing Statistic in the second column',
							columns: ['Skill', 'Statistic'],
							rows: [
								['Alchemy', 'INT'],
								['Archery', 'DEX'],
								['Athletics', 'DEX'],
								['Awareness', 'INT'],
								['Brawling', 'REF'],
								['Business', 'INT'],
								['Courage', 'WILL'],
								['Crafting', 'CRA'],
								['Crossbow', 'DEX'],
								['Deceit', 'EMP'],
								['Deduction', 'INT'],
								['Disguise', 'CRA'],
								['Dodge/Escape', 'REF'],
								['Education', 'INT'],
								['Endurance', 'BODY'],
								['First Aid', 'CRA'],
								['Gambling', 'EMP'],
								['Human Perception', 'EMP'],
								['Intimidation', 'WILL'],
								['Melee', 'REF'],
								['Monster Lore', 'INT'],
								['Performance', 'EMP'],
								['Persuasion', 'EMP'],
								['Pick Lock', 'CRA'],
								['Physique', 'BODY'],
								['Resist Coercion', 'WILL'],
								['Resist Magic', 'WILL'],
								['Riding', 'REF'],
								['Seduction', 'EMP'],
								['Sleight of Hand', 'DEX'],
								['Small Blades', 'REF'],
								['Social Etiquette', 'INT'],
								['Spell Casting', 'WILL'],
								['Staff/Spear', 'REF'],
								['Stealth', 'DEX'],
								['Streetwise', 'INT'],
								['Swordsmanship', 'REF'],
								['Tactics', 'INT'],
								['Wilderness Survival', 'INT']
							]
						}
					]
				},
				{
					id: 'rounds-initiative',
					title: 'Rounds & Initiative',
					blocks: [
						{ kind: 'formula', text: 'Initiative = 1d10 + REF' },
						{
							kind: 'prose',
							text: 'A round represents about 3 seconds. Highest Initiative acts first; ties broken by higher REF. A character may voluntarily delay to act later, resetting their Initiative to that point.'
						},
						{
							kind: 'note',
							text: 'Monsters and NPCs act on Rate of Fire (ROF) instead of Fast/Strong Strikes — ROF is how many attacks they get on their Attack Action.'
						}
					]
				},
				{
					id: 'on-your-turn',
					title: 'On Your Turn',
					blocks: [
						{
							kind: 'prose',
							text: 'Each turn: Movement (up to SPD in meters) + one Action, in either order (movement cannot be split around the action).'
						},
						{
							kind: 'defs',
							items: [
								{ term: 'Attack', text: 'Fast or Strong Strike' },
								{ term: 'Casting', text: 'Cast a Sign or Spell' },
								{ term: 'Item', text: 'Draw, pick up, or use an item' },
								{ term: 'Movement', text: 'Extra movement equal to SPD' },
								{ term: 'Skill', text: 'Any Skill usable in ~3 seconds' }
							]
						},
						{
							kind: 'note',
							text: 'Extra Action: spend 3 STA for one more Action; Skill Checks for it take a Moderate (−3) penalty. PCs only. Difficult terrain (climbing, swimming, squeezing through): move LEAP meters instead of SPD.'
						}
					]
				},
				{
					id: 'attack-actions',
					title: 'Attack Actions',
					blocks: [
						{ kind: 'formula', text: '1d10 + Skill Base + WA' },
						{
							kind: 'table',
							columns: ['Action', 'Effect'],
							rows: [
								['Fast Melee', '2 attacks (can split targets), normal damage'],
								['Strong Melee', '1 attack, Moderate (−3) to hit, ×2 damage'],
								['Fast Ranged', '1 attack with bow or crossbow; 2 if dual-wielding thrown weapons'],
								['Strong Ranged', 'Bow/thrown only (not crossbow), Moderate (−3) to hit, ×2 damage']
							]
						},
						{
							kind: 'note',
							text: 'Weapon Accuracy (WA): add or subtract the weapon’s WA on every attack with it. Called Shot: target a specific hit location directly, at a penalty based on that location (skips the Hit Location roll on a hit).'
						}
					]
				},
				{
					id: 'defense-actions',
					title: 'Defense Actions',
					blocks: [
						{
							kind: 'prose',
							text: 'One free Defense Action per round (first attack); each additional Defense costs 1 STA. Unwilling or unable to defend? The attacker just needs DC:10.'
						},
						{
							kind: 'defs',
							items: [
								{
									term: 'Block',
									text: 'Weapon (its Skill Base) / shield (Melee) / body (Brawling) — body part hit if it succeeds'
								},
								{ term: 'Dodge', text: 'Dodge/Escape — move a few inches, avoid the hit' },
								{
									term: 'Reposition',
									text: 'Athletics — avoid and move up to LEAP meters away (not toward the attacker)'
								}
							]
						},
						{ kind: 'note', text: 'Ranged and thrown attacks can only be Blocked with a shield.' }
					]
				},
				{
					id: 'range-ambush',
					title: 'Range & Ambush',
					blocks: [
						{
							kind: 'prose',
							text: 'Attacking beyond a ranged weapon’s listed Range: Major (−5) penalty, up to double the listed Range (its hard max).'
						},
						{
							kind: 'prose',
							text: 'Ambush: attackers roll Stealth vs. targets’ Awareness. Against anyone who loses, one free Attack Action at Major (+5), before Initiative is rolled for the fight.'
						}
					]
				},
				{
					id: 'combat-modifiers',
					title: 'Combat Modifier Examples',
					blocks: [
						{
							kind: 'table',
							columns: ['Circumstance', 'Modifier'],
							rows: [
								['Attacking from ambush', 'Major (+5)'],
								['Target dog-sized or smaller, light cover', 'Mild (−1)'],
								['Target’s movement heavily restricted', 'Moderate (+3)'],
								['Dim light / half in cover', 'Moderate (−3)'],
								['Total darkness / near-full cover', 'Major (−5)']
							]
						}
					]
				}
			]
		},
		{
			id: 'damage',
			title: 'Damage, Injury & Healing',
			sections: [
				{
					id: 'weapon-stats',
					title: 'Sample Weapon Stats',
					blocks: [
						{
							kind: 'table',
							columns: ['Weapon', 'WA', 'Damage', 'Effect'],
							rows: [
								['Punch / Kick', '+0', '1d6±', 'Non-Lethal'],
								['Dagger / Poniard', '+0/+1', '1d6–2d6+2', 'Bleed chance'],
								['Silver Sword', '+0', '1d6+2', 'Silver (+3d6 vs. monsters)'],
								['Steel Sword', '+0', '4d6+4', 'Armor Piercing'],
								['Battle Axe', '+0', '5d6+4', '—'],
								['Spear / Staff', '+0', '1d6–3d6+4', 'Long Reach'],
								['Short Bow', '+0', '3d6+3', 'Range 100m'],
								['Crossbow', '+1', '4d6+2', 'Range 100m'],
								['Hand Crossbow', '+1', '2d6+2', 'Range 50m'],
								['Throwing Knife', '+0', '1d6', 'Range 24m']
							]
						},
						{
							kind: 'note',
							text: 'Damage code XdY[+Z]: roll X dice of Y sides, add Z. The figures above are representative examples, not a complete armory.'
						}
					]
				},
				{
					id: 'damage-steps',
					title: 'Damage — Step by Step',
					blocks: [
						{
							kind: 'prose',
							text: '1. Roll damage dice (XdY[+Z]) and add the attacker’s BODY Damage Modifier (melee/thrown only).'
						},
						{ kind: 'prose', text: '2. Add Silver dice vs. monsters, if the weapon is silver.' },
						{ kind: 'prose', text: '3. Strong Strike: double the running total.' },
						{
							kind: 'prose',
							text: '4. Subtract Armor SP at the hit location. 0 or less → attack repelled, stop.'
						},
						{
							kind: 'prose',
							text: '5. Hit Location multiplier — apply once damage penetrates Armor; round down, minimum 1.'
						},
						{
							kind: 'prose',
							text: '6. Resistance/Susceptibility: ×½ if the target resists the damage type, ×2 if vulnerable to it.'
						},
						{ kind: 'prose', text: '7. Apply the final total to HP (lethal) or STA (non-lethal).' }
					]
				},
				{
					id: 'body-damage-modifier',
					title: 'BODY Damage Modifier',
					blocks: [
						{
							kind: 'table',
							columns: ['BODY', 'Modifier'],
							rows: [
								['1–2', 'Moderate (−3)'],
								['3–4', 'Mild (−1)'],
								['5–6', 'None'],
								['7–8', 'Mild (+1)'],
								['9–10', 'Moderate (+3)'],
								['10+', 'Major (+5)']
							]
						}
					]
				},
				{
					id: 'hit-location',
					title: 'Hit Location',
					blocks: [
						{
							kind: 'prose',
							text: 'Roll 1d10 after a successful hit (skip if it was a Called Shot).'
						},
						{
							kind: 'table',
							columns: ['Roll', 'Location', 'Penalty*', '×Damage'],
							rows: [
								['1', 'Head', 'Major (−5)', '×3'],
								['2–7', 'Upper Body', 'Mild (−1)', '×1'],
								['8–10', 'Lower Body', 'Moderate (−3)', '×½']
							]
						},
						{
							kind: 'note',
							text: '* The penalty applies only when using a Called Shot to target that location.'
						}
					]
				},
				{
					id: 'armor',
					title: 'Armor & Its Damage',
					blocks: [
						{
							kind: 'prose',
							text: 'Each Armor piece has a Stopping Power (SP) per location (Head/Upper/Lower). Subtract SP from incoming damage before the Hit Location multiplier.'
						},
						{
							kind: 'prose',
							text: 'Every time a hit penetrates Armor at a location, that piece’s SP drops by 1. At SP 0, it’s broken and useless.'
						},
						{
							kind: 'note',
							text: 'Damage types: lethal (HP) is the default; unarmed strikes and some spells or creature abilities are non-lethal (STA).'
						}
					]
				},
				{
					id: 'critical-wounds',
					title: 'Critical Wounds',
					blocks: [
						{
							kind: 'prose',
							text: 'Attack Check beats the Defense Check by 10+ → Critical Wound: +5 bonus damage (ignores Armor) plus an ongoing effect by location.'
						},
						{
							kind: 'table',
							columns: ['Location', 'Untreated', 'Treated'],
							rows: [
								['Head', '−1 INT/WILL, Save — Concussion', '−1 WILL'],
								['Upper', '−2 BODY, −1 REF — Broken Ribs', '−1 BODY/DEX'],
								['Lower', '−3 SPD, Dodge & Athletics — Injured Leg', '−1 SPD, Dodge & Athletics']
							]
						},
						{
							kind: 'note',
							text: 'Treat: a Doctor spends 4 full rounds, DC:15 Healing Hands (or GM-approved First Aid). Heal fully after BODY-based days: 1–4 BODY = 5 days, 5 = 3, 6–7 = 2, 8+ = 1 day.'
						}
					]
				},
				{
					id: 'stabilization',
					title: 'Stabilization',
					blocks: [
						{
							kind: 'prose',
							text: '0 STA → Unconscious. 0 HP → Dying (Save Check now, and again each round or when hit again, with a cumulative Mild (−1) each time).'
						},
						{
							kind: 'prose',
							text: 'First Aid Check stabilizes: DC:10 (Unconscious) / DC:15 (Dying). Success ends the condition and sets HP/STA to 1.'
						}
					]
				},
				{
					id: 'healing',
					title: 'Healing',
					blocks: [
						{
							kind: 'prose',
							text: 'STA: regain REC per hour rested (halved if any of that hour is strenuous).'
						},
						{
							kind: 'prose',
							text: 'HP: requires a DC:10 First Aid Check to begin treatment, then regain REC per day rested (halved by strenuous activity; +3/day if a Doctor uses Healing Hands instead of First Aid).'
						}
					]
				}
			]
		},
		{
			id: 'magic',
			title: 'Magic & Crafting',
			sections: [
				{
					id: 'casting',
					title: 'Casting Signs & Spells',
					blocks: [
						{ kind: 'formula', text: '1d10 + Spell Casting Skill Base vs. target number' },
						{
							kind: 'prose',
							text: 'Cast as an Action or Extra Action (multiple casts per round possible). Beat the target number to succeed — the spell or Sign’s listed effect occurs; otherwise it fails, but STA is still spent.'
						},
						{
							kind: 'note',
							text: 'Fumble: rolling a 1 on the casting roll fails and harms the caster — see the Fumble Table.'
						}
					]
				},
				{
					id: 'target-numbers',
					title: 'Target Numbers by Type',
					blocks: [
						{
							kind: 'defs',
							items: [
								{
									term: 'Direct',
									text: 'Hits a specific target adversely; Direct (Physical) can be Defended against normally, others use the noted Skill Check'
								},
								{
									term: 'Area',
									text: 'Fills a cone or radius; anyone inside when cast (or who enters) is checked; Area (Physical) uses any Defense Action'
								},
								{
									term: 'Defense: None',
									text: 'Cannot be defended against at all — success just requires not rolling a 1'
								}
							]
						}
					]
				},
				{
					id: 'stamina-vigor',
					title: 'Stamina & Vigor Threshold',
					blocks: [
						{
							kind: 'prose',
							text: 'Every spell or Sign has a Stamina Cost, paid from STA when cast. A witcher’s Sign STA cost is variable (1–7, the caster’s choice) — higher cost = stronger effect. Mage spells have a fixed cost.'
						},
						{
							kind: 'prose',
							text: 'Vigor Threshold: if total STA spent on casting in one round exceeds it, the caster takes 5 HP damage per point over the threshold — ignores Armor.'
						},
						{
							kind: 'note',
							text: 'Active duration spells cost STA again each round to maintain (counts toward Vigor Threshold), but can be dropped anytime for free.'
						}
					]
				},
				{
					id: 'range-duration',
					title: 'Range & Duration',
					blocks: [
						{
							kind: 'prose',
							text: 'A spell or Sign cannot affect anything beyond its listed Range. Immediate duration resolves instantly; random durations (e.g. 1d10 rounds) are rolled and end at the end of the caster’s turn on the final round.'
						}
					]
				},
				{
					id: 'fumble-table',
					title: 'Fumble Table',
					blocks: [
						{
							kind: 'table',
							caption: 'Roll d10 on a casting roll of 1',
							columns: ['Roll', 'Result'],
							rows: [
								['1–6', 'HP damage = Stamina Cost of the spell, ignores Armor'],
								[
									'7–9',
									'Above, + element mishap: Earth = stunned, Air = knocked prone/back 2m, Fire = set aflame, Water = frozen, Mixed = roll 1d6 (1 Earth / 2 Air / 3–5 Fire / 6 Water)'
								],
								[
									'10',
									'Above, + 2m-radius blast: HP damage = Stamina Cost to everyone nearby (upper body, Armor applies)'
								]
							]
						}
					]
				},
				{
					id: 'witcher-signs',
					title: 'Witcher Signs',
					blocks: [
						{ kind: 'note', text: 'STA cost 1–7, which scales the effect.' },
						{
							kind: 'table',
							columns: ['Sign', 'Effect'],
							rows: [
								['Aard (Air)', '2m cone, staggers; knockdown chance +10% per STA'],
								['Axii (Water)', '8m, stuns until a Save (Mild −1 penalty per 2 extra STA)'],
								['Igni (Fire)', '2m cone, 1d6 damage per STA to upper body, 50% ignite'],
								['Quen (Earth)', 'Shield, 5 HP per STA spent, absorbs damage before you'],
								[
									'Yrden (Mixed)',
									'3m circle, 5 rounds; SPD/REF penalty = STA spent; forces incorporeal creatures corporeal'
								]
							]
						}
					]
				},
				{
					id: 'effects',
					title: 'Effects',
					blocks: [
						{
							kind: 'defs',
							items: [
								{ term: 'Bleed', text: '2 HP/turn until First Aid DC:15' },
								{ term: 'Blinded', text: 'Moderate (−3) Atk/Def, Major (−5) Awareness' },
								{ term: 'Dying', text: 'See Stabilization' },
								{
									term: 'Fire',
									text: '5 damage/turn (Head/Upper/Lower), burns 1 SP/turn; douse to end'
								},
								{ term: 'Freeze', text: 'Moderate (−3) SPD, Mild (−1) REF; DC:16 Physique to break' },
								{
									term: 'Poison',
									text: '3 lethal damage/turn, ignores Armor; ends via DC:15 First Aid or Endurance'
								},
								{ term: 'Prone', text: 'Moderate (−3) Atk/Def; stand via Movement or help' },
								{
									term: 'Stun',
									text: 'No move/Action/Defense; ends via Save (full turn) or being hit'
								},
								{ term: 'Unconscious', text: 'Prone, no actions; ends via Stabilizing' }
							]
						},
						{
							kind: 'note',
							text: '% chance effects: roll percentile — a result ≤ the stated chance inflicts it.'
						}
					]
				},
				{
					id: 'crafting',
					title: 'Crafting & Alchemy — Process',
					blocks: [
						{
							kind: 'prose',
							text: '1. Diagram/Formula: must be known or owned — it lists ingredients, time, and DC.'
						},
						{
							kind: 'prose',
							text: '2. Components: gather or buy every listed ingredient (consumed whether the attempt succeeds or fails).'
						},
						{
							kind: 'prose',
							text: '3. The Check: roll Alchemy (potions/oils/bombs) or Crafting (weapons/armor/items) vs. the formula’s DC, taking the listed time. Success = item made; failure = components wasted, try again with fresh components.'
						}
					]
				},
				{
					id: 'quick-reminders',
					title: 'Quick Reminders',
					blocks: [
						{ kind: 'prose', text: '0 on a d10 = 10, not zero.' },
						{
							kind: 'prose',
							text: 'Effects of the same type don’t stack — reapplying refreshes, it doesn’t add.'
						},
						{ kind: 'prose', text: 'Long Reach weapons hit targets 2m away in melee.' },
						{
							kind: 'prose',
							text: 'Armor-Piercing damage ignores resistances (except a monster’s non-silver resistance).'
						},
						{ kind: 'prose', text: 'Falling: 1d6 lethal damage to upper body per 2m fallen.' }
					]
				}
			]
		}
	]
};
