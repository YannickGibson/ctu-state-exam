# Algoritmy pro řešení chybějících hodnot, detekci odlehlých hodnot a vyvažování dat.

Zdroj: [PDD_Merged.pdf](/pdfs/ZI/PDD_Merged.pdf) (slides NI-PDD, Lectures 4–5 — Problems in data, data cleaning)

---

## Problémy v reálných datech

Real-world data jsou "dirty": noisy, **incomplete** (missing values), inconsistent, invalid, non-representative, **unbalanced**. ([otevřít v PDF, str. 156](/pdfs/ZI/PDD_Merged.pdf#page=156))

![Problems in data](/answer-imgs/NI-ZI-5/p156_problems.png)

---

## Chybějící hodnoty (Missing values)

Mohou se objevit jako `<prázdné>`, `0`, `.`, `999`, `NA`. **Nelze automaticky odlišit missing vs empty**: prázdná hodnota může znamenat "nezadáno" i "skutečně nic". ([otevřít v PDF, str. 161](/pdfs/ZI/PDD_Merged.pdf#page=161))

![Missing values](/answer-imgs/NI-ZI-5/p161_missing.png)

**Typy missingness** (Little & Rubin):
- **MCAR** (Missing Completely At Random) — nezávisí ani na pozorovaných ani nepozorovaných hodnotách.
- **MAR** (Missing At Random) — závisí jen na pozorovaných hodnotách.
- **MNAR** (Missing Not At Random) — závisí na samotné nepozorované hodnotě.

### Metody řešení

1. **Listwise deletion** (Method 1) — odstraň záznamy s chybějícími hodnotami. Ztráta dat, jen pro MCAR. ([otevřít v PDF, str. 170](/pdfs/ZI/PDD_Merged.pdf#page=170))
2. **Mean/median imputation** (Method 2) — doplň průměrem/mediánem sloupce. Jednoduché, ale podceňuje rozptyl.
3. **Mode imputation** pro kategorické proměnné.
4. **Regression imputation** — natrénuj model predikující chybějící hodnoty z ostatních sloupců.
5. **k-NN imputation** — doplň průměrem $k$ nejbližších sousedů.
6. **Multiple imputation** (MICE) — sad multiple imputed datasets, agregace výsledků.
7. **EM algoritmus** — pro modely s latentními proměnnými.
8. **Indicator variable** — přidej příznak "byla hodnota chybějící" (informativní missingness).

![Imputation methods](/answer-imgs/NI-ZI-5/p173_imputation.png)

---

## Odlehlé hodnoty (Outliers)

**Definice**: hodnoty výrazně odlišné od většiny dat. Mohou být chyby nebo pravé extrémy.

### Detekce

- **Z-score**: $|z| = |(x - \mu)/\sigma| > 3$ pro normální data.
- **IQR rule**: outlier pokud $x < Q_1 - 1.5 \mathrm{IQR}$ nebo $x > Q_3 + 1.5 \mathrm{IQR}$. Boxplot.
- **Mahalanobisova vzdálenost**: $d_M(x) = (x - \mu)^T \Sigma^{-1} (x - \mu)$ — multivariate, zohlední korelace.
- **Local Outlier Factor (LOF)**: poměr lokální hustoty bodu vs jeho sousedů; LOF $\gg 1$ → outlier.
- **Isolation Forest**: outliers jsou snadno izolovatelné náhodnými řezy → mají krátké path v stromu.
- **One-class SVM** — odhad supportu rozdělení; vně support = outlier.
- **DBSCAN** noise points jsou outliers.

### Řešení

Odstranit, ponechat, **winsorize** (oříznout na percentily), transformovat (log, Box-Cox), použít robustní statistiky (median, IQR).

---

## Vyvažování dat (Class imbalance)

Když je jedna třída výrazně dominantnější (např. fraud detection: 0.1 % fraudů). Klasifikátory mají tendenci predikovat majority class.

### Metriky pro nevyvážená data

Accuracy je zavádějící. Lepší: **precision, recall, F1, ROC-AUC, PR-AUC, Matthews correlation coefficient**.

### Algoritmy

**Sampling-based**:
- **Random undersampling** — náhodně odeber z majority class. Ztrácí informaci.
- **Random oversampling** — duplikuj minority. Overfitting.
- **SMOTE (Synthetic Minority Oversampling Technique)** — pro minority bod $x$ a jeho k-NN sousedy z minority class generuje syntetické body interpolací: $x_{\mathrm{new}} = x + \lambda(x_{\mathrm{NN}} - x)$, $\lambda \sim U(0,1)$.
- **Borderline-SMOTE** — generuje jen v okolí decision boundary.
- **ADASYN (Adaptive Synthetic)** — více syntetických bodů kolem obtížných minority bodů.
- **Tomek links** — odstraní pairs nejbližších bodů z různých tříd.
- **NearMiss** — undersampling podle vzdálenosti k minority.

**Algorithm-level**:
- **Class weights** — vyšší váha minority class v loss funkci.
- **Cost-sensitive learning** — různé náklady za FN vs FP.
- **Threshold moving** — posun decision threshold.
- **Ensemble**: balanced random forest, RUSBoost, EasyEnsemble.

**Anomaly detection framing** — pokud minority je extrémně vzácná (<0.1 %), modeluj jako anomalie.

---

## Inkonsistence a chyby

- Duplicate detection — fuzzy matching (Jaro-Winkler, Levenshtein).
- Domain validation — kontrola rozsahů, formátů (validní PSČ, datum, IČO).
- Cross-field consistency — např. (město, PSČ) musí souhlasit.

_Viz Lecture 4 slides 9-12 pro validation framework._
