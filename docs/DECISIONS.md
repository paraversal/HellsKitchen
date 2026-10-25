# Decisions

What we have decided, and what is still open.

## Decided

| Topic | Decision |
|---|---|
| Diets | Everything is vegan, every time. No diet field, no diet split. One headcount per meal. |
| Language | English only, including data field names. |
| Events | One plan is always one event. |
| Meal people | Every meal is for Everyone (default) or for Organisers, always at 100 %. No percentages, no typed numbers. This is also all the Excel ever did. |
| Plan shape | Meal-based, as in the design: days, meals, a headcount per meal. The old Excel's selection numbers 0 to 3 become properties of a meal and a dish: which people, which portion share, which appetite factor. |
| Data formats | Written in [DATA.md](DATA.md). A recipe's id is its file name. Recipes list ingredients as quantities with units (`10 g`) per 100 g of finished dish. Stores and recipe categories are the ones the Excel used: stores supermarket, asian-market, online, drugstore, none; categories main, brunch, helper-snack, drink, misc. |
| Getting started | We infer the calculation from the old Excel and import its recipes so there is real data to work with. When there is a working product we revisit every inferred rule and clean the data on a clean slate. |
| Kitchen engine | All calculation lives in `src/lib/kitchen-engine/`, with the rules written in its [SPEC.md](../src/lib/kitchen-engine/SPEC.md). Each rule is marked confirmed, inferred or new. |
| Planning | One person plans. Updated plans are shared as links in a group chat or similar. No live co-editing. |
| Stores | Every ingredient belongs to exactly one store, where it is bought. The stores in a plan are derived from its ingredients: only stores with something to buy show up as tabs. |
| Scaling | All quantities scale linearly with headcount. No per-line exceptions. Non-linear scaling is parked in [SOMEDAY.md](SOMEDAY.md). |
| Packs | The shopping list shows pack counts next to the exact need, as in the design (for example "36 cans", "14.4 L needed"). Each ingredient has one default pack size. Choosing between pack sizes is parked in [SOMEDAY.md](SOMEDAY.md). |
| Leftovers and stock | Out of scope for the first version. Parked in [SOMEDAY.md](SOMEDAY.md). |
| Prices | Stored in the public data, on the ingredient. We ignore that prices go stale for now. |
| Maintainers | App data maintainers are the repository maintainers: anyone with permission to merge pull requests. GitHub role details still to be checked. |
| Hosting | `github.io` for now. A custom domain may come later. |

### Planning rules inherited from the Excel

Confirmed by the previous maintainer; details and open points in [EXCEL.md](EXCEL.md).

- A recipe is defined per 100 g of finished dish. Each dish has a planned amount in grams per person.
- Main dishes use half the headcount each; Friday main dishes use half the headcount times a hunger modifier (1.3, a gut-feeling value).
- Brunch, drinks and misc dishes are simply "cooked" and use the full headcount, whenever they are cooked.
- Helper snacks and organiser dishes use the organiser count (the Thursday arrivals, a good estimate of the number of helpers).
- The old sheet's formulas wrongly halved non-main dishes. The new rules must not.

### Cost estimate and the confidence figure

The estimate has to work with incomplete data. A few missing prices should not switch the estimate off, and
many missing prices should not pass as a real estimate.

The design shows this in three places: the estimated cost of the whole plan, a subtotal per store, and a small
marker on every ingredient that has no price.

Proposed rule (to be settled in roadmap step 8):

- Show the estimate together with the share of the plan's food that is covered by a price. Missing 100 g
  of basil costs almost nothing; missing 50 kg of potatoes costs a lot.
- Quantity is compared by weight, with litres counted as kilograms. Items counted in pieces need an
  approximate weight on the ingredient, or they are left out of the weighing.
- Example: "Estimated cost 4,200 EUR, 92 % of food priced".

### Data licence

Any permissive licence is fine. The options in plain words:

- **CC0:** no conditions at all. Anyone may copy, change and sell the data, with no credit needed.
- **CC BY 4.0:** anyone may do anything with it, but must credit us. Permissive, with one small condition.
- **CC BY-SA 4.0:** like CC BY, but changed versions must be shared under the same licence.

Suggestion: **CC BY 4.0** for the recipe data and **MIT** for the code. Confirm or change.

## Still open

0. **Design catch-up.** Not needed: `UI.fig` is a design reference, not a copy of the data. Its placeholder stores, categories and meal counts may stay as they are.

1. **Excel.** Analysed in [EXCEL.md](EXCEL.md). Open: whether main dishes for organisers are halved, why mains are halved, which tuned recipes to trust, and whether the plan needs meals.
2. **Default pack sizes.** Where do they come from? Presumably the Excel or the cooks, and each ingredient gets one.
3. **Licence.** Confirm CC BY 4.0 and MIT, or choose another.
