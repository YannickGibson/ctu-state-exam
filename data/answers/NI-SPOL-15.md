# Princip simulovaného ochlazování, význam parametrů a způsoby jejich řízení.

Zdroj: [KOP_Merged.pdf](/pdfs/SPOL/KOP_Merged.pdf) (slides NI-KOP, Pokročilé heuristiky — Simulované ochlazování)

---

## Princip: připuštění zhoršující akce přes Metropolisovo kritérium

S pravděpodobností $p = \exp(-\delta/T)$ přijmeme i zhoršující sousední stav. $T \to 0$ → intenzifikace; $T \to \infty$ → diverzifikace. ([otevřít v PDF, str. 399](/pdfs/SPOL/KOP_Merged.pdf#page=399))

![Metropolisovo přijetí zhoršující akce](/answer-imgs/NI-SPOL-15/p399_zhorseni.png)

---

## Hlavní algoritmus simulovaného ochlazování

Vnější smyčka: `cool()` snižuje teplotu, dokud `frozen()`. Vnitřní smyčka: zkoušíme tahy, dokud `equilibrium()`. ([otevřít v PDF, str. 400](/pdfs/SPOL/KOP_Merged.pdf#page=400))

![Algoritmus simulovaného ochlazování](/answer-imgs/NI-SPOL-15/p400_sa_algoritmus.png)

---

## Teoretická záruka (Hajek)

Pro rozvrh $t_k = \dfrac{c}{\log(1+k)}$, kde $c$ je největší hloubka lokálního optima, proces po nekonečném počtu kroků skončí v globálním optimu (asymptotická konvergence). ([otevřít v PDF, str. 401](/pdfs/SPOL/KOP_Merged.pdf#page=401))

![Teoretická analýza (Hajek)](/answer-imgs/NI-SPOL-15/p401_hajek.png)

---

## Parametry, které je třeba navrhnout

**Rozvrh ochlazování** (počáteční $T_0$, `cool()`, `frozen()`, `equilibrium()`) — předem daný nebo řízený zpětnou vazbou. Plus problémově závislé: stavový prostor, omezující podmínky, počáteční řešení. ([otevřít v PDF, str. 403](/pdfs/SPOL/KOP_Merged.pdf#page=403))

![Co je třeba vymyslet — parametry SA](/answer-imgs/NI-SPOL-15/p403_parametry.png)

---

## Rozvrh ochlazování — cool() a equilibrium()

Typicky $\mathrm{cool}(T) = \alpha T$ s $\alpha \in (0{,}8; 0{,}999)$; `equilibrium()` pevný počet kroků $N$ nebo $N$ přijatých akcí. Manipulace s délkou ekvilibria je ekvivalentní manipulaci s koeficientem chlazení. ([otevřít v PDF, str. 405](/pdfs/SPOL/KOP_Merged.pdf#page=405))

![Rozvrh ochlazování](/answer-imgs/NI-SPOL-15/p405_rozvrh.png)

---

## Volba počáteční teploty $T_0$

Nastavit tak, aby přijetí zhoršující akce bylo pravděpodobné. Pokud známe hloubku lokálních optim $\delta$ a chceme pravděpodobnost úniku $P$: $T_0 = -\dfrac{\delta}{\ln P}$. Alternativně nasbíráme vzorky zhoršujících akcí a teplotu odvodíme. ([otevřít v PDF, str. 409](/pdfs/SPOL/KOP_Merged.pdf#page=409))

![Počáteční teplota](/answer-imgs/NI-SPOL-15/p409_pocatecni_teplota.png)

---

## Podmínky zastavení (frozen)

Pevná mez teploty, **stagnace** (četnost změn pod prahem), četnost zlepšujících změn pod prahem. ([otevřít v PDF, str. 412](/pdfs/SPOL/KOP_Merged.pdf#page=412))

![Zastavení](/answer-imgs/NI-SPOL-15/p412_zastaveni.png)
