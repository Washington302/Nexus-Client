<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import type { ArsCharacter } from '$lib/types';

  let { character = $bindable(null as unknown as ArsCharacter) } = $props<{ character: ArsCharacter }>();

  const fields: { key: keyof ArsCharacter; label: string; type: 'text' | 'number' }[] = [
    { key: 'birthName', label: 'Birth Name', type: 'text' },
    { key: 'yearBorn', label: 'Year Born', type: 'number' },
    { key: 'gender', label: 'Gender', type: 'text' },
    { key: 'raceNationality', label: 'Nationality', type: 'text' },
    { key: 'placeOfOrigin', label: 'Origin', type: 'text' },
    { key: 'religion', label: 'Religion', type: 'text' },
    { key: 'titleProfession', label: 'Profession', type: 'text' },
    { key: 'height', label: 'Height', type: 'number' },
    { key: 'weight', label: 'Weight', type: 'number' },
    { key: 'hair', label: 'Hair', type: 'text' },
    { key: 'eyes', label: 'Eyes', type: 'text' },
    { key: 'handedness', label: 'Handedness', type: 'text' },
    { key: 'saga', label: 'Saga', type: 'text' },
    { key: 'setting', label: 'Setting', type: 'text' },
    { key: 'currentYear', label: 'Current Year', type: 'number' },
    { key: 'covenant', label: 'Covenant', type: 'text' },
  ];

  function getValue(field: keyof ArsCharacter): string | number | undefined {
    const v = character[field];
    return typeof v === 'string' || typeof v === 'number' ? v : undefined;
  }

  function setValue(field: keyof ArsCharacter, value: string) {
    const f = fields.find(f => f.key === field);
    if (f?.type === 'number') {
      (character[field] as unknown as number) = value === '' ? 0 : Number(value);
    } else {
      (character[field] as unknown as string) = value;
    }
  }
</script>

<div style="display: flex; flex-direction: column; gap: 8px;">
  {#each fields as { key, label, type }}
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="width: 120px; font-family: {S.fontBody}; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: {COLORS.inkMuted}; flex-shrink: 0;">{label}</span>
      <input
        type={type}
        value={getValue(key)}
        oninput={(e) => setValue(key, (e.target as HTMLInputElement).value)}
        style="flex: 1; padding: 4px 6px; border: 1px solid {COLORS.outlineVar}; border-radius: 4px; font-family: {S.fontBody}; font-size: 12px; color: {COLORS.ink}; background-color: {COLORS.white};"
      />
    </div>
  {/each}
</div>
