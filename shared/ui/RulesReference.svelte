<script lang="ts">
	import type { RulesDoc } from './rules-types';

	// Renders a system's rules reference: download card, table of contents, then
	// the cards themselves. Class names only — each app's app.css decides what a
	// rules card looks like, so the four sites stay visually distinct.
	// See shared/ui/CONTRACT.md.
	let { doc }: { doc: RulesDoc } = $props();
</script>

<div class="rules-doc">
	<div class="rules-download">
		<div>
			<div class="rules-download-title">Printable reference sheet</div>
			<p class="rules-download-note">{doc.pdfLabel}</p>
		</div>
		<a class="rules-download-btn" href={doc.pdfHref} download>Download PDF</a>
	</div>

	<nav class="rules-toc" aria-label="Rules sections">
		{#each doc.groups as group (group.id)}
			<div class="rules-toc-group">
				<span class="rules-toc-title">{group.title}</span>
				{#each group.sections as section (section.id)}
					<a class="rules-toc-link" href="#{section.id}">{section.title}</a>
				{/each}
			</div>
		{/each}
	</nav>

	{#each doc.groups as group (group.id)}
		<section class="rules-group" id={group.id}>
			<h2 class="rules-group-title">{group.title}</h2>

			{#each group.sections as section (section.id)}
				<article class="rules-card" id={section.id}>
					<h3 class="rules-card-header">{section.title}</h3>
					<div class="rules-card-body">
						{#each section.blocks as block, i (i)}
							{#if block.kind === 'formula'}
								<p class="rules-formula">{block.text}</p>
							{:else if block.kind === 'prose'}
								<p class="rules-prose">{block.text}</p>
							{:else if block.kind === 'note'}
								<p class="rules-note">{block.text}</p>
							{:else if block.kind === 'defs'}
								<dl class="rules-defs">
									{#each block.items as item (item.term)}
										<dt class="rules-def-term">{item.term}</dt>
										<dd class="rules-def-text">{item.text}</dd>
									{/each}
								</dl>
							{:else if block.kind === 'table'}
								{#if block.caption}
									<p class="rules-table-caption">{block.caption}</p>
								{/if}
								<!-- Wide tables scroll inside the wrapper; the page body never does. -->
								<div class="rules-table-wrap">
									<table class="data-table">
										<thead>
											<tr>
												{#each block.columns as column (column)}
													<th>{column}</th>
												{/each}
											</tr>
										</thead>
										<tbody>
											{#each block.rows as row, r (r)}
												<tr>
													{#each row as cell, c (c)}
														<td>{cell}</td>
													{/each}
												</tr>
											{/each}
										</tbody>
									</table>
								</div>
							{/if}
						{/each}
					</div>
				</article>
			{/each}
		</section>
	{/each}
</div>
