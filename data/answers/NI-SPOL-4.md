# Integrál funkcí více proměnných (Darbouxova konstrukce).

Zdroj: [MPI_Merged.pdf](/pdfs/SPOL/MPI_Merged.pdf) (skripta NI-MPI, kap. 8.2, 9)

---

## Rekapitulace 1D Darbouxovy konstrukce

**Definice 8.1 — Rozdělení intervalu $[a,b]$.** ([otevřít v PDF, str. 35](/pdfs/SPOL/MPI_Merged.pdf#page=35))

![Definice 8.1 Rozdělení intervalu](/answer-imgs/NI-SPOL-4/p35_def_rozdeleni.png)

**Definice 8.3 — Horní/dolní Darbouxův součet $S_f(\sigma)$, $s_f(\sigma)$.** ([otevřít v PDF, str. 36](/pdfs/SPOL/MPI_Merged.pdf#page=36))

![Def 8.3 Darbouxovy součty](/answer-imgs/NI-SPOL-4/p36_def_darboux_sums.png)

**Darbouxův integrál** (horní $D_f = \inf S_f$, dolní $d_f = \sup s_f$; pokud $D_f = d_f$, je $f$ Darbouxovsky integrabilní). ([otevřít v PDF, str. 37](/pdfs/SPOL/MPI_Merged.pdf#page=37))

![Darbouxův integrál 1D](/answer-imgs/NI-SPOL-4/p37_def_darboux_integral.png)

---

## Vícerozměrný Darbouxův integrál (obdélníková oblast)

**Rozdělení obdélníku** $D = [a,b] \times [c,d]$ jako součin rozdělení a **horní/dolní Darbouxova suma**. ([otevřít v PDF, str. 41](/pdfs/SPOL/MPI_Merged.pdf#page=41))

![Vícerozměrné Darbouxovy součty](/answer-imgs/NI-SPOL-4/p41_dvojrozm_sums.png)

**(Dvojitý) Darbouxův integrál** $\iint_D f$ (horní/dolní; pokud se rovnají, $f$ je integrabilní na $D$). ([otevřít v PDF, str. 42](/pdfs/SPOL/MPI_Merged.pdf#page=42))

![Dvojitý Darbouxův integrál](/answer-imgs/NI-SPOL-4/p42_dvojrozm_integral.png)

**Věta 9.1 — Fubini** (převod dvojného integrálu na dva jednorozměrné). ([otevřít v PDF, str. 42](/pdfs/SPOL/MPI_Merged.pdf#page=42))

![Věta 9.1 Fubini](/answer-imgs/NI-SPOL-4/p42_veta_fubini.png)

---

## Obecná (neobdélníková) oblast

**Definice 9.2 — Darbouxův integrál na omezené množině $D \subset \mathbb{R}^2$** (rozšířením funkce $\tilde f$ na obklopující obdélník). ([otevřít v PDF, str. 42](/pdfs/SPOL/MPI_Merged.pdf#page=42))

![Definice 9.2 Darbouxův integrál na obecné oblasti](/answer-imgs/NI-SPOL-4/p42_def_obecna_oblast.png)

**Dva typy oblastí (typ 1 / typ 2).** ([otevřít v PDF, str. 44](/pdfs/SPOL/MPI_Merged.pdf#page=44))

![Typ 1 a typ 2 oblasti](/answer-imgs/NI-SPOL-4/p44_typ1_typ2.png)

**Věta 9.6 — Fubini pro obecnou oblast** (převod dvojného integrálu na dvojnásobný podle typu oblasti). ([otevřít v PDF, str. 44](/pdfs/SPOL/MPI_Merged.pdf#page=44))

![Věta 9.6 Fubini pro obecnou oblast](/answer-imgs/NI-SPOL-4/p44_veta_9_6.png)

---

## Kritérium integrability

**Definice 9.3 — Množina míry nula** + **Věta 9.4** (integrabilita ⇔ množina nespojitostí má míru nula). ([otevřít v PDF, str. 43](/pdfs/SPOL/MPI_Merged.pdf#page=43))

![Def 9.3 Množina míry nula + Věta 9.4](/answer-imgs/NI-SPOL-4/p43_def_mira_nula.png)
