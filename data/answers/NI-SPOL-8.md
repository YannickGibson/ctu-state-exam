# Markovské řetězce s diskrétním časem. Jejich limitní vlastnosti.

Zdroj: [VSM_Merged.pdf](/pdfs/SPOL/VSM_Merged.pdf) (slides NI-VSM, Přednášky 14–15)

---

## Náhodný proces

Reálný náhodný proces $\boldsymbol X = \{X_t \mid t \in T\}$, $X_t: \Omega \to \mathbb R$. Čas $T \subseteq \mathbb R$ může být **diskrétní** ($T = \mathbb N_0$) nebo **spojitý**; **množina stavů** $S$ může být spočetná (řetězec) nebo nespočetná. ([otevřít v PDF, str. 256](/pdfs/SPOL/VSM_Merged.pdf#page=256))

![Definice náhodného procesu](/answer-imgs/NI-SPOL-8/p256_def_proces.png)

**Spočetná $S$, diskrétní čas**: rozdělení $p(n) = (p_1(n), p_2(n), \ldots)$, matice přechodu $P_{ij}(n,m) = P(X_m = j \mid X_n = i)$. ([otevřít v PDF, str. 261](/pdfs/SPOL/VSM_Merged.pdf#page=261))

![Spočetná S, diskrétní čas](/answer-imgs/NI-SPOL-8/p261_diskretni_cas.png)

---

## Definice markovského řetězce

**Markovská podmínka**: $P(X_n = s \mid X_{n-1}, \ldots, X_0) = P(X_n = s \mid X_{n-1})$ — proces „zapomíná historii". ([otevřít v PDF, str. 262](/pdfs/SPOL/VSM_Merged.pdf#page=262))

![Definice markovského řetězce](/answer-imgs/NI-SPOL-8/p262_def_markov.png)

**Chapman-Kolmogorovova rovnice**: $\mathbf P(n, r) = \mathbf P(n, m) \cdot \mathbf P(m, r)$. ([otevřít v PDF, str. 265](/pdfs/SPOL/VSM_Merged.pdf#page=265))

![Chapman-Kolmogorovova rovnice](/answer-imgs/NI-SPOL-8/p265_chapman_kolmogorov.png)

**Homogenní markovský řetězec**: $P(X_{n+1} = j \mid X_n = i) = P(X_1 = j \mid X_0 = i)$ pro všechna $n$. Jednokroková matice přechodu $\mathbf P$; $\mathbf P(n) = \mathbf P^n$. ([otevřít v PDF, str. 266](/pdfs/SPOL/VSM_Merged.pdf#page=266))

![Homogenní markovský řetězec](/answer-imgs/NI-SPOL-8/p266_homogenni.png)

**Stochastická matice**: $P_{ij} \ge 0$, $\sum_j P_{ij} = 1$ (řádkové součty $=1$). ([otevřít v PDF, str. 270](/pdfs/SPOL/VSM_Merged.pdf#page=270))

![Stochastická matice](/answer-imgs/NI-SPOL-8/p270_stochasticka_matice.png)

---

## Klasifikace stavů

**Trvalý (rekurentní)** $i$: $P(\exists n: X_n = i \mid X_0 = i) = 1$. **Přechodný (transientní)**: stejná pravděpodobnost $< 1$. ([otevřít v PDF, str. 281](/pdfs/SPOL/VSM_Merged.pdf#page=281))

![Klasifikace: trvalý vs přechodný](/answer-imgs/NI-SPOL-8/p281_klas_trvaly_prechodny.png)

**Čas první návštěvy** $\tau_i = \min\{n \ge 1: X_n = i\}$; $f_{ii}(n) = P(\tau_i = n \mid X_0 = i)$. ([otevřít v PDF, str. 282](/pdfs/SPOL/VSM_Merged.pdf#page=282))

![Čas první návštěvy](/answer-imgs/NI-SPOL-8/p282_cas_prvni_navstevy.png)

**Střední doba návratu** $\mu_i = E(\tau_i \mid X_0 = i)$. **Trvalý nenulový** stav: $\mu_i < +\infty$; **trvalý nulový**: $\mu_i = +\infty$. ([otevřít v PDF, str. 284](/pdfs/SPOL/VSM_Merged.pdf#page=284))

![Střední doba návratu](/answer-imgs/NI-SPOL-8/p284_stredni_doba_navratu.png)

**Periodicita** stavu $d(i) = \gcd\{n \in \mathbb N \mid P_{ii}(n) > 0\}$. **Aperiodický** stav má $d(i) = 1$. Vzájemně dosažitelné stavy mají stejnou periodu. ([otevřít v PDF, str. 286](/pdfs/SPOL/VSM_Merged.pdf#page=286))

![Periodicita](/answer-imgs/NI-SPOL-8/p286_periodicita.png)

---

## Limitní věta

Pro **aperiodický** stav $i$ platí $\lim_{n\to\infty} P_{ii}(n) = \frac{1}{\mu_i}$. Obecně pro $j \to i$: $\lim P_{ji}(n) = \frac{f_{ji}}{\mu_i}$. ([otevřít v PDF, str. 288](/pdfs/SPOL/VSM_Merged.pdf#page=288))

![Limitní pravděpodobnosti přechodu](/answer-imgs/NI-SPOL-8/p288_limita_Pii.png)

**Souhrn klasifikace stavů pomocí matice přechodu** $\mathbf P$: (i) přechodný, (ii) trvalý nulový, (iii) trvalý nenulový aperiodický (= **ergodický**), (iv) trvalý nenulový periodický. ([otevřít v PDF, str. 290](/pdfs/SPOL/VSM_Merged.pdf#page=290))

![Klasifikace stavů — souhrn](/answer-imgs/NI-SPOL-8/p290_klas_souhrn.png)

---

## Rozklad množiny stavů

**Dosažitelnost** $i \to j$ ⇔ $\exists n: P_{ij}(n) > 0$. Vzájemně dosažitelné stavy ($i \leftrightarrow j$) tvoří třídy ekvivalence; stavy téže třídy jsou stejného typu. ([otevřít v PDF, str. 291](/pdfs/SPOL/VSM_Merged.pdf#page=291))

![Dosažitelnost](/answer-imgs/NI-SPOL-8/p291_dosazitelnost.png)

**Uzavřená množina** $C$: $\forall i \in C, j \notin C: P_{ij} = 0$. Jeden stav $\Rightarrow$ pohlcující (absorpční). ([otevřít v PDF, str. 292](/pdfs/SPOL/VSM_Merged.pdf#page=292))

![Uzavřená množina stavů](/answer-imgs/NI-SPOL-8/p292_uzavrena_mnozina.png)

**Věta o jednoznačném rozkladu**: $S = T \cup C_1 \cup C_2 \cup \ldots$ — $T$ jsou přechodné, $C_i$ ireducibilní uzavřené třídy trvalých stavů. ([otevřít v PDF, str. 293](/pdfs/SPOL/VSM_Merged.pdf#page=293))

![Rozklad množiny stavů](/answer-imgs/NI-SPOL-8/p293_rozklad_S.png)

---

## Stacionární rozdělení a limitní chování

**Stacionární rozdělení**: $\boldsymbol\pi \mathbf P = \boldsymbol\pi$, tj. $p(0) = \boldsymbol\pi \Rightarrow p(n) = \boldsymbol\pi$ pro každé $n$.

**Věta o existenci stacionárního rozdělení** (nerozložitelný řetězec): (i) všechny stavy přechodné/trvalé nulové → stacionární rozdělení **neexistuje**; (ii) všechny stavy trvalé nenulové → existuje **jediné** $\boldsymbol\pi$, $\pi_j = 1/\mu_j$; pokud navíc **aperiodický**, pak $\boldsymbol\pi = \lim_{n\to\infty} p(n)$ pro libovolné $p(0)$. ([otevřít v PDF, str. 301](/pdfs/SPOL/VSM_Merged.pdf#page=301))

![Věta o existenci stacionárního rozdělení](/answer-imgs/NI-SPOL-8/p301_veta_stacionarita.png)

**Důsledky**: pro **konečnou** $S$ vždy existuje stacionární rozdělení (každá uzavřená třída obsahuje aspoň jeden trvalý nenulový stav). Pro $r$ uzavřených tříd existuje $r$ lineárně nezávislých stacionárních rozdělení; libovolná konvexní kombinace je stacionární. ([otevřít v PDF, str. 303](/pdfs/SPOL/VSM_Merged.pdf#page=303))

![Stacionární rozdělení — příklad](/answer-imgs/NI-SPOL-8/p303_stac_priklad.png)
