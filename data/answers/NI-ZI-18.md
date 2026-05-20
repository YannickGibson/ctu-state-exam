# SVD rozklad matice, výpočet a aplikace ve strojovém učení.

Zdroj: [PON_Merged.pdf](/pdfs/ZI/PON_Merged.pdf) (skripta NI-PON, kapitola 2.3 — SVD)

---

## Definice SVD

Pro libovolnou matici $A \in \mathbb R^{m \times n}$ existuje **singulární rozklad**:
$$A = U \Sigma V^T$$
kde:
- $U \in \mathbb R^{m \times m}$ — **ortogonální** matice **levých singulárních vektorů**.
- $V \in \mathbb R^{n \times n}$ — **ortogonální** matice **pravých singulárních vektorů**.
- $\Sigma \in \mathbb R^{m \times n}$ — "diagonální" s **singulárními hodnotami** $\sigma_1 \ge \sigma_2 \ge \ldots \ge \sigma_r \ge 0$ na diagonále, kde $r = \mathrm{rank}(A)$. ([otevřít v PDF, str. 34](/pdfs/ZI/PON_Merged.pdf#page=34))

![SVD definice](/answer-imgs/NI-ZI-18/p34.png)

**Ekonomický (thin) SVD**: $A = U_r \Sigma_r V_r^T$ s $U_r \in \mathbb R^{m \times r}$, $\Sigma_r \in \mathbb R^{r \times r}$, $V_r \in \mathbb R^{n \times r}$.

---

## Vlastnosti

- **$V$**: vlastní vektory $A^T A$, vlastní čísla $\lambda_i = \sigma_i^2$.
- **$U$**: vlastní vektory $A A^T$, stejná vlastní čísla.
- $\sigma_i = \sqrt{\lambda_i(A^T A)}$.
- Sumarizace přes outer products: $A = \sum_{i=1}^r \sigma_i u_i v_i^T$ — výhodné pro low-rank aproximace.

![Singulární hodnoty a vektory](/answer-imgs/NI-ZI-18/p35.png)

---

## Výpočet SVD

**Algoritmus** (numericky stabilní): ([otevřít v PDF, str. 41](/pdfs/ZI/PON_Merged.pdf#page=41))

1. **Householder bidiagonalization**: redukce $A$ na bidiagonální matici $B = U_0^T A V_0$.
2. **QR algoritmus s implicit shifts** na $B$ — iterativně konverguje k diagonální matici $\Sigma$.
3. Akumulace produktů $U_0 \cdot U_{\mathrm{iter}}$ a $V_0 \cdot V_{\mathrm{iter}}$ dává konečné $U, V$.

Pro malé matice: **Jacobi rotace** (iterace nulující off-diagonální prvky).

Pro velmi velké/řídké matice: **truncated SVD** přes Lanczosovu/Krylovovu metodu — počítá jen $k$ největších singulárních trojic v $O(\mathrm{nnz}(A) \cdot k)$.

![Výpočet SVD](/answer-imgs/NI-ZI-18/p41.png)

---

## Aplikace SVD ve strojovém učení

### 1. Pseudoinverze (Moore-Penrose)

Pro $A = U \Sigma V^T$:
$$A^+ = V \Sigma^+ U^T$$
kde $\Sigma^+$ má $1/\sigma_i$ pro nenulová $\sigma_i$, jinak 0. Řeší **least-squares** problém $\min \|Ax - b\|^2$ pro **libovolnou** $A$ (i singulární).

### 2. Low-rank aproximace (Eckart-Young theorem)

Nejlepší aproximace $A$ matici hodnosti $k$ ve Frobeniově (i 2-) normě je:
$$A_k = \sum_{i=1}^k \sigma_i u_i v_i^T$$
s chybou $\|A - A_k\|_F = \sqrt{\sum_{i>k} \sigma_i^2}$. Základ:
- **Komprese obrazu / dat**.
- **Latent Semantic Analysis (LSA)** v NLP — term-document matrix.
- **Recommender systems** (matrix factorization, viz NI-ZI-13).

![Aplikace SVD](/answer-imgs/NI-ZI-18/p45.png)

### 3. PCA

PCA je SVD na centrovaných datech (viz NI-ZI-6): pokud $X$ centrované, pak $X = U \Sigma V^T$ a hlavní komponenty jsou sloupce $V$, projekce $U \Sigma$. Eliminuje výpočet kovarianční matice $X^T X$ (numericky stabilnější).

### 4. Numerická hodnost a kondicionovanost

- **Hodnost** $= \#\{\sigma_i > \mathrm{tol}\}$ (robustní vůči šumu).
- **Kondiční číslo** $\kappa(A) = \sigma_{\max} / \sigma_{\min}$ udává citlivost soustavy.

### 5. Total least squares

Pokud $b$ i $A$ obsahují chyby, řešení získáme přes nejmenší singulární vektor.

### 6. Regularizace přes truncated SVD

Při ill-conditioned soustavách odstraníme nejmenší $\sigma_i$ → snížíme variance, mírně zvýšíme bias. Ekvivalent ridge regrese pro $\lambda \to 0$.

### 7. Word embeddings

GloVe / word2vec lze chápat jako (přibližnou) SVD log-PMI matice slov a kontextů.

### 8. Spectral clustering

SVD Laplaciánu grafu → embedding pro clustering (eigenvectors odpovídající nejmenším nenulovým eigenvalues).

---

## Vztah QR ↔ SVD

QR rozklad je rychlejší (cca 2× než SVD), ale neposkytuje singulární hodnoty. SVD je nejobecnější — pracuje pro libovolnou matici, dává plnou informaci o struktuře. Pro řešení OLS stačí QR; pro odhad hodnosti, regulizaci nebo low-rank aproximaci je potřeba SVD.
