// Everything the edit needs to know about the source clip and the output frame.
//
// The source is a 360x640 WhatsApp export that contains a 16:9 landscape shot
// letterboxed into a vertical frame. The bar positions below were measured off
// decoded frames (rows 0-218 and 421-639 are black), so the real picture is
// 360x202 starting at y=219.

export const FPS = 30;
export const OUT_WIDTH = 1080;
export const OUT_HEIGHT = 1920;

export const SOURCE = {
  width: 360,
  height: 640,
  cropY: 219,
  cropHeight: 202,
  durationInFrames: 985,
} as const;

// The sharp layer is the cropped picture scaled to the full output width.
export const UPSCALE = OUT_WIDTH / SOURCE.width; // 3x
export const CARD_WIDTH = OUT_WIDTH;
export const CARD_HEIGHT = Math.round(SOURCE.cropHeight * UPSCALE); // 606
// Sit the card slightly above centre so the lower third has room to breathe.
export const CARD_TOP = 600;

export const COLD_OPEN_FRAMES = 105; // 3.5s
export const COLD_OPEN_RATE = 0.35; // slow motion
export const COLD_OPEN_SOURCE_START = 235;

export const OUTRO_FRAMES = 90; // 3s
export const OUTRO_RATE = 0.45; // slow motion
export const OUTRO_SOURCE_START = SOURCE.durationInFrames - 45;

export const TRANSITION_IN = 30;
export const TRANSITION_OUT = 25;

export const TOTAL_FRAMES =
  COLD_OPEN_FRAMES +
  SOURCE.durationInFrames +
  OUTRO_FRAMES -
  TRANSITION_IN -
  TRANSITION_OUT;
