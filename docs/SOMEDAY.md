# Someday

Ideas we want to keep but have deliberately left out of the first version. Nothing here is promised.
When one of these becomes real, move it into the roadmap.

## Non-linear scaling

Today every quantity scales linearly with headcount. In practice, cooking for 200 is not 20 times cooking
for 10: salt, spices and oil often need less than a straight multiple.

Likely shape: an optional per-line setting in a recipe, starting with "fixed amount" (does not scale), then
perhaps a scaling curve. Collect real corrections from the cooks after the first event before adding any of it.

## Pack picker

The shopping list shows pack counts from one default pack size per ingredient (for example "36 cans" of coconut
milk, which is only right if a can is 400 ml). A hybrid would show the total quantity (14.4 L) and let you tap it to see
the same amount in other pack sizes (36 × 400 ml, 18 × 800 ml). That needs several pack sizes per ingredient,
and possibly different ones per shop.

## Partial attendance

Every meal is for all guests or all organisers. A meal that only part of the guests attend (for example Friday dinner before everyone has arrived) cannot be described. Likely shape: an optional percentage or typed number on a meal.

## Leftovers, stock and a warehouse

Track what is already in stock and what is left over after an event, so the next shopping list buys less.
Ideally a proper warehousing view. This needs shared state between devices, which the first version avoids on purpose.

## Stale prices

Prices live in the public data and go out of date. Later: a "price last checked" date per ingredient, and a
warning when a price is old.

## Custom domain

The app starts on a `github.io` address. A custom domain costs money every year and is one more thing to renew.
