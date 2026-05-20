# QR rozklad: metody výpočtu a aplikace pro vlastní čísla.

Zdroj: [PON_Merged.pdf](/pdfs/ZI/PON_Merged.pdf) (skripta NI-PON — Vybrané partie z optimalizace a numeriky, kapitola 2)

---

## QR rozklad

**Definice**: pro matici $A \in \mathbb R^{m \times n}$ ($m \ge n$) existuje rozklad
$$A = QR$$
kde $Q \in \mathbb R^{m \times m}$ je **ortogonální** ($Q^T Q = I$) a $R \in \mathbb R^{m \times n}$ je **horní trojúhelníková**. ([otevřít v PDF, str. 15](/pdfs/ZI/PON_Merged.pdf#page=15))

![Ortogonální matice — vlastnosti](/answer-imgs/NI-ZI-17/p15.png)

**Blokový tvar** (ekonomický): $A = Q_L R_S$, kde $Q_L \in \mathbb R^{m \times n}$ má první $n$ sloupců $Q$ a $R_S \in \mathbb R^{n \times n}$ je horní trojúhelníková.

---

## Aplikace pro OLS (nejmenší čtverce)

Pro regresní úlohu $Xw = Y$ se hledá $\hat w = \arg\min \|Xw - Y\|^2$. S QR rozkladem $X = QR$:
$$\|Xw - Y\|^2 = \|QRw - Y\|^2 = \|Q^T(QRw - Y)\|^2 = \|Rw - Q^T Y\|^2$$
(ortogonální matice nemění Euklidovu normu, viz [str. 16](/pdfs/ZI/PON_Merged.pdf#page=16)).

![Ortogonální matice zachovává normu](/answer-imgs/NI-ZI-17/p16.png)

Pro $R = \begin{pmatrix} R_S \\ 0 \end{pmatrix}$ a $Q^T Y = \begin{pmatrix} c_1 \\ c_2 \end{pmatrix}$ stačí vyřešit **trojúhelníkovou soustavu** $R_S \hat w = c_1$ zpětnou substitucí. Numericky stabilnější než řešení normálních rovnic $X^T X w = X^T Y$.

---

## Metody výpočtu QR rozkladu

### 1. Gram-Schmidtova ortogonalizace

Sloupce $A = [a_1, \ldots, a_n]$ se ortonormalizují:
- $q_1 = a_1 / \|a_1\|$
- $q_k = (a_k - \sum_{i<k} \langle a_k, q_i \rangle q_i) / \|\ldots\|$

Elementy $R$ jsou $R_{ik} = \langle a_k, q_i \rangle$. **Numericky nestabilní** — ztráta ortogonality. **Modifikovaný Gram-Schmidt** je stabilnější.

### 2. Householderova reflexe

Pro vektor $x$ a cílový vektor $\pm \|x\| e_1$ konstruuje **reflexní matici**:
$$H = I - 2 \frac{vv^T}{v^T v}$$
kde $v = x \mp \|x\| e_1$. $H$ je symetrická a ortogonální, $Hx = \pm \|x\| e_1$. ([otevřít v PDF, str. 21](/pdfs/ZI/PON_Merged.pdf#page=21))

![Householder reflection](/answer-imgs/NI-ZI-17/p21.png)

Postup: aplikuj $H_1, H_2, \ldots$ na sloupce $A$ tak, aby pod diagonálou vznikly nuly. $Q = H_1 H_2 \ldots H_n$, $R = H_n \ldots H_1 A$. **Numericky stabilní**, ekonomický.

### 3. Givensovy rotace

$G(i, j, \theta)$ je rotace v rovině $e_i, e_j$. Postupně nuluje jednotlivé podprahové prvky. Vhodné pro **řídké matice** (jen jeden prvek nula najednou). ([otevřít v PDF, str. 25](/pdfs/ZI/PON_Merged.pdf#page=25))

![Givens rotations](/answer-imgs/NI-ZI-17/p25.png)

---

## QR algoritmus pro výpočet vlastních čísel

**Iterace**: pro symetrickou (nebo obecně čtvercovou) $A$ definuj $A_0 = A$. V kroku $k$:
1. Spočti QR rozklad: $A_k = Q_k R_k$.
2. Polož $A_{k+1} = R_k Q_k$.

**Vlastnosti**:
- $A_{k+1} = Q_k^T A_k Q_k$ (podobnostní transformace) — **zachovává vlastní čísla**.
- Pro symetrické $A$ konverguje $A_k$ k **diagonální matici** s vlastními čísly na diagonále.
- Pro obecné $A$ konverguje k horní trojúhelníkové (Schurova forma).

**Akcelerace**:
- **Hessenbergova redukce** předzpracování (1× $O(n^3)$, pak iterace $O(n^2)$ místo $O(n^3)$).
- **Shifty**: $A_k - \sigma_k I = Q_k R_k$, $A_{k+1} = R_k Q_k + \sigma_k I$. Volba $\sigma_k$ (Rayleighův kvocient, Wilkinsonův shift) → kvadratická konvergence.

Praktická implementace: **implicit shifted QR algorithm**, LAPACK rutiny `?GEEV`, `?SYEV`. Pro velmi velké matice se používá Lanczos / Arnoldi iterace (Krylovovy podprostory).

---

## Další vlastnosti a aplikace

- **Jednoznačnost**: pokud sloupce $A$ jsou lineárně nezávislé a vyžadujeme $R_{ii} > 0$, QR rozklad je **jednoznačný**.
- **Řešení lineárních soustav**: $Ax = b \Rightarrow Rx = Q^T b$.
- **Inverze matice**: $A^{-1} = R^{-1} Q^T$.
- **Determinant**: $\det A = \pm \prod R_{ii}$.
- **Použití v ML**: numericky stabilní výpočet OLS regrese, gradientního ortogonalizovaného konstruktoru bází, výpočet vlastních čísel pro PCA.
