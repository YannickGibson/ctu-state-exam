# Princip lokálních heuristik, pojem globálního a lokálního minima, obrana před uváznutím v lokálním minimu.

Zdroj: [KOP_Merged.pdf](/pdfs/SPOL/KOP_Merged.pdf) (slides NI-KOP, STAVOVÝ PROSTOR A LOKÁLNÍ HEURISTIKY + Pokročilé heuristiky)

---

## Princip lokálních heuristik

Iterativní procházení stavového prostoru: aktuální stav → vyber souseda přes `try()` → pokud lepší, ulož jako best. ([otevřít v PDF, str. 334](/pdfs/SPOL/KOP_Merged.pdf#page=334))

![Lokální heuristiky — hlavní smyčka](/answer-imgs/NI-SPOL-13/p334_local_heur_algoritmus.png)

---

## Lokální vs globální minimum (formálně)

Stav je **lokálním minimem**, jestliže z něj na hladině $E(s)$ nelze dosáhnout žádného lepšího stavu. **Hloubka lokálního minima** je $+\infty$ pro globální minimum, jinak nejmenší přípustný „nárůst" $E$, který umožní dosáhnout lepšího stavu. ([otevřít v PDF, str. 389](/pdfs/SPOL/KOP_Merged.pdf#page=389))

![Definice lokálního minima a hloubky lokálního minima](/answer-imgs/NI-SPOL-13/p389_def_hloubky_min.png)

---

## Problém uváznutí v lokálním optimu

Jednoduché heuristiky se zaseknou v každém lokálním optimu. ([otevřít v PDF, str. 384](/pdfs/SPOL/KOP_Merged.pdf#page=384))

![Problém lokálních optim (vizualizace na SAT)](/answer-imgs/NI-SPOL-13/p384_problem_lokalnich_optim.png)

**Důsledek**: kvalita výsledku silně závisí na kvalitě počátečního řešení. ([otevřít v PDF, str. 385](/pdfs/SPOL/KOP_Merged.pdf#page=385))

![Důsledky uváznutí](/answer-imgs/NI-SPOL-13/p385_dusledky_uvaznuti.png)

---

## Obrana proti uváznutí: diverzifikace ↔ intenzifikace

Připustit akci, která zhorší řešení (diverzifikace) → rovnoměrný průzkum stavového prostoru. Vyžaduje řízení mezi prohledáváním a konvergencí. ([otevřít v PDF, str. 386](/pdfs/SPOL/KOP_Merged.pdf#page=386))

![Únik z lokálních optim — rovnováha diverzifikace × intenzifikace](/answer-imgs/NI-SPOL-13/p386_unik_z_optim.png)

**Konkrétní řešení diverzifikace**: zvětšení okolí (k-okolí, Kernighan-Lin, dynamické), připuštění zhoršujících akcí, práce s více konfiguracemi, mapování/modelování stavového prostoru. ([otevřít v PDF, str. 387](/pdfs/SPOL/KOP_Merged.pdf#page=387))

![Řešení diverzifikace](/answer-imgs/NI-SPOL-13/p387_diverzifikace.png)
