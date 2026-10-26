# State of the app

Where Hell's Kitchen stands, what it can do, what it cannot do yet, and where it could go. Written on 2026-10-26, after roadmap step 14 and a round of fixes on real phones.

The other documents describe how the app was made and why. This one describes **what exists now**. How to use the app is in the [user manual](MANUAL.md).

## In short

Hell's Kitchen plans the food of a big yearly event, replacing an Excel sheet. You set the headcount, put dishes in meals on days, and get a shopping list per store with a cost estimate.
It is a static website that also works as an app on a phone's home screen. There is no server and no account: every plan lives in the browser of the device that made it, and moves between devices as a link, a QR code or a file.

- **Data:** 39 recipes in the app (21 more are waiting for a second look), 186 ingredients, 4 stores. All of it is public YAML in `data/`.
- **Calculation:** 11 written rules, in [the kitchen engine spec](../src/lib/kitchen-engine/SPEC.md). The engine is plain code with its own tests and is compared with the old Excel.
- **Tests:** 364, all passing. Type-check, data validation and the build pass.
- **Phones tested:** an iPhone, for the walking skeleton only. The plan, shopping, sharing, printing and touch fixes are checked in a browser at phone width and in the iOS Simulator, but not yet on a real phone. Android has not been tried at all.

## Where we are on the roadmap

| Step | State |
|---|---|
| 0 to 4: design, decisions, Excel discovery, design follow-ups, tech stack | Done |
| 5: walking skeleton on GitHub Pages | Built and tested on an iPhone. **Android test still to do** |
| 6 to 9: engine spec, YAML formats and Excel import, validator, engine code and tests | Done |
| 10: design tokens and shared components | Done |
| 11 to 14: recipes, plan and shopping, prices, share/export/print | Done, phone tests still to do (checklist in [DEPLOY.md](DEPLOY.md)) |
| 15: clean slate (settle every `inferred` rule with the cooks, clean the data) | **Not started** |
| 16: contribution flow and docs | **Not started** |
| 17: field test with a past event, offline, against the old Excel | **Not started** |

Built beyond the roadmap: the Fun setting and the motion work, the Pantry tab, the `no_cooking` flag for recipes, editing the plan name and headcount in place, several plans on one device, and PDF files for phones that cannot print.

## What the app does today

### Plan

- A plan is one event: a name, a headcount (**everyone**), a number of **organisers**, and an **appetite factor** (1 unless changed; the old Excel used 1.3 on Friday) for hungrier meals.
- It has **days** (each with a date), and each day has **meals**: breakfast, lunch, coffee & cake, dinner or snack, with an optional time.
- A meal is **for everyone** or **for organisers** (always 100 % of that number), and can be switched to **hungrier than usual**, which multiplies its main dishes by the appetite factor.
- A meal holds **dishes**, which are recipes. Each dish can override its grams per person and its share of the guests. Main dishes share a meal between them by default (two mains: half each).
- The name and the headcount are changed by pressing them. The other settings are in the event settings, behind the sliders button. More than one plan can be kept on a device: they are listed in the event settings, and on a computer also from the box at the bottom of the sidebar, which shows the event at a glance (name, headcount, organisers, days, hunger factor). They can be opened, created and deleted there.
- The estimated **cost per person** is on top, with how much of the food has a price.
- Deleting a meal or a day asks first.

### Recipes

- A list grouped by letter, searchable by recipe name or ingredient, with chips for the kind of dish.
- A recipe page shows its ingredients scaled to a number of portions (the portions are only for trying out a recipe and never touch the plan), and its method.
- Every recipe has a round picture: its **photo** if there is one in `data/images/`, otherwise an icon for its kind. No photos have been added yet.
- A recipe marked **no cooking** (jam, fruit, drinks: things put out as they are) has no method and shows a "No cooking" badge.
- A recipe can be added to a plan from the list or from its page: the app asks which meal gets it.

### Shopping

- One tab per store that has something to buy; the tab shows how many items are left, or a check when the store is done. An arrow at the edge shows when there are more tabs than fit. On a desktop the stores are a column on the left, with the cost of each.
- Every line shows the amount to buy, with whole packs when the ingredient has a pack size (almost none have one yet, so the exact amount is shown nearly everywhere).
- Items are ticked off; the ticks are saved with the plan. A bar shows progress per store. A store shows its estimated cost and how many items have no price.
- When the whole list is done the screen says so.
- "Hide bought items" (on by default, kept on the device) moves a ticked item under "Bought", where it can be unticked. With Fun on, it flies into the basket of the Shopping tab on the way.

### Sharing, backup and printing

- The share sheet (the share button on the plan) offers a **link** (the whole plan inside the part after `#`, never sent to a server), a **QR code** of that link, copy and send, a **file** to keep, opening a **file**, and **pasting a link** (for phones where a link opened in the browser instead of the app).
- When a plan arrives by link or file, the app shows it next to the plan on the device with the time each was last changed, and asks: keep both, replace, or cancel. The shopping ticks are not part of a link; a file keeps them.
- **Print pages** exist for the shopping list (all stores, or one) and for recipe sheets, one page per dish, scaled to the meal it is cooked for. A phone that cannot open the print window (an iPhone started from the home screen) gets a **PDF** button instead, which writes a plain PDF and hands it to the share sheet.
- The reminder to keep a copy of the plan is built but **switched off** because it was in the way.

### Pantry and settings

The fourth tab, **Pantry**, shows what the app has to cook with: how many recipes, ingredients and stores; how complete the data is (bars for ingredients with a price, recipes with a method, recipes with a photo, ingredients with a pack size, each opening the list of what is missing); the recipes waiting for review; one bar cut into the stores by how many ingredients each has; ingredients no recipe uses, and what the checks said.

The gear in its corner opens **Settings**: the **Fun** switch, and facts about the app (version, data version, rules version, number of plans on this device, links to the style sheet, the motion trial page and the offline check).

### Fun and motion

Fun is a switch with two sets of animations. Which strength of each animation each set uses is the table in `src/lib/motion/choices.ts`, explained in [ANIMATIONS.md](ANIMATIONS.md), where every idea that was not chosen is also kept. The trial page `/styleguide/motion/` shows every strength of every idea. If a device asks for less motion, the app always uses the set without fun and throws no particles.

### Works offline, installs on a phone

A service worker stores the whole app on the first visit, so it opens without a connection. The app can be added to a home screen and then looks like an app. Saved plans are never overwritten unless they were read successfully first: after a restart without a connection a phone can say "nothing saved" when there is something, and the app tells that apart from "no plans" ([DATA.md](DATA.md)).

### Phones

No zoom, no highlight when a scroll starts on a button, the bottom bar answers even while a page is still gliding after a flick, sheets stay above the keyboard, and the store tabs only scroll sideways. Several of these were found on a real iPhone and are fixed in a way that is not yet confirmed there (see below).

### Data and contributing

Recipes, ingredients and stores are YAML files, checked by one validator (`npm run validate`) that runs locally, in CI and, for plans, in the app. The formats are in [DATA.md](DATA.md). Pushing to `main` deploys to GitHub Pages. The contribution flow for other people is not written yet (step 16).

## How it fits together

```
data/*.yaml ──(validator)──► src/lib/generated/app-data.json ──► the app
                                            │
plan (IndexedDB, one library per device) ───┴──► kitchen engine ──► shopping list, cost, recipe sheets
```

- `src/lib/kitchen-engine/` is pure calculation and knows nothing about screens. Its spec and code are kept in step by a test.
- `src/lib/plan/` holds the plan: edits, saving, sharing, printing and the PDF writer.
- `src/lib/screens/` and `src/lib/components/` are the screens and building blocks; `src/routes/` are the pages.
- `src/lib/motion/` is everything that moves.

## Known limits and things not yet confirmed on a phone

- **Gliding scroll on iPhone.** A tap on a page that is still gliding is meant to stop the glide for good and not press anything underneath. The code holds the page still for a moment when that happens, but this is unconfirmed on a real phone. `/glidetest/` is a temporary page for trying other ways of doing it; delete it once the question is settled.
- **Printing on iPhone.** The PDF route is built but untried on a phone. If printing from a normal Safari tab still does nothing, the diagnosis (no print window in home-screen apps) is wrong.
- **Links into the installed app.** On Android a link from another app can open the installed app; on iPhone nothing a web page does can make that happen. "Paste a plan link" is the workaround.
- **Android** has not been tried: not the install, not offline, nothing.
- **Data is not clean yet.** 21 recipes are held back for review; 28 ingredients have no price (so the estimate is partial); only one ingredient has a pack size; some method texts are in German; some recipes have odd amounts (coffee is 100 g per person); the 12 recipes marked `no_cooking` were chosen by guess from their ingredient lists. Prices go stale and carry no date.
- **Calculation is partly inferred.** Six of the eleven rules (R1, R2, R6, R7, R8 and R11) still say `inferred`. Quantities scale linearly with headcount. That is why step 15 exists.
- **English only.**

## Not built, on purpose

These were left out of the first version. Details are in [SOMEDAY.md](SOMEDAY.md) unless noted.

| Idea | What it would be |
|---|---|
| Non-linear scaling | Salt and spices that do not grow in step with the headcount |
| Pack picker | The same amount shown in different pack sizes |
| Partial attendance | A meal that only part of the guests come to |
| Leftovers and stock | What is already in the cupboard, what is left over; needs shared state |
| Stale prices | A "price last checked" date and a warning when it is old |
| Custom domain | Instead of `github.io` |
| Plus and minus on the headcount | Taken out so the number can be typed; the code is still there |
| Live sync between devices | Needs a server; plans are moved by hand |
| Importing a YAML plan | Plans move as JSON files; the YAML example can be converted by hand (`docs/examples/plan.example.json` is one) |
| Sound, shake to stir, buzzing | Parts of the motion plan that were not built or were dropped ([ANIMATIONS.md](ANIMATIONS.md)) |
| A filter chip for "no cooking" recipes | The flag exists; nothing filters by it |
| The reminder to keep a copy | Built, switched off (`REMINDER_SHOWN` in `src/lib/plan/backup.svelte.ts`) |

## Open questions

### Should shopping progress travel with a link or a file?

Today a **link** leaves the ticks out, because ticks are one person's progress and several people may shop at different stores. A **file** keeps them, because a file is a backup. When a plan is replaced by a link, the ticks on the device stay.

Options:

- **A. Links without ticks, files with them** (what exists). Predictable and safe, but a half-done list cannot be handed over.
- **B. A switch when sharing: "include what is bought".** Off by default, little work, but it needs a rule for what happens when the ticks meet the receiver's own.
- **C. Merge on import.** The ticks of both sides are kept. This suits two people shopping different stores, but an un-tick can never travel.
- **D. Live sync.** Needs a server, so it is out of reach for now.

**Recommendation:** keep A as the default and add B only if the group really splits the shopping. B only makes sense once a tick records an amount (next question).

### What happens to a tick when the plan changes?

Ticks are kept by ingredient only, not by amount. So:

- If a dish is added that needs more of something already ticked, the tick stays and nobody sees that more must be bought. This is the real problem: silent under-buying.
- If an ingredient leaves the plan, its tick stays in the plan's data and comes back if the ingredient does.
- If the amount needed drops, a tick is still right.

Options:

- **A. Do nothing** (what exists).
- **B. Remember the amount bought when ticking.** If the need grows past it, the row comes back showing only what is missing ("2.4 kg more"). If the need shrinks, nothing changes. Ticks of ingredients that left the plan are dropped. With pack sizes the comparison is in packs. Old ticks would count as covering today's need, so nothing breaks.
- **C. Untick whenever the amount changes.** Simple and safe, but annoying when the need shrinks.
- **D. Freeze the list while shopping.** Heavy, and a frozen list stops following the plan.

**Recommendation:** B, together with the A/B choices of the question above. It needs a small change to the plan format (`shopping.checked` becomes a list of ingredients with the amount bought) and a rule in the shopping view.

### Decided since the first decisions note

- **Things that are not cooked (jam at breakfast) stay recipes**, with a `no_cooking: true` flag. They need no method, the checks that weigh a recipe do not apply, and the Pantry counts them apart. A separate kind of thing would have meant a second picker, data format and set of rules for nothing.
- **The headcount is typed**, like the plan's name, not counted with buttons.
- **The cost on the plan is per person.** The total is no longer on the plan page; the stores on the Shopping screen show their own costs.
- **Fun** is a setting with two sets of animations, chosen idea by idea in `choices.ts`.

## Where it could go

In rough order of how soon it matters:

1. **Phone tests**, including Android. Everything in [DEPLOY.md](DEPLOY.md) that is still unticked.
2. **The clean slate (step 15).** Settle the inferred rules with the cooks, clean the recipes held back, add prices and pack sizes, translate the German methods, and re-check the `no_cooking` guesses.
3. **The shopping questions above**, once someone has shopped with the app.
4. **The contribution flow (step 16)**, so a cook who is not a programmer can fix a recipe through GitHub.
5. **The field test (step 17):** plan a past event from scratch on real phones, offline, and compare with the Excel.
6. After a real event: partial attendance, non-linear scaling, the pack picker, and prices with a date, in whichever order the cooks complain about.
