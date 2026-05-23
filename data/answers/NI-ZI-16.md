# Rejection a importance sampling a metody vážení.

Zdroj: [BML_Merged.md](/pdfs/ZI/BML/BML_Merged.md) (skripta NI-BML, Přednášky 4–5 — Monte Carlo, rejection sampling, importance sampling)

---

## Monte Carlo metody — motivace

V bayesovských úlohách často potřebujeme spočítat integrály jako:
$$E_{p}[f(x)] = \int f(x) p(x) dx$$
- aposteriorní střední hodnotu, varianci, kvantily;
- marginální věrohodnost (evidence);
- posterior predictive;
- rizika rozhodnutí.

Pokud $p(x)$ je komplikovaná (např. ne-Gaussovský posterior), analytické řešení neexistuje. **Monte Carlo aproximace**: pokud máme vzorky $x^{(1)}, \ldots, x^{(N)} \sim p$, pak
$$E_p[f(x)] \approx \frac{1}{N} \sum_{i=1}^N f(x^{(i)})$$
s konvergencí $O(N^{-1/2})$ podle CLT (nezávislé na dimenzi).

**Problém**: jak vzorkovat z komplikované $p(x)$?

([otevřít v Markdown, Monte Carlo, rejection sampling](/pdfs/ZI/BML/BML_Merged.md#monte-carlo-rejection-sampling))

---

## Rejection sampling

Předpokládejme **proposal distribuci** $q(x)$, ze které umíme vzorkovat, a **konstanta $M$** taková, že
$$p(x) \le M \cdot q(x) \quad \forall x$$

**Algoritmus**:
1. Vzorkuj $x \sim q(x)$.
2. Vzorkuj $u \sim U(0, 1)$.
3. Pokud $u \le \frac{p(x)}{M q(x)}$, **přijmi** $x$; jinak **odmítni** a opakuj.

**Vlastnosti**:
- Vzorky jsou **exaktní** $p$-distribuované (žádná aproximace).
- **Pravděpodobnost přijetí** $= 1/M$ → účinnost klesá s velkým $M$.
- Pro $p$ známé jen do konstanty: $p(x) = \tilde p(x) / Z$ — stačí $\tilde p(x) \le M q(x)$ a hledat $\tilde p / (M q)$.

**Volba $q, M$**:
- $q$ by mělo mít **podobný tvar** jako $p$ (jinak vysoké $M$, hodně odmítnutí).
- $q$ musí mít **těžší ocasy** než $p$.
- V vysoké dimenzi je rejection sampling **prakticky nepoužitelné** — $M$ roste exponenciálně.

**Adaptivní rejection sampling (ARS)** — pro log-konkávní $p$ se $q$ konstruuje jako po částech lineární obálka log-hustoty.

([otevřít v Markdown, Monte Carlo, rejection sampling](/pdfs/ZI/BML/BML_Merged.md#monte-carlo-rejection-sampling))

---

## Importance sampling (IS)

**Místo přijímání/odmítání** vzorkuj všechny body z $q$ a **váž je** poměrem $p/q$.

Z identity $E_p[f] = \int f(x) p(x) dx = \int f(x) \frac{p(x)}{q(x)} q(x) dx = E_q[f \cdot w]$, kde $w(x) = p(x)/q(x)$ je **importance weight**.

**Estimátor**:
$$\hat E_p[f] = \frac{1}{N} \sum_{i=1}^N f(x^{(i)}) w(x^{(i)}), \quad x^{(i)} \sim q$$

### Self-normalized IS (SNIS)

Když $p$ známá jen do konstanty $p \propto \tilde p$:
$$\hat E_p[f] = \frac{\sum_{i=1}^N f(x^{(i)}) \tilde w(x^{(i)})}{\sum_{i=1}^N \tilde w(x^{(i)})}$$

Vychýlený ($O(1/N)$ bias), ale **konzistentní** ($N \to \infty$).

### Diagnostika kvality

**Effective Sample Size (ESS)**:
$$\mathrm{ESS} = \frac{\left(\sum w_i\right)^2}{\sum w_i^2} \le N$$

Nízká ESS (např. $< 10$) znamená, že málo vzorků nese skoro veškerou váhu — odhad nestabilní. **Pareto-k diagnostika** (PSIS-LOO) — pokud váhy mají těžké ocasy ($k > 0.7$), IS je nespolehlivý.

### Volba $q$

- $q$ s **těžšími ocasy** než $p$ (jinak vážení diverguje).
- Optimálně $q^*(x) \propto |f(x)| p(x)$ — záleží na konkrétní funkci $f$.
- **Adaptivní IS** — postupně přizpůsobuje $q$ z předchozích vzorků.

### Aplikace IS

- **Bayesovská inference** pro malé dim. problémy.
- **Likelihood-free** odhad (ABC).
- **Reinforcement learning** — off-policy evaluation (vážení odměn proposal vs target policy).
- **Particle filter** (sekvenční IS, viz NI-ZI-15).

([otevřít v Markdown, Importance sampling](/pdfs/ZI/BML/BML_Merged.md#importance-sampling))

---

## Sequential Importance Sampling (SIS) a SIR

Pro stavové modely $p(x_{0:t} \mid y_{1:t})$ je IS sekvenční:

$$w_t^{(i)} = w_{t-1}^{(i)} \cdot \frac{p(y_t \mid x_t^{(i)}) \, p(x_t^{(i)} \mid x_{t-1}^{(i)})}{q(x_t^{(i)} \mid x_{t-1}^{(i)}, y_t)}$$

**Standard SIR proposal** $q = p(x_t \mid x_{t-1})$ → váha $= p(y_t \mid x_t)$. **Bootstrap particle filter**.

Problém **váhové degenerace** — postupně 1 částice dominuje. Řešení: **resampling** (multinomial, systematic, residual) — vzorkuj $N$ částic s opakováním podle vah, vyresetuj váhy na $1/N$.

([otevřít v Markdown, Monte Carlo, importance sampling, particle filtry](/pdfs/ZI/BML/BML_Merged.md#monte-carlo-importance-sampling-particle-filtry))

---

## Annealed importance sampling (AIS)

Místo přímého IS od $q_0$ k $p$ použij **mezistupně** $q_0, q_1, \ldots, q_n = p$ (s postupně rostoucí "teplotou"). V každém kroku **lehká IS s malou divergencí**. Robustní pro vícemodální posteriory. Používá se k odhadu marginální věrohodnosti.

([otevřít v Markdown, Importance sampling](/pdfs/ZI/BML/BML_Merged.md#importance-sampling))

---

## Vážení v Monte Carlo

**Obecný princip**: pokud nemáme vzorky z cílového rozdělení $p$, ale máme vzorky z $q$, dokážeme aproximovat $E_p[f]$ pomocí vážení každého vzorku $p(x)/q(x)$. Toto je **fundament metod**:

- Importance Sampling.
- Particle filter — sekvenční IS.
- **Self-Normalized IS** — vážení normalizované.
- **Stratified sampling** — vzorkuj rovnoměrně z různých regionů, važ podle pravděpodobnosti regionu.
- **Reweighting v RL** — off-policy ratio $\pi(a|s)/\beta(a|s)$.

([otevřít v Markdown, Importance sampling](/pdfs/ZI/BML/BML_Merged.md#importance-sampling))

---

## Srovnání metod

| Metoda | Bias | Variance | Volba q | Dim. tolerance |
|--------|------|----------|---------|----------------|
| **Rejection** | 0 | nízká (nemá konstantu) | snadná, $M$ kritické | nízká |
| **IS** | 0 (nebo $O(1/N)$ pro SNIS) | citlivá na $q$ | nutné podobné tvary | nízká–střední |
| **MCMC (MH, Gibbs, HMC)** | 0 asymptoticky | korelace mezi vzorky | snadná | vysoká |
| **Variační inference** | systematický bias | nízká, deterministická | náročný optimalizační problém | velmi vysoká |

---

## Závěr

Rejection a IS jsou **fundamentální Monte Carlo techniky**, jejichž síla i slabost se opírají o volbu proposal distribuce $q$. V nižších dimenzích jsou jednoduché a exaktní; ve vysokých dimenzích selhávají kvůli velkým rozdílům mezi $q$ a $p$. **Particle filter** je sekvenční rozšíření IS pro stavové modely. **MCMC** překonává omezení dimenzionality, ale dává korelované vzorky.

_Detailně: [BML_Merged.md, Přednášky 4 a 5](/pdfs/ZI/BML/BML_Merged.md)._
