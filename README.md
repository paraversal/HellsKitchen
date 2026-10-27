# Hell's Kitchen

A web app for planning the food of a big event: pick the meals, set the headcount, get the shopping list by store and a cost estimate.
It runs in the browser, works offline, and keeps each plan on the user's own device. There is no server and no account.

## Where to read first

| What | Where |
|---|---|
| **What the app is and can do today, what is missing, and where it could go** | [docs/STATE.md](docs/STATE.md) |
| **How to use it** (for the people who plan the event) | [docs/MANUAL.md](docs/MANUAL.md) |
| The plan and what is done | [ROADMAP.md](ROADMAP.md) |
| What has been decided, and what is still open | [docs/DECISIONS.md](docs/DECISIONS.md) |
| The tech stack, in plain words | [docs/STACK.md](docs/STACK.md) |
| The data files: recipes, ingredients, stores, plans | [docs/DATA.md](docs/DATA.md) |
| How amounts are calculated | [src/lib/kitchen-engine/SPEC.md](src/lib/kitchen-engine/SPEC.md) |
| How to put the site online and test it on phones | [docs/DEPLOY.md](docs/DEPLOY.md) |
| The design, and how it becomes code | `UI.fig`, open it with [OpenPencil](https://openpencil.dev); [docs/DESIGN.md](docs/DESIGN.md) |

## Working on it

You need Node 24 (see `.nvmrc`) and [pnpm](https://pnpm.io).

```
pnpm install         # install what the project needs
pnpm dev             # start it locally
pnpm check           # types
pnpm validate        # check the data files (recipes, ingredients, stores)
pnpm build:data      # turn the data files into what the app ships with (runs by itself before dev, build and check)
pnpm test            # tests
pnpm build           # build the site into build/
```

## Folders

```
data/                  recipes, ingredients, stores (YAML); photos of recipes in data/images/
docs/                  decisions, formats, stack, deployment
scripts/validate-data.ts  checks the data files
scripts/import-excel/  the one-off import from the old Excel sheet
src/lib/components/    the shared building blocks of the screens
src/lib/screens/       the bigger parts of screens that use data
src/lib/styles/        the design tokens: colors, type, spacing
src/lib/data/          the rules for the data files, and the checks
src/lib/kitchen-engine/  the calculation, with its own spec
src/lib/integration/   tests that compare the engine with the old Excel
src/routes/            the screens
src/service-worker/    makes the app work offline
static/                icons and the web manifest
```
