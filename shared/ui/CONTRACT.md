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
