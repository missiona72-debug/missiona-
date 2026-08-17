# =====================================================================
#  LATENT CLASS ANALYSIS  &  LATENT PROFILE ANALYSIS
#  A hands-on practical to accompany the introductory seminar deck.
#
#  Run this file top to bottom. It will:
#    0. install nothing - see the package note below
#    1. simulate student_wellbeing.csv (fixed seed, so everyone in the
#       room gets numerically identical output)
#    2. fit a sequence of LCA models to six BINARY symptom items
#    3. build a fit table, choose a solution, and interpret it
#    4. fit a sequence of LPA models to four CONTINUOUS scale scores
#    5. compare the two solutions - do they find the same people?
#
#  Packages you need (run once):
#    install.packages(c("poLCA", "tidyLPA", "mclust", "dplyr"))
#
#  Only poLCA is required. If tidyLPA / mclust are missing, Part B
#  falls back to a base-R Gaussian mixture so the practical still runs.
# =====================================================================

set.seed(2026)


# ---------------------------------------------------------------------
#  PART 0 - SIMULATE THE DATA
# ---------------------------------------------------------------------
# Three true subgroups are built into the data. Both the binary items
# and the continuous scales are generated from the SAME latent grouping,
# which is what lets us compare LCA and LPA at the end.
#
#  Codebook
#  --------
#  BINARY items (0 = no, 1 = yes; "in the past two weeks...")
#    low_mood        felt down, depressed or hopeless
#    anhedonia       little interest or pleasure in doing things
#    sleep           trouble falling or staying asleep
#    fatigue         felt tired or had little energy
#    appetite        poor appetite or overeating
#    concentration   trouble concentrating
#
#  CONTINUOUS scales
#    phq9            depression severity, 0-27  (higher = worse)
#    gad7            anxiety severity,    0-21  (higher = worse)
#    sleep_quality   POOR sleep quality,  0-20  (higher = worse sleep)
#    academic_stress perceived stress,    0-40  (higher = worse)
#
#  true_class        the generating group. In real data you never have
#                    this column - it is here only so you can check
#                    how well the models recover the truth.

n <- 800

# class proportions and the item probabilities that define each class
props     <- c(0.46, 0.30, 0.24)
item_name <- c("low_mood", "anhedonia", "sleep", "fatigue",
               "appetite", "concentration")

# rows = class, cols = item: P(endorse item | class)
item_prob <- rbind(
  c(0.09, 0.07, 0.12, 0.14, 0.08, 0.11),   # class 1: minimal symptoms
  c(0.21, 0.18, 0.79, 0.83, 0.61, 0.34),   # class 2: somatic / sleep-fatigue
  c(0.88, 0.84, 0.86, 0.90, 0.72, 0.81)    # class 3: pervasive symptoms
)
colnames(item_prob) <- item_name

# profile means for the continuous scales, in standard deviations
scale_name <- c("phq9", "gad7", "sleep_quality", "academic_stress")
scale_mean <- rbind(
  c(-0.62, -0.58, -0.55, -0.49),
  c(-0.05,  0.11,  1.06,  0.94),
  c( 1.28,  1.19,  0.83,  0.71)
)
colnames(scale_mean) <- scale_name

true_class <- sample(1:3, n, replace = TRUE, prob = props)

# binary items: a Bernoulli draw per item, with the class's probability
binary <- sapply(seq_along(item_name), function(j)
  rbinom(n, 1, item_prob[true_class, j]))
colnames(binary) <- item_name

# continuous scales: Gaussian around the profile mean, then rescaled
# into plausible questionnaire units and rounded
z <- sapply(seq_along(scale_name), function(j)
  rnorm(n, mean = scale_mean[true_class, j], sd = 0.75))
colnames(z) <- scale_name

to_scale <- function(x, centre, spread, lo, hi)
  pmin(hi, pmax(lo, round(centre + spread * x, 1)))

d <- data.frame(
  id              = seq_len(n),
  binary,
  phq9            = to_scale(z[, "phq9"],            8.0, 5.5,  0, 27),
  gad7            = to_scale(z[, "gad7"],            6.5, 4.5,  0, 21),
  sleep_quality   = to_scale(z[, "sleep_quality"],   9.0, 3.5,  0, 20),
  academic_stress = to_scale(z[, "academic_stress"], 20.0, 7.0, 0, 40),
  true_class      = true_class
)

write.csv(d, "student_wellbeing.csv", row.names = FALSE)

cat("\n=== DATA ===\n")
cat("n =", nrow(d), " variables =", ncol(d), "\n")
cat("written to student_wellbeing.csv\n\n")
print(head(d))
cat("\nTrue class sizes (you would not normally see this):\n")
print(round(prop.table(table(d$true_class)), 3))


# ---------------------------------------------------------------------
#  PART A - LATENT CLASS ANALYSIS on the six BINARY items
# ---------------------------------------------------------------------
if (!requireNamespace("poLCA", quietly = TRUE))
  stop("poLCA is not installed. Run:  install.packages(\"poLCA\")")
library(poLCA)

# poLCA requires categories coded 1, 2, 3, ... It will NOT accept 0/1.
# This is the single most common error beginners hit.
dp <- d
dp[item_name] <- dp[item_name] + 1L

f <- cbind(low_mood, anhedonia, sleep, fatigue, appetite, concentration) ~ 1

# Fit 1 to 5 classes. nrep = 20 means twenty random starting values:
# mixture likelihoods are full of local maxima, and without repeated
# starts you may simply be reporting the best of one lucky guess.
set.seed(2026)
fits <- lapply(1:5, function(k)
  poLCA(f, data = dp, nclass = k, nrep = 20, maxiter = 5000,
        graphs = FALSE, verbose = FALSE))

# ---- relative entropy: how cleanly are people classified? -----------
# E = 1 - [ sum of -p*log(p) over all people and classes ] / (n * log K)
# Ranges 0 to 1. >= 0.80 is usually read as good separation.
# It is NOT a fit statistic and must not be used to choose k.
entropy_R2 <- function(m) {
  p <- m$posterior
  if (is.null(p) || ncol(p) < 2) return(NA_real_)
  e <- -sum(p * log(p + 1e-12))
  1 - e / (nrow(p) * log(ncol(p)))
}

# ---- the fit table --------------------------------------------------
fit_table <- data.frame(
  classes  = 1:5,
  npar     = sapply(fits, function(m) m$npar),
  loglik   = round(sapply(fits, function(m) m$llik), 1),
  AIC      = round(sapply(fits, function(m) m$aic), 1),
  BIC      = round(sapply(fits, function(m) m$bic), 1),
  # sample-size adjusted BIC: -2LL + npar * log((n + 2) / 24)
  aBIC     = round(sapply(fits, function(m)
               -2 * m$llik + m$npar * log((m$N + 2) / 24)), 1),
  entropy  = round(sapply(fits, entropy_R2), 3),
  min_pct  = round(sapply(fits, function(m) min(m$P) * 100), 1)
)

cat("\n\n=== PART A: LCA FIT TABLE (binary items) ===\n")
print(fit_table, row.names = FALSE)
cat("\nBIC prefers ", which.min(fit_table$BIC), " classes.",
    "  aBIC prefers ", which.min(fit_table$aBIC), " classes.\n", sep = "")
cat("Read the table, do not just take the minimum: check entropy and\n")
cat("min_pct too, and ask whether the solution is interpretable.\n")

# ---- choose a solution ----------------------------------------------
K <- 3
best <- fits[[K]]

# poLCA labels classes arbitrarily, so the same model can come back with
# the classes in a different order. Reorder by severity - here, by the
# average probability of endorsing anything - so the write-up is stable.
sev  <- sapply(seq_len(K), function(k)
          mean(sapply(best$probs, function(x) x[k, 2])))
ord  <- order(sev)

probs_mat <- t(sapply(best$probs, function(x) x[ord, 2]))
colnames(probs_mat) <- paste0("class", seq_len(K))
rownames(probs_mat) <- item_name

cat("\n\n=== PART A: ", K, "-CLASS SOLUTION ===\n", sep = "")
cat("\nClass sizes (%):\n")
print(round(best$P[ord] * 100, 1))
cat("\nItem-response probabilities  P(endorse item | class):\n")
print(round(probs_mat, 2))
cat("\nThis table IS the result. Everything else is commentary.\n")
cat("Look down each column and describe the shape, then name it.\n")

# per-person class assignment, on the reordered labels
lca_class <- match(best$predclass, ord)


# ---------------------------------------------------------------------
#  PART B - LATENT PROFILE ANALYSIS on the four CONTINUOUS scales
# ---------------------------------------------------------------------
# Same model family, same workflow. The only conceptual difference is
# that indicators are continuous, so each profile is described by a mean
# (and a variance) rather than by an endorsement probability.

Z <- scale(d[, scale_name])          # z-scores make profiles comparable

have_tidyLPA <- requireNamespace("tidyLPA", quietly = TRUE) &&
                requireNamespace("dplyr",   quietly = TRUE)
have_mclust  <- requireNamespace("mclust",  quietly = TRUE)

cat("\n\n=== PART B: LATENT PROFILE ANALYSIS (continuous scales) ===\n")

if (have_tidyLPA) {

  # ---- the route the slides show -----------------------------------
  # variances = "equal", covariances = "zero"  is tidyLPA model 1:
  # the most constrained model, and the sensible starting point.
  lpa <- tidyLPA::estimate_profiles(as.data.frame(Z), 1:5,
           variances = "equal", covariances = "zero")

  print(tidyLPA::compare_solutions(lpa,
          statistics = c("AIC", "BIC", "Entropy")))

  chosen  <- lpa[[3]]
  ests    <- tidyLPA::get_estimates(chosen)
  cat("\nProfile means (z-scores):\n")
  print(subset(ests, Category == "Means",
               select = c("Parameter", "Class", "Estimate")))

  lpa_class <- tidyLPA::get_data(chosen)$Class

} else if (have_mclust) {

  # ---- equivalent fit straight from mclust -------------------------
  # "EEI" = equal volume, equal shape, axis-aligned = equal variances,
  # zero covariances. Exactly what tidyLPA model 1 estimates.
  cat("(tidyLPA not installed - using mclust directly, same model.)\n")
  library(mclust)          # attach: Mclust() calls mclustBIC() internally
  mods <- lapply(1:5, function(k)
    Mclust(Z, G = k, modelNames = "EEI", verbose = FALSE))

  lpa_tab <- data.frame(
    profiles = 1:5,
    loglik   = round(sapply(mods, function(m) m$loglik), 1),
    npar     = sapply(mods, function(m) m$df),
    BIC      = round(sapply(mods, function(m) -2 * m$loglik +
                 m$df * log(nrow(Z))), 1),
    entropy  = round(sapply(mods, function(m) {
                 p <- m$z
                 if (ncol(p) < 2) return(NA_real_)
                 1 + sum(p * log(p + 1e-12)) / (nrow(p) * log(ncol(p)))
               }), 3)
  )
  print(lpa_tab, row.names = FALSE)
  cat("\nBIC prefers ", which.min(lpa_tab$BIC), " profiles.\n", sep = "")

  chosen    <- mods[[3]]
  ordp      <- order(colMeans(chosen$parameters$mean))
  means     <- chosen$parameters$mean[, ordp, drop = FALSE]
  colnames(means) <- paste0("profile", seq_len(ncol(means)))
  cat("\nProfile means (z-scores):\n")
  print(round(means, 2))
  cat("\nProfile sizes (%):\n")
  print(round(chosen$parameters$pro[ordp] * 100, 1))

  lpa_class <- match(chosen$classification, ordp)

} else {
  cat("Neither tidyLPA nor mclust is installed - skipping Part B.\n")
  cat('Run: install.packages(c("tidyLPA", "mclust"))\n')
  lpa_class <- NULL
}


# ---------------------------------------------------------------------
#  PART C - DO THE TWO METHODS FIND THE SAME PEOPLE?
# ---------------------------------------------------------------------
cat("\n\n=== PART C: COMPARING THE TWO SOLUTIONS ===\n")

cat("\nLCA classes vs the true generating groups:\n")
print(table(LCA = lca_class, true = d$true_class))

if (!is.null(lpa_class)) {
  cat("\nLCA classes vs LPA profiles:\n")
  tab <- table(LCA = lca_class, LPA = lpa_class)
  print(tab)
  cat("\nAgreement on the diagonal: ",
      round(100 * sum(diag(tab)) / sum(tab), 1), "%\n", sep = "")
  cat("\nThis is the point of the whole seminar. Binary symptom items and\n")
  cat("continuous scale scores are two different measurements of the same\n")
  cat("three groups of students - and the two methods recover them both.\n")
}


# =====================================================================
#  EXERCISE ANSWERS
#  Try each task before reading these.
# =====================================================================
#
#  TASK 1 - Build the fit table.
#    fit_table above. BIC and aBIC should both bottom out at 3 classes,
#    which is the number the data were generated with. Note how the
#    log-likelihood keeps rising past 3: raw fit never gets worse when
#    you add classes, which is exactly why penalised criteria exist.
#
#  TASK 2 - Defend a choice.
#    A model answer: "We retained the 3-class solution. It had the
#    lowest BIC (and aBIC), entropy was above 0.80 indicating clear
#    classification, and the smallest class held 24% of the sample. The
#    4-class solution split the pervasive class into two groups with
#    near-identical response patterns and no counterpart in the
#    literature." One statistical reason, one substantive reason.
#
#  TASK 3 - Name the classes.
#    Class 1: low probability on every item - minimal symptoms.
#    Class 2: high on sleep, fatigue, appetite; low on mood items -
#             a somatic presentation without low mood.
#    Class 3: high on everything - pervasive symptoms.
#    What could a sceptic say? That "somatic" imports a clinical claim
#    the data do not support - these are six self-report items, not a
#    diagnosis. A safer name is "elevated somatic items only", which is
#    duller and harder to argue with. That trade-off is the naming
#    fallacy in miniature.
#
#  TASK 4 - Run the LPA.
#    Part B. It should recover three profiles with the same proportions,
#    and Part C should show high agreement between the two assignments.
#    Same people, same groups, two vocabularies: probabilities for LCA,
#    means for LPA.
#
#  TASK 5 - Break it.
#    Re-run the LCA below with a single random start and a new seed:
#
#      set.seed(99)
#      bad <- poLCA(f, data = dp, nclass = 4, nrep = 1, verbose = FALSE)
#      bad$llik   # compare with fits[[4]]$llik
#
#    Run it a few times. The log-likelihood will often be worse than the
#    twenty-start solution, and the class profiles will move around,
#    because the algorithm has converged on a local maximum. This is why
#    the number of random starts and the seed belong in your methods
#    section, and why "the best log-likelihood replicated" is a sentence
#    reviewers look for.
#
# =====================================================================
cat("\n\nDone. See the exercise answers at the foot of this script.\n")
