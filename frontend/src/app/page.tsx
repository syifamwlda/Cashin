"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";

export default function LandingPage() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  // Interactive Live Slider on Hero Voucher Preview
  const [sampleNominal, setSampleNominal] = useState<number>(1000);
  const [sampleDiscountPct, setSampleDiscountPct] = useState<number>(8);
  const [previewTab, setPreviewTab] = useState<"calculator" | "voucher">("calculator");

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Security Simulation Demo State
  const [isTestingRevert, setIsTestingRevert] = useState(false);
  const [revertState, setRevertState] = useState<"idle" | "testing" | "reverted">("idle");
  const [revertStep, setRevertStep] = useState<number>(0);

  const formatShortAddress = (addr: string) => {
    if (!addr) return "—";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const samplePayout = (sampleNominal * (100 - sampleDiscountPct)) / 100;
  const sampleMargin = (sampleNominal * sampleDiscountPct) / 100;

  // Run Educational Security Simulation
  const runSecurityDemo = () => {
    setIsTestingRevert(true);
    setRevertState("testing");
    setRevertStep(1);

    setTimeout(() => {
      setRevertStep(2);
    }, 600);

    setTimeout(() => {
      setRevertStep(3);
      setIsTestingRevert(false);
      setRevertState("reverted");
    }, 1300);
  };

  return (
    <>
      {/* 1. Header Landing Page */}
      <header className="site-header wrap">
        <Link className="brand-badge" href="/" aria-label="CairIn">
          <span className="brand-circle">C</span>
          <span>CAIRIN</span>
        </Link>

        <nav className="header-nav">
          <a href="#cara-kerja">Cara Kerja</a>
          <a href="#manfaat">Manfaat</a>
          <a href="#keamanan">Keamanan</a>
          <a href="#faq">FAQ</a>
        </nav>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {isConnected ? (
            <button
              type="button"
              className="header-action-btn"
              style={{ background: "#FFFFFF", color: "var(--ink)" }}
              onClick={() => disconnect()}
            >
              <span>{formatShortAddress(address || "")}</span>
              <small style={{ opacity: 0.7 }}>(Putus)</small>
            </button>
          ) : (
            <button
              type="button"
              className="header-action-btn"
              style={{ background: "#FFFFFF", color: "var(--ink)" }}
              onClick={() => connect({ connector: injected() })}
            >
              <span>Sambungkan Dompet</span>
            </button>
          )}

          <Link href="/app" className="header-action-btn" style={{ background: "var(--cairin-orange)", borderColor: "var(--ink)" }}>
            <span>Buka Aplikasi &rarr;</span>
          </Link>
        </div>
      </header>

      <main>
        {/* 2. Hero Section: Value Proposition & Live Factoring Preview */}
        <section className="hero-stage wrap" id="hero-slip">
          <div>
            <div className="eyebrow-tag">
              <span className="eyebrow-bar" />
              <span>BASE SEPOLIA TESTNET • RWA INVOICE FINANCING</span>
            </div>

            <h1 className="hero-statement">
              Cairkan Invoice Freelance Lebih Cepat. <em>Ubah Piutang Jadi Kas Instan.</em>
            </h1>

            <p className="hero-description">
              Freelancer sering menunggu 30–60 hari agar tagihan dibayar klien. Di CairIn,
              terbitkan invoice Anda sebagai bukti hak tagih digital (NFT ERC-721), dapatkan pencairan
              di muka dari investor dengan diskon wajar, dan biarkan klien melunasi saat jatuh tempo.
            </p>

            <div className="hero-actions-group">
              <Link href="/app" className="btn-brutal btn-acid">
                <span>Buka Aplikasi Kelola & Cairkan</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>

              <a className="btn-brutal btn-outline" href="#cara-kerja">
                <span>Pelajari Cara Kerja</span>
                <span aria-hidden="true">&darr;</span>
              </a>
            </div>

            <div
              style={{
                marginTop: "28px",
                fontFamily: "var(--mono)",
                fontSize: "12px",
                fontWeight: 700,
                color: "#555",
              }}
            >
              JARINGAN: BASE SEPOLIA • STANDAR: ERC-721 + MOCK USDC • TANPA BUNGA PINJOL
            </div>
          </div>

          {/* Living Interactive Physical Voucher Preview */}
          <div className="factoring-slip-container">
            <div className="slip-sun" />

            <div className="interactive-physical-voucher">
              <div className="voucher-top-bar">
                <span>SIMULASI FAKTUR CAIRIN</span>
                <span style={{ color: "var(--cairin-green)" }}>CONTOH AKTIF</span>
              </div>

              {/* Mode Switcher inside Voucher Preview */}
              <div className="voucher-interactive-tabs">
                <button
                  type="button"
                  className={`voucher-tab-btn ${previewTab === "calculator" ? "active" : ""}`}
                  onClick={() => setPreviewTab("calculator")}
                >
                  ⚡ Hitung Pencairan
                </button>
                <button
                  type="button"
                  className={`voucher-tab-btn ${previewTab === "voucher" ? "active" : ""}`}
                  onClick={() => setPreviewTab("voucher")}
                >
                  📄 Bentuk Faktur
                </button>
              </div>

              {previewTab === "calculator" ? (
                <div style={{ padding: "12px 0" }}>
                  <div className="voucher-slider-box" style={{ marginBottom: "10px" }}>
                    <div className="voucher-slider-header">
                      <span>Nilai Tagihan Invoice:</span>
                      <b>${sampleNominal} USDC</b>
                    </div>
                    <input
                      type="range"
                      min="300"
                      max="5000"
                      step="100"
                      value={sampleNominal}
                      onChange={(e) => setSampleNominal(Number(e.target.value))}
                      className="voucher-range-input"
                    />
                  </div>

                  <div className="voucher-slider-box">
                    <div className="voucher-slider-header">
                      <span>Tawaran Diskon ke Investor:</span>
                      <b style={{ color: "var(--cairin-orange)" }}>{sampleDiscountPct}%</b>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="20"
                      step="1"
                      value={sampleDiscountPct}
                      onChange={(e) => setSampleDiscountPct(Number(e.target.value))}
                      className="voucher-range-input"
                    />
                  </div>

                  <div
                    style={{
                      background: "#FFFFFF",
                      border: "1.5px solid var(--ink)",
                      borderRadius: "6px",
                      padding: "10px 12px",
                      marginBottom: "12px",
                      fontSize: "12px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ color: "#666" }}>Cair Hari Ini ke Freelancer:</span>
                      <b style={{ color: "var(--cairin-green)", fontFamily: "var(--mono)", fontSize: "14px" }}>
                        ${samplePayout.toFixed(0)} USDC
                      </b>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#666" }}>Keuntungan Investor Saat Tempo:</span>
                      <b style={{ color: "var(--cairin-orange)", fontFamily: "var(--mono)" }}>
                        +${sampleMargin.toFixed(0)} USDC
                      </b>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="voucher-amount-section">
                    <div className="voucher-label">NILAI PIUTANG TAGIHAN</div>
                    <div className="voucher-amount">
                      <sup>$</sup>
                      {sampleNominal.toLocaleString("id-ID")}
                    </div>
                  </div>

                  <div className="voucher-party-card">
                    <div className="voucher-avatar">C</div>
                    <div className="voucher-party-info">
                      <b>Desain UI/UX & Web Prototype</b>
                      <small>Klien: PT Teknologi Digital</small>
                    </div>
                    <div>
                      <span className="voucher-stamp-badge stamp-listed">DI BURSA</span>
                    </div>
                  </div>
                </>
              )}

              {/* Action Button: Leads to App */}
              <Link href="/app" className="voucher-interactive-action" style={{ display: "block" }}>
                <b>👉 Coba Kelola & Cairkan di Aplikasi</b>
                <small>Buka halaman workspace platform &rarr;</small>
              </Link>
            </div>
          </div>
        </section>

        {/* 3. Brutalist Marquee Ticker */}
        <section className="marquee-ticker" aria-label="Ticker">
          <div className="marquee-track">
            <div className="marquee-item">
              HAK TAGIH RWA ON-CHAIN <span className="plus">+</span>
              ANTI-DOUBLE FUNDING VERIFIED <span className="plus">+</span>
              PENCAIRAN DI MUKA HARI INI <span className="plus">+</span>
              SMART CONTRACT ERC-721 <span className="plus">+</span>
              BASE SEPOLIA TESTNET <span className="plus">+</span>
              USDC STABLECOIN SETTLEMENT <span className="plus">+</span>
            </div>
            <div className="marquee-item" aria-hidden="true">
              HAK TAGIH RWA ON-CHAIN <span className="plus">+</span>
              ANTI-DOUBLE FUNDING VERIFIED <span className="plus">+</span>
              PENCAIRAN DI MUKA HARI INI <span className="plus">+</span>
              SMART CONTRACT ERC-721 <span className="plus">+</span>
              BASE SEPOLIA TESTNET <span className="plus">+</span>
              USDC STABLECOIN SETTLEMENT <span className="plus">+</span>
            </div>
          </div>
        </section>

        {/* 4. Bagian Edukasi: Cara Kerja CairIn (3 Langkah Sederhana) */}
        <section className="wrap info-section" id="cara-kerja">
          <div className="section-headline-box">
            <div>
              <div className="eyebrow-tag">
                <span className="eyebrow-bar" />
                <span>ALUR TRANSAKSI</span>
              </div>
              <h2 className="section-title">Bagaimana Cara Kerja CairIn?</h2>
            </div>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <span className="step-number">01</span>
              <h3 className="step-title">Terbitkan Invoice Sebagai NFT</h3>
              <p className="step-desc">
                Freelancer memasukkan rincian pekerjaan, alamat dompet klien, nominal tagihan, dan tanggal jatuh tempo.
                Smart contract mencetak token NFT ERC-721 yang merepresentasikan hak tagih sah di blockchain Base.
              </p>
            </div>

            <div className="step-card">
              <span className="step-number">02</span>
              <h3 className="step-title">Klien Setujui & Investor Danai</h3>
              <p className="step-desc">
                Klien memverifikasi bahwa pekerjaan valid. Freelancer menawarkan diskon wajar (misal 8%) ke bursa.
                Investor mendanai tagihan, dan uang USDC langsung cair detik itu juga ke dompet freelancer.
              </p>
            </div>

            <div className="step-card">
              <span className="step-number">03</span>
              <h3 className="step-title">Pelunasan Otomatis Saat Tempo</h3>
              <p className="step-desc">
                Saat tanggal jatuh tempo (misal 30 hari), klien melunasi tagihan 100% penuh.
                Smart contract secara otomatis menyalurkan dana pelunasan kepada investor pemegang NFT. Semua pihak senang!
              </p>
            </div>
          </div>
        </section>

        {/* 5. Bagian Manfaat: Untuk Freelancer, Investor, dan Klien */}
        <section className="wrap info-section" id="manfaat">
          <div className="section-headline-box">
            <div>
              <div className="eyebrow-tag">
                <span className="eyebrow-bar" />
                <span>NILAI TAMBAH</span>
              </div>
              <h2 className="section-title">Manfaat Bagi Semua Pihak</h2>
            </div>
          </div>

          <div className="benefits-grid">
            <div className="benefit-card">
              <span className="benefit-badge freelancer">Untuk Freelancer</span>
              <h3 style={{ fontSize: "19px", fontWeight: 800 }}>Uang Cair Hari Ini</h3>
              <ul className="benefit-points">
                <li>Tidak perlu menunggu 30–60 hari untuk gajian.</li>
                <li>Bukan pinjaman berbunga tinggi atau pinjol.</li>
                <li>Arus kas operasional bisnis digital tetap sehat.</li>
                <li>Hak tagih terlindungi secara legal on-chain.</li>
              </ul>
            </div>

            <div className="benefit-card">
              <span className="benefit-badge investor">Untuk Investor</span>
              <h3 style={{ fontSize: "19px", fontWeight: 800 }}>Imbal Hasil Riil (RWA)</h3>
              <ul className="benefit-points">
                <li>Imbal hasil 8% – 15% APY didukung pekerjaan riil.</li>
                <li>Bukan skema spekulatif, berbasis invoice riil.</li>
                <li>Likuiditas cepat dan transparan di Base Sepolia.</li>
                <li>Kepemilikan hak tagih terjamin oleh token NFT.</li>
              </ul>
            </div>

            <div className="benefit-card">
              <span className="benefit-badge klien">Untuk Klien / Perusahaan</span>
              <h3 style={{ fontSize: "19px", fontWeight: 800 }}>Fleksibel & Terpercaya</h3>
              <ul className="benefit-points">
                <li>Tetap membayar sesuai termin jatuh tempo standar.</li>
                <li>Rekan kerja freelancer tetap termotivasi dan produktif.</li>
                <li>Bukti pembayaran tercatat rapi di buku besar Web3.</li>
                <li>Proses pengesahan tagihan mudah dan instan.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 6. Bagian Keamanan: Proteksi Piutang Ganda (Anti-Double Financing) */}
        <section className="battle-test-section" id="keamanan">
          <div className="wrap battle-grid">
            <div>
              <div className="eyebrow-tag" style={{ color: "var(--paper)" }}>
                <span className="eyebrow-bar" />
                <span>KEAMANAN SMART CONTRACT • BASE SEPOLIA</span>
              </div>

              <h2 className="battle-title">
                Proteksi Piutang Ganda: Mengapa Transaksi di CairIn Mutlak Aman?
              </h2>

              <p className="battle-lede">
                Pada bisnis anjak piutang konvensional di perbankan tradisional, penipuan terbesar adalah
                <strong> satu faktur yang sama difotokopi dan dijual berulang kali ke beberapa lembaga pembiayaan berbeda</strong>.
                <br /><br />
                Di CairIn, setiap tagihan diikat dalam <strong>NFT ERC-721 tunggal</strong> di Base Sepolia.
                Smart contract menerapkan sistem transisi status yang ketat: begitu seorang investor mendanai,
                status seketika terkunci permanen. Jika ada pihak mana pun yang mencoba mendanai invoice yang sama,
                kode smart contract otomatis menggagalkan transaksi (*revert*).
              </p>

              <button
                type="button"
                className="btn-brutal btn-acid"
                onClick={runSecurityDemo}
                disabled={isTestingRevert}
                style={{ width: "max-content" }}
              >
                <span>
                  {isTestingRevert ? "Memeriksa State Mesin..." : "⚡ Coba Simulasi: Bagaimana Sistem Menolak Pendanaan Ganda"}
                </span>
                <span aria-hidden="true">&rarr;</span>
              </button>
            </div>

            {/* The Live Verification Card */}
            <div className="revert-verify-box">
              <div className="revert-verify-head">
                <span>SIMULASI SMART CONTRACT</span>
                <i
                  style={{
                    background: "var(--cairin-mint)",
                    padding: "3px 8px",
                    borderRadius: "2px",
                    fontStyle: "normal",
                  }}
                >
                  EVM CALL
                </i>
              </div>

              <div style={{ padding: "18px 0" }}>
                <b style={{ fontSize: "20px", display: "block", fontWeight: 800 }}>
                  Kasus Uji: Invoice #INV-001
                </b>
                <span style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "#666" }}>
                  Status Saat Ini: Didanai (NFT dimiliki Investor Sah)
                </span>
              </div>

              <ul className="revert-check-list">
                <li>
                  <span className="check-dot" />
                  <span>Investor Sah Mendanai Tagihan</span>
                  <b style={{ color: "var(--cairin-green)" }}>SUKSES & TERKUNCI</b>
                </li>

                <li>
                  <span className={revertStep >= 1 ? "check-dot" : "check-dot red"} />
                  <span>Upaya Pihak Lain Mencoba Mendanai Ulang</span>
                  <b>{revertStep >= 1 ? "TERDETEKSI" : "MENUNGGU"}</b>
                </li>

                <li>
                  <span className={revertStep >= 2 ? "check-dot red" : "check-dot"} />
                  <span>Validasi Aturan: require(status == Listed)</span>
                  <b>{revertStep >= 2 ? "DITOLAK KARENA SUDAH DIDANAI" : "MENUNGGU"}</b>
                </li>

                <li>
                  <span className={revertState === "reverted" ? "check-dot red" : "check-dot"} />
                  <span>Hasil: Transaksi Batal Otomatis (Revert)</span>
                  <b style={{ color: revertState === "reverted" ? "var(--cairin-red)" : "#666" }}>
                    {revertState === "reverted" ? "REVERTED (AMAN)" : "MENUNGGU"}
                  </b>
                </li>
              </ul>

              <div
                className={`revert-stamp-verdict ${
                  revertState === "reverted" ? "verdict-reverted" : "verdict-safe"
                }`}
              >
                {revertState === "reverted"
                  ? "TRANSAKSI GANDA DITOLAK: DANA AMAN 100% TANPA RISIKO"
                  : "KLIK TOMBOL DI SEBELAH KIRI UNTUK MELIHAT SIMULASI"}
              </div>
            </div>
          </div>
        </section>

        {/* 7. Bagian Tanya Jawab (FAQ) */}
        <section className="wrap info-section" id="faq">
          <div className="section-headline-box">
            <div>
              <div className="eyebrow-tag">
                <span className="eyebrow-bar" />
                <span>PERTANYAAN UMUM</span>
              </div>
              <h2 className="section-title">Semua yang Perlu Anda Ketahui</h2>
            </div>
          </div>

          <div className="faq-grid">
            <div className="faq-item">
              <button
                type="button"
                className="faq-question"
                onClick={() => setOpenFaq(openFaq === 0 ? null : 0)}
              >
                <span>Apakah CairIn merupakan pinjaman berbunga atau pinjol?</span>
                <span>{openFaq === 0 ? "−" : "+"}</span>
              </button>
              {openFaq === 0 && (
                <div className="faq-answer">
                  <strong>Sama sekali bukan.</strong> CairIn adalah platform anjak piutang (*invoice factoring*), yaitu jual beli hak tagih dengan potongan diskon yang disepakati di awal. Freelancer tidak memiliki kewajiban mencicil atau membayar bunga bulanan. Kewajiban membayar pelunasan tagihan 100% ada pada klien Anda saat tanggal jatuh tempo.
                </div>
              )}
            </div>

            <div className="faq-item">
              <button
                type="button"
                className="faq-question"
                onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
              >
                <span>Siapa yang membayar invoice saat tanggal jatuh tempo?</span>
                <span>{openFaq === 1 ? "−" : "+"}</span>
              </button>
              {openFaq === 1 && (
                <div className="faq-answer">
                  Klien (pemberi kerja Anda). Klien menyetorkan pelunasan tagihan penuh (100%) ke alamat smart contract CairIn. Smart contract kemudian secara instan menyalurkan dana tersebut kepada investor yang memegang NFT hak tagih Anda.
                </div>
              )}
            </div>

            <div className="faq-item">
              <button
                type="button"
                className="faq-question"
                onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
              >
                <span>Mengapa platform ini dibangun di jaringan Base Sepolia?</span>
                <span>{openFaq === 2 ? "−" : "+"}</span>
              </button>
              {openFaq === 2 && (
                <div className="faq-answer">
                  Base adalah jaringan Ethereum Layer-2 yang didukung oleh Coinbase. Biaya transaksi (gas fee) di Base sangat murah (kurang dari Rp100 per transaksi) dengan kecepatan konfirmasi hanya 1-2 detik, sehingga cocok untuk transaksi invoice mikro bagi pekerja lepas di Indonesia.
                </div>
              )}
            </div>

            <div className="faq-item">
              <button
                type="button"
                className="faq-question"
                onClick={() => setOpenFaq(openFaq === 3 ? null : 3)}
              >
                <span>Bagaimana jika klien belum menyetujui invoice?</span>
                <span>{openFaq === 3 ? "−" : "+"}</span>
              </button>
              {openFaq === 3 && (
                <div className="faq-answer">
                  Invoice yang baru dibuat berstatus <code>Draft</code>. Untuk melindungi investor dari tagihan palsu, invoice tidak dapat dipasarkan ke bursa pendanaan sampai klien Anda menandatangani persetujuan secara on-chain bahwa pekerjaan digital tersebut memang sah dan telah diselesaikan.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 8. Final CTA Banner to App Workspace */}
        <section className="wrap">
          <div className="cta-banner">
            <div>
              <h2>Siap Atasi Hambatan Arus Kas Anda?</h2>
              <p>
                Kelola buku piutang Anda, terbitkan invoice baru dalam hitungan detik, dan dapatkan pendanaan instan di Base Sepolia.
              </p>
            </div>
            <Link href="/app" className="btn-brutal btn-ink" style={{ whiteSpace: "nowrap" }}>
              <span>Masuk ke Workspace Aplikasi &rarr;</span>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="wrap">
        <div>&copy; 2026 CAIRIN — BASE SEPOLIA TESTNET</div>
        <div>ETHEREUM JAKARTA 2026 HACKATHON</div>
      </footer>
    </>
  );
}
