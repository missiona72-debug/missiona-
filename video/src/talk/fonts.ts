import { cancelRender, continueRender, delayRender, staticFile } from "remotion";

// Inter is self-hosted from public/ rather than pulled from Google Fonts at
// render time: the renderer runs headless and offline, so a network font is a
// stalled render. The file is the latin subset of the variable face (400-700).
export const BODY_FONT = "InterVariable";

let loading: Promise<void> | null = null;

export const loadBodyFont = (): Promise<void> => {
  if (loading) {
    return loading;
  }

  const handle = delayRender("Loading Inter");

  loading = new FontFace(
    BODY_FONT,
    `url('${staticFile("inter-var-latin.woff2")}') format('woff2')`,
    { weight: "400 700" },
  )
    .load()
    .then((font) => {
      document.fonts.add(font);
      continueRender(handle);
    })
    .catch((err) => {
      cancelRender(err);
    });

  return loading;
};
