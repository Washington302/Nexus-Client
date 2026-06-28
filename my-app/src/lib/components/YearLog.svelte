<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import type { ActivitySummary, Activity } from '$lib/types/character';

  let {
    yearLog = [],
    onSave = async (_field: string, _data: unknown) => {},
  } = $props<{
    yearLog: ActivitySummary[];
    onSave?: (field: string, data: unknown) => Promise<void>;
  }>();

  let editingIndex = $state<number | null>(null);
  let editYear = $state(0);
  let editSeason = $state<'SPRING' | 'SUMMER' | 'AUTUMN' | 'WINTER'>('SPRING');
  let editNotes = $state('');
  let editActivities = $state<Activity[]>([]);
  let newActivityType = $state('');
  let newActivityTarget = $state('');
  let newActivityXp = $state(0);
  let newActivityDesc = $state('');

  const seasons = ['SPRING', 'SUMMER', 'AUTUMN', 'WINTER'] as const;

  function startEdit(index: number) {
    const entry = yearLog[index];
    editingIndex = index;
    editYear = entry.year;
    editSeason = entry.season;
    editNotes = entry.notes;
    editActivities = entry.activities.map((a: Activity) => ({ ...a }));
  }

  function startNew() {
    const maxYear = yearLog.length > 0 ? Math.max(...yearLog.map((e: ActivitySummary) => e.year)) : 1220;
    editingIndex = yearLog.length;
    editYear = maxYear;
    editSeason = 'SPRING';
    editNotes = '';
    editActivities = [];
  }

  function cancelEdit() {
    editingIndex = null;
  }

  function addActivity() {
    if (!newActivityType.trim()) return;
    editActivities = [...editActivities, {
      type: newActivityType.trim(),
      target: newActivityTarget.trim(),
      xp: newActivityXp,
      description: newActivityDesc.trim(),
    }];
    newActivityType = '';
    newActivityTarget = '';
    newActivityXp = 0;
    newActivityDesc = '';
  }

  function removeActivity(index: number) {
    editActivities = editActivities.filter((_a: Activity, i: number) => i !== index);
  }

  async function saveEntry() {
    const entry: ActivitySummary = {
      id: yearLog[editingIndex!]?.id ?? '',
      characterId: yearLog[editingIndex!]?.characterId ?? '',
      year: editYear,
      season: editSeason,
      notes: editNotes,
      activities: editActivities,
    };
    const updated = [...yearLog];
    if (editingIndex! < yearLog.length) {
      updated[editingIndex!] = entry;
    } else {
      updated.push(entry);
    }
    updated.sort((a: ActivitySummary, b: ActivitySummary) => b.year - a.year || seasons.indexOf(b.season) - seasons.indexOf(a.season));
    await onSave('yearLog', updated);
    editingIndex = null;
  }

  async function deleteEntry(index: number) {
    const updated = yearLog.filter((_a: ActivitySummary, i: number) => i !== index);
    await onSave('yearLog', updated);
  }

  const seasonColor: Record<string, string> = {
    SPRING: '#4a7c59', SUMMER: '#c8a24e', AUTUMN: '#b86f2e', WINTER: '#6b8fa7',
  };
</script>

<div style="
  width: 100%;
  box-sizing: border-box;
  background-color: {COLORS.bgLow};
  border: 1px solid {COLORS.outlineVar};
  border-radius: 6px;
  overflow: hidden;
">
  <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 12px; border-bottom:1px solid {COLORS.outlineVar};">
    <span style="font-family:{S.fontBody}; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:{COLORS.red};">Year Log</span>
    <button onclick={startNew} style="padding:4px 10px; border:1px dashed {COLORS.outlineVar}; border-radius:4px; background:transparent; color:{COLORS.inkMuted}; font-family:{S.fontBody}; font-size:10px; cursor:pointer;">+ Add Entry</button>
  </div>

  <div style="display:flex; flex-direction:column;">
    {#each yearLog as entry, i}
      <div style="padding:8px 12px; border-bottom:1px solid {COLORS.outlineVar}; cursor:pointer;"
        onclick={() => startEdit(i)}
        onmouseenter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.bgHigh}
        onmouseleave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
      >
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-family:{S.fontHeadline}; font-size:14px; font-weight:700; color:{COLORS.ink};">{entry.year}</span>
            <span style="font-family:{S.fontBody}; font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:0.06em; padding:2px 6px; border-radius:3px; color:{COLORS.white}; background-color:{seasonColor[entry.season]};">
              {entry.season}
            </span>
          </div>
          <span style="font-family:{S.fontBody}; font-size:11px; color:{COLORS.inkMuted};">{entry.activities.length} activities</span>
        </div>
        {#if entry.notes}
          <div style="font-family:{S.fontBody}; font-size:12px; color:{COLORS.inkMuted}; margin-top:4px;">{entry.notes}</div>
        {/if}
      </div>
    {:else}
      <div style="padding:16px 12px; text-align:center;">
        <span style="font-family:{S.fontBody}; font-size:12px; font-style:italic; color:{COLORS.inkMuted};">No year log entries yet.</span>
      </div>
    {/each}
  </div>
</div>

<!-- Edit Modal -->
{#if editingIndex !== null}
  <div style="position:fixed; inset:0; z-index:500; display:flex; align-items:center; justify-content:center; background-color:rgba(0,0,0,0.4);"
    onclick={cancelEdit} onkeydown={(e) => e.key === 'Escape' && cancelEdit()}
  >
    <div onclick={(e) => e.stopPropagation()} style="background-color:{COLORS.white}; border-radius:8px; padding:24px; width:500px; max-height:80vh; overflow-y:auto; display:flex; flex-direction:column; gap:12px;">
      <div style="font-family:{S.fontHeadline}; font-size:16px; font-weight:800; color:{COLORS.ink};">
        {editingIndex < yearLog.length ? 'Edit Entry' : 'New Entry'}
      </div>
      <div style="display:flex; gap:12px;">
        <div style="display:flex; flex-direction:column; gap:4px; flex:1;">
          <span style="font-family:{S.fontBody}; font-size:10px; text-transform:uppercase; letter-spacing:0.06em; color:{COLORS.inkMuted};">Year</span>
          <input type="number" bind:value={editYear} style="padding:6px 8px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontHeadline}; font-size:14px; font-weight:700; color:{COLORS.ink};" />
        </div>
        <div style="display:flex; flex-direction:column; gap:4px; flex:1;">
          <span style="font-family:{S.fontBody}; font-size:10px; text-transform:uppercase; letter-spacing:0.06em; color:{COLORS.inkMuted};">Season</span>
          <select bind:value={editSeason} style="padding:6px 8px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:13px; color:{COLORS.ink};">
            {#each seasons as s}
              <option value={s}>{s}</option>
            {/each}
          </select>
        </div>
      </div>
      <div style="display:flex; flex-direction:column; gap:4px;">
        <span style="font-family:{S.fontBody}; font-size:10px; text-transform:uppercase; letter-spacing:0.06em; color:{COLORS.inkMuted};">Notes</span>
        <textarea bind:value={editNotes} rows="2" style="padding:6px 8px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-family:{S.fontBody}; font-size:13px; color:{COLORS.ink}; resize:vertical;"></textarea>
      </div>
      <div style="border-top:1px solid {COLORS.outlineVar}; padding-top:8px;">
        <div style="font-family:{S.fontBody}; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:{COLORS.inkMuted}; margin-bottom:8px;">Activities</div>
        {#each editActivities as act, ai}
          <div style="display:flex; justify-content:space-between; align-items:center; padding:4px 0; border-bottom:1px solid {COLORS.outlineVar};">
            <div>
              <span style="font-family:{S.fontBody}; font-size:13px; color:{COLORS.ink}; font-weight:600;">{act.type}</span>
              {#if act.target}<span style="font-family:{S.fontBody}; font-size:12px; color:{COLORS.inkMuted}; margin-left:6px;">({act.target})</span>{/if}
              <span style="font-family:{S.fontBody}; font-size:12px; color:{COLORS.red}; margin-left:6px;">{act.xp} XP</span>
            </div>
            <button onclick={() => removeActivity(ai)} style="background:none; border:none; color:{COLORS.red}; cursor:pointer; font-size:14px;">×</button>
          </div>
        {/each}
        <div style="display:grid; grid-template-columns:1fr 1fr 60px 1fr; gap:4px; margin-top:8px; align-items:end;">
          <input type="text" placeholder="Type" bind:value={newActivityType} style="padding:4px 6px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-size:12px; color:{COLORS.ink};" />
          <input type="text" placeholder="Target" bind:value={newActivityTarget} style="padding:4px 6px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-size:12px; color:{COLORS.ink};" />
          <input type="number" placeholder="XP" bind:value={newActivityXp} style="padding:4px 6px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-size:12px; color:{COLORS.ink}; width:60px;" />
          <button onclick={addActivity} style="padding:4px 8px; border:1px solid {COLORS.outlineVar}; border-radius:4px; background:{COLORS.bgLow}; color:{COLORS.ink}; font-size:11px; cursor:pointer;">Add</button>
        </div>
      </div>
      <div style="display:flex; gap:8px; margin-top:8px;">
        <button onclick={saveEntry} style="flex:1; padding:8px; border:none; border-radius:4px; background:{COLORS.red}; color:{COLORS.white}; font-family:{S.fontBody}; font-size:12px; font-weight:700; cursor:pointer; text-transform:uppercase; letter-spacing:0.08em;">Save</button>
        {#if editingIndex < yearLog.length}
          <button onclick={() => deleteEntry(editingIndex!)} style="padding:8px 12px; border:1px solid {COLORS.red}; border-radius:4px; background:transparent; color:{COLORS.red}; font-family:{S.fontBody}; font-size:12px; font-weight:700; cursor:pointer;">Delete</button>
        {/if}
        <button onclick={cancelEdit} style="flex:1; padding:8px; border:1px solid {COLORS.outlineVar}; border-radius:4px; background:{COLORS.bgLow}; color:{COLORS.inkMuted}; font-family:{S.fontBody}; font-size:12px; font-weight:700; cursor:pointer; text-transform:uppercase; letter-spacing:0.08em;">Cancel</button>
      </div>
    </div>
  </div>
{/if}
