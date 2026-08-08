# witcher-site TODO

## Blocked on a backend deploy

- **`FAIL_ON_NULL_FOR_PRIMITIVES` fix (`1a736c7`) is committed but not deployed.**
  Until it ships, omitting _any_ primitive on a client-constructed sub-object 400s
  the whole save. Worked around by always sending every primitive (see
  `createDefaultAbility`), so nothing is broken today — but keep the workaround
  until the deploy lands, and be careful adding new client-built sub-objects.

## Wired up and verified against the deployed backend

- `Race.WITCHER` — deployed, saves and persists.
- `Statistics.current*` (nine) — deployed; attribute table Max/Current is live.
- `ProfessionInfo.abilities` — deployed; the free-form tree persists, including
  `currentLevel`.
- `DerivedStats.woundThreshold` — deployed; shown as a marker + "Wounded" flag on
  the HP bar. The server exposes the number but deliberately does not auto-apply
  the stat penalties, so this is advisory only.
- `LevelingInfo.{creationComplete, improvementPointsEarned, improvementPointsAvailable}`
  — deployed and driving the budget box (see below).
- `Skill.currentPoints` / `currentTotal` — deployed and typed, but not yet
  surfaced; the skill editor still edits purchased `points` only.

## Improvement Point economy — done, verified end-to-end

The Skills tab's budget box switches on `levelingInfo.creationComplete`: Creation
Budgets before, Improvement Points after, with a "Finish creation" checkbox and an
Award / Correct I.P. action posting to `POST /{id}/improvement-points`.

Verified against the deployed server:

- Award of 10 → Available 10 / Earned 10.
- Alchemy 1→2 debited **2**, not 1 — the ×2 difficult-skill multiplier is correct.
- An unaffordable raise is rejected with
  `Insufficient Improvement Points: this advancement costs 660 I.P. but only 8
available`, surfaced in the SaveBar.
- Lowering a stat back down is free and **not** refunded (anti-laundering, by
  design).

Still open here:

- Show `currentPoints`/`currentTotal` distinctly from purchased `points` in the
  skill groups — a crit can drain current without touching what was bought. The
  skill editor still edits `points` only, so drained values can't be entered yet.
- Surface `levelingInfo.level` and `reputation` somewhere (stored, never shown).
- The IP award has a `reason` field that goes nowhere — worth wiring into the
  session log.
- Swordsmanship 4→7 = 15 (the changelog's other cost check) still unexercised.

## Alchemy tab — done, verified end-to-end

Substances own their ingredients: nine collapsible groups showing extracted
substance on hand, expanding to the ingredients that yield it. Adding an ingredient
inside a group pre-assigns that substance; changing "Yields" moves it between
groups. Plus Toxicity, Carried Doses with a Take action, Active Effects, and Known
Formulae.

`yieldsSubstance` is required — every alchemical ingredient yields exactly one
substance, so there's no catch-all group. Caveat: a legacy row with a null substance
would render in no group at all (invisible, not deleted). If the pending ingredient
rename migrates old data, make sure typeless rows are moved to crafting materials
rather than left in the alchemy list.

Verified against the deployed server:

- Toxicity is server-computed from `activeAlchemyEffects` and ignores the client —
  sent 9999 with effects of 75 + 50, got back **125** against threshold 100.
- Taking a dose decrements stock, pushes its toxicity live, and disables Take at
  zero. Two 75% doses → 150/100 with the over-threshold flag; server agreed.
- Clear-all-effects (the White Honey path) returns toxicity to 0.
- Ingredient reassignment moves it between groups and persists.

**`substanceStore` seeding is handled client-side, not by a backfill.**
`normalizeSubstanceStore()` renders the canonical nine and merges whatever the
server sent by `substance`, so it's correct for seeded, empty, partial, reordered
or duplicated stores. A character created before the alchemy module showed all nine
and they persisted on first save. If backend durability is wanted later, normalising
inside `recalculateAll` is the idempotent version — a one-off migration is weaker,
since it only fixes documents that exist today.

Not modelled, by decision: the poisoned state and the DC:18 Endurance check — table
adjudication, with the numbers on screen to judge it.

## Crafting: decided — Alchemy is not the catch-all

Mundane crafting is occasional; alchemy is the real system. So Alchemy keeps its own
tab and does **not** absorb general crafting.

Where things live:

- **Alchemical ingredients** — under their substance on the Alchemy tab. Every one
  yields exactly one substance; that closed nine-way grouping is what makes the
  accordion work, and mundane materials have no equivalent axis to group on.
- **Mundane crafting materials** — Gear, alongside the rest of inventory. They carry
  weight and encumber, which is Gear's job; the Alchemy tab has no concept of either.
- **Recipes** — Formulae and Diagrams belong together as one filterable list when
  Gear is built. They're the same card (name, DC, time, components, cost) answering
  the same question, so don't build that twice. `AlchemyFormula` already has the
  right shape.

Backend gap when this is picked up: there's no mundane Diagram/recipe model.
`CraftedItem {name, type, qualityNotes}` is crafted _output_, not a recipe. Either
add a Diagram model or widen `AlchemyFormula` (its `type` enum already has `OTHER`)
— worth deciding before the Gear tab starts.

## Rules coverage gaps (audited against the 7-step creation summary)

Backend-and-frontend both missing:

- **Death State** — the wound threshold itself is now live (see above); the
  death/dying rules are not.
- **Social Standing** (Equal/Feared per race: Feared = +1 Intimidate, −1 Charisma)
  and mechanical racial perks — `RaceInfo` only has free-text traits today.
- **Over-encumbrance penalty** (−1 REF/DEX/SPD per 5 over ENC) — display-only today.
- **Weapon fields:** WA (Weapon Accuracy) and Reliability missing from
  `MeleeWeapon`/`RangedWeapon`; AE (enhancement slots) missing from `ArmorItem`.
  Armor already has SP + EV; EV should eventually subtract from REF/DEX.
- **Per-profession starting wealth** (e.g. Mage 1,200 / Witcher 300 crowns) — add
  to `WitcherProfessionData`; `Wealth {crowns, notes}` exists but is never seeded.
- **Random stat generation** (1d10 ×9, rerolling 1s and 2s) as an alternative to
  point-buy.
- **Allies & Enemies** tracking (social/physical/magical power + how met).
- **Luck as a refill-per-session spend pool** — pending `current*` stat fields
  cover manual spend; refill-at-session-start could hook into the session log.

Backend exists, needs UI (still typed-as-unknown placeholders in api.ts):

- `Wealth`, `MeleeWeapon`, `RangedWeapon`, `ArmorItem`, `EquipmentItem`,
  `CraftedItem` — the Gear tab, plus mundane crafting materials and diagrams per the
  decision above. Note the model gaps (no WA/Reliability/AE) before building it.
- `KnownSign`, `KnownSpell`, `KnownInvocation`, `KnownRitual`, `KnownHex` — the
  Magic tab.

The skill tree's unlock rule is still unbuilt: per the book a path's next tier
opens when a skill in it reaches level 5, and branches have per-profession names
(e.g. Merchant → Broker/Contact/Havekar). Our tree is free-form 3×3 with no gating.
(`LevelingInfo.unlockedSkillTreeNodes` was removed backend-side, superseded by
`ProfessionInfo.abilities` — the two no longer conflict.)

## Content policy compliance

`WITCHER_CONTENT_POLICY.md` (in nexus-core, untracked) is a hard constraint. Current
state of its frontend checklist:

- ✅ App name is "Scribe Sheets"; the game is a descriptive subtitle only.
- ✅ Both RTG and CDPR disclaimers verbatim at `/legal`, linked from the nav
  dropdown and the home page.
- ✅ Original styling, open-licensed fonts, no official art/logos/trade dress.
- ✅ No paywall or gated features.
- ✅ Placeholders are structural — no rulebook names or prose in seed data,
  tooltips, or placeholder text.

**Do not pre-populate profession abilities, spells, signs, rituals, hexes, or
alchemy formulae from the rulebook.** Player-entered content is what keeps this on
the right side of the "no verbatim text" line — it's a licensing requirement, not a
product preference. Revisit the policy before adding any clone/import/template
feature, since those would turn hand-entered content into a distributable dataset.

## Settled decisions

- **I.P. self-award is intentional.** `POST /{id}/improvement-points` is gated on
  plain ownership, so a player can award themselves points. That's by design: a
  player cheating their own sheet is an interpersonal matter for the table, not a
  problem for the app to police. Do not add GM roles or approval flows to "fix"
  this. The server-owned fields still matter — they stop an ordinary save from
  silently clobbering the balance — but the economy is bookkeeping, not enforcement.

## Open decisions

- Drain rules: should derived stats (HP/Stun/Stamina/Run/…) recalculate from
  _current_ stats when drained, or stay pegged to max? Parked — server currently
  reads max, and the UI shows drained current values only for skill rolls.
