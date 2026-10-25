# Data formats

What the data files look like, field by field, in plain words. Written for people who add and fix recipes, not only for programmers.

Status: the first data came from the old Excel sheet by an import script, see [scripts/import-excel](../scripts/import-excel/README.md).
The validator enforces everything listed under "What gets checked".

## Where things live

```
data/
  stores.yaml           the shops
  ingredients.yaml      every ingredient
  recipes/              one file per recipe, named after the recipe: tzatziki.yaml
docs/examples/
  plan.example.yaml     an example plan
```

Everything is YAML: plain text, indented with two spaces, one `key: value` per line. A `#` starts a comment.

The **id** of a recipe is its file name without `.yaml`. The id of an ingredient or store is its key in the file.
Ids use lower case letters, digits and hyphens. An id never changes once it is in use, because plans refer to it.

## Quantities

Amounts are written with their unit, like `10 g`, `0.5 pack`. Units: `g`, `ml`, `pcs`, `pack`, `jar`.
Kilograms and litres are also allowed (`2 kg`, `1.5 l`) and are converted. The unit must fit the ingredient: an ingredient counted in `g` takes `g` or `kg`, never `ml`.

## Stores (`stores.yaml`)

```yaml
supermarket: Supermarket
asian-market: Asian market
none: Not bought
```

The store `none` is for things that are never bought, like tap water. They count in recipes but never appear in the shopping list or the cost.

## Ingredients (`ingredients.yaml`)

```yaml
red-lentils:
  name: Red lentils (dry)
  unit: g
  store: supermarket
  price: 2.5
  pack: 25 kg
```

| Field | Required | Meaning |
|---|---|---|
| name | yes | What people see. |
| unit | yes | How recipes count it: `g`, `ml`, `pcs`, `pack` or `jar`. |
| store | yes | Exactly one store from `stores.yaml`. |
| price | no | Euros per kilogram (unit `g`), per litre (unit `ml`), or per piece, pack or jar. |
| pack | no | The usual pack size, like `25 kg` or `400 ml`. For pieces, packs and jars the pack size is 1. Without it the shopping list shows only the exact need. |

## Recipes (`recipes/<id>.yaml`)

```yaml
name: Tzatziki
category: brunch
portion: 100 g
source: Old Excel sheet
per_100g:
  yoghurt-natur-soy: 58.8235 g
  cucumber: 41.1765 g
  lemon-lime-juice: 5.8824 ml
  garlic: 1.7647 g
  salt: 0.3529 g
  pepper: 0.1176 g
method: |
  (1) Grate the unpeeled cucumber. Sprinkle with salt...
  (2) Squeeze liquid out
```

| Field | Required | Meaning |
|---|---|---|
| name | yes | What people see. |
| category | yes | `main`, `brunch`, `helper-snack`, `drink` or `misc`. Main dishes are shared out between the main dishes of a meal (see the kitchen engine). |
| portion | yes | How much of the finished dish one guest is expected to eat, in grams. For drinks, 1 ml counts as 1 g. A meal can override it for one dish. |
| per_100g | yes | The ingredients: how much of each goes into **100 g of the finished dish**. Each key is an ingredient id. |
| method | no | The steps, as free text. |
| source | no | Where the recipe came from. Do not copy recipes from cookbooks or websites. |
| status | no | `needs-review` means the numbers look wrong. Such recipes are kept out of the app until fixed. |
| review_note | no | Why it needs review. |

How to read `per_100g`: cook the dish, weigh it, and work out how much of each ingredient was in every 100 g. The amounts do not have to add up to 100 g, because cooking changes weight.
Water evaporates, rice and couscous take it up. A recipe whose ingredients weigh several times more than the finished dish is almost certainly a mistake.

### Adding a recipe

1. Copy a similar file in `data/recipes/` and give the copy a new name (lower case, hyphens, ends in `.yaml`).
2. Change `name`, `category`, `portion` and the lines under `per_100g`.
3. If an ingredient does not exist yet, add it to `ingredients.yaml` first, with its unit and store.
4. Open a pull request. The checks will tell you what is wrong, in plain language.

## Plans

A plan describes one event, meal by meal. It is saved on the device and shared as a link, so it is not part of the repository.
A complete example with comments is in [examples/plan.example.yaml](examples/plan.example.yaml).

| Field | Meaning |
|---|---|
| format | The version of the plan format. |
| rules_version | The version of the kitchen engine rules the plan was calculated with. |
| name | The event's name. |
| event.everyone | The headcount. |
| event.organisers | The organiser count (the Thursday arrivals). |
| event.appetite_factor | A multiplier for main dishes in meals that switch it on. Default 1. |
| days[].date | A date. |
| days[].meals[].type | `breakfast`, `lunch`, `coffee`, `dinner` or `snack`. |
| days[].meals[].time | The time, as text. |
| days[].meals[].for | `everyone` (the default) or `organisers`. The meal always uses 100 % of that event number. |
| days[].meals[].appetite | `true` to apply the appetite factor to this meal's main dishes. |
| days[].meals[].dishes[].recipe | A recipe id. |
| days[].meals[].dishes[].share | Optional. The share of the meal's people who get this dish. Overrides the default. |
| days[].meals[].dishes[].portion | Optional. Grams per person for this dish. Overrides the recipe's. |
| shopping.checked | Ingredient ids already ticked off. |

## What gets checked

Run `npm run validate` to check everything in `data/` and the example plans. It runs on every pull request too, and a pull request with errors cannot be merged.
Every message says which file and which line of the recipe is wrong, and how to fix it. Where it can, it suggests the likely spelling ("Did you mean ...?").

**Errors** (these stop a merge):

| Code | What it catches |
|---|---|
| `yaml-syntax` | A file that is not valid YAML, including the same name used twice. |
| `bad-id` | An id that is not lower case letters, digits and single hyphens. |
| `missing-field`, `unknown-field`, `wrong-type`, `not-allowed` | A required field is missing, a field name is mistyped, a value has the wrong kind (text where a number belongs), or a value is not one of the allowed ones (category, unit, meal type). |
| `unknown-store`, `missing-none-store` | An ingredient names a store that does not exist, or the special store `none` is missing. |
| `unknown-ingredient` | A recipe line names an ingredient that does not exist. |
| `bad-quantity` | An amount that is not a number with a unit, uses a comma, or is zero. |
| `unit-mismatch` | An amount in the wrong kind of unit for its ingredient, such as litres of flour. |
| `portion-unit`, `pack-not-allowed` | A portion that is not in grams, or a pack size on something counted in pieces, packs or jars. |
| `no-ingredients` | A recipe with no ingredients. |
| `unknown-recipe`, `bad-date` | In a plan: a recipe that does not exist, or a date that is not real. |

**Warnings** (shown, but do not stop a merge): `heavy-recipe` (ingredients weigh more than three times the finished dish), `light-recipe` (less than half),
`unused-ingredient`, `no-price`, `no-method`, `review-without-note`, `note-without-status`, `price-on-unbought`, `duplicate-dish`, `empty-meal`, `plan-uses-needs-review`.

**Notes**: `needs-review` (a recipe marked as needing a second look, with its reason) and `no-pack` (an ingredient without a pack size).

Warnings and notes are grouped and shortened. Add `--all` to list every one: `npm run validate -- --all`.

## Plans on the device

The app keeps its plans in the browser (IndexedDB), as one "library": the plans, and which one is open. Each plan is in the format above, so what is saved is also what can be exported and shared later.

```
{ version: 1, current: "plan-1", plans: { "plan-1": { id, updatedAt, plan: { ...a plan... } } } }
```

One rule above all: **saved data is never overwritten unless it has been read successfully first.** After a restart without a connection, a phone can report "nothing saved" when there is something.
So the app also keeps a small mark that this device has saved before. If the library cannot be read, or looks empty although the mark is there, the app says so and offers "Try again". It starts a new plan only when the person confirms it.
A library in a form this version does not know is left untouched.
