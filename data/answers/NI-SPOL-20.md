# Paralelní algoritmy pro redukci, prefixový součet a segmentový prefixový součet na PRAM, v ortogonálních, hyperkubických a obecných topologiích, aplikace.

Zdroj: [PDP_Merged.pdf](/pdfs/SPOL/PDP_Merged.pdf) (slides NI-PDP, Přednáška 10 — Paralelní redukce a prefixový součet)

---

## Paralelní redukce — definice

Vstup: pole $X[0..n-1]$ a asociativní (volitelně komutativní) binární operace $\oplus$. Výstup: skalár $S = X[0] \oplus X[1] \oplus \cdots \oplus X[n-1]$. Je to operace **AOR** (All-to-One Reduction). $T(n,p) = \alpha n/p + \beta \log p$, dolní mez $\Omega(\log n)$. **Normální hyperkubický algoritmus** ⇒ optimální na hyperkubech. ([otevřít v PDF, str. 476](/pdfs/SPOL/PDP_Merged.pdf#page=476))

![Definice paralelní redukce](/answer-imgs/NI-SPOL-20/p476_def_redukce.png)

## Implementace redukce v různých topologiích

(a) úplný binární strom/motýlek, (b) hyperkrychle, (c) WH 1-D mřížka, (d) EREW PRAM. ([otevřít v PDF, str. 477](/pdfs/SPOL/PDP_Merged.pdf#page=477))

![Implementace redukce — různé topologie](/answer-imgs/NI-SPOL-20/p477_impl_redukce.png)

---

## Redukce v MPI: `MPI_Reduce`, `MPI_Allreduce`

`MPI_Reduce(sendbuf, recvbuf, count, datatype, op, root, comm)` — výsledek je v procesu `root`. Předdefinované operace `MPI_SUM`, `MPI_MAX`, `MPI_LXOR`, `MPI_MAXLOC` apod.; uživatelské přes `MPI_Op_create`. ([otevřít v PDF, str. 478](/pdfs/SPOL/PDP_Merged.pdf#page=478))

![MPI_Reduce](/answer-imgs/NI-SPOL-20/p478_mpi_reduce.png)

**`MPI_Allreduce`** = AAR (All-to-All Reduction). Výsledek redukce skončí u všech procesů; uzlově symetrická operace. ([otevřít v PDF, str. 482](/pdfs/SPOL/PDP_Merged.pdf#page=482))

![MPI_Allreduce](/answer-imgs/NI-SPOL-20/p482_mpi_allreduce.png)

---

## Prefixový součet — definice (PPS, scan)

Vstup: pole $X[0..n-1]$ a asociativní + komutativní operace $\oplus$. Výstup: $Y[i] = X[0] \oplus X[1] \oplus \cdots \oplus X[i]$. Klasická aplikace: **CountingSort**. ([otevřít v PDF, str. 487](/pdfs/SPOL/PDP_Merged.pdf#page=487))

![Definice PPS](/answer-imgs/NI-SPOL-20/p487_def_pps.png)

---

## PPS na PRAM

### EREW PRAM

Indukční algoritmus: po kroku $j$ obsahuje $M[k]$ částečný součet $X[k - 2^{j+1} + 1] \oplus \cdots \oplus X[k]$. $\lceil \log n \rceil$ kroků. ([otevřít v PDF, str. 489](/pdfs/SPOL/PDP_Merged.pdf#page=489))

![PPS na EREW PRAM](/answer-imgs/NI-SPOL-20/p489_pps_erew_pram.png)

### APRAM

Stejný algoritmus s **bariérou** mezi kroky; $T(n,p) = \alpha n/p + \beta \log^2 p$. ([otevřít v PDF, str. 500](/pdfs/SPOL/PDP_Merged.pdf#page=500))

![PPS na APRAM](/answer-imgs/NI-SPOL-20/p500_pps_apram.png)

---

## PPS na nepřímém stromu / motýlku

Vstupní data v listech; vnitřní uzly počítají. **Vzestupné vlny** spouští **sestupné vlny**, $2h(T)$ kroků. Úplný binární strom/motýlek ⇒ $O(\log n)$. ([otevřít v PDF, str. 490](/pdfs/SPOL/PDP_Merged.pdf#page=490))

![PPS na nepřímém stromu / motýlku](/answer-imgs/NI-SPOL-20/p490_pps_motylek.png)

---

## PPS na hyperkrychli

Lexikografické pořadí na $Q_r$, $r$ kroků. **Žluté registry** udržují prefix, **zelené** kombinující AAB. ([otevřít v PDF, str. 494](/pdfs/SPOL/PDP_Merged.pdf#page=494))

![PPS na hyperkrychli](/answer-imgs/NI-SPOL-20/p494_hypercube_pps.png)

---

## PPS na SF mřížkách (ortogonální topologie)

Linearizace lexikograficky po řádcích. Vodorovná fáze → svislá fáze → vodorovná fáze. ([otevřít v PDF, str. 496](/pdfs/SPOL/PDP_Merged.pdf#page=496))

![PPS na SF mřížkách](/answer-imgs/NI-SPOL-20/p496_pps_sf_mrizka.png)

---

## PPS na libovolné topologii

Sestaví se kostra grafu **do šířky** (BFS), POSTORDER číslování, $O(\mathrm{diam}(G))$ kroků na $n$-uzlovém řídkém grafu. ([otevřít v PDF, str. 493](/pdfs/SPOL/PDP_Merged.pdf#page=493))

![PPS na libovolné topologii](/answer-imgs/NI-SPOL-20/p493_pps_libovolna.png)

---

## Škálovatelnost PPS

Tří-fázový algoritmus: (1) lokální sekvenční PPS, (2) paralelní globální PPS přes $\sigma_i$ (celkové součty bloků), (3) každý proces přičte přijatý posun ke svým lokálním součtům. $T(n,p) = O(n/p) + O(\log p)$ — stejná škálovatelnost jako paralelní redukce. ([otevřít v PDF, str. 498](/pdfs/SPOL/PDP_Merged.pdf#page=498))

![Škálovatelnost PPS](/answer-imgs/NI-SPOL-20/p498_pps_skalovani.png)

---

## Segmentovaný PPS (SPPS)

**Definice**: vstupní pole rozdělené do segmentů; výstup = prefixové součty **izolovaně uvnitř** každého segmentu. ([otevřít v PDF, str. 506](/pdfs/SPOL/PDP_Merged.pdf#page=506))

![Definice segmentovaného PPS](/answer-imgs/NI-SPOL-20/p506_segm_pps_def.png)

**Hlavní myšlenka**: SPPS = 1 globální PPS s **modifikovanou binární operací** $\overline{\oplus}$, která zachází se značkou segmentu. Pokud $\oplus$ je asociativní, je i $\overline{\oplus}$. ([otevřít v PDF, str. 507](/pdfs/SPOL/PDP_Merged.pdf#page=507))

![SPPS — modifikovaná operace](/answer-imgs/NI-SPOL-20/p507_spps_operace.png)

---

## Aplikace PPS / SPPS

- **Zhušťovací problém (Packing)** — výpočet pořadí prvků v podmnožině (slajd 27).
- **Paralelní RadixSort** — $\log N$ iterací po dvou voláních PPS (slajd 28).
- **Paralelní binární sčítačka** s prediktem přenosu (carry-lookahead) — $\log n$ kroků (slajd 29).
- **Tridiagonální systém rovnic** — PPS nad polem $3\times3$ matic (slajd 30-31).
- **Paralelní stabilní QuickSort** — využití SPPS pro paralelní rozdělení podle pivotu, $O(\log n)$ iterací (slajd 35-37).
- **MPI implementace SPPS** přes `MPI_Op_create` a `MPI_Scan` — uživatelská operace nad strukturou `{hodnota, číslo_segmentu}` (slajd 39-40).
