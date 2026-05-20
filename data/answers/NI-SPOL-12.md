# Experimentální vyhodnocení algoritmů, zejména randomizovaných.

Zdroj: [KOP_Merged.pdf](/pdfs/SPOL/KOP_Merged.pdf) (slides NI-KOP, EXPERIMENTÁLNÍ HODNOCENÍ)

---

## Co měříme: metriky vstupu a výstupu

Měříme **závislost** výstupní metriky na zadané vstupní metrice. ([otevřít v PDF, str. 83](/pdfs/SPOL/KOP_Merged.pdf#page=83))

![Co nás zajímá: metriky](/answer-imgs/NI-SPOL-12/p83_metriky.png)

---

## Obecné schéma experimentální algoritmiky

Generátor instancí (potlačení variance v instancích) → algoritmus → statistika + interpretace. ([otevřít v PDF, str. 95](/pdfs/SPOL/KOP_Merged.pdf#page=95))

![Experimentální algoritmika: obecné vyhodnocení](/answer-imgs/NI-SPOL-12/p95_diagram_exp_algoritmika.png)

---

## Statistika pro jednu hodnotu zadané metriky

Průměr/medián, kontrola rozložení, parametry rozložení (μ, σ). ([otevřít v PDF, str. 96](/pdfs/SPOL/KOP_Merged.pdf#page=96))

![Statistika pro jednu hodnotu metriky](/answer-imgs/NI-SPOL-12/p96_statistika.png)

---

## Randomizovaný algoritmus — vyhodnocení na jedné instanci

Druhý zdroj variance (randomizace) → statistika z opakovaných běhů. ([otevřít v PDF, str. 98](/pdfs/SPOL/KOP_Merged.pdf#page=98))

![Randomizovaný algoritmus na jedné instanci](/answer-imgs/NI-SPOL-12/p98_random_jedna_instance.png)

---

## ECDF (Estimated Cumulative Distribution Function)

Pro každý krok pravděpodobnost úspěšného ukončení; srovnání variant. ([otevřít v PDF, str. 101](/pdfs/SPOL/KOP_Merged.pdf#page=101))

![ECDF](/answer-imgs/NI-SPOL-12/p101_ecdf.png)

---

## Randomizovaný algoritmus na sadě instancí

Dvouúrovňové statistické zpracování (přes RNG + přes instance). ([otevřít v PDF, str. 104](/pdfs/SPOL/KOP_Merged.pdf#page=104))

![Randomizovaný algoritmus na sadě instancí](/answer-imgs/NI-SPOL-12/p104_random_sada_instanci.png)

**Dva zdroje variance — dva stupně zpracování** (statistika ze statistik). ([otevřít v PDF, str. 105](/pdfs/SPOL/KOP_Merged.pdf#page=105))

![Dva zdroje variance](/answer-imgs/NI-SPOL-12/p105_dva_zdroje_variance.png)
