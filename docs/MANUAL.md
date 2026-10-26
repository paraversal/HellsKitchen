# Hell's Kitchen: user manual

For the people who plan the food of the event. No technical knowledge needed. What the app can and cannot do today is in the [state of the app](STATE.md).

## What it is for

You tell the app how many people come and which dishes you want for which meals. It works out how much of every ingredient to buy, sorted by store, and what that will roughly cost. It replaces the old Excel sheet.

Two things to know from the start:

- **Your plan lives on your device.** There is no account and no server. Nobody else can see your plan unless you send it to them, and it does not appear on your other devices by itself.
- **It works without a connection**, after the first visit.

## Getting it onto your phone

1. Open the address of the app in your phone's browser (Safari on an iPhone, Chrome on Android).
2. Add it to your home screen: on an iPhone, Share, then **Add to Home Screen**; on Android, the menu, then **Install app**.
3. Open it from the home screen once while you have a connection. From then on it also opens in airplane mode.

On a computer, just open the address. A red bar on the left shows the places of the app; on a phone they are at the bottom.

## The four places

| Place | What it is |
|---|---|
| **Plan** | Your event: days, meals, dishes, headcount, cost per person |
| **Recipes** | All the recipes, to browse, try out and add to the plan |
| **Shopping** | What to buy, store by store, to tick off |
| **Meta** | Settings and information about the app and its data |

## Planning an event

### The first start

The app starts with one empty plan, named "New event", with a single day (today) and a headcount of 100.

### Name and headcount

- **Press the name** at the top to rename the plan. Press Enter or tap away to keep it; Escape drops the change.
- **Press the number** under it to type the headcount of the whole event.
- The sliders button opens the **event settings**: name, everyone, **organisers** (the people who arrive early, for meals only they eat), and the **appetite factor** (see below). The same sheet lists the plans on your device.

### Days

- **Add day** at the bottom adds the next day.
- The three dots next to a day open it: change its date, or delete it with all its meals (the app asks first).

### Meals

- **Add meal** under a day opens the new meal. Choose the kind (breakfast, lunch, coffee & cake, dinner, snack) and optionally a time.
- **For**: *Everyone* or *Organisers*. A meal is always for all of the people you pick. There are no percentages.
- **Hungrier than usual**: switch it on for a meal where people eat more (the old sheet used this for the Friday dinner). The main dishes of that meal are multiplied by the appetite factor from the event settings.
- Press a meal in the plan to open it again.
- **Delete this meal** is at the bottom of the meal; the app asks first.

### Dishes

- Inside a meal, **Add dish** lists the recipes. Search by name or by ingredient, filter by kind, and press a recipe to add or remove it. Several can be added in a row.
- Or add from **Recipes**: the plus next to a recipe asks which meal gets it, or lets you start a new meal on a day.
- The **sliders button** next to a dish in a meal adjusts it:
  - **Grams per person**: how much of this dish one guest gets. Empty means the recipe's usual amount.
  - **Share of the guests**: the share of the people who get this dish. Empty means *automatic*: main dishes split the meal between them (two main dishes: half the guests each), everything else is for everyone.
- The cross removes the dish.

### What the cost means

Under the headcount you see the **estimated cost per person** and how much of the food has a price ("90 % of food priced"). Ingredients without a price are counted as free, so the estimate is a lower bound when that bar is not full.

### Several plans

The event settings list the plans on your device. Press one to open it, or **New plan** to start another. A plan can be deleted when it is not the only one.

## Recipes

- The list is sorted by letter. The search finds recipe names and ingredients; the chips narrow it to a kind of dish.
- Press a recipe to read it. The **portions** control scales its ingredients, just for trying it out: it does not use or change your plan.
- **No cooking** on a recipe means it is put out as it is (jam, fruit). It has no method.
- **Add to plan** puts the recipe in a meal.

## Shopping

- One tab per store that has something to buy. The number on the tab is what is left to buy there; a check means the store is done.
- Every line shows the amount to buy. Where the ingredient has a known pack size you also see the number of packs, with the exact need under it.
- **Tick** an item when it is in the basket. The ticks are saved with the plan, so you can close the app and come back. A bar shows how far you are in the store.
- With **Fun** on, a ticked item flies into the basket of the Shopping tab and moves under **Bought**, at the bottom of the list. Press *Bought* to see those items; tick one again to bring it back.
- A store shows its **estimated cost**, and how many of its items have no price.
- The printer button prints the list of the open store (see *Printing*).

If you change the plan after ticking something, the ticks stay as they were. So after changing the plan, look through items you already ticked.

## Sharing a plan and keeping a copy

The share button on the Plan screen opens everything that takes the plan out of the app.

| What | Use it for |
|---|---|
| **Send the link** / **Copy the link** | Sending the plan to someone in a chat. The whole plan is inside the link; nothing is stored on a server. |
| **The QR code** | Moving the plan from your computer to a phone: scan it with the camera |
| **Save the plan as a file** | A copy to keep, with your shopping ticks. Do this before big changes and before the event. |
| **Open a plan file** | Bringing a saved copy back, or opening a plan someone sent as a file |
| **Paste a plan link** | When a link opened in the browser instead of the app: copy the link, open the app, and paste it here |

**When a plan arrives** (by link, QR code, file or paste), the app shows it next to the plan on your device, with when each was last changed. You choose:

- **Keep both**: the new plan is added next to yours and opened.
- **Replace the plan on this device**: yours is overwritten. A link leaves your shopping ticks in place; a file brings its own.
- **Cancel**: nothing happens.

A link does not carry the shopping ticks: they belong to whoever is shopping.

**Plans do not sync.** If you change the plan after sending it, send it again. Whoever receives it chooses whether to keep both or replace.

## Printing

Open the share sheet and choose **Print the shopping list** (every store on its own page) or **Print the recipe sheets** (one page for every dish of the plan, scaled to its meal: how many people, which share, how many grams in all, the ingredients and the method).

- The page has a **Print** button, and a **PDF** button.
- On an **iPhone with the app on the home screen** there is no print window, so you only see **PDF**: it makes a PDF and opens the share sheet, from where you can print it, save it to Files, or send it.
- On a computer, the print window can also save as PDF.

## Settings and the Meta tab

- **Fun** turns the playful animations and little surprises on or off. With it off the app still moves a little, but calmly. If your device is set to reduce motion, the app is always calm.
- **The data** shows the health of the recipes and ingredients behind the app: how many recipes are waiting for review (they are not shown in the app until fixed), which ingredients have no price, which recipes have no method, which ingredients no recipe uses, and what each store has.
- **The app** shows the version, and the number of plans on your device.

## How the numbers are calculated

For one dish in one meal:

> grams per person × people in the meal × share of the guests × hunger factor

The hunger factor only applies to main dishes of a meal switched to *hungrier than usual*. The amounts of all dishes are added up per ingredient; the shopping list shows each ingredient in the store where it is bought, with whole packs where a pack size is known. Everything scales in a straight line with the headcount. The precise rules, with examples, are in the [kitchen engine spec](../src/lib/kitchen-engine/SPEC.md).

## When something is wrong

| What you see | What to do |
|---|---|
| **"Your plan is not available yet"** | The phone could not read its storage. This can happen right after a restart without a connection. Press *Try again* once you are online. The app does not make a new plan over yours until you say so. |
| A plan seems gone | Open the app from the same browser or home-screen icon you used before. Plans live in one browser on one device. Restore from a saved file if you have one. |
| The app shows old things | Open it once with a connection and close it; it updates itself in the background. |
| A shopping ingredient has no price | It is not in the data yet. The estimate is then partial; the Meta tab lists them. |
| A link says it cannot be read | It was probably cut off when it was sent. Ask for it again, or use a file. |
| Print does nothing | On an iPhone from the home screen use the **PDF** button. |

**Keep a copy.** Plans exist in one place only. Save a file after the main planning work and before the event, and keep it somewhere that is not the phone.

## Words used in the app

- **Plan**: one event, with its headcount, days and meals.
- **Meal**: breakfast, lunch, coffee & cake, dinner or snack on a day.
- **Dish**: a recipe in a meal.
- **Recipe**: a dish as the app knows it, with its ingredients and method.
- **Everyone / Organisers**: the two headcounts; a meal is for one of them.
- **Share**: the part of a meal's guests who get a dish.
- **Appetite factor**: how much more the main dishes of a hungrier meal are.
- **Store**: where an ingredient is bought. Each ingredient belongs to exactly one.
