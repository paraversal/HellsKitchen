# Kitchen engine: calculation spec

Rules version: **0 (draft)**. Nothing here is implemented yet. Rules R1 to R11 were reviewed one by one on 2026-10-25.

This is the one place where every calculation rule is written down. The first version is **inferred** from the old
Excel workbook (see [docs/EXCEL.md](../../../docs/EXCEL.md)) so that we can start with real data. When we have a working
product we revisit every `inferred` rule on a clean slate.

## Status labels

| Status | Meaning |
|---|---|
| `confirmed` | Someone who ran the old planning said so. |
| `inferred` | We worked it out from the old Excel. To be revisited. |
| `new` | Our own decision, not from the Excel. |

## Words used here

| Word | Meaning |
|---|---|
| Event | The whole thing being planned. Has a headcount and an organiser count. |
| Meal | One eating occasion in a plan, on a day, with its own number of people. |
| Dish | One recipe served in one meal. |
| Portion share | The share of a meal's guests who get this dish. |
| Appetite factor | A multiplier on a meal for when people eat more than usual. |
| Base unit | `g`, `ml` or `pcs`. All calculations use these. |

## The rules

### R1. A recipe is defined per 100 g of finished dish
`inferred` (confirmed by the previous maintainer for the meaning; the exact stored form is ours)

Each ingredient line says how much of the ingredient goes into 100 g of the cooked dish, in base units.
Cooking changes weight, so the lines need not add up to 100 g.

Evidence: the Excel stores `factor × (grams per person ÷ 100)` in kg or litres. We store grams or millilitres, which is the same number ×1000.

### R2. Planned amount per person
`inferred` (override: `new`, reviewed)

The grams of finished dish one guest is expected to eat when the dish is served. A recipe carries a **default**.
A dish in a meal can **override** it, for example hummus at 120 g in one brunch and 70 g in another.

Evidence: column "results in amount pp" on the Excel `Main` sheet, one number per dish. For brunch dishes the Excel treats it as per weekend; here it is per serving of the dish.

### R3. The people in a meal
`confirmed`, simplified on 2026-10-25

The event has two numbers: **Everyone** (the headcount) and **Organisers** (the people arriving Thursday, a good estimate of the number of helpers).
Every meal is **for Everyone** (the default) or **for Organisers**, and always uses 100 % of that number. There are no percentages and no typed numbers per meal.

If the event number changes, every meal that follows it changes with it.

This is about **who is at the meal**. It is not the portion share in R4, which is about **which of those people get a particular dish**.

Not covered: a meal that only part of the guests attend. See [docs/SOMEDAY.md](../../../docs/SOMEDAY.md).

Evidence: Excel `Main!B2` (people) and `Main!B3` (organisers arriving Thursday). No other headcount exists in the workbook. The 0.5 in its formulas is the main-dish share (R4).

### R4. Portion share
`confirmed` that main dishes were halved; the default rule is `new`, reviewed

The share of a meal's people who get a given dish.

- **Main dish:** 1 ÷ (number of main dishes in that meal). Two mains give ½ each, a single main gets 1.
- **Every other category:** 1.
- **Override:** a person can set any share on a dish.

Why not a fixed ½: the Excel halved every main, which under-cooks a meal that has only one main. Whether the old ½ meant "two mains per meal" is our best guess, not confirmed.

Evidence: the previous maintainer: "Main is /2 for all selections except 2, where it is (x/2) × hunger", and for everything else "recipe × planned amount × people in the event".
The Excel formulas also halve every other category by mistake. See "Known differences".

### R5. Appetite factor
`confirmed` that 1.3 was used on Friday main dishes and worked well; the switch is `new`, reviewed

The event has one **appetite factor** (default 1.0; the last event used 1.3, a gut-feeling value). Each meal has a switch for whether the factor applies.
Where the switch is on, the factor multiplies **main dishes only**. Sides, spreads, drinks and everything else in that meal stay at normal amounts.

Evidence: Excel `Main!B5` (hunger modifier), applied only to main dishes selected "2" (Friday). Confirmed as correct: only Friday main dishes.

### R6. Amount of one ingredient in one dish
`inferred`

```
amount = (grams of ingredient per 100 g of dish) × (planned grams per person ÷ 100)
         × people in the meal × portion share × appetite factor
```

The appetite factor is 1 for every dish that is not a main dish, or whose meal has the switch off.

Worked example 1, as the Excel intended and now calculated correctly:
alcohol-free punch, apple 10 g per 100 g, 250 g per person, meal of 200 people, share 1, appetite 1.
`10 × 2.5 × 200 × 1 × 1 = 5,000 g = 5 kg.` (The old shopping formula gave 2.5 kg.)

Worked example 2: main dish dry spaghetti, 100 g pasta per 100 g, 125 g per person, 200 people, share 1/2, appetite 1.3.
`100 × 1.25 × 200 × 0.5 × 1.3 = 16,250 g = 16.25 kg.`

### R7. Total need per ingredient
`inferred`

Add up R6 over every dish in every meal of the plan, per ingredient, in base units.

### R8. Purchase units
`inferred`

Show `g` as `kg` and `ml` as `L`. A piece stays a piece (`pcs`). Packs and jars are counts.

### R9. Grouping by store
`new` (the Excel does it by a code in the ingredient's column name)

Each ingredient has exactly one store. The shopping list is grouped by store. Only stores with something to buy appear.

Ingredients that are never bought, such as tap water, have the special store **None**. They count in recipes, but never appear in the shopping tabs or the cost.
(The Excel called this store "No Where" and still listed it.)

### R10. Pack counts
`new`, reviewed

Each ingredient has one default pack size. For every ingredient the list shows the number of packs, **always rounded up**, next to the exact need,
for example "36 cans, 14.4 L needed" or "8 × 10 kg, 74.6 kg needed". For pieces, packs and jars the pack size is 1, so the count is simply rounded up.

An ingredient with no pack size shows only the exact need and is flagged.

The Excel only rounded up to two decimals.

### R11. Cost estimate
`inferred`, reviewed

Cost of an ingredient = price per unit × the **exact need** (not the rounded pack count). The plan's estimate is the sum over ingredients that have a price.
Ingredients without a price are counted and flagged, not guessed. The estimate is therefore slightly lower than what the till says, because packs are rounded up.

Confidence figure (see docs/DECISIONS.md): share of the plan's food, by weight, that has a price. Litres count as kilograms. Items counted in pieces need an approximate weight, or are left out of the weighing.

Evidence: Excel `Ingredient ALL!F` (price per unit) × amount to buy.

## Known differences from the Excel

Each of these gets a test that checks the new behaviour.

1. **Non-main dishes are no longer halved.** The old shopping formulas halved every dish. Confirmed as a bug by the previous maintainer.
2. **No positions.** The old sheet attached a selection number to a row of a filtered list, so re-sorting could move it to the wrong recipe. Here a meal contains explicit dishes.
3. **Meals instead of a selection number.** The numbers 0 to 3 are replaced by what they stood for: which meal, whether it is for everyone or for organisers, which share, which appetite factor.
4. **Pack counts.** See R10.
5. **Stores are checked.** An unknown store code (the old `SM2`) is an error, not a silently missing list.
6. **Water is not a shop.** The old "No Where" store becomes the special store None.

## Open questions

1. What are the right planned amounts per person for the recipes whose values were tuned by hand? (R2, see docs/EXCEL.md)
2. Did the old halving of main dishes mean "two mains per meal"? Our default in R4 assumes so.

## Not covered yet

Stock ("have"), leftovers, non-linear scaling, several pack sizes per ingredient. See [docs/SOMEDAY.md](../../../docs/SOMEDAY.md).
