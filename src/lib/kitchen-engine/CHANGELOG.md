# Changelog

Every change to a rule, newest first. The rules version is in `config.ts` and is written into every saved plan.
How to change a rule safely is in [README.md](README.md).

## Rules version 0, 2026-10-25

The first implementation, of rules R2 to R11 (R1 is the data format, in `src/lib/data`). Rules marked `inferred` in [SPEC.md](SPEC.md) come from the old Excel
and are to be revisited in the clean-slate step of the roadmap.

Differences from the old Excel, each with a test:

1. Dishes that are not main dishes are no longer halved.
2. A dish no longer depends on its position in a list.
3. The selection numbers 0 to 3 are replaced by who the meal is for, the portion share and the appetite switch.
4. The shopping list shows whole packs next to the exact need.
5. An unknown store is an error (checked by the data validator).
6. Water and other things that are never bought are not a shop.
