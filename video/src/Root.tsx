import "./index.css";
import { Composition, staticFile } from "remotion";
import {
  CaptionedVideo,
  calculateCaptionedVideoMetadata,
  captionedVideoSchema,
} from "./CaptionedVideo";
import { FPS, OUT_HEIGHT, OUT_WIDTH, TOTAL_FRAMES } from "./talk/constants";
import { Talk, talkSchema } from "./talk/Talk";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Talk"
        component={Talk}
        schema={talkSchema}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={OUT_WIDTH}
        height={OUT_HEIGHT}
        defaultProps={{
          eyebrow: "Rank correlation",
          title: "Kendall's\nTau",
          subtitle:
            "Concordant and discordant pairs, and what to do when ranks tie.",
          headingOne: "Concordant vs. discordant pairs",
          detailOne: "Counting how often two rankings agree.",
          headingTwo: "Adjusting for tied ranks",
          detailTwo: "Where tau-b takes over from tau-a.",
          outroTitle: "Kendall's Tau-b",
          outroSubtitle: "Seminar presentation.",
        }}
      />
      <Composition
        id="CaptionedVideo"
        component={CaptionedVideo}
        calculateMetadata={calculateCaptionedVideoMetadata}
        schema={captionedVideoSchema}
        width={1080}
        height={1920}
        defaultProps={{
          src: staticFile("sample-video.mp4"),
        }}
      />
    </>
  );
};
