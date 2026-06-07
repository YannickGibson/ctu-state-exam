# Stavové modely: rovnice pro vývoj stavu a rovnice měření, rozdíly mezi nimi. Bayesovský sekvenční odhad stavových modelůa jejich vliv na apriorní distribuci (znalost). Možnosti odhadu stavů v případě nelinearity (pouze vyjmenovat).

Zdroj: [BML_Merged.md](/pdfs/ZI/BML/BML_Merged.md) (skripta NI-BML, Přednášky 3 + 5 — Kalmanův filtr a Particle filter)

---

## Stavové modely (State-space models)

Dynamický systém s **latentním (skrytým) stavem** $x_t$ a **pozorováním** $y_t$:

**State equation (přechodový model)**:
$$x_t = f(x_{t-1}, w_t)$$

**Observation equation (pozorovací model)**:
$$y_t = h(x_t, v_t)$$

kde $w_t, v_t$ jsou procesní a měřicí šumy. Stav $x_t$ se vyvíjí v čase a je nepřímo pozorovatelný přes $y_t$.

**Lineární gaussovský stavový model (LGSS)**:
$$x_t = A x_{t-1} + B u_t + w_t, \quad w_t \sim \mathcal N(0, Q)$$
$$y_t = H x_t + v_t, \quad v_t \sim \mathcal N(0, R)$$

Aplikace: tracking (GNSS, radar), kontrola, ekonomické modelování (HP filter), ARIMA implementace, target localization.

([otevřít v Markdown, Stavové modely, Kalmanův filtr](/pdfs/ZI/BML/BML_Merged.md#stavove-modely-kalmanuv-filtr))

---

## Sekvenční bayesovský odhad

Cíl: udržovat **filtrovanou hustotu** $p(x_t \mid y_{1:t})$ s každým novým pozorováním.

**Bayesovský rekurzivní filtr** — dva kroky:

### Predict step (časová aktualizace)
$$p(x_t \mid y_{1:t-1}) = \int p(x_t \mid x_{t-1}) \, p(x_{t-1} \mid y_{1:t-1}) \, dx_{t-1}$$

(Chapman-Kolmogorovova rovnice — propagace přes přechodový model.)

### Update step (datová aktualizace, Bayes)
$$p(x_t \mid y_{1:t}) = \frac{p(y_t \mid x_t) \, p(x_t \mid y_{1:t-1})}{p(y_t \mid y_{1:t-1})}$$

Toto je obecný optimální bayesovský filtr. Pro **lineární gaussovský** model má uzavřené řešení = **Kalmanův filtr**.

([otevřít v Markdown, Stavový model](/pdfs/ZI/BML/BML_Merged.md#stavovy-model))

---

## Kalmanův filtr (KF)

Pro LGSS, $\hat x_t = E[x_t \mid y_{1:t}]$, $P_t = \mathrm{cov}(x_t \mid y_{1:t})$:

**Predict**:
$$\hat x_t^- = A \hat x_{t-1} + B u_t, \quad P_t^- = A P_{t-1} A^T + Q$$

**Update** (s **Kalmanovým ziskem** $K_t$):
$$K_t = P_t^- H^T (H P_t^- H^T + R)^{-1}$$
$$\hat x_t = \hat x_t^- + K_t (y_t - H \hat x_t^-)$$
$$P_t = (I - K_t H) P_t^-$$

**Inovace** $\nu_t = y_t - H \hat x_t^-$ — rozdíl mezi pozorováním a predikcí. Posteriorní distribuce je vždy gaussovská, zachycena prvními dvěma momenty.

**Vlastnosti**: optimální (MMSE) pro LGSS, BLUE pro jen-lineární modely.

**Smoothing** (offline, retrospektivně): Rauch-Tung-Striebel (RTS) algoritmus počítá $p(x_t \mid y_{1:T})$ pro $t < T$, dopředný-zpětný průchod.

([otevřít v Markdown, Kalmanův filtr](/pdfs/ZI/BML/BML_Merged.md#kalmanuv-filtr))

---

## Nelineární odhad stavu

Pro $f, h$ nelineární nebo non-gaussovský šum už uzavřená forma neexistuje.

### Extended Kalman Filter (EKF)

**Linearizace** $f, h$ Taylorovým rozvojem 1. řádu kolem aktuálního odhadu:
$$F_t = \frac{\partial f}{\partial x}\bigg|_{\hat x_{t-1}}, \quad H_t = \frac{\partial h}{\partial x}\bigg|_{\hat x_t^-}$$

Aplikuje KF rovnice s $F_t, H_t$ místo $A, H$. **Aproximativní**, předpoklad lokální linearity. Selhává u silně nelineárních systémů; gradient je drahý.

### Unscented Kalman Filter (UKF)

**Sigma points** — deterministicky zvolené body kolem $\hat x$ pro reprezentaci rozdělení. Propaguje sigma points přes nelineární $f, h$ (bez gradientu) a aproximuje výsledné momenty. Přesnější než EKF (Taylor až 3. řádu), srovnatelná výpočetní náročnost.

### Particle filter (Sequential Monte Carlo)

**Reprezentace posterioru** sadou $N$ vzorků s váhami:
$$p(x_t \mid y_{1:t}) \approx \sum_{i=1}^N w_t^{(i)} \delta(x_t - x_t^{(i)})$$

**Algoritmus (SIR — Sampling Importance Resampling)**:
1. **Predict**: pro každou částici propaguj přes přechodový model $x_t^{(i)} \sim p(x_t \mid x_{t-1}^{(i)})$.
2. **Weight update**: $w_t^{(i)} \propto w_{t-1}^{(i)} \cdot p(y_t \mid x_t^{(i)})$.
3. **Normalize**: $\sum w_t^{(i)} = 1$.
4. **Resampling** (když effective sample size klesne): vzorkuj s opakováním podle vah → potlač degenraci.

**Vlastnosti**:
- Pracuje s **libovolnou nelinearitou i ne-Gaussovským** šumem.
- Asymptoticky exaktní ($N \to \infty$).
- **Curse of dimensionality**: potřebuje exponenciálně více částic s rostoucí dimenzí stavu.
- **Degenerace vah** — postupně 1 částice nese skoro veškerou váhu; resampling řeší.

([otevřít v Markdown, Nelineární stavové modely](/pdfs/ZI/BML/BML_Merged.md#nelinearni-stavove-modely)) ([otevřít v Markdown, Monte Carlo, importance sampling, particle filtry](/pdfs/ZI/BML/BML_Merged.md#monte-carlo-importance-sampling-particle-filtry))

---

## Predikce a smoothing

**Predikce $h$ kroků dopředu**: $p(x_{t+h} \mid y_{1:t}) = \int \prod p(x_{\tau+1} \mid x_\tau) p(x_t \mid y_{1:t}) d x_t \ldots$ Pro KF jednoduše propaguj $A^h$.

**Smoothing**: $p(x_t \mid y_{1:T})$ pro $t < T$ — dopředný-zpětný průchod. Pro KF RTS, pro PF Forward-Backward / particle smoothing.

([otevřít v Markdown, Kalmanův filtr](/pdfs/ZI/BML/BML_Merged.md#kalmanuv-filtr))

---

## Aplikace

- **GNSS lokalizace** — sledování polohy přes GPS družice. Pozice + rychlost jako stav, měření = pseudoranges. EKF/UKF kvůli nelinearitě geometrie.
- **Target tracking** — radar, vizuální tracking. Pozorování = poloha, šum, ztráty detekce.
- **SLAM** (Simultaneous Localization and Mapping) — robot.
- **Time series ARIMA** v state-space formě → Kalmanův filtr pro MLE odhad + missing data handling.
- **Hidden Markov Models** (diskrétní state-space) — řeč, NLP, bioinformatika.

_Detailně: [BML_Merged.md, Přednášky 3 a 5](/pdfs/ZI/BML/BML_Merged.md)._
