# Testování statistických hypotéz. T-testy, testy nezávislosti, testy dobré shody.

Zdroj: [VSM_Merged.pdf](/pdfs/SPOL/VSM_Merged.pdf) (slides NI-VSM, Přednášky 10–12 — Testování hypotéz)

---

## Hypotézy a jejich testování

**Nulová hypotéza** $H_0$ vs **alternativní** $H_A$ — rozhodovací proces založený na náhodném vektoru $X$, na jehož základě $H_0$ **zamítneme nebo nezamítneme**. ([otevřít v PDF, str. 190](/pdfs/SPOL/VSM_Merged.pdf#page=190))

![Hypotézy a jejich testování](/answer-imgs/NI-SPOL-6/p190_hypotezy.png)

---

## Chyby 1. a 2. druhu, hladina významnosti

**Chyba 1. druhu**: zamítneme $H_0$, ač platí; pravděpodobnost $\le \alpha$ (hladina významnosti). **Chyba 2. druhu**: nezamítneme $H_0$, ač platí $H_A$. Test, který minimalizuje chybu 2. druhu při dané $\alpha$, je **nejsilnější**. ([otevřít v PDF, str. 191](/pdfs/SPOL/VSM_Merged.pdf#page=191))

![Chyby testování](/answer-imgs/NI-SPOL-6/p191_chyby.png)

---

## Kritický obor a p-hodnota

**Kritický obor** $W_\alpha$ — množina realizací $X$, pro které zamítneme $H_0$. Pro každé $\theta \in \Theta_0$: $P_\theta(X \in W_\alpha) \le \alpha$. ([otevřít v PDF, str. 194](/pdfs/SPOL/VSM_Merged.pdf#page=194))

![Kritický obor](/answer-imgs/NI-SPOL-6/p194_kriticky_obor.png)

**p-hodnota** $\hat p = \inf\{\alpha \mid X \in W_\alpha\}$ — minimální hladina významnosti, na které ještě lze $H_0$ zamítnout. Za platnosti $H_0$ má p-hodnota rovnoměrné rozdělení $U(0,1)$. ([otevřít v PDF, str. 195](/pdfs/SPOL/VSM_Merged.pdf#page=195))

![p-hodnota](/answer-imgs/NI-SPOL-6/p195_p_hodnota.png)

---

## Typy hypotéz

**Parametrické** (tvrzení o hodnotě parametru $\theta$) vs **neparametrické** (tvrzení o vlastnosti rozdělení — medián, nezávislost, tvar rozdělení). **Jednoduché** vs **složené**. ([otevřít v PDF, str. 197](/pdfs/SPOL/VSM_Merged.pdf#page=197))

![Typy hypotéz](/answer-imgs/NI-SPOL-6/p197_typy.png)

---

## T-testy o střední hodnotě normálního rozdělení

Pro $X_1, \ldots, X_n \sim N(\mu, \sigma^2)$: při **známém** $\sigma^2$ statistika $T = \frac{\bar X_n - \mu_0}{\sigma/\sqrt n} \sim N(0,1)$; při **neznámém** $\sigma^2$ použijeme **jednovýběrový t-test**: $T = \frac{\bar X_n - \mu_0}{s_n/\sqrt n} \sim t_{n-1}$. ([otevřít v PDF, str. 213](/pdfs/SPOL/VSM_Merged.pdf#page=213))

![Jednovýběrový t-test — testová statistika](/answer-imgs/NI-SPOL-6/p213_t_statistika.png)

**Souhrnná tabulka kritických oborů pro $\mu$ (známý/neznámý rozptyl) a pro $\sigma^2$** ($\chi^2$ test). ([otevřít v PDF, str. 214](/pdfs/SPOL/VSM_Merged.pdf#page=214))

![Souhrn testů o parametrech normálního rozdělení](/answer-imgs/NI-SPOL-6/p214_souhrn_testu.png)

---

## Párový a dvouvýběrový t-test

**Párový t-test**: $Z_i = X_i - Y_i$; $H_0: \mu_\Delta = 0$ vs $H_A: \mu_\Delta \ne 0$. Statistika $T = \frac{\bar Z_n}{s_Z} \sqrt n \sim t_{n-1}$. ([otevřít v PDF, str. 216](/pdfs/SPOL/VSM_Merged.pdf#page=216))

![Párový t-test](/answer-imgs/NI-SPOL-6/p216_parovy_t.png)

**Dvouvýběrový t-test** (homoskedastická varianta, stejné rozptyly): $T = \frac{\bar X_n - \bar Y_m}{s_{12}} \sqrt{\frac{nm}{n+m}} \sim t_{n+m-2}$. ([otevřít v PDF, str. 219](/pdfs/SPOL/VSM_Merged.pdf#page=219))

![Dvouvýběrový t-test — stejné rozptyly](/answer-imgs/NI-SPOL-6/p219_dvouvyberovy_t.png)

---

## F-test rovnosti rozptylů

$T = s_X^2/s_Y^2 \sim F_{n-1, m-1}$ za platnosti $H_0: \sigma_1^2 = \sigma_2^2$. Citlivý na předpoklad normality. ([otevřít v PDF, str. 222](/pdfs/SPOL/VSM_Merged.pdf#page=222))

![F-test rovnosti rozptylů](/answer-imgs/NI-SPOL-6/p222_F_test.png)

---

## Testy dobré shody (goodness-of-fit)

### $\chi^2$ test při známých parametrech

Pro výběr z diskrétního rozdělení $p$ — Pearsonova statistika $\chi^2 = \sum_i \frac{(N_i - np_i)^2}{np_i} \xrightarrow{n\to\infty} \chi^2_{k-1}$. Zamítáme $H_0$, pokud $\chi^2 \ge \chi^2_{\alpha, k-1}$. Cochranovo pravidlo: $np_i \ge 5$. ([otevřít v PDF, str. 229](/pdfs/SPOL/VSM_Merged.pdf#page=229))

![Test χ² — známé parametry](/answer-imgs/NI-SPOL-6/p229_chi2_znama.png)

### $\chi^2$ test při neznámých parametrech

Pokud rozdělení záleží na neznámém $m$-rozměrném parametru $\theta$, odhadneme jej **metodou minimálního $\chi^2$**. Asymptotické rozdělení: $\chi^2 \sim \chi^2_{k-m-1}$ (počet stupňů volnosti = #intervalů − #odhadovaných parametrů − 1). Spojité rozdělení převedeme na multinomické přes intervaly. ([otevřít v PDF, str. 231](/pdfs/SPOL/VSM_Merged.pdf#page=231))

![Test χ² — neznámé parametry](/answer-imgs/NI-SPOL-6/p231_chi2_neznama.png)

---

## Testy nezávislosti — kontingenční tabulky

**Kontingenční tabulka** $r \times c$ pro náhodný vektor $X = (Y, Z)^T$. $H_0: p_{ij} = p_{i\bullet} p_{\bullet j}$ pro každé $i, j$. ([otevřít v PDF, str. 234](/pdfs/SPOL/VSM_Merged.pdf#page=234))

![Test nezávislosti — kontingenční tabulka](/answer-imgs/NI-SPOL-6/p234_nezavislost.png)

**Provedení**: $\chi^2 = \sum_{i,j} \frac{(N_{ij} - N_{i\bullet}N_{\bullet j}/n)^2}{N_{i\bullet}N_{\bullet j}/n} \sim \chi^2_{(r-1)(c-1)}$. Stupně volnosti $= (r-1)(c-1)$. ([otevřít v PDF, str. 236](/pdfs/SPOL/VSM_Merged.pdf#page=236))

![Test nezávislosti — provedení](/answer-imgs/NI-SPOL-6/p236_nezavislost_provedeni.png)
