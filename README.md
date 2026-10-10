# CashIn - Platform Invoice Financing RWA untuk Freelancer 🚀

> **Ethereum Jakarta Hackathon 2026** — Kategori Real World Assets (RWA)  
> Jaringan Target: Base Sepolia Testnet

CashIn adalah platform Web3 yang membantu freelancer mencairkan piutang invoice lebih cepat tanpa menunggu waktu jatuh tempo 30–60 hari dari klien. Invoice riil dicetak sebagai **NFT (ERC-721)** dan dapat didanai oleh investor (funder) dengan harga diskon.

---

## 💡 Alur Kerja & Analogi Sederhana

| Tahap | Status | Penjelasan & Analogi |
|---|---|---|
| **1. Create** | `Created` | **Analogi:** Freelancer menulis kuitansi tagihan resmi dan mencetak sertifikat digital kepemilikannya (NFT). |
| **2. Approve** | `Approved` | **Analogi:** Klien menandatangani kuitansi, mengonfirmasi bahwa pekerjaan benar telah selesai dan tagihan sah akan dibayar. |
| **3. List** | `Listed` | **Analogi:** Freelancer memajang invoice di etalase pasar dengan harga diskon (misal: invoice senilai 1.000 USDC dijual seharga 900 USDC untuk dapat uang cepat). |
| **4. Finance** | `Financed` | **Analogi:** Investor (Funder) membeli sertifikat invoice tersebut. 900 USDC langsung masuk ke dompet freelancer, dan kepemilikan NFT berpindah ke Funder. |
| **5. Pay** | `Paid` | **Analogi:** Saat jatuh tempo tiba, klien melunasi tagihan penuh (1.000 USDC) langsung ke pemilik NFT (Funder). Funder mendapat untung 100 USDC. |

---

## 🛡️ Fitur Keamanan Kunci: Anti-Double Funding

Salah satu risiko terbesar pembiayaan invoice adalah *penipuan penjualan invoice ganda*. Di CashIn:
- Status invoice disimpan di state blockchain.
- Saat Funder pertama memanggil fungsi `buyInvoice`, status berubah seketika menjadi `Financed` dan NFT ditransfer.
- Funder lain yang mencoba membeli invoice yang sama akan **langsung ditolak (revert)** oleh smart contract dengan pesan error: `Invoice is not listed for financing`.

---

## 🛠️ Tech Stack

- **Smart Contract:** Solidity `^0.8.28`, OpenZeppelin Contracts v5 (ERC-721 & ERC-20)
- **Framework & Testing:** Hardhat 3, TypeScript, Ethers.js v6, Mocha & Chai
- **Network:** Base Sepolia Testnet (Chain ID: `84532`)
- **Deployed Contracts on Base Sepolia:**
  - **CairIn (NFT ERC-721):** [`0xf436eC9dcf77A857dFB85f53eCAc36F56737357a`](https://sepolia.basescan.org/address/0xf436eC9dcf77A857dFB85f53eCAc36F56737357a)
  - **MockUSDC (ERC-20):** [`0x7715Cb22e0f7E811b7cd57F11dE6112019E776DD`](https://sepolia.basescan.org/address/0x7715Cb22e0f7E811b7cd57F11dE6112019E776DD)

---

## 🧪 Cara Menjalankan Pengujian (Testing)

Jalankan perintah berikut di terminal:

```bash
npx hardhat test
```

### Membaca Hasil Pengujian:
- Tanda centang hijau (`✔` atau `√`) menandakan skenario berhasil lolos.
- Tes membuktikan:
  1. **Lifecycle Penuh**: Alur dari pembuatan invoice hingga pelunasan berjalan tepat nominalnya.
  2. **Pencegahan Double-Funding**: Transaksi revert saat funder kedua mencoba mendanai invoice yang sudah dibeli.
  3. **Self-funding Prevention**: Freelancer dilarang mendanai invoice miliknya sendiri.

---

## 🤖 Catatan Kejujuran AI (AI Transparency)

Sesuai komitmen integritas pada hackathon Ethereum Jakarta 2026:
- **Smart Contract (`CairIn.sol`, `MockUSDC.sol`)**: Struktur kontrak, enum status, dan logika transfer token/NFT dibantu disusun dengan asistensi AI (Antigravity).
- **Pengujian (`test/CairIn.ts`)**: Skenario pengujian otomasi ditulis bersama AI untuk memvalidasi pencegahan *double-funding* dan akurasi saldo token.
- **Konfigurasi Hardhat (`hardhat.config.ts`, `.env.example`)**: Setup Hardhat v3 dan integrasi TypeScript dibantu oleh AI.

Visit our website !
https://cashin-syifamwldas-projects.vercel.app


