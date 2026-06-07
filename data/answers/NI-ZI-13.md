# Algoritmy pro doporučování: základní přístupy a způsob vyhodnocení kvality, faktorizační metody pro doporučování.

Zdroj: [ADM_Merged.pdf](/pdfs/ZI/ADM_Merged.pdf) (slides NI-ADM, Recommender Systems 1/2)

---

## Doporučovací úloha jako matice

Ratingová matice $R \in (\mathbb R \cup \{?\})^{m \times n}$ pro $m$ uživatelů a $n$ položek; cíl: predikovat neznámé hodnoty $r_{u,i}$. ([otevřít v PDF, str. 15](/pdfs/ZI/ADM_Merged.pdf#page=15))

![Recommender as a Matrix](/answer-imgs/NI-ZI-13/p15_recommender_matrix.png)

---

## Maticová faktorizace — myšlenka

$R \approx U V^T$ — vyjádření matice jako součinu dvou nízkohodnostových matic; **latentní faktory**. ([otevřít v PDF, str. 16](/pdfs/ZI/ADM_Merged.pdf#page=16))

![Idea of Matrix Factorization](/answer-imgs/NI-ZI-13/p16_idea_mf.png)

**Intuice MF**: $U \in \mathbb R^{m \times d}$, $V \in \mathbb R^{n \times d}$ kde $d \ll \min(m, n)$. Inspirace SVD; dimensionality reduction pomocí projekce do nižší dimenze. ([otevřít v PDF, str. 17](/pdfs/ZI/ADM_Merged.pdf#page=17))

![Intuition Behind MF](/answer-imgs/NI-ZI-13/p17_intuition_mf.png)

**Optimalizační úloha**: $\arg\min_{U, V} \sum_{(i,j) \in \Omega} (r_{i,j} - \boldsymbol u_i^T \boldsymbol v_j)^2 + \lambda(\sum \|\boldsymbol u_i\|^2 + \sum \|\boldsymbol v_j\|^2)$. Suma jen přes známé indexy $\Omega$; regulizace zabraňuje overfittingu. Řešení: SGD, ALS. ([otevřít v PDF, str. 19](/pdfs/ZI/ADM_Merged.pdf#page=19))

![Optimization Problem](/answer-imgs/NI-ZI-13/p19_optimization.png)

---

## Memory-based: k-NN doporučování

Memory-based / collaborative filtering: pro uživatele $i$ najdi $k$ nejbližších uživatelů, jejich hodnocení agreguj (vážený průměr podle podobnosti). Žádný trénink. ([otevřít v PDF, str. 35](/pdfs/ZI/ADM_Merged.pdf#page=35))

![k-NN for Recommendation](/answer-imgs/NI-ZI-13/p35_knn_recom.png)

---

## Míry podobnosti uživatelů/položek

Naivní $\mathrm{sim}(i, l) = |U_i \cap U_l|$ je závislé na aktivitě uživatele. ([otevřít v PDF, str. 38](/pdfs/ZI/ADM_Merged.pdf#page=38))

![Defining Similarity](/answer-imgs/NI-ZI-13/p38_similarity_func.png)

**Jaccard**: $J(i,l) = |U_i \cap U_l| / |U_i \cup U_l| \in [0,1]$. ([otevřít v PDF, str. 42](/pdfs/ZI/ADM_Merged.pdf#page=42))

![Jaccard Similarity](/answer-imgs/NI-ZI-13/p42_jaccard.png)

**Cosine**: $\cos\theta = \langle \boldsymbol a, \boldsymbol b\rangle / (\|\boldsymbol a\|\|\boldsymbol b\|)$ — pro ratingové vektory (umožňuje explicit feedback). ([otevřít v PDF, str. 44](/pdfs/ZI/ADM_Merged.pdf#page=44))

![Cosine Similarity](/answer-imgs/NI-ZI-13/p44_cosine.png)

---

## Confidence-Aware Matrix Factorization (CMF)

Rozšíření MF: $R_{ij} \sim \mathcal N(\boldsymbol U_i^T \boldsymbol V_j, (F(\gamma_{U_i}, \gamma_{V_j}) \alpha)^{-1})$ — variance parametry $\gamma_U, \gamma_V$ modelují **uncertainty** predikce. Bayesovská varianta CBPMF používá konjugované priory a Gibbs sampling. ([otevřít v PDF, str. 76](/pdfs/ZI/ADM_Merged.pdf#page=76))

![Confidence-Aware Matrix Factorization](/answer-imgs/NI-ZI-13/p76_cmf.png)

---

## Další doporučovací přístupy (přehled)

- **Memory-based**: user-based k-NN, item-based k-NN.
- **Model-based / Matrix Factorization**: SVD/ALS, **Probabilistic MF** (PMF) modeluje ratingy jako Gaussiany, **Bayesian PMF** (BPMF) přidává priory + MCMC.
- **Neural Collaborative Filtering** (NCF, He et al. 2017): MLP nad latentními faktory.
- **Variational AutoEncoders** (VAE, Liang et al. 2018): autoenkodér nad uživatelskými profily.
- **Sequential / Transformer-based**: SASRec, BERT4Rec — self-attention nad sekvencemi interakcí.
- **Graph Neural Networks**: NGCF, LightGCN — bipartitní user-item graf, propagace embeddings.
