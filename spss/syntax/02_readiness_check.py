import pyreadstat, pandas as pd, numpy as np
df, meta = pyreadstat.read_sav("data/PLC_responses_SPSS_coded_v2.sav")

print("=== structure ===")
print("cases:", len(df), "| variables:", len(df.columns))
strs = [c for c in df.columns if df[c].dtype == object]
print("string vars:", strs)
print("duplicate ID rows:", int(df.id.duplicated().sum()))

print("\n=== normality: agreement items ===")
AGREE={'Strongly disagree','Disagree','Neutral','Agree','Strongly agree'}
agree=[c for c in df.columns if meta.variable_value_labels.get(c) and set(meta.variable_value_labels[c].values())==AGREE]
sk=df[agree].skew(); ku=df[agree].kurtosis()
print(f"skew  range {sk.min():.2f} .. {sk.max():.2f}   | outside +/-1: {int((sk.abs()>1).sum())} of {len(agree)}")
print(f"kurt  range {ku.min():.2f} .. {ku.max():.2f}   | outside +/-1: {int((ku.abs()>1).sum())} of {len(agree)}")
bad=sk[sk.abs()>1].index.tolist()
print("markedly skewed items:", bad)

print("\n=== careless responding ===")
sd_within = df[agree].std(axis=1)
print(f"within-respondent SD across 54 items: min={sd_within.min():.2f} max={sd_within.max():.2f}")
print("straightliners (SD < 0.30):", int((sd_within<0.30).sum()))

# ---- scales, using reverse-scored versions where they exist ----------------
REV={'B6':'B6_R','C4':'C4_R','D12':'D12_R','F10':'F10_R','G5':'G5_R'}
scales={
 "B Relevance & understanding (B1-B10)": [f"B{i}" for i in range(1,11)],
 "C Resources (C1-C12)":                 [f"C{i}" for i in range(1,13)],
 "D Process fidelity (D4-D13)":          [f"D{i}" for i in range(4,14)],
 "E Challenges (E1_5-E10_5)":            [f"E{i}_5" for i in range(1,11)],
 "F Outcomes (F1-F10)":                  [f"F{i}" for i in range(1,11)],
 "G Equity & sustainability (G1-G7)":    [f"G{i}" for i in range(1,8)],
}
def alpha(X):
    k=X.shape[1]; v=X.var(ddof=1)
    return (k/(k-1))*(1 - v.sum()/X.sum(axis=1).var(ddof=1))

print("\n=== reliability (reverse-scored items substituted) ===")
print(f"{'Scale':<40}{'k':>3}{'alpha':>8}{'mean':>8}{'SD':>7}")
rows=[]
for name,items in scales.items():
    use=[REV.get(i,i) for i in items]
    X=df[use].dropna()
    a=alpha(X); m=X.mean(axis=1)
    print(f"{name:<40}{len(use):>3}{a:>8.3f}{m.mean():>8.2f}{m.std(ddof=1):>7.2f}")
    rows.append((name,use,a))

print("\n=== alpha if item deleted: flags items that hurt a scale ===")
for name,use,a in rows:
    drops=[]
    for it in use:
        rest=[x for x in use if x!=it]
        a2=alpha(df[rest].dropna())
        if a2 > a + 0.02: drops.append((it, round(a2,3)))
    if drops: print(f"  {name}: alpha {a:.3f} -> improves by dropping {drops}")
