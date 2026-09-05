import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  CARD_HEIGHT,
  CARD_TOP,
  CARD_WIDTH,
  OUT_HEIGHT,
  SOURCE,
} from "./constants";
import { GRADE_FILTER, SHARPEN_FILTER } from "./Filters";

const SRC = staticFile("talk.mp4");

/**
 * The source frame with its letterbox bars cropped away, drawn at `width`.
 */
const CroppedVideo: React.FC<{
  width: number;
  trimBefore: number;
  playbackRate: number;
  muted: boolean;
  volume?: number | ((frame: number) => number);
}> = ({ width, trimBefore, playbackRate, muted, volume }) => {
  const scale = width / SOURCE.width;

  return (
    <div
      style={{
        width,
        height: SOURCE.cropHeight * scale,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <OffthreadVideo
        src={SRC}
        trimBefore={trimBefore}
        playbackRate={playbackRate}
        muted={muted}
        volume={volume}
        style={{
          position: "absolute",
          left: 0,
          top: -SOURCE.cropY * scale,
          width,
          height: SOURCE.height * scale,
        }}
      />
    </div>
  );
};

export type KenBurns = {
  zoom: [number, number];
  pan?: [number, number];
};

export const Shot: React.FC<{
  trimBefore: number;
  playbackRate?: number;
  muted?: boolean;
  kenBurns: KenBurns;
  /** Extra blur on the sharp layer, in output pixels, ramped in over the shot. */
  blurTo?: number;
  volume?: number | ((frame: number) => number);
}> = ({
  trimBefore,
  playbackRate = 1,
  muted = false,
  kenBurns,
  blurTo = 0,
  volume,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = interpolate(frame, [0, durationInFrames - 1], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.33, 0, 0.35, 1),
  });

  const zoom = interpolate(progress, [0, 1], kenBurns.zoom);
  const pan = kenBurns.pan ?? [0, 0];
  const panX = interpolate(progress, [0, 1], [0, pan[0]]);
  const panY = interpolate(progress, [0, 1], [0, pan[1]]);
  const blur = blurTo === 0 ? 0 : interpolate(progress, [0.45, 1], [0, blurTo], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Cover the 9:16 output with the 16:9 picture: scale by height.
  const bgScale = OUT_HEIGHT / SOURCE.cropHeight;

  return (
    <AbsoluteFill style={{ backgroundColor: "#08070a" }}>
      {/*
        Blurred bed. The blur is declared on the same element as the scale, so
        Chromium convolves it in the element's own coordinate space - a 7px
        radius on a 202px-tall layer that is then blown up ~9.5x, which reads as
        a ~66px blur but costs a fraction of it.
      */}
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${bgScale})`,
            filter: `url(#${GRADE_FILTER}) blur(7px) saturate(1.15) brightness(0.72)`,
            willChange: "transform",
          }}
        >
          <CroppedVideo
            width={SOURCE.width}
            trimBefore={trimBefore}
            playbackRate={playbackRate}
            muted
          />
        </AbsoluteFill>
      </AbsoluteFill>

      {/* Sharp layer: the graded, lightly sharpened picture on its own card. */}
      <AbsoluteFill>
        <div
          style={{
            position: "absolute",
            top: CARD_TOP,
            left: 0,
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            overflow: "hidden",
            boxShadow:
              "0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(246,242,235,0.10)",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
              filter: `url(#${GRADE_FILTER}) url(#${SHARPEN_FILTER})${
                blur > 0.05 ? ` blur(${blur}px)` : ""
              }`,
              willChange: "transform",
            }}
          >
            <CroppedVideo
              width={CARD_WIDTH}
              trimBefore={trimBefore}
              playbackRate={playbackRate}
              muted={muted}
              volume={volume}
            />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
