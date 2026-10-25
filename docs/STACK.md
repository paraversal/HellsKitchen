# Tech stack

What we build with, in plain words. Every choice says what it does, why it is there, and what we fall back to if it
causes trouble. The guiding rule: boring technology, few dependencies, nothing that needs a server.

Status: **confirmed** (roadmap step 4). Versions were checked on 2026-10-25.

## The idea in one paragraph

A static website on GitHub Pages. Recipes and ingredients are plain text files (YAML) in the repository. When
someone changes them, a script checks them and turns them into one data file that ships inside the app. The app
runs in the browser, works offline, and keeps each plan on the user's own device. Plans move between people as
links. There is no server, no database, no login.

```
YAML files in the repo ──(check + build)──> one data file ──┐
                                                             ├──> the app, on GitHub Pages
app code ────────────────────────────────────────────────────┘
                                   plans live in the browser on each device
```

## The stack

### Language and app

| Concern | Choice | In plain words | Fallback |
|---|---|---|---|
| Language | **TypeScript 6** | JavaScript with types. The compiler catches mistakes like adding grams to litres before anyone runs the code. We pin version 6, because SvelteKit asks for it, even though 7 exists. | Plain JavaScript with JSDoc comments |
| App framework | **Svelte 5 + SvelteKit 3** with the static adapter | Svelte builds the screens; SvelteKit adds pages and routing and, with the static adapter, turns everything into plain files. Svelte code reads close to HTML, which keeps it approachable for newcomers. | Vite + Preact |
| Styling | **Plain CSS with variables** | The colors, type and spacing from `UI.fig` become CSS variables, and each component styles itself. No CSS framework to learn. | Tailwind |
| Icons | **Lucide** (`@lucide/svelte`) | The icon set the design already uses. | Inline SVG files |
| Font | **Bricolage Grotesque, self-hosted** (`@fontsource-variable/bricolage-grotesque`) | The font ships with the app, so it also shows up offline. A font loaded from Google would not. | A system font |
| Interface language | **English, no translation library** | One language means no translation machinery. | None needed |

### Data

| Concern | Choice | In plain words | Fallback |
|---|---|---|---|
| Source files | **YAML**, read with `yaml` | Readable and easy to diff, for people who are not programmers. | JSON |
| Checking the data | **Zod 4** | One definition of what a valid recipe, ingredient and plan look like, used by the build script and the app alike. Zod can also produce a JSON Schema from it, so editors can autocomplete and flag mistakes in the YAML files (to confirm in step 6). | Valibot |
| Relational checks | **Our own validation script** | Does what a database does with keys and constraints. See "Validation" below. | None: this is the point |
| What the app loads | **One JSON file** built from the YAML | About 50 recipes and 200 ingredients is a few hundred kilobytes at most. The browser loads it once and keeps it in memory. | SQLite, generated from the same YAML |

### On the device

| Concern | Choice | In plain words | Fallback |
|---|---|---|---|
| Saving plans | **IndexedDB** through `idb-keyval`, plus a request for persistent storage | The browser's built-in storage. `idb-keyval` is a tiny wrapper: it saves a plan as one object under a name and reads it back. | Dexie (heavier, adds queries) |
| Working offline | **SvelteKit's own service worker** and a web manifest | A small script that stores the app and the data after the first visit, so everything opens in airplane mode. The manifest lets people install the app to the home screen. | `vite-plugin-pwa` |

### Sharing and output

| Concern | Choice | In plain words | Fallback |
|---|---|---|---|
| Share link | **`fflate`** compression, plan placed in the URL fragment (the part after `#`) | The plan is squeezed small and put in the link. Browsers never send the fragment to a server, so plans stay private. | JSON file only |
| QR code | **`qrcode`** (generate only) | Moves a plan from a laptop to a phone without typing. | Copy the link |
| PDF | **The browser's print dialog** with a print stylesheet | "Save as PDF" is built into every browser. No library. | `pdfmake` |
| Backup | **JSON file** download and import | The answer to a browser clearing its storage. | None needed |

### Quality and hosting

| Concern | Choice | In plain words | Fallback |
|---|---|---|---|
| Unit tests | **Vitest** | Tests for the calculation, built from last year's real plans. This is where mistakes cost money. | Node's built-in test runner |
| Smoke test | **Playwright**, one test | Opens the built app, builds a small plan, checks the shopping list. | A manual checklist |
| Build and deploy | **GitHub Actions**, **GitHub Pages** | Free, no server, and the output is plain files that any static host can serve. | Cloudflare Pages, Netlify |
| Package manager | **npm**, with the lockfile committed | Comes with Node, nothing extra to install. | pnpm |
| Node version | **Node 24**, pinned in `.nvmrc` | The long-term-support version, and the one you run locally. SvelteKit needs 22.17 or newer. | |
| Updates | **Dependabot**, grouped | One pull request a month for dependency updates, not twenty. | |

## Validation

Skipping the database must not mean skipping what a database gives us: refusing bad data. The build script does that
job. It runs on every pull request and on every build, and a failure blocks the merge. Everything is checked
together, so a change is accepted or rejected as a whole, much like a transaction.

| What a database gives you | What we do instead |
|---|---|
| Primary key: unique ids | Ids are unique, lowercase, `a-z 0-9 -`, and match the file name. |
| Foreign key: references must exist | Every ingredient in a recipe exists. Every ingredient names a store that exists. |
| Column types and `NOT NULL` | The Zod schema: required fields, numbers are numbers, amounts are positive, servings is a whole number above zero. |
| `CHECK` constraints | Units must fit the ingredient (no litres of flour), prices are positive, categories come from a fixed list. |
| Enums | Categories and units are fixed lists in the schema. |
| Uniqueness within a record | An ingredient appears at most once per recipe. |

On top of that, **warnings** that do not block a merge but are shown to the reviewer: an unusually large amount per
portion (for example more than 500 g of one ingredient), a recipe without steps, an ingredient no recipe uses.

Every error says what is wrong, in which file, and how to fix it, in language a non-programmer can follow. A
plain-language summary of what changed ("added recipe Linsen-Dal, 9 ingredients") is attached to each pull request, so
reviewers do not have to read YAML diffs.

The same schema runs in the app when a plan is opened or imported, so a plan that points at a recipe that no longer
exists is caught and explained instead of breaking.

## What we are deliberately not using

- **SQLite in the browser.** See "Changes from the architecture plan".
- **A backend, database or login.** Nothing to host, pay for, or secure.
- **A state library.** Svelte's own state handling is enough for one person editing one plan.
- **A translation library.** The interface is English only.
- **A component library or CSS framework.** The design is small and already has its own tokens.
- **A monorepo tool.** See below.

## Changes from the architecture plan

1. **JSON instead of SQLite in the browser** (confirmed). The plan proposed compiling the recipes to a SQLite file and running
   it in the browser through WebAssembly, and admitted JSON would also work. At 50 recipes and 200 ingredients,
   JSON is simpler: no WebAssembly, no SQL, one less thing that can break in the year nobody touched the repo.
   Other people can still reuse the data, because JSON is open too. If we ever want a SQLite file, it can be generated
   from the same YAML without changing anything else.
2. **One package, not a monorepo with separate packages.** The calculation lives in its own folder with no
   interface code in it, and a test enforces that. Splitting it into a separate package later is cheap, and until then there is
   one install, one lockfile and one set of scripts.
3. **`idb-keyval` instead of Dexie.** A plan is one small document. We do not need queries over plans.
4. **Version names corrected.** The plan said "SvelteKit 5". Svelte is at 5 and SvelteKit at 3.
5. **No translation library and no separate price list.** English only, and prices sit on the ingredients in the data.

## Proposed folder layout

```
data/
  stores.yaml         the shops
  ingredients.yaml    every ingredient
  recipes/            one YAML file per recipe, named after the recipe id
scripts/              checks the data (validate-data.ts) and, later, builds the data file
src/
  lib/data/           the data rules (Zod schemas) and the checks between files
  lib/kitchen-engine/ the calculation: pure code, no screens, fully tested, with its own SPEC.md
  lib/data/           the Zod schemas
  lib/...             components, storage, sharing
  routes/             the screens
  service-worker.ts   offline support
static/               icons, manifest
docs/                 this file, the decisions, the roadmap's companions
```

## What step 5 has to prove

Before we build on this, the walking skeleton must show that these three things work on real phones:

1. **Offline on iPhone and Android.** Installed to the home screen, then opened in airplane mode.
2. **The GitHub Pages sub-path.** The app lives under `/<repo-name>/`, and links, the service worker and the manifest must respect that.
3. **A plan surviving a restart.** Saved, the app closed, the phone restarted, the plan still there. Safari can clear site data, so we also check what happens when the app is not installed.

## Decisions

1. **JSON instead of SQLite.** Decided: yes. Validation stays, see above.
2. **TypeScript.** Decided: yes.
3. **One package, not several.** Decided: yes. A *monorepo* here would mean one repository holding several separate packages, each with its own
   dependency list. We have one repository either way, with data and app together. Our code inside it is one package
   (one `package.json`, one install, one set of scripts). The calculation lives in its own folder, `src/lib/kitchen-engine/`, and a test keeps it free of screen code. Splitting later is cheap.
