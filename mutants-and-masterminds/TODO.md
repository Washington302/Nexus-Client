# TODO

## Bug: No way for other players to join a campaign

**Files:** `src/routes/campaigns/[id]/+page.svelte` (Roster panel, lines 108-134), `src/lib/services/api.ts` (`campaign` object, lines 403-423). Backend: `nexus-core`'s `src/main/java/nexus/api/nexuscore/Generic/Controllers/CampaignController.java`.

**Root cause found:** the backend already has a working self-join endpoint — `POST /api/v1/campaigns/{id}/join` (`CampaignController.java` lines 102-119) — which adds the calling user as a `PLAYER` member if they aren't one already. The frontend never calls it:

1. `api.ts`'s `campaign` object has no `join` method at all (only `create`, `myCampaigns`, `get`, `delete`, `addMember`, `removeMember`).
2. The only way to add a member today is the **owner-only** "Invite" flow (`campaigns/[id]/+page.svelte` lines 121-133, gated by `{#if isOwner}`), which does an email lookup (`api.users.lookupByEmail`) and calls `addMember` — a non-owner has no self-serve way to add themselves.
3. Even if a join button existed, it wouldn't help without more work: `GET /api/v1/campaigns/{id}` (`getCampaign`, `CampaignController.java` line 59) gates on `campaignRepository.findByIdAndUserAccess(id, user.getId())`, which 404s for non-members. So a user who isn't already a member can't load `/campaigns/{id}` to find a join button in the first place — there's currently no way for them to even discover/view a campaign they aren't in yet, e.g. no shareable invite link/code containing the campaign ID that a prospective member could visit.

**Fix, roughly in this order:**
- Add `join: (id: string) => request<Campaign>(`/api/v1/campaigns/${id}/join`, { method: 'POST' })` to `api.ts`'s `campaign` object.
- **Give the owner a join link or share code to hand out**, since that's the actual missing piece — right now there's no way for a prospective member to even learn a campaign's ID:
  - Simplest option (no backend change): the campaign's `id` is already a random UUID (`CampaignController.createCampaign`, line 39, `UUID.randomUUID().toString()`), so it's already unguessable — reuse it as the link. Add a new frontend-only route, e.g. `src/routes/campaigns/join/[id]/+page.svelte`, that on load just calls the new `api.campaign.join(id)` (hitting `/join` directly by `findById`, so it works even though the user isn't a member yet and `GET /{id}` would 404 for them) and then redirects to `/campaigns/{id}`. The owner copies that URL from the campaign page (`campaigns/[id]/+page.svelte`, next to the existing Roster panel) and shares it with the player out-of-band (Discord, text, etc).
  - Nicer-UX alternative (needs backend work): add a short, human-typeable `shareCode` field to `Campaign` (`nexus-core`'s `Generic/Models/Campaign.java`) generated at creation, plus a `GET /api/v1/campaigns/by-code/{code}` lookup endpoint so the join page can resolve a 6-8 character code instead of a full UUID — better if codes need to be read aloud or typed manually rather than always shared as a clickable link.
- Add the join UI (an input/button on `campaigns/+page.svelte` for "Join with link/code", or just document the link the owner shares) using whichever option above is chosen.

## Bug: Linking a character to a campaign is non-functional (investigation started)

**Files:** `src/routes/campaigns/[id]/+page.svelte` (`handleLinkCharacter`, lines 84-97). Backend: `nexus-core`'s `MutantsAndMasterminds/Controllers/MnMCharacterController.java` (`updateCharacter`, lines 103-121) and `Services/MnMCharacterService.java` (`updateCharacter`, lines 35-41).

**Prime suspect, confirmed in the source:** `handleLinkCharacter()` swallows every error silently:

```ts
try {
    const char = session.characters.find((c) => c.id === linkCharacterId);
    if (!char) return;
    await api.character.update(char.id, { ...char, campaignId: campaign.id });
    linkedCharacters = await api.character.byCampaign(campaign.id);
    linkCharacterId = '';
} catch {}
finally { linking = false; }
```

If the `PUT` fails for *any* reason, the user sees nothing — no error message, the dropdown doesn't clear, the character just never shows up under "Linked Characters," and there's no console log or UI state to tell you why. This alone is enough to make the feature look completely broken even when only some requests are failing. **This needs a visible `linkError` message (mirroring `inviteError` right above it in the same file) before anything else can be diagnosed from the live UI.**

**Other things to check once errors are visible, in likely order of suspicion:**
1. `MnMCharacterController.updateCharacter` (PUT) runs `validationService.validateCharacter(updated)` and returns `422 Unprocessable Entity` with an error list if it fails (line 116-119) — if a character has pre-existing validation issues unrelated to campaign linking (e.g. an over-cap power, a build that predates a rule change), simply adding `campaignId` to the payload and re-saving would now trip on those and reject the whole save. Worth checking what `errors` come back for a real failing case.
2. `pointCalculator.recalculateAll(updated)` (line 114) runs before validation on every PUT — if it throws for some character shapes (e.g. edge cases in the array/device code paths this session touched), that'd surface as an unhandled 500, also silently eaten by the empty `catch {}`.
3. Unlike character *creation* (`createCharacter`, lines 45-54), which checks `campaignRepository.findByIdAndUserAccess(request.campaignId(), user.getId())` before allowing a `campaignId` to be set, `updateCharacter` does **no such check** — it saves whatever `campaignId` the client sends, no matter who owns that campaign. Not the cause of things looking broken (if anything this makes it too permissive), but worth fixing alongside this since it's a real gap: a user could PUT any campaign's ID onto their own character.
4. `linkableCharacters` (`campaigns/[id]/+page.svelte` line 80-82) filters off of `session.characters`, which is only populated by `loadActiveCharacter()` at login/register (`session.svelte.ts` lines 35-51) — if a character was created or its `campaignId` changed elsewhere in the same session without a full reload, this list could be stale. Low priority compared to #1-3, but worth ruling out if the error message (once visible) says the request itself is succeeding.

**Fix, in order:** surface `linkError` in the UI first, reproduce the actual failure against a real character, then follow whichever of #1-3 the real error points to.

## Bug: Summon effect UI can get permanently stuck hidden once unchecked

**File:** `src/lib/components/editors/EffectEditor.svelte`, line 60:

```svelte
{#if effect.effectName?.toLowerCase() === 'summon' || effect.summon}
	<label class="summon-toggle">
		<input type="checkbox" bind:checked={effect.summon} />
```

The Summon checkbox (and everything under it — minion name, Edit Minion button, nested minion editor) only renders when the effect's name is the literal string `"summon"`, **or** `effect.summon` is already `true`. Any effect whose name is something else — e.g. `"Summon: Shadow Clone"`, which is exactly how alternate-effect summons are typically named in practice — only shows the checkbox because `effect.summon` happens to already be `true`.

**The trap:** if a user unchecks that checkbox on a non-literally-"summon"-named effect, `effect.summon` becomes `false`. On the next render the `{#if}` condition is now false for both branches, so the whole block — including the checkbox itself — disappears. There is no way to re-enable Summon from the UI at that point without manually renaming the effect to exactly `"Summon"`, toggling it back on, and renaming it back.

**Same fragile match exists in the auto-detection logic** in `src/lib/utils/character.ts` (`calcPower`, lines ~130 and ~147, and the normalize functions ~354/370):

```ts
if (e.effectName?.toLowerCase() === 'summon') e.summon = true;
```

This has the opposite problem: any effect whose name literally is `"Summon"` gets force-flagged as a real summon effect (given a `summonExtension`/minion stat block) even if that's not the intent — there's no way to have an effect just named "Summon" without it being treated as one.

**Suggested fix:** Stop keying summon detection off `effectName` string matching entirely. Use `effect.summon` (and its `isSummon` mirror) as the single source of truth, set explicitly by the user via the checkbox — not auto-derived from the name — and drop the `effectName === 'summon'` checks from both `EffectEditor.svelte`'s render condition and `character.ts`'s `calcPower`/normalize functions. The checkbox itself should always be visible on every effect (not gated on name or current state) so it's never possible to lock yourself out of toggling it.

**Also worth double-checking while in this area:** whether `summonExtension` and its nested `minionStatBlock` are preserved correctly when `effect.summon` is toggled off and back on (data-loss risk), and whether the `MAX_SUMMON_DEPTH` / `isHeroic` nested-minion-editing logic (lines 72-73) behaves correctly for real nested summon chains, since this hasn't been reviewed here yet — only the checkbox-visibility bug above has been confirmed.

## Done: Move "Power Points" out from between Identity and Conditions

**File:** `src/routes/character/+page.svelte`, lines 500-537 (`panel-grid-3` containing Identity, Power Points, Conditions).

Fixed: Identity and Conditions now share a 2-column `.panel-grid`, and Power Points moved out into its own full-width `EditableSectionCard` row below. See the "share page needs the same view updates" item further down — this layout change was only made on `character/+page.svelte`, not the duplicated `share/[id]/+page.svelte`.

## Done: Select Combat Attacks list markup/alignment bug

**File:** `src/routes/character/+page.svelte`, the "Select Combat Attacks" edit-mode list (~line 630-648).

Fixed the markup bug: inside the `{#each selectableEffects as se}` loop, the `<label class="atk-select-item">` and the following `<div class="atk-bonus-row">` were rendered as two independent sibling elements per iteration instead of a shared per-item container, so each row's checkbox+name and its Atk+/Rank+ inputs weren't grouped in the DOM. Wrapped each iteration's label + bonus-row in a single `.atk-select-row` container and moved the row divider border onto that wrapper (`app.css`).

## Done: Abilities editor input boxes not aligned across rows

**File:** `src/lib/components/editors/AbilitiesEditor.svelte`, line 49 (`.field-label`).

This turned out to be the actual bug behind an "abilities don't line up" report — not the `stat-row-8` view-mode bubble grid originally suspected (that CSS was checked and is structurally fine; no fix was needed there). The real issue was in the **edit-mode Abilities modal**: `.field-label` had no fixed width, so in the flex row layout each ability's input box start position shifted based on that ability's name length (e.g. "STRENGTH" vs "INTELLECT" vs "AWARENESS"). Fixed by giving labels a scoped fixed-width class (`.ability-label { width: 90px; }`) local to this component.

## Done: General Notes via a "Note" complication type

Resolved the simple way instead of adding a separate `notes` field: added a `NOTE` option to the type dropdown in `ComplicationsEditor.svelte` (line 25), so a general note is just a complication with `type: "NOTE"`. No backend change needed since `Complication.type` is a plain string on both sides. Nothing further to do here unless the "Notes & Complications" display (`+page.svelte` ~line 762-769) needs a nicer label/rendering for the `NOTE` badge specifically (it currently displays the raw type string like every other complication type).

## Done: Verify attack-roll bonus vs. DC formula for Damage effects

**Files:** `src/routes/character/+page.svelte` (`getAttackBonus`, ~line 370, `getAttackActions`, ~line 394), `src/routes/share/[id]/+page.svelte` (`getAttackBonus` ~line 96, `attackActions` ~line 134).

Confirmed correct: `getAttackBonus()` computes Fighting (close) or Dexterity (ranged) mod + Close/Ranged Combat skill ranks + Close/Ranged Attack advantage ranks — never the effect's rank. `resistDC = isDamaging ? effectRank + 15 : effectRank + 10` is only ever added to the resisted DC, never the attack roll. The per-effect `💪` toggle (`_isThrownWeapon` in `EffectEditor.svelte` line 38, tooltip "Strength-based damage") adds Strength to the effect rank for melee Strength-based Damage effects before the DC calc, matching the RAW rule that Strength (not Fighting) determines melee damage rank. Also fixed a drift bug where `share/[id]/+page.svelte`'s auto-hit range-label check only tested for `'area'` and missed `burst`/`cone`/`cloud`/`line` (now matches `character/+page.svelte`).

## Bug: Reaction-modifier effects aren't detected as automatic/no-roll attacks

**Files:** `src/routes/character/+page.svelte` (`autoHit` detection, lines 317-319 and 401-403 — two separate copies), `src/routes/share/[id]/+page.svelte` (same logic, line ~140-142).

**Example:** a "Flame Burst" Damage effect built with the Reaction extra (+3/rank) — Reaction means the effect triggers automatically when an opponent hits you in close combat, so it should never roll an attack bonus at all, and per RAW any effect that hits without an attack roll is capped at Rank ≤ PL (not the normal Attack Bonus + Effect Rank ≤ PL×2 cap).

**Current behavior:** `autoHit` is only set from `isPerception || isArea` (checking modifier names for `perception`/`area`/`burst`/`cone`/`cloud`/`line`) — there's no check for a `reaction` modifier. So a Reaction-based effect currently still gets a computed `attackBonus` from `getAttackBonus()` and gets checked against the looser `combined = ab + effectRank <= PL*2` cap in `plCaps` (line 330-336) instead of the stricter `effectRank <= PL` auto-hit cap it should use (line 333-334 already has the stricter check — it just needs `autoHit` to actually be `true` for Reaction effects to reach it).

**Fix:** add a `isReaction = modNames.some((n) => n.includes('reaction'))` check and fold it into `autoHit` (`const autoHit = isPerception || isArea || isReaction;`) in all three locations (character page's `plCaps` walk, character page's `getAttackActions`, and the share page's `attackActions`). Also check `rangeLabel`/`AttackAction.range` display — a Reaction effect isn't really "Close" or "Ranged" in the way the UI currently labels non-auto-hit actions, so the label logic (`character/+page.svelte` line 421) may need a "Reaction" range label alongside "Area"/"Perception".

## Note: Cost formula is correct in isolation — audit specific effects showing wrong totals

**File:** `src/lib/utils/character.ts`, `effectCost`/`perRankCost` (lines 40-66).

Worked example from Flame Burst (Damage, Rank 10, Extra: Reaction +3/rank, Flaw: Limited -1/rank, Flaw: Distracting -1/rank): expected net rate is `1 (base) + 3 (Reaction) - 1 (Limited) - 1 (Distracting) = 2 PP/rank`, so `2 × 10 = 20 PP` total. Tracing `effectCost()`, the formula already computes this correctly when the modifiers are present as three separate non-flat entries with the right `type`/`costModifier` values — the function isn't the bug.

**If a specific character's build is showing 30 PP instead of 20 PP for an effect like this** (30 PP implies a net rate of 3/rank, i.e. only *one* of the two -1 flaws is actually being counted), the likely cause is a data problem on that effect's `modifiers` array rather than an engine bug: one of the two flaw modifiers may be missing, duplicated as the wrong one, or entered with `flat: true` (which routes it into the flat-cost bucket instead of reducing `perRank`, so it wouldn't cancel out a whole point of per-rank rate the same way). Open the effect in `EffectEditor.svelte`/`ModifierRow.svelte` and check that both Limited and Distracting are present, `type: 'FLAW'`, `flat: false`, and `costModifier: 1` each, rather than assuming the calculator itself needs a fix.

## Note: Distracting flaw's defense penalty is already supported, just manual

**Files:** `src/lib/components/ConditionsPanel.svelte` (line 7), `src/routes/character/+page.svelte` (line 270), `src/routes/share/[id]/+page.svelte` (line 76).

The "Vulnerable" condition (halves Dodge & Parry, rounded up) already exists as a toggleable condition in `ConditionsPanel.svelte` and is applied in the Dodge/Parry final-value calculation. There's no automatic link from a power's Distracting flaw to toggling Vulnerable when that power is used — the player has to manually flip the Vulnerable condition on when they trigger a Distracting effect and remember to flip it off at the start of their next turn. That's arguably fine for a session-tracked, temporary, opt-in condition (same pattern as Staggered/Dying), so no code change is needed here — noting it so it isn't mistaken for a missing feature.

## Feature: Let arrays name the array itself and its first/active effect, for a simpler view

**Files:** `src/lib/components/editors/PowerCardEditor.svelte` (array toggle + effects header, ~lines 32, 80-87), `src/lib/components/editors/EffectEditor.svelte` (per-effect name input, line ~36), `src/lib/components/PowerDisplayCard.svelte` (Active Slot rendering, ~lines 75-77/30-32).

When a power is turned into an Array, the only names in play right now are the overall `power.name` and each individual effect's `effectName` (e.g. "Damage: Shadow Blade", "Affliction: Shadow Decay" from the active slot). There's no dedicated name for the array as a whole (separate from the power name) or a single label for "the first/active power" as shown in the collapsed/simplified view — right now the active slot just lists every effect's own name individually, with no umbrella label. Add a way to name the array and its active/primary effect grouping so the simplified/collapsed view can show one clean label instead of enumerating every effect name. Needs a data model addition (where does the array name live — on `Power` itself, since `power.array` is already a flag there?) plus editor UI (`PowerCardEditor.svelte`) and display UI (`PowerDisplayCard.svelte`, replacing/augmenting the current "Active Slot" header) updates.

**Status: frontend done, backend still needed.** Added optional `arrayName`, `activeSlotName`, and `activeSlotDescription` fields to the `Power` interface (`src/lib/services/api.ts`), wired up inputs in `PowerCardEditor.svelte` and `DeviceSectionEditor.svelte` (shown when the power/embedded power is an array) and display in `PowerDisplayCard.svelte` (array header name, "Active Slot" label, and active-slot description all fall back to the old behavior when unset — `PowerDisplayCard.svelte` is shared by both `character/+page.svelte` and `share/[id]/+page.svelte`, so the display side already covers both). **These three fields do not exist on the `nexus-core` backend's Power DTO yet** — until the backend model is updated to accept/persist `arrayName`/`activeSlotName`/`activeSlotDescription`, values entered in the UI will not survive a save/reload (silently dropped by the backend on round-trip). Backend work needed: add all three (string, nullable) to the Power entity/DTO on the nexus-core side, matching whatever naming convention that backend uses (see prior boolean-naming gotcha where M&M fields needed `isX`-style prefixes — check whether these string fields need any equivalent convention). Full detail already logged in `nexus-core`'s own `TODO.md`.

## UI: `share/[id]/+page.svelte` needs the same view updates made to `character/+page.svelte`

**File:** `src/routes/share/[id]/+page.svelte`, lines 263-320ish (top `panel-grid-3` with Identity/Power Points/Conditions).

The character page's top row was reworked this session (see the "Move Power Points out from between Identity and Conditions" item above, now done): Identity + Conditions now share a 2-column `.panel-grid`, and Power Points moved into its own full-width `EditableSectionCard` below. **The share page still has the old 3-column `panel-grid-3` layout** with Identity, Power Points, and Conditions squeezed into three columns (line 263) — it was never updated to match. Since the share page's Identity block is also a separate hardcoded static display (not the `IdentityPanel.svelte` component), it doesn't have the same height-growth problem that motivated the original fix, but it's still worth mirroring the layout change for consistency between the editable and shared/read-only views.

Note: some of this session's other display fixes (combat table column alignment in `AttackActionCard.svelte`/`.atk-hdr-row`, Notes & Complications badge width in `.comp-badge`, the array-naming/description feature in `PowerDisplayCard.svelte`) are already shared between both pages via common components/global CSS, so those did **not** need a separate share-page update — only the `panel-grid-3` → `panel-grid` + standalone Power Points layout change (which lives directly in each page's markup, not a shared component) still needs to be ported over.
