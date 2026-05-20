# Ansámblové metody (Bagging, Boosting) a bias-variance rozklad.

Zdroj: [ADM_Merged.pdf](/pdfs/ZI/ADM_Merged.pdf) (slides NI-ADM, lecture 5)

---

## Bias-Variance rozklad

**Total error = Bias² + Variance + Irreducible Noise**. Bias = jak daleko jsou predikce od pravdy (underfitting); Variance = kolik se predikce mění napříč různými trénovacími sadami (overfitting); Noise = neredukovatelná náhodnost. ([otevřít v PDF, str. 152](/pdfs/ZI/ADM_Merged.pdf#page=152))

![Bias-Variance Decomposition — Key Takeaways](/answer-imgs/NI-ZI-11/p152_bv_takeaways.png)

**Trade-off s komplexitou**: zvyšování složitosti modelu snižuje bias, ale zvyšuje variance. Celková chyba má U-tvar, optimum je v kompromisním bodě. ([otevřít v PDF, str. 153](/pdfs/ZI/ADM_Merged.pdf#page=153))

![Model Complexity Curve](/answer-imgs/NI-ZI-11/p153_complexity_curve.png)

**Trade-off napříč typy modelů**: lineární regrese — vysoký bias / nízká variance; hluboké stromy / malé k-NN — nízký bias / vysoká variance; **ensemble** metody nabízejí medium-low pro oba. ([otevřít v PDF, str. 155](/pdfs/ZI/ADM_Merged.pdf#page=155))

![Bias-Variance Tradeoff Across Model Types](/answer-imgs/NI-ZI-11/p155_tradeoff_models.png)

**Odvození rozkladu**: $E[(Y-\hat f)^2] = \sigma_\epsilon^2 + \text{Bias}^2[\hat f] + \text{Var}[\hat f]$ — pomocí přičtení a odečtení $E[\hat f]$ a faktu, že $\epsilon$ má $E\epsilon = 0$. ([otevřít v PDF, str. 156](/pdfs/ZI/ADM_Merged.pdf#page=156))

![Odvození rozkladu](/answer-imgs/NI-ZI-11/p156_derivation.png)

---

## Bagging — redukce rozptylu

Trénujeme $M$ modelů na **bootstrap vzorcích**; predikce = průměr. Pro nezávislé modely: $\mathrm{Var}[\bar f] = \mathrm{Var}[\hat f]/M$. V realitě modely korelované s průměrnou korelací $\rho$: $\mathrm{Var}[\bar f] = \rho \mathrm{Var}[\hat f] + \frac{1-\rho}{M}\mathrm{Var}[\hat f]$ — proto se rozptyl snižuje, ale jen omezeně. ([otevřít v PDF, str. 160](/pdfs/ZI/ADM_Merged.pdf#page=160))

![How Bagging Reduces Variance](/answer-imgs/NI-ZI-11/p160_bagging.png)

---

## Boosting — redukce bias

Aditivní model $\bar f = \sum_{i=1}^M \alpha_i \hat f_i$, kde každý nový model $\hat f_i$ se zaměřuje na **rezidua** $r_i = y - \sum_{j<i} \alpha_j \hat f_j$ předchozích modelů (sequential focus on errors). Iterativně snižuje bias slabých modelů. ([otevřít v PDF, str. 161](/pdfs/ZI/ADM_Merged.pdf#page=161))

![How Boosting Reduces Bias](/answer-imgs/NI-ZI-11/p161_boosting.png)

---

## Populární ansámblové metody

**Bagging-based**: Random Forests (decision trees na bootstrap vzorcích + náhodný výběr příznaků), Extra Trees. **Boosting-based**: AdaBoost (důraz na obtížné vzorky), **Gradient Boosting** (XGBoost, LightGBM — modeluje rezidua). ([otevřít v PDF, str. 162](/pdfs/ZI/ADM_Merged.pdf#page=162))

![Popular Ensemble Methods](/answer-imgs/NI-ZI-11/p162_popular_methods.png)
