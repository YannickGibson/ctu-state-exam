# Programování nad sdílenou pamětí, programový model OpenMP, datový a funkční paralelismus, synchronizace vláken, vícevláknové algoritmy (násobení polynomů, násobení matic a vektorů, řazení).

Zdroj: [PDP_Merged.pdf](/pdfs/SPOL/PDP_Merged.pdf) (slides NI-PDP, Přednáška 02 — Úvod do OpenMP)

---

## OpenMP — knihovna pro programování nad sdílenou pamětí

API nad C/C++/Fortran: ~50 direktiv, ~20 systémových proměnných, ~60 runtime funkcí. ([otevřít v PDF, str. 52](/pdfs/SPOL/PDP_Merged.pdf#page=52))

![OpenMP overview](/answer-imgs/NI-SPOL-17/p52_openmp_overview.png)

---

## Fork-join programovací model

Program začíná sekvenčně; v paralelní oblasti se forkne tým vláken, na konci join. ([otevřít v PDF, str. 53](/pdfs/SPOL/PDP_Merged.pdf#page=53))

![Fork-join model OpenMP](/answer-imgs/NI-SPOL-17/p53_fork_join.png)

---

## Vytváření paralelní oblasti — direktiva `parallel`

([otevřít v PDF, str. 59](/pdfs/SPOL/PDP_Merged.pdf#page=59))

![Direktiva parallel](/answer-imgs/NI-SPOL-17/p59_parallel_directive.png)

**Vlastnosti proměnných**: `shared`, `private`, `firstprivate`, `lastprivate`, `default(shared|none)`, `reduction`. ([otevřít v PDF, str. 61](/pdfs/SPOL/PDP_Merged.pdf#page=61))

![Klauzule pro vlastnosti proměnných](/answer-imgs/NI-SPOL-17/p61_vlastnosti.png)

---

## Datový (iterační) paralelismus — `parallel for`

Iterace cyklu se rozdělí mezi vlákna podle `schedule(static|dynamic|guided[,k])`. Typický nástroj pro datový paralelismus (např. `parallel for reduction(+:result)` při násobení vektorů). ([otevřít v PDF, str. 73](/pdfs/SPOL/PDP_Merged.pdf#page=73))

![parallel for — datový paralelismus](/answer-imgs/NI-SPOL-17/p73_parallel_for.png)

---

## Funkční paralelismus — direktiva `task`

Vlákno produkuje úlohy do `task pool`; ostatní vlákna je odebírají a vykonávají. Vhodné pro rekurzivní algoritmy (např. paralelní MergeSort, paralelní Strassen). ([otevřít v PDF, str. 89](/pdfs/SPOL/PDP_Merged.pdf#page=89))

![task — funkční paralelismus](/answer-imgs/NI-SPOL-17/p89_task.png)

---

## Synchronizační nástroje

`barrier`, `master`, `single`, `critical`, `atomic`, `flush`, `taskwait`. ([otevřít v PDF, str. 95](/pdfs/SPOL/PDP_Merged.pdf#page=95))

![Synchronizační direktivy](/answer-imgs/NI-SPOL-17/p95_sync_nastroje.png)

**Kritická sekce** — anonymní vs pojmenovaná (`critical name`). ([otevřít v PDF, str. 98](/pdfs/SPOL/PDP_Merged.pdf#page=98))

![Kritická sekce](/answer-imgs/NI-SPOL-17/p98_kriticka_sekce.png)

**`atomic`** — atomická operace nad pamětí (Read/Write/Update/Capture). Důležité pro inkrementaci sdíleného čítače. ([otevřít v PDF, str. 101](/pdfs/SPOL/PDP_Merged.pdf#page=101))

![atomic](/answer-imgs/NI-SPOL-17/p101_atomic.png)

---

## Vícevláknové algoritmy v OpenMP

- **Násobení polynomů**: rozklad na nezávislé součiny členů → `parallel for reduction(+:coef)` při sčítání do výsledných koeficientů.
- **Násobení matice × vektor** $y = Ax$: každé vlákno počítá blok řádků (datový paralelismus s `parallel for schedule(static)`).
- **Řazení**: paralelní MergeSort přes `task` (rekurzivní rozdělení), nebo paralelní QuickSort přes `task` s `taskwait`.
