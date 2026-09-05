# Kendall's Tau — talk edit

Source: a 32.85s WhatsApp export of a classroom presentation, handed over as
`public/talk.mp4`. Output: `out/kendalls-tau.mp4`, 1080x1920 at 30fps.

Everything below is driven by what the source actually is, so it is worth
knowing what that is before changing things.

## What the source really is

Measured with `remotion ffprobe` and by decoding frames, not assumed:

| | |
|---|---|
| Container | 360x640 h264, 30fps, 32.85s, 1254 kb/s |
| Real picture | **360x202** — a 16:9 landscape shot letterboxed into the vertical frame (black bars fill rows 0-218 and 421-639) |
| Audio | AAC 44.1kHz stereo, integrated loudness **-13.5 LUFS**, true peak -3.2 dBTP, LRA 2.3 LU |
| Exposure | mean luma 88; 19% of pixels below luma 16 (crushed shadows) |
| Colour | mean RGB 117 / 80 / 81 — a strong red cast from tungsten light and pink walls |

Two consequences worth repeating:

- **The usable image is 360x202.** Blowing it up to 1080 wide is a 3x upscale.
  Nothing recovers detail that was never recorded, so the grade and a light
  unsharp mask are doing the heavy lifting, not the resolution.
- **The audio needs no normalisation.** At -13.5 LUFS it already sits on the
  -14 LUFS streaming target, so the original track is used untouched rather
  than re-encoded for a 0.6 LU change.

## The edit

Three scenes in a `TransitionSeries` (`src/talk/Talk.tsx`):

1. **Cold open** (3.5s) — a moment from the middle of the talk at 0.35x, muted,
   punched in to 1.34x and pulling back to 1.2x, under the title lockup.
2. **The talk** (32.85s) — the full source with its own audio, opening at 1.02x
   and pushing to 1.09x, with two lower thirds marking the slides that come up.
3. **Outro** (3s) — the closing seconds at 0.45x, blurring and dimming out under
   the closing card.

Transitions are cross-dissolves, deliberately. Both scenes are the same room
from the same camera position, so a push or a wipe puts a moving edge between
two near-identical images and reads as a seam. Dissolving from the cold open's
1.2x into the talk's 1.02x instead lands as a pull-back reveal.

The slow motion is frame-sampled, not interpolated — Remotion holds source
frames rather than synthesising new ones. At 0.35x on 30fps material that is
visible as slight stepping in fast movement, which is why the slow-mo is
confined to the two title beats and never the body of the talk.

## The look

- **Framing** (`src/talk/Shot.tsx`): the letterbox is cropped away and the real
  picture is drawn 1080 wide on a card, over a blurred, darkened copy of itself
  scaled to fill the vertical frame. The blur is declared on the same element as
  the scale so Chromium convolves it in the element's own coordinate space — a
  7px radius on a 202px-tall layer that is then blown up 9.5x, which reads as a
  ~66px blur at a fraction of the cost.
- **Grade** (`src/talk/Filters.tsx`): SVG filter primitives rather than CSS
  `filter` shorthands, because the correction is per-channel. Red gain is pulled
  to 0.90 while green and blue come up (1.04 / 1.12) — a partial correction, not
  a neutral one, since the room genuinely is warm and neutralising it fully
  leaves skin looking grey. Then gamma 0.86 with a 0.02 offset to open the
  midtones and the crushed blacks, a small linear contrast to put the punch
  back, and saturation 1.08.
- **Sharpen**: a mild 3x3 unsharp kernel, kept gentle because the source is a
  1.2 Mbit/s phone encode and a harder kernel just sharpens its noise.
- Vignette, scrim and film grain sit on top; the grain is generated at 360x640
  and scaled up, which keeps it cheap and gives it a coarser, filmic size.

## Changing the text

All nine strings are composition props with a zod schema, so they are editable
in Remotion Studio without touching code (`npm run dev`, pick **Talk**, use the
props panel). Defaults are taken from what is legible on the slides themselves.

## Rendering

```bash
npm run dev      # Remotion Studio
npm run render   # out/kendalls-tau.mp4, h264 CRF 16, PNG intermediates
```

`npm run render` uses PNG intermediate frames rather than the project default of
JPEG, so the only lossy step is the final H.264 encode.

If the machine cannot reach Remotion's Chrome Headless Shell download, point
`REMOTION_BROWSER` at an existing headless Chromium before rendering:

```bash
REMOTION_BROWSER=/path/to/headless_shell npm run render
```
