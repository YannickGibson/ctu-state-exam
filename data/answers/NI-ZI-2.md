# Splňování omezení s konečnými doménami (CSP), pokročilé prohledávání (backjumping, dynamický backtracking), filtrace domén a lokální konzistenční techniky, globální omezení, rozhodovací heuristiky.

Zdroj: [UMI_Merged.pdf](/pdfs/ZI/UMI_Merged.pdf) (slides NI-UMI, sekce CSP)

---

## Definice CSP

**Problém splňování omezení** $\mathcal P = (X, D, C)$:
- $X = \{x_1, \ldots, x_n\}$ — proměnné.
- $D = \{D_1, \ldots, D_n\}$ — **konečné** domény pro každou proměnnou.
- $C = \{c_1, \ldots, c_m\}$ — omezení (constraints); každé $c_j$ omezuje hodnoty nějaké podmnožiny proměnných $\mathrm{scope}(c_j) \subseteq X$.

**Cíl**: najít přiřazení $x_i \mapsto v_i \in D_i$, které splňuje všechna omezení (splnitelný CSP), případně všechny taková přiřazení nebo optimální podle účelové funkce. ([otevřít v PDF, str. 61](/pdfs/ZI/UMI_Merged.pdf#page=61))

![CSP — definice](/answer-imgs/NI-ZI-2/p61.png)

**Příklady**: 8-queens (klasický), graf colouring, Sudoku, scheduling, vehicle routing, rozvrhy.

---

## Reprezentace omezení

- **Extenzionální**: explicitní tabulka povolených tuples.
- **Intenzionální**: jako predikát nebo aritmetický výraz, např. $x_i \ne x_j$, $x_1 + x_2 \le 10$.
- **Globální omezení**: $\mathrm{AllDifferent}(x_1, \ldots, x_n)$, $\mathrm{Sum}$, $\mathrm{Element}$, $\mathrm{Cumulative}$ — vysokoúrovňová, efektivní propagace.

---

## Backtracking + konsistence

### Naivní backtracking

DFS po stromě přiřazení; v každém uzlu rozšíříme parciální přiřazení o jednu proměnnou. Při porušení omezení → backtrack.

### Forward checking

Když přiřadíme $x_i = v$, **odeber z domén** nepřiřazených sousedů (přes binární omezení) hodnoty inkonzistentní s $v$. Pokud nějaká doména je prázdná → backtrack ihned. ([otevřít v PDF, str. 66](/pdfs/ZI/UMI_Merged.pdf#page=66))

![Forward checking](/answer-imgs/NI-ZI-2/p66.png)

### Arc consistency (AC-3)

Omezení $(x_i, x_j)$ je **arc-consistent**, pokud pro každé $v \in D_i$ existuje $w \in D_j$ tak, že $(v, w)$ je dovoleno. AC-3 algoritmus iterativně odstraňuje z $D_i$ hodnoty bez podpory v $D_j$.

```
Q ← všechny hrany (i,j) a (j,i)
while Q ≠ ∅:
    (i, j) ← pop Q
    if revise(D_i, D_j):  # odeber hodnoty bez podpory
        if D_i = ∅: return INCONSISTENT
        for každý k sousedící s i (k ≠ j): Q ← Q ∪ {(k, i)}
```

Složitost: $O(\mathrm{ed}^3)$ kde $e$ je počet binárních omezení, $d$ max doména. Existuje silnější **k-konsistence** (omezení podmnožin velikosti $k$), **path consistency** (3-consistence) a hyperarc consistency pro non-binární constraints. ([otevřít v PDF, str. 72](/pdfs/ZI/UMI_Merged.pdf#page=72))

![Arc consistency](/answer-imgs/NI-ZI-2/p72.png)

### Maintaining Arc Consistency (MAC)

Po každém přiřazení spusť AC-3 (nebo AC-4, AC-2001). Mnohem účinnější než forward checking, jeden z nejpoužívanějších přístupů.

---

## Variable / value ordering — heuristiky

**Variable ordering**:
- **MRV (Minimum Remaining Values)** / "fail-first" — vyber proměnnou s nejmenší doménou.
- **Degree heuristic** — vyber proměnnou s nejvíce omezeními na nepřiřazené proměnné (tie-breaker).
- **dom/wdeg** (weighted degree) — kombinace.

**Value ordering**:
- **LCV (Least Constraining Value)** — vyber hodnotu, která eliminuje nejméně možností u sousedů (succeed-first).

![Heuristiky](/answer-imgs/NI-ZI-2/p78.png)

---

## Pokročilé prohledávání

### Backjumping

Místo chronologického backtracku skoč k proměnné, která způsobila konflikt (**conflict-directed backjumping**). Záznam **conflict set** pro každou proměnnou. Mnohem efektivnější ve stromě konfliktů.

### Constraint learning / no-good recording

Po každém konfliktu zaznamenej kombinaci přiřazení, která vede ke sporu, jako nový **no-good** — propagací bude oříznut budoucí strom (analogie CDCL u SAT).

### Restart strategie

Po překročení limitu konfliktů restartuj s novými variable orderings (často založené na váhách konfliktů). Pomáhá rozbít špatné rané rozhodnutí.

### Hybrid: backtrack + AC

Algoritmy MAC, FC-CBJ, NOGOOD recording kombinují tyto techniky.

### Lokální prohledávání

**Min-conflicts**: začni z náhodného úplného přiřazení; v každém kroku vyber konfliktní proměnnou a změň ji na hodnotu, která minimalizuje počet porušených omezení. Velmi efektivní pro velké problémy jako n-queens (řeší miliony queens v jednotkách sekund).

**Simulated annealing, tabu search, genetické algoritmy** se také používají pro CSP (viz NI-SPOL-15, NI-SPOL-14).

### Symmetry breaking

Mnoho CSP obsahuje symetrie (např. permutace barev v graph colouring). **Lex-leader constraints** přidávají omezení, která vynutí kanonickou reprezentaci → zmenší prohledávaný strom o symetrické větve.

![Lokální vs systematické](/answer-imgs/NI-ZI-2/p84.png)

---

## Speciální struktury

- **Stromové CSP**: pokud constraint graf je strom, lze ho vyřešit v $O(nd^2)$ pomocí DAC (directional arc consistency) + zpětné instanciace.
- **Cutset conditioning** — najdi malou množinu proměnných, jejichž odebrání udělá z grafu strom.
- **Tree decomposition** — rozložit graf na "tree-width" $w$ → algoritmus v $O(n d^{w+1})$.

---

## CSP vs SAT

SAT je speciální případ CSP (Boolean domény, klauzule). Většina pokročilých technik (CDCL learning, restarty, VSIDS heuristika) byla v CSP komunitě známa dříve než v SAT, ale SAT solvery jsou dnes výkonnější. **Kódování CSP do SAT** (direct, support, log encoding) → exploitace SAT řešičů. Naopak **MiniCSP, Choco, Gecode** jsou specializované CSP knihovny.
