<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import type { Familiar, Spell } from '$lib/types/character';
  import SpellModal from './SpellModal.svelte';
  import Modal from './Modal.svelte';

  let {
    familiar = null as Familiar | null,
    isEditable = false,
    onSave = async (_data: unknown) => {},
    vimScore = 0,
  } = $props<{
    familiar: Familiar | null;
    isEditable?: boolean;
    onSave?: (data: unknown) => Promise<void>;
    vimScore?: number;
  }>();

  let localFamiliar = $state<Familiar | null>(familiar);
  let editing = $state(false);

  let showSpellModal = $state(false);
  let editingSpell = $state<Spell | null>(null);

  function openNewSpell() {
    editingSpell = null;
    showSpellModal = true;
  }

  function openEditSpell(spell: Spell) {
    editingSpell = { ...spell, requisites: { ...spell.requisites } };
    showSpellModal = true;
  }

  function handleSaveSpell(spell: Spell) {
    if (!localFamiliar) return;
    if (!localFamiliar.spells) localFamiliar.spells = {};
    if (editingSpell && editingSpell.name !== spell.name) {
      delete localFamiliar.spells[editingSpell.name];
    }
    localFamiliar.spells[spell.name] = spell;
    showSpellModal = false;
  }

  function deleteSpell(name: string) {
    if (!localFamiliar) return;
    const s = { ...localFamiliar.spells };
    delete s[name];
    localFamiliar.spells = s;
  }

  const sharedRange = $derived(vimScore * 10);

  const c = $derived(localFamiliar?.characteristics ?? {});
  const intCun = $derived(c['INTELLIGENCE'] ?? c['CUNNING'] ?? 0);
  const per = $derived(c['PERCEPTION'] ?? 0);
  const str = $derived(c['STRENGTH'] ?? 0);
  const sta = $derived(c['STAMINA'] ?? 0);
  const pre = $derived(c['PRESENCE'] ?? 0);
  const com = $derived(c['COMMUNICATION'] ?? 0);
  const dex = $derived(c['DEXTERITY'] ?? 0);
  const qik = $derived(c['QUICKNESS'] ?? 0);
  const size = $derived(localFamiliar?.size ?? 0);
  const bronze = $derived(localFamiliar?.bronzeCord ?? 0);
  const soak = $derived(sta + size + bronze);

  function fatLabel(s: number): string {
    if (s >= 3) return 'Fresh';
    if (s === 2) return 'OK';
    if (s === 1) return 'Weary';
    return 'Fatigued';
  }

  async function handleSave() {
    await onSave(localFamiliar);
    editing = false;
  }

  function startEdit() {
    localFamiliar = JSON.parse(JSON.stringify(familiar));
    editing = true;
  }

  function cancelEdit() {
    localFamiliar = JSON.parse(JSON.stringify(familiar));
    editing = false;
  }

  function createFamiliar() {
    localFamiliar = {
      name: '', species: '', size: 0, might: 0, mightType: 'MAGIC',
      goldCord: 0, silverCord: 0, bronzeCord: 0,
      characteristics: { INTELLIGENCE: 0, PERCEPTION: 0, STRENGTH: 0, STAMINA: 0, PRESENCE: 0, COMMUNICATION: 0, DEXTERITY: 0, QUICKNESS: 0 },
      abilities: {}, bondQualities: '', spells: {}, notes: '',
    };
    editing = true;
  }
</script>

{#if showSpellModal && localFamiliar}
  <Modal bind:open={showSpellModal} title={editingSpell ? `Edit: ${editingSpell.name}` : 'Create Spell'}>
    <SpellModal
      spell={editingSpell}
      onSave={handleSaveSpell}
      onClose={() => showSpellModal = false}
    />
  </Modal>
{/if}

<div style="width:100%; box-sizing:border-box; background:{COLORS.bgLow}; border:1px solid {COLORS.outlineVar}; border-radius:6px; overflow:hidden;">
  <div style="background:{COLORS.bgLow}; border-bottom:1px solid {COLORS.outlineVar}; padding:6px 12px; display:flex; gap:12px; align-items:baseline; justify-content:space-between;">
    <div style="display:flex; gap:12px; align-items:baseline;">
      <span style="font-family:{S.fontBody}; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:{COLORS.red};">Familiar</span>
      {#if localFamiliar}
        <span style="font-family:{S.fontHeadline}; font-size:16px; font-weight:700; color:{COLORS.ink};">{localFamiliar.name}</span>
        <span style="font-family:{S.fontBody}; font-size:12px; font-style:italic; color:{COLORS.inkMuted};">({localFamiliar.species})</span>
      {/if}
    </div>
    {#if isEditable && !editing && localFamiliar}
      <button onclick={startEdit} style="padding:4px 10px; border:1px solid {COLORS.outlineVar}; border-radius:4px; background:transparent; color:{COLORS.inkMuted}; font-family:{S.fontBody}; font-size:10px; cursor:pointer;">Edit</button>
    {/if}
  </div>

  {#if localFamiliar}
    {@const fam = localFamiliar}

    {#if !editing}
      <!-- ═══ DISPLAY VIEW ═══ -->
      <div style="display:grid; grid-template-columns:1fr 1fr 1fr 1fr 1fr; gap:8px; padding:8px 12px;">
        <div style="text-align:center;">
          <div style="font-family:{S.fontHeadline}; font-size:20px; font-weight:800; color:{COLORS.ink};">{intCun >= 0 ? '+' : ''}{intCun}</div>
          <div style="font-family:{S.fontBody}; font-size:9px; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted};">Int/Cun</div>
        </div>
        <div style="text-align:center;">
          <div style="font-family:{S.fontHeadline}; font-size:20px; font-weight:800; color:{COLORS.ink};">{size >= 0 ? '+' : ''}{size}</div>
          <div style="font-family:{S.fontBody}; font-size:9px; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted};">Size</div>
        </div>
        <div style="text-align:center;">
          <div style="font-family:{S.fontHeadline}; font-size:20px; font-weight:800; color:{COLORS.ink};">{bronze >= 0 ? '+' : ''}{bronze}</div>
          <div style="font-family:{S.fontBody}; font-size:9px; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted};">Bronze Cord</div>
        </div>
        <div style="text-align:center;">
          <div style="font-family:{S.fontHeadline}; font-size:20px; font-weight:800; color:{COLORS.ink};">{fam.silverCord >= 0 ? '+' : ''}{fam.silverCord}</div>
          <div style="font-family:{S.fontBody}; font-size:9px; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted};">Silver Cord</div>
        </div>
        <div style="text-align:center;">
          <div style="font-family:{S.fontHeadline}; font-size:20px; font-weight:800; color:{COLORS.ink};">{fam.goldCord >= 0 ? '+' : ''}{fam.goldCord}</div>
          <div style="font-family:{S.fontBody}; font-size:9px; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted};">Gold Cord</div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; padding:4px 12px 8px;">
        <div style="display:flex; align-items:center; gap:8px; padding:4px 8px; background:{COLORS.bgHigh}; border-radius:4px;">
          <span style="font-family:{S.fontBody}; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted}; min-width:30px;">Per</span>
          <span style="font-family:{S.fontHeadline}; font-size:16px; font-weight:700; color:{COLORS.ink}; min-width:20px;">{per >= 0 ? '+' : ''}{per}</span>
          <span style="font-family:{S.fontBody}; font-size:10px; font-style:italic; color:{COLORS.inkMuted};">Might {fam.might} ({fam.mightType})</span>
        </div>
        <div style="display:flex; align-items:center; gap:8px; padding:4px 8px; background:{COLORS.bgHigh}; border-radius:4px;">
          <span style="font-family:{S.fontBody}; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted}; min-width:30px;">Str</span>
          <span style="font-family:{S.fontHeadline}; font-size:16px; font-weight:700; color:{COLORS.ink}; min-width:20px;">{str >= 0 ? '+' : ''}{str}</span>
          <span style="font-family:{S.fontBody}; font-size:10px; font-style:italic; color:{COLORS.inkMuted};">Soak {soak}</span>
        </div>
        <div style="display:flex; align-items:center; gap:8px; padding:4px 8px; background:{COLORS.bgHigh}; border-radius:4px;">
          <span style="font-family:{S.fontBody}; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted}; min-width:30px;">Sta</span>
          <span style="font-family:{S.fontHeadline}; font-size:16px; font-weight:700; color:{COLORS.ink}; min-width:20px;">{sta >= 0 ? '+' : ''}{sta}</span>
          <span style="font-family:{S.fontBody}; font-size:10px; font-style:italic; color:{COLORS.inkMuted};">Fat {fatLabel(sta)}</span>
        </div>
        <div style="display:flex; align-items:center; gap:8px; padding:4px 8px; background:{COLORS.bgHigh}; border-radius:4px;">
          <span style="font-family:{S.fontBody}; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted}; min-width:30px;">Pre</span>
          <span style="font-family:{S.fontHeadline}; font-size:16px; font-weight:700; color:{COLORS.ink}; min-width:20px;">{pre >= 0 ? '+' : ''}{pre}</span>
          <span style="font-family:{S.fontBody}; font-size:10px; font-style:italic; color:{COLORS.inkMuted};">Init {qik}</span>
        </div>
        <div style="display:flex; align-items:center; gap:8px; padding:4px 8px; background:{COLORS.bgHigh}; border-radius:4px;">
          <span style="font-family:{S.fontBody}; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted}; min-width:30px;">Com</span>
          <span style="font-family:{S.fontHeadline}; font-size:16px; font-weight:700; color:{COLORS.ink}; min-width:20px;">{com >= 0 ? '+' : ''}{com}</span>
          <span style="font-family:{S.fontBody}; font-size:10px; font-style:italic; color:{COLORS.inkMuted};">Atk {dex}</span>
        </div>
        <div style="display:flex; align-items:center; gap:8px; padding:4px 8px; background:{COLORS.bgHigh}; border-radius:4px;">
          <span style="font-family:{S.fontBody}; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted}; min-width:30px;">Dex</span>
          <span style="font-family:{S.fontHeadline}; font-size:16px; font-weight:700; color:{COLORS.ink}; min-width:20px;">{dex >= 0 ? '+' : ''}{dex}</span>
          <span style="font-family:{S.fontBody}; font-size:10px; font-style:italic; color:{COLORS.inkMuted};">Dfn {qik}</span>
        </div>
        <div style="display:flex; align-items:center; gap:8px; padding:4px 8px; background:{COLORS.bgHigh}; border-radius:4px;">
          <span style="font-family:{S.fontBody}; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted}; min-width:30px;">Qik</span>
          <span style="font-family:{S.fontHeadline}; font-size:16px; font-weight:700; color:{COLORS.ink}; min-width:20px;">{qik >= 0 ? '+' : ''}{qik}</span>
          <span style="font-family:{S.fontBody}; font-size:10px; font-style:italic; color:{COLORS.inkMuted};">Dam {str}</span>
        </div>
      </div>

      <div style="padding:6px 12px; border-top:1px solid {COLORS.outlineVar}; display:flex; gap:20px; flex-wrap:wrap;">
        <span style="font-family:{S.fontBody}; font-size:10px; color:{COLORS.inkMuted};">
          Shared senses: <strong style="color:{COLORS.ink};">{sharedRange}</strong> mi (Vim×10)
        </span>
      </div>

      {#if fam.bondQualities || Object.keys(fam.spells ?? {}).length > 0}
        <div style="padding:8px 12px; border-top:1px solid {COLORS.outlineVar};">
          <div style="font-family:{S.fontBody}; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.red}; margin-bottom:4px;">Bond Qualities & Abilities</div>
          {#if fam.bondQualities}
            <div style="font-family:{S.fontBody}; font-size:12px; color:{COLORS.inkMuted}; font-style:italic; margin-bottom:4px;">{fam.bondQualities}</div>
          {/if}
          {#each Object.entries(fam.spells ?? {}) as [name, sp]}
            <div style="display:flex; gap:6px; align-items:center; padding:2px 0;">
              <span style="font-family:{S.fontBody}; font-size:12px; color:{COLORS.ink};">{name}</span>
              <span style="font-family:{S.fontBody}; font-size:10px; color:{COLORS.inkMuted};">({sp.technique} {sp.form}, Lv{sp.level})</span>
            </div>
          {/each}
        </div>
      {/if}

      {#if fam.notes}
        <div style="padding:4px 12px 8px; border-top:1px solid {COLORS.outlineVar};">
          <div style="font-family:{S.fontBody}; font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted};">Notes</div>
          <div style="font-family:{S.fontBody}; font-size:12px; font-style:italic; color:{COLORS.inkMuted};">{fam.notes}</div>
        </div>
      {/if}

    {:else}
      <!-- ═══ EDIT VIEW ═══ -->
      <div style="display:flex; flex-direction:column; gap:10px; padding:8px 12px;">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
          <div>
            <span style="font-family:{S.fontBody}; font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted};">Name</span>
            <input type="text" bind:value={fam.name} style="width:100%; padding:5px 6px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-size:12px; box-sizing:border-box;" />
          </div>
          <div>
            <span style="font-family:{S.fontBody}; font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted};">Species</span>
            <input type="text" bind:value={fam.species} style="width:100%; padding:5px 6px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-size:12px; box-sizing:border-box;" />
          </div>
        </div>

        <div style="display:grid; grid-template-columns:repeat(5,1fr); gap:6px;">
          <div><span style="font-family:{S.fontBody}; font-size:9px; text-transform:uppercase; color:{COLORS.inkMuted};">Int/Cun</span><input type="number" bind:value={fam.characteristics['INTELLIGENCE']} style="width:100%; padding:4px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-size:12px; text-align:center; box-sizing:border-box;" /></div>
          <div><span style="font-family:{S.fontBody}; font-size:9px; text-transform:uppercase; color:{COLORS.inkMuted};">Per</span><input type="number" bind:value={fam.characteristics['PERCEPTION']} style="width:100%; padding:4px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-size:12px; text-align:center; box-sizing:border-box;" /></div>
          <div><span style="font-family:{S.fontBody}; font-size:9px; text-transform:uppercase; color:{COLORS.inkMuted};">Str</span><input type="number" bind:value={fam.characteristics['STRENGTH']} style="width:100%; padding:4px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-size:12px; text-align:center; box-sizing:border-box;" /></div>
          <div><span style="font-family:{S.fontBody}; font-size:9px; text-transform:uppercase; color:{COLORS.inkMuted};">Sta</span><input type="number" bind:value={fam.characteristics['STAMINA']} style="width:100%; padding:4px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-size:12px; text-align:center; box-sizing:border-box;" /></div>
          <div><span style="font-family:{S.fontBody}; font-size:9px; text-transform:uppercase; color:{COLORS.inkMuted};">Size</span><input type="number" bind:value={fam.size} style="width:100%; padding:4px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-size:12px; text-align:center; box-sizing:border-box;" /></div>
          <div><span style="font-family:{S.fontBody}; font-size:9px; text-transform:uppercase; color:{COLORS.inkMuted};">Pre</span><input type="number" bind:value={fam.characteristics['PRESENCE']} style="width:100%; padding:4px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-size:12px; text-align:center; box-sizing:border-box;" /></div>
          <div><span style="font-family:{S.fontBody}; font-size:9px; text-transform:uppercase; color:{COLORS.inkMuted};">Com</span><input type="number" bind:value={fam.characteristics['COMMUNICATION']} style="width:100%; padding:4px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-size:12px; text-align:center; box-sizing:border-box;" /></div>
          <div><span style="font-family:{S.fontBody}; font-size:9px; text-transform:uppercase; color:{COLORS.inkMuted};">Dex</span><input type="number" bind:value={fam.characteristics['DEXTERITY']} style="width:100%; padding:4px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-size:12px; text-align:center; box-sizing:border-box;" /></div>
          <div><span style="font-family:{S.fontBody}; font-size:9px; text-transform:uppercase; color:{COLORS.inkMuted};">Qik</span><input type="number" bind:value={fam.characteristics['QUICKNESS']} style="width:100%; padding:4px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-size:12px; text-align:center; box-sizing:border-box;" /></div>
          <div><span style="font-family:{S.fontBody}; font-size:9px; text-transform:uppercase; color:{COLORS.inkMuted};">Might</span><input type="number" bind:value={fam.might} min="0" style="width:100%; padding:4px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-size:12px; text-align:center; box-sizing:border-box;" /></div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px;">
          <div>
            <span style="font-family:{S.fontBody}; font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted};">Gold Cord (0–5)</span>
            <input type="number" bind:value={fam.goldCord} min="0" max="5" style="width:100%; padding:5px 6px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-size:12px; text-align:center; box-sizing:border-box;" />
          </div>
          <div>
            <span style="font-family:{S.fontBody}; font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted};">Silver Cord (0–5)</span>
            <input type="number" bind:value={fam.silverCord} min="0" max="5" style="width:100%; padding:5px 6px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-size:12px; text-align:center; box-sizing:border-box;" />
          </div>
          <div>
            <span style="font-family:{S.fontBody}; font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted};">Bronze Cord (0–5)</span>
            <input type="number" bind:value={fam.bronzeCord} min="0" max="5" style="width:100%; padding:5px 6px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-size:12px; text-align:center; box-sizing:border-box;" />
          </div>
          <div>
            <span style="font-family:{S.fontBody}; font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted};">Might Type</span>
            <select bind:value={fam.mightType} style="width:100%; padding:5px 6px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-size:12px;">
              <option value="MAGIC">Magic</option>
              <option value="FAERIE">Faerie</option>
            </select>
          </div>
        </div>

        <div>
          <span style="font-family:{S.fontBody}; font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted};">Bond Qualities</span>
          <textarea bind:value={fam.bondQualities} rows="2" style="width:100%; padding:5px 6px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-size:12px; box-sizing:border-box; resize:vertical;"></textarea>
        </div>

        <div style="border-top:1px dashed {COLORS.outlineVar}; padding-top:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-family:{S.fontBody}; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.red};">Invested Spells</span>
            <button onclick={openNewSpell} style="padding:4px 10px; border:1px dashed {COLORS.outlineVar}; border-radius:4px; background:transparent; color:{COLORS.inkMuted}; font-family:{S.fontBody}; font-size:10px; cursor:pointer;">+ Add Spell</button>
          </div>
          {#each Object.entries(fam.spells ?? {}) as [name, sp]}
            <div style="display:flex; gap:6px; align-items:center; padding:3px 0;">
              <span style="font-family:{S.fontBody}; font-size:12px; color:{COLORS.ink};">{name}</span>
              <span style="font-family:{S.fontBody}; font-size:10px; color:{COLORS.inkMuted};">({sp.technique} {sp.form}, Lv{sp.level})</span>
              <button onclick={() => openEditSpell(sp)} style="padding:2px 6px; border:none; background:transparent; color:{COLORS.inkMuted}; font-family:{S.fontBody}; font-size:10px; cursor:pointer; text-decoration:underline;">edit</button>
              <button onclick={() => deleteSpell(name)} style="padding:2px 6px; border:none; background:transparent; color:{COLORS.red}; font-family:{S.fontBody}; font-size:10px; cursor:pointer;">×</button>
            </div>
          {:else}
            <div style="font-family:{S.fontBody}; font-size:11px; font-style:italic; color:{COLORS.inkMuted};">No invested spells</div>
          {/each}
        </div>

        <div>
          <span style="font-family:{S.fontBody}; font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:{COLORS.inkMuted};">Notes</span>
          <textarea bind:value={fam.notes} rows="3" style="width:100%; padding:5px 6px; border:1px solid {COLORS.outlineVar}; border-radius:4px; font-size:12px; box-sizing:border-box; resize:vertical;"></textarea>
        </div>

        <div style="display:flex; gap:8px; justify-content:flex-end; border-top:1px solid {COLORS.outlineVar}; padding-top:10px;">
          <button onclick={cancelEdit} style="padding:8px 16px; border:1px solid {COLORS.outlineVar}; border-radius:4px; background:transparent; color:{COLORS.inkMuted}; font-family:{S.fontBody}; font-size:12px; cursor:pointer;">Cancel</button>
          <button onclick={handleSave} style="padding:8px 16px; border:none; border-radius:4px; background:{COLORS.red}; color:{COLORS.white}; font-family:{S.fontBody}; font-size:12px; font-weight:600; cursor:pointer;">Save</button>
        </div>
      </div>
    {/if}

  {:else if isEditable}
    <div style="padding:12px; text-align:center;">
      <button onclick={createFamiliar} style="padding:8px 16px; border:1px dashed {COLORS.outlineVar}; border-radius:6px; background:transparent; color:{COLORS.inkMuted}; font-family:{S.fontBody}; font-size:12px; cursor:pointer;">+ Create Familiar</button>
    </div>
  {:else}
    <div style="padding:12px; text-align:center;">
      <span style="font-family:{S.fontBody}; font-size:12px; font-style:italic; color:{COLORS.inkMuted};">No familiar bound</span>
    </div>
  {/if}
</div>