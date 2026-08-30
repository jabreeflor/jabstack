# Tab icon variations

Five favicon candidates for jabstack, all drawn from the palette in
[`../banner.svg`](../banner.svg). Every value here comes from that file — there is no
second source of colour in this repo:

| Role | Value | Where it comes from |
|---|---|---|
| Ground | `#0D1117 → #171C26`, diagonal | the banner's `bg` gradient |
| Edge | `#2A3140` hairline | the banner's 1px border |
| Accent | `#8B5CF6 → #22D3EE`, diagonal | the banner's `accent` gradient |
| Ink | `#F0F6FC` | the banner's wordmark |

Each is a 64×64 SVG with a 14-unit corner radius, sized so it still reads at 16px.
The ground gradient is declared `gradientUnits="userSpaceOnUse"` across the full 64×64
box, so the plate fill and the shapes drawn in it sample one continuous sweep rather
than each restarting the gradient inside its own bounding box.

| File | Concept | Notes |
|---|---|---|
| [`01-iso-stack.svg`](01-iso-stack.svg) | The banner's isometric three-layer stack, scaled down | Most literal tie to the existing mark. Layer opacities are lifted to 0.55/0.8/1.0 — the banner's lighter values disappear against the dark plate at tab size. |
| [`02-monogram-j.svg`](02-monogram-j.svg) | Lowercase `j` in white with a gradient tittle | The only wordmark-derived option. Distinct in a crowded tab strip, but says "jabree" more than "stack". |
| [`03-outline-layers.svg`](03-outline-layers.svg) | Stroked layers — one full rhombus over two chevrons | Lightest weight of the five and still crisp at 16px, because the gradient sits on the strokes rather than behind them. |
| [`04-bracket-stack.svg`](04-bracket-stack.svg) | Gradient brackets around two stacked bars | Reads as "code" rather than "layers". The busiest of the set — it holds at 32px but softens at 16px. |
| [`05-knockout-stack.svg`](05-knockout-stack.svg) | Inverted: a full accent plate with the stack cut out in the ground gradient | Highest contrast at 16px by a wide margin, and the only one that stays bright against a dark browser chrome. |

## Using one

Nothing consumes these yet — jabstack has no site. When one is picked, promote it
to `assets/favicon.svg` and reference it with:

```html
<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
```

Browsers that don't take SVG favicons need a rasterized `.png` fallback alongside it.
