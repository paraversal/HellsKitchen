# Excel import

A one-off script that turned the old planning workbook into our YAML data files. It is temporary: once the data has been cleaned by hand it can be deleted. It is kept so that anyone can see exactly what was guessed.

## What it does

- Reads the `Recepies` sheet (one row per recipe, one column per ingredient) and the price column of `Ingredient ALL`.
- Writes `data/stores.yaml`, `data/ingredients.yaml` and `data/recipes/<id>.yaml`.
- Writes [REPORT.md](REPORT.md) listing every guess and every recipe that needs a second look.
- Only reads the workbook. It never runs the macros and never lets Excel calculate anything.

## How to run it

You need Python 3 and the two packages in `requirements.txt`.

```
python -m venv .venv
.venv/bin/pip install -r scripts/import-excel/requirements.txt
.venv/bin/python scripts/import-excel/import_excel.py PATH/TO/prev.xlsm
.venv/bin/python scripts/import-excel/verify_import.py PATH/TO/prev.xlsm
```

The workbook is not part of the repository. It contains personal names in cell comments and a password in its macros.

The second command recomputes every ingredient amount from the YAML and compares it with the number Excel itself calculated. Last run: 472 cells checked, 0 differences.

## What the importer decided

| Excel | YAML |
|---|---|
| Column header `Apple\|KG\|SM` | Ingredient `apple`, unit `g`, store `supermarket` |
| Amounts in kg and litres | Grams and millilitres (x1000). Pieces, packs and jars unchanged |
| Cell `0.01*(C/100)` | `apple: 10 g` under `per_100g` |
| "results in amount pp" | `portion: 250 g` |
| Store codes SM, AS, ONL, DM, NW | `supermarket`, `asian-market`, `online`, `drugstore`, `none` |
| Unknown store code SM2 | `supermarket` (reported) |
| Type Main, Brunch, HelperSnacks, Drink, Misc | `main`, `brunch`, `helper-snack`, `drink`, `misc` |
| Ingredients marked `!weg!` and similar, if unused | Skipped (reported) |
| `Garlic ehm clove` and two more | Renamed to the names the old sheet itself used before |
| Rows named "Misc Placehodler" | Skipped, they have no ingredients |
| Recipe whose ingredients weigh more than 3 times the finished dish, and recipes called "test" | `status: needs-review` with a `review_note` |
| Canned placeholder text in the method column | No `method` |
| Selection numbers 0 to 3, hunger modifier, headcounts | Not imported. They belong to the plan, not to recipes |
| Cell comments | Not imported (many hold outdated values and one personal name) |

Recipe and ingredient ids are the names in lower case with letters and digits only, and with any bracketed text removed.
