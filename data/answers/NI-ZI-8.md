# Autoenkodéry a generativní neuronové sítě.

Zdroj: [MVI_Merged.pdf](/pdfs/ZI/MVI_Merged.pdf) (slides NI-MVI, Lectures 3 & 6 — Autoenkodéry, VAE, GAN)

---

## Autoencoder (AE)

Dopředná NN trénovaná **bez učitele** k rekonstrukci vstupu: $\hat x = D(E(x))$, kde encoder $E: \mathcal X \to \mathcal Z$ promítne vstup do **latentního prostoru** $\mathcal Z$ menší dimenze, decoder $D$ rekonstruuje. Ztráta $L = \|x - \hat x\|^2$. Latentní reprezentace zachycuje nejdůležitější rysy dat. ([otevřít v PDF, str. 145](/pdfs/ZI/MVI_Merged.pdf#page=145))

![Autoencoder overview](/answer-imgs/NI-ZI-8/p145_ae_overview.png)

**Varianty AE**:
- **Denoising AE**: vstup s šumem, cíl bez šumu → robustní reprezentace.
- **Sparse AE**: regulizace na řídké aktivace ($L_1$ na $z$).
- **Contractive AE**: penalizace $\|J_E(x)\|_F^2$ — invariance v okolí trénovacích bodů.
- **Convolutional AE**: enc/dec jsou CNN, vhodné pro obrazy.
- **U-Net**: AE se skip connections, segmentace.

Aplikace: dimenzionální redukce, denoising, anomaly detection (rekonstrukční chyba), pretraining.

---

## Variational Autoencoder (VAE)

**Pravděpodobnostní** rozšíření AE: encoder produkuje **parametry rozdělení** $q_\phi(z\mid x) = \mathcal N(\mu_\phi(x), \sigma_\phi^2(x))$, decoder modeluje $p_\theta(x \mid z)$. Latentní prostor je spojitý a smysluplný.

**Ztráta (ELBO)**:
$$\mathcal L = -E_{q_\phi(z\mid x)}[\log p_\theta(x\mid z)] + D_{\mathrm{KL}}(q_\phi(z\mid x) \| p(z))$$
První člen = rekonstrukční ztráta; druhý = KL k normálnímu prioru $p(z) = \mathcal N(0, I)$ regularizuje latentní prostor.

**Reparameterization trick**: $z = \mu + \sigma \odot \epsilon$, $\epsilon \sim \mathcal N(0,I)$ — umožňuje gradientní propagaci přes náhodný vzorek.

Generace: vzorkujeme $z \sim p(z)$ a dekódujeme.

---

## Generative Adversarial Networks (GAN)

Goodfellow et al. 2014. **Dvě sítě v soutěži**:
- **Generator** $G(z)$ — mapuje šum $z \sim p_z$ na vzorky napodobující data.
- **Discriminator** $D(x)$ — binární klasifikátor (real vs fake).

**Min-max úloha**:
$$\min_G \max_D V(D, G) = E_{x \sim p_{\mathrm{data}}}[\log D(x)] + E_{z \sim p_z}[\log(1 - D(G(z)))]$$

V rovnováze $p_G = p_{\mathrm{data}}$, $D(x) = 1/2$. Trénink střídavý: updatuje $D$, pak $G$.

**Problémy**: nestabilita, mode collapse (generator produkuje úzkou množinu výstupů), vanishing gradients.

**Varianty**:
- **DCGAN** — Convolutional G/D, batch norm, leaky ReLU.
- **WGAN** (Wasserstein GAN) — Wasserstein distance, stabilnější trénink.
- **Conditional GAN** — $G(z, c)$, $D(x, c)$ — generace s podmínkou.
- **CycleGAN** — unpaired image-to-image translation.
- **StyleGAN** — kontrola stylu na různých úrovních.
- **BigGAN, StyleGAN-XL** — vysoké rozlišení, fotorealistické obličeje.

---

## Diffusion modely (současný state-of-the-art)

Iterativní denoising: trénink modelu, který predikuje šum přidaný k obrázku v náhodném časovém kroku $t$. Generace = postupné odstraňování šumu z $x_T \sim \mathcal N(0, I)$ přes $T$ kroků. **DDPM** (Ho et al. 2020), **Stable Diffusion** (latent diffusion). Ztráta typicky $L = E_{t, x_0, \epsilon}\|\epsilon - \epsilon_\theta(x_t, t)\|^2$. Stabilnější než GAN, dosahují vyšší kvality.

---

## Srovnání

| Model | Princip | Výhody | Nevýhody |
|-------|---------|--------|----------|
| **AE** | rekonstrukce | jednoduchý, dim. redukce | latentní prostor není generativní |
| **VAE** | ELBO + KL | spojitý latentní prostor, principiální | rozmazané vzorky |
| **GAN** | adversarial | ostré, fotorealistické | mode collapse, instabilita |
| **Diffusion** | denoising | SOTA kvalita | pomalá inference |

_(Slide reference: Lecture 6 / Autoencoders & GANs sekce, viz str. 145+ a podrobně Bayesian/Generative materiály lekce 6.)_
