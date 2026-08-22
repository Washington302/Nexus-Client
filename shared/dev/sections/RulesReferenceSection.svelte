<script lang="ts">
	import RulesReference from '@ui/RulesReference.svelte';
	import type { RulesDoc } from '@ui/rules-types';

	// One card of every block kind, so the gallery shows each `.rules-*` class in
	// this app's own theme. The real docs live in each app's
	// src/lib/data/rulesReference.ts.
	const doc: RulesDoc = {
		system: 'Fixture System',
		pdfHref: '#',
		pdfLabel: '4 pages · 40 KB · fixture, not a real file',
		groups: [
			{
				id: 'fixture-group',
				title: 'Fixture Group',
				sections: [
					{
						id: 'fixture-blocks',
						title: 'Every Block Kind',
						blocks: [
							{ kind: 'formula', text: 'Roll 1d20 + modifier vs. Difficulty' },
							{ kind: 'prose', text: 'A prose block carries ordinary explanatory text.' },
							{
								kind: 'defs',
								items: [
									{ term: 'Term', text: 'A definition row, used for attribute and action lists.' },
									{ term: 'Longer term here', text: 'The term column wraps rather than pushing the text column off the card.' }
								]
							},
							{
								kind: 'table',
								caption: 'A table caption',
								columns: ['Difficulty', 'DC', 'Example'],
								rows: [
									['Easy', '5', 'Something a novice manages'],
									['Average', '10', 'Something that needs attention'],
									['Hard', '20', 'Something that needs luck as well']
								]
							},
							{ kind: 'note', text: 'A note block holds the small print under a card.' }
						]
					},
					{
						id: 'fixture-second',
						title: 'A Second Card',
						blocks: [
							{ kind: 'prose', text: 'Two cards show how the group grid flows and wraps.' }
						]
					}
				]
			}
		]
	};
</script>

<h2>RulesReference</h2>
<RulesReference {doc} />
