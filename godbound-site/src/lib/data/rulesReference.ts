import type { RulesDoc } from '@ui/rules-types';

// Transcribed from the printable Godbound rules reference sheet that ships
// alongside it at static/rules/. Keep the two in sync: if the PDF is re-cut,
// re-transcribe here rather than letting them drift.
export const rulesReference: RulesDoc = {
	system: 'Godbound',
	pdfHref: '/rules/godbound-rules-reference.pdf',
	pdfLabel: '4 pages · 35 KB · the same reference, laid out for print',
	groups: [
		{
			id: 'core',
			title: 'Core Resolution & Character',
			sections: [
				{
					id: 'attribute-checks',
					title: 'Attribute Checks',
					blocks: [
						{ kind: 'formula', text: 'Roll 1d20 ≥ (21 − Attribute score)' },
						{
							kind: 'prose',
							text: 'The check target is derived from the raw attribute score, not its modifier. +4 if a relevant Fact applies (Facts never stack, and never apply to hit or damage).'
						},
						{ kind: 'prose', text: 'Natural 1 always fails, natural 20 always succeeds.' },
						{
							kind: 'note',
							text: 'Only roll for feats that would still challenge a mortal and fall outside a bound Word or an applicable Fact — those are automatic successes, not checks. Penalty up to −8 for near-impossible feats; truly impossible ones need a gift or miracle instead.'
						}
					]
				},
				{
					id: 'attribute-modifiers',
					title: 'Attribute Modifiers',
					blocks: [
						{
							kind: 'table',
							columns: ['Score', 'Modifier'],
							rows: [
								['3', '−3'],
								['4–5', '−2'],
								['6–8', '−1'],
								['9–12', '+0'],
								['13–15', '+1'],
								['16–17', '+2'],
								['18', '+3']
							]
						},
						{
							kind: 'note',
							text: 'Generate: 4d6 drop lowest ×6, assign freely — or the default array 16/14/13/13/10/8.'
						}
					]
				},
				{
					id: 'six-attributes',
					title: 'The Six Attributes',
					blocks: [
						{
							kind: 'defs',
							items: [
								{ term: 'Strength', text: 'Melee hit/damage, brawn' },
								{ term: 'Dexterity', text: 'Ranged/light hit & damage, AC, Evasion save' },
								{ term: 'Constitution', text: 'Max HP, Hardiness save' },
								{ term: 'Wisdom', text: 'Spirit save; rarely rolled directly' },
								{ term: 'Intelligence', text: 'Evasion save; rarely rolled directly' },
								{ term: 'Charisma', text: 'Reactions, Spirit save, some Presence attacks' }
							]
						}
					]
				},
				{
					id: 'saving-throws',
					title: 'Saving Throws',
					blocks: [
						{ kind: 'formula', text: 'Roll 1d20 ≥ (16 − level − better of two attribute mods)' },
						{
							kind: 'prose',
							text: 'At 1st level this is simply 15 − the better modifier. If both governing attributes are penalties, use the less-bad (higher) one. Saves improve by 1 each level up. Natural 1 fails, natural 20 succeeds.'
						},
						{
							kind: 'defs',
							items: [
								{
									term: 'Hardiness',
									text: 'Better of STR/CON — exhaustion, poison, disease, transformation, physical rigor'
								},
								{ term: 'Evasion', text: 'Better of DEX/INT — explosions, falls, dodgeable hazards' },
								{
									term: 'Spirit',
									text: 'Better of WIS/CHA — mind control, curses, sendings, enchantment'
								}
							]
						},
						{
							kind: 'note',
							text: 'A Godbound may Commit Effort for the day to turn a failed save into an automatic success. NPC saves without stats: 15 − half their Hit Dice (min 5), ±3 if thematically (un)suited.'
						}
					]
				},
				{
					id: 'attack-ac',
					title: 'Combat — Attack & Armor Class',
					blocks: [
						{ kind: 'formula', text: '1d20 + attack bonus + attribute mod ≥ 20 hits' },
						{
							kind: 'prose',
							text: 'Attack bonus starts at +1 and scales with level (+1/level). Weapon–attribute pairing: melee (medium/heavy) → STR; ranged → DEX; light weapons → better of STR/DEX. Natural 1 always misses, natural 20 always hits.'
						},
						{
							kind: 'prose',
							text: 'AC = 9 − DEX modifier bonus (never worse than 9 even with a DEX penalty), adjusted by armor:'
						},
						{
							kind: 'table',
							columns: ['Armor', 'Base AC', 'Save penalty'],
							rows: [
								['None', '9', '—'],
								['Light', '7', '—'],
								['Medium', '5', '−4 to one save (chosen once)'],
								['Heavy', '3', '−4 to two saves'],
								['Shield', '−1 (bonus)', '—']
							]
						}
					]
				},
				{
					id: 'damage-conversion',
					title: 'Damage Conversion',
					blocks: [
						{
							kind: 'table',
							columns: ['Damage die result', 'Damage taken'],
							rows: [
								['1 or less', 'None'],
								['2–5', '1 point'],
								['6–9', '2 points'],
								['10 or more', '4 points']
							]
						},
						{
							kind: 'note',
							text: 'Each die is looked up separately; the attacker’s bonus applies to only one die of their choice. Godbound lose HP; other creatures lose Hit Dice. “Rolled straight” powers skip this table and use face value.'
						}
					]
				},
				{
					id: 'weapon-damage',
					title: 'Weapon Damage Dice',
					blocks: [
						{
							kind: 'table',
							columns: ['Weapon', 'Damage'],
							rows: [
								['Unarmed', '1d2 (Str/Dex)'],
								['Light', '1d6 (Str/Dex)'],
								['Medium', '1d8 (Str)'],
								['Heavy', '1d10 (Str)'],
								['Ranged, 1H', '1d6 (Dex)'],
								['Ranged, 2H', '1d8 (Dex)'],
								['Dual-wield', 'Treat as one 2H weapon, 1d10 (Str or Dex)']
							]
						},
						{
							kind: 'note',
							text: 'Overflow: a PC’s excess damage beyond what kills a target can splash to another target in range of equal or worse AC (PCs only; not against area attacks).'
						}
					]
				}
			]
		},
		{
			id: 'hp',
			title: 'Hit Points, Death & Recovery',
			sections: [
				{
					id: 'hit-points',
					title: 'Hit Points',
					blocks: [
						{ kind: 'formula', text: 'Starting HP = 8 + CON modifier' },
						{ kind: 'prose', text: 'Per level: +4, plus half the CON modifier (round up).' },
						{
							kind: 'note',
							text: 'NPCs and monsters use Hit Dice instead of HP — a foe can take damage equal to its HD before dying. Godbound are never treated as “lesser foes,” regardless of relative level or HD.'
						}
					]
				},
				{
					id: 'zero-hp',
					title: 'At 0 HP & Divine Fury',
					blocks: [
						{
							kind: 'prose',
							text: '0 HP: gravely wounded and helpless — any further damage kills. Left alone, regain 1 HP after one hour.'
						},
						{
							kind: 'prose',
							text: 'Divine Fury (once, until next level-up): on being reduced to 0 HP, instead gain HP equal to half max (round up) and bonus Effort equal to level; freed from and immune to new binding for the fury’s duration (rounds = level).'
						},
						{
							kind: 'prose',
							text: 'After: 5 rounds fully helpless (gifts inactive, no actions, auto-fail saves — any capable foe can finish them). A Godbound dropped to 0 HP during or after a fury dies instantly and cannot be revived.'
						}
					]
				},
				{
					id: 'recovery-death',
					title: 'Recovery & Death (Others)',
					blocks: [
						{
							kind: 'prose',
							text: 'A full day (or full night’s sleep) of safe rest restores all lost HP for a Godbound. Lesser creatures heal 1 HD per full day’s rest.'
						},
						{
							kind: 'prose',
							text: 'Magical HP healing requires the recipient to Commit Effort for the day (curing disease, poison, or curses does not).'
						},
						{
							kind: 'note',
							text: 'Non-Godbound creatures at 0 HD: dead, unconscious, or subdued at the attacker’s discretion; mortally wounded ones take a few rounds to die, in which window aid can save them. An attacker can declare a plausible non-lethal defeat instead of a kill.'
						}
					]
				},
				{
					id: 'fray-die',
					title: 'Fray Die',
					blocks: [
						{
							kind: 'prose',
							text: 'Most heroes have a 1d8 Fray Die, rolled each round for free (no action) against the Damage Conversion table, dealing that much damage to one lesser foe (HD ≤ the hero’s level) in sight, no modifiers.'
						},
						{
							kind: 'note',
							text: 'Useless against “worthy foes” — those with more HD than the hero has levels.'
						}
					]
				},
				{
					id: 'effort',
					title: 'Effort',
					blocks: [
						{
							kind: 'prose',
							text: 'Represents divine power, will, and physical energy spent to fuel gifts and miracles.'
						},
						{
							kind: 'defs',
							items: [
								{ term: 'Starting', text: '2 points' },
								{ term: 'Growth', text: '+1 max per character level' },
								{
									term: 'Refresh',
									text: 'All committed Effort returns every morning, rest not required'
								}
							]
						},
						{
							kind: 'prose',
							text: 'Committing (not spending outright) ties up a point until you reclaim it or its duration ends:'
						},
						{
							kind: 'defs',
							items: [
								{ term: 'Instant', text: 'Reclaim anytime, even off-turn' },
								{ term: 'Scene-long', text: 'Held until the scene ends; can’t reclaim early' },
								{ term: 'Day-long', text: 'Held until the next morning; can’t reclaim early' }
							]
						},
						{
							kind: 'note',
							text: 'Effort can also be Committed to turn a failed save into a success. A miracle mimicking a gift that would itself need day-long commitment costs 2 Effort instead of 1.'
						}
					]
				}
			]
		},
		{
			id: 'words',
			title: 'Words, Gifts & Miracles',
			sections: [
				{
					id: 'words-gift-points',
					title: 'Words & Gift Points',
					blocks: [
						{
							kind: 'defs',
							items: [
								{ term: 'Starting Words', text: '3, bound at creation' },
								{ term: 'Starting gift points', text: '6' },
								{ term: 'Lesser gift', text: '1 point (2 if from an unbound Word, if justifiable)' },
								{ term: 'Greater gift', text: '2 points — only from a bound Word' },
								{ term: 'Bind a new Word', text: '3 points' },
								{ term: 'Per level-up', text: '+2 more gift points to spend or save' }
							]
						},
						{
							kind: 'note',
							text: 'Only a hero bound to a Word can learn its Greater gifts. Lesser gifts can (with justification) be taken from any Word.'
						}
					]
				},
				{
					id: 'gift-activation',
					title: 'Gift Activation Types',
					blocks: [
						{
							kind: 'defs',
							items: [
								{ term: 'Constant', text: 'Always on, no Effort to activate' },
								{
									term: 'On Turn',
									text: 'Triggered on your turn, doesn’t use your action; any number if Effort allows'
								},
								{ term: 'Action', text: 'Uses your action; only one per turn' },
								{
									term: 'Instant',
									text: 'Usable anytime, even off-turn or after an enemy’s roll — most defenses are this'
								}
							]
						},
						{
							kind: 'note',
							text: 'Every bound Word also grants one free, unsuppressible intrinsic ability just for being bound (e.g. raising a governing attribute, an always-on sense or immunity).'
						}
					]
				},
				{
					id: 'universal-gifts',
					title: 'Universal Gifts',
					blocks: [
						{
							kind: 'table',
							caption: 'Available from any Word, as a lesser gift',
							columns: ['Gift', 'Effect'],
							rows: [
								[
									'Divine Wrath',
									'Smite (Action): Commit Effort, 1d8/level to one foe; not usable two rounds running'
								],
								[
									'Corona of Fury',
									'Smite (Action): 30ft burst, 1d8 per 2 levels (round up); allies may be spared, then save'
								],
								['Effort of the Word', 'Constant: +1 max Effort; once per bound Word'],
								['Influence of the Word', 'Constant: +2 max Influence; once per bound Word'],
								['Excellence of the Word', 'Constant: raise one attribute to 18; once, ever, total']
							]
						}
					]
				},
				{
					id: 'example-words',
					title: 'Example Words',
					blocks: [
						{
							kind: 'defs',
							items: [
								{
									term: 'Alacrity (agility/swiftness)',
									text: 'Intrinsic: can’t be surprised, DEX→16/18. Lesser: Flickering Advance, Mist on Water, Swifter Than the Sun. Greater: Faster Than Thought (Smite), Untouchable.'
								},
								{
									term: 'Command (leadership/obedience)',
									text: 'Intrinsic: CHA→16/18, speak with any intelligent creature. Lesser: Guards! Seize Him!, Know the Inner Truth. Greater: A Thousand Loyal Troops, Thrall-Making Shout.'
								},
								{
									term: 'Artifice (building/repairing/destroying)',
									text: 'Intrinsic: instantly craft small mundane objects. Lesser: Faultless Repair, Hammerhand, Ten Thousand Tools. Greater: The Maker’s Eyes, Transmuter.'
								}
							]
						}
					]
				},
				{
					id: 'miracles',
					title: 'Miracles',
					blocks: [
						{
							kind: 'prose',
							text: 'When a Word justifies an effect no gift covers: describe it, the GM approves plausibility, then Commit Effort (typically for the full day, even for a brief effect).'
						},
						{
							kind: 'prose',
							text: 'Can mimic a bound Word’s gift (lasts ≤1 scene even if normally Constant; costs 2 Effort if the mimicked gift needs day-long commitment), suppress an enemy gift, permanently dispel mortal magic or curses, or produce a scene’s dramatic effect.'
						},
						{
							kind: 'table',
							columns: ['Miracle', 'Damage'],
							rows: [
								['Hurt One Target', '1d8/level (or per 2 HD), max 10d8, no save, counts as Smite'],
								['Hurt Several', '1d6 per 2 levels, max 10d6, save if allies mixed in, Smite']
							]
						}
					]
				},
				{
					id: 'apotheosis',
					title: 'Apotheosis',
					blocks: [
						{
							kind: 'prose',
							text: 'Not a selectable Word — its gifts accrue automatically by level to any Godbound running a cult (opt-out “free divinities” get automatic Dominion instead, but no worshipers or Apotheosis gifts).'
						},
						{
							kind: 'table',
							columns: ['Level', 'Gift'],
							rows: [
								['2', 'Receive the Incense of Faith'],
								['3', 'Sanctify Shrine + Smite the Apostate'],
								['4', 'Hear Prayer'],
								['5', 'Perceive the Petitioner'],
								['6', 'Mark of the Prophet'],
								['7', 'Attend the Faithful'],
								['8', 'To Bless the Nations']
							]
						}
					]
				}
			]
		},
		{
			id: 'dominion',
			title: 'Dominion & Influence',
			sections: [
				{
					id: 'influence',
					title: 'Influence',
					blocks: [
						{ kind: 'formula', text: 'Influence = 1 + character level' },
						{
							kind: 'prose',
							text: 'Plus +2 per Word bound with the Influence of the Word gift. Committed, not spent, like Effort — it represents ongoing off-screen attention to a situation.'
						},
						{
							kind: 'note',
							text: 'Committing Influence keeps a change stable; withdrawing it lets the situation decay back toward baseline over time (faster for simple things, slower for complex ones). Influence-driven change is temporary — it only lasts as long as it stays committed.'
						}
					]
				},
				{
					id: 'dominion-basics',
					title: 'Dominion',
					blocks: [
						{
							kind: 'prose',
							text: 'Starting Dominion: 0. Gained from mighty deeds, cult worship, and celestial-relic assimilation — roughly 1 per session for heroic play, +1 more for acting strongly in-Word.'
						},
						{
							kind: 'prose',
							text: 'Unlike Influence, Dominion changes are permanent until an opposing force spends equal-or-greater Dominion (or violence) to undo them.'
						},
						{
							kind: 'note',
							text: 'Free divinities (no cult): automatically gain 1 Dominion per month from 2nd level, +1 more per 3 full levels, but get no Apotheosis gifts or worshipers.'
						}
					]
				},
				{
					id: 'advancement',
					title: 'Advancement',
					blocks: [
						{
							kind: 'table',
							caption: 'XP & Dominion to level',
							columns: ['Level', 'XP', 'Dominion spent'],
							rows: [
								['2', '3', '2'],
								['3', '6', '4'],
								['4', '12', '10'],
								['5', '24', '22'],
								['6', '48', '38'],
								['7', '72', '57'],
								['8', '96', '76'],
								['9', '130', '95'],
								['10', '170', '124']
							]
						}
					]
				},
				{
					id: 'dominion-cost',
					title: 'Cost of a Dominion Change',
					blocks: [
						{ kind: 'formula', text: 'Cost = Scope base × Difficulty multiplier' },
						{
							kind: 'table',
							columns: ['Scope', 'Base'],
							rows: [
								['Village (~1,000 people)', '1'],
								['City (~100,000)', '2'],
								['Region (~1 million)', '4'],
								['Nation (~100 million)', '8'],
								['Realm (whole world)', '16']
							]
						},
						{
							kind: 'table',
							columns: ['Plausibility', 'Multiplier'],
							rows: [
								['Plausible', '×1'],
								['Improbable', '×2'],
								['Impossible', '×4']
							]
						},
						{
							kind: 'note',
							text: 'Impossible changes generally also require a full Mighty Deed (an adventure), not just the Dominion cost.'
						}
					]
				},
				{
					id: 'wards',
					title: 'Wards & Opposition',
					blocks: [
						{
							kind: 'prose',
							text: 'Mundus Wards (rated 1–20) add their rating to the base scope cost before the multiplier; most surviving city wards run 1–4, a well-defended nation’s 10+.'
						},
						{
							kind: 'table',
							columns: ['Rival resistance', 'Penalty'],
							rows: [
								['Minor spirit / lesser undead / angry priest', '+1'],
								['Skilled mage / strong local ruler', '+2'],
								['Eldritch hulk / major bestial thing', '+4'],
								['Minor parasite god / new NPC Godbound', '+6'],
								['Major parasite god / veteran NPC Godbound', '+8']
							]
						},
						{
							kind: 'note',
							text: 'Multiple wards: use the highest only. Multiple resisters: worst rating +1 per additional resister.'
						}
					]
				},
				{
					id: 'shrine',
					title: 'Shrine',
					blocks: [
						{
							kind: 'prose',
							text: 'Gained via the Apotheosis Sanctify Shrine gift (3rd level). Worshipers consecrate a temple or shrine; the Godbound can then perceive and act within its precincts, and their first gift or miracle use there each day is free.'
						},
						{
							kind: 'note',
							text: 'Consecration cost: Wealth equal to the Godbound’s level (rises with level). Desecration requires full re-consecration.'
						}
					]
				},
				{
					id: 'quick-reminders',
					title: 'Quick Reminders',
					blocks: [
						{
							kind: 'prose',
							text: 'Natural 1 always fails, natural 20 always succeeds, on any d20 roll (checks, attacks, saves).'
						},
						{
							kind: 'prose',
							text: 'Effort is committed, not consumed — it refreshes fully every morning regardless of rest.'
						},
						{
							kind: 'prose',
							text: 'A Godbound is never a “lesser foe” for another creature’s abilities, regardless of level or HD comparison.'
						},
						{
							kind: 'prose',
							text: 'Divine Fury can only be used once between level-ups, and dying during or after it is final.'
						}
					]
				}
			]
		}
	]
};
