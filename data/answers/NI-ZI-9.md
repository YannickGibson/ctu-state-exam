# Rekurentní neuronové sítě a jejich učení, neuroevoluce.

Zdroj: [MVI_Merged.pdf](/pdfs/ZI/MVI_Merged.pdf) (slides NI-MVI, Lecture 7 — Recurrent NNs)

---

## Feed-forward vs Recurrent NN

FF NN má spojení jen "zleva doprava", žádný cyklus, žádná paměť. **RNN** má aspoň jeden cyklus → aktivace přetrvávají, systém **s pamětí**, vhodný pro časové řady. ([otevřít v PDF, str. 274](/pdfs/ZI/MVI_Merged.pdf#page=274))

![FF vs RNN](/answer-imgs/NI-ZI-9/p274_ffvsrnn.png)

---

## Elman síť

Feed-forward s **kontextovými jednotkami** pro každý skrytý neuron: $s(t) = f(W \cdot [x(t), s(t-1)])$, $y(t) = g(V s(t))$. Trénovaná backpropagací. ([otevřít v PDF, str. 278](/pdfs/ZI/MVI_Merged.pdf#page=278))

![Elman net](/answer-imgs/NI-ZI-9/p278_elman.png)

---

## Backpropagation Through Time (BPTT)

RNN se **rozbalí** v čase do hluboké feed-forward sítě a aplikuje se standardní backprop. Gradienty se sčítají přes všechny časové kroky pro sdílené váhy. Problém: **vanishing/exploding gradients** v dlouhých sekvencích. ([otevřít v PDF, str. 280](/pdfs/ZI/MVI_Merged.pdf#page=280))

![BPTT](/answer-imgs/NI-ZI-9/p280_bptt.png)

---

## LSTM (Long Short-Term Memory)

Hochreiter & Schmidhuber 1997. Cela má 3 brány — **input**, **forget**, **output** + paměťovou stěnu $c_t$:
- $f_t = \sigma(W_f [h_{t-1}, x_t])$ — zapomeň
- $i_t = \sigma(W_i [h_{t-1}, x_t])$ — vstup
- $\tilde c_t = \tanh(W_c [h_{t-1}, x_t])$ — kandidát
- $c_t = f_t \odot c_{t-1} + i_t \odot \tilde c_t$ — aktualizace paměti
- $o_t = \sigma(W_o [h_{t-1}, x_t])$, $h_t = o_t \odot \tanh(c_t)$

Brány řeší vanishing gradient — gradient teče přes $c_t$ s minimální distorcí. ([otevřít v PDF, str. 320](/pdfs/ZI/MVI_Merged.pdf#page=320))

![LSTM cell](/answer-imgs/NI-ZI-9/p320_lstm.png)

---

## GRU (Gated Recurrent Unit)

Cho et al. 2014 — zjednodušená LSTM se 2 branami (**update**, **reset**), bez samostatné paměťové stěny. Méně parametrů, srovnatelný výkon. ([otevřít v PDF, str. 326](/pdfs/ZI/MVI_Merged.pdf#page=326))

![GRU](/answer-imgs/NI-ZI-9/p326_gru.png)

---

## Seq2seq + Attention

**Encoder-decoder RNN**: enc vyrobí kontextový vektor, dec generuje výstupní sekvenci. **Bahdanauův attention** (2015): dec v každém kroku spočítá vážený součet hidden states enc, váhy $\alpha_{t,i}$ jsou normalizované alignment skóre. Řeší úzké hrdlo fixního kontextu. ([otevřít v PDF, str. 333](/pdfs/ZI/MVI_Merged.pdf#page=333))

![Attention mechanism](/answer-imgs/NI-ZI-9/p333_attention.png)

---

## Aplikace RNN

- **Machine translation**, **speech recognition**, **language modeling**.
- **Time series prediction** — finance, weather.
- **Generování sekvencí** (text, hudba).
- **Reservoir computing** (Echo State Networks) — fixní velký skrytý stav, učí se jen výstupní vrstva.

---

## Hopfield Networks

Plně propojená rekurentní síť s binárními neurony $\{-1, +1\}$. Trénink **Hebbiánským pravidlem**: $w_{ji} = \sum_k x_k^{(j)} x_k^{(i)}$. **Energetická funkce** $E(y) = -\frac{1}{2}\sum w_{ji} y_j y_i$ vždy klesá, síť konverguje k lokálnímu minimu = **uložený vzor**. Asociativní paměť. (Nobelova cena za fyziku 2024 pro Hopfielda.)

---

## Neuroevoluce

Evoluční optimalizace neuronových sítí — místo gradientního učení **genetické algoritmy** optimalizují váhy a/nebo topologii sítě.

**NEAT (NeuroEvolution of Augmenting Topologies)** — Stanley & Miikkulainen 2002. Postupně přidává neurony a spoje; **innovation numbers** umožňují crossover topologicky odlišných sítí. **Speciation** zachovává různorodost.

**HyperNEAT** — kódování přes CPPN (Compositional Pattern Producing Network), umožňuje obrovské sítě.

**Hypernetworks** — jedna síť generuje váhy jiné sítě.

Aplikace: hledání architektur (NAS), trénink v prostředích bez gradientu (RL bez TD), evoluce game agents.
