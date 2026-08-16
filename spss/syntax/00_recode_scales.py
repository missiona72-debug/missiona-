"""
PLC evaluation data - scale metric rectification.

Purpose
-------
Bring every 5-point Likert-type item onto a common 1-5 metric and produce an
auditable possible-vs-observed range table.

What is corrected
-----------------
E1-E10 (challenge severity) were coded 0-4. They are recoded to 1-5 as new
variables E1_5 ... E10_5. Originals are preserved.

What is deliberately NOT corrected
----------------------------------
The 54 agreement items (B, C, D4-D13, F, G) are already coded 1-5 with correct
value labels. Where FREQUENCIES reports a minimum of 2 or 3, that is the
OBSERVED minimum: no respondent selected the lower option. Overwriting those
values would fabricate data.
"""
import pyreadstat, pandas as pd, numpy as np, json

SRC = "/root/.claude/uploads/8ca64b1c-573b-5012-8753-3c6088e3af0a/4fbcfd1c-PLC_responses_SPSS_coded.sav"
OUT = "/home/user/missiona-/spss/data/PLC_responses_SPSS_coded_v2.sav"

df, meta = pyreadstat.read_sav(SRC)

AGREE = {'Strongly disagree','Disagree','Neutral','Agree','Strongly agree'}
agree_items = [c for c in df.columns
               if meta.variable_value_labels.get(c)
               and set(meta.variable_value_labels[c].values()) == AGREE]
sev_items = [f"E{i}" for i in range(1, 11)]

# ---- correction: shift severity items from 0-4 to 1-5 -----------------------
sev_labels = {1.0:'Not a challenge', 2.0:'Minor challenge', 3.0:'Moderate challenge',
              4.0:'Serious challenge', 5.0:'Very serious challenge'}
new_labels  = dict(meta.variable_value_labels)
new_varlabs = dict(meta.column_names_to_labels)
new_measure = dict(meta.variable_measure)

for c in sev_items:
    nc = f"{c}_5"
    df[nc] = df[c] + 1
    new_labels[nc]  = dict(sev_labels)
    new_varlabs[nc] = f"{new_varlabs.get(c, c)} [rescaled 1-5]"
    new_measure[nc] = 'ordinal'

# sanity: linear shift must preserve rank order and spread exactly
for c in sev_items:
    assert (df[f"{c}_5"] - df[c] == 1).all()
    assert abs(df[f"{c}_5"].std() - df[c].std()) < 1e-12

# ---- range verification table ----------------------------------------------
def possible_range(c):
    lab = new_labels.get(c)
    return (min(lab), max(lab)) if lab else (np.nan, np.nan)

rows = []
groups = [("Agreement Likert (1-5)", agree_items),
          ("Severity - ORIGINAL 0-4", sev_items),
          ("Severity - RECODED 1-5", [f"{c}_5" for c in sev_items]),
          ("Ordinal count/frequency bands", ["A8","D1","D3"]),
          ("Dichotomous", ["A9"]),
          ("Other ordinal", ["A4","A5","A6","A7","D2"])]

for gname, items in groups:
    for c in items:
        pmin, pmax = possible_range(c)
        s = df[c]
        rows.append(dict(Group=gname, Variable=c,
                         Poss_Min=pmin, Poss_Max=pmax,
                         Obs_Min=s.min(), Obs_Max=s.max(),
                         N=int(s.notna().sum()), Missing=int(s.isna().sum()),
                         Mean=round(float(s.mean()), 2), SD=round(float(s.std(ddof=1)), 2),
                         Floor_unused=bool(s.min() > pmin),
                         Ceiling_unused=bool(s.max() < pmax)))

rng = pd.DataFrame(rows)
rng.to_csv("/home/user/missiona-/spss/output/range_verification.csv", index=False)

# ---- out-of-range audit ----------------------------------------------------
viol = [ (c, sorted(set(df[c].dropna()) - set(new_labels[c])))
         for c in new_labels if set(df[c].dropna()) - set(new_labels[c]) ]
print("Undefined/out-of-range codes:", viol if viol else "NONE - every value maps to a defined label")

pyreadstat.write_sav(df, OUT,
                     column_labels=[new_varlabs.get(c, "") for c in df.columns],
                     variable_value_labels=new_labels,
                     variable_measure=new_measure)

print(f"\nWrote {OUT}  ({len(df)} cases, {len(df.columns)} variables)")
print(f"Agreement items on 1-5: {len(agree_items)}   |   Severity items rescaled: {len(sev_items)}")
print("\nFloor not used (observed min > possible min), agreement items:")
sub = rng[(rng.Group=="Agreement Likert (1-5)") & rng.Floor_unused]
print(sub[["Variable","Poss_Min","Obs_Min","Obs_Max","Mean","SD"]].to_string(index=False))
