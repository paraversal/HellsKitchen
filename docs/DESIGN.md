# Design in code

How the design in `UI.fig` becomes code: the tokens, the shared components, and the rules for adding to them.

`UI.fig` is the design reference, opened with [OpenPencil](https://openpencil.dev). It shows how the app should look and feel. It is not a copy of the data:
the stores, recipes and counts in it are placeholders.

## The style sheet

Run `npm run dev` and open `/styleguide/` (on the live site: `<address>/styleguide/`). It shows every color, the type scale and every shared component, built from the real code.
Compare it with the "Design System" frame in `UI.fig`.

## Tokens

All styling reads from CSS variables, never from loose values. They live in `src/lib/styles/`:

| File | What | How it is made |
|---|---|---|
| `tokens.colors.css` | The 16 colors of the design (`--color-paper`, `--color-tomato`, ...) | **Generated** from the color variables in `UI.fig` |
| `tokens.css` | The font and its weights, the type sizes, the spacing, the corner radii, the line | Written by hand from what the design uses |

**After a color change in the design:** open `UI.fig` in OpenPencil, export the variables as CSS (the `design_to_tokens` tool, format `css`), and replace the whole `:root` block in `tokens.colors.css`.
Nothing else needs to change. A test (`tokens.test.ts`) fails if a component uses a token that does not exist, so a renamed color is caught straight away.

### Type

One font, Bricolage Grotesque, self-hosted so that it also works offline. Weights: 400 (`--weight-regular`), 600 (`--weight-medium`), 700 (`--weight-bold`), 800 (`--weight-heavy`).

| Token | Size | Used for |
|---|---|---|
| `--text-caption` | 12 px | Small labels, counts in tabs |
| `--text-note` | 13 px | Notes like "21.6 kg needed" |
| `--text-small` | 14 px | Times, chips |
| `--text-compact` | 15 px | Dish names in a meal |
| `--text-body` | 16 px | Normal text |
| `--text-strong` | 17 px | Recipe names in lists |
| `--text-heading` | 22 px | Section headings, day names |
| `--text-figure` | 24 px | The cost |
| `--text-title` | 30 px | Screen titles on a phone |
| `--text-title-large` | 34 px | The recipe title on a phone, the portions counter |
| `--text-display` | 38 px | Screen titles on a desktop |
| `--text-counter` | 44 px | The headcount |
| `--text-hero` | 48 px | The wordmark on the style sheet |

### Spacing and corners

Spacing `--space-1` to `--space-9` is 4, 8, 12, 16, 20, 24, 28, 40, 56 px. The design is hand-tuned and also uses in-between values inside components (14 px between a button and its label, for example). Where it does, the component uses the design's exact value.
Corners: `--radius-s` 12, `--radius-m` 16, `--radius-l` 22, `--radius-xl` 28, `--radius-pill`.

## Components

In `src/lib/components/`, one small Svelte file each. They take plain props, contain no data and no logic beyond their own look.

| Component | What it is |
|---|---|
| `Button` | The main action (red) or a secondary one (outlined). `block` stretches it over the full width. |
| `IconButton` | A round button with only an icon. It needs a `label` for screen readers. |
| `Stepper` | A number with minus and plus: the headcount, the portions. |
| `Chip` | A filter. The active one is dark. |
| `Badge` | A small label, like a recipe's category. |
| `Check` | The round tick box of the shopping list. |
| `StoreTabs` | The tabs of the shopping list, one per store, with the number of items left. |
| `DayLabel` | The day name on a strip of mustard tape, with the date. |
| `MealRow` | One meal: kind, time, people, dishes. `compact` is the narrow version for desktop columns. |
| `AddRow` | The dashed row that adds something. |
| `Plate` | A flat plate illustration. The look comes from the recipe's id, so no extra data is needed. |
| `CostBlock` | The estimated cost with the share of the food that has a price. |
| `NoPricePill` | How many ingredients of a store have no price. |
| `ShopRow` | One line of the shopping list. |
| `SearchField` | The search box, with its own clear button. |
| `RecipeRow` | One recipe in the list: plate, name, kind, and the plus that adds it to the plan. |
| `Sheet` | A panel over the screen: it slides up from the bottom on a phone and sits in the middle on a desktop. The browser's own dialog, so Escape closes it. |
| `Field` | A labelled box for a short value. It hands the change over when the person is done typing, not on every key. |
| `Switch` | An on/off switch with its text. |
| `Toasts` | Short messages at the bottom, like "Added to Saturday lunch". |
| `EmptyNote` | What a screen says when there is nothing to show yet. |
| `TabBar` | The bar at the bottom of a phone screen, with the three places. |
| `Sidebar` | The red bar on the left of a desktop screen. |
| `meal-types.ts` | How each kind of meal looks: name, icon, tint. |

Not built yet, because they belong to later screens: the QR code and the printable sheets (roadmap step 14).

The screens switch between the phone and the desktop layout at **900 px** wide.

## Adding or changing a component

1. Look at the design in `UI.fig` first, and use its values.
2. Style only with tokens (`var(--color-ink)`, `var(--text-body)`, ...). If a value is missing, add it to `tokens.css` and to the table above.
3. Give every icon-only control a `label`, so it can be read aloud.
4. Add it to the style sheet page (`src/routes/styleguide/+page.svelte`) so it can be compared with the design.
5. Run `npm run check` and `npm test`.
