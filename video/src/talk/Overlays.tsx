import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

/** Darkens the corners so the eye stays on the card in the middle. */
export const Vignette: React.FC<{ strength?: number }> = ({
  strength = 0.55,
}) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 75% 55% at 50% 47%, rgba(0,0,0,0) 40%, rgba(0,0,0,${strength}) 100%)`,
      pointerEvents: "none",
    }}
  />
);

/** Top and bottom scrims so titles keep their contrast over the footage. */
export const Scrim: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "linear-gradient(to bottom, rgba(6,5,8,0.55) 0%, rgba(6,5,8,0) 24%, rgba(6,5,8,0) 66%, rgba(6,5,8,0.72) 100%)",
      pointerEvents: "none",
    }}
  />
);

/**
 * Film grain. The turbulence is generated at the source's own 360x640 and
 * scaled up, which keeps the per-frame cost low and gives the grain a coarser,
 * more filmic size than per-output-pixel noise would.
 */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.16 }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        opacity,
        mixBlendMode: "overlay",
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <svg
        width={360}
        height={640}
        style={{
          transform: "scale(3)",
          transformOrigin: "top left",
        }}
      >
        <filter id={`grain-${frame % 8}`} colorInterpolationFilters="sRGB">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves={2}
            seed={frame % 8}
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect
          width={360}
          height={640}
          filter={`url(#grain-${frame % 8})`}
        />
      </svg>
    </AbsoluteFill>
  );
};
