# Hladká optimalizace bez omezení, gradientní metody a volba kroku.

Zdroj: [PON_Merged.pdf](/pdfs/ZI/PON_Merged.pdf) (skripta NI-PON, kapitola 3 — Optimalizace)

---

## Hladká optimalizace

**Hladká (smooth) optimalizace** typicky předpokládá, že účelová funkce $f$, omezení $g$, $h$ mají na otevřené nadmnožině přípustné množiny $D$ spojité (druhé) parciální derivace — tj. jsou (dvakrát) **spojitě diferencovatelné**. ([otevřít v PDF, str. 61](/pdfs/ZI/PON_Merged.pdf#page=61))

![Hladká optimalizace](/answer-imgs/NI-ZI-19/p61.png)

**Bez omezení / volná optimalizace**: úloha $\min_{x \in \mathbb R^n} f(x)$ bez omezujících podmínek. ([otevřít v PDF, str. 62](/pdfs/ZI/PON_Merged.pdf#page=62))

![Optimalizační úloha](/answer-imgs/NI-ZI-19/p62.png)

---

## Optimální podmínky (KKT pro bez omezení)

- **1. řád** (nutná podmínka pro lokální minimum): $\nabla f(x^*) = 0$ — stacionární bod.
- **2. řád** (postačující): $\nabla f(x^*) = 0$ **a** $\nabla^2 f(x^*) \succ 0$ (Hessian je pozitivně definitní).

Pro **konvexní** $f$ je každý stacionární bod globálním minimem.

---

## Iterační schéma

$$x_{k+1} = x_k + \alpha_k p_k$$

kde $p_k$ je **směr** a $\alpha_k > 0$ je **délka kroku** (step size, learning rate). Dvě hlavní strategie:

- **Line search**: nejprve zvol $p_k$, pak najdi vhodné $\alpha_k$.
- **Trust region**: nejprve zvol poloměr důvěryhodné oblasti $\Delta_k$, pak najdi krok v něm.

![Line search](/answer-imgs/NI-ZI-19/p64.png)

---

## Volba směru $p_k$

### Metoda spádu (steepest descent)
$$p_k = -\nabla f(x_k)$$
Nejprudší klesání. **Lineární konvergence** v okolí minima; rychlost závisí na kondičním čísle Hessianu. Zigzaguje v úzkých údolích.

### Newtonova metoda
$$p_k = -\left[\nabla^2 f(x_k)\right]^{-1} \nabla f(x_k)$$
Z modelu Taylor 2. řádu: $f(x_k + p) \approx f(x_k) + \nabla f^T p + \frac{1}{2} p^T \nabla^2 f \, p$, optimum kvadratického modelu. **Kvadratická konvergence** v okolí minima. Vyžaduje Hessian (drahý) a jeho pozitivní definitnost.

### Kvazi-Newton (BFGS, L-BFGS)
$$p_k = -B_k^{-1} \nabla f(x_k)$$
kde $B_k \approx \nabla^2 f(x_k)$ se aproximuje inkrementálně z gradientů. **Super-lineární konvergence**, bez výpočtu Hessianu. L-BFGS používá jen posledních $m$ vektorů — paměťově efektivní pro velké $n$.

### Sdružený gradient (Conjugate Gradient)
$$p_k = -\nabla f(x_k) + \beta_k p_{k-1}$$
kde $\beta_k$ (Fletcher-Reeves, Polak-Ribière). Pro kvadratickou $f$ konverguje v ≤ $n$ krocích. Vhodný pro velmi velké rozměry.

### Stochastický gradient (SGD) — pro velké datové sady
$$x_{k+1} = x_k - \alpha_k \nabla f_i(x_k)$$
gradient počítán jen z mini-batche; **momentum**, **Adam**, **RMSProp** = adaptivní rozšíření.

---

## Volba délky kroku $\alpha_k$ (line search)

### Exact line search
$\alpha_k = \arg\min_{\alpha > 0} f(x_k + \alpha p_k)$ — drahé.

### Inexact line search — Armijo (sufficient decrease)
$$f(x_k + \alpha p_k) \le f(x_k) + c_1 \alpha \nabla f(x_k)^T p_k$$
typicky $c_1 \in (0, 1/2)$, např. $10^{-4}$. ([otevřít v PDF, str. 66](/pdfs/ZI/PON_Merged.pdf#page=66))

![Armijo step backtracking](/answer-imgs/NI-ZI-19/p66.png)

**Backtracking algoritmus**: začni $\alpha = 1$ (nebo $\gamma_0$), opakovaně $\alpha \leftarrow c \alpha$ (typicky $c = 1/2$), dokud Armijova podmínka neplatí.

### Wolfeho podmínky

- **Armijo** (sufficient decrease): viz výše.
- **Curvature condition**: $\nabla f(x_k + \alpha p_k)^T p_k \ge c_2 \nabla f(x_k)^T p_k$, $c_2 \in (c_1, 1)$.
- **Silná Wolfe**: navíc $|\nabla f(x_k + \alpha p_k)^T p_k| \le c_2 |\nabla f(x_k)^T p_k|$.

Wolfeho podmínky zaručují dostatečné snížení **a** dostatečnou změnu sklonu — důležité pro kvazi-Newton (aby BFGS update zachovala pozitivní definitnost).

**Věta**: pro spojitě diferencovatelnou a zdola omezenou $f$ vždy existuje $\alpha_k$ splňující Wolfeho podmínky.

---

## Konvergenční výsledky

Pro $f$ Lipschitz-spojitý gradient s konstantou $L$:
- **Gradient descent** s $\alpha = 1/L$: $\|\nabla f(x_k)\|^2 = O(1/k)$. Pro silně konvexní s konstantou $\mu$: lineární konvergence rate $1 - \mu/L$.
- **Newton**: kvadratická lokální konvergence pro silně konvexní $f$.
- **Quasi-Newton**: super-lineární.
- **Heavy-ball / Nesterov accelerated GD**: $O(1/k^2)$ pro konvexní $f$ — optimální mezi prvořádovými metodami.

---

## Trust region (alternativní k line search)

Najdi $p$ minimalizující kvadratický model $m_k(p) = f(x_k) + \nabla f^T p + \frac{1}{2} p^T B_k p$ za omezení $\|p\| \le \Delta_k$. Podle poměru skutečného a předpovězeného poklesu se $\Delta_k$ zvětší/zmenší. Robustnější u špatně kondicionovaných úloh.

---

## Adaptivní gradientní metody (deep learning)

- **Momentum** $v_{k+1} = \beta v_k + (1-\beta)\nabla f$; $x_{k+1} = x_k - \alpha v_{k+1}$.
- **Nesterov momentum** — gradient v "look-ahead" bodě.
- **AdaGrad** $\alpha_k = \alpha / \sqrt{\sum g_i^2 + \epsilon}$ — adaptivní per-feature, klesá příliš agresivně.
- **RMSProp** — exponenciální průměr čtverců gradientů.
- **Adam** — kombinace momentum + RMSProp, $\hat m / (\sqrt{\hat v} + \epsilon)$, bias correction. Nejpoužívanější default v hlubokém učení.

---

## Volba kroku v praxi DL

- **Konstantní** $\alpha$ (klasický SGD).
- **Step decay** (každých $N$ epoch).
- **Cosine annealing** — pomalý decay přes celý trénink.
- **Warmup** — krátká lineární rampa od 0 do peak rate.
- **Cyclical learning rates** (CLR), **One-cycle policy** — Smith.
- **Learning rate finder** — nárazové zvyšování + sledování loss.
