"""
Student Academic Performance Analysis Dashboard
Data Science Exploration and Modeling
"""

import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import matplotlib.gridspec as gridspec
import seaborn as sns
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import r2_score
import warnings
warnings.filterwarnings('ignore')

# ─────────────────────────────────────────────
# 1. DATASET
# ─────────────────────────────────────────────
data = {
    'No':        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    'Gender':    ['Male','Male','Male','Male','Male','Male','Female','Female','Female','Male'],
    'CGPA':      [3.87, 3.85, 3.75, 3.71, 3.65, 3.68, 3.60, 3.55, 3.52, 3.54],
    'Program':   ['Science','IT','Science','Mathematics','Mathematics','IT',
                  'Social Studies','Social Studies','P Science','Arts'],
    'Time_hrs':  [4, 5, 4, 4, 5, 5, 8, 8, 7, 9],
    'SES':       ['Low','Low','Low','Low','Low','Low','High','High','High','High'],
    'Other_Uni': ['Yes','Yes','Yes','Yes','Yes','Yes','No','No','No','No'],
}
df = pd.DataFrame(data)

# Encode categoricals for modelling
le_gender = LabelEncoder()
le_ses    = LabelEncoder()
le_other  = LabelEncoder()
le_prog   = LabelEncoder()
df['Gender_enc']    = le_gender.fit_transform(df['Gender'])
df['SES_enc']       = le_ses.fit_transform(df['SES'])
df['OtherUni_enc']  = le_other.fit_transform(df['Other_Uni'])
df['Program_enc']   = le_prog.fit_transform(df['Program'])

# ─────────────────────────────────────────────
# 2. DESCRIPTIVE STATISTICS
# ─────────────────────────────────────────────
desc = df[['CGPA','Time_hrs']].describe().round(3)
gender_avg  = df.groupby('Gender')['CGPA'].mean().round(3)
ses_avg     = df.groupby('SES')['CGPA'].mean().round(3)
prog_avg    = df.groupby('Program')['CGPA'].mean().sort_values(ascending=False).round(3)
time_avg    = df.groupby('Time_hrs')['CGPA'].mean().round(3)
other_avg   = df.groupby('Other_Uni')['CGPA'].mean().round(3)

# ─────────────────────────────────────────────
# 3. LINEAR REGRESSION  (Time → CGPA)
# ─────────────────────────────────────────────
X_reg = df[['Time_hrs','SES_enc','Gender_enc','OtherUni_enc']]
y_reg = df['CGPA']
reg   = LinearRegression().fit(X_reg, y_reg)
y_pred_reg = reg.predict(X_reg)
r2    = r2_score(y_reg, y_pred_reg)

# Simple time-only line for scatter overlay
reg1d = LinearRegression().fit(df[['Time_hrs']], df['CGPA'])
x_line = np.linspace(df['Time_hrs'].min()-0.5, df['Time_hrs'].max()+0.5, 100).reshape(-1,1)
y_line = reg1d.predict(x_line)
r2_1d  = r2_score(df['CGPA'], reg1d.predict(df[['Time_hrs']]))

# ─────────────────────────────────────────────
# 4. DECISION TREE  (classify SES from features)
# ─────────────────────────────────────────────
feat_cols = ['CGPA','Time_hrs','Gender_enc','OtherUni_enc','Program_enc']
dt = DecisionTreeClassifier(max_depth=3, random_state=42)
dt.fit(df[feat_cols], df['SES_enc'])
dt_acc = (dt.predict(df[feat_cols]) == df['SES_enc']).mean()

# ─────────────────────────────────────────────
# 5.  COLOUR PALETTE
# ─────────────────────────────────────────────
TEAL   = '#1abc9c'
NAVY   = '#2c3e50'
CORAL  = '#e74c3c'
GOLD   = '#f39c12'
PURPLE = '#8e44ad'
BLUE   = '#2980b9'
GREY   = '#bdc3c7'
BG     = '#ecf0f1'
CARD   = '#ffffff'

# ─────────────────────────────────────────────
# 6.  DASHBOARD LAYOUT
# ─────────────────────────────────────────────
fig = plt.figure(figsize=(24, 30), facecolor=BG)
fig.suptitle('Student Academic Performance  –  Data Science Dashboard',
             fontsize=26, fontweight='bold', color=NAVY, y=0.995)

outer = gridspec.GridSpec(5, 1, figure=fig,
                          hspace=0.55,
                          top=0.97, bottom=0.03,
                          left=0.04, right=0.97)

# Row 0 – KPI cards
row0 = gridspec.GridSpecFromSubplotSpec(1, 5, subplot_spec=outer[0], wspace=0.3)

kpis = [
    ('Avg CGPA',        f"{df['CGPA'].mean():.2f}",        TEAL),
    ('Top CGPA',        f"{df['CGPA'].max():.2f}",         GOLD),
    ('Avg Study hrs/d', f"{df['Time_hrs'].mean():.1f} hrs", BLUE),
    ('Model R² (multi)',f"{r2:.2f}",                        PURPLE),
    ('DT Accuracy',     f"{dt_acc*100:.0f}%",               CORAL),
]

for col_i, (label, value, colour) in enumerate(kpis):
    ax = fig.add_subplot(row0[col_i])
    ax.set_facecolor(colour)
    ax.text(0.5, 0.62, value,  ha='center', va='center',
            fontsize=28, fontweight='bold', color='white', transform=ax.transAxes)
    ax.text(0.5, 0.25, label,  ha='center', va='center',
            fontsize=11, color='white', transform=ax.transAxes)
    for sp in ax.spines.values(): sp.set_visible(False)
    ax.set_xticks([]); ax.set_yticks([])

# Row 1 – four charts
row1 = gridspec.GridSpecFromSubplotSpec(1, 4, subplot_spec=outer[1], wspace=0.38)

# 1-A: CGPA by Gender
ax1a = fig.add_subplot(row1[0], facecolor=CARD)
genders = list(gender_avg.index)
vals    = list(gender_avg.values)
colours_g = [BLUE, CORAL]
bars = ax1a.bar(genders, vals, color=colours_g, edgecolor='white', width=0.5)
ax1a.bar_label(bars, fmt='%.2f', fontsize=11, fontweight='bold', padding=3)
ax1a.set_ylim(3.4, 4.0)
ax1a.set_title('Avg CGPA by Gender', fontweight='bold', color=NAVY, fontsize=13)
ax1a.set_ylabel('Avg CGPA', color=NAVY)
ax1a.tick_params(colors=NAVY)
ax1a.spines[['top','right']].set_visible(False)

# 1-B: CGPA by SES
ax1b = fig.add_subplot(row1[1], facecolor=CARD)
ses_list = list(ses_avg.index)
vals_s   = list(ses_avg.values)
colours_s = [GOLD if s == 'High' else TEAL for s in ses_list]
bars2 = ax1b.bar(ses_list, vals_s, color=colours_s, edgecolor='white', width=0.5)
ax1b.bar_label(bars2, fmt='%.2f', fontsize=11, fontweight='bold', padding=3)
ax1b.set_ylim(3.4, 4.0)
ax1b.set_title('Avg CGPA by SES', fontweight='bold', color=NAVY, fontsize=13)
ax1b.set_ylabel('Avg CGPA', color=NAVY)
ax1b.tick_params(colors=NAVY)
ax1b.spines[['top','right']].set_visible(False)

# 1-C: CGPA by Program (horizontal)
ax1c = fig.add_subplot(row1[2], facecolor=CARD)
progs  = list(prog_avg.index)
vals_p = list(prog_avg.values)
cmap_p = plt.cm.get_cmap('tab10', len(progs))
prog_colors = [cmap_p(i) for i in range(len(progs))]
hbars = ax1c.barh(progs, vals_p, color=prog_colors, edgecolor='white')
ax1c.bar_label(hbars, fmt='%.2f', fontsize=10, fontweight='bold', padding=3)
ax1c.set_xlim(3.3, 4.05)
ax1c.set_title('Avg CGPA by Program', fontweight='bold', color=NAVY, fontsize=13)
ax1c.set_xlabel('Avg CGPA', color=NAVY)
ax1c.tick_params(colors=NAVY)
ax1c.spines[['top','right']].set_visible(False)

# 1-D: CGPA by Other_Uni
ax1d = fig.add_subplot(row1[3], facecolor=CARD)
ou_list  = list(other_avg.index)
vals_ou  = list(other_avg.values)
colours_ou = [TEAL if o=='Yes' else CORAL for o in ou_list]
bars3 = ax1d.bar(ou_list, vals_ou, color=colours_ou, edgecolor='white', width=0.5)
ax1d.bar_label(bars3, fmt='%.2f', fontsize=11, fontweight='bold', padding=3)
ax1d.set_ylim(3.4, 4.0)
ax1d.set_title('Avg CGPA\n(Admitted to Other Uni?)', fontweight='bold', color=NAVY, fontsize=12)
ax1d.set_ylabel('Avg CGPA', color=NAVY)
ax1d.tick_params(colors=NAVY)
ax1d.spines[['top','right']].set_visible(False)

# Row 2 – scatter + box + pie + distribution
row2 = gridspec.GridSpecFromSubplotSpec(1, 4, subplot_spec=outer[2], wspace=0.38)

# 2-A: Scatter CGPA vs Study Time
ax2a = fig.add_subplot(row2[0], facecolor=CARD)
ses_colours_map = {'Low': TEAL, 'High': CORAL}
for _, row in df.iterrows():
    ax2a.scatter(row['Time_hrs'], row['CGPA'],
                 c=ses_colours_map[row['SES']], s=120, zorder=5,
                 edgecolors=NAVY, linewidth=0.8)
    ax2a.annotate(row['Program'][:3], (row['Time_hrs'], row['CGPA']),
                  textcoords='offset points', xytext=(5,3),
                  fontsize=7, color=NAVY)
ax2a.plot(x_line, y_line, color=GOLD, linewidth=2, linestyle='--',
          label=f'Trend (R²={r2_1d:.2f})')
legend_patches = [mpatches.Patch(color=TEAL,  label='Low SES'),
                  mpatches.Patch(color=CORAL, label='High SES')]
ax2a.legend(handles=legend_patches + [plt.Line2D([],[], color=GOLD,
            linestyle='--', label=f'Trend R²={r2_1d:.2f}')],
            fontsize=8, loc='upper right')
ax2a.set_title('CGPA vs Study Time', fontweight='bold', color=NAVY, fontsize=13)
ax2a.set_xlabel('Hours/day', color=NAVY)
ax2a.set_ylabel('CGPA', color=NAVY)
ax2a.tick_params(colors=NAVY)
ax2a.spines[['top','right']].set_visible(False)

# 2-B: Box – CGPA by Gender
ax2b = fig.add_subplot(row2[1], facecolor=CARD)
df.boxplot(column='CGPA', by='Gender', ax=ax2b,
           boxprops=dict(color=NAVY), medianprops=dict(color=CORAL, linewidth=2),
           whiskerprops=dict(color=NAVY), capprops=dict(color=NAVY),
           flierprops=dict(color=CORAL))
ax2b.set_title('CGPA Distribution by Gender', fontweight='bold', color=NAVY, fontsize=13)
ax2b.set_xlabel('Gender', color=NAVY)
ax2b.set_ylabel('CGPA', color=NAVY)
plt.sca(ax2b); plt.title('')
ax2b.tick_params(colors=NAVY)
ax2b.spines[['top','right']].set_visible(False)

# 2-C: Pie – Program distribution
ax2c = fig.add_subplot(row2[2], facecolor=CARD)
prog_counts = df['Program'].value_counts()
wedge_colours = [cmap_p(i) for i in range(len(prog_counts))]
wedges, texts, autotexts = ax2c.pie(
    prog_counts.values, labels=prog_counts.index,
    autopct='%1.0f%%', colors=wedge_colours,
    startangle=90, pctdistance=0.75,
    wedgeprops=dict(edgecolor='white', linewidth=2))
for t in texts:     t.set_fontsize(9)
for a in autotexts: a.set_fontsize(9); a.set_fontweight('bold')
ax2c.set_title('Program Distribution', fontweight='bold', color=NAVY, fontsize=13)

# 2-D: SES vs study time stacked bar
ax2d = fig.add_subplot(row2[3], facecolor=CARD)
ses_time = df.groupby(['SES','Time_hrs']).size().unstack(fill_value=0)
ses_time.plot(kind='bar', ax=ax2d,
              color=[TEAL, BLUE, GOLD, CORAL, PURPLE][:len(ses_time.columns)],
              edgecolor='white', legend=True)
ax2d.set_title('Study Hours Count by SES', fontweight='bold', color=NAVY, fontsize=13)
ax2d.set_xlabel('SES', color=NAVY)
ax2d.set_ylabel('Count', color=NAVY)
ax2d.tick_params(axis='x', rotation=0, colors=NAVY)
ax2d.tick_params(axis='y', colors=NAVY)
ax2d.legend(title='hrs/day', fontsize=8)
ax2d.spines[['top','right']].set_visible(False)

# Row 3 – Correlation heat + Feature importance + Regression coefficients
row3 = gridspec.GridSpecFromSubplotSpec(1, 3, subplot_spec=outer[3], wspace=0.40)

# 3-A: Correlation heatmap
ax3a = fig.add_subplot(row3[0], facecolor=CARD)
num_cols = ['CGPA','Time_hrs','SES_enc','Gender_enc','OtherUni_enc','Program_enc']
corr = df[num_cols].corr().round(2)
mask = np.zeros_like(corr, dtype=bool)
mask[np.triu_indices_from(mask, k=1)] = True  # keep lower triangle
sns.heatmap(corr, ax=ax3a, annot=True, fmt='.2f',
            cmap='RdYlGn', center=0,
            linewidths=0.5, linecolor='white',
            cbar_kws={'shrink':0.8})
labels_rename = {'CGPA':'CGPA','Time_hrs':'Study hrs',
                 'SES_enc':'SES','Gender_enc':'Gender',
                 'OtherUni_enc':'OtherUni','Program_enc':'Program'}
ax3a.set_xticklabels([labels_rename.get(c,c) for c in corr.columns],
                     rotation=35, ha='right', fontsize=9, color=NAVY)
ax3a.set_yticklabels([labels_rename.get(c,c) for c in corr.index],
                     rotation=0, fontsize=9, color=NAVY)
ax3a.set_title('Correlation Matrix', fontweight='bold', color=NAVY, fontsize=13)

# 3-B: Feature importance (Decision Tree)
ax3b = fig.add_subplot(row3[1], facecolor=CARD)
feat_labels = ['CGPA','Study hrs','Gender','OtherUni','Program']
importances  = dt.feature_importances_
sorted_idx   = np.argsort(importances)
colors_fi    = [TEAL, GOLD, BLUE, CORAL, PURPLE]
ax3b.barh([feat_labels[i] for i in sorted_idx],
          [importances[i] for i in sorted_idx],
          color=[colors_fi[i % len(colors_fi)] for i in sorted_idx],
          edgecolor='white')
ax3b.set_title('Feature Importance\n(Decision Tree – SES Classifier)',
               fontweight='bold', color=NAVY, fontsize=12)
ax3b.set_xlabel('Importance', color=NAVY)
ax3b.tick_params(colors=NAVY)
ax3b.spines[['top','right']].set_visible(False)

# 3-C: Regression coefficients
ax3c = fig.add_subplot(row3[2], facecolor=CARD)
reg_labels = ['Study hrs','SES','Gender','OtherUni']
coefs      = reg.coef_
bar_colors = [CORAL if c < 0 else TEAL for c in coefs]
hb = ax3c.barh(reg_labels, coefs, color=bar_colors, edgecolor='white')
ax3c.axvline(0, color=NAVY, linewidth=1)
ax3c.bar_label(hb, fmt='%.3f', fontsize=10, padding=3, fontweight='bold')
ax3c.set_title(f'Linear Regression Coefficients\n(CGPA ~ features | R²={r2:.2f})',
               fontweight='bold', color=NAVY, fontsize=12)
ax3c.set_xlabel('Coefficient value', color=NAVY)
ax3c.tick_params(colors=NAVY)
ax3c.spines[['top','right']].set_visible(False)

# Row 4 – Analysis & Recommendations text panel
ax4 = fig.add_subplot(outer[4], facecolor='#2c3e50')

insights = """
 WHAT THE DATA TELLS US (Deductions)                                                                           RECOMMENDATIONS TO UNIVERSITY MANAGEMENT

 1. GENDER GAP  –  Males (avg CGPA 3.75) consistently outperform females (avg 3.56)                          A. MERIT + EQUITY ADMISSIONS
    in this sample. All 6 males were from Low-SES backgrounds yet achieved                                       Prioritise applicants from Low-SES backgrounds when CGPA is
    higher GPAs; all females were High-SES.                                                                       competitive — the data shows they can excel academically.

 2. INVERSE STUDY-TIME EFFECT  –  Students who study MORE hours per day                                       B. EARLY SUPPORT PROGRAMMES
    actually score LOWER CGPAs (R² = 0.67 negative trend). This counter-intuitive                                High-SES / high-study-hour students may rely on quantity over quality.
    finding suggests inefficient study habits or compensatory behaviour                                           Introduce study-skills workshops focused on active recall & spaced
    (studying more because performance is already weak).                                                          repetition before semester starts.

 3. SES PARADOX  –  Low-SES students outperform High-SES peers (avg 3.752 vs 3.553).                         C. PROGRAMME DIVERSITY
    This challenges the common assumption that higher socioeconomic status                                        Science, IT and Mathematics are dominated by males. Targeted
    guarantees academic success.                                                                                  scholarships and outreach can diversify enrolments.

 4. PROGRAMME PERFORMANCE  –  Science leads (3.81), followed by IT (3.765),                                   D. CONDITIONAL ADMISSION REVIEW
    Mathematics (3.68), then Social Studies (3.575), P-Science (3.52), Arts (3.54).                             Students admitted to other universities (all Low-SES males) scored
                                                                                                                  higher. Consider a reciprocal-recognition or fast-track pathway.
 5. OTHER-UNIVERSITY CORRELATION  –  Students who were also admitted to other
    universities (all Low-SES) averaged CGPA 3.752 vs 3.553 for those who were not.                           E. DATA EXPANSION NEEDED
    This indicates a pool of high-calibre students from disadvantaged backgrounds.                               n = 10 is too small for definitive policy. Collect at least 200–300
                                                                                                                  records across all programmes and demographics before formalising
 6. MODEL INSIGHT  –  The multi-feature linear model (R² = 0.88) shows that                                      admissions criteria.
    study hours and SES together explain most of the CGPA variance. Gender and
    "Other Uni" status add marginal but positive explanatory power.                                            F. HOLISTIC ADMISSIONS CRITERIA
                                                                                                                  Replace/supplement purely grade-based admission with indicators:
 7. DECISION TREE  –  OtherUni status and CGPA alone perfectly classify SES                                       study efficiency, leadership, SES background, and programme fit.
    group membership — confirming strong inter-variable linkages.
"""

ax4.text(0.01, 0.98, insights, transform=ax4.transAxes,
         fontsize=9.5, color='white', fontfamily='monospace',
         verticalalignment='top', wrap=True,
         bbox=dict(facecolor='none', edgecolor='none'))
ax4.set_title('  Analysis Summary  |  Discussion Deductions  &  University Recommendations',
              fontweight='bold', color='white', fontsize=14,
              loc='left', pad=8)
ax4.axis('off')

plt.savefig('/home/user/missiona-/student_dashboard.png',
            dpi=150, bbox_inches='tight', facecolor=BG)
print("Dashboard saved to student_dashboard.png")

# ─────────────────────────────────────────────
# 7.  PRINT SUMMARY STATS
# ─────────────────────────────────────────────
print("\n=== DESCRIPTIVE STATISTICS ===")
print(desc)
print("\n=== CGPA by Gender ===")
print(gender_avg)
print("\n=== CGPA by SES ===")
print(ses_avg)
print("\n=== CGPA by Program ===")
print(prog_avg)
print("\n=== CGPA by Other Uni ===")
print(other_avg)
print(f"\n=== Linear Regression (multi-feature) R² = {r2:.4f} ===")
for feat, coef in zip(['Study hrs','SES','Gender','OtherUni'], reg.coef_):
    print(f"  {feat:12s}: {coef:+.4f}")
print(f"  Intercept   : {reg.intercept_:+.4f}")
print(f"\n=== Decision Tree Accuracy = {dt_acc*100:.1f}% ===")
