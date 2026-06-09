# Attendize — App Icon assets

Production icon assets for the **Attendize** attendance-tracker app. Concept: a dimensional **gold token** with a deep-spruce **check** on a lit green ground. Authored as vector layers on Apple's true superellipse; no baked text, no external drop shadow (the system applies its own).

## Files

| File | What it is | Use |
|---|---|---|
| `attendize-icon-1024.png` | Composed master, 1024×1024, superellipse-masked | App Store / marketing / quick preview |
| `attendize-master-light-1024.svg` | Composed vector master (Light) | Source of truth / re-render any size |
| `attendize-master-dark-1024.svg` | Composed vector master (Dark appearance) | Reference for the Dark variant |
| `attendize-master-tinted-1024.svg` | Composed vector master (Tinted / monochrome) | Reference for the Tinted variant |
| `layers/1-background.svg` | **Layer 1** — full-bleed green field (spotlight + halo + grain) | Icon Composer back layer |
| `layers/2-token.svg` | **Layer 2** — gold token (transparent bg) | Icon Composer middle layer |
| `layers/3-check.svg` | **Layer 3** — spruce check (transparent bg) | Icon Composer front layer |

All SVGs are **1024×1024, full-bleed** (background runs to the edge — Apple masks it). Layers 2 and 3 have transparent backgrounds.

## Icon Composer (Xcode 26 `.icon`)

1. New icon in **Icon Composer** → import the three files from `layers/` as separate layers, bottom→top: `1-background`, `2-token`, `3-check`.
2. Leave the corner mask to the system (the superellipse is Apple's own); our SVGs are full-bleed so they fill the canvas.
3. Do **not** add a drop shadow — iOS applies its own elevation. Depth here comes from the token gradient + the inner rim-light baked into the background.
4. Enable **Light / Dark / Tinted** appearances. Use the matching `attendize-master-*-1024.svg` as the visual target. For Tinted, Icon Composer generates a monochrome treatment automatically; the provided tinted master shows the intended look.
5. Export. Drop the resulting `.icon` (or `AppIcon.appiconset`) into the Xcode project's asset catalog.

## React Native / Expo (current app stack)

If wiring via `expo` config instead of Xcode asset catalog:

```jsonc
// app.json / app.config
{
  "expo": {
    "icon": "./assets/icon/attendize-icon-1024.png",
    "ios": {
      "icon": {
        "light": "./assets/icon/attendize-master-light-1024.png",
        "dark":  "./assets/icon/attendize-master-dark-1024.png",
        "tinted":"./assets/icon/attendize-master-tinted-1024.png"
      }
    }
  }
}
```
(Export PNGs from the SVG masters at 1024 if you go this route — Expo wants PNG. The included `attendize-icon-1024.png` is the Light master already rasterized.)

## Specs (for re-creating or tweaking in code)

- **Canvas:** 1024×1024, viewBox `0 0 1024 1024`.
- **Mask:** superellipse, exponent **n = 5**, centered, `a = 512`.
- **Background:** radial field `#54836D → #2C5443 → #0F2820` (center 42%,34%, r86%); warm halo `#D89A3C` @34% behind token; faint corner vignette (#000 @8%); top-left linear sheen; ~6% desaturated fractal-noise grain (soft-light).
- **Token:** circle r300, rim `#8A5512`, fill radial `#FFEDB0 → #F6CE6A → #D89B36 → #A2641A` (center 33%,27%, r90%); blurred white specular ellipse top-left; thin white top arc highlight.
- **Check:** path `M 360 512 L 466 620 L 660 408`, stroke `#1C3A2E → #0E2A20`, **width 92**, **round caps/joins**; subtle blurred contact shadow beneath.
- **Inner rim-light:** superellipse stroke inset 4px, `#74A98D` @55%, width 7 (keeps an edge on dark wallpapers).
- **Brand colors:** spruce `#2C5443` / deep `#0F2820`; gold `#D89B36` / deep `#A2641A`.

## Accessibility

Color-blind safe: the meaning is carried by the **check shape** + strong **luminance** contrast (dark check on bright gold), never by hue. Bold stroke survives downscaling — verified legible at 40px.
