<script lang="ts">
	// `absent` renders an em dash instead of the value — used for abilities a
	// character simply does not have, which is distinct from having a score of 0.
	let {
		value = 0,
		label = '',
		color = 'default',
		absent = false
	}: {
		value?: number | string;
		label?: string;
		color?: string;
		absent?: boolean;
	} = $props();
</script>

<div class="stat-bubble">
	<div class="stat-num stat-num-{color}">{absent ? '—' : value}</div>
	<div class="stat-lbl">{label}</div>
</div>
