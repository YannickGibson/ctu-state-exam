# Základy teorie informace a kódování, entropie.

Zdroj: [VSM_Merged.pdf](/pdfs/SPOL/VSM_Merged.pdf) (slides NI-VSM, Přednášky 5–6 — Entropie a Teorie kódování)

---

## Entropie diskrétní náhodné veličiny

$H(X) = -\sum_{x \in \mathcal X} p(x) \log p(x)$, konvenčně $\log_2$ → jednotka **bit**. Závisí pouze na rozdělení $p$, ne na hodnotách $X$ — invariantní vůči libovolné prosté transformaci. ([otevřít v PDF, str. 105](/pdfs/SPOL/VSM_Merged.pdf#page=105))

![Definice entropie](/answer-imgs/NI-SPOL-7/p105_def_entropie.png)

**Entropie jako očekávaná míra neurčitosti**: $H(X) = E\,I(X)$, kde $I(x) = -\log p(x)$ je **vlastní informace** hodnoty $x$. Axiomaticky: nezáporná, jistý jev má neurčitost 0, méně pravděpodobné jevy mají vyšší neurčitost, sčítá se na nezávislých. ([otevřít v PDF, str. 107](/pdfs/SPOL/VSM_Merged.pdf#page=107))

![Entropie jako míra neurčitosti](/answer-imgs/NI-SPOL-7/p107_neurcitost.png)

**Entropie Bernoulliho rozdělení** $X \sim \mathrm{Be}(p)$: $H(X) = -p \log p - (1-p) \log(1-p)$. Konkávní, maximum 1 bit při $p = 1/2$ (rovnoměrné rozdělení = maximální neurčitost). ([otevřít v PDF, str. 109](/pdfs/SPOL/VSM_Merged.pdf#page=109))

![Entropie Bernoulliho rozdělení](/answer-imgs/NI-SPOL-7/p109_bernoulli.png)

---

## Sdružená a podmíněná entropie

**Sdružená entropie**: $H(X, Y) = -\sum_{x,y} p(x,y) \log p(x,y)$. ([otevřít v PDF, str. 111](/pdfs/SPOL/VSM_Merged.pdf#page=111))

![Sdružená entropie](/answer-imgs/NI-SPOL-7/p111_sdruzena.png)

**Podmíněná entropie**: $H(Y \mid X) = -\sum_{x,y} p(x,y) \log p(y\mid x) = E_X H(Y \mid X = x)$. ([otevřít v PDF, str. 112](/pdfs/SPOL/VSM_Merged.pdf#page=112))

![Podmíněná entropie](/answer-imgs/NI-SPOL-7/p112_podminena.png)

**Řetězové pravidlo**: $H(X, Y) = H(X) + H(Y \mid X)$. ([otevřít v PDF, str. 113](/pdfs/SPOL/VSM_Merged.pdf#page=113))

![Řetězové pravidlo](/answer-imgs/NI-SPOL-7/p113_retezove_pravidlo.png)

---

## Relativní entropie a vzájemná informace

**Kullback-Leiblerova vzdálenost**: $D(p \| q) = \sum_x p(x) \log \frac{p(x)}{q(x)}$. Nezáporná, $= 0$ ⇔ $p = q$. **Není** metrika (není symetrická, neplatí trojúhelníková nerovnost). ([otevřít v PDF, str. 115](/pdfs/SPOL/VSM_Merged.pdf#page=115))

![Relativní entropie (KL)](/answer-imgs/NI-SPOL-7/p115_kl_divergence.png)

**Vzájemná informace** $I(X; Y) = \sum_{x,y} p(x,y) \log \frac{p(x,y)}{p(x)p(y)} = D(p(x,y) \| p(x)p(y))$. Symetrická. ([otevřít v PDF, str. 116](/pdfs/SPOL/VSM_Merged.pdf#page=116))

![Vzájemná informace](/answer-imgs/NI-SPOL-7/p116_vzajemna_info.png)

**Vztah I a H** přes Vennův diagram: $I(X;Y) = H(X) - H(X\mid Y) = H(X) + H(Y) - H(X,Y)$, $I(X;X) = H(X)$. ([otevřít v PDF, str. 118](/pdfs/SPOL/VSM_Merged.pdf#page=118))

![Vennův diagram: vzájemná informace, entropie](/answer-imgs/NI-SPOL-7/p118_vennuv_diagram.png)

---

## Kódování zdroje — pojmy

**$D$-ární kód** $C: \mathcal X \to \mathcal D^*$ přiřazuje každému znaku zprávy kódové slovo $C(x)$ délky $\ell(x)$. ([otevřít v PDF, str. 130](/pdfs/SPOL/VSM_Merged.pdf#page=130))

![Kód náhodné veličiny — definice](/answer-imgs/NI-SPOL-7/p130_kod_def.png)

**Střední délka** $L(C) = E\,\ell(X) = \sum_x \ell(x) p(x)$ — kritérium optimality. ([otevřít v PDF, str. 131](/pdfs/SPOL/VSM_Merged.pdf#page=131))

![Střední délka kódu](/answer-imgs/NI-SPOL-7/p131_stredni_delka.png)

---

## Typy kódů — hierarchie

**Instantní (prefixový) kód**: žádné kódové slovo není prefixem jiného. Snadné dekódování ze začátku zprávy. ([otevřít v PDF, str. 136](/pdfs/SPOL/VSM_Merged.pdf#page=136))

![Instantní kód](/answer-imgs/NI-SPOL-7/p136_instantni_kod.png)

**Hierarchie**: Instantní ⊂ Jednoznačně dekódovatelný ⊂ Nesingulární ⊂ Všechny kódy. ([otevřít v PDF, str. 137](/pdfs/SPOL/VSM_Merged.pdf#page=137))

![Hierarchie kódů](/answer-imgs/NI-SPOL-7/p137_hierarchie.png)

---

## Kraftova nerovnost

Pro libovolný **instantní** $D$-ární kód platí $\sum_i D^{-\ell_i} \le 1$. Naopak: ke každé n-tici délek splňující tuto nerovnost existuje instantní kód těchto délek. ([otevřít v PDF, str. 138](/pdfs/SPOL/VSM_Merged.pdf#page=138))

![Kraftova nerovnost](/answer-imgs/NI-SPOL-7/p138_kraft.png)

**McMillanova věta**: stejná nerovnost platí i pro **jednoznačně dekódovatelné** kódy. Ke každému JD kódu existuje instantní kód stejných délek ⇒ omezování se na instantní kódy není restrikce. ([otevřít v PDF, str. 140](/pdfs/SPOL/VSM_Merged.pdf#page=140))

![Kraft pro JD kódy (McMillan)](/answer-imgs/NI-SPOL-7/p140_mcmillan.png)

---

## Shannonova věta o zdrojovém kódování

**Dolní mez** délky instantního kódu: $L(C) \ge H_D(X)$. Rovnost ⇔ $D^{-\ell_i} = p_i$ pro každé $i$. ([otevřít v PDF, str. 141](/pdfs/SPOL/VSM_Merged.pdf#page=141))

![Dolní mez délky instantního kódu](/answer-imgs/NI-SPOL-7/p141_dolni_mez.png)

**Shannonův kód** $\ell_i = \lceil \log_D \frac{1}{p_i} \rceil$ splňuje Kraftovu nerovnost ⇒ existuje instantní kód s $H_D(X) \le L(C) < H_D(X) + 1$. Optimální (např. Huffmanův) kód má střední délku mezi entropií a entropií+1. ([otevřít v PDF, str. 143](/pdfs/SPOL/VSM_Merged.pdf#page=143))

![Střední délka optimálního kódu (Shannon)](/answer-imgs/NI-SPOL-7/p143_shannon_kod.png)

---

## Huffmanovo kódování

Algoritmus konstrukce optimálního binárního instantního kódu: opakovaně **spoj 2 nejméně pravděpodobné** hodnoty do jedné, kódy přiřaď zpětně (0 menší pravděpodobnosti, 1 větší). Huffmanův kód má minimální střední délku mezi všemi instantními (a tedy i JD) kódy. ([otevřít v PDF, str. 145](/pdfs/SPOL/VSM_Merged.pdf#page=145))

![Huffmanův algoritmus](/answer-imgs/NI-SPOL-7/p145_huffman.png)
