# Markovské řetězce se spojitým časem. Souvislost s Markovskými řetezci s diskrétním časem a s Poissonovým procesem.

Zdroj: [VSM_Merged.pdf](/pdfs/SPOL/VSM_Merged.pdf) (slides NI-VSM, Přednášky 18–20)

---

## Poissonův proces

**Čítací proces** $\{N_t \mid t \ge 0\}$ — trajektorie nezáporná, celočíselná, neklesající. ([otevřít v PDF, str. 346](/pdfs/SPOL/VSM_Merged.pdf#page=346))

![Čítací proces](/answer-imgs/NI-SPOL-9/p346_citaci_proces.png)

**Poissonův proces — definice 1** (přes časy mezi událostmi): $X_j \sim \mathrm{Exp}(\lambda)$ i.i.d., $T_n = \sum X_j$, $N_t = \max\{n: T_n \le t\}$. ([otevřít v PDF, str. 347](/pdfs/SPOL/VSM_Merged.pdf#page=347))

![Poisson — definice 1](/answer-imgs/NI-SPOL-9/p347_poisson_def.png)

**Ekvivalentní definice 2** (přes přírůstky): $N_0 = 0$, $N_t - N_s \sim \mathrm{Poisson}(\lambda(t-s))$, nezávislé přírůstky. ([otevřít v PDF, str. 349](/pdfs/SPOL/VSM_Merged.pdf#page=349))

![Poisson — ekvivalentní definice 2](/answer-imgs/NI-SPOL-9/p349_poisson_def2.png)

**Binomický vs Poissonův proces**: Poisson je spojitý ekvivalent binomického (Geom → Exp). Klíč: bezpaměťovost geometrického / exponenciálního rozdělení. ([otevřít v PDF, str. 350](/pdfs/SPOL/VSM_Merged.pdf#page=350))

![Binomický vs Poissonův proces](/answer-imgs/NI-SPOL-9/p350_binom_vs_poisson.png)

**Bezpaměťovost exponenciálního rozdělení**: $P(T > t + s \mid T > t) = P(T > s)$ — jediné spojité rozdělení s touto vlastností. Klíčové pro markovskost spojitých řetězců. ([otevřít v PDF, str. 352](/pdfs/SPOL/VSM_Merged.pdf#page=352))

![Bezpaměťovost exponenciálního rozdělení](/answer-imgs/NI-SPOL-9/p352_bezpamet_exp.png)

---

## Markovský řetězec se spojitým časem (CTMC)

**Definice**: spočetná $S$, čas $T = [0, +\infty)$. Markovská podmínka: $P(X_{t_k} = s_k \mid X_{t_{k-1}}, \ldots, X_{t_0}) = P(X_{t_k} = s_k \mid X_{t_{k-1}})$. Matice přechodu $\mathbf P(t, s) = (P(X_s = j \mid X_t = i))$. ([otevřít v PDF, str. 360](/pdfs/SPOL/VSM_Merged.pdf#page=360))

![CTMC — definice](/answer-imgs/NI-SPOL-9/p360_ctmc_def.png)

**Homogenní CTMC**: $\mathbf P(t, t+s) = \mathbf P(s)$. Chapman-Kolmogorov: $\mathbf P(t+s) = \mathbf P(t) \mathbf P(s)$. Poissonův proces je homogenní CTMC. ([otevřít v PDF, str. 362](/pdfs/SPOL/VSM_Merged.pdf#page=362))

![Homogenní CTMC](/answer-imgs/NI-SPOL-9/p362_homogenni_ctmc.png)

---

## Matice skokových intenzit Q

$\mathbf Q = \mathbf P'(0) = \lim_{h \to 0_+} \frac{\mathbf P(h) - \mathbf I}{h}$, tj. $Q_{ij} = \lim_{h\to 0_+} \frac{P_{ij}(h)}{h}$ pro $i \ne j$. Pro malé $h$: $P_{ij}(h) = Q_{ij} h + o(h)$ (skok $i \to j$). ([otevřít v PDF, str. 363](/pdfs/SPOL/VSM_Merged.pdf#page=363))

![Matice skokových intenzit](/answer-imgs/NI-SPOL-9/p363_matice_intenzit.png)

**Vlastnosti $\mathbf Q$**: $Q_{ij} \ge 0$ pro $i \ne j$; $Q_{ii} \le 0$; řádkový součet $= 0$. ([otevřít v PDF, str. 364](/pdfs/SPOL/VSM_Merged.pdf#page=364))

![Vlastnosti Q](/answer-imgs/NI-SPOL-9/p364_vlastnosti_Q.png)

**Příklad — Poissonův proces**: $\mathbf Q$ má $-\lambda$ na diagonále, $\lambda$ na superdiagonále, nuly jinde. ([otevřít v PDF, str. 365](/pdfs/SPOL/VSM_Merged.pdf#page=365))

![Q Poissonova procesu](/answer-imgs/NI-SPOL-9/p365_poisson_Q.png)

---

## Souvislost s diskrétními řetězci a Poissonovým procesem

**Diskrétní řetězec časovaný Poissonem**: $X_t := Y_{N_t}$, kde $\{N_t\}$ je Poissonův proces s intenzitou $\lambda$, $\{Y_n\}$ DTMC s maticí $\mathbf D$. Pak $\{X_t\}$ je CTMC s $\mathbf Q = \lambda(\mathbf D - \mathbf I)$. ([otevřít v PDF, str. 373](/pdfs/SPOL/VSM_Merged.pdf#page=373))

![Diskrétní řetězec časovaný Poissonem](/answer-imgs/NI-SPOL-9/p373_diskr_casovany_poissonem.png)

**Konstrukce / simulace CTMC**: $\lambda = \sup_i (-Q_{ii})$, $\mathbf D = \mathbf I + \mathbf Q/\lambda$ je stochastická; trajektorie generována jako $X_t = Y_{N_t}$.

---

## Kolmogorovy rovnice

**Dopředná**: $\mathbf P'(t) = \mathbf P(t) \mathbf Q$. **Zpětná**: $\mathbf P'(t) = \mathbf Q \mathbf P(t)$. Rozdělení $\mathbf p'(t) = \mathbf p(t) \mathbf Q$. Řešení: $\mathbf P(t) = e^{\mathbf Q t}$. ([otevřít v PDF, str. 380](/pdfs/SPOL/VSM_Merged.pdf#page=380))

![Kolmogorovy rovnice](/answer-imgs/NI-SPOL-9/p380_kolmogorov.png)

---

## Stacionární rozdělení a limitní chování

**Stacionární rozdělení**: $\boldsymbol\pi \mathbf P(t) = \boldsymbol\pi$ pro každé $t$ ⇔ $\boldsymbol\pi \mathbf Q = \mathbf 0$. ([otevřít v PDF, str. 384](/pdfs/SPOL/VSM_Merged.pdf#page=384))

![Stacionární rozdělení: πQ = 0](/answer-imgs/NI-SPOL-9/p384_stac_piQ_0.png)

**Limitní vlastnosti** pro nerozložitelný CTMC: (i) existuje-li stacionární $\boldsymbol\pi$, je jednoznačné a $\lim_{t\to\infty} P_{ij}(t) = \pi_j$; (ii) jinak $\lim P_{ij}(t) = 0$. **Konečná $S$** ⇒ stacionární rozdělení vždy existuje. ([otevřít v PDF, str. 385](/pdfs/SPOL/VSM_Merged.pdf#page=385))

![Limitní vlastnosti CTMC](/answer-imgs/NI-SPOL-9/p385_limitni_vlastnosti.png)

**Detailní rovnováha**: $\pi_j Q_{ji} = \pi_i Q_{ij}$ — pokud splněno, je $\boldsymbol\pi$ stacionární. Užitečné pro proces zrodu a zániku ($\pi_n = \prod_k (\lambda_{k-1}/\mu_k) \pi_0$). ([otevřít v PDF, str. 388](/pdfs/SPOL/VSM_Merged.pdf#page=388))

![Detailní rovnováha](/answer-imgs/NI-SPOL-9/p388_detailni_rovnovaha.png)
