<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import type { ArsCharacter } from '$lib/types';

  let {
    character,
    editing = false,
  } = $props<{
    character: ArsCharacter;
    editing?: boolean;
  }>();

  const fields: { key: 'house' | 'wizardsSigil' | 'domusMagna' | 'primus' | 'parens' | 'covenantOfApprenticeship'; label: string }[] = [
    { key: 'house', label: 'House' },
    { key: 'wizardsSigil', label: "Wizard's Sigil" },
    { key: 'domusMagna', label: 'Domus Magna' },
    { key: 'primus', label: 'Primus' },
    { key: 'parens', label: 'Parens' },
    { key: 'covenantOfApprenticeship', label: 'Covenant of Apprenticeship' },
  ];

  const inputStyle = `
    padding: 4px 8px;
    border: 1px solid ${COLORS.outlineVar};
    border-radius: 4px;
    font-family: ${S.fontBody};
    font-size: 12px;
    color: ${COLORS.ink};
    background-color: ${COLORS.white};
    width: 100%;
    box-sizing: border-box;
  `;

  const labelStyle = `
    font-family: ${S.fontBody};
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: ${COLORS.inkMuted};
    white-space: nowrap;
  `;
</script>

<div style="
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  width: 100%;
  padding: 16px;
  background-color: {COLORS.bgLow};
  border-radius: 8px;
  box-sizing: border-box;
">
  <!-- Covenant (top-level field) -->
  {#if editing}
    <div style="display: flex; flex-direction: column; gap: 2px;">
        <span style={labelStyle}>Covenant</span>
        <input
          type="text"
          value={character.covenant}
          oninput={(e) => { character.covenant = (e.target as HTMLInputElement).value; }}
          style={inputStyle + 'width: 160px;'}
        />
      </div>
  {:else}
    <div style="display: flex; align-items: center; gap: 6px;">
      <span style={labelStyle}>Covenant</span>
      <span style="font-family: {S.fontBody}; font-size: 13px; color: {COLORS.ink};">{character.covenant || '—'}</span>
    </div>
  {/if}

  {#each fields as { key, label }}
    {#if editing}
      <div style="display: flex; flex-direction: column; gap: 2px;">
        <span style={labelStyle}>{label}</span>
        <input
          type="text"
          value={character.hermeticData[key] ?? ''}
          oninput={(e) => { (character.hermeticData[key] as string) = (e.target as HTMLInputElement).value; }}
          style={inputStyle + 'width: 160px;'}
        />
      </div>
    {:else}
      <div style="display: flex; align-items: center; gap: 6px;">
        <span style={labelStyle}>{label}</span>
        <span style="font-family: {S.fontBody}; font-size: 13px; color: {COLORS.ink};">{character.hermeticData?.[key] || '—'}</span>
      </div>
    {/if}
  {/each}
</div>
