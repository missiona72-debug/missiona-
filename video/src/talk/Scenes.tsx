import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import {
  CARD_HEIGHT,
  CARD_TOP,
  COLD_OPEN_RATE,
  COLD_OPEN_SOURCE_START,
  OUTRO_RATE,
  OUTRO_SOURCE_START,
  SOURCE,
} from "./constants";
import { Grain, Scrim, Vignette } from "./Overlays";
import { Shot } from "./Shot";
import { BODY_FONT } from "./fonts";
import { Eyebrow, INK, MUTED, Reveal, Rule, Subtitle, Title } from "./Titles";

const PAD = 72;

export const ColdOpen: React.FC<{
  eyebrow: string;
  title: string;
  subtitle: string;
}> = ({ eyebrow, title, subtitle }) => {
  const frame = useCurrentFrame();
  // Start heavy and open up, so the title card resolves into the room.
  const dim = interpolate(frame, [0, 90], [0.78, 0.46], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <Shot
        trimBefore={COLD_OPEN_SOURCE_START}
        playbackRate={COLD_OPEN_RATE}
        muted
        kenBurns={{ zoom: [1.34, 1.2], pan: [10, 4] }}
      />
      <AbsoluteFill style={{ backgroundColor: `rgba(8,7,10,${dim})` }} />
      <Vignette strength={0.7} />
      <AbsoluteFill
        style={{
          padding: PAD,
          justifyContent: "center",
          alignItems: "flex-start",
          gap: 26,
        }}
      >
        <Reveal delay={6}>
          <Eyebrow>{eyebrow}</Eyebrow>
        </Reveal>
        <Rule delay={10} width={168} />
        <Reveal delay={14}>
          <Title>{title}</Title>
        </Reveal>
        <Reveal delay={26} style={{ maxWidth: 820 }}>
          <Subtitle>{subtitle}</Subtitle>
        </Reveal>
      </AbsoluteFill>
      <Grain />
    </AbsoluteFill>
  );
};

/**
 * A caption that rides in under the card and leaves again, used to mark the
 * two slides that come up during the talk.
 */
const LowerThird: React.FC<{
  from: number;
  duration: number;
  heading: string;
  detail: string;
}> = ({ from, duration, heading, detail }) => {
  const frame = useCurrentFrame();
  const local = frame - from;
  if (local < -1 || local > duration) {
    return null;
  }

  const enter = interpolate(local, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exit = interpolate(local, [duration - 16, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shown = Math.min(enter, exit);

  return (
    <div
      style={{
        position: "absolute",
        top: CARD_TOP + CARD_HEIGHT + 76,
        left: PAD,
        right: PAD,
        opacity: shown,
        transform: `translateY(${(1 - shown) * 34}px)`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          gap: 26,
        }}
      >
        <div
          style={{
            width: 5,
            borderRadius: 3,
            background: "#D8A64A",
            transform: `scaleY(${shown})`,
            transformOrigin: "top",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <span
            style={{
              fontFamily: BODY_FONT,
              fontSize: 46,
              lineHeight: 1.15,
              color: INK,
              fontWeight: 700,
            }}
          >
            {heading}
          </span>
          <span
            style={{
              fontFamily: BODY_FONT,
              fontSize: 32,
              lineHeight: 1.3,
              color: MUTED,
            }}
          >
            {detail}
          </span>
        </div>
      </div>
    </div>
  );
};

export const MainBeat: React.FC<{
  headingOne: string;
  detailOne: string;
  headingTwo: string;
  detailTwo: string;
}> = ({ headingOne, detailOne, headingTwo, detailTwo }) => {
  const volume = (f: number) =>
    interpolate(
      f,
      [0, 10, SOURCE.durationInFrames - 26, SOURCE.durationInFrames - 1],
      [0, 1, 1, 0.3],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );

  return (
    <AbsoluteFill>
      <Shot
        trimBefore={0}
        kenBurns={{ zoom: [1.02, 1.09], pan: [-6, -3] }}
        volume={volume}
      />
      <Scrim />
      <Vignette strength={0.45} />
      <LowerThird
        from={22}
        duration={155}
        heading={headingOne}
        detail={detailOne}
      />
      <LowerThird
        from={392}
        duration={150}
        heading={headingTwo}
        detail={detailTwo}
      />
      <Grain opacity={0.13} />
    </AbsoluteFill>
  );
};

export const Outro: React.FC<{ title: string; subtitle: string }> = ({
  title,
  subtitle,
}) => {
  const frame = useCurrentFrame();
  const dim = interpolate(frame, [0, 70], [0.38, 0.76], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <Shot
        trimBefore={OUTRO_SOURCE_START}
        playbackRate={OUTRO_RATE}
        muted
        kenBurns={{ zoom: [1.09, 1.2] }}
        blurTo={11}
      />
      <AbsoluteFill style={{ backgroundColor: `rgba(8,7,10,${dim})` }} />
      <Vignette strength={0.7} />
      <AbsoluteFill
        style={{
          padding: PAD,
          justifyContent: "center",
          alignItems: "flex-start",
          gap: 24,
        }}
      >
        <Rule delay={8} width={140} />
        <Reveal delay={12}>
          <Title size={88}>{title}</Title>
        </Reveal>
        <Reveal delay={22} style={{ maxWidth: 800 }}>
          <Subtitle>{subtitle}</Subtitle>
        </Reveal>
      </AbsoluteFill>
      <Grain opacity={0.1} />
    </AbsoluteFill>
  );
};
