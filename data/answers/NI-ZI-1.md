# Automatické plánování, plánovací graf, kompilace plánování do jiných formalismů.

Zdroj: [UMI_Merged.pdf](/pdfs/ZI/UMI_Merged.pdf) (slides NI-UMI, sekce Automatické plánování)

---

## Automatické plánování

**Úloha plánování**: dán **počáteční stav** $s_0$, **cílový stav (cílová formule)** $g$, množina **akcí** $A$ — najdi posloupnost akcí (plán), která vede z $s_0$ do stavu splňujícího $g$. ([otevřít v PDF, str. 126](/pdfs/ZI/UMI_Merged.pdf#page=126))

![Automatické plánování — úloha](/answer-imgs/NI-ZI-1/p126.png)

---

## STRIPS formalizmus

**Stav** = množina logických literálů (closed-world assumption). **Akce** $a$ má:
- **Precondition** $\mathrm{pre}(a)$ — co musí platit před aplikací.
- **Add list** $\mathrm{add}(a)$ — co se přidá.
- **Delete list** $\mathrm{del}(a)$ — co se odebere.

Aplikace: $s' = (s \setminus \mathrm{del}(a)) \cup \mathrm{add}(a)$, pokud $\mathrm{pre}(a) \subseteq s$. ([otevřít v PDF, str. 131](/pdfs/ZI/UMI_Merged.pdf#page=131))

![STRIPS](/answer-imgs/NI-ZI-1/p131.png)

**PDDL (Planning Domain Definition Language)** — standardizovaný jazyk navazující na STRIPS s rozšířeními: typy, podmínkové efekty, číselné fluents, časové akce, preference. Domain file (definice) + Problem file (instance).

---

## Algoritmy klasického plánování

### Forward (state-space) search
Prohledávej stavový prostor začínaje v $s_0$. **BFS, DFS, A***. Heuristiky: $h_{\mathrm{max}}$, $h_{\mathrm{add}}$, $h_{\mathrm{FF}}$ (Fast-Forward — relaxed plan ignoruje delete list), $h^+$ (delete relaxation).

### Backward (regression) search
Začni v cíli $g$, aplikuj akce zpětně — generuj **regresní stavy** (preimage). Často méně efektivní díky neinstanciovaným proměnným.

### Plánování jako prohledávání s heuristikou
**FF (Fast-Forward)** — Hoffmann & Nebel 2001. Používá GraphPlan-style heuristiku + enforced hill climbing.

### Partial-order planning (POP)
Plán je částečně uspořádaný DAG akcí + ordering/causal links. Méně závazků → flexibilnější. ([otevřít v PDF, str. 148](/pdfs/ZI/UMI_Merged.pdf#page=148))

![Plánovací prostory](/answer-imgs/NI-ZI-1/p148.png)

---

## Plánovací graf (Planning Graph / GraphPlan)

Blum & Furst 1997. Střídavé vrstvy:
- **Stavové vrstvy** $P_0, P_1, \ldots$ — fakta dosažitelná nejdéle za $k$ kroků.
- **Akční vrstvy** $A_0, A_1, \ldots$ — aplikovatelné akce + **no-op** akce.

Hrany: precondition → akce → add. **Mutex (mutual exclusion)** vztahy:
- Akce $a, b$ jsou v mutex, pokud mají konfliktní efekty (inconsistent effects), jedna ničí preconditions druhé (interference), nebo jejich preconditions jsou v mutex (competing needs).
- Fakta jsou v mutex, pokud všechny dvojice akcí, které je vyrábějí, jsou v mutex.

![Planning Graph](/answer-imgs/NI-ZI-1/p174.png)

**GraphPlan algoritmus**: ([otevřít v PDF, str. 174](/pdfs/ZI/UMI_Merged.pdf#page=174))

1. Rozšiř plánovací graf o vrstvu, dokud goal facts nejsou všechny přítomné a žádné dvě nejsou v mutex (nebo dokud se graf nestabilizuje bez nalezení goalu → infeasible).
2. Backtracking: hledej v grafu plán **z konce** — vyber neredundantní množinu akcí, které dosahují goal facts bez konfliktů (mutex).
3. Pokud selže, rozšiř graf o další vrstvu.

**Použití plánovacího grafu**:
- Přímo jako plánovač (GraphPlan).
- Jako zdroj **admisibilní heuristiky** ($h_{\mathrm{max}}$, $h_{\mathrm{level}}$) pro heuristické prohledávání.
- Jako základ **delete relaxation heuristiky** $h^+$.

---

## Kompilace plánování do jiných formalizmů

### Plánování → SAT (SATPlan, Kautz & Selman)

**Časová expanze**: zafixuje horizont $T$ kroků. Pro každý čas $t \in \{0, \ldots, T-1\}$ a každou akci $a$, fakt $p$ se zavede proměnná $a_t, p_t$.

Klauzule:
- **Initial state**: $\bigwedge p_0$ pro $p \in s_0$.
- **Goal**: $\bigwedge p_T$ pro $p \in g$.
- **Action preconditions**: $a_t \Rightarrow \mathrm{pre}(a)_t$.
- **Effects**: $a_t \Rightarrow \mathrm{add}(a)_{t+1} \wedge \neg \mathrm{del}(a)_{t+1}$.
- **Frame axioms**: pokud $p$ je pravdivé v $t$ a $t+1$, žádná akce ho neničí.
- **Mutex / one-action constraint**: nanejvýš jedna akce za krok (nebo paralelní s mutex podmínkou).

Volej SAT řešič (MiniSAT, Glucose) — pokud SAT, rekonstruuj plán. Pokud UNSAT, zvyš $T$. ([otevřít v PDF, str. 183](/pdfs/ZI/UMI_Merged.pdf#page=183))

![SATPlan kompilace](/answer-imgs/NI-ZI-1/p183.png)

Moderní plánovače založené na SATu: **SATPlan, SASE, Madagascar**.

### Plánování → CSP

Podobné jako SAT: proměnné = stav fact/akce v čase, doména = {true, false}, omezení = akční / framové. Lze řešit standardními CSP technikami (arc consistency, backjumping).

### Plánování → ILP (Integer Linear Programming)

Stejné kódování, ale lineární nerovnice. Užitečné pro **plánování s číselnými zdroji** (kapacita, čas).

### Plánování → PDDL → heuristic search
Většina moderních plánovačů (Fast Downward, LAMA, ENHSP) konvertuje PDDL na vnitřní reprezentaci (SAS+) a pak řeší heuristickým prohledáváním.

### Plánování → MDP / RL
Pro nedeterministické či částečně pozorovatelné prostředí. **POMDP** generalizuje plánování o pravděpodobnosti a odměny.

---

## Pokročilá rozšíření

- **Hierarchické plánování (HTN)** — task networks, dekomposice úloh.
- **Temporal planning** — akce s trváním, deadliny.
- **Numeric / metric planning** — fluents jako čísla, ne jen booleany.
- **Conformant / contingent planning** — nejistý počáteční stav, observace.
- **Multi-agent planning** — koordinace více agentů.
