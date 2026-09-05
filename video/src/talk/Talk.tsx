import {
  linearTiming,
  springTiming,
  TransitionSeries,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import React from "react";
import { AbsoluteFill } from "remotion";
import { z } from "zod";
import {
  COLD_OPEN_FRAMES,
  OUTRO_FRAMES,
  SOURCE,
  TRANSITION_IN,
  TRANSITION_OUT,
} from "./constants";
import { FilterDefs } from "./Filters";
import { ColdOpen, MainBeat, Outro } from "./Scenes";
import { loadFont } from "../load-font";

loadFont();

export const talkSchema = z.object({
  eyebrow: z.string(),
  title: z.string(),
  subtitle: z.string(),
  headingOne: z.string(),
  detailOne: z.string(),
  headingTwo: z.string(),
  detailTwo: z.string(),
  outroTitle: z.string(),
  outroSubtitle: z.string(),
});

export const Talk: React.FC<z.infer<typeof talkSchema>> = ({
  eyebrow,
  title,
  subtitle,
  headingOne,
  detailOne,
  headingTwo,
  detailTwo,
  outroTitle,
  outroSubtitle,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#08070a" }}>
      <FilterDefs />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={COLD_OPEN_FRAMES}>
          <ColdOpen eyebrow={eyebrow} title={title} subtitle={subtitle} />
        </TransitionSeries.Sequence>

        {/*
          A cross-dissolve rather than a push: both scenes are the same room, so
          a moving edge between them just reads as a seam. The cold open is
          punched in to 1.2x and the talk opens at 1.02x, so dissolving between
          them lands as a pull-back reveal instead of a cut.

          The main sequence is already mounted through the overlap, so its audio
          starts a beat before its picture does - a J-cut, which keeps the
          hand-off from feeling abrupt.
        */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({
            config: { damping: 200 },
            durationInFrames: TRANSITION_IN,
            durationRestThreshold: 0.001,
          })}
        />

        <TransitionSeries.Sequence
          durationInFrames={SOURCE.durationInFrames}
        >
          <MainBeat
            headingOne={headingOne}
            detailOne={detailOne}
            headingTwo={headingTwo}
            detailTwo={detailTwo}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_OUT })}
        />

        <TransitionSeries.Sequence durationInFrames={OUTRO_FRAMES}>
          <Outro title={outroTitle} subtitle={outroSubtitle} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
