<script lang="ts">
	import type { Cult, Gift, GiftEffect } from '$lib/services/api';
	import { GIFT_EFFECT_TAG_OPTIONS, GIFT_EFFECT_TAG_LABELS, GIFT_EFFECT_TAG_FIELDS } from '$lib/utils/character';

	let { cult }: { cult: Cult } = $props();

	function addGift() {
		cult.gifts.push({
			id: crypto.randomUUID(),
			name: '',
			activationType: 'Passive',
			magicPointCost: 0,
			skillRequired: '',
			effect: '',
			active: false,
			effects: []
		});
	}
	function removeGift(index: number) {
		cult.gifts = cult.gifts.filter((_, i) => i !== index);
	}
	function addEffect(gift: Gift) {
		gift.effects.push({ tag: 'ACTION_POINTS_FLAT_BONUS', scope: '', formulaValue: '', multiplier: 1, flatValue: 0 });
	}
	function removeEffect(gift: Gift, index: number) {
		gift.effects = gift.effects.filter((_, i) => i !== index);
	}
	function fieldsFor(effect: GiftEffect) {
		return GIFT_EFFECT_TAG_FIELDS[effect.tag];
	}
</script>

<div class="field-hdr" style="margin-top:8px;">Gifts</div>
{#each cult.gifts as gift, i}
	<div class="nested-card">
		<div class="list-row">
			<div class="list-row-fields" style="grid-template-columns: 1fr;">
				<input class="input-demo" bind:value={gift.name} placeholder="Gift name" />
			</div>
			<button class="remove-row-btn" onclick={() => removeGift(i)}>&#10005;</button>
		</div>
		<div class="grid-2">
			<div class="field-group">
				<div class="field-hdr">Activation Type</div>
				<input class="input-demo" list="activation-type-options" bind:value={gift.activationType} />
			</div>
			<div class="field-group">
				<div class="field-hdr">Magic Point Cost</div>
				<input class="input-demo input-num" type="number" bind:value={gift.magicPointCost} />
			</div>
		</div>
		<div class="field-group">
			<div class="field-hdr">Skill Required</div>
			<input class="input-demo" bind:value={gift.skillRequired} placeholder="e.g. Devotion" />
		</div>
		<div class="field-group">
			<div class="field-hdr">Effect</div>
			<textarea class="input-demo" style="min-height:60px;resize:vertical;" bind:value={gift.effect}
			></textarea>
		</div>
		<label style="display:flex;align-items:center;gap:6px;font-size:13px;margin:6px 0;">
			<input type="checkbox" bind:checked={gift.active} /> Active
		</label>

		<div class="field-hdr">Effects</div>
		{#each gift.effects as effect, j}
			<div class="nested-card">
				<div class="list-row">
					<div class="list-row-fields" style="grid-template-columns: 1fr;">
						<select class="input-demo" bind:value={effect.tag}>
							{#each GIFT_EFFECT_TAG_OPTIONS as tag}
								<option value={tag}>{GIFT_EFFECT_TAG_LABELS[tag]}</option>
							{/each}
						</select>
					</div>
					<button class="remove-row-btn" onclick={() => removeEffect(gift, j)}>&#10005;</button>
				</div>
				<div class="grid-2">
					{#if fieldsFor(effect).includes('scope')}
						<div class="field-group">
							<div class="field-hdr">Scope</div>
							<input class="input-demo" bind:value={effect.scope} placeholder="e.g. pow" />
						</div>
					{/if}
					{#if fieldsFor(effect).includes('formulaValue')}
						<div class="field-group">
							<div class="field-hdr">Formula</div>
							<input class="input-demo" bind:value={effect.formulaValue} placeholder="e.g. 1d6+6" />
						</div>
					{/if}
					{#if fieldsFor(effect).includes('multiplier')}
						<div class="field-group">
							<div class="field-hdr">Multiplier</div>
							<input class="input-demo input-num" type="number" step="0.1" bind:value={effect.multiplier} />
						</div>
					{/if}
					{#if fieldsFor(effect).includes('flatValue')}
						<div class="field-group">
							<div class="field-hdr">Flat Value</div>
							<input class="input-demo input-num" type="number" bind:value={effect.flatValue} />
						</div>
					{/if}
				</div>
			</div>
		{:else}
			<div class="empty-hint">No effects yet.</div>
		{/each}
		<button class="add-row-btn" onclick={() => addEffect(gift)}>+ Add Effect</button>
	</div>
{:else}
	<div class="empty-hint">No gifts yet.</div>
{/each}
<button class="add-row-btn" onclick={addGift}>+ Add Gift</button>
