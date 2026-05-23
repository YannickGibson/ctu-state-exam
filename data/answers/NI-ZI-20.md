# Dekompozice časových řad, typy stacionarity, náhodná procházka a bílý šum.

Zdroj: [SCR_Merged.md](/pdfs/ZI/SCR/SCR_Merged.md) (skripta NI-SCR, Téma 1 — Úvod do problematiky)

---

## Časová řada jako náhodný proces

**Náhodný proces** $\{X_t\}_{t \in T}$ — posloupnost náhodných veličin indexovaná časem. Diskrétní vs spojitý čas; diskrétní vs spojitý stavový prostor.

**Momenty**:
- střední hodnota $\mu_t = E[X_t]$
- variance $\sigma_t^2 = \mathrm{var}\,X_t$
- **autokovariance** $\gamma(t_1, t_2) = \mathrm{cov}(X_{t_1}, X_{t_2})$; pro stacionární řadu $\gamma(\tau) = \mathrm{cov}(X_t, X_{t+\tau})$.

([otevřít v Markdown, Téma 1](/pdfs/ZI/SCR/SCR_Merged.md#tema-1-uvod-do-problematiky-exponencialni-vyhlazovani))

---

## Typy stacionarity

### Striktní (silná) stacionarita

**Sdružená distribuce** $(X_{t_1}, \ldots, X_{t_n})$ je stejná jako $(X_{t_1+\tau}, \ldots, X_{t_n+\tau})$ pro libovolná $t_1, \ldots, t_n, \tau$. Posun v čase nemění žádnou statistickou charakteristiku.

### Slabá (kovarianční) stacionarita

Stacionarita momentů 1. a 2. řádu:
- $E[X_t] = \mu$ (konstantní)
- $\mathrm{cov}(X_t, X_{t+\tau}) = \gamma(\tau)$ (závisí jen na rozdílu $\tau$)

V praxi se používá slabá stacionarita. Striktní ⇒ slabá (pokud existují momenty 2. řádu; Cauchyovské rozdělení je výjimkou).

### Sezónní stacionarita
$X_t$ a $X_{t+s}$ mají stejné rozdělení s periodou $s$.

### Trend stacionarita vs difference stacionarita
- **Trend stacionární**: $X_t = f(t) + \tilde X_t$, kde $f(t)$ je deterministický trend a $\tilde X_t$ stacionární.
- **Difference stacionární**: $\Delta X_t = X_t - X_{t-1}$ je stacionární (typicky náhodná procházka).

([otevřít v Markdown, Téma 1](/pdfs/ZI/SCR/SCR_Merged.md#tema-1-uvod-do-problematiky-exponencialni-vyhlazovani))

---

## Dekompozice časových řad

Klasický model:

**Aditivní**: $X_t = T_t + S_t + R_t$ (trend + sezónnost + residual).
**Multiplikativní**: $X_t = T_t \cdot S_t \cdot R_t$ — vhodné, když se variabilita zvyšuje s úrovní (logaritmování → aditivní).

**Komponenty**:
- **Trend** $T_t$ — dlouhodobý směr (rostoucí/klesající/plochý). Odhad: klouzavý průměr, splines, LOESS, lineární regrese.
- **Sezónnost** $S_t$ — periodické fluktuace s pevnou periodou (denní, týdenní, roční).
- **Cyklus** — neperiodické dlouhodobé fluktuace (např. ekonomický cyklus); odlišení od trendu obtížné.
- **Residual** $R_t$ — náhodná složka.

**Metody dekompozice**:
- **Klasická dekompozice**: MA pro trend, průměrování per perioda pro sezónnost.
- **STL (Seasonal-Trend-Loess)**: robustnější, lokální regrese.
- **X-13ARIMA-SEATS**: state-of-the-art pro ekonomická data.

([otevřít v Markdown, Téma 1](/pdfs/ZI/SCR/SCR_Merged.md#tema-1-uvod-do-problematiky-exponencialni-vyhlazovani)) ([otevřít v Markdown, První modely: Exponenciální vyhlazování](/pdfs/ZI/SCR/SCR_Merged.md#prvni-modely-exponencialni-vyhlazovani-vyrovnavani))

---

## Bílý šum

Proces $\{X_t\}$ s
$$E[X_t] = 0, \quad \mathrm{var}(X_t) = \sigma^2 < \infty, \quad \gamma(\tau) = 0\ \text{pro}\ \tau \ne 0$$

**i.i.d.** s nulovým průměrem. **Gaussovský bílý šum**: $X_t \sim \mathcal N(0, \sigma^2)$. Slabě (i striktně, pokud iid) stacionární. Žádná predikce ze samotného procesu — všechny minulé hodnoty jsou nekorelované. Praktické využití: zvuková syntéza, generátory náhodných čísel, testování modelů.

![Bílý šum](/pdfs/ZI/SCR/imgs/lecture_1/cell20-img06.svg)

([otevřít v Markdown, Téma 1](/pdfs/ZI/SCR/SCR_Merged.md#tema-1-uvod-do-problematiky-exponencialni-vyhlazovani))

---

## Náhodná procházka (Random walk)

$X_0 = 0$, $X_t = X_{t-1} + Z_t$, kde $\{Z_t\}$ je bílý šum. Tedy $X_t = \sum_{i=1}^t Z_i$.

**Vlastnosti**:
- $E[X_t] = 0$
- $\mathrm{var}(X_t) = t \sigma^2$ — **rozptyl roste s časem** → **není stacionární**.
- **Přírůstky** $\Delta X_t = Z_t$ jsou stacionární (bílý šum).

**Náhodná procházka s driftem**: $X_t = c + X_{t-1} + Z_t$ — má lineární trend $E[X_t] = ct$.

Aplikace: ceny akcií (klasický model), Brownův pohyb, velikost webu, populace.

![Náhodná procházka](/pdfs/ZI/SCR/imgs/lecture_1/cell22-img07.svg)

([otevřít v Markdown, Téma 1](/pdfs/ZI/SCR/SCR_Merged.md#tema-1-uvod-do-problematiky-exponencialni-vyhlazovani))

---

## Variabilita a transformace

**Box-Coxova transformace** $y_t^{(\lambda)} = (y_t^\lambda - 1)/\lambda$ stabilizuje rozptyl. Pro $\lambda = 0$ to je logaritmus. Multiplikativní → aditivní řadu.

([otevřít v Markdown, Téma 1](/pdfs/ZI/SCR/SCR_Merged.md#tema-1-uvod-do-problematiky-exponencialni-vyhlazovani))

---

## Další procesy

- **Wienerův proces** — spojitý analog náhodné procházky.
- **Poissonův proces** — čítací proces s exponenciálně rozdělenými mezi-časy (viz NI-SPOL-9).
- **Markovský proces** — paměť pouze jeden krok zpět (viz NI-SPOL-8).
- **MA, AR, ARMA** — viz NI-ZI-21.

_Pro detaily viz [SCR_Merged.md, sekce „Časová řada jako náhodný proces" a „Příklady náhodných procesů"](/pdfs/ZI/SCR/SCR_Merged.md)._
