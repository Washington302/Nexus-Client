/**
 * Shape of a system's rules reference — the HTML twin of the printable PDF
 * reference sheet each site ships in its own `static/rules/` folder.
 *
 * Types only, no runtime code: `RulesReference.svelte` renders one of these and
 * each app supplies its own in `src/lib/data/rulesReference.ts`.
 */

/** The boxed headline rule of a card ("Roll 1d100 vs. Skill %"). */
export type RuleFormula = { kind: 'formula'; text: string };
/** A normal paragraph. */
export type RuleProse = { kind: 'prose'; text: string };
/** The small print under a card — caveats, exceptions, reminders. */
export type RuleNote = { kind: 'note'; text: string };
/** Term/definition rows, e.g. the six attributes and what each governs. */
export type RuleDefs = { kind: 'defs'; items: { term: string; text: string }[] };
/** A data table. `columns` becomes the header row; every row must match its length. */
export type RuleTable = {
	kind: 'table';
	caption?: string;
	columns: string[];
	rows: string[][];
};

export type RuleBlock = RuleFormula | RuleProse | RuleNote | RuleDefs | RuleTable;

/** One card on the sheet. `id` is the anchor the table of contents jumps to. */
export type RuleSection = { id: string; title: string; blocks: RuleBlock[] };

/** One page of the printed sheet — a themed run of cards. */
export type RuleGroup = { id: string; title: string; sections: RuleSection[] };

export type RulesDoc = {
	/** Game system, as printed on the sheet. */
	system: string;
	/** Root-absolute path to the PDF in this app's `static/` folder. */
	pdfHref: string;
	/** Human-readable size/page hint shown next to the download button. */
	pdfLabel: string;
	groups: RuleGroup[];
};
