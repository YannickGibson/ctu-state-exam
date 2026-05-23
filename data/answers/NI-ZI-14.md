# Principy bayesovského modelování: apriorní/aposteriorní rozdělení a konjugovaná rozdělení.

Zdroj: [BML_Merged.md](/pdfs/ZI/BML/BML_Merged.md) (skripta NI-BML, Přednášky 1–2)

---

## Bayesovská inference

**Cíl**: nakládat s parametrem $\theta$ jako s **náhodnou veličinou** s pravděpodobnostním rozdělením, ne jako s pevným bodem, který se odhaduje.

**Bayesova věta** pro parametr $\theta$ a data $\mathcal D$:
$$p(\theta \mid \mathcal D) = \frac{p(\mathcal D \mid \theta) \, p(\theta)}{p(\mathcal D)}$$

- **Apriorní rozdělení** (prior) $p(\theta)$ — co o $\theta$ víme **před** pozorováním dat.
- **Věrohodnost** (likelihood) $p(\mathcal D \mid \theta)$ — pravděpodobnost dat při daném $\theta$.
- **Aposteriorní rozdělení** (posterior) $p(\theta \mid \mathcal D)$ — co o $\theta$ víme **po** pozorování dat.
- **Marginální věrohodnost** (evidence) $p(\mathcal D) = \int p(\mathcal D \mid \theta) p(\theta) \, d\theta$ — normalizační konstanta.

Často $p(\theta \mid \mathcal D) \propto p(\mathcal D \mid \theta) p(\theta)$ — pracujeme s neznormalizovanou aposteriorní hustotou.

([otevřít v Markdown, Přednáška 1](/pdfs/ZI/BML/BML_Merged.md#prednaska-1-zaklady-a-specifika-bayesovske-teorie))

---

## Bayesovské bodové odhady

- **MAP (Maximum A Posteriori)**: $\hat\theta_{\mathrm{MAP}} = \arg\max_\theta p(\theta \mid \mathcal D)$. Pro plochý prior se redukuje na MLE.
- **Posterior mean**: $\hat\theta_{\mathrm{PM}} = E[\theta \mid \mathcal D] = \int \theta p(\theta \mid \mathcal D) d\theta$. Optimální vzhledem k MSE.
- **Posterior median** — optimální vzhledem k absolutní chybě.
- **Credible interval (interval spolehlivosti)** — interval $[\theta_L, \theta_U]$ s $P(\theta \in [\theta_L, \theta_U] \mid \mathcal D) = 1-\alpha$.

Na rozdíl od frekvenčního CI má bayesovský **přímou pravděpodobnostní interpretaci** podmíněnou daty.

([otevřít v Markdown, Přednáška 1](/pdfs/ZI/BML/BML_Merged.md#prednaska-1-zaklady-a-specifika-bayesovske-teorie))

---

## Sekvenční bayesovský update

Bayesovská inference je inherentně **sekvenční**: pozorování $\mathcal D_1, \mathcal D_2, \ldots$ aktualizujeme jedno po druhém.

$$p(\theta \mid \mathcal D_1) \propto p(\mathcal D_1 \mid \theta) p(\theta)$$
$$p(\theta \mid \mathcal D_1, \mathcal D_2) \propto p(\mathcal D_2 \mid \theta) p(\theta \mid \mathcal D_1)$$

**Posteriorní z prvního kroku slouží jako prior pro druhý**. Pokud pozorování jsou podmíněně nezávislá při daném $\theta$, výsledek je nezávislý na pořadí.

([otevřít v Markdown, Přednáška 2 — sekvenční odhad](/pdfs/ZI/BML/BML_Merged.md#prednaska-2-sekvencni-odhad-linearnich-modelu-predikce))

---

## Konjugovaná rozdělení

**Definice**: rodina priorů $\mathcal P$ je **konjugovaná** k likelihood $p(\mathcal D \mid \theta)$, pokud pro libovolný prior z $\mathcal P$ je posterior také v $\mathcal P$.

**Výhoda**: posterior má analyticky uzavřenou formu — jen aktualizujeme parametry rozdělení.

### Tabulka konjugovaných párů

| Likelihood | Konjugovaný prior | Posterior parametry |
|------------|-------------------|---------------------|
| **Bernoulli/Binomial** $p$ | **Beta**$(\alpha, \beta)$ | Beta$(\alpha + k, \beta + n - k)$ |
| **Multinomial** $\boldsymbol p$ | **Dirichlet**$(\boldsymbol \alpha)$ | Dirichlet$(\boldsymbol\alpha + \boldsymbol n)$ |
| **Poisson** $\lambda$ | **Gamma**$(\alpha, \beta)$ | Gamma$(\alpha + \sum x_i, \beta + n)$ |
| **Normal** (známý $\sigma^2$) $\mu$ | **Normal**$(\mu_0, \tau_0^2)$ | Normal (vážený průměr) |
| **Normal** (známý $\mu$) $\sigma^2$ | **Inverse-Gamma** | Inverse-Gamma |
| **Normal** (oba neznámé) $(\mu, \sigma^2)$ | **Normal-Inverse-Gamma** | NIG |
| **Multivariate Normal** $\boldsymbol\Sigma$ | **Inverse-Wishart** | Inverse-Wishart |
| **Exponential** $\lambda$ | **Gamma** | Gamma |

### Příklad: Beta-binomial

Pozoruj $n$ hodů mincí, $k$ orlů. Likelihood: $p(\mathcal D \mid p) = \binom{n}{k} p^k (1-p)^{n-k}$.

Prior $p \sim \mathrm{Beta}(\alpha, \beta)$ s hustotou $\propto p^{\alpha-1}(1-p)^{\beta-1}$.

Posterior:
$$p \mid \mathcal D \sim \mathrm{Beta}(\alpha + k, \beta + n - k)$$

**Interpretace**: hyperparametry $\alpha, \beta$ jsou jako "počty pseudoorlů a pseudořezků" → prior je ekvivalent předchozího experimentu o $\alpha + \beta$ hodech. Posterior je váženým průměrem prioru a dat: $E[p \mid \mathcal D] = \frac{\alpha + k}{\alpha + \beta + n}$.

### Neinformativní priory

- **Plochý uniformní prior**: $p(\theta) = \mathrm{konst}$. Pro Beta odpovídá $\alpha = \beta = 1$.
- **Jeffreysův prior** $p(\theta) \propto \sqrt{|\det I(\theta)|}$, kde $I$ je Fisherova informace. Invariantní vůči reparametrizaci. Pro Bernoulli: $\mathrm{Beta}(1/2, 1/2)$.
- **Conjugate** s velmi malými parametry (např. $\mathrm{Gamma}(\epsilon, \epsilon)$) — slabě informativní.

([otevřít v Markdown, Přednáška 1](/pdfs/ZI/BML/BML_Merged.md#prednaska-1-zaklady-a-specifika-bayesovske-teorie))

---

## Predikce s aposteriorním rozdělením

**Posterior predictive distribution** pro nové pozorování $\tilde x$:
$$p(\tilde x \mid \mathcal D) = \int p(\tilde x \mid \theta) p(\theta \mid \mathcal D) d\theta$$

Marginalizuje přes $\theta$ → kombinuje neurčitost o parametru i o pozorování. Pro konjugované páry často také uzavřená forma.

**Příklad — beta-binomial**: posterior predictive je $\mathrm{BetaBinomial}(n, \alpha', \beta')$ — má širší ocas než binomial (extra disperze z neurčitosti parametru).

([otevřít v Markdown, Přednáška 2](/pdfs/ZI/BML/BML_Merged.md#prednaska-2-sekvencni-odhad-linearnich-modelu-predikce))

---

## Hierarchické modely

Vícevrstvý prior:
$$\theta_i \mid \phi \sim p(\theta_i \mid \phi), \quad \phi \sim p(\phi)$$

Sdílení statistické síly přes skupiny (partial pooling). Aplikace: A/B testy s mnoha variantami, multi-task learning.

([otevřít v Markdown, Přednáška 2](/pdfs/ZI/BML/BML_Merged.md#prednaska-2-sekvencni-odhad-linearnich-modelu-predikce))

---

## Bayesovská lineární regrese

Model $y = X\boldsymbol\beta + \varepsilon$, $\varepsilon \sim \mathcal N(0, \sigma^2 I)$. Konjugovaný prior pro $\boldsymbol\beta$ (známý $\sigma^2$): $\boldsymbol\beta \sim \mathcal N(\mu_0, \Sigma_0)$.

**Posterior**: $\boldsymbol\beta \mid y, X \sim \mathcal N(\mu_n, \Sigma_n)$, kde:
$$\Sigma_n^{-1} = \Sigma_0^{-1} + \frac{1}{\sigma^2} X^T X$$
$$\mu_n = \Sigma_n \left( \Sigma_0^{-1} \mu_0 + \frac{1}{\sigma^2} X^T y \right)$$

Pro nekonečně rozptýlený prior (uniform improper) se posterior mean redukuje na OLS. Pro Gaussovský prior s $\mu_0 = 0$ se redukuje na **ridge regresi** (s $\lambda = \sigma^2 / \tau^2$).

([otevřít v Markdown, Přednáška 2](/pdfs/ZI/BML/BML_Merged.md#prednaska-2-sekvencni-odhad-linearnich-modelu-predikce))

---

## Výpočetní aspekty

- **Konjugované modely**: uzavřená forma, rychlé.
- **Obecné modely**: aproximace nutná — viz NI-ZI-16 (rejection/importance sampling), MCMC (Metropolis-Hastings, Gibbs, HMC), variační inference.

_Detailně: [BML_Merged.md, Přednášky 1 a 2](/pdfs/ZI/BML/BML_Merged.md)._
