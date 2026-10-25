# The current Excel sheet

Roadmap step 2. How last year's planning workbook (`prev.xlsm`) works, what is wrong with it, and what a clean
version has to hold. Based on reading the workbook (macros read as text, nothing run), an independent
recalculation, and answers from the previous maintainer.

The file is in a test state (13 brunch dishes selected, cost shown as 232 EUR). It is not a real past plan.

## What is in it

| Sheet | What it is |
|---|---|
| `Main` | Planning screen: headcount (200), organisers arriving Thursday (32), hunger modifier (1.3), and five lists of dishes with grams per person and a selection number. |
| `Recepies` | The recipe matrix: one row per recipe, one column per ingredient. The sheet that matters. |
| `Ingredient ALL` | Per ingredient: unit, store, price, "have", needed, to buy. Built from the matrix. |
| `Ingredient BUY SM / AM / ONL / DM / NO` | Shopping lists per store, filtered from `Ingredient ALL`. |
| `R_...` | One static sheet per selected recipe with scaled amounts, made by a macro. Snapshots, not live. |
| Hidden `... old`, `... bak` | Earlier versions. |

There are about 63 recipes (27 brunch, 14 main, 15 misc, 4 helper snacks, 3 drinks) and 189 ingredients.
Every ingredient header is `Name|UNIT|STORE`, for example `Apple|KG|SM`. Units: KG, L, PCS, PCK, Jar.
Stores: SM supermarket, AS Asian market, ONL online, DM drugstore, NW "nowhere" (water).

## How a recipe is stored

A dish is defined **per 100 g of finished (cooked) dish**. Each cell holds how much of the ingredient goes into those
100 g: kilograms for KG, litres for L, a count for PCS. The sheet turns it into an amount per person:

```
amount per person = cell value × (planned grams per person ÷ 100)
```

The planned grams per person is chosen per dish on the `Main` sheet (for example 500 g for a main, 100 g for a
spread). For brunch dishes it is per weekend.

Example, alcohol-free punch, 250 ml per person: apple 0.01 kg per 100 g gives 25 g apple per person.

The ingredients of a recipe do **not** need to add up to 100 g, and they usually do not. Cooking changes weight:
water evaporates, rice and couscous absorb water, and some values were tuned by hand. The punch adds up to 120 g
(132 g with the lemon, which is a count and is calculated differently).

## How the plan works (confirmed by the previous maintainer)

Each dish gets a selection number on the `Main` sheet:

| Dish type | Allowed numbers | Meaning |
|---|---|---|
| Main | 0, 1, 2, 3 | 0 not cooked. 1 cooked on Saturday. 2 cooked on Friday, with the hunger modifier. 3 cooked for the organisers (Thursday arrival). |
| Brunch, drinks, misc | 0, 1 | 0 not cooked. 1 cooked. It does not say when. Some spreads for Saturday morning are cooked on Friday. |
| Helper snacks | 0, 3 | 3 means the multiplier is the organiser count, which is a good estimate of the number of helpers. |

Intended amounts:

- **Main:** half the headcount for each main dish, and for Friday dishes half the headcount times the hunger modifier.
- **Everything else that is cooked:** the full headcount.
- **Organiser dishes and helper snacks:** the organiser count.
- **Hunger modifier (1.3):** a gut-feeling value that worked well last time. Nobody recorded whether food was left over.

In every case: recipe × planned grams per person × the number of people.

## How totals are computed

For each ingredient, the sheet sums the per-person amounts over the dishes in each selection group, multiplies by
the group's number of people, and adds the groups. Then needed minus "have" gives the amount to buy, filtered by store
and rounded up to two decimals. Prices multiply the amount to buy.

I recalculated all 189 ingredient totals from the recipe cells and the selections: they match the workbook exactly.
The arithmetic is not the problem.

## What is wrong

1. **Known bug, still in this copy: non-main dishes are halved.** The shopping formulas apply the 50 % rule to every
   dish type. The previous maintainer confirms this caused wrong amounts at the last event (baba ganoush and similar),
   and does not know whether the master template was fixed. The macros that create the recipe sheets and PDFs use the
   correct rule, so the two disagree: pancakes need 8.33 kg flour on the recipe sheet and 4.17 kg on the shopping list.
2. **About 19 recipes have impossible amounts.** The raw ingredients weigh 3 to 150 times the finished dish, which
   cooking cannot explain: Falafel, Hazelnut-spread, chocolate Tahin, Gulasch, Vegan aioli, Chilli, Coleslaw, cookies,
   chocolate cake, Ramen, Vegan Majo, Porridge, Kimchi, Apple-Onion-Lard, Fried vegetable, Lemon Curd, Brownies,
   coconut-almond and Curry. Chilli asks for 1.75 kg of kidney beans per person. Probable causes: ingredient units
   that were changed without converting the numbers (Lebanese bread went from pieces to kg), garlic cloves in a kg
   column, and older recipes that look entered per batch rather than per 100 g. This is my inference. All of them are
   deselected in this file. Five more (weight 1.6 to 2.5 times the dish) are plausible as cooking losses.
3. **Selections are tied to positions.** The numbers are typed next to a filtered list. Adding, renaming or
   re-sorting a recipe can move a number onto a different recipe.
4. **Small things.** One ingredient has store `SM2` and appears on no list. Three duplicate "Misc Placehodler" rows.
   29 of 189 ingredients are unused and 33 have no price. 144 of 249 cell comments hold old values. The `R_` sheets
   are static. The workbook password is stored in plain text in the macro source.

## What a clean version has to hold

- **Ingredient:** name, unit, exactly one store, price (optional), default pack size.
- **Recipe:** name, category, planned grams per person, the ingredient lines (amount per 100 g of finished dish), steps, source.
- **Plan:** headcount, organiser count, hunger modifier, and for each dish whether it is cooked and for which group.
- **Rules in one place**, written down and tested: the multipliers above.
- **Checks** that would have caught the problems: a recipe whose ingredients weigh implausibly more or less than the finished dish; every ingredient has a known store; units that fit.

## Open questions

1. **Main dishes marked 3 (for organisers):** halved or not? The chat says the main rule is "half for all selections except
   Friday", but the formulas use the full organiser count.
2. **Why half for main dishes?** Presumably two mains per meal, each for half the people. Please confirm.
3. **The tuned values.** The previous maintainer said some values were adjusted because they do not scale cleanly, and offered to check.
   Which recipes can we trust? Which of the 19 flagged ones are still cooked?
4. **Meals and days.** The Excel has no meals: only "which dishes, with which multiplier". The UI design is built around
   days, meals and a headcount per meal. Does the plan need meals, or is "which dishes and for which group" enough?
5. **A real past plan** (selections plus the real shopping list) to use as a test case.
