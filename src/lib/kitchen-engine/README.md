# Kitchen engine

The part of the app that turns a plan into amounts: how much of each ingredient to buy, where, and what it costs.
It is the part where mistakes cost real money, so it is built to be read, checked and changed by people who did not write it.

Read [SPEC.md](SPEC.md) first. It is the single place where every calculation rule is written down in plain language.
The code only implements what the spec says.

## Principles

1. **Spec first.** A rule is written in `SPEC.md` before it is coded. Each rule has an id (R1, R2, ...), a status, and the evidence for it.
2. **Pure functions.** Data in, numbers out. No screens, no storage, no clock, no randomness, no network. A test fails if anything in this folder imports from outside it.
3. **One rule, one small file.** A new person can read a rule's file in a minute. `calculate.ts` only chains the rules together, in the order the spec lists them.
4. **Numbers live in one place.** Defaults such as "main dishes serve half the guests" are named values in one config file, not constants scattered through the code.
5. **Tests carry the rule id.** A test named `R6: ...` proves rule R6. If a rule changes, the tests with its id change with it, and nothing else.
6. **Worked examples are the tests.** The examples printed in the spec are also run as tests (`examples/index.ts`), so the documentation cannot drift away from the code.
7. **Honest status.** Every rule says whether it is `confirmed` (someone who knows said so), `inferred` (we worked it out from the old Excel and will revisit) or `new` (our own decision).
8. **Plans remember the rules.** A saved plan stores the rules version it was calculated with, so changing a rule never silently changes an old plan.

## Layout

```
kitchen-engine/
  README.md          this file
  SPEC.md            every rule, numbered, with status and evidence
  CHANGELOG.md       every change to a rule, with the rules version
  config.ts          the named defaults and the rules version
  types.ts           the shapes of data, plan and result
  rules/             one small file per rule: portion, people, share, appetite, amount, totals, units, stores, packs, cost
  calculate.ts       chains the rules: plan + data in, shopping list + cost out
  examples/          the worked examples of the spec, as data
  fixtures.ts        a tiny made-up data set for the engine's own tests
  *.test.ts          tests, named by rule id
```

Tests that need the real recipes or the old Excel live outside this folder, in `src/lib/integration/`, because the engine may not import from outside.

## How the spec and the code are kept together

`spec-sync.test.ts` fails when:

- a rule is in `SPEC.md` but no code names it, or the other way round (every rule file starts with a header like `// R6. ... See SPEC.md.`);
- a rule has no test with its id in the title (`describe('R6: ...')`);
- a worked example is in the code but has no `<!-- example: ID -->` marker in the spec, or the spec prints a different number than the code produces;
- a known difference from the Excel has no test titled `Known difference N`.

## How to change a rule safely

1. Change the rule in `SPEC.md`: text, status and evidence. If it differs from the old Excel, add it to "Known differences from the Excel".
2. Add or change the worked example that shows it.
3. Change the tests carrying that rule's id, and watch them fail.
4. Change the code until they pass.
5. Add a line to `CHANGELOG.md` and raise the rules version.

## What is deliberately not here

- Reading Excel or YAML. A separate import script does that, and it is allowed to be messy and temporary.
- Any knowledge of screens or browsers.
- Prices going stale, stock, supplier packs beyond one default pack size. See `docs/SOMEDAY.md`.
