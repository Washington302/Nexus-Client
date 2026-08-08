# nexus-core — Witcher module requests

> **Status 2026-08-08.** §2 and §4b are **fixed** in the backend's working tree but
> **not deployed** — verified against the live API, which still returns
> `flatPenalty` and `raceInfo.racialTraits`. Everything below therefore still
> describes production. The frontend has NOT been migrated to the new field names;
> doing so before that deploy would break the live app.
>
> One open question on the new work, raised in §6.

Handoff from the `witcher-site` frontend. **Superseded — most of this shipped.**
Kept as the running list of what's still outstanding.

Everything below was re-verified against the live API, not read off the changelog.
Note the changelog's deploy column was stale: it marks `6532824` as NOT deployed,
but wound threshold, the IP economy fields, and the Skill current/max split are all
live. Worth correcting.

---

## 1. Deploy `1a736c7` — the `FAIL_ON_NULL_FOR_PRIMITIVES` fix

The only outstanding blocker. Committed locally, not deployed.

Today, omitting any primitive on a client-constructed sub-object fails the entire
save:

```
400 Cannot map `null` into type `int` … ProfessionAbility["currentLevel"]
```

Cause worth recording: `Jackson2ObjectMapperBuilder.json().build()` registers
`ParameterNamesModule`, which makes Jackson bind through Lombok's
`@AllArgsConstructor` as an implicit creator — so an _absent_ primitive arrives as
`null` and fails. That's module-wide, not specific to `ProfessionAbility`; it only
surfaces on objects the client builds from scratch, since round-tripped ones carry
every field. It also explains `id` coming back `null` instead of a generated UUID.

The local fix (explicit `new ObjectMapper()` with
`FAIL_ON_NULL_FOR_PRIMITIVES` disabled) is correct — it just needs to ship.

**Frontend is working around it** by always sending every primitive, so nothing is
broken in the meantime.

---

## 2. `POST /{id}/improvement-points` loses concurrent adjustments

The endpoint is a read-modify-write on the whole document:

```java
WitcherCharacter existing = characterService.getCharacterById(id);   // read
improvementPointService.adjust(existing, request.amount());           // mutate in memory
return ResponseEntity.ok(characterService.updateCharacter(id, existing)); // write back
```

Two overlapping requests both read the same balance, so one increment is lost.
Measured: three rapid +1 clicks moved the balance by **+2**.

The frontend now serialises its own requests (one in flight at a time), which makes
the +/− stepper exact — verified 5 clicks → +5, 6 clicks → −6. But that's a
client-side mitigation, not a fix: a second browser tab, or the sheet's own autosave
`PUT` landing between the read and the write, can still clobber the balance.

Worth doing server-side: an atomic Mongo `$inc` on the two balance fields instead of
loading and re-saving the whole character. That also avoids the endpoint rewriting
unrelated fields as a side effect of an I.P. award.

---

## 3. Still not built (unchanged from the last handoff)

Deferred on both sides, roughly by gameplay impact:

- **Death State** — the wound threshold is live; the death/dying rules are not.
- **Over-encumbrance penalty** — −1 REF/DEX/SPD per 5 points over ENC.
- **Social Standing** (Equal/Feared) and numeric racial perks — `RaceInfo` still
  holds free-text traits only.
- **Weapon/armor stat fields** — `MeleeWeapon`/`RangedWeapon` lack WA and
  Reliability; `ArmorItem` lacks AE. Armor already has SP and EV; EV should
  eventually subtract from REF/DEX.
- **Per-profession starting wealth** — `Wealth {crowns, notes}` exists but is never
  seeded.
- **Random stat generation** — 1d10 ×9, rerolling 1s and 2s.
- **Allies & Enemies** tracking.
- **Luck per-session refill.**

Skill ceilings (cap-6 creation / cap-10 play) were deliberately dropped: racial
perks legally exceed both and aren't modelled numerically, so a ceiling would
reject valid characters. Agreed — leave them out until perks are numeric.

---

## 4. Verification status

From the changelog's own "Outstanding" list, run against the live server:

- ✅ **`PUT` with `improvementPointsAvailable: 9999` → returns 0.** Server-ownership
  holds.
- ✅ **ISO-8601 timestamps** — `createdAt: "2026-07-14T01:49:34.885"`. The
  `JavaTimeModule` fix works.
- ✅ **The difficult-skill ×2 multiplier is correct.** Alchemy 1→2 debited **2**,
  not 1 (cost = current level 1 × 2). Same code path as the 0→1 case in the list.
- ✅ **Unaffordable advancement is refused** — raising INT 1→12 with 8 available
  returned `Insufficient Improvement Points: this advancement costs 660 I.P. but
only 8 available`, and the save was rejected outright.
- ✅ **Decreases are free and not refunded** — dropping the stat back down cost and
  returned nothing, as designed.
- ⬜ **Swordsmanship 4→7 debits exactly 15** — still unexercised; needs a character
  with a skill actually at 4.

---

## 4b. `statistics.current*` does not persist (confirmed 2026-08-08)

**The nine `current*` stat fields are accepted but never stored.** Verified by
patching `fetch` on the live sheet and diffing the PUT request against its own
response:

```
sent { currentBody: 3, body: 5 }  →  returned { currentBody: 5, body: 5 }
```

The client sends the drained value; the server echoes back the maximum. Reloading
the page shows the stat undrained, so it is not a render bug on our side.

**Root cause: `WitcherDerivedStatsService.syncCurrentToRaisedMax`.** Despite the
name, it never checks that the max was actually raised — it only checks that the
_persisted_ current was undamaged, then overwrites the incoming value:

```java
if (before.getCurrentBody() >= before.getBody()) {   // undamaged when persisted
    after.setCurrentBody(after.getBody());           // ← discards the incoming drain
}
```

So the very first drain of any stat is always lost: the persisted record still shows
it undamaged, the guard passes, and current is snapped back to max. It only sticks
from the second save onward, and only if the first somehow got through.

Suggested fix — add the missing "was it raised?" half of the condition:

```java
if (after.getBody() > before.getBody() && before.getCurrentBody() >= before.getBody()) {
```

That keeps the intended behaviour (buy a level, an undamaged current rides along with
the new ceiling) while letting a save that does not touch the max record a drain.
This matters more now than it did: with critical wounds landing, `current*` is the
working base every wound penalty is calculated from.

This is the field pair the whole Maximum/Current column split exists for — tracking a
stat drained in play is the entire point — so until it persists, that column is
display-only between reloads. Nothing on the frontend needs changing when it lands;
`STAT_TO_CURRENT_FIELD` and `currentStatValue()` already read and write it, and an
unset value correctly falls back to the max.

Related to the open drain-rules question below: whether derived stats should follow
_current_ is a separate call, but persistence is needed either way.

---

## 5. Open decisions

Still unresolved:

- **Drain rules.** Should `recalculateDerivedStats` read _current_ stats, so a
  drained BODY lowers max HP/Stun/Stamina/ENC and drained SPD lowers Run/Leap? It
  currently reads max, which is why the `current*` stat change was safe and
  additive.

---

## 6. `racialTraits` → `perks`: what happens to existing data?

The undeployed work replaces `RaceInfo.racialTraits` (`List<String>`) with
`RaceInfo.perks` (`List<RacialPerk>`). The changelog doesn't mention a migration for
documents already carrying traits.

Unless something converts them, every existing character's racial traits are dropped
the first time it is saved after the deploy: the client stops sending `racialTraits`,
and nothing populates `perks` from it. The model makes the conversion trivial and
lossless — the changelog itself notes "a perk with no modifiers _is_ a narrative
trait" — so each string becomes `{ name: <trait>, description: "", modifiers: [],
active: true }`.

Needed either as a one-off backfill or lazily on read. Worth confirming before the
deploy rather than after, since the data is gone by the time anyone notices.

Frontend side: `RaceProfessionEditor` currently edits traits as a comma-separated
textarea via `listToText`/`textToList`. That becomes a structured list-of-perks editor
with a `StatModifier` sub-editor — the `CriticalWounds` modifier rows are the same
shape and can be lifted into a shared component when the rename lands.

---

## 7. Deploy ordering

Three renames break the wire format in both directions:

| Was                                         | Now                       |
| ------------------------------------------- | ------------------------- |
| `criticalWounds[].*Modifiers[].flatPenalty` | `flatModifier`            |
| `raceInfo.racialTraits`                     | `raceInfo.perks`          |
| —                                           | `raceInfo.socialStanding` |

The frontend can be made order-independent by reading `flatModifier ?? flatPenalty`
and writing both keys — the backend ignores unknown properties, so both versions
accept it. Worth doing only if the two deploys can't be coordinated; otherwise a
straight rename after the backend ships is cleaner.

---

## 8. `age` and `gender` on the shared `Character` base

Neither exists anywhere today. Confirmed by reading the model, not the API:
`Generic/Models/Character.java` holds `id`, `userId`, `gameSystem`, `createdAt`,
`updatedAt`, `name`, `player`, `description`, `portraitUrl`, `isPublic`; the Witcher
subclass adds only game-specific blocks.

**Requested on the base class, not on `WitcherCharacter`.** Age and gender aren't
Witcher-specific — every character in all five sheets has them, and putting them on
the subclass means adding them again for the next game. The base class is where the
other identity fields already live.

```java
private Integer age;        // nullable: unknown age is normal, and 0 is not a sane default
private String gender = ""; // free text
```

`gender` as free text rather than an enum, for the same reason the backend already
made `socialStanding` a String: an enum needs a backend change and a redeploy every
time a table wants a value that isn't on the list.

`age` as a nullable `Integer` rather than a primitive `int` — a primitive would default
to 0 and make "unset" indistinguishable from "a newborn", and it would also trip the
`FAIL_ON_NULL_FOR_PRIMITIVES` problem in §1 for any client that omits it.

**Frontend status:** typed and editable now, with the editor stating plainly that they
do not persist yet. When the fields land, the only change needed is deleting that hint
— the binding and round-trip are already in place.

**Not requested: `origin`.** The Witcher lifepath makes Homeland a rollable table with
mechanical effects (Nilfgaard grants +1 Intimidation), so it is already a
`lifepathEvent` with category `Homeland`. The sheet surfaces that under Identity as
"Origin". A separate string field would store the same fact twice and let the two
drift apart.

---

## 5b. Settled

Settled, so it doesn't get re-raised:

- **The I.P. trust model is deliberate.** Plain-ownership gating on
  `POST /{id}/improvement-points` means a player can award themselves points, and
  that's fine — a player cheating their own sheet is a table problem, not an app
  problem. No GM role or approval flow is wanted. Keep the server-owned fields
  though: they stop an ordinary save from silently overwriting the balance, which
  is about correctness, not policing.
