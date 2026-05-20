# Systémy hromadné obsluhy a jejich limitní vlastnosti. Souvislost s Markovskými řetězci se spojitým časem.

Zdroj: [VSM_Merged.pdf](/pdfs/SPOL/VSM_Merged.pdf) (slides NI-VSM, Přednáška 22 — Systémy hromadné obsluhy)

---

## Model hromadné obsluhy

Příchody i.i.d. $A_i \sim F_A$ s intenzitou $\lambda = 1/EA$; obsluha i.i.d. $S_j \sim F_S$ s intenzitou $\mu = 1/ES$; server má $c$ obslužných míst. ([otevřít v PDF, str. 416](/pdfs/SPOL/VSM_Merged.pdf#page=416))

![Model hromadné obsluhy](/answer-imgs/NI-SPOL-10/p416_model.png)

**Proces $X_t$** zaznamenává počet zákazníků v systému (server + fronta). **Zátěž** $\varrho = \lambda/(c\mu)$ — pro $\varrho < 1$ existuje rovnovážné rozdělení, pro $\varrho \ge 1$ počet zákazníků roste nade všechny meze. ([otevřít v PDF, str. 417](/pdfs/SPOL/VSM_Merged.pdf#page=417))

![Proces hromadné obsluhy a ρ](/answer-imgs/NI-SPOL-10/p417_proces_rho.png)

---

## Kendallova notace

$A | S | c | K | N | D$ — $A$ příchody, $S$ obsluha, $c$ serverů, $K$ kapacita, $N$ populace, $D$ disciplína. Označení: M = exponenciální (markovský), D = degenerované, G = obecné. ([otevřít v PDF, str. 418](/pdfs/SPOL/VSM_Merged.pdf#page=418))

![Kendallova notace](/answer-imgs/NI-SPOL-10/p418_kendall.png)

---

## Systém M|M|1 — proces zrodu a zániku

Příchody $\sim$ Poisson($\lambda$), obsluha $\sim$ Exp($\mu$), 1 server. CTMC s $Q_{n,n+1} = \lambda$, $Q_{n,n-1} = \mu$, $Q_{nn} = -(\lambda + \mu)$. ([otevřít v PDF, str. 420](/pdfs/SPOL/VSM_Merged.pdf#page=420))

![M|M|1 — matice Q](/answer-imgs/NI-SPOL-10/p420_mm1_Q.png)

**Stacionární rozdělení**: pro $\varrho = \lambda/\mu < 1$: $\pi_n = (1 - \varrho)\varrho^n$ (geometrické). Pro $\varrho \ge 1$ stacionární rozdělení **neexistuje** a $P(X_t = n) \to 0$ pro každé $n$ (řetězec uniká do nekonečna). ([otevřít v PDF, str. 421](/pdfs/SPOL/VSM_Merged.pdf#page=421))

![M|M|1 — stacionární rozdělení](/answer-imgs/NI-SPOL-10/p421_mm1_stac.png)

**Střední počet zákazníků** $EN = \varrho/(1-\varrho)$; ve frontě $EN_f = \varrho^2/(1-\varrho)$; na serveru $EN_s = \varrho$. ([otevřít v PDF, str. 423](/pdfs/SPOL/VSM_Merged.pdf#page=423))

![M|M|1 — střední hodnoty](/answer-imgs/NI-SPOL-10/p423_mm1_EN.png)

**Doba čekání ve frontě**: $P(W = 0) = 1 - \varrho$; podmíněně $(W \mid W > 0) \sim \mathrm{Exp}(\mu - \lambda)$. ([otevřít v PDF, str. 424](/pdfs/SPOL/VSM_Merged.pdf#page=424))

![M|M|1 — doba čekání W](/answer-imgs/NI-SPOL-10/p424_mm1_W.png)

---

## Systém M|M|∞

Nekonečno serverů, žádné čekání. $Q_{n,n-1} = n\mu$ (každý zákazník je obsluhován nezávisle). ([otevřít v PDF, str. 426](/pdfs/SPOL/VSM_Merged.pdf#page=426))

![M|M|∞ — matice Q](/answer-imgs/NI-SPOL-10/p426_mminf_Q.png)

**Stacionární rozdělení**: $\pi_n = \frac{1}{n!}\left(\frac{\lambda}{\mu}\right)^n e^{-\lambda/\mu}$ — **Poissonovo** rozdělení s parametrem $\lambda/\mu$. Stabilní pro libovolnou $\lambda$. ([otevřít v PDF, str. 427](/pdfs/SPOL/VSM_Merged.pdf#page=427))

![M|M|∞ — Poissonovo stacionární rozdělení](/answer-imgs/NI-SPOL-10/p427_mminf_stac.png)

---

## Systém M|M|c

$c$ paralelních serverů s frontou. $Q_{n,n-1} = \min(c, n) \cdot \mu$. ([otevřít v PDF, str. 429](/pdfs/SPOL/VSM_Merged.pdf#page=429))

![M|M|c — matice Q](/answer-imgs/NI-SPOL-10/p429_mmc_Q.png)

**Stacionární rozdělení** pro $\varrho = \lambda/(c\mu) < 1$: po částech buď $\frac{1}{n!}(\lambda/\mu)^n \pi_0$ pro $n \le c$, nebo $\frac{c^c}{c!}\varrho^n \pi_0$ pro $n > c$. ([otevřít v PDF, str. 430](/pdfs/SPOL/VSM_Merged.pdf#page=430))

![M|M|c — stacionární rozdělení](/answer-imgs/NI-SPOL-10/p430_mmc_stac.png)

---

## Littleho věta

Pro každý **striktně stacionární** proces hromadné obsluhy: $EN = \lambda \cdot ET$, kde $EN$ je střední počet zákazníků, $ET$ střední doba strávená v systému, $\lambda$ intenzita příchodů. Velmi obecná — neklade téměř žádné požadavky na proces příchodů, rozdělení obsluhy ani disciplínu. ([otevřít v PDF, str. 431](/pdfs/SPOL/VSM_Merged.pdf#page=431))

![Littleho věta](/answer-imgs/NI-SPOL-10/p431_little.png)

**Příklad — M|M|1**: $EN = \frac{\varrho}{1-\varrho} = \frac{\lambda/\mu}{1 - \lambda/\mu}$, $ET = \frac{EN}{\lambda} = \frac{1}{\mu - \lambda}$ (souhlasí s odvozením přes dobu čekání). ([otevřít v PDF, str. 432](/pdfs/SPOL/VSM_Merged.pdf#page=432))

![Littleho věta — příklad](/answer-imgs/NI-SPOL-10/p432_little_priklad.png)
