# PLC Dataset — Scale Metric Check and Correction

Dataset: `PLC_responses_SPSS_coded.sav` — 32 respondents, 84 variables, no missing data on any closed item.

## The headline

The minimums of 2 and 3 you saw are **not a coding error**, and on most items there is nothing to fix. One genuine scale-metric fault does exist, and it is in section E.

## What the audit found

### 1. The agreement items are already coded correctly — 54 of them

Every agreement item in sections B, C, D4–D13, F and G carries the value labels
`1 = Strongly disagree, 2 = Disagree, 3 = Neutral, 4 = Agree, 5 = Strongly agree`.
The scale definition is right. An out-of-range audit found **zero** values outside 1–5 anywhere in the file.

What `FREQUENCIES` and `DESCRIPTIVES` report as *Minimum* is the **observed** minimum — the lowest option anyone actually ticked — not the lowest option available. On these 11 items nobody chose the bottom category:

| Item | Obs. range | 1 | 2 | 3 | 4 | 5 | Mean | SD |
|---|---|---|---|---|---|---|---|---|
| B8  | 3–5 | 0 | 0 | 2 | 21 | 9 | 4.22 | 0.55 |
| B9  | 3–5 | 0 | 0 | 2 | 19 | 11 | 4.28 | 0.58 |
| B10 | 2–5 | 0 | 3 | 4 | 16 | 9 | 3.97 | 0.90 |
| C5  | 2–5 | 0 | 2 | 7 | 13 | 10 | 3.97 | 0.90 |
| D4  | 2–5 | 0 | 3 | 6 | 11 | 12 | 4.00 | 0.98 |
| D6  | 2–5 | 0 | 4 | 7 | 14 | 7 | 3.75 | 0.95 |
| F7  | 2–5 | 0 | 1 | 7 | 15 | 9 | 4.00 | 0.80 |
| F9  | 2–5 | 0 | 2 | 10 | 11 | 9 | 3.84 | 0.92 |
| G3  | 2–5 | 0 | 1 | 8 | 14 | 9 | 3.97 | 0.82 |
| G4  | 2–5 | 0 | 2 | 8 | 15 | 7 | 3.84 | 0.85 |
| G7  | 2–5 | 0 | 4 | 16 | 9 | 3 | 3.34 | 0.83 |

This is a real property of the sample, not a defect. Across the 54 agreement items the value `1` was used 130 times and `2` was used 251 times, and 24 of the 32 respondents used `1` at least once somewhere. So the low options were available, visible and used — they just were not used on these particular 11 items.

**Forcing a 1 into these items would be fabricating responses.** It would pull the means down, inflate the standard deviations, and misstate your findings. These items are left exactly as they are.

### 2. The genuine fault — E1 to E10 were coded 0–4

The challenge-severity battery is a 5-point scale, but it was captured as
`0 = Not a challenge … 4 = Very serious challenge`, so it sat on a different metric from every other item in the questionnaire.

**Corrected.** New variables `E1_5` … `E10_5` run 1–5 with the labels carried across. The originals are kept, so nothing is destroyed and the change is reversible.

Adding a constant is a linear shift: each mean rises by exactly 1.00 and every standard deviation, correlation and Cronbach's alpha is unchanged. The correction affects only the metric, never the results.

### 3. Left 0-based on purpose

- **A8, D1, D3** — count and frequency bands where `0` means "None" / "Rarely or never". That zero is substantively real, so these must not be pushed onto 1–5. They are not attitude items.
- **A9** — dichotomous `0 = No, 1 = Yes`. Standard dummy coding, correct as it is.

### 4. Reverse-scored items verified

`B6_R`, `C4_R`, `D12_R`, `F10_R` and `G5_R` were each re-derived as `6 − original` and checked against the stored values. **All five match exactly, zero mismatches.** No action needed.

## Files

| File | What it is |
|---|---|
| `data/PLC_responses_SPSS_coded_v2.sav` | Corrected file — 94 variables, originals intact plus `E1_5`…`E10_5` |
| `syntax/01_scale_metric_correction.sps` | SPSS syntax reproducing the whole correction, for your audit trail |
| `syntax/00_recode_scales.py` | The Python that produced the corrected `.sav` and the range table |
| `output/range_verification.md` | Possible range against observed range, all 83 items |
| `output/range_verification.csv` | Same table, machine-readable |

Run the `.sps` in SPSS on the original file to regenerate everything yourself. It never overwrites the raw data — it saves to a new name at Step 7.

## How to report this

Use `E1_5`…`E10_5` in analysis, not `E1`…`E10`, so that all your Likert-type items sit on one 1–5 metric.

When you present descriptives, give **both** ranges so no examiner reads a minimum of 3 as an error:

> All attitudinal items were measured on a five-point scale (1 = strongly disagree to 5 = strongly agree), giving a possible range of 1 to 5. Observed minima ranged from 1 to 3 across items, indicating that the lowest response category was not selected on eleven items. The challenge-severity items, originally captured on a 0–4 metric, were rescaled to 1–5 by adding a constant of one so that all items shared a common metric; this linear transformation left all variances and reliability estimates unchanged.

A short methodological note is worth adding as well: the absence of the bottom category on those eleven items, combined with means clustering between 3.34 and 4.28, points to a **positively skewed response distribution**. If you plan to run parametric tests, check the skewness and kurtosis on these items first, and say in your limitations that acquiescence or social-desirability bias cannot be ruled out in a self-report evaluation of a programme the respondents themselves take part in.
