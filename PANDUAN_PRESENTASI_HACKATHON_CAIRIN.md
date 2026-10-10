# 📄 BUKU PANDUAN LENGKAP PRESENTASI & PITCH DECK CAIRIN
### Ethereum Jakarta Hackathon 2026 — Day 3 Demo Day di Ganara Art, Jakarta

---

## 🏆 Informasi Resmi Hackathon
- **Tema:** Build The Real World Onchain (Real-World Assets / RWA & DeFi)
- **Venue Demo Day:** Ganara Art — Jakarta
- **Batas Waktu Submission (Day 2):** 12:00 PM (WIB) — Online Submission
- **Total Hadiah:** ~Rp 30.000.000 ($1,500 Main Prize Pool + $500 Honorable Mentions)
  - 🥇 Juara 1: $600
  - 🥈 Juara 2: $400
  - 🥉 Juara 3: $300
  - ⭐ Honorable Mentions: $500 (Ecosystem credits, grants, developer tools)

---

## 1. ⚡ Elevator Pitch 30 Detik
> *"Selamat pagi dewan juri dan rekan builders sekalian. Di Indonesia, 140 juta pekerja lepas dan agensi menghadapi krisis arus kas: pekerjaan selesai hari ini, tapi invoice baru cair 30 hingga 90 hari kemudian. Karena tidak memiliki sertifikat tanah untuk agunan bank, banyak dari mereka terjerat pinjol berbunga tinggi 25% per bulan.*
> 
> *Kami membangun **CairIn**: platform anjak piutang mikro (RWA Invoice Factoring) di jaringan Base Sepolia yang mentokenisasi tagihan sah menjadi **NFT ERC-721**. Freelancer mendapatkan **pencairan uang tunai di muka detik itu juga** dengan diskon wajar dari investor likuiditas global. Smart contract kami menjamin secara atomik bahwa **1 invoice mustahil didanai dua kali**. Saat jatuh tempo, klien melunasi tagihan langsung ke investor."*

---

## 2. 📋 Checklist Kelengkapan Submission Online (Day 2 — 12:00 PM WIB)

| No | Item Submission | Detail Pengisian Proyek CairIn |
| :--- | :--- | :--- |
| **1** | **Project Description** | **CairIn** adalah protokol pasar anjak piutang mikro (*micro-factoring*) terdesentralisasi yang memberdayakan pekerja lepas dan UMKM di Indonesia untuk mencairkan faktur piutang secara instan menggunakan USDC di Base Sepolia. |
| **2** | **Problem & Solution** | **Problem:** Net 30–90 payment lag menciptakan kekosongan kas jutaan pekerja, memicu ketergantungan pada pinjol berbunga tinggi.<br>**Solution:** Mengubah faktur piutang menjadi NFT ERC-721 yang dapat dibeli oleh investor likuiditas dengan diskon wajar (5–10%), memberikan modal kerja instan tanpa utang berbunga. |
| **3** | **GitHub Repository** | `https://github.com/syifamwlda/Cashin` (Repositori open-source memuat smart contract Solidity 0.8.28, TypeChain, test suite Hardhat, dan Next.js 14 frontend). |
| **4** | **Demo / Deployed App** | Web App: Landing Page interaktif (`/`) dan Workspace Operasional (`/app`).<br>Slide Presentasi: `/pitch` dan `PITCH_DECK_CAIRIN.html`. |
| **5** | **Tech Stack** | Smart Contracts: Solidity 0.8.28, Hardhat, Ethers.js v6, OpenZeppelin ERC-721 & ERC-20.<br>Frontend: Next.js 14 App Router, TypeScript, Tailwind CSS, Lucide Icons.<br>Jaringan: Base Sepolia L2 (Coinbase ecosystem). |
| **6** | **RWA Use Case** | Tokenisasi Piutang Dagang Riil (*Accounts Receivable Factoring*). Menghubungkan aktivitas komersial dunia nyata (invoice jasa) dengan pool likuiditas stablecoin on-chain. |
| **7** | **Demo Video / Deck** | Slide interaktif mandiri di `PITCH_DECK_CAIRIN.html`, web deck di `/pitch`, dan video screencast 3 menit memperlihatkan alur pembuatan invoice hingga pencegahan pendanaan ganda. |
| **8** | **Team Information** | Tim multidisiplin dengan keahlian smart contract engineering, front-end architecture, dan product-financial design. |

---

## 3. 🎯 Pemenuhan 5 Kriteria Penilaian Juri (Bobot 100%)

### 1. Real-World Utility (25%)
- **Fokus Juri:** Menyelesaikan masalah dunia nyata yang konkret, bukan sekadar teori tokenomics.
- **Poin Presentasi:** Menyelesaikan krisis likuiditas kas 140+ juta pekerja informal di Asia Tenggara. Menghilangkan ketergantungan pada pinjol berbunga 25-30%/bulan dengan diskon wajar 5-10%.
- **Kalimat Kunci:** *"CairIn tidak menciptakan token spekulasi baru; kami mentokenisasi dokumen komersial riil yang bernilai miliaran rupiah di industri kreatif dan UMKM."*

### 2. Onchain Implementation (25%)
- **Fokus Juri:** Penggunaan smart contract, standar token, dan infrastruktur Ethereum yang bermakna.
- **Poin Presentasi:** Memakai standar ERC-721 untuk menjamin kepemilikan unik tiap faktur, settlement menggunakan USDC 6 desimal, serta transisi state atomik (*Draft ➔ Approved ➔ Listed ➔ Financed ➔ Paid*).
- **Kalimat Kunci:** *"Kami memanfaatkan Base Sepolia L2 untuk menghasilkan biaya transaksi mikro di bawah Rp100 dan finalitas sub-detik yang sangat cocok untuk tiket invoice mikro."*

### 3. Innovation & Differentiation (20%)
- **Fokus Juri:** Kebaruan solusi dibanding pendekatan RWA atau P2P konvensional yang sudah ada.
- **Poin Presentasi:** **Proteksi Faktur Ganda Otomatis.** Di perbankan tradisional, penipuan terbesar adalah fotokopi faktur kertas yang dijual ke beberapa bank sekaligus (*double factoring*). CairIn memecahkan ini secara kriptografis: 1 invoice = 1 NFT. Smart contract otomatis me-revert transaksi jika ada yang mencoba mendanai invoice yang sudah berstatus `Financed`.
- **Kalimat Kunci:** *"Blockchain memecahkan risiko double-financing yang selama ratusan tahun menjadi momok di industri anjak piutang tradisional."*

### 4. Feasibility & Scalability (20%)
- **Fokus Juri:** Kelayakan bisnis, model komersial, dan adopsi pasca-hackathon.
- **Poin Presentasi:** Model bisnis jelas: *origination fee* 0.5%–1% saat pencairan dan *settlement fee* 0.25% saat pelunasan. Integrasi roadmap Account Abstraction (ERC-4337) agar klien korporat dapat menandatangani invoice via Google Login tanpa pusing beli ETH.
- **Kalimat Kunci:** *"Biaya rendah di Base memungkinkan kami melayani tiket invoice mikro mulai dari Rp 1 juta hingga Rp 20 juta secara menguntungkan."*

### 5. Demo & User Experience (10%)
- **Fokus Juri:** Kualitas peragaan produk, desain intuitif, dan alur aplikasi.
- **Poin Presentasi:** Pemisahan arsitektur antara Landing Page edukatif (`/`) untuk meyakinkan audiens non-kripto dan Workspace (`/app`) dengan kalkulator diskon real-time serta simulasi penolakan transaksi ganda interaktif.
- **Kalimat Kunci:** *"Antarmuka kami didesain dengan gaya brutalist modern yang bersih, kalkulator instan, dan log transaksi EVM yang transparan."*

---

## 4. 🎤 Skrip Presentasi Slide demi Slide (Demo Day Ganara Art)
*Estimasi waktu: 3 – 5 Menit*

### Slide 1: Judul & Pembuka (00:00 – 00:30)
> *"Selamat pagi dewan juri, partner ekosistem, dan rekan builders! Nama saya [Nama Anda] dari tim CairIn. Hari ini kami bangga mempersembahkan bagaimana kami membawa Real-World Assets ke kehidupan jutaan pekerja lepas Indonesia melalui jaringan Ethereum dan Base."*

### Slide 2: Masalah (00:30 – 01:10)
> *"Bayangkan Anda seorang graphic designer atau web developer lepas di Jakarta. Anda baru saja menyelesaikan pekerjaan senilai Rp 10 juta untuk sebuah agensi. Pekerjaan Anda selesai hari ini, tapi kontrak pembayaran memberlakukan sistem Net-45 atau Net-60—artinya uang baru Anda terima 2 bulan lagi.*
> 
> *Padahal, biaya sewa tempat tinggal, listrik, dan makan jatuh tempo besok. Pergi ke bank? Ditolak karena tidak memiliki agunan sertifikat tanah. Akibatnya, banyak pekerja terpaksa meminjam ke pinjol dengan bunga 25% per bulan. Ini adalah lingkaran setan likuiditas bagi 140 juta pekerja mandiri di Asia Tenggara."*

### Slide 3: Solusi CairIn (01:10 – 01:50)
> *"Solusi kami adalah CairIn: Mengubah piutang kerja yang tertahan menjadi uang kas hari ini juga.*
> 
> *CairIn adalah protokol invoice factoring terdesentralisasi. Alih-alih berutang dengan bunga, freelancer cukup menjual hak tagih invoice mereka dengan diskon wajar (misalnya 8%) kepada investor likuiditas global. Freelancer menerima kas instan di muka, dan investor menerima imbal hasil nyata saat invoice dilunasi."*

### Slide 4: Cara Kerja On-Chain (01:50 – 02:40)
> *"Bagaimana cara kerjanya? Sangat sederhana dan terjadi dalam 3 langkah di smart contract:*
> 1. *Penerbitan: Freelancer mencetak invoice menjadi NFT ERC-721 yang mencatat nominal, klien, dan tanggal jatuh tempo.*
> 2. *Persetujuan: Klien mengesahkan secara on-chain bahwa pekerjaan telah selesai. Freelancer menentukan tingkat diskon dan mendaftarkannya ke bursa piutang CairIn.*
> 3. *Pencairan Instan: Investor menyetor USDC, dana langsung masuk ke dompet freelancer saat itu juga, dan NFT hak tagih berpindah ke investor.*
> 
> *Saat jatuh tempo, klien membayar 100% penuh langsung ke investor."*

### Slide 5: Keamanan Anti-Double Financing (02:40 – 03:20)
> *"Mengapa harus menggunakan blockchain? Di perbankan tradisional, penipuan paling umum adalah satu faktur kertas difotokopi dan dijual ke beberapa bank sekaligus.*
> 
> *Di CairIn, smart contract kami memiliki Atomic State Guard. Fungsi `fundInvoice` memvalidasi status tagihan harus `Listed`. Begitu investor pertama mendanai, status langsung terkunci menjadi `Financed`. Jika ada investor lain mencoba mendanai tagihan yang sama, EVM seketika melakukan REVERT. Saldo investor kedua 100% aman dan tidak terpotong sepeser pun."*

### Slide 6: Model Bisnis & Skalabilitas (03:20 – 03:50)
> *"CairIn menghasilkan pendapatan dari origination fee 0.5%–1% saat pencairan faktur dan settlement fee 0.25% saat pelunasan.*
> 
> *Dengan efisiensi gas fee Base L2 yang di bawah Rp100 per transaksi, CairIn mampu melayani tiket invoice bernilai mikro ($100 – $1,500) yang selama ini tidak tersentuh oleh bank konvensional karena mahalnya biaya administrasi perbankan."*

### Slide 7 & 8: Roadmap & Penutup (03:50 – 04:30)
> *"Roadmap kami meliputi integrasi Account Abstraction (ERC-4337) agar klien korporat dapat mengesahkan invoice menggunakan akun Google tanpa perlu mengerti kripto, serta pool asuransi cadangan untuk risiko wanprestasi.*
> 
> *Mari bersama-sama kita wujudkan misi hackathon ini: 'Build The Real World Onchain'. Terima kasih!"*

---

## 5. 💻 Panduan Live Demo Produk di Panggung
1. **Layar 1 — Buka Landing Page (`http://localhost:3000/`)**
   - Tunjukkan desain brutalist fintech yang bersih.
   - Tarik slider kalkulator diskon: perlihatkan perhitungan real-time penerimaan freelancer vs profit investor.
2. **Layar 2 — Buka Workspace (`http://localhost:3000/app`)**
   - Tunjukkan pemisahan halaman yang terorganisir.
   - Klik tombol **"+ Terbitkan Invoice"** untuk memperlihatkan proses pencatatan faktur baru menjadi NFT ERC-721.
3. **Layar 3 — Alur Transaksi Faktur**
   - Buka invoice draft ➔ Klik **"Klien Sahkan & Setujui Tagihan"**.
   - Masukkan diskon (misal 10%) ➔ Klik **"Jual Hak Tagih ke Bursa"**.
   - Klik **"Danai Sebagai Investor"** ➔ Status berubah seketika menjadi Didanai dan modal cair.
4. **Layar 4 — Buktikan Proteksi Anti-Ganda (Showstopper)**
   - Di panel terminal "Keamanan Smart Contract", klik **"⚡ Coba Simulasi: Bagaimana Sistem Menolak Pendanaan Ganda"**.
   - Tunjukkan log transaksi bahwa upaya pendanaan kedua otomatis di-**REVERT** oleh EVM tanpa memotong saldo.

---

## 6. 🛡️ Pertahanan Q&A Juri (Toughest Questions & Bulletproof Answers)

### Q1: "Bagaimana jika klien menolak membayar saat jatuh tempo? Siapa yang menanggung risiko gagal bayar (default risk)?"
> **Jawaban:** *"Di anjak piutang ada dua model: with-recourse dan non-recourse. Pada tahap MVP ini, kami menerapkan verifikasi dua arah di mana invoice berstatus Draft wajib disetujui klien secara on-chain sebelum bisa didaftarkan ke bursa piutang. Klien yang mengesahkan terikat oleh reputasi on-chain dan dokumen kerja digital. Dalam roadmap Q1 2027, kami mengintegrasikan dua mekanisme proteksi: (1) Staking jaminan reputasi oleh freelancer, dan (2) Kolaborasi dengan pool cadangan asuransi desentralisasi (seperti Nexus Mutual / RWA Reserve Pool) yang menyerap porsi risiko wanprestasi dengan imbal bagi hasil premi."*

### Q2: "Kenapa harus pakai blockchain dan NFT? Kenapa tidak pakai database PostgreSQL biasa seperti platform P2P lending biasa?"
> **Jawaban:** *"Ada 3 alasan fundamental: (1) **Likuiditas Global Tanpa Batas:** Investor dari negara mana pun dapat mendanai tagihan pekerja di Indonesia secara instan menggunakan USDC tanpa izin perbankan lintas batas. (2) **Standar NFT ERC-721:** Hak tagih menjadi instrumen finansial yang dapat diperdagangkan di pasar sekunder. (3) **Pencegahan Penipuan Faktur Ganda secara Matematis:** Database tradisional tersekat di masing-masing bank, memungkinkan orang meminjam di bank A dan B memakai faktur fotokopi yang sama. Di blockchain, 1 NFT invoice hanya memiliki 1 status global yang tidak bisa dipalsukan."*

### Q3: "Klien UMKM atau agensi biasa tidak punya dompet kripto MetaMask. Bagaimana mereka bisa mengesahkan invoice?"
> **Jawaban:** *"Untuk demo hackathon ini, kami menggunakan wallet standar Base Sepolia. Namun dalam arsitektur produksi kami, kami menggunakan Account Abstraction (ERC-4337) dengan Paymaster. Klien cukup menerima link via email atau WhatsApp, login menggunakan Google Login, dan mengklik 'Setujui'. Paymaster kami yang menanggung biaya gas secara seamless tanpa klien perlu tahu apa itu gas fee atau kripto."*

### Q4: "Mengapa memilih Base dan bukan Ethereum Mainnet atau Polygon?"
> **Jawaban:** *"Dua alasan krusial: Pertama, Base didukung oleh Coinbase yang merupakan penerbit utama USDC—mata uang yang kami gunakan untuk settlement. Kedua, biaya gas di Base sangat rendah (kurang dari Rp100 per transaksi) dengan finalitas sub-detik. Karena target kami adalah tagihan mikro freelancer (Rp 3 juta – Rp 20 juta), biaya gas di Mainnet Ethereum akan memakan habis keuntungan diskon."*

### Q5: "Apakah proyek ini dibangun dari nol (from scratch) sesuai aturan resmi hackathon?"
> **Jawaban:** *"Ya, 100% dibangun dari awal selama hackathon. Smart contract CairIn.sol, integrasi Hardhat, testing suite pencegahan double-financing, serta frontend Next.js 14 brutalist fintech semuanya dikembangkan dan dikomit secara transparan di repositori publik GitHub selama masa kompetisi."*

---

## 7. 💡 Cara Mencetak Menjadi PDF
1. Buka file `PANDUAN_PRESENTASI_HACKATHON_CAIRIN.html` di browser Google Chrome / Microsoft Edge.
2. Klik tombol **"🖨️ Cetak / Simpan ke PDF"** di pojok kanan atas layar (atau tekan `Ctrl + P`).
3. Pada opsi Destination printer, pilih **"Save as PDF"** / **"Simpan sebagai PDF"**.
4. Klik **Save**. Dokumen siap dipelajari secara offline atau dicetak fisik saat latihan pitching di Ganara Art!
