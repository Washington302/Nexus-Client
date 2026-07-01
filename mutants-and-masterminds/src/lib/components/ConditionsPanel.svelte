<script lang="ts">
	type ConditionKey = 'vulnerable' | 'defenseless' | 'impaired' | 'disabled' | 'hindered' | 'dazed' | 'stunned' | 'fatigued' | 'exhausted' | 'incapacitated';

	let { activeConditions, toggleCondition, onReset }: { activeConditions: Set<ConditionKey>; toggleCondition: (key: ConditionKey) => void; onReset: () => void } = $props();

	const items = [
		{ key: 'vulnerable' as ConditionKey, label: 'Vulnerable', desc: 'Halve Dodge & Parry', color: 'red' },
		{ key: 'defenseless' as ConditionKey, label: 'Defenseless', desc: 'Dodge & Parry \u2192 0', color: 'black' },
		{ key: 'impaired' as ConditionKey, label: 'Impaired', desc: '-2 to all checks', color: 'yellow' },
		{ key: 'disabled' as ConditionKey, label: 'Disabled', desc: '-5 to all checks', color: 'red' },
		{ key: 'hindered' as ConditionKey, label: 'Hindered', desc: 'Halve Speed', color: 'gray' },
		{ key: 'dazed' as ConditionKey, label: 'Dazed', desc: 'Standard action only', color: 'yellow' },
		{ key: 'stunned' as ConditionKey, label: 'Stunned', desc: 'No actions', color: 'red' },
		{ key: 'fatigued' as ConditionKey, label: 'Fatigued', desc: '-1 to checks', color: 'yellow' },
		{ key: 'exhausted' as ConditionKey, label: 'Exhausted', desc: '-2 to checks', color: 'red' },
	];
</script>

<div style="margin-bottom: 6px;">
	<span class="action-word zap" style="font-size: 20px;">STATUS</span>
	<button class="reset-cond-btn" onclick={onReset}>Reset</button>
</div>
{#each items as item}
	<label class="cond-check-row">
		<input type="checkbox" checked={activeConditions.has(item.key)} onchange={() => toggleCondition(item.key)} />
		<div class="cond-pip {item.color}"></div>
		<span class="cond-label">{item.label}</span>
		<span class="cond-desc">{item.desc}</span>
	</label>
{/each}
{#if activeConditions.has('dazed') || activeConditions.has('stunned')}
	<div class="action-warning">
		{activeConditions.has('stunned') ? '\u26D4 STUNNED \u2014 No actions this round' : '\u26A0\uFE0F DAZED \u2014 Standard action only'}
	</div>
{/if}

