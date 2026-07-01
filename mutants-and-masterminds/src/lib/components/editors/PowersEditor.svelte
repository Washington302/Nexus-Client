<script lang="ts">
	import type { Power } from '$lib/services/api';
	import { calcPower, computeDeviceCost } from '$lib/utils/character';
	import PowerCardEditor from './PowerCardEditor.svelte';

	let {
		powers,
		allowNestedSummon = true,
	}: {
		powers: Power[];
		allowNestedSummon?: boolean;
	} = $props();

	$effect(() => {
		for (const power of powers) {
			if (power._deviceType) {
				for (const ep of (power._embeddedPowers ?? [])) {
					calcPower(ep);
				}
				const dc = computeDeviceCost(power);
				power.totalPowerCost = dc.final;
			} else {
				calcPower(power);
			}
		}
	});

	function addPower() {
		powers.push({
			powerId: crypto.randomUUID(),
			name: '',
			description: '',
			descriptors: [],
			isArray: false,
			maxPpPool: 0,
			effects: [],
			alternateEffects: [],
			totalPowerCost: 0,
		});
	}

	function addDevice() {
		powers.push({
			powerId: crypto.randomUUID(),
			name: '',
			description: '',
			descriptors: [],
			isArray: false,
			maxPpPool: 0,
			effects: [],
			alternateEffects: [],
			totalPowerCost: 0,
			_deviceType: 'REMOVABLE',
			_embeddedPowers: [],
		});
	}

	function removePower(i: number) {
		powers.splice(i, 1);
	}
</script>

<div class="editor-grid">
	{#each powers as power, i}
		<PowerCardEditor {power} onRemove={() => removePower(i)} {allowNestedSummon} />
	{/each}
	<div class="add-row">
		<button class="add-btn" onclick={addPower}>+ Add Power</button>
		<button class="add-device-btn" onclick={addDevice}>+ Add Device</button>
	</div>
</div>

