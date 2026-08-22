import type { RulesDoc } from '@ui/rules-types';

// Transcribed from the printable Mutants & Masterminds rules reference sheet
// that ships alongside it at static/rules/. Keep the two in sync: if the PDF is
// re-cut, re-transcribe here rather than letting them drift.
export const rulesReference: RulesDoc = {
	system: 'Mutants & Masterminds 3e',
	pdfHref: '/rules/mutants-and-masterminds-rules-reference.pdf',
	pdfLabel: '4 pages · 36 KB · the same reference, laid out for print',
	groups: [
		{
			id: 'core',
			title: 'Core Resolution & Character',
			sections: [
				{
					id: 'core-mechanic',
					title: 'Core Mechanic',
					blocks: [
						{ kind: 'formula', text: 'Roll 1d20 + Rank/Modifiers vs. Difficulty Class' },
						{
							kind: 'prose',
							text: 'Equal or exceed the DC = success. Every trait — ability, skill, power, defense — has a rank, from −5 to 20+, which is also the modifier added to its checks.'
						},
						{
							kind: 'prose',
							text: 'Critical Success: a natural 20 scores a critical success — figure the degree of success normally, then bump it up one more degree.'
						},
						{
							kind: 'note',
							text: 'Routine Check: outside pressure, just use a flat result of 10 instead of rolling.'
						}
					]
				},
				{
					id: 'dc-benchmarks',
					title: 'Difficulty Class Benchmarks',
					blocks: [
						{
							kind: 'table',
							columns: ['Difficulty', 'DC', 'Example'],
							rows: [
								['Very Easy', '0', 'Automatic'],
								['Easy', '5', 'Climb a knotted rope'],
								['Average', '10', 'Hear an approaching guard'],
								['Tough', '15', 'Disarm an explosive'],
								['Challenging', '20', 'Walk a tightrope'],
								['Formidable', '25', 'Crack a secure computer'],
								['Heroic', '30', 'Beat sophisticated security'],
								['Super-Heroic', '35', 'Bluff past wary, alert guards'],
								['Nearly Impossible', '40', 'Impossibly complex lock, 1 round']
							]
						},
						{
							kind: 'note',
							text: '55% Rule: a +0 modifier succeeds at DC 10 about 55% of the time. Bonus needed for 55% at any DC = DC − 10.'
						}
					]
				},
				{
					id: 'degrees',
					title: 'Degrees of Success & Failure',
					blocks: [
						{
							kind: 'table',
							columns: ['Result', 'Outcome'],
							rows: [
								['DC + 15', '4th degree success'],
								['DC + 10', '3rd degree success'],
								['DC + 5', '2nd degree success'],
								['DC', '1st degree success'],
								['DC − 5', '1st degree failure'],
								['DC − 10', '2nd degree failure'],
								['DC − 15', '3rd degree failure'],
								['DC − 20', '4th degree failure']
							]
						},
						{
							kind: 'note',
							text: 'Every full 5 points over or under the DC adds a degree (fractions ignored); no upper limit, though 2+ degrees of failure rarely matters further.'
						}
					]
				},
				{
					id: 'opposed-checks',
					title: 'Opposed, Comparison & Team Checks',
					blocks: [
						{
							kind: 'prose',
							text: 'Opposed: higher result wins; tie → higher bonus wins; still tied → d20 coin-flip (1–10 / 11–20).'
						},
						{
							kind: 'prose',
							text: 'Routine opposition: DC = passive side’s modifier + 10 — this is exactly how attacks work (DC = 10 + defense).'
						},
						{
							kind: 'prose',
							text: 'Comparison: no luck involved (e.g. arm wrestling) — higher rank just wins; ties are a coin-flip.'
						},
						{
							kind: 'prose',
							text: 'Team Check: a leader rolls; each helper rolls the same check vs. DC 10. 1 total degree of success = leader +2; 3+ = +5. 2+ degrees of failure among helpers = leader −2.'
						},
						{ kind: 'note', text: 'Circumstance Modifiers: minor ±2, major ±5.' }
					]
				},
				{
					id: 'abilities',
					title: 'The Eight Abilities',
					blocks: [
						{ kind: 'note', text: '2 points per rank, −5 to 20.' },
						{
							kind: 'defs',
							items: [
								{ term: 'Strength', text: 'Damage, lifting/throwing, Athletics' },
								{ term: 'Stamina', text: 'Toughness, Fortitude, health recovery' },
								{ term: 'Agility', text: 'Dodge, Initiative, Acrobatics, Stealth' },
								{ term: 'Dexterity', text: 'Ranged attacks, Sleight of Hand, Vehicles' },
								{ term: 'Fighting', text: 'Close attacks, Parry' },
								{ term: 'Intellect', text: 'Expertise, Investigation, Technology, Treatment' },
								{ term: 'Awareness', text: 'Will, Insight, Perception' },
								{ term: 'Presence', text: 'Deception, Intimidation, Persuasion' }
							]
						},
						{
							kind: 'note',
							text: '0 = average adult. 8–10 = low/moderate superhuman. 20 = cosmic. Below 0 refunds 2 PP per rank down to −5.'
						}
					]
				},
				{
					id: 'defenses',
					title: 'The Five Defenses',
					blocks: [
						{ kind: 'formula', text: 'Defense Class = Defense + 10' },
						{
							kind: 'defs',
							items: [
								{ term: 'Dodge (Agility)', text: 'Ranged attacks and hazards; active' },
								{ term: 'Parry (Fighting)', text: 'Close attacks; active' },
								{
									term: 'Toughness (Stamina)',
									text: 'Direct damage/harm; cannot be bought above Stamina without an effect or advantage'
								},
								{ term: 'Fortitude (Stamina)', text: 'Poison, disease, health threats' },
								{ term: 'Will (Awareness)', text: 'Mental and spiritual attacks' }
							]
						},
						{
							kind: 'note',
							text: '1 PP per rank to buy above the base ability. Vulnerable: active defenses halved (round up). Defenseless: active defenses = 0.'
						}
					]
				},
				{
					id: 'attack-options',
					title: 'Attack Options',
					blocks: [
						{
							kind: 'table',
							columns: ['Option', 'Trade'],
							rows: [
								['Accurate Attack', 'Trade up to −2 effect for +2 attack'],
								['Power Attack', 'Trade up to −2 attack for +2 effect'],
								['All-Out Attack', 'Trade up to −2 active defense for +2 attack'],
								['Defensive Attack', 'Trade up to −2 attack for +2 active defense'],
								['Demoralize', 'Intimidation vs. Insight/Will; success = impaired'],
								['Feint', 'Deception vs. Deception/Insight; success = target vulnerable'],
								['Team Attack', 'Combine same-effect attacks within 5 ranks; +2/+5 bonus']
							]
						},
						{
							kind: 'note',
							text: 'Attack bonus can never more than double; effect rank can’t drop below 0.'
						}
					]
				}
			]
		},
		{
			id: 'combat',
			title: 'Actions & Combat',
			sections: [
				{
					id: 'action-types',
					title: 'Action Types',
					blocks: [
						{ kind: 'note', text: 'Round = 6 seconds.' },
						{
							kind: 'defs',
							items: [
								{
									term: 'Standard',
									text: 'Attack, use a power/skill/advantage — one per turn'
								},
								{
									term: 'Move',
									text: 'Move your speed, draw/stow an item, stand up — may trade your Standard for a 2nd Move'
								},
								{ term: 'Free', text: 'Talk, drop an item, drop prone, stop sustaining a power' },
								{
									term: 'Reaction',
									text: 'Reflexive response, even off your own turn; doesn’t use your action allotment'
								},
								{ term: 'No Action', text: 'Resistance checks and the like — not an action at all' }
							]
						},
						{
							kind: 'note',
							text: 'Actions can’t normally be split (move→attack→move); a DC 15 free Athletics check adds +1 Speed rank for the round.'
						}
					]
				},
				{
					id: 'initiative',
					title: 'Initiative & Surprise',
					blocks: [
						{ kind: 'formula', text: 'Initiative = 1d20 + Agility (+ modifiers)' },
						{
							kind: 'prose',
							text: 'Ties: highest Dodge, then Agility, then Awareness, then a die roll.'
						},
						{
							kind: 'note',
							text: 'Surprise round: everyone rolls initiative; surprised characters take no action and are stunned & vulnerable until the next round. Non-surprised characters get only a standard action (or move) plus free actions.'
						}
					]
				},
				{
					id: 'attack-checks',
					title: 'Attack Checks & Crits',
					blocks: [
						{ kind: 'formula', text: 'Attack Check = 1d20 + attack bonus vs. Defense Class' },
						{
							kind: 'prose',
							text: 'Close attacks target Parry; ranged target Dodge. Natural 20 always hits (threat); natural 1 always misses — regardless of totals.'
						},
						{
							kind: 'note',
							text: 'Critical hit (nat. 20 that also meets/beats DC): pick one — Increased Effect (+5 to the resistance DC), Added Effect (second effect at rank 0), or Alternate Effect (free power stunt, no fatigue).'
						}
					]
				},
				{
					id: 'damage-resistance',
					title: 'Damage Resistance Check',
					blocks: [
						{ kind: 'formula', text: 'Toughness vs. (Damage rank + 15)' },
						{
							kind: 'table',
							columns: ['Result', 'Outcome'],
							rows: [
								['Success', 'No effect'],
								['Fail 1 degree', '−1 penalty to further Damage resistance checks'],
								['Fail 2 degrees', 'Dazed (plus the −1 penalty)'],
								['Fail 3 degrees', 'Staggered (plus the −1 penalty)'],
								['Fail 4 degrees', 'Incapacitated']
							]
						},
						{
							kind: 'note',
							text: 'Penalties are cumulative. Failing again while Incapacitated = Dying; failing again = Dead.'
						}
					]
				},
				{
					id: 'range-cover',
					title: 'Range, Cover & Minions',
					blocks: [
						{
							kind: 'prose',
							text: 'Ranged bands: short = rank×25ft (no penalty), medium = rank×50ft (−2), long = rank×100ft (−5); beyond long = out of range.'
						},
						{
							kind: 'prose',
							text: 'Cover/Concealment: partial −2, total −5 (total cover blocks a direct attack outright); cover gives the same bonus to Dodge vs. area effects.'
						},
						{
							kind: 'prose',
							text: 'Minions: non-minions hit them with routine checks (guaranteed if attack bonus ≥ 0); minions can’t crit non-minions; a minion failing a resistance check takes the worst result automatically.'
						}
					]
				},
				{
					id: 'maneuvers',
					title: 'Common Maneuvers',
					blocks: [
						{
							kind: 'table',
							columns: ['Maneuver', 'Action', 'Effect'],
							rows: [
								[
									'Grab',
									'Standard',
									'Attack, then opposed Str/grab vs. target’s Str/Dodge; 1 degree = restrained, 2+ = bound'
								],
								['Trip', 'Standard', 'Close attack at −2, then opposed Acrobatics/Athletics; loser prone'],
								[
									'Disarm',
									'Standard',
									'Attack (−2 unarmed vs. armed, −5 ranged) then opposed vs. Strength'
								],
								['Charge', 'Standard', 'Move speed rank, then close attack at −2'],
								['Defend', 'Standard', 'Opposed active defense vs. attacker (min. 10 on your roll)'],
								['Aid', 'Standard', 'Team check vs. DC 10; success grants ally +2 (3+ degrees: +5)'],
								[
									'Aim',
									'Standard',
									'+5 next attack (close/short) or +2 (longer); you’re vulnerable meanwhile'
								],
								[
									'Recover',
									'Standard',
									'Remove worst damage/fatigue condition; once per conflict; +2 defenses till your next turn'
								],
								['Smash', 'Standard', 'Attack an object instead of its holder (−5 if held)'],
								['Stand', 'Move', 'Stand from prone (or DC 20 Acrobatics as a free action)']
							]
						}
					]
				}
			]
		},
		{
			id: 'conditions',
			title: 'Conditions, Extra Effort & Hero Points',
			sections: [
				{
					id: 'basic-conditions',
					title: 'Conditions',
					blocks: [
						{ kind: 'note', text: 'The basic building blocks.' },
						{
							kind: 'defs',
							items: [
								{ term: 'Compelled', text: 'Only free actions + 1 GM-chosen standard per turn' },
								{ term: 'Controlled', text: 'No free will; another character dictates every action' },
								{ term: 'Dazed', text: 'Only free actions + 1 standard (may move) per turn' },
								{ term: 'Debilitated', text: 'An ability lowered below −5 — severe per-ability effect' },
								{
									term: 'Defenseless',
									text: 'Active defenses = 0; attacks against you are routine or auto-crit'
								},
								{ term: 'Disabled', text: '−5 circumstance penalty on that trait' },
								{ term: 'Fatigued', text: 'Hindered; recovers after 1 hour’s rest' },
								{ term: 'Hindered', text: 'Half speed (−1 speed rank)' },
								{ term: 'Immobile', text: 'No movement speed at all' },
								{ term: 'Impaired', text: '−2 circumstance penalty on that trait' },
								{ term: 'Stunned', text: 'No actions at all, not even free ones' },
								{ term: 'Transformed', text: 'Traits altered by an outside agency' },
								{ term: 'Unaware', text: 'Can’t perceive or act on surroundings at all' },
								{ term: 'Vulnerable', text: 'Active defenses halved (round up)' },
								{ term: 'Weakened', text: 'Temporary power-point loss in a trait' }
							]
						}
					]
				},
				{
					id: 'combined-conditions',
					title: 'Combined Conditions',
					blocks: [
						{ kind: 'note', text: 'Bundles of the basic conditions.' },
						{
							kind: 'defs',
							items: [
								{ term: 'Asleep', text: 'Defenseless, stunned, unaware' },
								{ term: 'Blind', text: 'Hindered, visually unaware, vulnerable' },
								{ term: 'Bound', text: 'Defenseless, immobile, impaired' },
								{ term: 'Deaf', text: 'Total auditory concealment, sign/lip-read only' },
								{ term: 'Dying', text: 'Incapacitated + Fortitude DC 15 each round or die' },
								{ term: 'Entranced', text: 'Stunned, attending the effect; a threat breaks it' },
								{ term: 'Exhausted', text: 'Impaired and hindered' },
								{ term: 'Incapacitated', text: 'Defenseless, stunned, unaware, usually prone' },
								{ term: 'Paralyzed', text: 'Defenseless, immobile, stunned, but aware' },
								{ term: 'Prone', text: '−5 close attack taken / +5 given, −5 vs. ranged given' },
								{ term: 'Restrained', text: 'Hindered and vulnerable (or immobile if anchored)' },
								{ term: 'Staggered', text: 'Dazed and hindered' },
								{ term: 'Surprised', text: 'Stunned and vulnerable' }
							]
						}
					]
				},
				{
					id: 'extra-effort',
					title: 'Extra Effort',
					blocks: [
						{ kind: 'note', text: 'Free action, once per turn.' },
						{
							kind: 'table',
							columns: ['Use', 'Effect'],
							rows: [
								['Action', '+1 extra standard action this turn'],
								['Bonus', '+2 circumstance (or push +2→+5); negate −2 or reduce −5 to −2'],
								['Power', '+1 rank to one effect until your next turn'],
								['Power Stunt', 'Temporary Alternate Effect for the scene'],
								['Resistance', 'An extra resistance check right now'],
								['Retry', 'Retry certain failed effects'],
								['Speed / Strength', '+1 rank until your next turn']
							]
						},
						{
							kind: 'note',
							text: 'Cost: Fatigued after use; using it again while Fatigued → Exhausted; again → Incapacitated. A Hero Point spent next turn removes the Fatigue entirely.'
						}
					]
				},
				{
					id: 'hero-points',
					title: 'Hero Points',
					blocks: [
						{ kind: 'note', text: '1 to start each session.' },
						{
							kind: 'table',
							columns: ['Use', 'Effect'],
							rows: [
								['Edit Scene', 'Add or change a detail in your favor (can’t undo resolved events)'],
								['Heroic Feat', 'Borrow one rank of an advantage you lack, until end of next turn'],
								[
									'Improve Roll',
									'Reroll any of your die rolls, take the better (before the outcome is announced)'
								],
								['Inspiration', 'A hint or clue from the GM'],
								['Instant Counter', 'Attempt to counter an effect as a reaction'],
								['Recover', 'Instantly remove Dazed/Fatigued/Stunned; Exhausted → Fatigued']
							]
						},
						{
							kind: 'note',
							text: 'Spending is normally a reaction (no time cost). Earned via Complications, heroics, and roleplaying; unspent points don’t carry over between adventures.'
						}
					]
				},
				{
					id: 'recovery',
					title: 'Recovery',
					blocks: [
						{
							kind: 'prose',
							text: 'Living targets remove one damage condition per minute of rest, working back from their worst condition (Incapacitated → Staggered → Dazed), then shed accumulated −1 penalties one at a time per minute.'
						},
						{
							kind: 'note',
							text: 'Objects don’t recover naturally — they must be repaired (Technology). Lasting injury is typically handled as a GM-imposed Complication (which grants a Hero Point).'
						}
					]
				}
			]
		},
		{
			id: 'powers',
			title: 'Power Points & Powers',
			sections: [
				{
					id: 'power-points',
					title: 'Power Points & Basic Costs',
					blocks: [
						{
							kind: 'formula',
							text: 'Starting PP = Power Level × 15 (PL 10 default «Super Heroes» = 150 PP)'
						},
						{
							kind: 'table',
							columns: ['Trait', 'Cost'],
							rows: [
								['Ability', '2 PP / rank'],
								['Defense (above ability)', '1 PP / rank'],
								['Skill', '1 PP / 2 ranks'],
								['Advantage', '1 PP / advantage or rank'],
								['Power', '((base cost + extras − flaws) × rank) + flat mods']
							]
						}
					]
				},
				{
					id: 'pl-caps',
					title: 'Power Level Caps',
					blocks: [
						{
							kind: 'table',
							columns: ['Pair', 'Cap'],
							rows: [
								['Skill total (any one skill)', '≤ PL + 10'],
								['Attack bonus + effect rank', '≤ 2 × PL'],
								['Dodge + Toughness', '≤ 2 × PL'],
								['Parry + Toughness', '≤ 2 × PL'],
								['Fortitude + Will', '≤ 2 × PL']
							]
						},
						{
							kind: 'note',
							text: 'Each cap is a pair — lean toward one side of the pair as long as the sum stays within it. PL is set by the GM for the whole series.'
						}
					]
				},
				{
					id: 'effect-types',
					title: 'Effect Types',
					blocks: [
						{
							kind: 'defs',
							items: [
								{
									term: 'Attack',
									text: 'Offensive, needs an attack check, usually Instant, always resisted'
								},
								{
									term: 'Control',
									text: 'Influence over something; Standard to start, often Sustained'
								},
								{ term: 'Defense', text: 'Protective; typically Personal & Permanent' },
								{
									term: 'Movement',
									text: 'Getting around; Free to activate, still needs a Move to move'
								},
								{ term: 'Sensory', text: 'Alters or enhances senses; Free or Permanent' },
								{ term: 'General', text: 'Doesn’t fit elsewhere — governed by its own write-up' }
							]
						}
					]
				},
				{
					id: 'effect-parameters',
					title: 'Effect Parameters',
					blocks: [
						{
							kind: 'defs',
							items: [
								{ term: 'Range: Close', text: 'Touch; unarmed attack vs. Parry if unwilling' },
								{ term: 'Range: Ranged', text: 'Attack vs. Dodge (see the range bands)' },
								{ term: 'Range: Perception', text: 'No attack check, just needs to be perceived' },
								{ term: 'Duration: Instant', text: 'Occurs and ends the same turn' },
								{ term: 'Duration: Sustained', text: 'Free action each round to maintain' },
								{ term: 'Duration: Continuous', text: 'Stays on until deactivated (free action)' },
								{
									term: 'Duration: Permanent',
									text: 'Always on; can’t deactivate or extra-effort boost'
								}
							]
						},
						{ kind: 'formula', text: 'Resistance DC = Effect Rank + 10' }
					]
				},
				{
					id: 'extras-flaws',
					title: 'Extras & Flaws',
					blocks: [
						{
							kind: 'prose',
							text: 'An Extra adds to an effect’s per-rank cost (usually +1); a Flaw subtracts from it (usually −1). Some modifiers are flat instead — applied once to the final total, after rank multiplication, not per rank.'
						},
						{
							kind: 'note',
							text: 'If flaws drop the per-rank cost below 1 PP, express it as ranks-per-point (e.g. 1 PP per 3 ranks); the GM sets a floor (suggested default: 1 PP per 5 ranks). A flat flaw can never reduce a power below 1 PP total.'
						}
					]
				},
				{
					id: 'selected-effects',
					title: 'Selected Power Effects',
					blocks: [
						{
							kind: 'table',
							caption: 'Type / range / duration / resistance / cost',
							columns: ['Effect', 'Profile', 'Cost'],
							rows: [
								['Damage', 'Atk, Close, Instant, Toughness', '1/rank'],
								['Blast', 'Atk, Ranged, Instant, Toughness', '2/rank'],
								['Strike', 'Atk, Close, Instant, Toughness', '1/rank'],
								['Affliction', 'Atk, Close, Instant, Fort/Will', '1/rank'],
								['Protection', 'Def, Personal, Permanent', '1/rank'],
								['Force Field', 'Def, Personal, Sustained', '1/rank'],
								['Flight', 'Move, Personal, Sustained', '2/rank'],
								['Speed', 'Move, Personal, Sustained', '1/rank'],
								['Teleport', 'Move, Rank, Instant', '2/rank'],
								['Healing', 'Gen, Close, Instant', '2/rank'],
								['Immunity', 'Def, Personal, Permanent', '1/rank'],
								['Mind Control', 'Atk, Perception, Instant, Will', '4/rank'],
								['Illusion', 'Ctrl, Perception, Sustained, Awareness', '1–5/rank'],
								['Move Object', 'Ctrl, Ranged, Sustained, Strength', '2/rank']
							]
						}
					]
				}
			]
		}
	]
};
