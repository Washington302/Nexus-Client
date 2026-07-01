<script lang="ts">
	interface AttackAction {
		name: string;
		attackBonus: number;
		autoHit: boolean;
		resistance: string;
		resistanceDC: number;
		range: string;
		descriptors: string[];
		notes?: string;
	}

	let { attack }: { attack: AttackAction } = $props();
</script>

<div class="atk-card" class:ranged={attack.range === 'ranged'}>
	<div class="atk-name">{attack.name}</div>
	<div class="atk-bonus">{attack.autoHit ? 'Auto' : attack.attackBonus >= 0 ? '+' + attack.attackBonus : String(attack.attackBonus)}</div>
	<div class="atk-resist">{attack.resistance}</div>
	<div class="atk-dc">{attack.resistanceDC > 0 ? attack.resistanceDC : '\u2014'}</div>
	{#if attack.descriptors.length}
		<div class="atk-desc">{attack.descriptors.join(', ')}</div>
	{/if}
	{#if attack.notes}
		<div class="atk-notes">{attack.notes}</div>
	{/if}
</div>

