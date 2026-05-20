# Princip genetických algoritmů, význam selekčního tlaku pro jejich funkci.

Zdroj: [KOP_Merged.pdf](/pdfs/SPOL/KOP_Merged.pdf) (slides NI-KOP, SIMULOVANÁ EVOLUCE I.)

---

## Kostra simulované evoluce / genetického algoritmu

Cyklus: počáteční populace → **selekce** (intenzifikace) → **křížení** (rekombinace) → **mutace** (diverzifikace) → další generace. ([otevřít v PDF, str. 434](/pdfs/SPOL/KOP_Merged.pdf#page=434))

![Kostra simulované evoluce](/answer-imgs/NI-SPOL-14/p434_kostra_evoluce.png)

---

## Hlavní stavební bloky GA

Kódování (reprezentace), genetické operátory, výběr pro operace (selekce), selekční tlak, řízení populace. ([otevřít v PDF, str. 444](/pdfs/SPOL/KOP_Merged.pdf#page=444))

![Genetické algoritmy — přehled](/answer-imgs/NI-SPOL-14/p444_ga_prehled.png)

---

## Selekce: princip

Cíl: aby početní zastoupení jedince v populaci odpovídalo jeho **zdatnosti** (fitness). Převod informace ze zdatnosti na pravděpodobnost výběru. ([otevřít v PDF, str. 453](/pdfs/SPOL/KOP_Merged.pdf#page=453))

![Selekce — diagram (jedinec → zdatnost → pravděpodobnost výběru)](/answer-imgs/NI-SPOL-14/p453_selekce.png)

---

## Selekční tlak

**Pravděpodobnost výběru nejlepšího jedince**. Extrémy: $p = 1$ → čistá intenzifikace; $p = 1/n$ → nezáleží na zdatnosti, čistá diverzifikace. ([otevřít v PDF, str. 454](/pdfs/SPOL/KOP_Merged.pdf#page=454))

![Selekční tlak — definice](/answer-imgs/NI-SPOL-14/p454_selekcni_tlak.png)

---

## Význam selekčního tlaku — velký vs malý

**Velký selekční tlak** → nebezpečí degenerace populace (uvíznutí v lokálních optimech). **Malý selekční tlak** → pomalá konvergence, širší průzkum, ale šum z mutace může převážit ⇒ divergence. ([otevřít v PDF, str. 456](/pdfs/SPOL/KOP_Merged.pdf#page=456))

![Velký vs malý selekční tlak — důsledky](/answer-imgs/NI-SPOL-14/p456_velky_maly_tlak.png)

**Charakteristické průběhy** průměrné zdatnosti podle selekčního tlaku: degenerace (vysoký tlak), divergence (nízký tlak), kvalitní konvergence (správně volené střední hodnoty). ([otevřít v PDF, str. 457](/pdfs/SPOL/KOP_Merged.pdf#page=457))

![Charakteristické průběhy průměrné zdatnosti](/answer-imgs/NI-SPOL-14/p457_charakteristicke_prubehy.png)

---

## Způsoby řízení selekčního tlaku

**Scaling** (lineární škálování), **ranking** (pořadí místo hodnoty), **truncation selection** (zkrácený výběr) — pro ruletový výběr a podobné. ([otevřít v PDF, str. 460](/pdfs/SPOL/KOP_Merged.pdf#page=460))

![Řízení selekčního tlaku](/answer-imgs/NI-SPOL-14/p460_rizeni_tlaku.png)
