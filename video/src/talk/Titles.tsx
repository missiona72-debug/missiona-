import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { TheBoldFont } from "../load-font";
import { BODY_FONT, loadBodyFont } from "./fonts";

loadBodyFont();

export const INK = "#F6F2EB";
export const MUTED = "rgba(246,242,235,0.66)";
export const ACCENT = "#D8A64A";

/**
 * Wipes a line of type in from the left while it settles upward - the reveal
 * reads as one move rather than a fade, which holds up at small phone sizes.
 */
export const Reveal: React.FC<{
  delay?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay = 0, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200, mass: 0.7 },
  });

  return (
    <div style={{ overflow: "hidden", ...style }}>
      <div
        style={{
          clipPath: `inset(0 ${(1 - progress) * 100}% 0 0)`,
          transform: `translateY(${(1 - progress) * 26}px)`,
          opacity: interpolate(progress, [0, 0.25], [0, 1], {
            extrapolateRight: "clamp",
          }),
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const Eyebrow: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <span
    style={{
      fontFamily: BODY_FONT,
      fontSize: 26,
      fontWeight: 600,
      letterSpacing: 7,
      textTransform: "uppercase",
      color: ACCENT,
    }}
  >
    {children}
  </span>
);

export const Title: React.FC<{ children: React.ReactNode; size?: number }> = ({
  children,
  size = 104,
}) => (
  <span
    style={{
      fontFamily: TheBoldFont,
      fontSize: size,
      lineHeight: 1.02,
      letterSpacing: -1.5,
      textTransform: "uppercase",
      color: INK,
      display: "block",
      whiteSpace: "pre-line",
      textShadow: "0 6px 40px rgba(0,0,0,0.55)",
    }}
  >
    {children}
  </span>
);

export const Subtitle: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <span
    style={{
      fontFamily: BODY_FONT,
      fontSize: 38,
      fontWeight: 400,
      lineHeight: 1.35,
      color: MUTED,
      display: "block",
    }}
  >
    {children}
  </span>
);

/** A hairline that draws itself out to full width. */
export const Rule: React.FC<{ delay?: number; width?: number }> = ({
  delay = 0,
  width = 200,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200, mass: 0.5 },
  });

  return (
    <div
      style={{
        width: width * progress,
        height: 3,
        background: ACCENT,
        borderRadius: 2,
      }}
    />
  );
};
