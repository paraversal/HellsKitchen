# Putting the site online, and testing it on phones

Roadmap step 5 (walking skeleton). The site is published on GitHub Pages by the workflow in `.github/workflows/deploy.yml`
whenever something is merged into `main`. Pull requests only run the checks in `ci.yml`.

## One-time setup

1. **Make the repository public.** GitHub Pages is free only for public repositories. (Recipes are public on purpose.)
2. **Commit and push to `main`.** The first push starts the deploy workflow.
3. **Turn on Pages:** repository Settings, Pages, Source: **GitHub Actions**.
4. Open the **Actions** tab. When "Deploy" is green, the address is shown there. It looks like `https://<owner>.github.io/HellsKitchen/`.

If the first deploy ran before step 3, run it again: Actions, Deploy, Run workflow.

## The phone test

Do this on one iPhone (Safari) and one Android phone (Chrome). The site must pass all five.

1. Open `<address>/status/` on the phone (the app itself opens at the address without `/status/`). The page shows a list of checks. "Works offline" should become a tick.
2. **Install it:**
   - iPhone: Share, Add to Home Screen.
   - Android: menu, Install app (or Add to Home screen).
3. Open the app from the home screen. The page says "opened from the home screen".
4. Type a note, press Save. The page shows it as saved.
5. Close the app. Turn on **airplane mode**. Open the app again.
   - The page opens, the font and layout look the same, and "Open another page" works. The recipes (the home of the app) open too, also ones you never looked at.
   - The note you saved is still there.
6. Restart the phone, leave airplane mode on, and open the app once more. The note must still be there.

Write down what happened, especially anything that differs between the two phones. In particular, "Browser keeps the data" may stay unticked on the iPhone.
That is expected and is the reason the app will remind people to back up a plan.

## What was already checked on a computer

On a computer, with the server switched off after the first visit: the home page and the other page opened from the offline cache,
the data file and font loaded, and a note saved while offline was still there after navigating away and back.
The site was also built and served under a sub-path (`/HellsKitchen/`), as on GitHub Pages.

## The plan screens (step 12)

On the phone, also try this. It should take a few minutes, not fifteen.

1. In **Plan**, open the event settings (the sliders button) and set the headcount and the number of organisers.
2. Add a meal, choose its kind and time, and add three or four dishes with "Add dish".
3. In **Recipes**, press the plus next to a recipe and put it in a new meal.
4. In **Shopping**, switch between the store tabs, tick a few items, and look at the estimated cost.
5. Close the app completely and open it again: the plan and the ticks must still be there.
6. Switch on airplane mode, restart the phone, and open the app once more. If the plan is not there yet, the app must say so and offer "Try again", and it must not show an empty new plan. Turn the connection back on, press "Try again", and the plan returns.

## Results

### iPhone, 2026-10-25

Passed: install to the home screen, opening in airplane mode, layout and font offline, the second page.

One difference: after restarting the phone and opening the app in airplane mode, the saved note was missing. It came back as soon as
the phone was on wifi. We accept this edge case, because the data is not lost. It does give the app a rule, which is noted in
roadmap step 12: the app must never treat "the storage could not be read yet" as "there are no plans", and must not save over a plan
until the read has worked.

### Android

Not tested yet.
