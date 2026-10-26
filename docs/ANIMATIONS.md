# Motion plan

A plan for how Hell's Kitchen moves. Nothing in here is built yet. Every idea has an id (A1, B3, ...), so a choice can be made with a few words: "A1 playful, B3 crazy, skip C2".

Each idea comes in up to three strengths:

- **Regular**: it moves, it feels good, nobody would call it a feature.
- **Playful**: someone smiles. This is the strength the app should have most of the time.
- **Crazy**: someone shows it to the person next to them. Only given where the element deserves it.

A dash means that strength does not make sense there. Inventing one would only make the app tiring.

## What the app uses

The event settings have a **Fun** switch. Each idea below has two strengths: the one used **without fun** and the one used **with fun**. The table is also in code, in `src/lib/motion/choices.ts`, and that file is what the app reads.
Everything not chosen is kept: the full plan below stays as it is, and the trial page (`/styleguide/motion/`) still shows every strength of every idea, with the chosen ones marked. Nothing was deleted, so a decision can be revised by changing one line of `choices.ts`.

| Id | Idea | Without fun | With fun |
|---|---|---|---|
| A1 | Moving between the places | Regular | Playful |
| A2 | Pressing things | Regular | Crazy |
| A3 | Sheets | Regular | Playful |
| A4 | The confirm popup | Regular | Crazy |
| A5 | Toasts | Regular | Playful |
| A6 | Loading | Playful | Playful |
| B1 | Adding a day | Regular | Playful |
| B2 | Adding a meal | Regular | Playful |
| B3 | Adding a dish | Regular | Crazy |
| B4 | Removing | Regular | Crazy |
| B5 | The people counter | Regular | Crazy |
| B6 | The cost | Regular | Regular |
| C1 | The recipe list | Regular | Regular |
| C3 | Opening a recipe | Playful | Crazy |
| C4 | Portions | Regular | Regular |
| C5 | Ingredients on first view | Regular | Playful |
| D1 | Ticking an item | Regular | Crazy |
| D2 | Progress bar | Regular | Regular |
| D3 | A store is done | Regular | Crazy |
| D4 | Everything bought | Regular | Playful |
| D5 | Store tabs | Regular | Regular |
| E1 | The QR code | Regular | Playful |
| E2 | Copy, send, save | Playful | Playful (the copy animation, the stamped check, on all three) |
| E3 | A plan arrives | Regular | Playful |
| E4 | The reminder banner | Regular | Playful |
| E5 | Printing | Regular | Playful |
| F2 | The sidebar | Regular | Regular |
| G2 | Empty screens | Regular | Regular |
| F1, G1, H1, H5 | Plans switching, plates, the logo egg, the buzz | Dropped for now. Their demos stay on the trial page. | |
| B7, B8, C2, D6, E-sound, H2, H3, H4, H6 | | Not built. B7 and B8 are small and can follow; H2 (a party at 200) is part of B5 with fun. | |

How a few of the choices turned out in the real screens, where the plan did not say exactly:

- **D1 with fun.** A ticked item flies into the basket and leaves the list. Items that are bought wait under **Bought · n** at the bottom of the list (closed at first), where they can be ticked off again. Without fun a ticked item stays where it is.
- **D3 with fun.** The wave of ticks is left out, because the ticked rows have already left the list. The confetti and the chef's-hat stamp stay.
- **B3 with fun.** The plate flies to the Plan tab, because the meal it was added to is not on the screen when it is added from a recipe.
- **B4 and A4 with fun.** The thing that is deleted is crumpled and thrown as a copy laid over the screen. The plan changes at once and nothing waits for the show. While the question is open, the meal or day behind it shakes.
- **E5 with fun.** The paper comes out of the printer icon on the share sheet's print rows and on the Print button of the print pages; the little printer button on the shopping list goes straight to the page.
- **C3.** On a desktop the recipe list and the recipe are side by side, so the shared-plate transition is only used on a phone; with fun the plate flies on both.
- **B5 with fun.** The number bounces on every step and the digits roll. The row of little people and the celebrations at round numbers (every 50, the 200) were taken out again as too much; the code for the celebrations is in the trial page (B5) if they come back. The ring thrown from a pressed button (A2) is half the size it was.
- **E4.** The reminder to keep a copy is switched off for now (`REMINDER_SHOWN` in `src/lib/plan/backup.svelte.ts`), so its animation is not seen. The counting goes on in the background.
- **Calm.** If the device asks for less motion, the app uses the choices for "without fun" whatever the switch says, and never throws particles.

## The rules of motion

These apply to every idea below, whatever strength is chosen.

1. **Motion answers something.** A press, a change, an arrival. Nothing loops forever while the person is trying to read a recipe. The only things that move by themselves are the ones on a screen that is waiting (empty states, loading), and they stop after a few seconds.
2. **Fast things are small, big things are rare.** A press answers within 100 ms. A sheet takes 250 to 350 ms. Only celebrations may take 1 to 2 seconds, and they never block anything: the next tap works while the confetti still falls.
3. **Only cheap properties move.** `transform` and `opacity`, and in a few cases `clip-path`. Nothing that makes the browser lay out the page again on every frame. This keeps it smooth on an old phone in a kitchen.
4. **Springs, not ease-in-out.** Things that are pushed and let go overshoot a little and settle. The curves are written once as tokens (CSS `linear()` easings that imitate springs, so no library is needed for most of it).
5. **Calm mode.** `prefers-reduced-motion` switches everything to short fades. Besides that, the event settings get a **Motion** choice: *Full*, *Calm* (no loops, no confetti, no big flights) and *Off*. Crazy things are the first to go in Calm. This also protects phone batteries on the day of the event.
6. **The design rules still hold.** No gradients for glow, no side-stripe accents, one font, no captions that explain the joke. A joke that needs a caption is cut.
7. **Never in the way of the work.** Nothing waits for an animation to end before a tap is accepted. Deleting a meal, for example, changes the plan at once; the animation only shows it.

### Tokens

Written once in `src/lib/styles/tokens.css`, used everywhere, listed on the style sheet page with a live demo each.

| Token | Value | For |
|---|---|---|
| `--motion-instant` | 90 ms | Presses, color changes |
| `--motion-quick` | 180 ms | Hover patches, ticks, small appears |
| `--motion-normal` | 300 ms | Sheets, rows growing, page changes |
| `--motion-slow` | 600 ms | Count-ups, tape being stuck on |
| `--ease-out` | `cubic-bezier(.2,.8,.2,1)` | Things arriving |
| `--ease-in` | `cubic-bezier(.5,0,.8,.3)` | Things leaving |
| `--spring-soft` | `linear()` with a 6 % overshoot | Sheets, rows |
| `--spring-bouncy` | `linear()` with a 18 % overshoot, two wobbles | Ticks, stickers, buttons |

### Tools

Plain CSS for almost everything. Svelte's own `transition:`, `animate:flip` and `Spring`/`Tween` for lists and numbers. The browser's View Transitions for moving a thing from one page to the next. One tiny canvas helper, written by us (about 80 lines), for confetti and crumbs. No animation library: it would be the heaviest thing in the app, and the app must stay small for offline use.

---

## A. The frame

### A1. Moving between Plan, Recipes and Shopping

The three places should feel like one room, not three pages.

| | |
|---|---|
| Regular | The new screen fades in over 180 ms and rises 8 px. The mustard pill in the tab bar (sidebar on desktop) slides to its new place instead of jumping. |
| Playful | The pill stretches while it travels, like a drop of honey, and squashes when it lands. The icon inside hops once. The screens slide sideways in the direction of the tabs (Plan is left of Recipes, so going there slides left). |
| Crazy | Each tab icon has its own little show when it arrives: the calendar flips a page, the book opens, the basket swings. The pill is a blob that morphs into the next place. |

Tools: View Transitions for the screens, CSS for the pill, one SVG filter for the blob (crazy only).

### A2. Pressing things

Every pressable thing answers the finger.

| | |
|---|---|
| Regular | Buttons sink 2 % and come back. The rounded hover and pressed patches (already built) fade in over 90 ms. |
| Playful | Buttons squash a little wider and shorter when pressed, and let go with a `--spring-bouncy` overshoot. Round buttons pop. The red main button throws a ring that grows and fades from the finger. |
| Crazy | A press leaves a small flour puff or a few crumbs flying off in the direction of the finger. Only on the big red buttons. |

### A3. Opening and closing sheets

| | |
|---|---|
| Regular | The sheet rises with `--spring-soft`, the backdrop fades. It closes faster than it opens. Pulling it down moves the backdrop with it, and letting go sends it down with the speed of the pull. |
| Playful | The sheet overshoots upward by a few pixels and settles, like a tray set down. Content inside arrives in a quick stagger (60 ms apart): title, then fields, then buttons. The grip handle wiggles once when the sheet opens. |
| Crazy | The sheet is "dealt" like a card: it slides in from below with a slight tilt that straightens out. Closing it by pulling flings it with a spin. |

### A4. The confirm popup (delete a meal or day)

| | |
|---|---|
| Regular | Pops in from 94 % with a fade. The red button is the only thing with weight. |
| Playful | The popup arrives with a short wobble ("are you sure?"), and the Keep button breathes once. When Delete is chosen, the popup shrinks into the thing being deleted. |
| Crazy | The meal row behind is shown shaking nervously while the popup is open. If you confirm, the row is crumpled into a ball and thrown out of the screen (see B4). |

### A5. Toasts ("Added to Saturday lunch")

| | |
|---|---|
| Regular | Slides up from the bottom with `--spring-soft`, leaves downward. Several toasts stack and shift smoothly. |
| Playful | The toast pops up like toast from a toaster: a short vertical jump with a tiny overshoot, and the check icon draws itself. Swipe sideways to dismiss. |
| Crazy | A real toaster (a flat icon of one) sits at the bottom edge for the moment and the toast shoots out of it, with a faint crumb or two. The toaster slides away after. Yes, it is a pun. It is also the app's only mascot-sized joke, so it is used only here. |

### A6. Loading and "your plan is not available yet"

| | |
|---|---|
| Regular | The plan shows a quiet skeleton of days and meals while it loads, which fades to the real thing. |
| Playful | The flame in the logo flickers while the plan is loading. On a read error, "Try again" gives a small shake when it fails once more. |
| Crazy | — |

---

## B. Plan

### B1. Adding a day

| | |
|---|---|
| Regular | The new day grows open from zero height, fading in. |
| Playful | The mustard tape of the day name is slapped on: it arrives a little too large and rotated, and settles to its resting tilt with a bounce. |
| Crazy | The tape is pulled off a roll from the left, with a tiny tear at the end. The roll is a flat circle that spins as it pays out. |

### B2. Adding a meal

| | |
|---|---|
| Regular | The row grows open, the meal icon fades in. |
| Playful | The icon of the meal type plays its own short scene, one per kind. Breakfast: the cup steams. Lunch: the sun spins up and its rays pulse once. Coffee & cake: the cookie sheds two crumbs. Dinner: the moon rocks and a star twinkles. Snack: the fork and knife clink. This also plays when the kind of a meal is changed in the sheet. |
| Crazy | The meal drops onto the day like a plate on a table: it falls from above, bounces twice, and a ring ripples out from where it lands. The other meals shuffle aside with a spring. |

### B3. Adding a dish (from the plus in a recipe list, from "Add dish" in a meal)

This is the most repeated action of the app. It should feel good a hundred times in a row.

| | |
|---|---|
| Regular | The plus turns into a check for a moment, a toast confirms. In the meal, the new dish line grows in. |
| Playful | The plate of the recipe lifts out of the list and **flies** to the Plan tab (phone) or the Plan sidebar entry (desktop), where the tab icon hops and a small badge counts up. The plan screen shows the dish line sliding into its meal when it is next opened. |
| Crazy | The plate flies in an arc, spinning, leaves a short trail of crumbs, and lands in the meal with a *clink* ring. If the meal is open on screen, the plate lands exactly on the line where it will sit. |

Tools: the plate is cloned into a fixed layer and animated with the Web Animations API along a curved path. About 60 lines, used by B3, C2 and D1.

### B4. Removing a dish, a meal or a day

| | |
|---|---|
| Regular | The row shrinks to zero height and fades. The plan has already changed. |
| Playful | The row is "swallowed": it squashes toward its trash button, shrinks, and the rows below slide up with a spring. |
| Crazy | The row is crumpled and thrown (A4), or for a whole day, the tape is ripped off diagonally and the day's meals fall away like pages. A little puff of flour where it was. |

### B5. The people counter

The big number is the heart of the plan screen.

| | |
|---|---|
| Regular | The digits roll like an odometer: only the digits that change move, each in the direction of the change. Holding the plus or minus repeats, faster the longer it is held, and the digits blur slightly at speed. |
| Playful | The number bounces a little on each step. The "People" label is followed by tiny person icons that pop in and out, up to a handful, as a visual sense of crowd size. |
| Crazy | At round numbers (100, 150, 200) the number gets a short celebration: the digits flash mustard, tiny confetti. Reaching exactly 200 (the real event) is the one place the whole screen throws a party for a second. |

### B6. The cost block

| | |
|---|---|
| Regular | The euro amount counts up or down to its new value over 600 ms. The coverage bar fills with a spring. |
| Playful | When the cost goes up the amount tips slightly toward red and back; when it goes down, toward green. A coin flips in the corner whenever the total changes by more than 5 %. |
| Crazy | The amount is a slot-machine reel: it spins and lands. Reserved for the first time a plan crosses a thousand euros. |

### B7. Editing the event (headcount, organisers, appetite)

| | |
|---|---|
| Regular | Numbers in the event sheet that change cause the meals that depend on them to flash their people counts once. |
| Playful | The appetite factor is a dial: turning it above 1 makes the little person icons on the main-dish meals puff up slightly. |
| Crazy | — |

### B8. Meals and dishes moving around

When something is added, removed or the order changes, other rows slide into place with `animate:flip` (180 to 300 ms, `--spring-soft`). No snapping. This is the quiet half of B1 to B4 and is part of the Regular level of all of them.

---

## C. Recipes

### C1. The list

| | |
|---|---|
| Regular | Rows fade in with a short stagger the first time the list is shown (first 12 rows only). Searching and filtering reorder with `animate:flip`, so the list rearranges instead of blinking. |
| Playful | The letter headings (A, B, C ...) stick, and their red letter pops when it reaches the top. Plates tilt slightly under the pointer on desktop and wobble once when a row is pressed. |
| Crazy | The plates in the list are on a conveyor: scrolling makes them tilt in the direction of scrolling by a few degrees, like plates on a moving belt. Calm and Off remove it. |

### C2. The plus in a row

Same flight as B3. Without the flight (Regular): the plus rotates 90 degrees into a check, holds 600 ms, and rotates back.

### C3. Opening a recipe

| | |
|---|---|
| Regular | A fade and a short rise. |
| Playful | The plate in the list grows into the large plate of the recipe page (shared element via View Transitions), and the title slides in from beside it. Going back is the reverse. |
| Crazy | The plate flies up, the page unrolls from it like a tablecloth, and the ingredients drop onto it line by line. |

### C4. Portions on the recipe page

| | |
|---|---|
| Regular | The ingredient amounts roll like the people counter (B5) when the portions change. |
| Playful | Lines whose amount crossed into a bigger unit (g to kg, ml to L) flash their unit. The heading "Ingredients" bounces a tiny amount per press, as if the pot were being filled. |
| Crazy | The plate on the page grows and shrinks with the portion count, with a small crowd of plates around it growing in number. |

### C5. Ingredient list on first view

Lines fall into place in a 40 ms stagger, like ingredients being added to a bowl: Regular is a fade, Playful adds a short drop and settle. Crazy is not offered: it would slow reading.

---

## D. Shopping

This screen is used on the day, with a phone in one hand and a heavy bag in the other, so it gets the nicest feel and the shortest animations.

### D1. Ticking an item

| | |
|---|---|
| Regular | The circle fills with green over 120 ms, the tick draws itself, the name and amounts fade to the "done" color. |
| Playful | The circle pops (scale 1.25 and back with `--spring-bouncy`), a ring pulses out, and a hand-drawn strike-through wipes across the name from left to right. Unticking un-wipes it. |
| Crazy | The item **flies into the basket** on the Shopping tab: the row shrinks into a small coloured dot that arcs down to the basket icon, which swings, and the number badge ticks down. The list closes the gap. |

### D2. The progress bar and the count

| | |
|---|---|
| Regular | The fill animates to its new width with a spring, the "12 / 37" count rolls like B5. |
| Playful | The fill has a moving highlight for a moment after each tick, as if liquid were pouring in. At each quarter (25, 50, 75 %) it hops once. |
| Crazy | — |

### D3. A store is done

| | |
|---|---|
| Regular | The store's tab gets a small check, and the progress bar turns leaf green. |
| Playful | A short burst of confetti in the store's own tint, and the tab's count badge turns into a check with a pop. |
| Crazy | The whole list does a Mexican wave of ticks, then confetti falls from the top of the screen, and a "chef's kiss" sticker stamps on the screen for a second. |

### D4. Everything bought

The finish line of the whole event preparation. It is rare, so it can be large.

| | |
|---|---|
| Regular | A message and a check on the screen with a light confetti burst. |
| Playful | Confetti cannons from both bottom corners, the basket tab icon dances, the plan name appears in a stamp. |
| Crazy | The app does a short victory scene: the plates from every recipe in the plan rain from the top (they are real, the same plates as in the lists), and a chef's hat settles on the logo. After 3 seconds it stops. Tapping the screen makes it rain again. |

### D5. Store tabs

| | |
|---|---|
| Regular | The red underline slides from the old tab to the new one, and the list below cross-fades. |
| Playful | The underline stretches while traveling. The count badges roll when they change. |
| Crazy | — |

### D6. Cost per store, "without price" pill

The cost counts up like B6. The pill's tag icon swings once when it first appears (Playful). Nothing for Crazy.

---

## E. Sharing, saving and printing

### E1. The share sheet and the QR code

| | |
|---|---|
| Regular | The code fades in with the sheet. |
| Playful | The code is drawn in: finder squares first, then the dots fill in row by row in 350 ms, as if it were being printed. |
| Crazy | The dots fly in from the edges of the screen and assemble into the code, like a card trick. When the plan changes while the sheet is open, the code shuffles into the new one. |

### E2. Copy the link / Save a file / Send

| | |
|---|---|
| Regular | The row's icon becomes a check for 1.5 seconds. |
| Playful | Copy: the clipboard icon "stamps" the check. Send: the paper plane takes off and shrinks away to the top right. Save: the file icon drops into a tray that appears under it. |
| Crazy | The paper plane makes a loop-the-loop and leaves a dotted line. The file lands in the tray and the tray slides away with a *thunk*. |

### E3. A plan arrives

| | |
|---|---|
| Regular | The two plans fade in side by side. |
| Playful | The incoming plan slides in from the side it came from, like a letter, and lands next to the existing one. "Keep both" puts them into a neat stack; "Replace" lets the old one slip out under the new one. |
| Crazy | The incoming plan arrives as an envelope that opens (the QR, a link or a file each use a different envelope icon: a barcode label, a link chain, a paper sleeve). |

### E4. The backup reminder banner

| | |
|---|---|
| Regular | Slides down from the top edge and pushes the page. "Later" slides it back up. |
| Playful | The first time it shows, the little disk icon shakes like it needs attention. After Save, the banner is replaced by a "Saved" tick for a second and then goes away. |
| Crazy | — |

### E5. Printing

| | |
|---|---|
| Regular | Nothing special. |
| Playful | Pressing Print makes the printer icon spit out a sheet of paper that slides out of the icon. |
| Crazy | — |

---

## F. Plans on the device

### F1. Switching, adding and deleting a plan

| | |
|---|---|
| Regular | The list rearranges with `animate:flip`. The open plan's "Open" badge moves with a pop. |
| Playful | Switching plans turns the whole page over like a card (Y-axis flip, 400 ms), and the name in the sidebar changes with a roll. |
| Crazy | The plans are a deck of cards in the sheet: a new plan is dealt onto the top, deleting one tears it in half. |

### F2. The sidebar (desktop)

| | |
|---|---|
| Regular | The white active pill slides between entries, the shopping badge rolls when its number changes. |
| Playful | The logo's flame flickers slowly while the pointer is over the sidebar's top, and flares up when a plan is shared or saved. |
| Crazy | — |

---

## G. Illustration and life

These make the app feel alive without being asked. They are small, and each one is switched off in Calm mode.

### G1. Plates

Every recipe has a plate, generated from its id. They are the app's recurring character.

| | |
|---|---|
| Regular | Nothing moves. |
| Playful | A plate wobbles on press and on arrival. On a recipe page, a few steam wisps rise from the plate for 3 seconds after it opens. |
| Crazy | Plates are physical. Tapping a plate spins it on its rim like a coin; holding two plates close on desktop makes them clink. |

### G2. Empty states

"Nothing to buy yet", "No recipe matches", a day without meals. Instead of text alone:

| | |
|---|---|
| Regular | A quiet fade-in of the text and the link. |
| Playful | An empty plate bobs slowly beside the text (twice, then rests). |
| Crazy | The empty plate does a small show: a fork and a knife appear and tap the rim in rhythm, then lie down. |

### G3. Meal-type icons

Used by B2 on arrival. They also respond on press (Regular: nothing; Playful: a hop) and on tap-and-hold in the meal sheet (Crazy: the full scene replays, with a sound if sound is on).

---

## H. Easter eggs and extras

Each is optional and independent. None gets in the way of normal use.

| Id | What | Strength |
|---|---|---|
| H1 | **Logo tap.** Tapping the flame five times makes food plates rain for three seconds. | Crazy |
| H2 | **Party at 200.** Setting the headcount to exactly 200 makes the people number sparkle once. | Crazy |
| H3 | **Shake to stir.** On a phone, shaking the device while looking at the plan makes the page wobble as if stirred, and the meal rows briefly swap places and return. Needs one permission prompt on iOS, so it is behind a switch in the settings. | Crazy |
| H4 | **Sound.** Off by default. An optional soft *clink*, *pop*, *whoosh*, and a short fanfare for D4, kept to a few kilobytes in total. Needs the phone to be off silent mode. | Playful |
| H5 | **Haptics.** Android phones can buzz lightly on a tick or a deleted meal. iPhones do not allow it from a web page, so this is Android only. | Regular |
| H6 | **Day of the event.** On the actual date of the first day in the plan, the logo flame is brighter and the plan screen greets with a small animation, once. | Playful |

---

## How I would do it

Not all at once. Each phase can be tried on a phone before the next one starts.

1. **Foundation (small).** The motion tokens, the Calm/Off setting, the page for trying every token on the style sheet, and the quiet half of everything: A2 Regular, A3 Regular, A5 Regular, B8, C1 Regular, D1 Regular, D2 Regular. After this the app already feels finished.
2. **The frame and the plan.** A1, A3, A4, B1, B2, B4, B5, B6 at Playful.
3. **Shopping.** D1 to D5 at Playful, with the basket flight (D1 Crazy) built as a trial, because it is the best joke in the app and the riskiest to get smooth.
4. **Recipes and the flights.** The shared flight helper, then B3 and C2/C3.
5. **Sharing and the life of the screens.** E1 to E4, F, G.
6. **Easter eggs and sound.** H, last, because they depend on everything else being solid.

## What I need from you

1. **The default strength.** My suggestion: Playful everywhere, Crazy only in B3 (the flying plate), D1 (the basket), D4 (everything bought), A5 (the toaster), H1 and H2.
2. **Sound and shake.** Do you want them at all, even off by default?
3. **The toaster.** It is a mascot-level joke in the Toasts. If you would rather keep the app's humor to its words and plates, A5 stays Playful.
4. **A trial page.** I can build a "Motion" page next to the style sheet where every idea runs at all its strengths, on a phone, before any of it goes into the real screens. That is how I would decide the Crazy ones, rather than on paper.
