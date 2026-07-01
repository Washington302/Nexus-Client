<script lang="ts">
	let {
		label = '',
		color = 'gray'
	}: {
		label?: string
		color?: 'gray' | 'yellow' | 'red' | 'black'
	} = $props();
</script>

<div class="condition-row">
	<div class="condition-pip {color}"></div>
	{label}
</div>

