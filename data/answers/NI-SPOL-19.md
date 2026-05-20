# Přímé ortogonální a hyperkubické propojovací sítě paralelních počítačů (definice, vlastnosti, vnořování).

Zdroj: [PDP_Merged.pdf](/pdfs/SPOL/PDP_Merged.pdf) (slides NI-PDP, Přednáška 07 Propojovací sítě + Přednáška 08 Problém vnoření)

---

## Základní pojmy teorie grafů

Stupeň uzlu $\deg(u)$, maximální/minimální stupeň, $k$-regulární graf. ([otevřít v PDF, str. 340](/pdfs/SPOL/PDP_Merged.pdf#page=340))

![Grafy — základní pojmy](/answer-imgs/NI-SPOL-19/p340_grafy_zaklad.png)

**Kartézský součin grafů** $G = G_1 \times G_2$: $V(G) = V(G_1) \times V(G_2)$. Konstruktor ortogonálních topologií. ([otevřít v PDF, str. 342](/pdfs/SPOL/PDP_Merged.pdf#page=342))

![Kartézský součin](/answer-imgs/NI-SPOL-19/p342_kartezsky_soucin.png)

**Vzdálenosti**: $\mathrm{diam}(G)$, $\mathrm{ecc}(u)$, $r(G)$, uzlově/hranově disjunktní cesty. ([otevřít v PDF, str. 346](/pdfs/SPOL/PDP_Merged.pdf#page=346))

![Vzdálenosti v grafu](/answer-imgs/NI-SPOL-19/p346_vzdalenosti.png)

**Souvislost**: $\kappa(G) \le \lambda(G) \le \delta(G)$; optimální souvislost $\kappa = \lambda = \delta$. ([otevřít v PDF, str. 348](/pdfs/SPOL/PDP_Merged.pdf#page=348))

![Souvislost grafů](/answer-imgs/NI-SPOL-19/p348_souvislost.png)

**Bisekční šířka** $\mathrm{bw}_e(G)$ — velikost nejmenšího hranového řezu, který rozpojí graf na dvě poloviny. ([otevřít v PDF, str. 349](/pdfs/SPOL/PDP_Merged.pdf#page=349))

![Bisekční šířka, bipartitnost](/answer-imgs/NI-SPOL-19/p349_bisekce.png)

---

## Požadavky na propojovací sítě (PSPP)

Dva protichůdné požadavky: **konstantní stupeň uzlu** vs **malý průměr**. Spodní mez: pro $N$-uzlovou řídkou síť je $\mathrm{diam}(G) = \Omega(\log N)$. ([otevřít v PDF, str. 350](/pdfs/SPOL/PDP_Merged.pdf#page=350))

![Požadavky na PSPP — spodní mez průměru](/answer-imgs/NI-SPOL-19/p350_pozadavky_pspp.png)

**Klasifikace přímých PSPP**: ortogonální (hyperkrychle, mřížky, toroidy), hyperkubické (motýlek, krychle), Clos, Dragonfly. ([otevřít v PDF, str. 353](/pdfs/SPOL/PDP_Merged.pdf#page=353))

![Klasifikace přímých PSPP](/answer-imgs/NI-SPOL-19/p353_klasifikace.png)

---

## Ortogonální topologie

### Binární hyperkrychle $Q_n$

$V(Q_n) = \{0,1\}^n$; sousedy se liší v 1 bitu. $|V| = 2^n$, $|E| = n\cdot 2^{n-1}$, $\mathrm{diam} = n$, $\deg = n$, $\mathrm{bw}_e = 2^{n-1}$. ([otevřít v PDF, str. 354](/pdfs/SPOL/PDP_Merged.pdf#page=354))

![Hyperkrychle Q_n](/answer-imgs/NI-SPOL-19/p354_hyperkrychle_Qn.png)

**Vlastnosti $Q_n$**: regulární s logaritmickým stupněm (není řídká), hierarchicky rekurzivní, optimální souvislost, bisekční šířka $N/2$ (ideální pro D&C), vyvážený bipartitní, Hamiltonovský graf (Grayův kód). ([otevřít v PDF, str. 355](/pdfs/SPOL/PDP_Merged.pdf#page=355))

![Vlastnosti Q_n](/answer-imgs/NI-SPOL-19/p355_vlastnosti_Qn.png)

### $n$-rozměrná mřížka $M(z_1, \ldots, z_n)$

$V = \{(a_1, \ldots, a_n); 0 \le a_i \le z_i - 1\}$; manhattanská vzdálenost. **Není** uzlově symetrická (krajní vs vnitřní uzly). Bipartitní, vždy hamiltonovská. ([otevřít v PDF, str. 362](/pdfs/SPOL/PDP_Merged.pdf#page=362))

![Mřížka M(z_1,...,z_n)](/answer-imgs/NI-SPOL-19/p362_mrizka.png)

### $n$-rozměrný toroid $K(z_1, \ldots, z_n)$

Mřížka zavinutá do toru. Manhattanská cyklická vzdálenost. **Uzlově symetrický** (rotace), průměr poloviční oproti stejně velké mřížce. Bipartitní ⇔ všechny strany sudé. Komerčně významný (BlueGene 3-D, Fujitsu 6-D). ([otevřít v PDF, str. 365](/pdfs/SPOL/PDP_Merged.pdf#page=365))

![Toroid K(z_1,...,z_n)](/answer-imgs/NI-SPOL-19/p365_toroid.png)

---

## Řídké hyperkubické sítě

Vznikají rozvinutím každého uzlu hyperkrychle do více uzlů. $O(1)$ stupeň, $O(\log N)$ průměr, $\Omega(N/\log N)$ bisekce. Přirozené pro FFT. ([otevřít v PDF, str. 371](/pdfs/SPOL/PDP_Merged.pdf#page=371))

![Řídké hyperkubické sítě](/answer-imgs/NI-SPOL-19/p371_ridke_hyperkubicke.png)

**Zabalený motýlek $wBF_n$**: $V = \{(i,x); 0 \le i < n, x \in \{0,1\}^n\}$. $|V| = n \cdot 2^n$, $\deg = 4$, $\mathrm{diam} = n + \lfloor n/2 \rfloor$. Uzlově symetrický, Hamiltonovský. ([otevřít v PDF, str. 372](/pdfs/SPOL/PDP_Merged.pdf#page=372))

![Zabalený motýlek wBF_n](/answer-imgs/NI-SPOL-19/p372_zabaleny_motylek.png)

---

## Problém vnořování (`embedding`)

**Definice vnoření** $G \xrightarrow{\mathrm{emb}} H$: dvojice $(\varphi, \xi)$ kde $\varphi: V(G) \to V(H)$ a $\xi: E(G) \to \mathcal{P}(H)$ (množina cest). ([otevřít v PDF, str. 396](/pdfs/SPOL/PDP_Merged.pdf#page=396))

![Definice vnoření](/answer-imgs/NI-SPOL-19/p396_def_vnoreni.png)

**Měřítka kvality vnoření**: **load** (maximální zatížení hostitelského uzlu), **expanze** $|V(H)|/|V(G)|$, **dilatace** (maximální délka obrazu hrany), **zahlcení** (maximální počet zdrojových hran sdílejících hostitelskou hranu). ([otevřít v PDF, str. 397](/pdfs/SPOL/PDP_Merged.pdf#page=397))

![Měřítka kvality vnoření](/answer-imgs/NI-SPOL-19/p397_kvalita_vnoreni.png)

**Kvaziizometrické a výpočetně ekvivalentní sítě**: existují vzájemná vnoření s konstantními parametry kvality. ([otevřít v PDF, str. 398](/pdfs/SPOL/PDP_Merged.pdf#page=398))

![Kvaziizometrické sítě](/answer-imgs/NI-SPOL-19/p398_kvaziizometricke.png)

**Průměrový argument** (spodní mez dilatace): pro $|V(G)| = |V(H)|$ a load $= 1$ je $\mathrm{dil}(\varphi, \xi) \ge \lceil \mathrm{diam}(H)/\mathrm{diam}(G) \rceil$. ([otevřít v PDF, str. 399](/pdfs/SPOL/PDP_Merged.pdf#page=399))

![Spodní mez na dilataci](/answer-imgs/NI-SPOL-19/p399_prumer_argument.png)

---

## Vnořování mezi topologiemi

**Stejnorozměrné mřížky a toroidy** jsou kvaziizometrické přes kartézskou dekompozici (vnoření $K(z) \to M(z)$ s load $= 1$, dilatací $= 2$, zahlcením $= 2$). ([otevřít v PDF, str. 407](/pdfs/SPOL/PDP_Merged.pdf#page=407))

![Mřížky a toroidy kvaziizometrické](/answer-imgs/NI-SPOL-19/p407_M_K_kvaziizo.png)

**Vnoření hyperkrychle do mřížek**: $Q_{2k} \xrightarrow{\mathrm{emb}} M(2^k, 2^k)$ s load $= 1$ — dolní mez na dilataci je $\frac{2^{k+1} - 2}{2k}$. Konstrukce přes **Mortonovu křivku** (Z-křivku) dává dilataci $2^{k-1}$. ([otevřít v PDF, str. 408](/pdfs/SPOL/PDP_Merged.pdf#page=408))

![Vnoření Q_n do mřížky](/answer-imgs/NI-SPOL-19/p408_Qn_do_mrizky.png)
