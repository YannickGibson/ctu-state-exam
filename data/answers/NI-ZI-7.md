# Učení dopředných neuronových sítí, konvoluční neuronové sítě.

Zdroj: [MVI_Merged.pdf](/pdfs/ZI/MVI_Merged.pdf) (slides NI-MVI, Lectures 3 & 4)

---

## Perceptron a gradientní učení

Perceptron: $\xi = \sum_i w_i x_i - \theta$, $Z = S(\xi)$ kde $S$ je přenosová funkce (Heaviside / sigmoid). Funguje jen na **lineárně separabilních** datech. ([otevřít v PDF, str. 234](/pdfs/ZI/MVI_Merged.pdf#page=234))

![Perceptron](/answer-imgs/NI-ZI-7/p234_perceptron.png)

**Gradientní pravidlo** (Widrow-Hoff/Delta): $\Delta w_j = -\eta \frac{\partial E}{\partial w_j}$, kde $E = \frac{1}{2}\sum_i (t^{(i)} - o^{(i)})^2$ je SSE.

---

## Multilayer Perceptron (MLP)

Vícevrstvá architektura plně propojených vrstev s nelineárními aktivačními funkcemi (sigmoid, tanh, ReLU). Učí se s učitelem; **Kolmogorovova věta** garantuje univerzální aproximaci s 1 skrytou vrstvou. ([otevřít v PDF, str. 240](/pdfs/ZI/MVI_Merged.pdf#page=240))

![Multilayer Perceptron](/answer-imgs/NI-ZI-7/p240_mlp.png)

---

## Backpropagation

Pro vrstvu $\ell$ s $N_\ell$ neurony, vstupy $n_j^{(\ell)} = \sum_i a_i^{(\ell-1)} w_{ij}^{(\ell)} + b_j^{(\ell)}$, aktivace $a_j^{(\ell)} = f^{(\ell)}(n_j^{(\ell)})$. Backprop využívá **chain rule** k propagaci chyby od výstupu zpět: $\delta_j^{(L)} = (a_j^{(L)} - t_j) f'(n_j^{(L)})$, $\delta_j^{(\ell-1)} = \sum_k w_{jk}^{(\ell)} \delta_k^{(\ell)} f'(n_j^{(\ell-1)})$. Update: $w_{ij}(t+1) = w_{ij}(t) - \alpha a_i^{(\ell-1)} \delta_j^{(\ell)}$. ([otevřít v PDF, str. 247](/pdfs/ZI/MVI_Merged.pdf#page=247))

![Backprop training](/answer-imgs/NI-ZI-7/p247_backprop.png)

---

## Konvoluční neuronové sítě (CNN)

Inspirovány **LeCunem (1998)** a Fukushimovým Neocognitronem. Sdílené **konvoluční filtry** s prostorovou invariancí + **pooling vrstvy** (max/average) pro redukci dimenze. ([otevřít v PDF, str. 102](/pdfs/ZI/MVI_Merged.pdf#page=102))

![ConvNet overview](/answer-imgs/NI-ZI-7/p102_convnet.png)

**Konvoluční vrstva**: vstupní tensor (W×H×C) je konvolvován s $K$ filtry → výstupní feature mapy. Hyperparametry: filter size, stride, padding, počet filtrů. ([otevřít v PDF, str. 106](/pdfs/ZI/MVI_Merged.pdf#page=106))

![Convolutional layer](/answer-imgs/NI-ZI-7/p106_conv_layer.png)

**Pooling**: max-pool nebo average-pool po blocích (typicky 2×2 stride 2) — invariance vůči malým posunům, redukce parametrů. ([otevřít v PDF, str. 110](/pdfs/ZI/MVI_Merged.pdf#page=110))

![Pooling](/answer-imgs/NI-ZI-7/p110_pooling.png)

---

## Klasické CNN architektury

**LeNet-5** (1998) — první úspěšná CNN. **AlexNet** (2012, ImageNet) — průlom hlubokého učení. **VGG** — uniformní 3×3 konvoluce, hluboká. **GoogLeNet/Inception** — moduly s paralelními konvolucemi. **ResNet** (2015) — residual connections, umožňuje stovky vrstev. ([otevřít v PDF, str. 114](/pdfs/ZI/MVI_Merged.pdf#page=114))

![CNN architectures](/answer-imgs/NI-ZI-7/p114_archs.png)

---

## Optimalizace dopředných NN

- **SGD** s mini-batchí; momentum, Nesterov; **Adam** (adaptivní learning rate).
- **Regularizace**: L2 weight decay, **dropout** (náhodně nuluje aktivace ve vrstvě), data augmentation.
- **Batch normalization**: normalizace aktivací uvnitř mini-batche stabilizuje trénink hlubokých sítí.
- **Inicializace**: Xavier/Glorot (sigmoid/tanh), He (ReLU).
- **Ztrátové funkce**: cross-entropy (klasifikace), MSE (regrese), focal loss (nevyvážené úlohy).
