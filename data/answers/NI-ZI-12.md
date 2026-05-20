# Jádrové metody, jádrová regrese a Support Vector Machines.

Zdroj: [ADM_Merged.pdf](/pdfs/ZI/ADM_Merged.pdf) (slides NI-ADM, lecture 10 — Kernel regression)

---

## Lineární regrese a OLS

Lineární model $Y = \boldsymbol w^T \boldsymbol x + \varepsilon$, $E\varepsilon = 0$; trénovací sada $(Y_i, \boldsymbol x_i)$. ([otevřít v PDF, str. 277](/pdfs/ZI/ADM_Merged.pdf#page=277))

![Linear regression model](/answer-imgs/NI-ZI-12/p277_lin_reg.png)

**OLS**: minimalizuje $\|\boldsymbol Y - \mathbf X \boldsymbol w\|^2$; normální rovnice $\mathbf X^T \mathbf X \boldsymbol w = \mathbf X^T \boldsymbol Y$, řešení $\hat{\boldsymbol w} = (\mathbf X^T \mathbf X)^{-1} \mathbf X^T \boldsymbol Y$. ([otevřít v PDF, str. 279](/pdfs/ZI/ADM_Merged.pdf#page=279))

![Ordinary Least Squares](/answer-imgs/NI-ZI-12/p279_ols.png)

---

## Ridge regrese (regularizace)

Minimalizuje $\|\boldsymbol Y - \mathbf X \boldsymbol w\|^2 + \lambda \|\boldsymbol w\|^2$; $\hat{\boldsymbol w}_\lambda = (\mathbf X^T \mathbf X + \lambda \mathbf I)^{-1} \mathbf X^T \boldsymbol Y$. Pro $\lambda > 0$ vždy regulární. ([otevřít v PDF, str. 280](/pdfs/ZI/ADM_Merged.pdf#page=280))

![Ridge regression](/answer-imgs/NI-ZI-12/p280_ridge.png)

---

## Bázové funkce — nelineární model

$Y = \boldsymbol w^T \boldsymbol\varphi(\boldsymbol x) + \varepsilon$, kde $\varphi_1, \ldots, \varphi_M$ jsou nelineární transformace (např. polynomy, indikátory). Model je **lineární v parametrech** v novém $M$-rozměrném prostoru. ([otevřít v PDF, str. 281](/pdfs/ZI/ADM_Merged.pdf#page=281))

![Bázové funkce](/answer-imgs/NI-ZI-12/p281_basis.png)

---

## Duální reprezentace (přechod k jádru)

Restrikce $\boldsymbol w = \boldsymbol\Phi^T \boldsymbol\alpha$, $\boldsymbol\alpha \in \mathbb R^N$. Minimalizace $\mathrm{RSS}_\lambda(\boldsymbol\alpha)$ s $N$ proměnnými místo $M$. ([otevřít v PDF, str. 284](/pdfs/ZI/ADM_Merged.pdf#page=284))

![Dual representation](/answer-imgs/NI-ZI-12/p284_dual_repr.png)

**Gram matrix** $\mathbf G = \boldsymbol\Phi \boldsymbol\Phi^T$ má $G_{ij} = \boldsymbol\varphi(\boldsymbol x_i)^T \boldsymbol\varphi(\boldsymbol x_j) = k(\boldsymbol x_i, \boldsymbol x_j)$. Optimum: $\hat{\boldsymbol\alpha} = (\mathbf G + \lambda \mathbf I)^{-1} \boldsymbol Y$. ([otevřít v PDF, str. 285](/pdfs/ZI/ADM_Merged.pdf#page=285))

![Gram matrix & kernel function](/answer-imgs/NI-ZI-12/p285_gram_matrix.png)

---

## Kernel trick

V duální formulaci vstupní vektory **vystupují jen jako skalární součiny** — nahradíme je jádrovou funkcí $k(\boldsymbol x, \boldsymbol y)$. Začneme přímo od kernelu bez explicitních bázových funkcí ⇒ implicitně používáme vysoko-(až nekonečno-)dimenzionální prostor. ([otevřít v PDF, str. 288](/pdfs/ZI/ADM_Merged.pdf#page=288))

![Kernel trick](/answer-imgs/NI-ZI-12/p288_kernel_trick.png)

---

## Pozitivně semidefinitní (Mercerova) jádra

Funkce $k: \mathcal X \times \mathcal X \to \mathbb R$ je PSD jádro ⇔ Gramova matice $(k(\boldsymbol x_i, \boldsymbol x_j))$ je PSD pro libovolné body. Tato podmínka zajišťuje, že kernel odpovídá nějaké bázové reprezentaci. Příklady: lineární, polynomiální $k(x,y) = (x^T y + c)^d$, **Gaussian/RBF** $k(x,y) = \exp(-\|x-y\|^2/2l^2)$. ([otevřít v PDF, str. 290](/pdfs/ZI/ADM_Merged.pdf#page=290))

![Positive semi-definite kernels](/answer-imgs/NI-ZI-12/p290_psd_kernels.png)

---

## Reprodukující jádrový Hilbertův prostor (RKHS)

Pro PSD kernel existuje Hilbertův prostor funkcí $\mathcal H$ se skalárním součinem $\langle f, g \rangle$ a **reprodukční vlastností**: $\langle k(\cdot, \boldsymbol x), f \rangle = f(\boldsymbol x)$. Predikce v jádrové regresi $\hat Y(\boldsymbol x) = \hat{\boldsymbol\alpha}^T \boldsymbol k(\boldsymbol x)$, kde $\boldsymbol k(\boldsymbol x) = (k(\boldsymbol x_1, \boldsymbol x), \ldots, k(\boldsymbol x_N, \boldsymbol x))^T$. ([otevřít v PDF, str. 292](/pdfs/ZI/ADM_Merged.pdf#page=292))

![Reproducing Kernel Hilbert Spaces](/answer-imgs/NI-ZI-12/p292_rkhs.png)

---

## Support Vector Machines (SVM)

SVM = binární klasifikátor, jehož diskriminantní funkce $f(\boldsymbol x)$ je definována tak, aby maximalizovala **margin** (vzdálenost rozhodovací nadroviny od nejbližších trénovacích bodů). Optimalizační problém: $\min_{\boldsymbol w, b} \frac{1}{2}\|\boldsymbol w\|^2$ s podmínkami $y_i(\boldsymbol w^T \boldsymbol x_i + b) \ge 1$. Lagrangeova duální forma vede k optimalizaci pouze přes skalární součiny $\boldsymbol x_i^T \boldsymbol x_j$ ⇒ stejný **kernel trick** jako u jádrové regrese: $f(\boldsymbol x) = \sum_i \alpha_i y_i k(\boldsymbol x_i, \boldsymbol x) + b$. Rozhodnutí podle znaménka $f(\boldsymbol x)$.

**Soft-margin SVM** s ztrátou typu hinge: $L_i = \max(0, 1 - y_i f(\boldsymbol x_i))$. **RankSVM** (slide 11/22 později v ADM) — minimalizace hinge ztráty pro učení uspořádání párů, přímo s kernel triky. _Viz Lecture 11 / Boosting přednáška a slide 4/22 ABM kde SVM uváděn jako příklad diskriminantní funkce $f$._
