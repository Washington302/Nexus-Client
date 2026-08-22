import type { RulesDoc } from '@ui/rules-types';

// Transcribed from the printable Mythras rules reference sheet that ships
// alongside it at static/rules/. Keep the two in sync: if the PDF is re-cut,
// re-transcribe here rather than letting them drift.
export const rulesReference: RulesDoc = {
	system: 'Mythras',
	pdfHref: '/rules/mythras-rules-reference.pdf',
	pdfLabel: '4 pages · 35 KB · the same reference, laid out for print',
	groups: [
		{
			id: 'core',
			title: 'Core Resolution & Character',
			sections: [
				{
					id: 'core-resolution',
					title: 'Core Resolution',
					blocks: [
						{ kind: 'formula', text: 'Roll 1d100 vs. Skill %' },
						{
							kind: 'prose',
							text: 'Equal to or less than the skill = success. Greater = failure. 01–05 always succeeds; 96–00 always fails, regardless of skill value.'
						},
						{
							kind: 'prose',
							text: 'Critical: roll ≤ one-tenth of the skill (round fractions up). Fumble: roll of 99–00 (skills over 100% fumble only on 00).'
						},
						{
							kind: 'note',
							text: 'Four outcome tiers only: Fumble / Failure / Success / Critical — there is no separate “Special” tier.'
						}
					]
				},
				{
					id: 'difficulty-grades',
					title: 'Difficulty Grades',
					blocks: [
						{ kind: 'note', text: 'Modify the skill before rolling.' },
						{
							kind: 'table',
							columns: ['Grade', 'Modifier'],
							rows: [
								['Automatic', 'No roll needed'],
								['Very Easy', '×2 skill (or +40%)'],
								['Easy', '×1.5 skill (or +20%)'],
								['Standard', 'No change'],
								['Hard', '−⅓ skill (or −20%)'],
								['Formidable', '−½ skill (or −40%)'],
								['Herculean', '÷10 skill (or −80%)'],
								['Hopeless', 'No attempt possible']
							]
						}
					]
				},
				{
					id: 'opposed-rolls',
					title: 'Opposed & Differential Rolls',
					blocks: [
						{
							kind: 'prose',
							text: 'Opposed: both sides roll their skill; better success tier wins. Tied tiers → highest roll (still within success range) wins.'
						},
						{
							kind: 'prose',
							text: 'Differential (used for combat): margin between success tiers grants the winner 1–3 Special Effects.'
						},
						{
							kind: 'table',
							columns: ['', 'vs. Crit', 'vs. Success', 'vs. Fail', 'vs. Fumble'],
							rows: [
								['Crit', '—', 'Win 1', 'Win 2', 'Win 3'],
								['Success', 'Lose 1', '—', 'Win 1', 'Win 2'],
								['Fail', 'Lose 2', 'Lose 1', '—', '—'],
								['Fumble', 'Lose 3', 'Lose 2', '—', '—']
							]
						},
						{
							kind: 'note',
							text: 'Skills over 100%: the top skill subtracts (its value −100) from everyone’s skill in the contest, including its own.'
						}
					]
				},
				{
					id: 'characteristics',
					title: 'Characteristics',
					blocks: [
						{
							kind: 'defs',
							items: [
								{ term: 'STR', text: 'Physical strength; feeds Damage Modifier' },
								{ term: 'CON', text: 'Constitution; feeds Healing Rate, HP' },
								{ term: 'SIZ', text: 'Size/mass; feeds Damage Modifier, HP, Height/Weight' },
								{ term: 'DEX', text: 'Agility; feeds Action Points, Initiative' },
								{ term: 'INT', text: 'Reasoning; feeds Action Points, Initiative' },
								{ term: 'POW', text: 'Willpower; feeds Magic Points, Luck Points' },
								{ term: 'CHA', text: 'Charisma; feeds Experience Modifier' }
							]
						},
						{ kind: 'note', text: 'Humans: 3d6 for STR/CON/DEX/POW/CHA; 2d6+6 for SIZ/INT.' }
					]
				},
				{
					id: 'damage-modifier',
					title: 'Damage Modifier',
					blocks: [
						{
							kind: 'table',
							caption: 'By STR + SIZ',
							columns: ['STR + SIZ', 'Modifier'],
							rows: [
								['5 or less', '−1d8'],
								['6–10', '−1d6'],
								['11–15', '−1d4'],
								['16–20', '−1d2'],
								['21–25', '+0'],
								['26–30', '+1d2'],
								['31–35', '+1d4'],
								['36–40', '+1d6'],
								['41–45', '+1d8'],
								['46–50', '+1d10'],
								['51–60', '+1d12'],
								['61–70', '+2d6']
							]
						},
						{ kind: 'note', text: 'Each +10 after that continues the progression.' }
					]
				},
				{
					id: 'derived-attributes',
					title: 'Other Derived Attributes',
					blocks: [
						{
							kind: 'defs',
							items: [
								{
									term: 'Action Points',
									text: 'INT+DEX: ≤12 = 1, 13–24 = 2, 25–36 = 3, +1 per further 12'
								},
								{
									term: 'Experience Mod.',
									text: 'CHA: ≤6 = −1, 7–12 = 0, 13–18 = +1, +1 per further 6'
								},
								{ term: 'Healing Rate', text: 'CON: ≤6 = 1, 7–12 = 2, 13–18 = 3, +1 per further 6' },
								{ term: 'Luck Points', text: 'POW: ≤6 = 1, 7–12 = 2, 13–18 = 3, +1 per further 6' },
								{ term: 'Magic Points', text: '= POW' },
								{ term: 'Initiative Bonus', text: 'Average of DEX and INT' }
							]
						}
					]
				}
			]
		},
		{
			id: 'skills',
			title: 'Skills & Passions',
			sections: [
				{
					id: 'standard-skills',
					title: 'Standard Skills',
					blocks: [
						{
							kind: 'table',
							caption: 'Base % formula',
							columns: ['Skill', 'Base %'],
							rows: [
								['Athletics', 'STR+DEX'],
								['Boating', 'STR+CON'],
								['Brawn', 'STR+SIZ'],
								['Conceal', 'DEX+POW'],
								['Customs', 'INT×2'],
								['Dance', 'DEX+CHA'],
								['Deceit', 'INT+CHA'],
								['Drive', 'DEX+POW'],
								['Endurance', 'CON×2'],
								['Evade', 'DEX×2'],
								['First Aid', 'INT+DEX'],
								['Influence', 'CHA×2'],
								['Insight', 'INT+POW'],
								['Locale', 'INT×2'],
								['Native Tongue', 'INT+CHA'],
								['Perception', 'INT+POW'],
								['Ride', 'DEX+POW'],
								['Sing', 'CHA+POW'],
								['Stealth', 'DEX+INT'],
								['Swim', 'STR+CON'],
								['Unarmed', 'STR+DEX'],
								['Willpower', 'POW×2'],
								['Combat Style(s)', 'STR+DEX']
							]
						}
					]
				},
				{
					id: 'professional-skills',
					title: 'Professional Skills',
					blocks: [
						{
							kind: 'table',
							caption: 'Culture/career-dependent',
							columns: ['Skill', 'Base %'],
							rows: [
								['Acting', 'CHA×2'],
								['Acrobatics', 'STR+DEX'],
								['Art', 'POW+CHA'],
								['Binding *', 'POW+CHA'],
								['Bureaucracy', 'INT×2'],
								['Commerce', 'INT+CHA'],
								['Courtesy', 'INT+CHA'],
								['Craft', 'DEX+INT'],
								['Culture (other)', 'INT×2'],
								['Devotion *', 'POW+CHA'],
								['Disguise', 'INT+CHA'],
								['Engineering', 'INT×2'],
								['Exhort *', 'INT+CHA'],
								['Folk Magic *', 'POW+CHA'],
								['Gambling', 'INT+POW'],
								['Healing', 'INT+POW'],
								['Invocation *', 'INT×2'],
								['Language (other)', 'INT+CHA'],
								['Literacy', 'INT×2'],
								['Lockpicking', 'DEX×2'],
								['Lore (specific)', 'INT×2'],
								['Mechanisms', 'DEX+INT'],
								['Meditation *', 'INT+CON'],
								['Musicianship', 'DEX+CHA'],
								['Mysticism *', 'POW+CON'],
								['Navigation', 'INT+POW'],
								['Oratory', 'POW+CHA'],
								['Seamanship', 'INT+CON'],
								['Seduction', 'INT+CHA'],
								['Shaping *', 'INT+POW'],
								['Sleight', 'DEX+CHA'],
								['Streetwise', 'POW+CHA'],
								['Survival', 'CON+POW'],
								['Teach', 'INT+CHA'],
								['Track', 'INT+CON'],
								['Trance *', 'POW+CON']
							]
						},
						{
							kind: 'note',
							text: '* Magic skill pairs by discipline: Animism = Binding & Trance; Mysticism = Meditation & Mysticism; Theism = Devotion & Exhort; Sorcery = Invocation & Shaping.'
						}
					]
				},
				{
					id: 'passions',
					title: 'Passions',
					blocks: [
						{
							kind: 'table',
							caption: 'Starting %',
							columns: ['Passion', 'Starting %'],
							rows: [
								['Person (romantic/familial)', '30 + loved one’s POW+CHA'],
								['Person (platonic loyalty)', '30 + own POW, subject’s CHA'],
								['Person (aversion)', '30 + own POW, subject’s CHA'],
								['Organisation/group', '30 + own POW+INT'],
								['Race or species', '30 + own POW×2'],
								['Place', '30 + own POW+INT'],
								['Object/substance', '30 + own POW×2'],
								['Concept/ideal', '30 + own POW+INT']
							]
						},
						{
							kind: 'note',
							text: 'Rolled like a skill (1d100 vs. Passion %) to invoke heroic/reckless surges of will in relevant moments.'
						}
					]
				},
				{
					id: 'hit-points-location',
					title: 'Hit Points by Location',
					blocks: [
						{
							kind: 'table',
							caption: 'CON+SIZ, humanoid',
							columns: ['Location', '1–10', '11–20', '21–30'],
							rows: [
								['Leg (each)', '1–2', '3–4', '5–6'],
								['Abdomen', '2–3', '4–5', '6–7'],
								['Chest', '3–4', '5–6', '7–8'],
								['Arm (each)', '1', '2–3', '4–5'],
								['Head', '1–2', '3–4', '5–6']
							]
						},
						{
							kind: 'note',
							text: 'Ranges scale by CON+SIZ in bands of 5; each location gains +1 HP per further 5 points.'
						}
					]
				}
			]
		},
		{
			id: 'combat',
			title: 'Combat',
			sections: [
				{
					id: 'initiative',
					title: 'Initiative & Round Structure',
					blocks: [
						{ kind: 'formula', text: 'Initiative = 1d10 + Initiative Bonus' },
						{ kind: 'prose', text: 'Highest acts first, descending; ties act concurrently.' },
						{ kind: 'prose', text: 'Initiative penalty: total armour ENC ÷ 5, rounded up.' },
						{
							kind: 'prose',
							text: 'Surprise: −10 to initiative, flat-footed until your turn, and the first hit against you gains a bonus Special Effect.'
						},
						{
							kind: 'note',
							text: 'Round = 5 seconds. Cycle = one pass through initiative order. Each character acts as many times per round as their Action Points.'
						}
					]
				},
				{
					id: 'actions',
					title: 'Actions',
					blocks: [
						{ kind: 'prose', text: 'Default cost: 1 Action Point per action.' },
						{
							kind: 'defs',
							items: [
								{
									term: 'Proactive',
									text: 'Attack, Cast Magic, Move, Ready Weapon, Change Range, Mount, Outmanoeuvre — only on your own turn'
								},
								{
									term: 'Reactive',
									text: 'Parry, Evade, Counter Spell, Interrupt, Ward Location — usable anytime you have AP'
								},
								{ term: 'Free', text: 'Assess Situation, Drop Weapon, Signal — no AP cost' }
							]
						}
					]
				},
				{
					id: 'attack-sequence',
					title: 'Attack vs. Defense — Sequence',
					blocks: [
						{ kind: 'prose', text: '1. Attacker spends 1 AP, rolls Combat Style.' },
						{ kind: 'prose', text: '2. Defender may spend 1 AP to Parry/Evade, rolling their skill.' },
						{
							kind: 'prose',
							text: '3. Compare as a Differential Roll — the better tier wins the margin.'
						},
						{
							kind: 'prose',
							text: '4. The margin grants the winner 1–3 Special Effects (chosen freely, may stack where noted) — independent of whether damage lands.'
						},
						{
							kind: 'prose',
							text: '5. If the attacker succeeded or critted, roll weapon damage + Damage Modifier; determine Hit Location.'
						},
						{
							kind: 'prose',
							text: '6. If the defender succeeded or critted (parried), reduce damage per weapon Size comparison.'
						},
						{
							kind: 'note',
							text: 'No parry available (no AP, or declined) = automatic failure, granting the attacker’s Special Effects outright.'
						}
					]
				},
				{
					id: 'parry-reduction',
					title: 'Parry Damage Reduction',
					blocks: [
						{
							kind: 'table',
							caption: 'By weapon Size',
							columns: ['Parrying weapon vs. attacker’s', 'Result'],
							rows: [
								['Equal or bigger', 'All damage stopped'],
								['1 size smaller', 'Half damage stopped'],
								['2+ sizes smaller', 'No damage stopped']
							]
						},
						{ kind: 'note', text: 'Sizes run Small < Medium < Large < Huge < Enormous.' }
					]
				},
				{
					id: 'special-effects',
					title: 'Special Effects',
					blocks: [
						{
							kind: 'table',
							caption: 'Selected examples',
							columns: ['Effect', 'Requires'],
							rows: [
								['Bypass Armour', 'Attacker crits; stackable'],
								['Maximise Damage', 'Attacker crits; stackable'],
								['Bleed', 'Cutting weapons'],
								['Bash / Stun Location', 'Bludgeoning'],
								['Impale', 'Impaling weapons'],
								['Sunder', 'Axes, 2H weapons'],
								['Disarm Opponent', 'Offensive or defensive'],
								['Trip Opponent', 'Offensive or defensive'],
								['Choose Location', 'Pick the hit location'],
								['Circumvent Parry', 'Attacker crits'],
								['Force Failure', 'Opponent fumbles'],
								['Entangle', 'Entangling weapons']
							]
						},
						{
							kind: 'note',
							text: 'The full list runs to roughly 40 named effects covering offense, defense, and ranged-specific options.'
						}
					]
				},
				{
					id: 'hit-location',
					title: 'Hit Location',
					blocks: [
						{
							kind: 'table',
							caption: '1d20, humanoid',
							columns: ['Roll', 'Location'],
							rows: [
								['1–3', 'Right Leg'],
								['4–6', 'Left Leg'],
								['7–9', 'Abdomen'],
								['10–12', 'Chest'],
								['13–15', 'Right Arm'],
								['16–18', 'Left Arm'],
								['19–20', 'Head']
							]
						},
						{
							kind: 'note',
							text: 'Mounted attacker vs. a lower target: roll 1d10+10 instead, favouring upper locations.'
						}
					]
				},
				{
					id: 'damage-wounds',
					title: 'Damage Resolution & Wounds',
					blocks: [
						{
							kind: 'prose',
							text: 'Order: Damage Modifier → magic adjustments → parry reduction (by Size) → subtract Armour Points at that location.'
						},
						{
							kind: 'defs',
							items: [
								{
									term: 'Minor Wound',
									text: 'Location HP still positive — a scratch, no real effect'
								},
								{
									term: 'Serious Wound',
									text: 'Location HP ≤ 0 — stunned 1d3 turns; failed Endurance vs. the attack roll cripples the limb or (torso/head) knocks unconscious'
								},
								{
									term: 'Major Wound',
									text: 'Location HP negative by its own starting max — incapacitated, prone; failed Endurance = unconsciousness (limb) or instant death (torso/head)'
								}
							]
						}
					]
				},
				{
					id: 'charging-knockback',
					title: 'Charging & Knockback',
					blocks: [
						{
							kind: 'prose',
							text: 'Charging: needs a full round of movement first; the attack is one grade harder; Damage Modifier improves one step (two for quadrupeds); weapon Size effectively +1.'
						},
						{
							kind: 'prose',
							text: 'Knockback: triggers when raw damage (pre-parry/armour) exceeds the target’s SIZ; the target rolls Easy Acrobatics or Standard Athletics or falls prone, pushed back 1m per 5 points over SIZ.'
						}
					]
				}
			]
		},
		{
			id: 'magic',
			title: 'Magic',
			sections: [
				{
					id: 'casting-basics',
					title: 'Casting Basics',
					blocks: [
						{
							kind: 'prose',
							text: 'Requires: clear thought, a free hand for gesture, the ability to vocalise, and (usually) sight of the target — losing any of these makes casting harder or impossible.'
						},
						{
							kind: 'prose',
							text: 'While casting: walking pace only, no Attack action, only Free/Reactive actions permitted.'
						},
						{
							kind: 'defs',
							items: [
								{
									term: 'Minor Wound while casting',
									text: 'Willpower check or the spell is one grade harder'
								},
								{
									term: 'Serious Wound',
									text: 'Willpower check: pass = one grade harder, fail = two'
								},
								{ term: 'Major Wound', text: 'Casting automatically fails' },
								{ term: 'Mental domination', text: 'Casting automatically fails' }
							]
						}
					]
				},
				{
					id: 'magnitude-intensity',
					title: 'Magnitude vs. Intensity',
					blocks: [
						{
							kind: 'prose',
							text: 'Magnitude: how hard the effect is to dispel. Intensity: the effect’s raw power (e.g. Sorcery Intensity = one-tenth of Invocation skill). Neither changes with the casting roll’s Difficulty Grade.'
						},
						{
							kind: 'note',
							text: 'Magic from different disciplines never stacks; same-discipline effects with similar purpose don’t stack either — the higher Intensity (or newer, on a tie) prevails.'
						}
					]
				},
				{
					id: 'magic-points',
					title: 'Magic Points Economy',
					blocks: [
						{
							kind: 'prose',
							text: 'Base attribute: MP = POW. Spending fuels spells, miracles, and talents at a per-ability cost.'
						},
						{
							kind: 'defs',
							items: [
								{ term: 'Self (default)', text: 'Own MP, recovers with rest' },
								{ term: 'Sacrifice', text: 'Creature’s POW (or 1d3/1d6/2d6/3d6+ by size)' },
								{
									term: 'Magical location/object',
									text: '25/50/75/100% of MP attribute, per its Magical Strength'
								},
								{ term: 'Veneration', text: '25% (<100 worshippers) up to 100% (10,000+)' }
							]
						},
						{
							kind: 'note',
							text: 'Only the single best available source counts per recovery period — sources don’t stack. Recovery is paced 1 MP/hour to 1 MP/week depending on setting. Running out (default): you simply can’t cast further, no extra penalty.'
						}
					]
				},
				{
					id: 'learning-abilities',
					title: 'Learning New Abilities',
					blocks: [
						{
							kind: 'table',
							columns: ['Discipline', 'Ability', 'XP Rolls', 'Time'],
							rows: [
								['Folk Magic', 'Cantrip/Charm', '3', '1 week'],
								['Animism', 'Spirit', '5', '1 month'],
								['Mysticism', 'Talent', '5', '1 month'],
								['Sorcery', 'Spell', '5', '1 month'],
								['Theism', 'Miracle', '5', '1 month']
							]
						},
						{
							kind: 'note',
							text: 'A beginning magician knows 1 ability per full 20% (or part) of their governing magic skill.'
						}
					]
				},
				{
					id: 'disciplines',
					title: 'The Five Magical Disciplines',
					blocks: [
						{
							kind: 'defs',
							items: [
								{
									term: 'Folk Magic (Folk Magic, POW+CHA)',
									text: 'Simple community-taught cantrips, limited effects, open to almost anyone; content varies by culture.'
								},
								{
									term: 'Animism (Binding & Trance)',
									text: 'Builds relationships with spirits bound to the mortal world to work magic; teaches restraint and reciprocation with nature.'
								},
								{
									term: 'Mysticism (Meditation & Mysticism)',
									text: 'Inner contemplation and philosophical insight channel power from within the self, not an external source.'
								},
								{
									term: 'Sorcery (Invocation & Shaping)',
									text: 'Manipulates the mathematical and existential “laws” underlying reality directly; needs no gods or spirits, flexible but viewed with suspicion.'
								},
								{
									term: 'Theism (Devotion & Exhort)',
									text: 'Miracles drawn from a worshipped deity via devotion; power scales with the strength of that relationship and matches the god’s portfolio.'
								}
							]
						}
					]
				},
				{
					id: 'quick-reminders',
					title: 'Quick Reminders',
					blocks: [
						{ kind: 'prose', text: '01–05 always succeeds, 96–00 always fails, no matter the skill.' },
						{
							kind: 'prose',
							text: 'Special Effects resolve independently of damage — you can win effects and still get hit, or vice versa.'
						},
						{
							kind: 'prose',
							text: 'Armour reduces damage before Hit Points are touched; 0 AP means that armour location is useless.'
						},
						{
							kind: 'prose',
							text: 'A Combat Style is rolled like any Standard Skill (base STR+DEX) for both attack and parry.'
						}
					]
				}
			]
		}
	]
};
