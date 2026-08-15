# Erg — rowing tracker

A landscape tablet app for rowing on a Concept2 erg: set a piece, watch split and
distance while you row, and see where the training is going. Built from the
Claude Design handoff in `../project/Rowing Tablet App.dc.html`.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static bundle in dist/
npm run preview  # serve the built bundle
```

The output of `npm run build` is a plain static site — serve `dist/` from
anything, or open it full-screen in Chrome on the tablet.

## Layout

The design is drawn at 1280×800 landscape. Rather than letterbox it, the app
derives one uniform scale factor from the viewport (`src/hooks/useViewportScale.ts`)
and applies it to the root, so the design's proportions and type scale are
preserved while the layout itself fills whatever the tablet reports. At exactly
1280×800 the factor is 1 and everything renders at its design pixel size — which
is why every value in `src/styles/app.css` is written in design pixels.

## Where the rowing data comes from

Nothing here talks to a real PM5 yet. `src/erg/simulatedErg.ts` produces
telemetry on a 250 ms tick from the model in the prototype: a rower who settles
two seconds under target split, with a long swell across the piece and a short
one across each stroke cycle. Distance accumulates from the pace actually held,
so the pace-boat gap behaves the way it would on the water.

It sits behind the `ErgSource` interface in `src/erg/types.ts`:

```ts
start(piece) / pause() / resume() / stop()
subscribe(listener) -> unsubscribe
```

A real Concept2 monitor implements the same four calls — connect over Bluetooth,
subscribe to the PM5 rowing-status and stroke-data characteristics, map each
notification to an `ErgTelemetry`, and hand the instance to `AppProvider` in
place of `SimulatedErg`. No screen has to change.

## Screens

Eight, reached from the left rail (`home`, `setup`, `progress`, `plan`,
`settings`) or from actions: starting a piece opens `live`, finishing it opens
`summary`, and the erg-status button at the foot of the rail opens `pair`.
Each is a component in `src/screens/`; `src/state/` holds the piece
configuration, the settings toggles and the session lifecycle.

## Content

The training history, personal records, plan week and device list in
`src/data/fixtures.ts` are the design's sample content. They are the seam to
replace when a real log lands — nothing else reads them.

## Styles

- `src/styles/organic.css` — the Organic design system, vendored from the
  handoff bundle and otherwise unmodified. Retune the system here.
- `src/styles/theme.css` — this app's palette on top of it: the accent ramp
  retuned to a warm brown and the second voice to a river blue, so the rail,
  live screen and chart panels read blue with brown reserved for primary
  actions.
- `src/styles/fonts.css` + `public/fonts/` — Caprasimo and Figtree (SIL Open
  Font License), self-hosted so a tablet with no network at the erg still
  renders correctly.
- `src/styles/app.css` — screen layout.
