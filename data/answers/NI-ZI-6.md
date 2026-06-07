# Lineární projekce dat do prostoru o méně dimenzích: metoda hlavních komponent (PCA), lineární diskriminační analýza (LDA). Nelineární metody redukce dimensionality (Sammonova projekce).

Zdroj: [PDD_Merged.pdf](/pdfs/ZI/PDD_Merged.pdf) (slides NI-PDD, Lecture 8 — Data Projections)

---

## Dimensionality reduction — přehled

**Linear**: Random mapping, PCA, ICA, LDA. **Non-linear**: MDS, Sammon, Isomap, LLE, t-SNE, UMAP, autoencoders. ([otevřít v PDF, str. 313](/pdfs/ZI/PDD_Merged.pdf#page=313))

![Dimensionality reduction](/answer-imgs/NI-ZI-6/p313_dim_reduction.png)

Projekce $Y = U \cdot X$ z $n$-rozměrného do $k$-rozměrného prostoru ($k \ll n$) se zachováním klíčové informace. Výhoda: odstraní redundantní korelace. Nevýhoda: nové atributy obtížně interpretovatelné. ([otevřít v PDF, str. 314](/pdfs/ZI/PDD_Merged.pdf#page=314))

![Linear projections](/answer-imgs/NI-ZI-6/p314_projections.png)

---

## Random Projection (Johnson-Lindenstrauss)

Náhodná matice $R \in \mathbb R^{k \times d}$ s jednotkovými sloupci: $X^{RP} = R X$. **JL-lemma**: pokud $k$ je dostatečně velké, vzdálenosti mezi body jsou aproximativně zachovány. Rychlé, ale není to ortogonální projekce.

---

## PCA (Principal Component Analysis)

**Cíl**: redukovat dimenzi tak, aby se zachovala maximální variabilita (= informace) v datech. Minimalizuje **reconstruction error** $\|\boldsymbol x - \hat{\boldsymbol x}\|$. ([otevřít v PDF, str. 319](/pdfs/ZI/PDD_Merged.pdf#page=319))

![PCA — information loss minimization](/answer-imgs/NI-ZI-6/p319_pca.png)

**Best subspace**: vystředěné průměrem, směry = **vlastní vektory kovarianční matice** $C = E[(X-\mu)(X-\mu)^T]$ s největšími vlastními čísly (= **principal components**).

### Algoritmus PCA

1. **Centrování**: $\tilde X = X - \bar X$.
2. **Kovarianční matice** $C = \frac{1}{n-1} \tilde X^T \tilde X$.
3. **Eigen-decomposition** $C = V \Lambda V^T$ ($\lambda_1 \ge \ldots \ge \lambda_d$).
4. **Projekce na top-$k$**: $Y = \tilde X V_{[:,:k]}$.

Ekvivalentně přes **SVD**: $X = U \Sigma V^T$, top-$k$ pravých singulárních vektorů.

### Vlastnosti

- Maximální variance ⇔ minimální reconstruction error.
- Unsupervised — nezná labels.
- **Citlivý na škálování** — normalizace (např. z-score) je nutná, pokud mají rysy různé jednotky.
- Variance explained: $\sum_{i \le k} \lambda_i / \sum_i \lambda_i$ udává, kolik informace je zachováno.

![PCA — visual](/answer-imgs/NI-ZI-6/p320_pca_visual.png)

---

## LDA (Linear Discriminant Analysis) — supervised

Najde projekce, které **maximálně separují třídy** (na rozdíl od PCA, která maximalizuje rozptyl bez ohledu na třídy).

**Fisherovo kritérium**: maximalizuj
$$J(\boldsymbol w) = \frac{\boldsymbol w^T S_B \boldsymbol w}{\boldsymbol w^T S_W \boldsymbol w}$$
kde $S_B = \sum_c n_c (\mu_c - \mu)(\mu_c - \mu)^T$ je **between-class scatter matrix** a $S_W = \sum_c \sum_{x \in c} (x - \mu_c)(x - \mu_c)^T$ je **within-class scatter matrix**.

Řešení: zobecněný eigenproblém $S_W^{-1} S_B$ — vlastní vektory s největšími vlastními čísly.

LDA má max $c - 1$ rozměrů (pro $c$ tříd) — pro 2 třídy 1 dimenzi. Předpoklady: třídy mají gaussovské rozdělení se stejnou kovariancí.

LDA lze použít i jako **klasifikátor** (přiřazení k třídě s nejbližším projektovaným centrem).

---

## ICA (Independent Component Analysis)

$X = AS$ — signál je lineární mix nezávislých zdrojů $S$. **ICA odhaduje $W$ takové, že $Z = WX \approx S$**. Aplikace: blind source separation (cocktail party). ([otevřít v PDF, str. 325](/pdfs/ZI/PDD_Merged.pdf#page=325))

![ICA concept](/answer-imgs/NI-ZI-6/p325_ica.png)

![ICA unmixing](/answer-imgs/NI-ZI-6/p327_ica_unmix.png)

**Postup**: 1) **whitening** (dekorrelace, $W_1 = C^{-1/2}$); 2) **rotace** maximalizující ne-gaussianitu (kurtosis nebo negentropy) — zdroje musí být maximálně **non-Gaussian** (max 1 Gaussian zdroj). Klasický algoritmus: FastICA.

PCA nachází **nekorrelované** komponenty (kovariance = 0), ICA hledá **nezávislé** (silnější podmínka).

---

## Nelineární redukce dimenze

### MDS (Multidimensional Scaling)

Mapuje body z původního prostoru do $k$-rozměrného tak, aby **párové vzdálenosti** byly zachovány. Klasický MDS minimalizuje $\sum_{ij} (d_{ij}^{\mathrm{orig}} - d_{ij}^{\mathrm{new}})^2$. **Sammonovo mapování**: $\sum_{ij} \frac{(d_{ij}^{\mathrm{orig}} - d_{ij}^{\mathrm{new}})^2}{d_{ij}^{\mathrm{orig}}}$ — váhuje malé vzdálenosti více.

### Isomap

Mapuje body s zachováním **geodetických vzdáleností** na nelineárním manifoldu (sestavení k-NN grafu, Dijkstra pro vzdálenosti, klasický MDS).

### LLE (Locally Linear Embedding)

Každý bod aproximován jako lineární kombinace svých $k$ nejbližších sousedů; mapuje do nižší dimenze se zachováním lokálních rekonstrukčních vah.

### t-SNE (t-distributed Stochastic Neighbor Embedding)

Modeluje podobnosti jako pravděpodobnosti v originálním prostoru (gaussovské) a v nižší dimenzi (Studentovo $t$-rozdělení s 1 stupněm volnosti, "heavy tail"). Minimalizuje **KL divergenci**. Skvělý pro vizualizaci clusterů, špatný pro zachování globálních vzdáleností. Stochastický (různé výsledky podle seed).

### UMAP (Uniform Manifold Approximation and Projection)

Topologicky motivovaný (fuzzy simplicial sets), rychlejší než t-SNE, lépe zachovává globální strukturu. Hyperparametry: `n_neighbors`, `min_dist`.

### Autoencoders

Nelineární redukce přes neuronové sítě (viz NI-ZI-8): encoder $E: \mathcal X \to \mathcal Z$, decoder $D: \mathcal Z \to \mathcal X$. Trénink minimalizací rekonstrukční chyby. Latentní prostor $\mathcal Z$ je nelineární projekce dat.

### Kernel PCA

PCA v reprodukčním jádrovém Hilbertově prostoru — využívá kernel trick (viz NI-ZI-12). Najde nelineární komponenty.
