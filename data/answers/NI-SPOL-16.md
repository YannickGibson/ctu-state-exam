# Výkonnostní měřítka paralelních algoritmů, PRAM model, APRAM model, škálovatelnost.

Zdroj: [PDP_Merged.pdf](/pdfs/SPOL/PDP_Merged.pdf) (slides NI-PDP, Přednáška 1)

---

## PRAM (Parallel Random Access Machine)

$p$ procesorů $P_i$ se synchronním přístupem do sdílené paměti přes READ/LOCAL/WRITE; jednotkový/globální model. ([otevřít v PDF, str. 16](/pdfs/SPOL/PDP_Merged.pdf#page=16))

![PRAM model](/answer-imgs/NI-SPOL-16/p16_pram.png)

**Ošetření konfliktů** při přístupech do sdílené paměti: EREW, CREW, CRCW (Priority / Arbitrary / Common). ([otevřít v PDF, str. 17](/pdfs/SPOL/PDP_Merged.pdf#page=17))

![PRAM: ošetření konfliktů](/answer-imgs/NI-SPOL-16/p17_pram_konflikty.png)

---

## APRAM (Asynchronní PRAM)

Procesory pracují asynchronně, nutná **bariérová synchronizace**; přístup do sdílené paměti není jednotkový. ([otevřít v PDF, str. 18](/pdfs/SPOL/PDP_Merged.pdf#page=18))

![APRAM model](/answer-imgs/NI-SPOL-16/p18_apram.png)

**Výkonnostní parametry APRAM**: globální READ/WRITE trvá $d$, $k$ po sobě jdoucích R/W $= d + k - 1$, bariéra $B(p)$. ([otevřít v PDF, str. 19](/pdfs/SPOL/PDP_Merged.pdf#page=19))

![APRAM parametry](/answer-imgs/NI-SPOL-16/p19_apram_parametry.png)

---

## Paralelní zrychlení a cena

**Zrychlení** $S(n,p) = SU(n) / T(n,p) \le p$; **lineární zrychlení** $S(n,p) = \Theta(p)$ je hlavní cíl paralelizace. ([otevřít v PDF, str. 31](/pdfs/SPOL/PDP_Merged.pdf#page=31))

![Paralelní zrychlení S(n,p)](/answer-imgs/NI-SPOL-16/p31_zrychleni.png)

**Paralelní efektivnost** $E(n,p) = SU(n) / C(n,p) \le 1$ (zrychlení na jádro). ([otevřít v PDF, str. 35](/pdfs/SPOL/PDP_Merged.pdf#page=35))

![Paralelní efektivnost E(n,p)](/answer-imgs/NI-SPOL-16/p35_efektivnost.png)

---

## Škálovatelnost

Schopnost algoritmu držet paralelní optimalitu, pokud $p$ i $n$ rostou. ([otevřít v PDF, str. 42](/pdfs/SPOL/PDP_Merged.pdf#page=42))

![Paralelní škálovatelnost](/answer-imgs/NI-SPOL-16/p42_skalovatelnost.png)

**Amdahlův zákon** (fixní $n$): $S(n,p) \le 1/f_s$, kde $f_s$ je sekvenční podíl. Saturuje paralelismus. ([otevřít v PDF, str. 43](/pdfs/SPOL/PDP_Merged.pdf#page=43))

![Amdahlův zákon](/answer-imgs/NI-SPOL-16/p43_amdahl.png)

**Gustafsonův zákon** (rostoucí $n$ s $p$): $\lim_{n\to\infty} S(n,p) = p$ — větší problémy lze řešit za týž čas s dostatkem procesorů. ([otevřít v PDF, str. 44](/pdfs/SPOL/PDP_Merged.pdf#page=44))

![Gustafsonův zákon](/answer-imgs/NI-SPOL-16/p44_gustafson.png)
