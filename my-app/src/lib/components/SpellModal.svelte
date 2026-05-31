<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import type { Spell } from '$lib/types';
  import { abilityScoreFromXp } from '$lib/utils/arsmagica';

  let {
    spell = null as Spell | null,
    onSave = (_spell: Spell) => {},
    onClose = () => {},
  } = $props<{
    spell: Spell | null;
    onSave: (spell: Spell) => void;
    onClose: () => void;
  }>();

  const isNew = $derived(spell === null);
  let name = $state(spell?.name ?? '');
  let technique = $state(spell?.technique ?? 'Creo');
  let form = $state(spell?.form ?? 'Animal');
  let level = $state(spell?.level ?? 5);
  let magnitude = $state(spell?.magnitude ?? Math.max(1, Math.ceil((spell?.level ?? 5) / 5)));
  let range = $state(spell?.range ?? 'Touch');
  let duration = $state(spell?.duration ?? 'Mom');
  let target = $state(spell?.target ?? 'Individual');
  let notes = $state(spell?.notes ?? '');
  let masteryXp = $state(spell?.masteryXp ?? 0);

  const mastery = $derived(abilityScoreFromXp(masteryXp));

  const techniques = ['Creo', 'Intellego', 'Muto', 'Perdo', 'Rego'];
  const forms = ['Animal', 'Aquam', 'Auram', 'Corpus', 'Herbam', 'Ignem', 'Imaginem', 'Mentem', 'Terram', 'Vim'];
  const ranges = ['Touch', 'Voice', 'Sight', 'Arcane'];
  const durations = ['Mom', 'Conc', 'Sun', 'Moon', 'Year', 'Ring', 'Diam'];
  const targets = ['Individual', 'Group', 'Room', 'Structure', 'Boundary'];

  function handleSave() {
    if (!name) return;
    const s: Spell = {
      name,
      technique,
      form,
      level,
      magnitude,
      range,
      duration,
      target,
      notes,
      masteryXp,
      mastery,
      base: spell?.base ?? level,
      requisites: spell?.requisites ?? {},
    };
    onSave(s);
    onClose();
  }
</script>

<div style="display: flex; flex-direction: column; gap: 12px;">
  <div>
    <span style="font-family:{S.fontBody}; font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted};">Name</span>
    <input type="text" bind:value={name} style="width:100%; padding:6px 8px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:13px; box-sizing:border-box;" />
  </div>

  <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px;">
    <div>
      <span style="font-family:{S.fontBody}; font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted};">Technique</span>
      <select bind:value={technique} style="width:100%; padding:5px 6px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:12px;">
        {#each techniques as t}
          <option value={t}>{t}</option>
        {/each}
      </select>
    </div>
    <div>
      <span style="font-family:{S.fontBody}; font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted};">Form</span>
      <select bind:value={form} style="width:100%; padding:5px 6px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:12px;">
        {#each forms as f}
          <option value={f}>{f}</option>
        {/each}
      </select>
    </div>
    <div>
      <span style="font-family:{S.fontBody}; font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted};">Level</span>
      <input type="number" min="1" bind:value={level} style="width:100%; padding:5px 6px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:12px; text-align:center; box-sizing:border-box;" />
    </div>
    <div>
      <span style="font-family:{S.fontBody}; font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted};">Magnitude</span>
      <input type="number" min="1" bind:value={magnitude} style="width:100%; padding:5px 6px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:12px; text-align:center; box-sizing:border-box;" />
    </div>
  </div>

  <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
    <div>
      <span style="font-family:{S.fontBody}; font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted};">Range</span>
      <select bind:value={range} style="width:100%; padding:5px 6px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:12px;">
        {#each ranges as r}
          <option value={r}>{r}</option>
        {/each}
      </select>
    </div>
    <div>
      <span style="font-family:{S.fontBody}; font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted};">Duration</span>
      <select bind:value={duration} style="width:100%; padding:5px 6px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:12px;">
        {#each durations as d}
          <option value={d}>{d}</option>
        {/each}
      </select>
    </div>
    <div>
      <span style="font-family:{S.fontBody}; font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted};">Target</span>
      <select bind:value={target} style="width:100%; padding:5px 6px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:12px;">
        {#each targets as t}
          <option value={t}>{t}</option>
        {/each}
      </select>
    </div>
  </div>

  <div>
    <span style="font-family:{S.fontBody}; font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted};">Mastery XP</span>
    <div style="display: flex; align-items: center; gap: 8px;">
      <input type="number" min="0" bind:value={masteryXp} style="width:100px; padding:5px 6px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:12px; text-align:center; box-sizing:border-box;" />
      <span style="font-family:{S.fontBody}; font-size:11px; color:{COLORS.inkMuted};">→ Mastery <span style="font-family:{S.fontHeadline}; font-size:16px; font-weight:700; color:{COLORS.red};">{mastery}</span></span>
    </div>
  </div>

  <div>
    <span style="font-family:{S.fontBody}; font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted};">Notes</span>
    <textarea bind:value={notes} rows="4" style="width:100%; padding:6px 8px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:12px; box-sizing:border-box; resize:vertical;"></textarea>
  </div>

  <div style="display: flex; gap: 8px; justify-content: flex-end; border-top: 1px solid {COLORS.outlineVar}; padding-top: 12px;">
    <button onclick={onClose} style="padding:8px 16px; border:1px solid {COLORS.outlineVar}; border-radius:4px; background:{COLORS.bgLow}; font-family:{S.fontBody}; font-size:12px; cursor:pointer; color:{COLORS.inkMuted};">Cancel</button>
    <button onclick={handleSave} disabled={!name} style="padding:8px 16px; border:none; border-radius:4px; background:{COLORS.red}; color:{COLORS.white}; font-family:{S.fontBody}; font-size:12px; font-weight:600; cursor:pointer; opacity:{!name ? 0.5 : 1};">{isNew ? 'Create' : 'Save'}</button>
  </div>
</div>
