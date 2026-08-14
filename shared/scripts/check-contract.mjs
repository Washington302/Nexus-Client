#!/usr/bin/env node
/**
 * Shared-component class contract checker.
 *
 * Shared components under shared/ui ship markup + class names only; each app's
 * own stylesheet is responsible for defining what those class names look like.
 * That split is what lets four visually distinct sites share one component, but
 * it has a nasty failure mode: a class defined in three apps and forgotten in
 * the fourth renders an unstyled element, and nothing fails until someone
 * loads that page.
 *
 * This script closes that hole. Run from an app directory:
 *   node ../shared/scripts/check-contract.mjs .
 *
 * It asserts:
 *   1. every static class name emitted by shared/ui exists as a selector in the
 *      app's CSS, and
 *   2. no file under shared/ui imports from '$lib' — $lib resolves relative to
 *      whichever app is compiling, so such an import would silently bind to a
 *      different module in each app.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const SHARED_UI = join(dirname(fileURLToPath(import.meta.url)), '..', 'ui');
const appRoot = process.argv[2] ?? '.';
const appName = relative(join(appRoot, '..'), appRoot) || appRoot;

/** Recursively collect files under `dir` whose name ends with `ext`. */
function walk(dir, ext, out = []) {
	let entries;
	try {
		entries = readdirSync(dir);
	} catch {
		return out;
	}
	for (const entry of entries) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) {
			if (entry === 'node_modules' || entry === '.svelte-kit') continue;
			walk(full, ext, out);
		} else if (entry.endsWith(ext)) {
			out.push(full);
		}
	}
	return out;
}

const sharedFiles = walk(SHARED_UI, '.svelte');
if (sharedFiles.length === 0) {
	console.log(`[contract] no shared components yet — nothing to check`);
	process.exit(0);
}

// ── 1. collect the class names shared components emit ──────────────────────
/** @type {Map<string, Set<string>>} class name -> emitting component files */
const emitted = new Map();
/** @type {Array<{file: string, value: string}>} */
const dynamic = [];
/** @type {Array<{file: string, line: number, text: string}>} */
const libImports = [];

const add = (cls, file) => {
	if (!emitted.has(cls)) emitted.set(cls, new Set());
	emitted.get(cls).add(file);
};

for (const file of sharedFiles) {
	const src = readFileSync(file, 'utf8');
	const short = relative(SHARED_UI, file);

	// class="..." — static tokens only; a token containing {} is interpolated
	// and cannot be resolved statically, so it is reported separately.
	for (const m of src.matchAll(/class="([^"]*)"/g)) {
		const value = m[1];
		for (const token of value.split(/\s+/).filter(Boolean)) {
			if (token.includes('{') || token.includes('}')) {
				dynamic.push({ file: short, value: token });
			} else {
				add(token, short);
			}
		}
	}

	// class:foo={...} directives
	for (const m of src.matchAll(/class:([A-Za-z0-9_-]+)/g)) add(m[1], short);

	// $lib imports are forbidden in shared code
	src.split('\n').forEach((text, i) => {
		if (/from\s+['"]\$lib/.test(text)) {
			libImports.push({ file: short, line: i + 1, text: text.trim() });
		}
	});
}

// ── 2. collect the selectors this app's CSS defines ────────────────────────
const cssFiles = walk(join(appRoot, 'src'), '.css');
const css = cssFiles.map((f) => readFileSync(f, 'utf8')).join('\n');

/** A class is "defined" if it appears as `.name` not followed by an ident char. */
const defines = (cls) =>
	new RegExp(`\\.${cls.replace(/[-[\]{}()*+?.,\\^$|#]/g, '\\$&')}(?![A-Za-z0-9_-])`).test(css);

const missing = [...emitted.entries()]
	.filter(([cls]) => !defines(cls))
	.map(([cls, files]) => ({ cls, files: [...files].join(', ') }));

// ── 3. report ──────────────────────────────────────────────────────────────
let failed = false;

if (libImports.length) {
	failed = true;
	console.error(`\n[contract] FAIL — shared components must never import $lib:`);
	for (const { file, line, text } of libImports) {
		console.error(`  shared/ui/${file}:${line}  ${text}`);
	}
	console.error(
		`  $lib resolves relative to the compiling app, so this binds to a\n` +
			`  different module in each one. Pass the value in as a prop instead.`
	);
}

if (missing.length) {
	failed = true;
	console.error(`\n[contract] FAIL — ${appName} is missing ${missing.length} class definition(s):`);
	for (const { cls, files } of missing) {
		console.error(`  .${cls}  (emitted by ${files})`);
	}
	console.error(
		`  Add these to ${appRoot}${sep}src${sep}lib${sep}styles${sep}app.css, or the elements render unstyled.`
	);
}

if (dynamic.length) {
	const list = [...new Set(dynamic.map((d) => `${d.value} (${d.file})`))];
	console.warn(
		`\n[contract] note — ${list.length} interpolated class name(s) cannot be checked statically:`
	);
	for (const d of list) console.warn(`  ${d}`);
}

if (failed) process.exit(1);

console.log(
	`[contract] ok — ${emitted.size} class(es) from ${sharedFiles.length} shared component(s) ` +
		`are all defined in ${appName} (${cssFiles.length} stylesheet(s) scanned)`
);
