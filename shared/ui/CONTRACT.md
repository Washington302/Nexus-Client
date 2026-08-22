# Shared component contract

Components in `shared/ui` are consumed by `godbound-site`,
`mutants-and-masterminds`, `mythras-site` and `witcher-site` via the `@ui`
alias. `my-app` is deliberately **not** a consumer — it has no stylesheet and
styles everything with inline `style=` attributes, so it cannot satisfy the
class contract below.

## The two rules

### 1. Shared components ship markup and class names. Never styles.

The four sites are meant to look different — comic newsprint, dark-fantasy
`oklch`, illuminated manuscript. A shared component therefore emits bare class
names and each app's `src/lib/styles/app.css` decides what they mean.

The consequence: **every class a shared component emits must be defined in all
four apps.** A class defined in three and forgotten in the fourth renders an
unstyled element, and nothing fails until somebody loads that page.
`shared/scripts/check-contract.mjs` enforces this — see below.

When markup has to converge and one app disagrees, absorb the difference in
that app's CSS, not in a component prop. Concretely: the shared `Panel` uses
`<span class="panel-label">`, m&m previously used a `<div>`, so m&m gets
`.panel-label { display: block; }` — one line of CSS beats a `labelTag` prop.

### 2. A shared component must never import `$lib`.

`$lib` resolves relative to *whichever app is compiling*. A shared component
importing `$lib/stores/session.svelte` would silently bind to four different
modules — and it would work, which is exactly what makes it dangerous.
Everything app-specific arrives as a prop.

`$app/*` is fine; SvelteKit provides it and it is identical everywhere.

**One documented exception:** `ThemeEditor` imports `$lib/stores/theme.svelte`
by design, because every app is required to expose that module with a fixed
surface (`theme`, `updateTheme`, `DEFAULT_THEME`, `PRESETS`, `PRESET_KEYS`,
`THEME_LABELS`, `ThemeColors`). If you add another exception, document it here
and add it to the checker's allowlist.

## Enforcement

```bash
npm run check:contract     # from any consuming app
```

Asserts both rules and exits non-zero naming the app and the missing class.
Wire it into each app's `check` script so it runs in CI. It is the only thing
standing between this architecture and a component that ships unstyled to
production.

Interpolated class names (`class="pill pill-{color}"`) cannot be resolved
statically; the checker reports them as notes so they stay visible. Verify
those by eye in the gallery.

## Gallery

Each app serves `/dev/gallery` in dev only — every shared component in every
prop permutation, rendered in that app's own theme. It is the 30-second visual
check after any change to `shared/ui`.

## Class contract

| Class | Emitted by | Must provide |
| --- | --- | --- |
| `.backdrop` | EditModal | full-viewport overlay behind the dialog |
| `.dialog` | EditModal | centred, elevated modal container |
| `.header` / `.header-title` | EditModal | modal title bar |
| `.close-btn` | EditModal | ✕ button in the header |
| `.content` | EditModal | scrollable modal body |
| `.error` | EditModal | error message styling (save failures) |
| `.footer` | EditModal | action row at the modal foot |
| `.btn-cancel` / `.btn-save` | EditModal | secondary / primary buttons |
| `.panel-full` | Panel | the panel frame |
| `.panel-header` | Panel | header bar; **must be `position: relative`** if the app decorates it with a pseudo-element |
| `.panel-label` | Panel | header text. The element is a `<span>`, so an app that needs block behaviour sets `display: block` (m&m does) |
| `.panel-body` | Panel | panel content area |
| `.edit-wrap` | EditableWrapper | `position: relative` — anchors the pencil button |
| `.edit-btn` | EditableWrapper | the ✎ affordance, positioned against `.edit-wrap` |
| *`.click-area`* | EditableWrapper | **intentionally unstyled** — see `unstyled.json` |
| `.pill` + `.pill-*` | PillBadge | base pill, plus one modifier per variant the app uses (`primary`/`danger` in godbound & m&m; `primary`/`gold`/`error` in mythras & witcher) |
| `.stat-bubble` / `.stat-num` / `.stat-num-*` / `.stat-lbl` | StatBubble | value bubble; one `.stat-num-*` modifier per colour the app passes |
| `.splash-header` / `.splash-title` / `.splash-sub` | SplashHeader | page banner. Needs `position: relative` if the app decorates it with a pseudo-element |
| `.splash-eyebrow` | SplashHeader | only rendered when an `eyebrow` is passed |
| `.rules-doc` | RulesReference | outer wrapper for the whole rules page |
| `.rules-download` / `.rules-download-title` / `.rules-download-note` / `.rules-download-btn` | RulesReference | the "download the PDF" card and its button |
| `.rules-toc` / `.rules-toc-group` / `.rules-toc-title` / `.rules-toc-link` | RulesReference | table of contents; one group per page of the printed sheet |
| `.rules-group` / `.rules-group-title` | RulesReference | one page of the printed sheet. The group is the card grid, so it needs `display: grid` and the title needs `grid-column: 1/-1` |
| `.rules-card` / `.rules-card-header` / `.rules-card-body` | RulesReference | one card. m&m/mythras/witcher make the header a bar and pad the body; godbound pads the card and leaves the header inline — the component is the same either way |
| `.rules-formula` | RulesReference | the boxed headline rule of a card |
| `.rules-prose` / `.rules-note` | RulesReference | body paragraph / small print |
| `.rules-defs` / `.rules-def-term` / `.rules-def-text` | RulesReference | term/definition rows (a `<dl>`); should collapse to one column on narrow screens |
| `.rules-table-caption` / `.rules-table-wrap` | RulesReference | table caption; **`.rules-table-wrap` must be `overflow-x: auto`** so wide tables scroll instead of widening the page |
| `.data-table` | RulesReference | the table itself, plus its `th`/`td`. Pre-existed in mythras & witcher; added to m&m & godbound for this |
| `.nav-toggle` | SiteNav | the ☰ button. **Must be `display: none` above the app's nav breakpoint and shown below it** — the component reads its visibility (`offsetParent`) to decide whether the collapsed menu still applies, so CSS stays the only place the breakpoint lives |
| `.nav-menu` / `.nav-menu-link` | SiteNav | the collapsed link list `.nav-toggle` opens, and one link in it. Positioned against `.site-nav`, so that element **must establish a containing block** (`position: sticky` in m&m/mythras/witcher, `position: relative` in godbound) |

Only the apps that **import** a component need its classes — `check-contract.mjs`
follows each app's real `@ui/…` imports transitively, so godbound (which uses
only PillBadge and SplashHeader) is never asked for `.panel-full`.

### The nav breakpoint

`SiteNav` renders its primary links twice: inline in `.nav-left`, and again in
`.nav-menu` behind `.nav-toggle`. The inline row does not fit a phone — godbound
ships eight links and measured 726px of `.nav-left` at a 375px viewport — so
laying it out unconditionally pushed `documentElement.scrollWidth` past
`clientWidth`, scrolled the whole page sideways and left the last links off
screen. (mythras and witcher hid the overflow instead, which made those links
unreachable rather than merely awkward.)

Each app's stylesheet owns the switch, and all four currently put it at
`max-width: 1024px`: below it `.nav-left .nav-link` and `.nav-sep` go to
`display: none` and `.nav-toggle` / `.nav-menu` come back. Nothing in the
component hardcodes that width — it asks whether `.nav-toggle` is still
rendered — so an app may move its own breakpoint without touching shared code.

### The colour token

`Panel` emits its `color` prop verbatim as a second class on `.panel-header`
(`<div class="panel-header gold">`), so each app keeps its own vocabulary —
mythras/witcher use `gold`/`teal`/`plain`, m&m uses `red`/`yellow`/`blue`/`dark`
— and no app has to rename a rule. A token with no matching rule simply matches
nothing; that is exactly how mythras and witcher's default `primary` works,
since `primary` *is* the base `.panel-header` style.

Because the class is interpolated, the checker cannot verify it statically. It
prints it as a note; verify colour variants by eye in the gallery.

### Intentionally unstyled classes

`shared/ui/unstyled.json` lists classes that carry no styling in *any* app, with
a reason for each. The checker skips them but still prints them, so a deliberate
omission never becomes a silent one. A class missing from **one** app but present
in the others is a real bug — fix that app's stylesheet rather than listing it.
