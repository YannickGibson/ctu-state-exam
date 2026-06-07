# Transformery, pozornostní mechanismy, transfer a meta learning.

Zdroj: [MVI_Merged.pdf](/pdfs/ZI/MVI_Merged.pdf) (slides NI-MVI, Lecture 8 — Transformers)

---

## Key-Value-Query attention

Vaswaniho formulace (Attention is All You Need, 2017). Pro každý vstupní token spočítáme tři vektory: **Query** $q$, **Key** $k$, **Value** $v$. Attention je vážený součet hodnot, kde váhy = podobnost $q$ a $k$. ([otevřít v PDF, str. 352](/pdfs/ZI/MVI_Merged.pdf#page=352))

![Key-Value-Query](/answer-imgs/NI-ZI-10/p352_qkv.png)

**Self-attention**: $Q$, $K$, $V$ vznikají lineární transformací **stejné** vstupní sekvence: $q_n = x_n W_Q$, $k_n = x_n W_K$, $v_n = x_n W_V$. ([otevřít v PDF, str. 353](/pdfs/ZI/MVI_Merged.pdf#page=353))

![Self-attention](/answer-imgs/NI-ZI-10/p353_self_attention.png)

---

## Scaled Dot-Product Attention

$$\mathrm{Attention}(Q, K, V) = \mathrm{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right) V$$

Škálování $\sqrt{d_k}$ zabraňuje saturaci softmaxu pro velké dimenze. Volitelná **maska** pro padding nebo causal attention (decoder). ([otevřít v PDF, str. 354](/pdfs/ZI/MVI_Merged.pdf#page=354))

![Scaled dot-product attention](/answer-imgs/NI-ZI-10/p354_scaled_dot.png)

---

## Multi-head attention

Místo jedné attention $h = 8$ paralelních "hlav", každá s vlastními projekčními maticemi. Každá hlava modeluje jiný "reprezentační podprostor" — různé typy vztahů. Výstupy se konkatenují a projektují. ([otevřít v PDF, str. 355](/pdfs/ZI/MVI_Merged.pdf#page=355))

![Multi-head attention 1](/answer-imgs/NI-ZI-10/p355_multihead1.png)

$$\mathrm{MultiHead}(Q,K,V) = \mathrm{Concat}(\mathrm{head}_1, \ldots, \mathrm{head}_h) W^O$$

![Multi-head attention 2](/answer-imgs/NI-ZI-10/p356_multihead2.png)

---

## Transformer architektura

**Stacked encoders + decoders** (typicky 6 vrstev). Každý encoder layer: self-attention → FFN, oba s residual + LayerNorm. Decoder má navíc **cross-attention** k encoder výstupům + masked self-attention. ([otevřít v PDF, str. 357](/pdfs/ZI/MVI_Merged.pdf#page=357))

![Self-attention recap](/answer-imgs/NI-ZI-10/p357_recap.png)

**Positional encoding** přidá informaci o pořadí (sin/cos funkce nebo learned).

---

## Pretraining + Transfer learning

Klíč úspěchu transformerů: **pre-training** na velkém korpusu bez učitele + **fine-tuning** na cílovou úlohu s malým labeled datasetem. ([otevřít v PDF, str. 410](/pdfs/ZI/MVI_Merged.pdf#page=410))

![Pretraining](/answer-imgs/NI-ZI-10/p410_pretraining.png)

**Transfer learning** — předtrénovaný model přenese reprezentační znalosti na jinou (často související) úlohu. Lze: 1) zmrazit váhy + naučit jen poslední vrstvu, 2) fine-tune všech vah s malým learning rate, 3) **LoRA/adapters** — přidat malé trénovatelné moduly.

---

## BERT (Bidirectional Encoder Representations from Transformers)

Devlin et al. 2018. **Pouze encoder**. Pre-training tasks:
- **Masked Language Model (MLM)** — náhodně se zamaskuje 15 % tokenů, model predikuje původní.
- **Next Sentence Prediction (NSP)** — predikce, zda věty následují.

Po pretrain se přidá hlavička pro klasifikaci, NER, Q&A. ([otevřít v PDF, str. 415](/pdfs/ZI/MVI_Merged.pdf#page=415))

![BERT](/answer-imgs/NI-ZI-10/p415_bert.png)

---

## GPT (Generative Pre-trained Transformer)

Radford et al. (OpenAI). **Pouze decoder** s causal self-attention (každý token vidí jen předchozí). Pre-training: **autoregresivní predikce dalšího tokenu**.

- GPT-2 (2019): 1.5B parametrů.
- GPT-3 (2020): 175B parametrů, **few-shot / zero-shot** in-context learning.
- GPT-4 (2023): multimodální, řádově výkonnější.

**In-context learning** = model se "adaptuje" na úlohu z příkladů v promptu, bez aktualizace vah. ([otevřít v PDF, str. 420](/pdfs/ZI/MVI_Merged.pdf#page=420))

![GPT](/answer-imgs/NI-ZI-10/p420_gpt.png)

---

## Vision Transformers (ViT)

Dosovitskiy et al. 2020. Obraz rozdělen na **patches** (např. 16×16), každý patch lineárně promítnut na embedding + positional encoding → standardní transformer encoder. Konkurenceschopný s CNN při dostatečném pre-trainingu (např. JFT-300M).

---

## Efektivní transformery

Standardní self-attention má **$O(n^2)$** complexity. Varianty pro dlouhé sekvence:
- **Sparse attention** (Longformer, BigBird) — lokální + global tokens.
- **Linformer** — low-rank aproximace.
- **Performer/Linear attention** — kernel trick.
- **FlashAttention** — IO-aware implementace.

---

## Meta-learning

"Learning to learn" — model se naučí **rychle se adaptovat** na novou úlohu z mála příkladů.

- **MAML (Model-Agnostic Meta-Learning)** — Finn et al. 2017. Hledá inicializaci vah, ze které stačí 1-několik gradientních kroků pro adaptaci na novou úlohu.
- **Prototypical Networks** — embed each class to its prototype, klasifikuj podle vzdálenosti.
- **Matching Networks** — attention nad support setem.
- **In-context learning** u LLM = formou meta-learningu bez updatů vah.

Typický setup: trénink na distribuci úloh, evaluace na nových úlohách s few-shot příklady.
