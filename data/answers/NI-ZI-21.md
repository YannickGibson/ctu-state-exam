# Autoregresní modely (AR) a modely klouzavých průměrů (MA): základní vlastnosti modelů/procesů, jejich stacionarita. Zápis AR a MA, včetně zápisu pomocí operátoru zpoždění. Identifikace řádů AR a MA z autokorelačních funkcí a pomocí informačních kritérií.

Zdroj: [SCR_Merged.md](/pdfs/ZI/SCR/SCR_Merged.md) (skripta NI-SCR, Téma 2–3)

---

## Autokorelační funkce ACF

Pro slabě stacionární řadu definuj:
$$\rho(\tau) = \frac{\gamma(\tau)}{\gamma(0)} = \frac{\mathrm{cov}(X_t, X_{t+\tau})}{\mathrm{var}(X_t)} \in [-1, 1]$$

**Výběrová ACF** $\hat\rho(\tau) = \hat\gamma(\tau)/\hat\gamma(0)$, kde $\hat\gamma(\tau) = \frac{1}{n} \sum_{t=1}^{n-\tau} (X_t - \bar X)(X_{t+\tau} - \bar X)$.

Confidence band $\pm 1.96/\sqrt{n}$ pro testování $\rho(\tau) = 0$ pod hypotézou bílého šumu (Bartlett).

([otevřít v Markdown, Téma 2 — ACF, PACF, AR](/pdfs/ZI/SCR/SCR_Merged.md#tema-2-acf-pacf-autoregresni-modely))

---

## Parciální autokorelační funkce PACF

$\phi_{kk}$ je korelace $X_t$ a $X_{t-k}$ **po odstranění** vlivu mezilehlých hodnot $X_{t-1}, \ldots, X_{t-k+1}$. Spočítá se z regresí $X_t$ na $X_{t-1}, \ldots, X_{t-k}$ — poslední koeficient je $\phi_{kk}$.

ACF a PACF jsou klíčové **diagnostické nástroje** pro identifikaci ARMA modelů.

([otevřít v Markdown, Téma 2 — ACF, PACF, AR](/pdfs/ZI/SCR/SCR_Merged.md#tema-2-acf-pacf-autoregresni-modely))

---

## AR(p) — Autoregresní model

$$X_t = c + \phi_1 X_{t-1} + \phi_2 X_{t-2} + \ldots + \phi_p X_{t-p} + \varepsilon_t$$

kde $\varepsilon_t$ je bílý šum, $\phi_i$ jsou parametry, $c$ je konstanta.

**Operátorový tvar**: $\phi(B) X_t = c + \varepsilon_t$, kde $\phi(B) = 1 - \phi_1 B - \ldots - \phi_p B^p$, $B$ je operátor zpoždění ($B X_t = X_{t-1}$).

### Stacionarita AR(p)

AR(p) je **stacionární** ⇔ kořeny polynomu $\phi(z) = 1 - \phi_1 z - \ldots - \phi_p z^p$ leží **vně jednotkového kruhu** ($|z_i| > 1$).

### Příklady

- **AR(1)**: $X_t = c + \phi_1 X_{t-1} + \varepsilon_t$. Stacionární pro $|\phi_1| < 1$. Pro $\phi_1 = 1$: náhodná procházka. ACF klesá geometricky $\rho(\tau) = \phi_1^\tau$.
- **AR(2)**: ACF může mít oscilační charakter (komplexní kořeny).

![AR(1) řada](/pdfs/ZI/SCR/imgs/lecture_2/cell20-img01.svg)

### Charakteristické chování

- **ACF AR(p)**: klesá geometricky / oscilačně (theoretically nenulová pro všechna $\tau$).
- **PACF AR(p)**: **uřízne se** za zpožděním $p$ (parciální korelace $\phi_{kk} = 0$ pro $k > p$).

([otevřít v Markdown, Téma 2 — ACF, PACF, AR](/pdfs/ZI/SCR/SCR_Merged.md#tema-2-acf-pacf-autoregresni-modely))

---

## MA(q) — Moving Average

$$X_t = \mu + \varepsilon_t + \theta_1 \varepsilon_{t-1} + \ldots + \theta_q \varepsilon_{t-q} = \mu + \theta(B) \varepsilon_t$$

Lineární kombinace **současného a předchozích šumů** $\varepsilon_t$.

### Stacionarita

MA(q) je **vždy stacionární** (konečná lineární kombinace stacionárního šumu).

### Invertibilita

MA(q) je **invertibilní** ⇔ kořeny $\theta(z) = 1 + \theta_1 z + \ldots + \theta_q z^q$ leží **vně jednotkového kruhu**. Pak lze vyjádřit $\varepsilon_t$ jako nekonečnou AR z minulých $X_t$ — důležité pro odhad a predikci.

### Příklad MA(1)
$X_t = \varepsilon_t + \theta_1 \varepsilon_{t-1}$, $\gamma(0) = (1+\theta_1^2)\sigma^2$, $\gamma(1) = \theta_1 \sigma^2$, $\gamma(\tau) = 0$ pro $\tau \ge 2$.

### Charakteristické chování

- **ACF MA(q)**: **uřízne se** za zpožděním $q$.
- **PACF MA(q)**: klesá geometricky / oscilačně.

([otevřít v Markdown, Téma 3 — MA a ARMA](/pdfs/ZI/SCR/SCR_Merged.md#tema-3-modely-ma-a-arma))

---

## ARMA(p, q) — smíšený model

$$\phi(B) X_t = c + \theta(B) \varepsilon_t$$

Spojí AR a MA: $X_t = c + \phi_1 X_{t-1} + \ldots + \phi_p X_{t-p} + \varepsilon_t + \theta_1 \varepsilon_{t-1} + \ldots + \theta_q \varepsilon_{t-q}$.

Stacionarita: kořeny $\phi(z)$ vně jednotkového kruhu. Invertibilita: kořeny $\theta(z)$ vně jednotkového kruhu.

**ACF i PACF** klesají postupně (žádné nezpůsobné useknutí) — proto identifikace pomocí samotných ACF/PACF je u ARMA náročnější.

([otevřít v Markdown, Téma 3 — MA a ARMA](/pdfs/ZI/SCR/SCR_Merged.md#tema-3-modely-ma-a-arma)) ([otevřít v Markdown, Odhad ARMA modelu](/pdfs/ZI/SCR/SCR_Merged.md#odhad-arma-modelu))

---

## Identifikace modelů

### Box-Jenkinsova metodologie

1. **Identifikace**: pomocí ACF/PACF zvol $(p, q)$.
2. **Odhad parametrů**: MLE, condicional MLE, OLS pro AR.
3. **Validace**: residua musí být bílý šum (Ljung-Boxův test, ACF residuí).
4. **Predikce**: aplikuj model na out-of-sample data.

### Volba (p, q) podle ACF/PACF

| Model | ACF | PACF |
|-------|-----|------|
| AR(p) | klesá geometricky | useknutí v $p$ |
| MA(q) | useknutí v $q$ | klesá geometricky |
| ARMA(p,q) | klesá | klesá |

### Informační kritéria

- **AIC** $= -2 \log L + 2k$ (penalizace počtu parametrů $k$).
- **BIC/SBC** $= -2 \log L + k \log n$ (silnější penalizace).
- **AICc** — korigovaná AIC pro malé výběry.

Hledáme model s minimálním AIC/BIC nebo nejlepší out-of-sample CV chybou.

### Odhad parametrů AR

**OLS / Yule-Walker rovnice**:
$$\rho(\tau) = \phi_1 \rho(\tau-1) + \ldots + \phi_p \rho(\tau-p), \quad \tau = 1, \ldots, p$$
soustavu řešíme nahrazením teoretických ACF výběrovými $\hat\rho(\tau)$.

**Conditional MLE pro AR(p)**: zafixovat prvních $p$ hodnot jako počáteční podmínky a maximalizovat věrohodnost zbytku.

**Plný MLE** maximalizuje sdruženou hustotu všech $n$ hodnot — pro AR(1) gaussovský komplikovanější.

### Odhad parametrů MA

Závisí nelineárně na $\theta$, je třeba **numerická optimalizace**. Conditional MLE: zafixuj $\varepsilon_0 = \ldots = \varepsilon_{1-q} = 0$ a iterativně počítej $\varepsilon_t = X_t - \theta_1 \varepsilon_{t-1} - \ldots$.

### Diagnostika reziduí

- **Ljung-Boxův test** na nezávislost reziduí (test bílého šumu).
- **ACF reziduí** by neměla mít signifikantní hodnoty.
- **Histogram** / Q-Q plot reziduí (normalita).

([otevřít v Markdown, Téma 3 — Odhad ARMA modelu](/pdfs/ZI/SCR/SCR_Merged.md#odhad-arma-modelu))

_Detailní výklad: [SCR_Merged.md Téma 2 a Téma 3](/pdfs/ZI/SCR/SCR_Merged.md)._
