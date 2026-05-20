# Programování nad distribuovanou pamětí, programový model MPI (vícevláknové procesy, komunikátory, 2-bodové blokující a neblokující komunikační operace, kolektivní operace), paralelní násobení hustých matic, paralelní mocninná metoda.

Zdroj: [PDP_Merged.pdf](/pdfs/SPOL/PDP_Merged.pdf) (slides NI-PDP, Přednášky 06, 09, 12)

---

## MPI — Message Passing Interface

Standardizovaný systém zasílání zpráv mezi procesy paralelního programu; procesy běží na propojených uzlech (distribuovaná paměť, NUMA model). ([otevřít v PDF, str. 277](/pdfs/SPOL/PDP_Merged.pdf#page=277))

![MPI úvod](/answer-imgs/NI-SPOL-18/p277_mpi_uvod.png)

---

## Komunikátory

Každá komunikační MPI funkce má parametr **komunikátor** — určuje množinu procesů, v rámci níž komunikace probíhá. `MPI_COMM_WORLD` je implicitní intra-komunikátor pro všechny procesy programu. ([otevřít v PDF, str. 292](/pdfs/SPOL/PDP_Merged.pdf#page=292))

![Komunikátory I](/answer-imgs/NI-SPOL-18/p292_komunikatory.png)

`MPI_Comm_rank` vrací rank procesu, `MPI_Comm_size` vrací počet procesů v dané skupině. ([otevřít v PDF, str. 293](/pdfs/SPOL/PDP_Merged.pdf#page=293))

![MPI_Comm_rank / size](/answer-imgs/NI-SPOL-18/p293_comm_rank_size.png)

---

## Vícevláknové MPI procesy (`MPI_Init_thread`)

Procesy MPI mohou být vícevláknové; míra spolupráce MPI s vlákny je dána parametrem `MPI_Init_thread`: `MPI_THREAD_SINGLE` / `FUNNELED` (jen master volá MPI) / `SERIALIZED` (volání jako kritická sekce) / `MULTIPLE` (víceportový model). Typický hybridní model: 1 MPI proces na uzel/socket + OpenMP vlákna uvnitř. _Viz Přednáška 06 slidy 12-15._

---

## Taxonomie MPI komunikačních operací

**2-bodové** (point-to-point) vs **kolektivní**; **blokující** (funkce se vrátí až po dosažení komunikačního stavu) vs **neblokující** (vrátí se okamžitě po iniciaci). ([otevřít v PDF, str. 294](/pdfs/SPOL/PDP_Merged.pdf#page=294))

![Taxonomie komunikačních operací](/answer-imgs/NI-SPOL-18/p294_taxonomie.png)

---

## 2-bodové blokující komunikace: `MPI_Send` / `MPI_Recv`

**`MPI_Send(buf, count, datatype, dest, tag, comm)`** ([otevřít v PDF, str. 296](/pdfs/SPOL/PDP_Merged.pdf#page=296))

![MPI_Send](/answer-imgs/NI-SPOL-18/p296_mpi_send.png)

**`MPI_Recv(buf, count, datatype, source, tag, comm, status)`** — `source = MPI_ANY_SOURCE`, `tag = MPI_ANY_TAG` přijme od libovolného. ([otevřít v PDF, str. 297](/pdfs/SPOL/PDP_Merged.pdf#page=297))

![MPI_Recv](/answer-imgs/NI-SPOL-18/p297_mpi_recv.png)

---

## Komunikační módy blokujících operací Send

**Standard mode (`MPI_Send`)**: knihovna sama rozhodne mezi buffered/synchronous; návrat nastane buď když cílový proces inicioval příjem, nebo když data byla zkopírována do systémového bufferu. ([otevřít v PDF, str. 307](/pdfs/SPOL/PDP_Merged.pdf#page=307))

![Send mód: standard](/answer-imgs/NI-SPOL-18/p307_send_standardni.png)

**Buffered (`MPI_Bsend`)** — uživatelský buffer, lokální. **Synchronous (`MPI_Ssend`)** — návrat až po inicializaci příjmu, nelokální. **Ready (`MPI_Rsend`)** — předpokládá, že příjem už je iniciován. ([otevřít v PDF, str. 308](/pdfs/SPOL/PDP_Merged.pdf#page=308))

![Send módy: buffered / synchronous / ready](/answer-imgs/NI-SPOL-18/p308_send_modes.png)

---

## Neblokující komunikační operace

`MPI_Isend`, `MPI_Ibsend`, `MPI_Issend`, `MPI_Irsend`, `MPI_Irecv` — iniciují operaci a okamžitě se vrátí. Buffer nelze používat, dokud není dokončení **explicitně otestováno** (`MPI_Wait`, `MPI_Test`). ([otevřít v PDF, str. 310](/pdfs/SPOL/PDP_Merged.pdf#page=310))

![Blokující vs neblokující operace](/answer-imgs/NI-SPOL-18/p310_blokujici_neblokujici.png)

---

## Kolektivní komunikační operace — klasifikace

**Jeden–mnoha**: OAB (`MPI_Bcast`), MC (multicast), OAS (`MPI_Scatter`), AOG (`MPI_Gather`). **Všichni–všichni**: AAB = AAG (`MPI_AllGather`), AAS (`MPI_Alltoall`), AAR (`MPI_Allreduce`). ([otevřít v PDF, str. 422](/pdfs/SPOL/PDP_Merged.pdf#page=422))

![Klasifikace kolektivních operací](/answer-imgs/NI-SPOL-18/p422_kolektivni_klasifikace.png)

---

## Paralelní násobení hustých matic

### MVM: řádkové blokové mapování `RowWiseMVM`

F1: AAB každý $P_i$ pošle svůj subvektor $\vec x$ všem ostatním (`MPI_Allgather`). F2: $P_i$ vypočte $r$ skalárních součinů pro $y_j$. ([otevřít v PDF, str. 549](/pdfs/SPOL/PDP_Merged.pdf#page=549))

![RowWiseMVM](/answer-imgs/NI-SPOL-18/p549_rowwise_mvm.png)

### MMM: standardní šachovnicový algoritmus

Šachovnicové blokové mapování $C = A \times B$ na $M(\sqrt p, \sqrt p)$. F1: v každém řádku AAG submatic $A$; F2: v každém sloupci AAG submatic $B$; F3: lokální součiny. **Paměťově neefektivní** ($\sqrt p \cdot$ paměti sekv. alg.). ([otevřít v PDF, str. 554](/pdfs/SPOL/PDP_Merged.pdf#page=554))

![Standard MMM](/answer-imgs/NI-SPOL-18/p554_standard_mmm.png)

### MMM: Cannonův systolický algoritmus

Submatice $A, B$ jsou iterativně cyklicky posouvány: každá submatice $A$ se objeví jednou ve správném procesu. Paměťově optimální — žádná replikace. ([otevřít v PDF, str. 555](/pdfs/SPOL/PDP_Merged.pdf#page=555))

![Cannon I — princip](/answer-imgs/NI-SPOL-18/p555_cannon_I.png)

**Algoritmus**: F1: orotuj řádek $i$ matice $A$ o $i$ pozic doleva; F2: orotuj sloupec $k$ matice $B$ o $k$ pozic nahoru; F3: $\sqrt p$ krát {lokální součin a posun o 1 pozici}. ([otevřít v PDF, str. 556](/pdfs/SPOL/PDP_Merged.pdf#page=556))

![Cannon II — algoritmus](/answer-imgs/NI-SPOL-18/p556_cannon_II.png)

---

## Paralelní mocninná metoda (Power Method)

Iterativní hledání **největšího vlastního čísla** $\lambda$ řídké matice $A$ a příslušného vlastního vektoru $\vec v$ ($A\vec v = \lambda \vec v$). Základ např. PageRanku. **Algoritmus**: opakovaně $\vec y \leftarrow A\vec x$ (MVM), $\alpha = \|\vec y\|_2$, $\vec x \leftarrow \vec y / \alpha$, dokud kritérium konvergence. ([otevřít v PDF, str. 564](/pdfs/SPOL/PDP_Merged.pdf#page=564))

![Power Method — algoritmus](/answer-imgs/NI-SPOL-18/p564_power_method.png)

---

## MPI mocninná metoda: libovolné mapování řídké matice

$A = A^{(0)} + A^{(1)} + \cdots + A^{(p-1)}$ — každý proces drží svoji část nenulových prvků (např. COO). F2: lokální MVM $\vec y^{(i)} \leftarrow A^{(i)} \vec x$ a poté globální **All-to-All Reduction** ($\vec y = \sum_i \vec y^{(i)}$). ([otevřít v PDF, str. 566](/pdfs/SPOL/PDP_Merged.pdf#page=566))

![Mocninná metoda — libovolné mapování](/answer-imgs/NI-SPOL-18/p566_pm_libovolne.png)

**Realizace**: lokální MVM hybridně s `#pragma omp parallel for`, redukce přes `MPI_Allreduce(MPI_IN_PLACE, y, n, MPI_DOUBLE, MPI_SUM, MPI_COMM_WORLD)`. ([otevřít v PDF, str. 567](/pdfs/SPOL/PDP_Merged.pdf#page=567))

![PowerMethod-Random — kód](/answer-imgs/NI-SPOL-18/p567_pm_random.png)
