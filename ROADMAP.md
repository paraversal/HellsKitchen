# Roadmap

How we get from the finished UI design (`UI.fig`) to a working app. Each step ends in something you can
check, so we move on only when the step before it is clear.

Working rules:

- Every step produces a short written note (one page or less), so the reasoning outlives us.
- Pull requests stay small. Reviewers read a plain-language summary, not code.
- Each step ends with something you can click or run yourself.
- Terms stay consistent. A glossary (plan, meal, recipe, ingredient, store) lives in the docs from step 6.

Decisions so far are recorded in [docs/DECISIONS.md](docs/DECISIONS.md). Things we deliberately left out
of the first version are collected in [docs/SOMEDAY.md](docs/SOMEDAY.md).

---

## Checklist

- [x] **0. UI design.** Design system, mobile and desktop screens, saved in `UI.fig`.

- [x] **1. Decisions note.** Answer the open questions in `docs/DECISIONS.md`.
  *Done when:* every question has an answer or a named owner. Still open: the Excel (step 2), where default pack sizes come from, and the licence.

- [x] **2. Excel discovery.** Written up in [docs/EXCEL.md](docs/EXCEL.md). Open points are listed there, and we proceed on inferred rules (see step 7 and the clean slate in step 15).

- [x] **3. Design follow-ups.** `UI.fig` updated for the decisions: no fixed-amount lock icons, and cost-estimate surfaces (plan total with a "food priced" bar, a subtotal per store, and a marker on ingredients without a price).

- [x] **4. Tech stack.** Confirmed in [docs/STACK.md](docs/STACK.md).

- [ ] **5. Walking skeleton.** An empty app on GitHub Pages that installs on a phone and opens offline, with CI running. Built, published and tested: on a computer, and on an iPhone (see the results in [docs/DEPLOY.md](docs/DEPLOY.md)). The Android test is still to do.
  *Done when:* the live URL works on one iPhone and one Android phone in airplane mode.

- [x] **6. Kitchen engine spec.** Finish `src/lib/kitchen-engine/SPEC.md`: every rule numbered, with status and a worked example. Written before any engine code.
  *Done when:* you can read the spec top to bottom and say "yes, that is how it should calculate", rule by rule.

- [x] **7. YAML schemas and Excel import.** Ingredients (name, unit, exactly one store, default pack size, optional price), recipes (category, source, planned grams per person, ingredient lines per 100 g, steps), and the meal-based plan format, each documented in plain words with one example file. A one-off import script turns the Excel's recipes into YAML. Recipes that fail the plausibility check are imported but marked `needs-review` and kept out of the app until cleaned. Done so far: formats in [docs/DATA.md](docs/DATA.md), the importer in `scripts/import-excel/` (60 recipes, 186 ingredients, 472 amounts checked against the Excel with no differences), an example plan.
  *Done when:* the Excel's usable recipes exist as YAML and read naturally.

- [x] **8. Validator.** One validation script, shared by CI and the app. Built: `npm run validate` and the same code in `src/lib/data/` (41 tests), wired into CI. The app will use the same code to check imported plans.
  *Done when:* a deliberately broken recipe fails with an error a non-programmer can understand.

- [x] **9. Kitchen engine code and tests.** The rules from the spec, one small file each, with tests named by rule id and the spec's worked examples run as tests. A test keeps the spec and the code in step. The engine's totals are compared with the Excel's own numbers for every recipe the Excel got right, and for the Excel workbook as it was saved.
  *Done when:* the spec's examples pass, and the engine's totals match the Excel for every recipe the Excel got right (the known differences are tested too).

- [ ] **10. Design tokens in code.** Export colors and type from `UI.fig` as CSS variables; build the shared components (buttons, chips, meal row, store tabs).
  *Done when:* a style-sheet page matches the design board.

- [ ] **11. Recipes screens.** List with search and filters; recipe detail with the portions stepper.

- [ ] **12. Plan and Shopping screens.** Days, meals and headcounts; live shopping list with store tabs; saved on the device.
  *Done when:* a full realistic plan can be built on a phone in under 15 minutes.
  Safety rule from the iPhone test: after a restart without a connection, saved data can look missing until the phone is back online. The app must tell "could not read the storage yet" apart from "no plans", and never save over a plan before a read has worked.

- [ ] **13. Prices and cost estimate.** Show a cost estimate for the plan and per store, and how complete it is.
  *Done when:* a plan with a few missing prices still shows an estimate, clearly marked as partial.

- [ ] **14. Share, export, print.** Share link, QR code, JSON backup, PDF for shopping list and recipe sheets.
  *Done when:* a plan moves from laptop to phone by link and prints to a readable PDF.

- [ ] **15. Clean slate.** We now have a working product. Go through every `inferred` rule in the spec, settle it with the cooks, and clean the recipe data (the `needs-review` recipes first). Record each change in the engine's CHANGELOG.
  *Done when:* no rule in the spec is still marked `inferred`.

- [ ] **16. Contribution flow and docs.** Issue forms, review rules, a short CONTRIBUTING guide, the yearly checklist.
  *Done when:* someone who never saw the project lands a recipe change.

- [ ] **17. Field test.** Dry run of a past event on real phones, offline, signed off against the old Excel.

Steps 5 and 6 can run side by side. Step 7 needs step 6.
