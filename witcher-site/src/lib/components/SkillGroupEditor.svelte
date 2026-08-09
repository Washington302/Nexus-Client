<script lang="ts">
	import type { Skill, WitcherSkillName } from '$lib/services/api';
	import {
		label,
		skillTotal,
		isSpecializable,
		skillRows,
		createDefaultSpecialization
	} from '$lib/utils/character';

	// `skills` is the filtered slice of draft.skills for one stat. filter() returns a
	// new array but the Skill objects are the same references, so binding to
	// skill.points writes straight through to the draft.
	// The stat value itself is not edited here — it lives in the attribute table.
	//
	// Adding/removing a specialization changes the length of draft.skills, which a
	// filtered slice can't do on its own — those two ops go through the callbacks
	// instead, operating on the full array one level up.
	let {
		statValue,
		skills,
		onAddSpecialization,
		onRemoveSkill
	}: {
		statValue: number;
		skills: Skill[];
		onAddSpecialization: (template: Skill) => void;
		onRemoveSkill: (id: string) => void;
	} = $props();

	// Grouped by name so a specializable skill's several subjects sit together under
	// one "+ Add Subject" row, rather than being scattered wherever they fall in the
	// underlying array.
	const groups = $derived.by(() => {
		const seen = new Set<WitcherSkillName>();
		const order: WitcherSkillName[] = [];
		for (const s of skills) {
			if (!seen.has(s.skillName)) {
				seen.add(s.skillName);
				order.push(s.skillName);
			}
		}
		return order.map((name) => ({ name, rows: skillRows(skills, name) }));
	});
</script>

<div class="skill-edit-row skill-edit-head">
	<span class="skill-edit-name">Skill</span>
	<span>Points</span>
	<span>Total</span>
</div>

{#each groups as group (group.name)}
	{#each group.rows as skill (skill.id)}
		<div class="skill-edit-row" class:specializable={isSpecializable(skill.skillName)}>
			<span class="skill-edit-name">
				{label(skill.skillName)}
				{#if skill.costPerLevel === 2}<span class="cost-mark" title="Costs 2 points per level"
						>×2</span
					>{/if}
			</span>
			<input class="input-demo input-num" type="number" min="0" bind:value={skill.points} />
			<span class="skill-edit-total" title="Governing stat + points invested"
				>{skillTotal(statValue, skill.points)}</span
			>
			{#if isSpecializable(skill.skillName)}
				<div class="skill-edit-subject-row">
					<input
						class="input-demo skill-edit-subject"
						type="text"
						bind:value={skill.specialization}
						placeholder="Subject — e.g. Elder Speech"
					/>
					{#if group.rows.length > 1 && skill.id}
						<!-- Never lets the last row of a specializable skill be removed — the
						     44-skill list is fixed and pre-seeded, and every other row here has
						     an id by the time it reaches this editor (server-assigned or just
						     created), so this is a real guard, not a placeholder for one. -->
						<button
							type="button"
							class="remove-row-btn skill-edit-remove"
							aria-label="Remove {label(skill.skillName)} subject"
							onclick={() => onRemoveSkill(skill.id!)}>✕</button
						>
					{/if}
				</div>
				<!-- The server rejects a second blank row or two rows naming the same
				     subject (422) — cheap enough to flag here rather than only after Save. -->
				{#if group.rows.filter((r) => r.specialization.trim() === skill.specialization.trim()).length > 1}
					<span class="skill-edit-warning">Duplicate subject — the server will reject this.</span>
				{/if}
			{/if}
		</div>
	{/each}
	{#if isSpecializable(group.name)}
		<button
			type="button"
			class="add-row-btn skill-edit-add"
			onclick={() => onAddSpecialization(group.rows[0])}
		>
			+ Add {label(group.name)} Subject
		</button>
	{/if}
{/each}
