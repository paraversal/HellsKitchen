# Recipe photos

One photo per recipe, **named after the recipe's id**: the recipe `data/recipes/tzatziki.yaml` gets `data/images/tzatziki.jpg`.
A recipe without a photo shows an icon for its kind (main, brunch, helper snack, drink, misc) instead.

- Formats: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`. A photo from an iPhone may be HEIC: export it as JPG first.
- Any size works, because the app makes its own small copies (a square crop of the middle, with the most interesting part kept). About 1600 pixels on the long side is plenty.
- Only photos you took yourself, or that you may share. The repository is public.
- `npm run validate` says if a file name does not match a recipe.
