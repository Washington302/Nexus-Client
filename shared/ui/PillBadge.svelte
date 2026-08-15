<script lang="ts">
	// Each app owns its own pill vocabulary via a modifier class: godbound and
	// m&m use primary|danger, mythras and witcher use primary|gold|error. The
	// colours themselves live in each app's stylesheet, which is why this
	// component carries no CSS variables of its own.
	let { text = '', color = 'primary' }: { text?: string; color?: string } = $props();
</script>

<span class="pill pill-{color}">{text}</span>
