# Smíšené modely ARIMA: základní vlastnosti modelů/procesů, integrování a diferencování. Zápis ARIMA, včetně zápisu pomocí operátorů zpoždění a diference, speciální případy podle hodnot p, d, q. Problém redundance parametrů.

Zdroj: [SCR_Merged.md](/pdfs/ZI/SCR/SCR_Merged.md) (skripta NI-SCR, Téma 4 — Operátor B, ARIMA)

---

## Operátor zpoždění $B$

$$B X_t = X_{t-1}, \quad B^k X_t = X_{t-k}$$

**Operátor diference**: $\Delta = 1 - B$, tedy $\Delta X_t = X_t - X_{t-1}$.

Vyšší diference: $\Delta^2 X_t = \Delta(\Delta X_t) = (1 - B)^2 X_t = X_t - 2 X_{t-1} + X_{t-2}$.

Operátorová algebra umožňuje **kompaktně psát ARMA/ARIMA modely** a snadno počítat.

([otevřít v Markdown, Operátor zpoždění](/pdfs/ZI/SCR/SCR_Merged.md#operator-zpozdeni))

---

## Integrace a diferencování

**Řada je $I(d)$ (integrated order $d$)**, pokud její $d$-tá diference je stacionární (a nižší $d-1$ není).
- $I(0)$ = stacionární.
- $I(1)$ = řada, jejíž první diference je stacionární. Typický příklad: **náhodná procházka**.
- $I(2)$ = potřebuje 2 diference.

**Praktická volba $d$**: pomocí
- vizuální inspekce ACF (pomalý pokles → potřeba diferencovat),
- testů jednotkového kořene: **ADF (Augmented Dickey-Fuller)**, **KPSS**, **PP (Phillips-Perron)**.

Většinou stačí $d \le 2$. Příliš mnoho diferencí zvyšuje variabilitu a může zničit informaci.

([otevřít v Markdown, Téma 4 — Operátor B, ARIMA](/pdfs/ZI/SCR/SCR_Merged.md#tema-4-operator-b-arima-p-d-q))

---

## ARIMA(p, d, q)

$$\phi(B) (1-B)^d X_t = c + \theta(B) \varepsilon_t$$

Tedy ARMA(p, q) aplikované na $d$-krát diferencovanou řadu $\Delta^d X_t$.

**Sloučená forma** s autoregresním polynomem **s jednotkovým kořenem** $(1-B)^d$:
$\Phi(B) X_t = c + \theta(B) \varepsilon_t$, kde $\Phi(B) = \phi(B)(1-B)^d$.

### Běžné ARIMA modely

| Model | Tvar | Význam |
|-------|------|--------|
| ARIMA(0,0,0) | $X_t = \varepsilon_t$ | bílý šum |
| ARIMA(0,1,0) | $X_t = X_{t-1} + \varepsilon_t$ | náhodná procházka |
| ARIMA(0,1,0) + drift | $X_t = c + X_{t-1} + \varepsilon_t$ | random walk s driftem |
| ARIMA(1,0,0) | $X_t = c + \phi_1 X_{t-1} + \varepsilon_t$ | AR(1) |
| ARIMA(0,0,1) | $X_t = \varepsilon_t + \theta_1 \varepsilon_{t-1}$ | MA(1) |
| ARIMA(0,1,1) | $\Delta X_t = \varepsilon_t + \theta_1 \varepsilon_{t-1}$ | ~SES (exp. vyhlazování) |
| ARIMA(1,1,2) | $\phi(B)\Delta X_t = \theta(B)\varepsilon_t$ | tlumený trend |

### Reprezentace parametrů — obecná pravidla

- **p (AR část)**: zachycuje *paměť* (autokorelace) ve stacionární řadě.
- **d (integrace)**: počet diferencí potřebných pro dosažení stacionarity.
- **q (MA část)**: zachycuje *vyhlazování*, vliv minulých šoků.

### Redundance parametrů

Pokud $\phi(B)$ a $\theta(B)$ mají **společný kořen**, lze ho vykrátit — model je **redundantní**. Příklad: ARIMA(1,0,1) s $\phi_1 = \theta_1$ je vlastně bílý šum. Důležité pro identifikaci — nadbytečné parametry zvyšují varianci odhadů.

([otevřít v Markdown, Modely ARIMA(p,d,q)](/pdfs/ZI/SCR/SCR_Merged.md#modely-arima-p-d-q))

---

## Výběr a validace modelu

### In-sample fit

- **AIC** $= -2 \log L + 2(p + q + 1)$.
- **BIC** = $-2 \log L + (p+q+1) \log n$.

### Out-of-sample fit: křížová validace

**Sliding window CV** / **rolling forecast origin**: posuvným oknem počítej $h$-krokovou predikci, agreguj chyby (MAE, RMSE, MAPE).

### Auto ARIMA

Algoritmus (Hyndman & Khandakar):
1. Test jednotkového kořene → najdi $d$.
2. Pro několik kandidátních $(p, q)$ proveď MLE odhad.
3. Vyber model s minimálním AIC/BIC.
4. Iterativně rozšiřuj sousední modely v $(p, q)$ prostoru.

([otevřít v Markdown, Modely ARIMA(p,d,q)](/pdfs/ZI/SCR/SCR_Merged.md#modely-arima-p-d-q))

---

## SARIMA — sezónní ARIMA

$\text{SARIMA}(p, d, q)(P, D, Q)_s$ pro řadu se sezónností o periodě $s$:

$$\phi(B) \Phi(B^s) (1-B)^d (1-B^s)^D X_t = \theta(B) \Theta(B^s) \varepsilon_t$$

- $(P, D, Q)$ jsou sezónní parametry (analogicky k $(p, d, q)$, ale operují na násobcích $s$).
- $(1 - B^s)^D$ je **sezónní diferencování** (např. pro měsíční data $s=12$).

### Příklad
SARIMA(0,1,1)(0,1,1)$_{12}$ — Airline model (Box-Jenkins) pro letecká data:
$$(1-B)(1-B^{12}) X_t = (1+\theta_1 B)(1+\Theta_1 B^{12}) \varepsilon_t$$

([otevřít v Markdown, Modely SARIMA](/pdfs/ZI/SCR/SCR_Merged.md#modely-sarima-p-d-q-p-d-q-s))

---

## Stacionarita a invertibilita ARIMA

Aby model byl korektně definovaný:
- Kořeny $\phi(z)$ vně jednotkového kruhu (AR stacionární).
- Kořeny $\theta(z)$ vně jednotkového kruhu (MA invertibilní).
- $(1-B)^d$ záměrně přidává $d$ jednotkových kořenů — řada je nestacionární I(d), ale po diferencování stacionární.

([otevřít v Markdown, Modely ARIMA(p,d,q)](/pdfs/ZI/SCR/SCR_Merged.md#modely-arima-p-d-q))

---

## Predikce a intervaly spolehlivosti

Pro ARIMA model:
- **Point forecast** $\hat X_{T+h|T}$ — rekurzivně z modelu.
- **Variance predikce** roste s horizontem $h$:
  - Pro stacionární ARMA: $\mathrm{var}(X_{T+h|T}) \to \sigma_X^2$ (konstanta).
  - Pro ARIMA s $d \ge 1$: $\mathrm{var}$ roste neomezeně (nestacionarita).
- **CI** $\hat X_{T+h|T} \pm z_{1-\alpha/2} \sqrt{\mathrm{var}}$ — pro Gaussovské $\varepsilon$.

([otevřít v Markdown, Modely ARIMA(p,d,q)](/pdfs/ZI/SCR/SCR_Merged.md#modely-arima-p-d-q))

---

## Stavový prostor a Kalmanův filtr

ARIMA modely lze přepsat do **state-space form**:
- State equation: $\boldsymbol s_t = F \boldsymbol s_{t-1} + G \varepsilon_t$
- Observation: $X_t = H \boldsymbol s_t$

**Kalmanův filtr** pak efektivně počítá MLE, predikce, residua, missing value handling — používá se jako interní implementace ARIMA v `statsmodels`, R `forecast`. (Souvislost s NI-ZI-15.)

([otevřít v Markdown, Téma 6 — Rekurzivní odhad, Kalmanův filtr](/pdfs/ZI/SCR/SCR_Merged.md#tema-6-rekurzivni-odhad-kalmanuv-filtr))

_Detailně: [SCR_Merged.md Téma 4 — Operátor B, ARIMA(p,d,q)](/pdfs/ZI/SCR/SCR_Merged.md)._
