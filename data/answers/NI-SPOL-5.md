# Numerická matematika: reprezentace čísel v počítači, chyby vznikající při výpočtech s pohyblivou řádovou čárkou, podmíněnost úlohy a stabilita numerických algoritmů.

Zdroj: [MPI_Merged.pdf](/pdfs/SPOL/MPI_Merged.pdf) (skripta NI-MPI, kap. 10-11, 17-18)

---

## Kategorizace chyb v numerických výpočtech

Chyba **modelu**, **dat**, **algoritmu**, **zaokrouhlovací**. ([otevřít v PDF, str. 50](/pdfs/SPOL/MPI_Merged.pdf#page=50))

![10.2 Kategorizace chyb](/answer-imgs/NI-SPOL-5/p50_kategorizace_chyb.png)

---

## Reprezentace s pohyblivou řádovou čárkou

**Vědecký zápis** $x = \pm q \cdot 2^e$ (signifikant $q$, exponent $e$). ([otevřít v PDF, str. 50](/pdfs/SPOL/MPI_Merged.pdf#page=50))

![Formát čísla s pohyblivou ř.č.](/answer-imgs/NI-SPOL-5/p50_repr_format.png)

**Standard IEEE-754** (binary16/32/64/128) + reprezentovaná hodnota podle bitového vzoru. ([otevřít v PDF, str. 50](/pdfs/SPOL/MPI_Merged.pdf#page=50))

![IEEE-754 standard](/answer-imgs/NI-SPOL-5/p50_ieee754.png)

---

## Chyby aritmetiky

**Definice 11.2 — Absolutní a relativní chyba** reprezentace. ([otevřít v PDF, str. 52](/pdfs/SPOL/MPI_Merged.pdf#page=52))

![Def 11.2 Absolutní/relativní chyba](/answer-imgs/NI-SPOL-5/p52_def_chyba.png)

**Tvrzení 11.4 — Chyba aritmetické operace** $\mathrm{fl}(x \odot y) = (x \odot y)(1 + \delta)$, $|\delta| \le \mathbf{u}$ (zaokrouhlovací jednotka). ([otevřít v PDF, str. 53](/pdfs/SPOL/MPI_Merged.pdf#page=53))

![Tvrzení 11.4 Chyba aritmetické operace](/answer-imgs/NI-SPOL-5/p53_tvrzeni_arit.png)

---

## Dopředná a zpětná chyba; zpětně stabilní algoritmus

**Forward error** $\Delta v = V^*(d) - V(d)$, **backward error** $\Delta d$ (nejmenší taková, že $V^*(d+\Delta d) = V(d)$). ([otevřít v PDF, str. 64](/pdfs/SPOL/MPI_Merged.pdf#page=64))

![Forward/backward error, zpětně stabilní](/answer-imgs/NI-SPOL-5/p64_dopredna_zpetna.png)

---

## Podmíněnost úlohy

**Relativní číslo podmíněnosti** $C_r$; dobře vs. špatně podmíněná úloha. ([otevřít v PDF, str. 64](/pdfs/SPOL/MPI_Merged.pdf#page=64))

![Podmíněnost úlohy, relativní číslo podmíněnosti](/answer-imgs/NI-SPOL-5/p64_podminenost.png)

**Číslo podmíněnosti matice** $\kappa(A) = \|A\| \cdot \|A^{-1}\|$ pro $Ax = b$. ([otevřít v PDF, str. 67](/pdfs/SPOL/MPI_Merged.pdf#page=67))

![κ(A) pro soustavy lineárních rovnic](/answer-imgs/NI-SPOL-5/p67_cislo_podminenosti.png)
