# Systematické a lokální splňování v logice (DPLL, CDCL, WalkSAT, posílání zpráv). Automatické uvažování, rozhodování v teoriích prvního řádu, obecná rezoluce, princip SAT-modulovaných teorií (SMT). Zpracování přirozeného jazyka.

Zdroj: [UMI_Merged.pdf](/pdfs/ZI/UMI_Merged.pdf) (slides NI-UMI, sekce SAT)

---

## Problém SAT

**Vstup**: výroková formule $\varphi$ v **CNF** (konjunkce klauzulí, klauzule = disjunkce literálů).
**Otázka**: existuje pravdivostní ohodnocení proměnných, že $\varphi$ je pravdivá?

SAT je **NP-úplný** (Cook-Levinova věta). Přesto moderní řešiče řeší instance s miliony proměnných díky CDCL.

---

## Systematické řešení: DPLL

Davis-Putnam-Logemann-Loveland 1962. Backtracking + propagace. ([otevřít v PDF, str. 89](/pdfs/ZI/UMI_Merged.pdf#page=89))

![DPLL](/answer-imgs/NI-ZI-3/p89.png)

```
DPLL(φ):
  φ ← UnitPropagation(φ)
  φ ← PureLiteralElimination(φ)   # heuristika, méně častá
  if φ obsahuje prázdnou klauzuli: return UNSAT
  if φ je prázdná: return SAT
  ℓ ← vyber literál (decision)
  return DPLL(φ ∧ ℓ) or DPLL(φ ∧ ¬ℓ)
```

**Unit propagation (BCP)**: pokud klauzule obsahuje jediný nepřiřazený literál a všechny ostatní jsou false, ten literál **musí být true**.

**Pure literal**: proměnná vyskytující se vždy v jedné polaritě → ohodnoť ji tak, aby byly všechny její klauzule splněny.

**Heuristiky výběru** (decision): Jeroslow-Wang, MOMS (Maximum Occurrences in Minimum-Size clauses), 2-clause heuristic.

---

## CDCL (Conflict-Driven Clause Learning)

Moderní rozšíření DPLL — všechny SAT řešiče v praxi (MiniSAT, Glucose, lingeling, kissat). ([otevřít v PDF, str. 99](/pdfs/ZI/UMI_Merged.pdf#page=99))

![CDCL — princip](/answer-imgs/NI-ZI-3/p99.png)

**Hlavní rozšíření oproti DPLL**:

### 1. Učení (clause learning)
Při konfliktu (BCP najde prázdnou klauzuli) **analyzuj implication graph**, najdi **1-UIP (Unique Implication Point)** a vytvoř **learned clause** (no-good), která zabrání opakování stejného konfliktu. Learned klauzule se přidá k formuli.

### 2. Non-chronological backtracking (backjumping)
Místo skoku na poslední decision skoč přímo na úroveň, ze které lze pokračovat s novou learned clause aktivní (často mnohem výše).

### 3. Heuristiky decision: VSIDS
**Variable State Independent Decaying Sum** — udržuje skóre pro každou proměnnou. Při každém konfliktu se zvýší skóre proměnných v konfliktní klauzuli; všechna skóre periodicky decay. Volí proměnnou s nejvyšším skóre.

### 4. Restarty
Po Luby sequence nebo geometricky se klauzule (a learned cache) zachovají, ale strom prohledávání se restartuje. Pomáhá uniknout ze špatných oblastí.

### 5. Dvojí watched literals
Optimalizace BCP: pro každou klauzuli sledujeme jen 2 literály. Klauzule se zkoumá jen, když jeden z nich je false → výrazné urychlení.

### 6. Clause deletion (forgetting)
Learned klauzule s nízkým **LBD** (literal block distance) se udržují, ostatní se po čase mažou.

![CDCL — žádné explicitní větvení](/answer-imgs/NI-ZI-3/p104.png)

---

## Příklady CDCL solverů

- **MiniSAT** (Eén & Sörensson) — referenční implementace, ~2000 řádků C++.
- **Glucose** — využívá LBD pro clause deletion.
- **Lingeling**, **kissat** (Biere) — high-performance.
- **CryptoMiniSat** — pro kryptografické instance.

**SAT Competition** každý rok benchmarkuje současné solvery.

---

## Lokální vyhledávání: GSAT a WalkSAT

Alternativní přístup — pracuje s úplnými přiřazeními, modifikuje je iterativně.

### GSAT (Selman, Levesque, Mitchell 1992)

```
GSAT(φ, MaxTries, MaxFlips):
  for i = 1 to MaxTries:
    A ← random complete assignment
    for j = 1 to MaxFlips:
      if A satisfies φ: return A
      flip variable that maximizes # satisfied clauses
  return "no solution found"
```

Greedy hill climbing v Hammingovsky propojeném prostoru přiřazení. Uvázne v lokálních optimech.

### WalkSAT (Selman, Kautz, Cohen 1994)

```
WalkSAT(φ, MaxTries, MaxFlips):
  for i = 1 to MaxTries:
    A ← random assignment
    for j = 1 to MaxFlips:
      if A satisfies φ: return A
      c ← random violated clause
      with prob p: flip random variable in c       (random walk)
      else: flip variable in c that maximizes score (greedy)
```

Kombinuje greedy s **náhodnou procházkou** — řeší problém uvíznutí v lokálním optimu. Probabilisticky úplný (pro $\mathrm{MaxFlips} \to \infty$). ([otevřít v PDF, str. 118](/pdfs/ZI/UMI_Merged.pdf#page=118))

![WalkSAT](/answer-imgs/NI-ZI-3/p118.png)

**Vlastnosti lokálních metod**:
- Velmi efektivní pro některé třídy instancí (random 3-SAT poblíž phase transition $m/n \approx 4.27$).
- **Nedokáží prokázat UNSAT** — najdou jen splňující přiřazení, pokud existuje.
- Citlivé na nastavení $p$, $\mathrm{MaxFlips}$.

### Stochastic Local Search (SLS) varianty
- **Novelty, Novelty+** — pokročilejší pravidla výběru.
- **Adaptive WalkSAT** — adaptuje $p$ za běhu.
- **SAPS, PAWS** — clause weighting.

---

## Systematicky vs lokálně — kdy co

| | Systematické (CDCL) | Lokální (WalkSAT) |
|---|---|---|
| Strukturované instance | ✓✓ | ✗ |
| Random 3-SAT | ✗ | ✓✓ |
| Prokázání UNSAT | ✓ | ✗ |
| Optimální plán velkých $T$ | ✓ | částečně |
| Industriální instance (Hardware verif.) | ✓✓ | ✗ |

V praxi se používá **portfolio approach** — paralelně běží různé řešiče, vrátí výsledek první z nich.

---

## Rozšíření SAT

- **MaxSAT** — maximalizuj počet splněných klauzulí.
- **Weighted MaxSAT** — klauzule s váhami.
- **PB (Pseudo-Boolean)** — lineární nerovnice nad bool. proměnnými.
- **SMT (Satisfiability Modulo Theories)** — SAT + teorie (linear arithmetic, arrays, bit-vectors, …). Řešiče: **Z3, CVC4, Yices**.
- **QBF (Quantified Boolean Formula)** — kvantifikátory $\forall, \exists$ → PSPACE-complete.
