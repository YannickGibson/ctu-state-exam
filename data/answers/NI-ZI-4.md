# Metody pro hodnocení a výběr příznaků (univarietní/multivarietní metody, filtrační/wrapper/embedded metody). Selektivní/adaptivní metody redukce počtu instancí: Condensed Nearest Neighbor (CNN), Delauney/Gabriel/RNG grafy, Wilsonova editace, Multi-edit metoda, Tomkovy spoje.

Zdroj: [PDD_Merged.pdf](/pdfs/ZI/PDD_Merged.pdf) (slides NI-PDD, Lecture 3 — Feature ranking and selection)

---

## Cíle výběru příznaků

Vybrat **nejvíce informativní proměnné**: redukovat dimenzionalitu, najít optimální podmnožinu, řadit příznaky podle významu. Lepší, rychlejší a srozumitelnější modely. ([otevřít v PDF, str. 115](/pdfs/ZI/PDD_Merged.pdf#page=115))

![Feature selection overview](/answer-imgs/NI-ZI-4/p115_fs_overview.png)

---

## Taxonomie

**Univariate** vs **Multivariate** (jedna proměnná vs podmnožina). **Filter / Wrapper / Embedded** podle vztahu k prediktoru. ([otevřít v PDF, str. 117](/pdfs/ZI/PDD_Merged.pdf#page=117))

![FS Taxonomy](/answer-imgs/NI-ZI-4/p117_taxonomy.png)

![Filter/Wrapper/Embedded diagram](/answer-imgs/NI-ZI-4/p118_diagram.png)

---

## Filter

Hodnotí relevanci **nezávisle na klasifikátoru** statistickým kritériem. Robustní k overfittingu, ale nemusí najít "užitečné" rysy. ([otevřít v PDF, str. 123](/pdfs/ZI/PDD_Merged.pdf#page=123))

![Filters](/answer-imgs/NI-ZI-4/p123_filters.png)

---

## Wrapper

Používá **klasifikátor** k vyhodnocení podmnožiny (cross-validation). Najde nejužitečnější rysy, ale je výpočetně náročný a prone to overfitting. ([otevřít v PDF, str. 124](/pdfs/ZI/PDD_Merged.pdf#page=124))

![Wrappers](/answer-imgs/NI-ZI-4/p124_wrappers.png)

Klasické vyhledávací strategie: **forward selection** (přidávej nejlepší), **backward elimination** (odstraňuj nejhorší), **stepwise**, exhaustive (pro malé n).

---

## Embedded

Výběr probíhá **uvnitř trénovacího algoritmu** (např. LASSO L1-regulizace, decision tree feature importance). Méně náročné než wrapper, méně náchylné k overfittingu. ([otevřít v PDF, str. 125](/pdfs/ZI/PDD_Merged.pdf#page=125))

![Embedded methods](/answer-imgs/NI-ZI-4/p125_embedded.png)

---

## Univariate FS metody

Hodnotí relevanci **jedné proměnné** $X_i$ pro výstup $Y$ pomocí: statistických testů (t-test, $\chi^2$, F-test), korelace (Pearson/Spearman), **mutual information**, permutation importance. ([otevřít v PDF, str. 129](/pdfs/ZI/PDD_Merged.pdf#page=129))

![Univariate FS](/answer-imgs/NI-ZI-4/p129_univariate.png)

**Mutual information**: $I(X;Y) = H(X) - H(X\mid Y) = \sum p(x,y) \log \frac{p(x,y)}{p(x)p(y)}$. Zachytí i nelineární závislosti. **T-test** pro 2-třídní úlohy s normálně rozdělenými třídami.

---

## Multivariate FS

Hodnotí **podmnožiny** příznaků společně — zachytí redundanci a interakce. Příklady:
- **MRMR (Maximum Relevance, Minimum Redundancy)** — maximalizuje vzájemnou informaci s targetem, minimalizuje mezi vybranými rysy.
- **Relief / ReliefF** — hodnotí, jak dobře feature odlišuje sousedy z různých tříd.
- **CFS (Correlation-based FS)** — favorizuje vysokou korelaci s třídou a nízkou mezi rysy.

---

## Three "Ingredients" frameworku

Každá FS metoda kombinuje 3 složky: **Criterion** (jak měřit relevanci), **Search** (jak procházet prostor podmnožin), **Assessment** (jak ohodnotit kvalitu — CV, statistický test, performance bound). Filter, Wrapper, Embedded jsou různé "kombinace" těchto tří složek.
