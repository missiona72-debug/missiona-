import React from "react";

export const GRADE_FILTER = "talk-grade";
export const SHARPEN_FILTER = "talk-sharpen";

/**
 * Colour work for the source footage, in SVG filter primitives rather than CSS
 * `filter` shorthands so each channel can be corrected on its own.
 *
 * Measured off the source: mean RGB was 117/80/81 at a mean luma of 88, with
 * 19% of pixels sitting below luma 16. That is a strong red cast over a dim,
 * shadow-crushed image, so the chain is:
 *   1. per-channel gain to pull the red back without going fully neutral
 *      (the room really is warm; killing all of it makes skin look grey)
 *   2. gamma + offset to open the midtones and lift the crushed blacks
 *   3. a small linear contrast to put the punch back after the gamma lift
 *   4. a light saturation bump now that the cast is gone
 */
export const FilterDefs: React.FC = () => {
  return (
    <svg
      width={0}
      height={0}
      style={{ position: "absolute" }}
      aria-hidden
    >
      <defs>
        <filter id={GRADE_FILTER} colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0.90 0 0 0 0  0 1.04 0 0 0  0 0 1.12 0 0  0 0 0 1 0"
          />
          <feComponentTransfer>
            <feFuncR type="gamma" amplitude={1} exponent={0.86} offset={0.02} />
            <feFuncG type="gamma" amplitude={1} exponent={0.86} offset={0.02} />
            <feFuncB type="gamma" amplitude={1} exponent={0.86} offset={0.02} />
          </feComponentTransfer>
          <feComponentTransfer>
            <feFuncR type="linear" slope={1.06} intercept={-0.025} />
            <feFuncG type="linear" slope={1.06} intercept={-0.025} />
            <feFuncB type="linear" slope={1.06} intercept={-0.025} />
          </feComponentTransfer>
          <feColorMatrix type="saturate" values="1.08" />
        </filter>

        {/*
          The picture is only 360x202 before it is blown up 3x, so a mild
          unsharp mask buys back some of the edge definition the upscale
          softens. Kept gentle - the source is a 1.2 Mbit/s phone encode and a
          harder kernel just sharpens its compression noise.
        */}
        <filter id={SHARPEN_FILTER} colorInterpolationFilters="sRGB">
          <feConvolveMatrix
            order="3"
            preserveAlpha="true"
            divisor={1}
            kernelMatrix="0 -0.22 0  -0.22 1.88 -0.22  0 -0.22 0"
          />
        </filter>
      </defs>
    </svg>
  );
};
