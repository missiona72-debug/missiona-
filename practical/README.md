# Practical: Latent Class Analysis and Latent Profile Analysis

The hands-on companion to the seminar deck in `slides/`. Budget about 30 minutes.

## What you need

```r
install.packages(c("poLCA", "tidyLPA", "mclust", "dplyr"))
```

Only **poLCA** is strictly required. If `tidyLPA` is missing, the script falls
back to `mclust` and fits the identical model; if both are missing it skips
Part B and tells you so.

## Running it

```r
setwd("practical")     # or open the file in RStudio from this folder
source("lca_lpa_practical.R")
```

The script writes `student_wellbeing.csv` on its first run, so you can also open
the same data in Stata, Mplus or SPSS if you would rather work there.

## The dataset

800 simulated students, generated from a fixed seed so everyone gets identical
results. **Three true subgroups are built into the data**, and both blocks of
variables are generated from that same grouping — which is what lets you compare
the two methods at the end.

| Block | Variables | Type | Use for |
|---|---|---|---|
| Symptom items | `low_mood`, `anhedonia`, `sleep`, `fatigue`, `appetite`, `concentration` | binary, 0/1 | **LCA** |
| Scale scores | `phq9`, `gad7`, `sleep_quality`, `academic_stress` | continuous | **LPA** |
| Truth | `true_class` | 1/2/3 | checking your answer only |

`sleep_quality` is scored so that **higher means worse sleep**. `true_class` is
never available in real data — it is here purely so you can see how well the
models recover something you already know the answer to.

## The five tasks

**1. Build the fit table.**
Fit 1–5 classes and tabulate log-likelihood, AIC, BIC, aBIC, entropy and
smallest class size. Which solution does BIC prefer? Does aBIC agree?
*Watch what the log-likelihood does as classes are added, and work out why that
means you can never select on log-likelihood alone.*

**2. Defend a choice.**
Pick a solution and write two sentences justifying it — using at least one
statistical reason and one substantive reason. This is the sentence that goes in
your results section, so write it as you would submit it.

**3. Name the classes.**
Read the item-response probabilities and give each class a name. Then, for each
name, write down what a sceptical reader could object to. If you cannot think of
an objection, the name is probably doing more work than the evidence supports.

**4. Run the LPA.**
Repeat on the four continuous scales. Does it recover the same number of groups?
Do the same people end up together? Cross-tabulate the two class assignments and
look at the diagonal.

**5. Break it.**
Re-run the LCA with `nrep = 1` and a different seed, several times over. Does the
solution change? What does that tell you about why the number of random starts
and the seed belong in a methods section?

*If you only have time for one task, do task 5 — it shows you on your own screen
why random starts are not optional.*

## Answers

Worked answers to all five are in the comment block at the foot of
`lca_lpa_practical.R`. Try each task before reading them.

## What you should end up believing

LCA and LPA are the same model. Categorical indicators → LCA. Continuous
indicators → LPA. The workflow, the fit statistics, the judgement calls and the
responsibility that comes with naming a class are identical in both.
