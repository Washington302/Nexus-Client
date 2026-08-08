<script lang="ts">
	import type { StatModifier, Skill } from '$lib/services/api';
	import {
		label,
		createDefaultStatModifier,
		MULTIPLIER_OPTIONS,
		DERIVED_TARGET_OPTIONS,
		STAT_TABLE_ORDER
	} from '$lib/utils/character';

	// One editor for StatModifier rows, shared by critical wounds and racial perks —
	// the backend unified the model precisely because the two are the same shape.
	let {
		modifiers = $bindable(),
		skills,
		addLabel = '+ Add Modifier'
	}: {
		modifiers: StatModifier[];
		/** The character's seeded skills — the same fixed list the backend owns. */
		skills: Skill[];
		addLabel?: string;
	} = $props();

	const skillOptions = $derived(
		[...skills].sort((a, b) => label(a.skillName).localeCompare(label(b.skillName)))
	);

	function remove(id: string) {
		modifiers = modifiers.filter((m) => m.id !== id);
	}
</script>

{#each modifiers as mod (mod.id)}
	<div class="list-card nested">
		<div class="grid-2">
			<div class="field-group">
				<div class="field-hdr">Statistic</div>
				<select class="input-demo" bind:value={mod.stat}>
					<option value={null}>&mdash;</option>
					{#each STAT_TABLE_ORDER as opt}
						<option value={opt}>{label(opt)}</option>
					{/each}
				</select>
			</div>
			<div class="field-group">
				<div class="field-hdr">Skill</div>
				<select class="input-demo" bind:value={mod.skill}>
					<option value={null}>&mdash;</option>
					{#each skillOptions as opt (opt.id)}
						<option value={opt.skillName}>{label(opt.skillName)}</option>
					{/each}
				</select>
			</div>
		</div>
		<div class="grid-2">
			<div class="field-group">
				<div class="field-hdr">Derived Value</div>
				<select class="input-demo" bind:value={mod.derivedTarget}>
					<option value={null}>&mdash;</option>
					{#each DERIVED_TARGET_OPTIONS as opt}
						<option value={opt}>{label(opt)}</option>
					{/each}
				</select>
				<span class="field-hint">Stamina, Encumbrance and the rest.</span>
			</div>
			<div class="field-group">
				<div class="field-hdr">Multiplier</div>
				<select class="input-demo" bind:value={mod.multiplier}>
					{#each MULTIPLIER_OPTIONS as opt}
						<option value={opt.value}>{opt.label}</option>
					{/each}
				</select>
			</div>
		</div>
		<div class="grid-2">
			<div class="field-group">
				<div class="field-hdr">Flat Modifier</div>
				<input class="input-demo input-num" type="number" bind:value={mod.flatModifier} />
				<span class="field-hint">Signed: −2 for a wound, +1 for a perk.</span>
			</div>
			<div class="field-group">
				<div class="field-hdr">Other Target</div>
				<input
					class="input-demo"
					type="text"
					bind:value={mod.otherTarget}
					placeholder="Quadruple damage from head wounds…"
				/>
				<span class="field-hint">Recorded only — never calculated.</span>
			</div>
		</div>
		<button
			type="button"
			class="remove-row-btn"
			aria-label="Remove modifier"
			onclick={() => remove(mod.id)}>✕</button
		>
	</div>
{/each}
<button
	type="button"
	class="add-row-btn"
	onclick={() => modifiers.push(createDefaultStatModifier())}>{addLabel}</button
>
