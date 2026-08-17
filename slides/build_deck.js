/* ------------------------------------------------------------------
   Latent Class Analysis & Latent Profile Analysis
   A Gentle Introduction, with Hands-On Practice
   Build:  node slides/build_deck.js
------------------------------------------------------------------- */
const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";                 // 13.33 x 7.5
pres.author = "Seminar deck";
pres.title  = "Latent Class Analysis and Latent Profile Analysis";

const W = 13.33, H = 7.5, M = 0.62, CW = W - 2 * M;

/* ---------------- palette ---------------- */
const INK   = "1A1633";
const NAVY  = "2A2356";
const NAVY2 = "393177";
const MUTED = "6B6785";
const FAINT = "9E9AB4";
const LINE  = "DBD8E8";
const TINT  = "F5F4FA";
const TINT2 = "EBE9F5";
const WHITE = "FFFFFF";

/* class colours - the visual motif: every "class/profile" keeps its colour */
const C1 = "D9553C";   // coral
const C2 = "1F8F82";   // teal
const C3 = "E09B21";   // amber
const C4 = "6F63C9";   // violet
const C5 = "B23A6B";   // magenta
const CLASSCOL = [C1, C2, C3, C4, C5];

const HF = "Cambria";        // headings
const BF = "Calibri";        // body
const MF = "Courier New";    // code

/* ---------------- deterministic RNG ---------------- */
let _seed = 20260817;
function rnd() { _seed = (_seed * 1103515245 + 12345) % 2147483648; return _seed / 2147483648; }
function gauss(mu, sd) { return mu + sd * (rnd() + rnd() + rnd() + rnd() - 2) * 1.2; }

/* ---------------- helpers ---------------- */
function shadow() {
  return { type: "outer", angle: 90, blur: 14, offset: 0.06, color: "1A1633", opacity: 0.12 };
}

function card(s, x, y, w, h, fill, opts) {
  opts = opts || {};
  const o = {
    x: x, y: y, w: w, h: h, rectRadius: 0.10,
    fill: { color: fill },
    line: { color: opts.border || fill, width: opts.border ? 1 : 0.75 }
  };
  if (opts.shadow) o.shadow = shadow();
  s.addShape(pres.ShapeType.roundRect, o);
}

function dot(s, x, y, d, col, opts) {
  opts = opts || {};
  const o = { x: x, y: y, w: d, h: d, fill: { color: col }, line: { color: opts.border || col, width: opts.border ? 1.25 : 0 } };
  if (opts.transparency) o.fill.transparency = opts.transparency;
  s.addShape(pres.ShapeType.ellipse, o);
}

/* numbered / lettered badge used as the repeating motif */
function badge(s, x, y, d, label, fillCol, txtCol, fs) {
  dot(s, x, y, d, fillCol);
  s.addText(label, {
    x: x, y: y, w: d, h: d, align: "center", valign: "middle", margin: 0,
    fontFace: BF, fontSize: fs || 13, bold: true, color: txtCol || WHITE
  });
}

function slideLight(title, kicker) {
  const s = pres.addSlide();
  s.background = { color: WHITE };
  let ty = 0.46;
  if (kicker) {
    s.addText(kicker.toUpperCase(), {
      x: M, y: 0.40, w: CW, h: 0.26, margin: 0,
      fontFace: BF, fontSize: 11, bold: true, color: C1, charSpacing: 2
    });
    ty = 0.70;
  }
  if (title) {
    s.addText(title, {
      x: M, y: ty, w: CW, h: 0.66, margin: 0, valign: "top",
      fontFace: HF, fontSize: 29, bold: true, color: INK
    });
  }
  return s;
}

function slideDark(title, kicker) {
  const s = pres.addSlide();
  s.background = { color: NAVY };
  let ty = 0.46;
  if (kicker) {
    s.addText(kicker.toUpperCase(), {
      x: M, y: 0.40, w: CW, h: 0.26, margin: 0,
      fontFace: BF, fontSize: 11, bold: true, color: C3, charSpacing: 2
    });
    ty = 0.70;
  }
  if (title) {
    s.addText(title, {
      x: M, y: ty, w: CW, h: 0.66, margin: 0, valign: "top",
      fontFace: HF, fontSize: 29, bold: true, color: WHITE
    });
  }
  return s;
}

/* full-bleed section divider */
function divider(num, title, subtitle) {
  const s = pres.addSlide();
  s.background = { color: NAVY };
  // scattered motif dots, right side
  for (let i = 0; i < 46; i++) {
    const px = 8.6 + rnd() * 4.2, py = 0.5 + rnd() * 6.5;
    dot(s, px, py, 0.10 + rnd() * 0.13, CLASSCOL[i % 5], { transparency: 45 });
  }
  badge(s, M, 2.20, 0.86, num, C3, NAVY, 30);
  s.addText(title, {
    x: M, y: 3.28, w: 7.4, h: 1.05, margin: 0, valign: "top",
    fontFace: HF, fontSize: 40, bold: true, color: WHITE
  });
  s.addText(subtitle, {
    x: M, y: 4.42, w: 7.0, h: 0.8, margin: 0, valign: "top",
    fontFace: BF, fontSize: 16, color: "C9C4E6"
  });
  return s;
}

/* body paragraph */
function body(s, x, y, w, h, text, opts) {
  opts = opts || {};
  s.addText(text, {
    x: x, y: y, w: w, h: h, margin: 0, valign: opts.valign || "top",
    fontFace: BF, fontSize: opts.fs || 14.5, color: opts.color || INK,
    lineSpacing: opts.lineSpacing || 21, align: opts.align || "left",
    bold: opts.bold || false, italic: opts.italic || false
  });
}

/* bulleted list */
function bullets(s, x, y, w, h, items, opts) {
  opts = opts || {};
  const runs = items.map(function (t, i) {
    const isObj = typeof t === "object";
    return {
      text: isObj ? t.text : t,
      options: {
        bullet: { indent: 16 }, breakLine: i < items.length - 1,
        paraSpaceAfter: opts.gap === undefined ? 8 : opts.gap,
        bold: isObj ? !!t.bold : false,
        color: isObj && t.color ? t.color : (opts.color || INK)
      }
    };
  });
  s.addText(runs, {
    x: x, y: y, w: w, h: h, margin: 0, valign: "top",
    fontFace: BF, fontSize: opts.fs || 14, color: opts.color || INK, lineSpacing: opts.lineSpacing || 20
  });
}

/* code block: array of [ [text,colour], ... ] rows */
function codeBlock(s, x, y, w, h, rows, opts) {
  opts = opts || {};
  card(s, x, y, w, h, opts.bg || "221D48");
  const runs = [];
  rows.forEach(function (row, ri) {
    const parts = Array.isArray(row[0]) ? row : [row];
    parts.forEach(function (p, pi) {
      runs.push({
        text: p[0],
        options: {
          color: p[1] || "E8E6F5",
          bold: !!p[2],
          breakLine: (pi === parts.length - 1) && (ri < rows.length - 1)
        }
      });
    });
  });
  s.addText(runs, {
    x: x + 0.24, y: y + 0.18, w: w - 0.48, h: h - 0.36, margin: 0, valign: "top",
    fontFace: MF, fontSize: opts.fs || 11.5, lineSpacing: opts.lineSpacing || 16.5
  });
}
const CODE_KW = "F2A65A", CODE_FN = "6FD3C7", CODE_CM = "8B86AD", CODE_ST = "E0A3C4", CODE_TX = "E8E6F5";

/* simple table */
function table(s, x, y, w, cols, rows, opts) {
  opts = opts || {};
  const rowH = opts.rowH || 0.42, headH = opts.headH || 0.44;
  const total = cols.reduce(function (a, b) { return a + b.w; }, 0);
  // header
  s.addShape(pres.ShapeType.rect, { x: x, y: y, w: w, h: headH, fill: { color: NAVY }, line: { color: NAVY, width: 0 } });
  let cx = x;
  cols.forEach(function (c) {
    const cwid = w * c.w / total;
    s.addText(c.t, {
      x: cx + 0.14, y: y, w: cwid - 0.24, h: headH, margin: 0, valign: "middle",
      fontFace: BF, fontSize: opts.headFs || 11.5, bold: true, color: WHITE, align: c.align || "left"
    });
    cx += cwid;
  });
  // rows
  rows.forEach(function (r, ri) {
    const ry = y + headH + ri * rowH;
    s.addShape(pres.ShapeType.rect, {
      x: x, y: ry, w: w, h: rowH,
      fill: { color: ri % 2 === 0 ? WHITE : TINT }, line: { color: LINE, width: 0.6 }
    });
    let rx = x;
    cols.forEach(function (c, ci) {
      const cwid = w * c.w / total;
      const cell = r[ci];
      const isObj = typeof cell === "object" && cell !== null;
      s.addText(isObj ? cell.t : cell, {
        x: rx + 0.14, y: ry, w: cwid - 0.24, h: rowH, margin: 0, valign: "middle",
        fontFace: BF, fontSize: opts.fs || 11,
        color: isObj && cell.color ? cell.color : INK,
        bold: (isObj && cell.bold) || ci === 0 && !!opts.boldFirst,
        align: c.align || "left"
      });
      rx += cwid;
    });
  });
  return y + headH + rows.length * rowH;
}

function footnote(s, text, dark) {
  s.addText(text, {
    x: M, y: H - 0.66, w: CW, h: 0.5, margin: 0, valign: "top",
    fontFace: BF, fontSize: 9.5, italic: true, color: dark ? "8F89B8" : FAINT
  });
}

/* =================================================================
   SLIDE 1 - TITLE
================================================================= */
(function () {
  const s = pres.addSlide();
  s.background = { color: NAVY };

  // motif: a cloud of individuals resolving into three coloured classes
  const centres = [[10.05, 2.05, C1], [11.55, 3.65, C2], [9.85, 5.15, C3]];
  centres.forEach(function (c) {
    for (let i = 0; i < 26; i++) {
      dot(s, gauss(c[0], 0.52), gauss(c[1], 0.46), 0.11 + rnd() * 0.09, c[2], { transparency: 20 });
    }
  });
  for (let i = 0; i < 22; i++) {
    dot(s, 8.7 + rnd() * 4.3, 0.5 + rnd() * 6.5, 0.09 + rnd() * 0.06, "6B6797", { transparency: 55 });
  }

  s.addText("A GENTLE INTRODUCTION  ·  WITH HANDS-ON PRACTICE", {
    x: M, y: 1.62, w: 8.0, h: 0.3, margin: 0,
    fontFace: BF, fontSize: 12, bold: true, color: C3, charSpacing: 2
  });
  s.addText("Latent Class Analysis", {
    x: M, y: 2.08, w: 8.2, h: 0.85, margin: 0, valign: "top",
    fontFace: HF, fontSize: 40, bold: true, color: WHITE
  });
  s.addText("& Latent Profile Analysis", {
    x: M, y: 2.86, w: 8.2, h: 0.85, margin: 0, valign: "top",
    fontFace: HF, fontSize: 40, bold: true, color: C3
  });
  s.addText("Finding hidden subgroups in survey, cohort and health data — what the two methods are, how they differ, and how to run one yourself in R.", {
    x: M, y: 3.92, w: 7.5, h: 1.0, margin: 0, valign: "top",
    fontFace: BF, fontSize: 15.5, color: "C9C4E6", lineSpacing: 23
  });
  s.addText("Seminar deck  ·  approx. 60 minutes  ·  no prior knowledge assumed", {
    x: M, y: 5.30, w: 7.5, h: 0.3, margin: 0,
    fontFace: BF, fontSize: 12, color: "8F89B8"
  });
  s.addNotes("Welcome. This deck assumes no prior knowledge of mixture models. Part 2 is the section that deals directly with the LCA vs LPA confusion, and Part 5 is a hands-on practical you can run on your own laptop in R.");
})();

/* =================================================================
   SLIDE 2 - WHAT YOU WILL LEAVE WITH
================================================================= */
(function () {
  const s = slideLight("What you should be able to do by the end", "Aims");
  const items = [
    ["1", C1, "Explain the idea", "Say, in plain words, what a latent variable is and what a latent class is — without reaching for jargon."],
    ["2", C2, "Tell LCA from LPA", "Look at your own variables and know immediately which of the two methods applies, and why."],
    ["3", C3, "Judge a model", "Read a fit table — BIC, entropy, BLRT, class sizes — and defend your choice of how many classes."],
    ["4", C4, "Run one yourself", "Fit, plot and interpret both an LCA and an LPA in R using the practical script that comes with this deck."]
  ];
  const y0 = 1.62, gap = 1.36;
  items.forEach(function (it, i) {
    const y = y0 + i * gap;
    card(s, M, y, CW, 1.18, i % 2 === 0 ? TINT : WHITE, { border: LINE });
    badge(s, M + 0.30, y + 0.33, 0.52, it[0], it[1], WHITE, 17);
    s.addText(it[2], { x: M + 1.02, y: y + 0.22, w: 3.0, h: 0.34, margin: 0, fontFace: BF, fontSize: 15, bold: true, color: INK });
    s.addText(it[3], { x: M + 1.02, y: y + 0.59, w: 10.6, h: 0.42, margin: 0, fontFace: BF, fontSize: 12.5, color: MUTED });
  });
  s.addNotes("Aims. Point 2 is the one most people come for — the LCA/LPA distinction is the single most common source of confusion in this area, and it has a one-line answer.");
})();

/* =================================================================
   SLIDE 3 - ROADMAP
================================================================= */
(function () {
  const s = slideLight("Where we are going", "Roadmap");
  const parts = [
    ["1", C1, "Foundations", "Clustering · latent variables · latent classes", "~15 min"],
    ["2", C2, "LCA vs LPA", "The distinction, in one question", "~10 min"],
    ["3", C3, "Real studies", "Three published examples", "~8 min"],
    ["4", C4, "The five steps", "How a model is actually built", "~15 min"],
    ["5", C5, "Practical", "Run it yourself in R", "~12 min"]
  ];
  const cw = 2.30, gp = (CW - 5 * cw) / 4;
  parts.forEach(function (p, i) {
    const x = M + i * (cw + gp);
    card(s, x, 1.85, cw, 3.35, WHITE, { border: LINE, shadow: true });
    dot(s, x + cw / 2 - 0.30, 2.15, 0.60, p[1]);
    s.addText(p[0], { x: x + cw / 2 - 0.30, y: 2.15, w: 0.60, h: 0.60, margin: 0, align: "center", valign: "middle", fontFace: BF, fontSize: 20, bold: true, color: WHITE });
    s.addText(p[2], { x: x + 0.20, y: 2.95, w: cw - 0.40, h: 0.62, margin: 0, align: "center", valign: "top", fontFace: HF, fontSize: 16, bold: true, color: INK });
    s.addText(p[3], { x: x + 0.20, y: 3.62, w: cw - 0.40, h: 1.0, margin: 0, align: "center", valign: "top", fontFace: BF, fontSize: 12, color: MUTED, lineSpacing: 17 });
    s.addText(p[4], { x: x + 0.20, y: 4.72, w: cw - 0.40, h: 0.3, margin: 0, align: "center", fontFace: BF, fontSize: 10.5, bold: true, color: p[1] });
  });
  card(s, M, 5.55, CW, 0.92, TINT2, { border: LINE });
  s.addText([
    { text: "One idea runs through all five parts:  ", options: { color: MUTED } },
    { text: "people are not all the same, and the groups that matter are usually not labelled in your dataset.", options: { bold: true, color: INK } }
  ], { x: M + 0.35, y: 5.55, w: CW - 0.7, h: 0.92, margin: 0, valign: "middle", fontFace: BF, fontSize: 14 });
  s.addNotes("Roadmap. Parts 1-4 follow the standard introductory seminar; Part 2 and Part 5 are the additions - the LCA/LPA comparison and the hands-on component.");
})();

/* =================================================================
   PART 1 DIVIDER
================================================================= */
divider("1", "Foundations", "Three ideas you need before the method makes any sense at all: clustering, latent variables, and latent classes.");

/* =================================================================
   SLIDE - THE STARTING PROBLEM
================================================================= */
(function () {
  const s = slideLight("You have 800 people and 40 questions. Now what?", "The problem");
  body(s, M, 1.55, 5.6, 2.4,
    "A dataset is a rectangle of numbers. Averages describe the rectangle as though everyone in it were the same person — but they rarely are.\n\nUnderneath the average there are usually distinct kinds of people, each with their own pattern of answers. Nothing in the data tells you they are there, and no column holds their names.",
    { fs: 14.5, lineSpacing: 23, color: INK });

  card(s, M, 4.42, 5.6, 2.10, TINT, { border: LINE });
  s.addText("The question every mixture model asks", { x: M + 0.28, y: 4.68, w: 5.05, h: 0.3, margin: 0, fontFace: BF, fontSize: 11, bold: true, color: C1, charSpacing: 1 });
  s.addText("“Are there hidden groups here — and if so, who is in them?”", { x: M + 0.28, y: 5.02, w: 5.05, h: 1.3, margin: 0, valign: "top", fontFace: HF, fontSize: 17, bold: true, color: INK, lineSpacing: 22 });

  // raw undifferentiated scatter
  const px = 6.85, py = 1.55, pw = 5.9, ph = 4.97;
  card(s, px, py, pw, ph, WHITE, { border: LINE });
  const pts = [];
  [[0.20, 0.24], [0.46, 0.74], [0.80, 0.29]].forEach(function (c) {
    for (let i = 0; i < 34; i++) pts.push([Math.min(0.96, Math.max(0.04, gauss(c[0], 0.075))), Math.min(0.94, Math.max(0.06, gauss(c[1], 0.085)))]);
  });
  pts.forEach(function (p) {
    dot(s, px + 0.55 + p[0] * (pw - 1.05), py + 0.42 + (1 - p[1]) * (ph - 1.25), 0.13, "8E89AE", { transparency: 15 });
  });
  s.addText("Every dot is one person", { x: px + 0.5, y: py + 0.12, w: pw - 0.8, h: 0.28, margin: 0, fontFace: BF, fontSize: 11, bold: true, color: MUTED });
  s.addText("Cups of coffee per day →", { x: px + 0.55, y: py + ph - 0.42, w: pw - 1.0, h: 0.28, margin: 0, fontFace: BF, fontSize: 10.5, color: FAINT, align: "center" });
  s.addText("Love of mornings", { x: px - 0.72, y: py + ph / 2 - 0.4, w: 1.9, h: 0.28, margin: 0, fontFace: BF, fontSize: 10.5, color: FAINT, align: "center", rotate: 270 });
  s.addNotes("Set-up slide. The scatter deliberately looks like noise. Ask the room what they can see - the honest answer is 'not much'.");
})();

/* =================================================================
   SLIDE - CONCEPT 1: CLUSTERING
================================================================= */
(function () {
  const s = slideLight("Grouping people who answer alike", "Concept 1 of 3 · Clustering");
  body(s, M, 1.52, 5.6, 0.9,
    "Clustering just means putting people into groups on the basis of shared characteristics. Look at the same scatter again — now the structure is obvious.",
    { fs: 14, lineSpacing: 21, color: MUTED });

  const px = M, py = 2.55, pw = 5.6, ph = 3.85;
  card(s, px, py, pw, ph, WHITE, { border: LINE });
  const cl = [[0.20, 0.24, C1], [0.46, 0.76, C2], [0.82, 0.28, C3]];
  cl.forEach(function (c) {
    for (let i = 0; i < 30; i++) {
      const gx = Math.min(0.95, Math.max(0.05, gauss(c[0], 0.072)));
      const gy = Math.min(0.93, Math.max(0.07, gauss(c[1], 0.082)));
      dot(s, px + 0.45 + gx * (pw - 0.95), py + 0.30 + (1 - gy) * (ph - 1.05), 0.13, c[2], { transparency: 12 });
    }
  });
  s.addText("Cups of coffee per day →", { x: px + 0.45, y: py + ph - 0.40, w: pw - 0.9, h: 0.26, margin: 0, fontFace: BF, fontSize: 10.5, color: FAINT, align: "center" });

  const groups = [
    [C1, "Night owls", "Hate the morning, barely drink coffee. Low on both."],
    [C2, "Early risers", "Love the morning, moderate coffee. Cheerful at 7am."],
    [C3, "Coffee-dependent", "Hate the morning, enormous coffee intake. The pattern that averages hide."]
  ];
  groups.forEach(function (g, i) {
    const y = 2.55 + i * 1.31;
    card(s, 6.65, y, CW - 6.03, 1.15, TINT, { border: LINE });
    dot(s, 6.90, y + 0.41, 0.32, g[0]);
    s.addText(g[1], { x: 7.36, y: y + 0.20, w: 5.3, h: 0.32, margin: 0, fontFace: BF, fontSize: 14.5, bold: true, color: INK });
    s.addText(g[2], { x: 7.36, y: y + 0.58, w: 5.3, h: 0.48, margin: 0, fontFace: BF, fontSize: 12, color: MUTED });
  });
  footnote(s, "Two questions were enough here. Real studies use 6–15 indicators, which is exactly why the groups stop being visible by eye.");
  s.addNotes("Same 100 people, same two axes - only the colouring has changed. The point: clustering is not exotic, it is what your eye already wanted to do.");
})();

/* =================================================================
   SLIDE - CONCEPT 2: LATENT VARIABLES
================================================================= */
(function () {
  const s = slideLight("Some things cannot be measured directly", "Concept 2 of 3 · Latent variables");

  card(s, M, 1.55, 5.85, 2.35, TINT, { border: LINE });
  s.addText("MANIFEST  (observed)", { x: M + 0.32, y: 1.76, w: 5.2, h: 0.28, margin: 0, fontFace: BF, fontSize: 11, bold: true, color: C2, charSpacing: 1.5 });
  s.addText("You can put an instrument on it.", { x: M + 0.32, y: 2.08, w: 5.2, h: 0.32, margin: 0, fontFace: BF, fontSize: 13.5, color: INK });
  bullets(s, M + 0.32, 2.50, 5.2, 1.25,
    ["Height — tape measure", "Body temperature — thermometer", "Blood pressure — sphygmomanometer", "Age — date of birth"],
    { fs: 12.5, gap: 3, color: MUTED });

  card(s, 6.86, 1.55, 5.85, 2.35, "F7EFEC", { border: "E9CFC7" });
  s.addText("LATENT  (unobserved)", { x: 7.18, y: 1.76, w: 5.2, h: 0.28, margin: 0, fontFace: BF, fontSize: 11, bold: true, color: C1, charSpacing: 1.5 });
  s.addText("No instrument exists. You infer it.", { x: 7.18, y: 2.08, w: 5.2, h: 0.32, margin: 0, fontFace: BF, fontSize: 13.5, color: INK });
  bullets(s, 7.18, 2.50, 5.2, 1.25,
    ["Depression", "Mental wellbeing", "Socio-economic disadvantage", "Motivation, resilience, stigma"],
    { fs: 12.5, gap: 3, color: MUTED });

  card(s, M, 4.15, CW, 1.05, NAVY);
  s.addText([
    { text: "The definition.  ", options: { bold: true, color: C3 } },
    { text: "A latent variable is something you cannot see or measure, but which you believe exists because it moves things you ", options: { color: WHITE } },
    { text: "can", options: { color: WHITE, italic: true } },
    { text: " see.", options: { color: WHITE } }
  ], { x: M + 0.35, y: 4.15, w: CW - 0.7, h: 1.05, margin: 0, valign: "middle", fontFace: BF, fontSize: 15, lineSpacing: 21 });

  card(s, M, 5.45, CW, 1.20, TINT2, { border: LINE });
  s.addText("The ghost under the bedsheet", { x: M + 0.35, y: 5.60, w: 5.4, h: 0.3, margin: 0, fontFace: BF, fontSize: 13, bold: true, color: INK });
  s.addText("You never see the ghost. You see the sheet moving — and the movement is systematic enough that “something is under there” is the sensible conclusion. Your questionnaire items are the sheet; the construct is the ghost.",
    { x: M + 0.35, y: 5.92, w: CW - 0.7, h: 0.62, margin: 0, valign: "top", fontFace: BF, fontSize: 12.5, color: MUTED, lineSpacing: 17 });
  s.addNotes("Latent vs manifest. The ghost analogy is worth labouring - it is the single image people remember six months later.");
})();

/* =================================================================
   SLIDE - LATENT VARIABLE IN ACTION: DEPRESSION
================================================================= */
(function () {
  const s = slideLight("How you get at something you cannot see", "Worked example · Depression");
  body(s, M, 1.50, CW, 0.42,
    "You cannot measure depression with a tape measure. But depression leaves fingerprints across several domains — so you ask about the fingerprints, and reason back to the cause.",
    { fs: 13.5, color: MUTED, lineSpacing: 19 });

  const doms = [
    [C1, "Thought", "Negative thought patterns, hopelessness, worthlessness"],
    [C2, "Mood", "Persistent sadness, emptiness, loss of pleasure"],
    [C3, "Social", "Withdrawal, strained relationships, isolation"],
    [C4, "Behaviour", "Dropping activities that once brought joy"],
    [C5, "Physical", "Fatigue, disturbed sleep, appetite change"]
  ];
  const cw2 = 2.30, gp2 = (CW - 5 * cw2) / 4;
  doms.forEach(function (d, i) {
    const x = M + i * (cw2 + gp2);
    card(s, x, 2.20, cw2, 1.60, WHITE, { border: LINE, shadow: true });
    dot(s, x + 0.22, 2.42, 0.30, d[0]);
    s.addText(d[1], { x: x + 0.60, y: 2.44, w: cw2 - 0.75, h: 0.28, margin: 0, valign: "middle", fontFace: BF, fontSize: 13.5, bold: true, color: INK });
    s.addText(d[2], { x: x + 0.22, y: 2.86, w: cw2 - 0.44, h: 0.82, margin: 0, valign: "top", fontFace: BF, fontSize: 11, color: MUTED, lineSpacing: 15 });
    // connector down to the construct band
    s.addShape(pres.ShapeType.rect, { x: x + cw2 / 2 - 0.015, y: 3.80, w: 0.03, h: 0.42, fill: { color: LINE }, line: { color: LINE, width: 0 } });
  });

  card(s, M, 4.22, CW, 0.78, NAVY);
  s.addText("↑  observed answers      ·      DEPRESSION  —  the latent variable      ·      inferred, never measured  ↑",
    { x: M, y: 4.22, w: CW, h: 0.78, margin: 0, align: "center", valign: "middle", fontFace: BF, fontSize: 14, bold: true, color: WHITE });

  card(s, M, 5.24, CW, 1.55, TINT, { border: LINE });
  s.addText("Two different ways to model the same construct", { x: M + 0.35, y: 5.40, w: 6.0, h: 0.3, margin: 0, fontFace: BF, fontSize: 12.5, bold: true, color: INK });
  s.addText([
    { text: "As a dimension:  ", options: { bold: true, color: C2 } },
    { text: "everyone sits somewhere on a line from “not depressed” to “severely depressed”. That is factor analysis / IRT.", options: { color: MUTED } },
    { text: "\nAs categories:  ", options: { bold: true, color: C1 } },
    { text: "people fall into distinct types — atypical, melancholic, seasonal, comorbid-with-anxiety. That is LCA / LPA, and it is the road we take from here.", options: { color: MUTED } }
  ], { x: M + 0.35, y: 5.72, w: CW - 0.7, h: 1.02, margin: 0, valign: "top", fontFace: BF, fontSize: 12.5, lineSpacing: 18 });
  s.addNotes("This slide does double duty: it shows how indicators relate to a construct, and it plants the dimension-vs-category fork that Concept 3 resolves.");
})();

/* =================================================================
   SLIDE - CONCEPT 3: LATENT CLASSES
================================================================= */
(function () {
  const s = slideLight("Sometimes “more or less” is the wrong question", "Concept 3 of 3 · Latent classes");
  body(s, M, 1.50, CW, 0.40,
    "A latent variable does not have to be continuous. Sometimes people are better described by which type they are than by how much of something they have.",
    { fs: 13.5, color: MUTED, lineSpacing: 19 });

  /* left: continuum */
  card(s, M, 2.15, 6.0, 2.35, TINT, { border: LINE });
  s.addText("A DIMENSION — how much?", { x: M + 0.3, y: 2.34, w: 5.4, h: 0.28, margin: 0, fontFace: BF, fontSize: 11, bold: true, color: C2, charSpacing: 1.5 });
  s.addShape(pres.ShapeType.rect, { x: M + 0.55, y: 3.30, w: 5.0, h: 0.055, fill: { color: "B9B4CE" }, line: { color: "B9B4CE", width: 0 } });
  for (let i = 0; i < 44; i++) {
    const t = Math.min(1, Math.max(0, gauss(0.5, 0.19)));
    dot(s, M + 0.50 + t * 5.0, 3.02 + rnd() * 0.52, 0.115, C2, { transparency: 25 });
  }
  s.addText("none", { x: M + 0.42, y: 3.46, w: 1.2, h: 0.26, margin: 0, fontFace: BF, fontSize: 10.5, color: FAINT });
  s.addText("severe", { x: M + 4.45, y: 3.46, w: 1.2, h: 0.26, margin: 0, fontFace: BF, fontSize: 10.5, color: FAINT, align: "right" });
  s.addText("Differences are of degree. Everyone is on the same line.", { x: M + 0.3, y: 3.84, w: 5.4, h: 0.45, margin: 0, valign: "top", fontFace: BF, fontSize: 12, color: MUTED, lineSpacing: 16 });

  /* right: classes */
  card(s, 6.98, 2.15, 5.73, 2.35, "FAF3F1", { border: "EBD5CD" });
  s.addText("CLASSES — which kind?", { x: 7.28, y: 2.34, w: 5.1, h: 0.28, margin: 0, fontFace: BF, fontSize: 11, bold: true, color: C1, charSpacing: 1.5 });
  [[7.55, C1], [9.42, C3], [11.28, C4]].forEach(function (g) {
    for (let i = 0; i < 15; i++) dot(s, gauss(g[0], 0.30), gauss(3.22, 0.24), 0.115, g[1], { transparency: 15 });
  });
  s.addText("Differences are of kind. Membership is separate and meaningful.", { x: 7.28, y: 3.84, w: 5.1, h: 0.45, margin: 0, valign: "top", fontFace: BF, fontSize: 12, color: MUTED, lineSpacing: 16 });

  /* personality illustration */
  const per = [
    [C1, "Introvert", "Low social activity · low energy in groups · prefers time alone"],
    [C3, "Ambivert", "Moderate on everything · shifts with the situation"],
    [C4, "Extravert", "High social activity · high group energy · prefers large gatherings"]
  ];
  s.addText("An everyday example — personality type from survey answers", { x: M, y: 4.72, w: CW, h: 0.3, margin: 0, fontFace: BF, fontSize: 12.5, bold: true, color: INK });
  const pw3 = (CW - 2 * 0.28) / 3;
  per.forEach(function (p, i) {
    const x = M + i * (pw3 + 0.28);
    card(s, x, 5.12, pw3, 1.42, WHITE, { border: LINE, shadow: true });
    dot(s, x + 0.26, 5.36, 0.30, p[0]);
    s.addText(p[1], { x: x + 0.66, y: 5.38, w: pw3 - 0.85, h: 0.28, margin: 0, valign: "middle", fontFace: BF, fontSize: 14, bold: true, color: INK });
    s.addText(p[2], { x: x + 0.26, y: 5.78, w: pw3 - 0.52, h: 0.62, margin: 0, valign: "top", fontFace: BF, fontSize: 11.5, color: MUTED, lineSpacing: 15 });
  });
  s.addNotes("Key teaching point: neither picture is 'right'. Whether a construct is better modelled as a dimension or as classes is a theoretical decision that you defend, not something the data settles for you.");
})();

/* =================================================================
   SLIDE - SO WHAT IS LCA
================================================================= */
(function () {
  const s = slideDark("So — what is latent class analysis?", "Putting it together");
  card(s, M, 1.55, CW, 1.32, NAVY2);
  s.addText([
    { text: "A statistical method that uses patterns in observed answers to identify hidden subgroups of people — subgroups that share a characteristic profile, and that no variable in your dataset labels.", options: {} }
  ], { x: M + 0.45, y: 1.55, w: CW - 0.9, h: 1.32, margin: 0, valign: "middle", fontFace: HF, fontSize: 19, bold: true, color: WHITE, lineSpacing: 27 });

  const props = [
    [C3, "It is model-based", "There is an actual probability model behind it — so you get fit statistics, standard errors, and principled ways to compare solutions."],
    [C2, "Membership is probabilistic", "Nobody is simply “in class 2”. Each person gets a posterior probability of belonging to each class — 0.91 / 0.07 / 0.02."],
    [C1, "Classes are qualitative", "They differ in pattern, not just in level. Class 3 is not “more” than class 2; it is a different shape."],
    [C4, "You choose the number", "The model will not tell you there are four classes. It tells you how well four fits, and you argue the case."]
  ];
  const pw4 = (CW - 3 * 0.26) / 4;
  props.forEach(function (p, i) {
    const x = M + i * (pw4 + 0.26);
    card(s, x, 3.15, pw4, 2.90, NAVY2);
    dot(s, x + 0.26, 3.42, 0.30, p[0]);
    s.addText(p[1], { x: x + 0.26, y: 3.86, w: pw4 - 0.52, h: 0.60, margin: 0, valign: "top", fontFace: BF, fontSize: 14, bold: true, color: WHITE });
    s.addText(p[2], { x: x + 0.26, y: 4.50, w: pw4 - 0.52, h: 1.42, margin: 0, valign: "top", fontFace: BF, fontSize: 11.5, color: "C4BFE0", lineSpacing: 16 });
  });
  footnote(s, "Technically: LCA is a finite mixture model. “Mixture” because your sample is treated as a mixture of several unobserved populations, blended together in unknown proportions.", true);
  s.addNotes("Four properties. The third is what separates LCA from a simple severity score, and the fourth is what makes the method feel uncomfortable to people used to p-values deciding things for them.");
})();

/* =================================================================
   PART 2 DIVIDER
================================================================= */
divider("2", "LCA vs LPA", "The part everyone gets stuck on — and it has a one-sentence answer.");

/* =================================================================
   SLIDE - THE ONE QUESTION
================================================================= */
(function () {
  const s = slideLight("There is only one question you have to answer", "The distinction");

  card(s, M, 1.50, CW, 1.45, NAVY);
  s.addText("What kind of variables are you feeding into the model?", {
    x: M + 0.45, y: 1.50, w: CW - 0.9, h: 1.45, margin: 0, valign: "middle",
    fontFace: HF, fontSize: 28, bold: true, color: WHITE
  });

  /* two answers */
  card(s, M, 3.22, 6.0, 2.42, "FAF3F1", { border: "EBD5CD", shadow: true });
  s.addText("CATEGORICAL", { x: M + 0.35, y: 3.44, w: 5.3, h: 0.3, margin: 0, fontFace: BF, fontSize: 11.5, bold: true, color: C1, charSpacing: 1.5 });
  s.addText("Yes / No  ·  Never / Sometimes / Often  ·  Agree / Disagree", { x: M + 0.35, y: 3.76, w: 5.3, h: 0.32, margin: 0, fontFace: BF, fontSize: 13, color: MUTED });
  s.addText("→  Latent Class Analysis", { x: M + 0.35, y: 4.20, w: 5.3, h: 0.5, margin: 0, valign: "top", fontFace: HF, fontSize: 25, bold: true, color: C1 });
  s.addText("Classes are described by the probability of endorsing each item.", { x: M + 0.35, y: 4.84, w: 5.3, h: 0.62, margin: 0, valign: "top", fontFace: BF, fontSize: 12, color: MUTED, lineSpacing: 16 });

  card(s, 6.98, 3.22, 5.73, 2.42, "EDF6F4", { border: "C7E3DE", shadow: true });
  s.addText("CONTINUOUS", { x: 7.33, y: 3.44, w: 5.1, h: 0.3, margin: 0, fontFace: BF, fontSize: 11.5, bold: true, color: C2, charSpacing: 1.5 });
  s.addText("PHQ-9 total  ·  wellbeing score  ·  BMI  ·  hours of sleep", { x: 7.33, y: 3.76, w: 5.1, h: 0.32, margin: 0, fontFace: BF, fontSize: 13, color: MUTED });
  s.addText("→  Latent Profile Analysis", { x: 7.33, y: 4.20, w: 5.1, h: 0.5, margin: 0, valign: "top", fontFace: HF, fontSize: 25, bold: true, color: C2 });
  s.addText("Profiles are described by the mean (and variance) on each indicator.", { x: 7.33, y: 4.84, w: 5.1, h: 0.62, margin: 0, valign: "top", fontFace: BF, fontSize: 12, color: MUTED, lineSpacing: 16 });

  card(s, M, 5.92, CW, 0.86, TINT2, { border: LINE });
  s.addText([
    { text: "That is the whole difference. ", options: { bold: true, color: INK } },
    { text: "Same model, same logic, same output structure, same fit statistics, same five steps — only the measurement level of your indicators changes.", options: { color: MUTED } }
  ], { x: M + 0.35, y: 5.92, w: CW - 0.7, h: 0.86, margin: 0, valign: "middle", fontFace: BF, fontSize: 13.5, lineSpacing: 19 });
  s.addNotes("If somebody remembers one slide from this deck, it should be this one. The latent variable is categorical in BOTH methods. What changes is the observed side.");
})();

/* =================================================================
   SLIDE - SIDE BY SIDE TABLE
================================================================= */
(function () {
  const s = slideLight("Side by side", "The distinction · in detail");
  const cols = [
    { t: "", w: 1.15 },
    { t: "LATENT CLASS ANALYSIS  (LCA)", w: 1.45 },
    { t: "LATENT PROFILE ANALYSIS  (LPA)", w: 1.45 }
  ];
  const rows = [
    ["Observed indicators", { t: "Categorical — binary, ordinal, nominal", color: C1, bold: true }, { t: "Continuous — scale scores, totals, means", color: C2, bold: true }],
    ["Latent variable", "Categorical (classes)", "Categorical (profiles)"],
    ["Model family", "Finite mixture model", "Finite mixture model — identical family"],
    ["Distribution assumed within class", "Bernoulli / multinomial per item", "Gaussian per indicator (mean + variance)"],
    ["What defines a group", "Item-response probabilities: P(endorse item | class)", "Profile means, and optionally variances/covariances"],
    ["Typical plot", "Probability profile plot, y-axis 0 to 1", "Mean profile plot, usually on a z-score axis"],
    ["Extra decisions you must make", "Usually none beyond number of classes", "Also: are variances equal across profiles? covariances free?"],
    ["Core assumption", "Local independence — items uncorrelated within a class", "Local independence — indicators uncorrelated within a profile"],
    ["R packages", "poLCA, depmixS4, randomLCA", "tidyLPA, mclust"],
    ["Mplus syntax", "TYPE = MIXTURE;  with CATEGORICAL =", "TYPE = MIXTURE;  indicators left continuous"]
  ];
  table(s, M, 1.42, CW, cols, rows, { rowH: 0.435, headH: 0.46, fs: 11.5, headFs: 11, boldFirst: true });
  footnote(s, "Mixed indicators — some binary, some continuous — are handled by the same machinery, using a different conditional distribution per item.");
  s.addNotes("Walk down the first column. Note rows 2 and 3: the latent variable is categorical in both, and the model family is the same. The only genuinely different row for practice is 'extra decisions' - LPA makes you choose a variance structure.");
})();

/* =================================================================
   SLIDE - THE 2x2 MAP
================================================================= */
(function () {
  const s = slideLight("Where these methods sit relative to each other", "The map");
  body(s, M, 1.42, CW, 0.42,
    "Every latent variable method is one cell of a 2×2: what type is the thing you observe, and what type is the thing you infer? Answer both and the method names itself.",
    { fs: 13.5, color: MUTED, lineSpacing: 19 });

  const x0 = 3.25, y0 = 2.44, cw5 = 4.55, ch5 = 1.68, g5 = 0.20;

  s.addText("OBSERVED  INDICATORS", { x: x0, y: 1.98, w: cw5 * 2 + g5, h: 0.3, margin: 0, align: "center", fontFace: BF, fontSize: 11, bold: true, color: MUTED, charSpacing: 1.5 });
  s.addText("Continuous", { x: x0, y: 2.24, w: cw5, h: 0.28, margin: 0, align: "center", fontFace: BF, fontSize: 12.5, bold: true, color: INK });
  s.addText("Categorical", { x: x0 + cw5 + g5, y: 2.24, w: cw5, h: 0.28, margin: 0, align: "center", fontFace: BF, fontSize: 12.5, bold: true, color: INK });
  s.addText("LATENT  VARIABLE", { x: 0.30, y: 3.75, w: 2.4, h: 0.3, margin: 0, align: "center", fontFace: BF, fontSize: 11, bold: true, color: MUTED, charSpacing: 1.5, rotate: 270 });
  s.addText("Continuous", { x: 1.10, y: y0 + 0.72, w: 2.0, h: 0.3, margin: 0, align: "right", fontFace: BF, fontSize: 12.5, bold: true, color: INK });
  s.addText("Categorical", { x: 1.10, y: y0 + ch5 + g5 + 0.72, w: 2.0, h: 0.3, margin: 0, align: "right", fontFace: BF, fontSize: 12.5, bold: true, color: INK });

  const cells = [
    [x0, y0, "Factor Analysis", "Latent trait, continuous items — e.g. extracting a wellbeing factor from Likert scale scores", TINT, INK, MUTED, false],
    [x0 + cw5 + g5, y0, "Item Response Theory", "Latent trait, categorical items — e.g. ability estimated from right/wrong test answers", TINT, INK, MUTED, false],
    [x0, y0 + ch5 + g5, "Latent Profile Analysis", "Latent categories, continuous indicators", "EDF6F4", INK, MUTED, C2],
    [x0 + cw5 + g5, y0 + ch5 + g5, "Latent Class Analysis", "Latent categories, categorical indicators", "FAF3F1", INK, MUTED, C1]
  ];
  cells.forEach(function (c) {
    card(s, c[0], c[1], cw5, ch5, c[4], { border: c[7] ? c[7] : LINE, shadow: !!c[7] });
    s.addText(c[2], { x: c[0] + 0.30, y: c[1] + 0.28, w: cw5 - 0.6, h: 0.42, margin: 0, valign: "top", fontFace: HF, fontSize: c[7] ? 21 : 18, bold: true, color: c[7] ? c[7] : c[5] });
    s.addText(c[3], { x: c[0] + 0.30, y: c[1] + 0.82, w: cw5 - 0.6, h: 0.75, margin: 0, valign: "top", fontFace: BF, fontSize: 12, color: c[6], lineSpacing: 16 });
  });

  card(s, M, 6.22, CW, 0.78, TINT2, { border: LINE });
  s.addText([
    { text: "Read the bottom row: ", options: { bold: true, color: INK } },
    { text: "LPA and LCA are neighbours in the same row. They share a categorical latent variable and differ only by column.", options: { color: MUTED } }
  ], { x: M + 0.35, y: 6.22, w: CW - 0.7, h: 0.78, margin: 0, valign: "middle", fontFace: BF, fontSize: 13 });
  footnote(s, "");
  s.addNotes("This is the classic Bartholomew classification of latent variable models. It is the fastest cure for LCA/LPA confusion because it shows the two are structurally adjacent, not rival techniques.");
})();

/* =================================================================
   SLIDE - SAME CONSTRUCT, TWO DESIGNS
================================================================= */
(function () {
  const s = slideLight("Same construct — two different methods", "Worked contrast");
  body(s, M, 1.42, CW, 0.40,
    "Suppose you want to find subgroups of students by mental health. Whether you run LCA or LPA is decided entirely by how the questionnaire recorded the answers.",
    { fs: 13.5, color: MUTED, lineSpacing: 19 });

  /* LCA side */
  card(s, M, 2.00, 6.0, 4.55, WHITE, { border: "EBD5CD", shadow: true });
  s.addText("IF YOUR DATA LOOK LIKE THIS", { x: M + 0.32, y: 2.20, w: 5.3, h: 0.28, margin: 0, fontFace: BF, fontSize: 10.5, bold: true, color: C1, charSpacing: 1.5 });
  codeBlock(s, M + 0.32, 2.54, 5.36, 1.86, [
    [["  id  lowmood  sleep  fatigue  appetite", CODE_CM]],
    [["   1        1      1        1         0", CODE_TX]],
    [["   2        0      0        0         0", CODE_TX]],
    [["   3        1      0        1         1", CODE_TX]],
    [["                                       ", CODE_TX]],
    [["  # 1 = yes, 0 = no", CODE_CM]]
  ], { fs: 11 });
  s.addText("You run LCA.", { x: M + 0.32, y: 4.54, w: 5.3, h: 0.36, margin: 0, fontFace: HF, fontSize: 19, bold: true, color: C1 });
  s.addText("And a class is reported like this:", { x: M + 0.32, y: 4.96, w: 5.3, h: 0.28, margin: 0, fontFace: BF, fontSize: 12, color: MUTED });
  s.addText([
    { text: "“Class 2 (24% of the sample). Members have a 0.81 probability of reporting sleep problems and 0.76 of reporting fatigue, but only 0.12 of reporting low mood.”", options: {} }
  ], { x: M + 0.32, y: 5.28, w: 5.3, h: 1.15, margin: 0, valign: "top", fontFace: BF, fontSize: 12.5, italic: true, color: INK, lineSpacing: 18 });

  /* LPA side */
  card(s, 6.98, 2.00, 5.73, 4.55, WHITE, { border: "C7E3DE", shadow: true });
  s.addText("IF YOUR DATA LOOK LIKE THIS", { x: 7.30, y: 2.20, w: 5.1, h: 0.28, margin: 0, fontFace: BF, fontSize: 10.5, bold: true, color: C2, charSpacing: 1.5 });
  codeBlock(s, 7.30, 2.54, 5.09, 1.86, [
    [["  id   phq9   gad7  sleepq  stress", CODE_CM]],
    [["   1   17.0   14.0     4.2    22.5", CODE_TX]],
    [["   2    3.0    2.0    12.8     9.1", CODE_TX]],
    [["   3   11.5    6.0     7.4    18.3", CODE_TX]],
    [["                                  ", CODE_TX]],
    [["  # totals and scale scores", CODE_CM]]
  ], { fs: 11 });
  s.addText("You run LPA.", { x: 7.30, y: 4.54, w: 5.1, h: 0.36, margin: 0, fontFace: HF, fontSize: 19, bold: true, color: C2 });
  s.addText("And a profile is reported like this:", { x: 7.30, y: 4.96, w: 5.1, h: 0.28, margin: 0, fontFace: BF, fontSize: 12, color: MUTED });
  s.addText([
    { text: "“Profile 2 (24% of the sample). Members average 1.1 SD above the mean on sleep problems and fatigue, but sit at the sample average on depressed mood.”", options: {} }
  ], { x: 7.30, y: 5.28, w: 5.1, h: 1.15, margin: 0, valign: "top", fontFace: BF, fontSize: 12.5, italic: true, color: INK, lineSpacing: 18 });

  footnote(s, "Notice the two interpretations say the same substantive thing: a somatic subgroup, roughly a quarter of the sample. Probabilities and means are two grammars for one finding.");
  s.addNotes("This is the pay-off slide for the confusion. The same subgroup, found by both methods, described in the two different vocabularies. Read both quotes aloud.");
})();

/* =================================================================
   SLIDE - MYTHS
================================================================= */
(function () {
  const s = slideDark("Six things people get wrong", "Clearing the ground");
  const myths = [
    ["“LCA is just k-means with extra steps.”", "No. k-means hard-assigns using distance and has no model, so no fit statistics, no standard errors, no principled way to compare 3 vs 4 groups. LCA is probabilistic and model-based, and handles missing data properly."],
    ["“Entropy tells me how many classes to keep.”", "No. Entropy measures how cleanly people are classified once you have chosen a solution. It is not a fit index. A 2-class model almost always has lovely entropy — that does not make it right."],
    ["“The classes are real types of people.”", "Careful. Classes are a useful simplification of a messy joint distribution. They may map onto something real; they may just be a convenient summary. Say which you are claiming."],
    ["“More classes fit better, so take the most.”", "Fit does keep improving, which is exactly why you need penalised criteria, an elbow, theory, and a look at class sizes. A 9-class solution with a 1.2% class is not a finding."],
    ["“LPA is a completely different technique.”", "No. Same family, same logic, same workflow. Change your indicators from binary to continuous and you have changed method name without changing anything conceptual."],
    ["“I'll throw everything in and see what happens.”", "This is how you get an uninterpretable model. Indicators define the construct. Covariates and outcomes belong in a separate step (3-step / BCH), not in the measurement model."]
  ];
  const cw6 = (CW - 0.26) / 2, ch6 = 1.62;
  myths.forEach(function (m, i) {
    const x = M + (i % 2) * (cw6 + 0.26);
    const y = 1.55 + Math.floor(i / 2) * (ch6 + 0.24);
    card(s, x, y, cw6, ch6, NAVY2);
    s.addText("✕", { x: x + 0.22, y: y + 0.18, w: 0.34, h: 0.30, margin: 0, align: "center", valign: "middle", fontFace: BF, fontSize: 14, bold: true, color: C1 });
    s.addText(m[0], { x: x + 0.62, y: y + 0.16, w: cw6 - 0.88, h: 0.34, margin: 0, valign: "middle", fontFace: BF, fontSize: 13.5, bold: true, color: C3 });
    s.addText(m[1], { x: x + 0.62, y: y + 0.55, w: cw6 - 0.88, h: 0.98, margin: 0, valign: "top", fontFace: BF, fontSize: 11.5, color: "C4BFE0", lineSpacing: 15.5 });
  });
  s.addNotes("Myth 2 is the one that shows up most often in submitted manuscripts. Myth 6 is the one that wastes the most of people's time.");
})();

/* =================================================================
   PART 3 DIVIDER
================================================================= */
divider("3", "Three real studies", "What the method looks like when it has been used on actual data, and what it bought the authors.");

/* =================================================================
   SLIDE - EXAMPLE 1
================================================================= */
(function () {
  const s = slideLight("Comorbidity in adolescent mental health", "Example 1 · LCA on symptom items");
  const meta = [["Latent construct", "Co-occurring mental health symptoms"], ["Sample", "≈10,000 US adolescents aged 13–18"], ["Indicators", "Presence / absence of disorder symptoms"], ["Solution chosen", "3 classes"]];
  meta.forEach(function (m, i) {
    const x = M + i * ((CW - 3 * 0.22) / 4 + 0.22), w = (CW - 3 * 0.22) / 4;
    card(s, x, 1.42, w, 0.92, TINT, { border: LINE });
    s.addText(m[0].toUpperCase(), { x: x + 0.22, y: 1.55, w: w - 0.44, h: 0.26, margin: 0, fontFace: BF, fontSize: 9.5, bold: true, color: FAINT, charSpacing: 1 });
    s.addText(m[1], { x: x + 0.22, y: 1.82, w: w - 0.44, h: 0.44, margin: 0, valign: "top", fontFace: BF, fontSize: 12.5, bold: true, color: INK, lineSpacing: 15 });
  });

  const cls = [
    [C1, "Emotional disorder class", "High probability of anxiety and depressive symptoms.", "More likely: girls · family instability · low parental education"],
    [C4, "Behavioural disorder class", "High probability of substance misuse, depression and conduct problems.", "More likely: boys · urban residence · social disadvantage"],
    [C2, "Normative class", "Low probability of any mental health problem — the largest group.", "The comparison group against which the others are read"]
  ];
  const cw7 = (CW - 2 * 0.26) / 3;
  cls.forEach(function (c, i) {
    const x = M + i * (cw7 + 0.26);
    card(s, x, 2.60, cw7, 2.58, WHITE, { border: LINE, shadow: true });
    dot(s, x + 0.28, 2.86, 0.34, c[0]);
    s.addText(c[1], { x: x + 0.28, y: 3.32, w: cw7 - 0.56, h: 0.62, margin: 0, valign: "top", fontFace: HF, fontSize: 16, bold: true, color: INK });
    s.addText(c[2], { x: x + 0.28, y: 3.98, w: cw7 - 0.56, h: 0.72, margin: 0, valign: "top", fontFace: BF, fontSize: 12, color: MUTED, lineSpacing: 16 });
    s.addText(c[3], { x: x + 0.28, y: 4.66, w: cw7 - 0.56, h: 0.48, margin: 0, valign: "top", fontFace: BF, fontSize: 11, italic: true, color: c[0], lineSpacing: 14.5 });
  });

  card(s, M, 5.42, CW, 1.10, NAVY);
  s.addText([
    { text: "Why it mattered.  ", options: { bold: true, color: C3 } },
    { text: "The classes were not just descriptive — each had a different demographic and risk profile. The authors argued this supports data-driven screening in schools and child health services: identify the pattern early, rather than waiting for a single diagnosis to declare itself.", options: { color: WHITE } }
  ], { x: M + 0.40, y: 5.42, w: CW - 0.8, h: 1.10, margin: 0, valign: "middle", fontFace: BF, fontSize: 13, lineSpacing: 19 });
  s.addNotes("The important structural point: LCA gives you the classes, and then a second stage relates class membership to covariates like sex, parental education and urbanicity.");
})();

/* =================================================================
   SLIDE - EXAMPLES 2 AND 3
================================================================= */
(function () {
  const s = slideLight("Two more, briefly", "Examples 2 and 3");

  /* Example 2 */
  card(s, M, 1.42, 6.0, 5.20, WHITE, { border: LINE, shadow: true });
  s.addText("EXAMPLE 2 · SUBSTANCE USE", { x: M + 0.34, y: 1.62, w: 5.3, h: 0.28, margin: 0, fontFace: BF, fontSize: 10.5, bold: true, color: C4, charSpacing: 1.5 });
  s.addText("Patterns of drug use and addiction", { x: M + 0.34, y: 1.92, w: 5.3, h: 0.80, margin: 0, valign: "top", fontFace: HF, fontSize: 19, bold: true, color: INK, lineSpacing: 24 });
  bullets(s, M + 0.34, 2.80, 5.3, 1.50, [
    "≈40,000 adults, National Epidemiologic Survey on Alcohol and Related Conditions",
    "Indicators: self-reported use across drug categories",
    "Solution: 5 classes"
  ], { fs: 12, gap: 5, color: MUTED });
  s.addText("The five classes included poly-substance use, prescription-drug dependence, and a stimulant/hallucinogen class.", { x: M + 0.34, y: 4.32, w: 5.3, h: 0.66, margin: 0, valign: "top", fontFace: BF, fontSize: 12, color: INK, lineSpacing: 16 });
  card(s, M + 0.34, 5.06, 5.32, 1.45, TINT, { border: LINE });
  s.addText("Takeaway", { x: M + 0.58, y: 5.20, w: 4.9, h: 0.26, margin: 0, fontFace: BF, fontSize: 10.5, bold: true, color: C4, charSpacing: 1 });
  s.addText("Each class carried a distinct mental health burden and a distinct socio-demographic profile — so “substance misuse” as a single category was hiding five different service needs.", { x: M + 0.58, y: 5.48, w: 4.9, h: 0.95, margin: 0, valign: "top", fontFace: BF, fontSize: 11.5, color: MUTED, lineSpacing: 16 });

  /* Example 3 */
  card(s, 6.98, 1.42, 5.73, 5.20, WHITE, { border: LINE, shadow: true });
  s.addText("EXAMPLE 3 · HEALTH BEHAVIOUR", { x: 7.32, y: 1.62, w: 5.1, h: 0.28, margin: 0, fontFace: BF, fontSize: 10.5, bold: true, color: C3, charSpacing: 1.5 });
  s.addText("Lifestyle patterns in undergraduates", { x: 7.32, y: 1.92, w: 5.1, h: 0.80, margin: 0, valign: "top", fontFace: HF, fontSize: 19, bold: true, color: INK, lineSpacing: 24 });
  bullets(s, 7.32, 2.80, 5.1, 1.50, [
    "≈2,000 students at one large US university",
    "Indicators: sleep, stress, drinking, weight, risk-taking",
    "Solution: 8 classes — four male, four female"
  ], { fs: 12, gap: 5, color: MUTED });
  s.addText("Male classes clustered around riskier behaviour; female classes around more moderate patterns. Risks came bundled, not one at a time.", { x: 7.32, y: 4.32, w: 5.1, h: 0.66, margin: 0, valign: "top", fontFace: BF, fontSize: 12, color: INK, lineSpacing: 16 });
  card(s, 7.32, 5.06, 5.07, 1.45, "FAF3F1", { border: "EBD5CD" });
  s.addText("Read it critically", { x: 7.56, y: 5.20, w: 4.65, h: 0.26, margin: 0, fontFace: BF, fontSize: 10.5, bold: true, color: C1, charSpacing: 1 });
  s.addText("One campus, small n, eight classes, and a binary treatment of gender that has dated badly. A useful reminder that an LCA is only ever as good as its sample and its indicators.", { x: 7.56, y: 5.48, w: 4.65, h: 0.95, margin: 0, valign: "top", fontFace: BF, fontSize: 11.5, color: MUTED, lineSpacing: 16 });
  s.addNotes("Example 3 is included partly as a critique exercise. Eight classes from 2,000 students on one campus is a lot of classes, and the gender split is doing much of the work.");
})();

/* =================================================================
   SLIDE - WHAT THEY HAVE IN COMMON
================================================================= */
(function () {
  const s = slideDark("What all three studies have in common", "The pattern");
  const items = [
    [C3, "They started from a construct, not a dataset", "Comorbidity. Addiction. Lifestyle. In each case the authors knew what they were looking for before they ran anything."],
    [C2, "They found bundles, not single risks", "Problems arrive together. That is precisely what a one-variable-at-a-time analysis cannot show you."],
    [C1, "They linked classes to who people are", "Class membership was related to sex, education, urbanicity, disadvantage — turning a description into an inequalities finding."],
    [C4, "They ended at a service implication", "Screening in schools; five different treatment needs; the failure of one-size-fits-all health promotion."]
  ];
  items.forEach(function (it, i) {
    const y = 1.62 + i * 1.28;
    card(s, M, y, CW, 1.12, NAVY2);
    dot(s, M + 0.32, y + 0.40, 0.32, it[0]);
    s.addText(it[1], { x: M + 0.86, y: y + 0.18, w: 11.0, h: 0.34, margin: 0, fontFace: BF, fontSize: 15, bold: true, color: WHITE });
    s.addText(it[2], { x: M + 0.86, y: y + 0.56, w: 11.0, h: 0.44, margin: 0, valign: "top", fontFace: BF, fontSize: 12.5, color: "C4BFE0" });
  });
  s.addNotes("Use this as the bridge into the how-to section: every one of these four points corresponds to one of the five steps that follow.");
})();

/* =================================================================
   PART 4 DIVIDER
================================================================= */
divider("4", "The five steps", "How a latent class model actually gets built — from a construct, to a fitted model, to a named solution.");

/* =================================================================
   SLIDE - FIVE STEPS OVERVIEW
================================================================= */
(function () {
  const s = slideLight("The workflow, end to end", "Overview");
  const steps = [
    ["1", C1, "Define the construct", "Decide what latent variable you are trying to recover — and read the theory on it first."],
    ["2", C2, "Get the right data", "Find a dataset whose measured items are genuinely good indicators of that construct."],
    ["3", C3, "Fit and assess", "Estimate models, check they converged, and gather goodness-of-fit statistics."],
    ["4", C4, "Choose k", "Compare 1, 2, 3 … class solutions and defend the number you settle on."],
    ["5", C5, "Interpret and name", "Describe each class from its response pattern, and name it honestly."]
  ];
  const cw8 = (CW - 4 * 0.22) / 5;
  steps.forEach(function (st, i) {
    const x = M + i * (cw8 + 0.22);
    card(s, x, 1.70, cw8, 3.55, WHITE, { border: LINE, shadow: true });
    badge(s, x + 0.24, 1.96, 0.54, st[0], st[1], WHITE, 18);
    s.addText(st[2], { x: x + 0.24, y: 2.68, w: cw8 - 0.48, h: 0.85, margin: 0, valign: "top", fontFace: HF, fontSize: 16, bold: true, color: INK, lineSpacing: 21 });
    s.addText(st[3], { x: x + 0.24, y: 3.58, w: cw8 - 0.48, h: 1.45, margin: 0, valign: "top", fontFace: BF, fontSize: 11.5, color: MUTED, lineSpacing: 16 });
    if (i < 4) s.addText("→", { x: x + cw8 + 0.01, y: 3.20, w: 0.20, h: 0.3, margin: 0, align: "center", fontFace: BF, fontSize: 15, bold: true, color: FAINT });
  });
  card(s, M, 5.62, CW, 1.0, TINT2, { border: LINE });
  s.addText([
    { text: "Steps 1 and 5 are where the thinking happens. ", options: { bold: true, color: INK } },
    { text: "Steps 2–4 are craft, and the software does most of the arithmetic. Almost every weak LCA paper is weak because step 1 was skipped and step 5 was rushed.", options: { color: MUTED } }
  ], { x: M + 0.35, y: 5.62, w: CW - 0.7, h: 1.0, margin: 0, valign: "middle", fontFace: BF, fontSize: 13.5, lineSpacing: 19 });
  s.addNotes("Note this workflow is identical for LPA. Nothing in these five steps changes except the conditional distribution the software assumes at step 3.");
})();

/* =================================================================
   SLIDE - STEPS 1 AND 2
================================================================= */
(function () {
  const s = slideLight("Theory first, data second", "Steps 1 and 2");

  card(s, M, 1.42, 6.0, 5.05, WHITE, { border: LINE, shadow: true });
  badge(s, M + 0.34, 1.66, 0.50, "1", C1, WHITE, 17);
  s.addText("Define the latent construct", { x: M + 1.00, y: 1.72, w: 4.7, h: 0.40, margin: 0, valign: "middle", fontFace: HF, fontSize: 21, bold: true, color: INK });
  s.addText("The temptation is to load every variable you have, press run, and see what appears. Resist it — that route produces models nobody can interpret and reviewers do not believe.", { x: M + 0.34, y: 2.32, w: 5.3, h: 0.95, margin: 0, valign: "top", fontFace: BF, fontSize: 12.5, color: MUTED, lineSpacing: 17 });
  s.addText("Before you open the software", { x: M + 0.34, y: 3.34, w: 5.3, h: 0.28, margin: 0, fontFace: BF, fontSize: 11, bold: true, color: C1, charSpacing: 1 });
  bullets(s, M + 0.34, 3.66, 5.3, 2.55, [
    "Write one sentence: “I think there are distinct types of ___.”",
    "Read what has already been found — how many classes do others report?",
    "Decide, and justify, why categories fit this construct better than a dimension",
    "Sketch the classes you expect. Being wrong is fine; being surprised is informative"
  ], { fs: 12, gap: 8, color: MUTED });

  card(s, 6.98, 1.42, 5.73, 5.05, WHITE, { border: LINE, shadow: true });
  badge(s, 7.32, 1.66, 0.50, "2", C2, WHITE, 17);
  s.addText("Choose data and indicators", { x: 7.98, y: 1.72, w: 4.5, h: 0.40, margin: 0, valign: "middle", fontFace: HF, fontSize: 21, bold: true, color: INK });
  s.addText("Your model is only as good as the items feeding it. There is usually some compromise between the construct you want and the questions someone actually asked.", { x: 7.32, y: 2.32, w: 5.1, h: 0.95, margin: 0, valign: "top", fontFace: BF, fontSize: 12.5, color: MUTED, lineSpacing: 17 });
  s.addText("What makes a good indicator set", { x: 7.32, y: 3.34, w: 5.1, h: 0.28, margin: 0, fontFace: BF, fontSize: 11, bold: true, color: C2, charSpacing: 1 });
  bullets(s, 7.32, 3.66, 5.1, 1.55, [
    "6–15 items is the usual working range",
    "Each item taps a different facet — near-duplicates break local independence",
    "Enough variation: an item endorsed by 2% of people carries almost no information"
  ], { fs: 12, gap: 8, color: MUTED });
  card(s, 7.32, 5.44, 5.07, 0.95, TINT, { border: LINE });
  s.addText("In the UK, start with the UK Data Service: the birth cohorts run by the Centre for Longitudinal Studies, Understanding Society, and linked clinical records.", { x: 7.56, y: 5.44, w: 4.6, h: 0.95, margin: 0, valign: "middle", fontFace: BF, fontSize: 11.5, color: MUTED, lineSpacing: 15.5 });
  s.addNotes("Step 1 is where supervisors will push hardest. If you cannot say why classes rather than a continuum, you are not ready to fit anything.");
})();

/* =================================================================
   SLIDE - STEP 3: SOFTWARE + MODEL FIT
================================================================= */
(function () {
  const s = slideLight("Fitting the model — and what to fit it in", "Step 3");
  const sw = [
    [C2, "R", "Free", "poLCA and tidyLPA / mclust do the job, MplusAutomation drives Mplus from R, and the whole pipeline stays reproducible.", "Recommended starting point"],
    [C4, "Mplus", "Paid", "The gold standard for mixture models. Fast, complete, does everything — 3-step, BCH, LTA, distal outcomes. The licence is the obstacle.", "Gold standard if you have access"],
    [C1, "Stata", "Paid", "Works via gsem, but is not well optimised for mixtures: slow, fewer fit statistics reported, harder to tune. Usable, not ideal.", "Fine if it is all you have"]
  ];
  const cw9 = (CW - 2 * 0.26) / 3;
  sw.forEach(function (p, i) {
    const x = M + i * (cw9 + 0.26);
    card(s, x, 1.42, cw9, 2.28, WHITE, { border: LINE, shadow: true });
    s.addText(p[1], { x: x + 0.28, y: 1.60, w: cw9 - 1.2, h: 0.42, margin: 0, valign: "middle", fontFace: HF, fontSize: 24, bold: true, color: p[0] });
    s.addText(p[2].toUpperCase(), { x: x + cw9 - 1.05, y: 1.66, w: 0.8, h: 0.28, margin: 0, align: "right", valign: "middle", fontFace: BF, fontSize: 10, bold: true, color: FAINT, charSpacing: 1 });
    s.addText(p[3], { x: x + 0.28, y: 2.12, w: cw9 - 0.56, h: 1.05, margin: 0, valign: "top", fontFace: BF, fontSize: 11.5, color: MUTED, lineSpacing: 16 });
    s.addText(p[4], { x: x + 0.28, y: 3.26, w: cw9 - 0.56, h: 0.3, margin: 0, fontFace: BF, fontSize: 11, bold: true, italic: true, color: p[0] });
  });

  card(s, M, 3.92, 6.0, 2.60, TINT, { border: LINE });
  s.addText("What “model fit” means", { x: M + 0.32, y: 4.10, w: 5.3, h: 0.34, margin: 0, fontFace: HF, fontSize: 18, bold: true, color: INK });
  s.addText("How closely the model you built reproduces the data you actually have. Think of trying on a jumper: too small and it strains, too big and it hangs. Goodness-of-fit statistics are how you check the size without a mirror.", { x: M + 0.32, y: 4.52, w: 5.3, h: 1.0, margin: 0, valign: "top", fontFace: BF, fontSize: 12.5, color: MUTED, lineSpacing: 17 });
  s.addText("Before reading any fit statistic, check the model converged and that the best log-likelihood replicated across random starts. A non-replicated solution is a local maximum, not a result.", { x: M + 0.32, y: 5.58, w: 5.3, h: 0.78, margin: 0, valign: "top", fontFace: BF, fontSize: 11.5, italic: true, color: C1, lineSpacing: 16 });

  card(s, 6.98, 3.92, 5.73, 2.60, "FAF3F1", { border: "EBD5CD" });
  s.addText("What fit statistics protect you from", { x: 7.30, y: 4.10, w: 5.1, h: 0.34, margin: 0, fontFace: HF, fontSize: 18, bold: true, color: INK });
  s.addText("An overfitted model has learned the quirks and random noise of your particular sample. It describes those 800 people beautifully and generalises to nobody.", { x: 7.30, y: 4.58, w: 5.1, h: 0.85, margin: 0, valign: "top", fontFace: BF, fontSize: 12.5, color: MUTED, lineSpacing: 17 });
  s.addText("Penalised criteria such as BIC add a cost for every extra parameter, so a more complicated model has to earn its complexity in improved likelihood before it wins.", { x: 7.30, y: 5.48, w: 5.1, h: 0.85, margin: 0, valign: "top", fontFace: BF, fontSize: 12.5, color: MUTED, lineSpacing: 17 });
  s.addNotes("If asked which software: R, unless the department already has Mplus. The practical in Part 5 is written in R for exactly this reason.");
})();

/* =================================================================
   SLIDE - FIT STATISTICS CHEAT SHEET
================================================================= */
(function () {
  const s = slideLight("The goodness-of-fit statistics, decoded", "Step 3 · cheat sheet");
  body(s, M, 1.38, CW, 0.36, "There are many, they overlap, and no single one settles the question. Report several and look for agreement.", { fs: 13, color: MUTED });
  const cols = [
    { t: "STATISTIC", w: 1.05 },
    { t: "WHAT IT IS", w: 2.10 },
    { t: "HOW TO READ IT", w: 2.05 }
  ];
  const rows = [
    [{ t: "Log-likelihood", bold: true }, "Raw fit of the model to the data", "Always improves with more classes — never use it alone. Check it replicates."],
    [{ t: "AIC", bold: true }, "−2LL + 2p", "Lower is better. Tends to favour too many classes."],
    [{ t: "BIC", bold: true }, "−2LL + p·ln(n)", { t: "Lower is better. The one you will see in every paper.", bold: true }],
    [{ t: "aBIC (SSA-BIC)", bold: true }, "BIC with a sample-size adjustment", "Lower is better. Performs well when n is modest."],
    [{ t: "Entropy", bold: true }, "How cleanly people are classified, 0 to 1", { t: "≥0.80 = clear separation. NOT a tool for choosing k.", color: C1 }],
    [{ t: "VLMR / LMR-LRT", bold: true }, "Tests k classes against k−1", "p < .05 → keep k. p > .05 → k−1 was enough."],
    [{ t: "BLRT", bold: true }, "Bootstrapped version of the same test", "Best performer in simulation studies. Slow to run."],
    [{ t: "Smallest class %", bold: true }, "Share of the sample in the smallest class", { t: "Aim for ≥5%. A tiny class is usually noise, not a subgroup.", color: C1 }]
  ];
  table(s, M, 1.86, CW, cols, rows, { rowH: 0.475, headH: 0.48, fs: 11.5, headFs: 10.5 });
  card(s, M, 5.84, CW, 0.88, NAVY);
  s.addText([
    { text: "Rule of thumb.  ", options: { bold: true, color: C3 } },
    { text: "BIC and aBIC to compare solutions · BLRT (or LMR) to test k against k−1 · entropy and smallest-class size to check the solution is usable. Then theory decides the ties.", options: { color: WHITE } }
  ], { x: M + 0.35, y: 5.84, w: CW - 0.7, h: 0.88, margin: 0, valign: "middle", fontFace: BF, fontSize: 13, lineSpacing: 18 });
  s.addNotes("Nylund, Asparouhov and Muthen (2007) is the standard citation for BLRT outperforming the alternatives; BIC is the best of the information criteria in the same simulations.");
})();

/* =================================================================
   SLIDE - STEP 4: CHOOSING K (chart)
================================================================= */
(function () {
  const s = slideLight("How many classes? Look for the elbow", "Step 4");
  body(s, M, 1.42, CW, 0.42, "You do not ask the software how many classes there are. You fit 1 class, then 2, then 3, until fit stops improving.", { fs: 13, color: MUTED });

  const chartData = [
    { name: "BIC", labels: ["1", "2", "3", "4", "5", "6"], values: [24810, 23640, 23108, 22974, 23052, 23191] },
    { name: "aBIC", labels: ["1", "2", "3", "4", "5", "6"], values: [24762, 23540, 22961, 22781, 22812, 22905] }
  ];
  s.addChart(pres.ChartType.line, chartData, {
    x: M, y: 1.92, w: 7.05, h: 4.10,
    showTitle: true, title: "Information criteria across 1–6 class solutions", titleFontSize: 13, titleColor: INK, titleFontFace: BF,
    chartColors: [C1, C4], lineSize: 3, lineSmooth: false,
    showLegend: true, legendPos: "b", legendFontFace: BF, legendFontSize: 11, legendColor: MUTED,
    catAxisTitle: "Number of classes", showCatAxisTitle: true, catAxisTitleFontSize: 11, catAxisTitleColor: MUTED,
    catAxisLabelColor: MUTED, catAxisLabelFontSize: 11, catAxisLabelFontFace: BF,
    valAxisLabelColor: MUTED, valAxisLabelFontSize: 10, valAxisLabelFontFace: BF,
    valAxisMinVal: 22500, valAxisMaxVal: 25000,
    valGridLine: { color: LINE, size: 1 }, catGridLine: { style: "none" },
    lineDataSymbol: "circle", lineDataSymbolSize: 8,
    plotArea: { fill: { color: WHITE } }
  });

  card(s, 8.20, 1.92, 4.51, 4.42, TINT, { border: LINE });
  s.addText("Reading the curve", { x: 8.48, y: 2.12, w: 3.95, h: 0.34, margin: 0, fontFace: HF, fontSize: 18, bold: true, color: INK });
  const notes = [
    [C1, "1 → 2 → 3", "Fit improves sharply. Each new class is capturing real structure."],
    [C4, "4", "The lowest point. Beyond here the model is buying complexity it does not need."],
    [C3, "5 → 6", "The criteria rise again. Extra classes are now fitting noise."]
  ];
  notes.forEach(function (n, i) {
    const y = 2.62 + i * 1.02;
    dot(s, 8.48, y + 0.04, 0.26, n[0]);
    s.addText(n[1], { x: 8.84, y: y, w: 3.5, h: 0.28, margin: 0, valign: "middle", fontFace: BF, fontSize: 13, bold: true, color: INK });
    s.addText(n[2], { x: 8.84, y: y + 0.32, w: 3.5, h: 0.62, margin: 0, valign: "top", fontFace: BF, fontSize: 11.5, color: MUTED, lineSpacing: 15.5 });
  });
  s.addText("The elbow here points to 4 classes. Now check the other statistics agree — and that the four classes make sense.", { x: 8.48, y: 5.62, w: 3.95, h: 0.62, margin: 0, valign: "top", fontFace: BF, fontSize: 11, italic: true, color: C4, lineSpacing: 15 });
  footnote(s, "Illustrative values. A real fit table would also carry entropy, the BLRT p-value and the smallest class size for every solution.");
  s.addNotes("Note the two criteria agree here, which is the comfortable case. When BIC says 3 and aBIC says 5, you report both and let theory and interpretability break the tie.");
})();

/* =================================================================
   SLIDE - STEP 4b: FIT IS NOT THE ONLY CRITERION
================================================================= */
(function () {
  const s = slideDark("The statistics are evidence, not a verdict", "Step 4 · judgement");
  card(s, M, 1.50, CW, 1.05, NAVY2);
  s.addText("A 4-class model can win on BIC and still be the wrong answer — if one class holds 2% of the sample, if two classes are near-duplicates, or if nothing in the literature or the theory has any use for the fourth.", { x: M + 0.42, y: 1.50, w: CW - 0.84, h: 1.05, margin: 0, valign: "middle", fontFace: BF, fontSize: 15, color: WHITE, lineSpacing: 21 });

  const q = [
    [C3, "Is it parsimonious?", "Can you describe the solution in one sentence per class? If not, it is probably too complicated to be useful."],
    [C2, "Does it match theory?", "Does the solution look like what the construct and the prior literature would lead you to expect?"],
    [C1, "Are the classes usable?", "Is the smallest class large enough to say anything about? Are any two classes essentially the same shape?"],
    [C4, "Is classification clean?", "Entropy ≥0.80 and high average posterior probabilities mean people are being assigned with confidence."]
  ];
  const cwq = (CW - 3 * 0.24) / 4;
  q.forEach(function (it, i) {
    const x = M + i * (cwq + 0.24);
    card(s, x, 2.85, cwq, 2.52, NAVY2);
    dot(s, x + 0.26, 3.10, 0.30, it[0]);
    s.addText(it[1], { x: x + 0.26, y: 3.52, w: cwq - 0.52, h: 0.58, margin: 0, valign: "top", fontFace: BF, fontSize: 14, bold: true, color: WHITE });
    s.addText(it[2], { x: x + 0.26, y: 4.14, w: cwq - 0.52, h: 1.12, margin: 0, valign: "top", fontFace: BF, fontSize: 11.5, color: "C4BFE0", lineSpacing: 15.5 });
  });

  card(s, M, 5.55, CW, 1.15, "3D2A57");
  s.addText([
    { text: "A perfectly respectable sentence in a results section:  ", options: { color: "C4BFE0" } },
    { text: "“Although the 4-class solution had marginally lower BIC, we retained the 3-class solution: the fourth class contained 3.1% of the sample, closely resembled class 2, and had no counterpart in the existing literature.”", options: { color: WHITE, bold: true } }
  ], { x: M + 0.42, y: 5.55, w: CW - 0.84, h: 1.15, margin: 0, valign: "middle", fontFace: BF, fontSize: 13, lineSpacing: 19 });
  s.addNotes("Students find this genuinely unsettling - they want the statistic to decide. Reassure them: choosing a solution you can defend, and stating why, is standard practice and expected by reviewers.");
})();

/* =================================================================
   SLIDE - STEP 5: INTERPRET AND NAME
================================================================= */
(function () {
  const s = slideLight("Interpreting and naming what you found", "Step 5");
  body(s, M, 1.42, CW, 0.36, "Now you read the response pattern inside each class. Suppose we asked about two things: big concerts, and mosh pits.", { fs: 13, color: MUTED });

  const cols = [
    { t: "", w: 1.00 },
    { t: "P(likes big concerts)", w: 1.10, align: "center" },
    { t: "P(likes mosh pits)", w: 1.10, align: "center" },
    { t: "SIZE", w: 0.62, align: "center" },
    { t: "A HONEST NAME", w: 1.55 }
  ];
  const rows = [
    [{ t: "Class 1", bold: true, color: C1 }, { t: "0.08", align: "center" }, "0.05", "41%", { t: "Low concert engagement", bold: true }],
    [{ t: "Class 2", bold: true, color: C2 }, "0.91", "0.74", "37%", { t: "High engagement, both settings", bold: true }],
    [{ t: "Class 3", bold: true, color: C3 }, "0.14", "0.88", "22%", { t: "Mosh-pit only", bold: true }]
  ];
  table(s, M, 1.90, CW, cols, rows, { rowH: 0.46, headH: 0.48, fs: 12, headFs: 10.5 });

  s.addText("The tempting names — and why they cost you", { x: M, y: 3.94, w: CW, h: 0.32, margin: 0, fontFace: HF, fontSize: 18, bold: true, color: INK });
  const naming = [
    [C1, "“The homebodies”", "Class 1 might simply have no money, or no venue nearby. You have named a circumstance as a personality."],
    [C2, "“Taylor Swift fans”", "Nothing in the data says anything about Taylor Swift. You have imported an assumption and made it look like a finding."],
    [C3, "“Heavy metal fans”", "Plausible, unevidenced, and now every reader will interpret class 3 through that label instead of through its actual probabilities."]
  ];
  const cwn = (CW - 2 * 0.26) / 3;
  naming.forEach(function (n, i) {
    const x = M + i * (cwn + 0.26);
    card(s, x, 4.34, cwn, 1.55, TINT, { border: LINE });
    s.addText(n[1], { x: x + 0.26, y: 4.52, w: cwn - 0.52, h: 0.32, margin: 0, fontFace: BF, fontSize: 14, bold: true, color: n[0] });
    s.addText(n[2], { x: x + 0.26, y: 4.88, w: cwn - 0.52, h: 0.92, margin: 0, valign: "top", fontFace: BF, fontSize: 11.5, color: MUTED, lineSpacing: 15.5 });
  });

  card(s, M, 6.02, CW, 0.90, "FAF3F1", { border: "EBD5CD" });
  s.addText([
    { text: "The naming fallacy.  ", options: { bold: true, color: C1 } },
    { text: "A class name is an interpretation, but it behaves like a finding: it sticks, it shapes how everyone reads your results, and if the work informs policy it can shape decisions about real people. Dull and accurate beats memorable and wrong.", options: { color: INK } }
  ], { x: M + 0.35, y: 6.02, w: CW - 0.7, h: 0.90, margin: 0, valign: "middle", fontFace: BF, fontSize: 12.5, lineSpacing: 18 });
  s.addNotes("The naming fallacy is where the statistics stop and the responsibility starts. Ask the room to suggest names for class 3, then ask what each name would commit them to.");
})();

/* =================================================================
   PART 5 DIVIDER
================================================================= */
divider("5", "Practical", "Open R. We will simulate a dataset, fit an LCA and an LPA on it, and interpret both.");

/* =================================================================
   SLIDE - PRACTICAL BRIEF
================================================================= */
(function () {
  const s = slideLight("The practical, in one page", "Practical · brief");

  card(s, M, 1.42, 6.0, 2.55, WHITE, { border: LINE, shadow: true });
  s.addText("The dataset", { x: M + 0.32, y: 1.60, w: 5.3, h: 0.34, margin: 0, fontFace: HF, fontSize: 19, bold: true, color: INK });
  s.addText("student_wellbeing.csv — 800 simulated students, generated by the script so everyone gets identical results. It deliberately contains three true subgroups.", { x: M + 0.32, y: 2.02, w: 5.3, h: 0.75, margin: 0, valign: "top", fontFace: BF, fontSize: 12.5, color: MUTED, lineSpacing: 17 });
  s.addText("Six binary items  →  use these for LCA", { x: M + 0.32, y: 2.80, w: 5.3, h: 0.28, margin: 0, fontFace: BF, fontSize: 12, bold: true, color: C1 });
  s.addText("low_mood · anhedonia · sleep · fatigue · appetite · concentration", { x: M + 0.32, y: 3.06, w: 5.3, h: 0.28, margin: 0, fontFace: BF, fontSize: 11.5, color: MUTED });
  s.addText("Four continuous scales  →  use these for LPA", { x: M + 0.32, y: 3.36, w: 5.3, h: 0.28, margin: 0, fontFace: BF, fontSize: 12, bold: true, color: C2 });
  s.addText("phq9 · gad7 · sleep_quality · academic_stress", { x: M + 0.32, y: 3.62, w: 5.3, h: 0.28, margin: 0, fontFace: BF, fontSize: 11.5, color: MUTED });

  card(s, 6.98, 1.42, 5.73, 2.55, WHITE, { border: LINE, shadow: true });
  s.addText("What you will do", { x: 7.30, y: 1.60, w: 5.1, h: 0.34, margin: 0, fontFace: HF, fontSize: 19, bold: true, color: INK });
  bullets(s, 7.30, 2.06, 5.1, 1.80, [
    "Fit 1- to 5-class LCA models on the six binary items",
    "Build the fit table and pick a solution",
    "Read the item-response probabilities and name the classes",
    "Repeat with LPA on the four continuous scales",
    "Compare: do the two methods find the same people?"
  ], { fs: 11.5, gap: 5, color: MUTED });

  card(s, M, 4.20, CW, 1.05, "221D48");
  s.addText([
    { text: "Setup — run once:  ", options: { color: C3, bold: true } },
    { text: 'install.packages(c("poLCA", "tidyLPA", "mclust", "dplyr"))', options: { color: CODE_TX } }
  ], { x: M + 0.42, y: 4.20, w: CW - 0.84, h: 1.05, margin: 0, valign: "middle", fontFace: MF, fontSize: 14 });

  const files = [
    [C1, "lca_lpa_practical.R", "The full annotated script — simulates the data, fits everything, prints every table in this section."],
    [C2, "student_wellbeing.csv", "Written by the script on first run, so you can also open it in Stata, Mplus or SPSS."],
    [C3, "practical/README.md", "The exercise sheet, with the questions to answer and what a good answer looks like."]
  ];
  const cwf = (CW - 2 * 0.26) / 3;
  files.forEach(function (f, i) {
    const x = M + i * (cwf + 0.26);
    card(s, x, 5.52, cwf, 1.22, TINT, { border: LINE });
    dot(s, x + 0.26, 5.74, 0.26, f[0]);
    s.addText(f[1], { x: x + 0.60, y: 5.72, w: cwf - 0.85, h: 0.30, margin: 0, valign: "middle", fontFace: MF, fontSize: 11.5, bold: true, color: INK });
    s.addText(f[2], { x: x + 0.26, y: 6.08, w: cwf - 0.52, h: 0.58, margin: 0, valign: "top", fontFace: BF, fontSize: 10.5, color: MUTED, lineSpacing: 14 });
  });
  s.addNotes("Everything is simulated with a fixed seed, so every person in the room gets numerically identical output and nobody gets lost debugging their own data.");
})();

/* =================================================================
   SLIDE - HANDS ON A: LCA IN R
================================================================= */
(function () {
  const s = slideLight("Hands-on A — fitting an LCA in R", "Practical · poLCA");

  codeBlock(s, M, 1.42, 7.55, 5.05, [
    [["# ---- 1. load and look ------------------------------", CODE_CM]],
    [["library", CODE_KW], ["(poLCA)", CODE_TX]],
    [["d <- ", CODE_TX], ["read.csv", CODE_FN], ['("student_wellbeing.csv")', CODE_ST]],
    [["", CODE_TX]],
    [["# poLCA needs categories coded 1,2,... NOT 0,1", CODE_CM]],
    [["items <- ", CODE_TX], ['c("low_mood","anhedonia","sleep",', CODE_ST]],
    [['          "fatigue","appetite","concentration")', CODE_ST]],
    [["d[items] <- d[items] + ", CODE_TX], ["1L", CODE_KW]],
    [["", CODE_TX]],
    [["# ---- 2. fit 1 to 5 classes -------------------------", CODE_CM]],
    [["f <- ", CODE_TX], ["cbind", CODE_FN], ["(low_mood, anhedonia, sleep,", CODE_TX]],
    [["             fatigue, appetite, concentration) ~ ", CODE_TX], ["1", CODE_KW]],
    [["", CODE_TX]],
    [["set.seed", CODE_FN], ["(2026)", CODE_TX]],
    [["fits <- ", CODE_TX], ["lapply", CODE_FN], ["(", CODE_TX], ["1:5", CODE_KW], [", ", CODE_TX], ["function", CODE_KW], ["(k)", CODE_TX]],
    [["  ", CODE_TX], ["poLCA", CODE_FN], ["(f, data = d, nclass = k,", CODE_TX]],
    [["        nrep = ", CODE_TX], ["20", CODE_KW], [", maxiter = ", CODE_TX], ["5000", CODE_KW], [", verbose = ", CODE_TX], ["FALSE", CODE_KW], ["))", CODE_TX]],
    [["", CODE_TX]],
    [["best <- fits[[", CODE_TX], ["3", CODE_KW], ["]]      ", CODE_TX], ["# chosen after the fit table", CODE_CM]],
    [["best$P                 ", CODE_TX], ["# class sizes", CODE_CM]],
    [["best$probs             ", CODE_TX], ["# item-response probabilities", CODE_CM]],
    [["best$posterior         ", CODE_TX], ["# per-person probabilities", CODE_CM]]
  ], { fs: 11, lineSpacing: 14.5 });

  const notes = [
    [C1, "nrep = 20", "Twenty random starts. Mixture likelihoods are riddled with local maxima — without this you may be reporting the best of one lucky guess."],
    [C2, "~ 1 on the right", "There are no predictors in the measurement model. Covariates come later, in a separate step."],
    [C3, "The +1L line", "poLCA refuses 0/1 coding. This is the single most common error message beginners hit."],
    [C4, "set.seed()", "Random starts mean random results. Without a seed your analysis is not reproducible — including by you, next week."]
  ];
  notes.forEach(function (n, i) {
    const y = 1.42 + i * 1.26;
    card(s, 8.42, y, 4.29, 1.12, TINT, { border: LINE });
    dot(s, 8.66, y + 0.19, 0.24, n[0]);
    s.addText(n[1], { x: 8.98, y: y + 0.16, w: 3.5, h: 0.28, margin: 0, valign: "middle", fontFace: MF, fontSize: 11, bold: true, color: INK });
    s.addText(n[2], { x: 8.66, y: y + 0.48, w: 3.85, h: 0.58, margin: 0, valign: "top", fontFace: BF, fontSize: 10, color: MUTED, lineSpacing: 13.5 });
  });
  footnote(s, "The full script also builds the fit table — log-likelihood, AIC, BIC, aBIC, entropy, smallest class — for all five solutions.");
  s.addNotes("Walk through the code block line by line. The +1L line and nrep are the two things people get wrong; both are called out on the right.");
})();

/* =================================================================
   SLIDE - READING LCA OUTPUT
================================================================= */
(function () {
  const s = slideLight("Reading the output: what the classes are", "Practical · interpreting LCA");
  body(s, M, 1.38, CW, 0.42, "best$probs gives, for each item, the probability that a class member endorses it. That table is your result.", { fs: 13, color: MUTED });

  const cols = [
    { t: "SYMPTOM ITEM", w: 1.30 },
    { t: "CLASS 1 — 47%", w: 0.90, align: "center" },
    { t: "CLASS 2 — 32%", w: 0.90, align: "center" },
    { t: "CLASS 3 — 21%", w: 0.90, align: "center" }
  ];
  const hi = { color: C1, bold: true };
  const rows = [
    ["Low mood", "0.11", "0.20", { t: "0.88", color: C1, bold: true }],
    ["Loss of interest", "0.08", "0.20", { t: "0.85", color: C1, bold: true }],
    ["Sleep problems", "0.13", { t: "0.80", color: C1, bold: true }, { t: "0.89", color: C1, bold: true }],
    ["Fatigue", "0.13", { t: "0.85", color: C1, bold: true }, { t: "0.95", color: C1, bold: true }],
    ["Appetite change", "0.07", { t: "0.61", color: C1, bold: true }, { t: "0.75", color: C1, bold: true }],
    ["Poor concentration", "0.12", "0.34", { t: "0.80", color: C1, bold: true }]
  ];
  table(s, M, 1.86, 8.15, cols, rows, { rowH: 0.42, headH: 0.46, fs: 12, headFs: 10.5, boldFirst: true });

  const names = [
    [C2, "Class 1 · 47%", "Minimal symptoms", "Low on every item. The comparison group."],
    [C3, "Class 2 · 32%", "Somatic / sleep–fatigue", "Sleep and fatigue high, mood items low."],
    [C1, "Class 3 · 21%", "Pervasive symptoms", "High on every item, mood and somatic."]
  ];
  names.forEach(function (n, i) {
    const y = 1.86 + i * 1.10;
    card(s, 9.10, y, 3.61, 1.00, TINT, { border: LINE });
    dot(s, 9.34, y + 0.16, 0.22, n[0]);
    s.addText(n[1], { x: 9.64, y: y + 0.13, w: 2.8, h: 0.28, margin: 0, valign: "middle", fontFace: BF, fontSize: 11, bold: true, color: n[0] });
    s.addText(n[2], { x: 9.34, y: y + 0.42, w: 3.15, h: 0.28, margin: 0, fontFace: BF, fontSize: 12.5, bold: true, color: INK });
    s.addText(n[3], { x: 9.34, y: y + 0.68, w: 3.15, h: 0.28, margin: 0, valign: "top", fontFace: BF, fontSize: 10, color: MUTED, lineSpacing: 13 });
  });

  footnote(s, "Figures are the 3-class solution from practical/lca_lpa_practical.R. Your own run reproduces them exactly; a different seed will move the second decimal.");
  card(s, M, 5.30, CW, 1.25, NAVY);
  s.addText([
    { text: "This is the finding that a severity score would have destroyed.  ", options: { bold: true, color: C3 } },
    { text: "Classes 2 and 3 both look “symptomatic” on a total score. Only the class solution shows that one group has somatic symptoms without low mood — a different pattern, plausibly with a different cause and a different treatment.", options: { color: WHITE } }
  ], { x: M + 0.42, y: 5.30, w: CW - 0.84, h: 1.25, margin: 0, valign: "middle", fontFace: BF, fontSize: 13, lineSpacing: 19 });
  s.addNotes("Emphasise the last box. This is the argument for using LCA at all: sum scores collapse pattern into level, and pattern was the interesting part.");
})();

/* =================================================================
   SLIDE - HANDS ON B: LPA IN R
================================================================= */
(function () {
  const s = slideLight("Hands-on B — the same idea, continuous data", "Practical · tidyLPA");

  codeBlock(s, M, 1.42, 7.55, 4.62, [
    [["# ---- LPA on the four scale scores ------------------", CODE_CM]],
    [["library", CODE_KW], ["(tidyLPA); ", CODE_TX], ["library", CODE_KW], ["(dplyr)", CODE_TX]],
    [["", CODE_TX]],
    [["scales <- ", CODE_TX], ['c("phq9","gad7","sleep_quality",', CODE_ST]],
    [['            "academic_stress")', CODE_ST]],
    [["", CODE_TX]],
    [["lpa <- d %>%", CODE_TX]],
    [["  ", CODE_TX], ["select", CODE_FN], ["(", CODE_TX], ["all_of", CODE_FN], ["(scales)) %>%", CODE_TX]],
    [["  ", CODE_TX], ["scale", CODE_FN], ["() %>% ", CODE_TX], ["as.data.frame", CODE_FN], ["() %>%     ", CODE_TX], ["# z-scores", CODE_CM]],
    [["  ", CODE_TX], ["estimate_profiles", CODE_FN], ["(", CODE_TX], ["1:5", CODE_KW], [",", CODE_TX]],
    [["      variances = ", CODE_TX], ['"equal"', CODE_ST], [", covariances = ", CODE_TX], ['"zero"', CODE_ST], [")", CODE_TX]],
    [["", CODE_TX]],
    [["# ---- compare solutions -----------------------------", CODE_CM]],
    [["compare_solutions", CODE_FN], ["(lpa, statistics = ", CODE_TX], ["c(", CODE_TX], ['"AIC"', CODE_ST], [",", CODE_TX], ['"BIC"', CODE_ST], [",", CODE_TX], ['"Entropy"', CODE_ST], ["))", CODE_TX]],
    [["", CODE_TX]],
    [["# ---- inspect the chosen solution -------------------", CODE_CM]],
    [["get_estimates", CODE_FN], ["(lpa[[", CODE_TX], ["3", CODE_KW], ["]])   ", CODE_TX], ["# profile means", CODE_CM]],
    [["get_data", CODE_FN], ["(lpa[[", CODE_TX], ["3", CODE_KW], ["]])        ", CODE_TX], ["# class + probabilities", CODE_CM]],
    [["plot_profiles", CODE_FN], ["(lpa[[", CODE_TX], ["3", CODE_KW], ["]])   ", CODE_TX], ["# the profile plot", CODE_CM]]
  ], { fs: 11.5, lineSpacing: 16.5 });

  card(s, 8.42, 1.42, 4.29, 2.42, "EDF6F4", { border: "C7E3DE" });
  s.addText("The one extra decision LPA makes you take", { x: 8.68, y: 1.60, w: 3.8, h: 0.56, margin: 0, valign: "top", fontFace: HF, fontSize: 15, bold: true, color: INK });
  s.addText("Because indicators are continuous, each profile has both a mean and a variance. You must say whether variances (and covariances) are held equal across profiles or freed.", { x: 8.68, y: 2.22, w: 3.8, h: 0.95, margin: 0, valign: "top", fontFace: BF, fontSize: 11.5, color: MUTED, lineSpacing: 16 });
  s.addText("Start with equal variances / zero covariances — the most constrained model. Free them only if fit clearly improves.", { x: 8.68, y: 3.20, w: 3.8, h: 0.55, margin: 0, valign: "top", fontFace: BF, fontSize: 11, italic: true, color: C2, lineSpacing: 15 });

  const cols = [
    { t: "TIDYLPA MODEL", w: 0.75, align: "center" },
    { t: "VARIANCES", w: 1.05 },
    { t: "COVARIANCES", w: 1.05 }
  ];
  const rows = [
    [{ t: "1", bold: true }, "Equal", "Zero"],
    [{ t: "2", bold: true }, "Varying", "Zero"],
    [{ t: "3", bold: true }, "Equal", "Equal"],
    [{ t: "6", bold: true }, "Varying", "Varying"]
  ];
  table(s, 8.42, 4.06, 4.29, cols, rows, { rowH: 0.38, headH: 0.40, fs: 10.5, headFs: 9.5 });
  s.addText("Models 4 and 5 need Mplus; 1, 2, 3 and 6 run in R via mclust.", { x: 8.42, y: 6.10, w: 4.29, h: 0.3, margin: 0, fontFace: BF, fontSize: 10, italic: true, color: FAINT });
  footnote(s, "Standardising the indicators is optional but makes profile plots comparable across scales measured in different units.");
  s.addNotes("Point out how little has changed from slide A: same sequence of k, same comparison of solutions, same inspection of the chosen model. Only the variance-structure choice is new.");
})();

/* =================================================================
   SLIDE - READING LPA OUTPUT (chart)
================================================================= */
(function () {
  const s = slideLight("Reading the output: three profiles, plotted", "Practical · interpreting LPA");
  body(s, M, 1.38, CW, 0.36, "Where LCA gave probabilities between 0 and 1, LPA gives means. Plotted as z-scores, the shape of each profile is what you interpret.", { fs: 13, color: MUTED });

  const cats = ["Depression (PHQ-9)", "Anxiety (GAD-7)", "Poor sleep quality", "Academic stress"];
  const chartData = [
    { name: "Profile 1 — Low distress (47%)", labels: cats, values: [-0.53, -0.57, -0.77, -0.70] },
    { name: "Profile 2 — Somatic / stressed (34%)", labels: cats, values: [-0.07, 0.07, 0.82, 0.70] },
    { name: "Profile 3 — High distress (20%)", labels: cats, values: [1.38, 1.23, 0.42, 0.47] }
  ];
  s.addChart(pres.ChartType.bar, chartData, {
    x: M, y: 1.86, w: 8.15, h: 4.05,
    barDir: "col", barGrouping: "clustered", barGapWidthPct: 45,
    showTitle: true, title: "Profile means, standardised (z-scores)", titleFontSize: 13, titleColor: INK, titleFontFace: BF,
    chartColors: [C2, C3, C1],
    showLegend: true, legendPos: "b", legendFontFace: BF, legendFontSize: 10.5, legendColor: MUTED,
    catAxisLabelColor: MUTED, catAxisLabelFontSize: 10, catAxisLabelFontFace: BF,
    valAxisLabelColor: MUTED, valAxisLabelFontSize: 10, valAxisLabelFontFace: BF,
    valAxisMinVal: -1, valAxisMaxVal: 1.5, valAxisMajorUnit: 0.5, showValue: false,
    valGridLine: { color: LINE, size: 1 }, catGridLine: { style: "none" },
    plotArea: { fill: { color: WHITE } }
  });

  card(s, 9.10, 1.86, 3.61, 4.32, TINT, { border: LINE });
  s.addText("What to say about it", { x: 9.38, y: 2.04, w: 3.05, h: 0.32, margin: 0, fontFace: HF, fontSize: 17, bold: true, color: INK });
  const rd = [
    [C2, "Profile 1", "Below average on all four. Nothing much going on — and it is the largest group."],
    [C3, "Profile 2", "Average mood and anxiety, but well above average on sleep and stress. Shape, not level."],
    [C1, "Profile 3", "Sharply raised on mood and anxiety, only moderately on sleep and stress."]
  ];
  rd.forEach(function (r, i) {
    const y = 2.44 + i * 1.05;
    dot(s, 9.38, y + 0.03, 0.24, r[0]);
    s.addText(r[1], { x: 9.70, y: y, w: 2.6, h: 0.28, margin: 0, valign: "middle", fontFace: BF, fontSize: 12.5, bold: true, color: INK });
    s.addText(r[2], { x: 9.38, y: y + 0.32, w: 3.05, h: 0.70, margin: 0, valign: "top", fontFace: BF, fontSize: 10.5, color: MUTED, lineSpacing: 14 });
  });
  s.addText("The same three groups the LCA found — recovered from continuous scales.", { x: 9.38, y: 5.52, w: 3.05, h: 0.60, margin: 0, valign: "top", fontFace: BF, fontSize: 10.5, bold: true, italic: true, color: C2, lineSpacing: 14 });
  footnote(s, "Figures from the practical script. The two methods agree because both sets of indicators come from the same underlying groups.");
  s.addNotes("This is the slide that closes the loop on Part 2. Both methods, one dataset, the same three subgroups, described in the two different vocabularies.");
})();

/* =================================================================
   SLIDE - PITFALLS
================================================================= */
(function () {
  const s = slideDark("Eight things that will trip you up", "Practical · pitfalls");
  const p = [
    ["Local maxima", "Always use many random starts (nrep / STARTS). If the best log-likelihood does not replicate, the solution is not trustworthy."],
    ["0/1 coding in poLCA", "poLCA needs 1/2. You will get an unhelpful error until you add 1 to every item."],
    ["Rare items", "An item endorsed by 2% of the sample contributes almost nothing and can destabilise estimation."],
    ["Near-duplicate items", "Two items asking the same thing violate local independence and can manufacture a spurious class."],
    ["Listwise deletion by default", "Fit with full-information ML where you can, and always report how much missingness you had."],
    ["Covariates in the measurement model", "Adding predictors shifts the classes themselves. Use a 3-step or BCH approach instead."],
    ["Comparing across groups by splitting", "Fitting separate models for men and women does not test whether classes differ. Measurement invariance testing does."],
    ["Treating class as if it were observed", "Assigning everyone to their most likely class throws away the uncertainty and biases the next analysis downward."]
  ];
  const cwp = (CW - 0.24) / 2, chp = 1.15;
  p.forEach(function (it, i) {
    const x = M + (i % 2) * (cwp + 0.24);
    const y = 1.55 + Math.floor(i / 2) * (chp + 0.18);
    card(s, x, y, cwp, chp, NAVY2);
    badge(s, x + 0.22, y + 0.22, 0.32, String(i + 1), i % 2 === 0 ? C3 : C1, NAVY, 11);
    s.addText(it[0], { x: x + 0.66, y: y + 0.18, w: cwp - 0.90, h: 0.30, margin: 0, valign: "middle", fontFace: BF, fontSize: 13, bold: true, color: WHITE });
    s.addText(it[1], { x: x + 0.66, y: y + 0.52, w: cwp - 0.90, h: 0.56, margin: 0, valign: "top", fontFace: BF, fontSize: 11, color: "C4BFE0", lineSpacing: 14.5 });
  });
  s.addNotes("Numbers 6 and 8 are the ones that most often invalidate an otherwise competent analysis, because they occur after the model looks finished.");
})();

/* =================================================================
   SLIDE - WHAT TO REPORT
================================================================= */
(function () {
  const s = slideLight("What a reviewer expects to see in your write-up", "Reporting checklist");
  const groups = [
    [C1, "Model specification", ["The construct, and why classes rather than a dimension", "Every indicator listed, with its coding and response scale", "Software, package and version", "Number of random starts, and the seed", "How missing data were handled"]],
    [C2, "Class enumeration", ["A fit table covering every solution you fitted, not just the winner", "Log-likelihood, AIC, BIC, aBIC, entropy for each", "LMR / BLRT p-values where available", "Smallest class size, as n and as %", "A sentence saying why you chose the solution you chose"]],
    [C3, "The solution itself", ["Item-response probabilities (LCA) or profile means (LPA), in full", "A profile plot", "Class sizes and average posterior probabilities", "Class names, with the evidence for each name", "Any covariate or distal-outcome analysis, and the method used"]]
  ];
  const cwc = (CW - 2 * 0.26) / 3;
  groups.forEach(function (g, i) {
    const x = M + i * (cwc + 0.26);
    card(s, x, 1.45, cwc, 4.35, WHITE, { border: LINE, shadow: true });
    dot(s, x + 0.28, 1.70, 0.30, g[0]);
    s.addText(g[1], { x: x + 0.28, y: 2.12, w: cwc - 0.56, h: 0.40, margin: 0, valign: "top", fontFace: HF, fontSize: 17, bold: true, color: INK });
    bullets(s, x + 0.28, 2.62, cwc - 0.56, 3.0, g[2], { fs: 11.5, gap: 7, color: MUTED });
  });
  card(s, M, 6.00, CW, 0.80, TINT2, { border: LINE });
  s.addText([
    { text: "The test:  ", options: { bold: true, color: INK } },
    { text: "could a competent reader take your paper, your dataset and nothing else, and reproduce your class solution exactly? If not, something on this list is missing.", options: { color: MUTED } }
  ], { x: M + 0.35, y: 6.00, w: CW - 0.7, h: 0.80, margin: 0, valign: "middle", fontFace: BF, fontSize: 13 });
  s.addNotes("Print this slide. It doubles as a reviewer checklist when you are refereeing someone else's mixture model paper.");
})();

/* =================================================================
   SLIDE - YOUR TURN
================================================================= */
(function () {
  const s = slideLight("Your turn — 30 minutes", "Exercise");
  body(s, M, 1.42, CW, 0.36, "Open practical/lca_lpa_practical.R, run it top to bottom, then work through these five tasks.", { fs: 13, color: MUTED });

  const tasks = [
    ["1", C1, "Build the fit table", "Tabulate log-likelihood, AIC, BIC, aBIC, entropy and smallest class size. Which solution does BIC prefer?"],
    ["2", C2, "Defend a choice", "Pick a solution and write two sentences justifying it — using at least one statistical and one substantive reason."],
    ["3", C3, "Name the classes", "Read the item-response probabilities and name each class. Then write down, for each name, what a sceptical reader could object to."],
    ["4", C4, "Run the LPA", "Repeat on the four continuous scales. Do the same people end up together? Cross-tabulate the two assignments."],
    ["5", C5, "Break it", "Re-run the LCA with nrep = 1 and a different seed. Does the solution change? What does that tell you about reporting random starts?"]
  ];
  tasks.forEach(function (t, i) {
    const y = 1.95 + i * 0.96;
    card(s, M, y, CW, 0.84, i % 2 === 0 ? TINT : WHITE, { border: LINE });
    badge(s, M + 0.26, y + 0.21, 0.42, t[0], t[1], WHITE, 14);
    s.addText(t[2], { x: M + 0.86, y: y + 0.13, w: 2.75, h: 0.30, margin: 0, valign: "middle", fontFace: BF, fontSize: 14, bold: true, color: INK });
    s.addText(t[3], { x: M + 0.86, y: y + 0.44, w: 11.2, h: 0.34, margin: 0, valign: "top", fontFace: BF, fontSize: 11.5, color: MUTED });
  });
  s.addText("Task 5 is the one to do if you only have time for one — it shows you, on your own screen, why random starts are not optional.", { x: M, y: 6.82, w: CW, h: 0.3, margin: 0, fontFace: BF, fontSize: 11, italic: true, color: C5 });
  s.addNotes("Task 4 is the conceptual pay-off: cross-tabulating the LCA and LPA assignments usually shows high agreement, which makes the 'same model, different indicators' point concrete.");
})();

/* =================================================================
   SLIDE - RESOURCES / CLOSE
================================================================= */
(function () {
  const s = slideDark("Where to go next", "Resources");

  card(s, M, 1.45, 6.0, 3.42, NAVY2);
  s.addText("Read these four", { x: M + 0.34, y: 1.64, w: 5.3, h: 0.34, margin: 0, fontFace: HF, fontSize: 19, bold: true, color: C3 });
  const reads = [
    ["Collins & Lanza (2010)", "Latent Class and Latent Transition Analysis. The standard book-length treatment."],
    ["Nylund, Asparouhov & Muthén (2007)", "The simulation study behind every “we used BLRT” sentence you will ever write."],
    ["Masyn (2013)", "Latent class analysis and finite mixture modeling — the chapter to read before your first real model."],
    ["Weller, Bowen & Faubert (2020)", "A short, practical LCA guide aimed squarely at applied researchers."]
  ];
  reads.forEach(function (r, i) {
    const y = 2.08 + i * 0.68;
    dot(s, M + 0.34, y + 0.07, 0.16, C3);
    s.addText(r[0], { x: M + 0.62, y: y, w: 5.0, h: 0.26, margin: 0, fontFace: BF, fontSize: 12, bold: true, color: WHITE });
    s.addText(r[1], { x: M + 0.62, y: y + 0.24, w: 5.0, h: 0.34, margin: 0, valign: "top", fontFace: BF, fontSize: 10.5, color: "AEA8D0", lineSpacing: 13 });
  });

  card(s, 6.98, 1.45, 5.73, 3.42, NAVY2);
  s.addText("Tools and documentation", { x: 7.32, y: 1.64, w: 5.1, h: 0.34, margin: 0, fontFace: HF, fontSize: 19, bold: true, color: C2 });
  const tools = [
    ["poLCA", "vignette(\"poLCA\") — LCA for categorical indicators in R"],
    ["tidyLPA", "tidyLPA.info — LPA in R, with an optional Mplus back end"],
    ["mclust", "The Gaussian mixture engine underneath tidyLPA"],
    ["MplusAutomation", "Drive Mplus from R and pull results back into a data frame"]
  ];
  tools.forEach(function (r, i) {
    const y = 2.08 + i * 0.68;
    dot(s, 7.32, y + 0.07, 0.16, C2);
    s.addText(r[0], { x: 7.60, y: y, w: 4.7, h: 0.26, margin: 0, fontFace: MF, fontSize: 12, bold: true, color: WHITE });
    s.addText(r[1], { x: 7.60, y: y + 0.24, w: 4.7, h: 0.34, margin: 0, valign: "top", fontFace: BF, fontSize: 10.5, color: "AEA8D0", lineSpacing: 13 });
  });

  card(s, M, 5.00, CW, 1.72, "3D2A57");
  s.addText("If you remember one thing", { x: M + 0.45, y: 5.20, w: 5.5, h: 0.3, margin: 0, fontFace: BF, fontSize: 11, bold: true, color: C3, charSpacing: 1.5 });
  s.addText("LCA and LPA are the same model. Categorical indicators → LCA. Continuous indicators → LPA. Everything else — the workflow, the fit statistics, the judgement calls, the responsibility that comes with naming a class — is identical.", {
    x: M + 0.45, y: 5.54, w: CW - 0.9, h: 1.0, margin: 0, valign: "top",
    fontFace: HF, fontSize: 17, bold: true, color: WHITE, lineSpacing: 25
  });
  s.addNotes("Close here. Then take questions, and point people at the practical script - the fastest way to consolidate any of this is to fit a model on data where you already know the answer.");
})();

/* =================================================================
   WRITE
================================================================= */
pres.writeFile({ fileName: "slides/LCA_and_LPA_Introduction.pptx" })
  .then(function (f) { console.log("wrote " + f); })
  .catch(function (e) { console.error(e); process.exit(1); });
