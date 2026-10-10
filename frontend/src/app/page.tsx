"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { useParallax } from "@/lib/useParallax";

export default function LandingPage() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  // Scroll and Cursor Parallax Hook
  const { scrollY, scrollProgress, mousePos } = useParallax();

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
      {/* 0. Top Scroll Progress Indicator */}
      <div
        className="scroll-progress-indicator"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />

      {/* 1. Monklabs-Style Architectural Grid Header */}
      <header className={`monk-header ${scrollY > 20 ? "scrolled" : ""}`}>
        {/* Left: Brand Cell with Geometric Monklabs-style Emblem */}
        <Link className="monk-brand-cell" href="/" aria-label="CashIn Beranda" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Cashin Logo"
            width={32}
            height={32}
            style={{ width: "32px", height: "32px", objectFit: "contain", flexShrink: 0 }}
          />
          <span
            className="cashin-brand-title"
            style={{ fontSize: "23px" }}
          >
            Cashin
          </span>
          <span className="monk-network-tag" style={{ marginLeft: "4px" }}>BASE L2</span>
        </Link>

        {/* Flexible Architectural Spacer */}
        <div className="monk-spacer" />

        {/* Right: Grid Cells separated by 1px hairline dividers */}
        <nav className="monk-nav-group" aria-label="Navigasi Utama">
          <a href="#cara-kerja" className="monk-nav-item">
            CARA KERJA
          </a>
          <a href="#manfaat" className="monk-nav-item">
            MANFAAT
          </a>
          <a href="#keamanan" className="monk-nav-item">
            KEAMANAN EVM
          </a>
          <a href="#faq" className="monk-nav-item">
            FAQ
          </a>

          {/* Wallet Action Cell */}
          {isConnected ? (
            <button
              type="button"
              className="monk-nav-item monk-wallet-btn"
              onClick={() => disconnect()}
              title="Klik untuk memutuskan dompet"
            >
              <span className="monk-dot-pulse" />
              <span>{formatShortAddress(address || "")}</span>
              <span className="monk-disconnect-pill">PUTUS</span>
            </button>
          ) : (
            <button
              type="button"
              className="monk-nav-item monk-wallet-btn"
              onClick={() => connect({ connector: injected() })}
            >
              <span>CONNECT WALLET</span>
            </button>
          )}

          {/* Launch App Cell with Monklabs Invert-on-hover */}
          <Link href="/app" className="monk-nav-item monk-cta-item">
            <span>BUKA APLIKASI</span>
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </nav>
      </header>

      <main style={{ position: "relative", overflow: "hidden" }}>
        {/* Ambient Parallax Orbs */}
        <div
          className="parallax-bg-orb orb-emerald"
          style={{ transform: `translate3d(0, ${scrollY * 0.22}px, 0)` }}
          aria-hidden="true"
        />
        <div
          className="parallax-bg-orb orb-orange"
          style={{ transform: `translate3d(0, ${scrollY * -0.15}px, 0)` }}
          aria-hidden="true"
        />
        <div
          className="parallax-bg-orb orb-purple"
          style={{ transform: `translate3d(0, ${scrollY * 0.12}px, 0)` }}
          aria-hidden="true"
        />

        {/* 2. Hero Section: Immersive Workspace Backdrop with Centered Content & Parallax Invoice */}
        <section className="hero-immersive-wrapper" id="hero-slip">
          {/* Layer 1: Full-Bleed Floating Invoices Photographic Artwork with Scroll Parallax */}
          <div
            className="hero-floating-invoices-bg-layer"
            style={{
              transform: `translate3d(${mousePos.x * 12}px, ${-scrollY * 0.42 + mousePos.y * 6}px, 0) scale(1.08)`,
            }}
            aria-hidden="true"
          />

          {/* Layer 2: Cinematic Vignette & Ambient Mesh Overlay */}
          <div className="hero-workspace-overlay" aria-hidden="true" />

          {/* Layer 3: Hero Centered Content in Front of the Invoices */}
          <div className="hero-centered-content">
            {/* The ONLY Kept Bubble: Hak Tagih RWA On-Chain */}
            <div
              className="floating-parallax-badge"
              style={{
                position: "relative",
                marginBottom: "20px",
                transform: `translate3d(${mousePos.x * 6}px, ${-scrollY * 0.18 + mousePos.y * 3}px, 0)`,
              }}
            >
              <span className="floating-badge-dot" />
              <span>HAK TAGIH RWA ON-CHAIN</span>
            </div>

            <div
              className="eyebrow-tag"
              style={{
                background: "rgba(16, 185, 129, 0.16)",
                borderColor: "rgba(52, 211, 153, 0.3)",
                color: "#34d399",
                marginBottom: "20px",
              }}
            >
              <span className="eyebrow-bar" style={{ background: "#34d399" }} />
              <span>BASE SEPOLIA TESTNET • RWA INVOICE PROTOCOL</span>
            </div>

            <h1 className="hero-statement-centered">
              Cairkan Invoice Freelance Lebih Cepat. <em>Ubah Piutang Jadi Kas Instan.</em>
            </h1>

            <p className="hero-description-centered">
              Freelancer sering menunggu 30–60 hari agar tagihan dibayar klien. Di CashIn,
              terbitkan invoice Anda sebagai bukti hak tagih digital (NFT ERC-721), dapatkan pencairan
              di muka dari investor dengan diskon wajar, dan biarkan klien melunasi saat jatuh tempo.
            </p>

            <div className="hero-actions-centered">
              <Link href="/app" className="btn-brutal btn-orange" style={{ boxShadow: "0 6px 24px rgba(234, 88, 12, 0.45)" }}>
                <span>Buka Aplikasi Kelola & Cairkan</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>

              <a
                className="btn-brutal btn-outline"
                href="#cara-kerja"
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  color: "#f8fafc",
                  borderColor: "rgba(255, 255, 255, 0.25)",
                }}
              >
                <span>Pelajari Cara Kerja</span>
                <span aria-hidden="true">&darr;</span>
              </a>
            </div>

            <div className="hero-meta-centered">
              <div className="hero-meta-item">
                <span style={{ color: "#34d399" }}>✓</span> Jaringan Base Sepolia L2
              </div>
              <div className="hero-meta-item">
                <span style={{ color: "#34d399" }}>✓</span> Standar ERC-721 & Mock USDC
              </div>
              <div className="hero-meta-item">
                <span style={{ color: "#34d399" }}>✓</span> Tanpa Bunga Pinjol
              </div>
            </div>
          </div>
        </section>

        {/* 3. Ticker Marquee */}
        <section className="marquee-ticker" aria-label="Ticker Informasi">
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

        {/* Landing Content Canvas (Raxon / App Style) */}
        <div className="landing-app-style-canvas">
          {/* 4. Bagian Edukasi: Cara Kerja CashIn (3 Langkah Sederhana) with Parallax Elevation */}
          <section className="wrap info-section" id="cara-kerja">
            <div className="section-headline-box">
              <div>
                <div className="eyebrow-tag">
                  <span className="eyebrow-bar" />
                  <span>ALUR TRANSAKSI</span>
                </div>
                <h2 className="section-title">Bagaimana Cara Kerja CashIn?</h2>
                <p className="section-subtitle">
                  Tiga langkah transparan tanpa perantara perbankan tradisional. Hak tagih terlindungi secara kriptografis.
                </p>
              </div>
            </div>

            <div className="steps-grid">
              <div
                className="step-card"
                style={{ transform: `translate3d(0, ${Math.sin(scrollY * 0.002) * 4}px, 0)` }}
              >
                <span className="step-number">01</span>
                <h3 className="step-title">Terbitkan Invoice Sebagai NFT</h3>
                <p className="step-desc">
                  Freelancer memasukkan rincian pekerjaan, alamat dompet klien, nominal tagihan, dan tanggal jatuh tempo.
                  Smart contract mencetak token NFT ERC-721 yang merepresentasikan hak tagih sah di blockchain Base.
                </p>
              </div>

              <div
                className="step-card"
                style={{ transform: `translate3d(0, ${Math.sin(scrollY * 0.002 + 1) * 6}px, 0)` }}
              >
                <span className="step-number">02</span>
                <h3 className="step-title">Klien Setujui & Investor Danai</h3>
                <p className="step-desc">
                  Klien memverifikasi bahwa pekerjaan valid. Freelancer menawarkan diskon wajar (misal 8%) ke bursa.
                  Investor mendanai tagihan, dan uang USDC langsung cair detik itu juga ke dompet freelancer.
                </p>
              </div>

              <div
                className="step-card"
                style={{ transform: `translate3d(0, ${Math.sin(scrollY * 0.002 + 2) * 5}px, 0)` }}
              >
                <span className="step-number">03</span>
                <h3 className="step-title">Pelunasan Otomatis Saat Tempo</h3>
                <p className="step-desc">
                  Saat tanggal jatuh tempo (misal 30 hari), klien melunasi tagihan 100% penuh.
                  Smart contract secara otomatis menyalurkan dana pelunasan kepada investor pemegang NFT.
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
                <p className="section-subtitle">
                  Ekosistem win-win solution: freelancer dapat kas cepat, investor dapat imbal hasil riil, dan klien tetap fleksibel.
                </p>
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
                <div className="eyebrow-tag" style={{ background: "rgba(255, 255, 255, 0.12)", color: "#fff", borderColor: "rgba(255, 255, 255, 0.2)" }}>
                  <span className="eyebrow-bar" />
                  <span>KEAMANAN SMART CONTRACT • BASE SEPOLIA</span>
                </div>

                <h2 className="battle-title">
                  Proteksi Piutang Ganda: Mengapa Transaksi di CashIn Mutlak Aman?
                </h2>

                <p className="battle-lede">
                  Pada bisnis anjak piutang konvensional di perbankan tradisional, penipuan terbesar adalah
                  <strong> satu faktur yang sama difotokopi dan dijual berulang kali ke beberapa pihak</strong>.
                  <br /><br />
                  Di CashIn, setiap tagihan diikat dalam <strong>NFT ERC-721 tunggal</strong> di Base Sepolia.
                  Smart contract menerapkan transisi status deterministik: begitu investor mendanai,
                  status seketika terkunci permanen. Jika ada pihak mana pun yang mencoba mendanai invoice yang sama,
                  mesin EVM otomatis menggagalkan transaksi (<em>revert</em>).
                </p>

                <button
                  type="button"
                  className="landing-security-action-btn"
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
                  <span
                    style={{
                      background: "#ecfdf5",
                      color: "#059669",
                      padding: "4px 10px",
                      borderRadius: "9999px",
                      fontSize: "10.5px",
                      fontFamily: "var(--mono)",
                      fontWeight: 800,
                      border: "1px solid #a7f3d0",
                    }}
                  >
                    EVM ATOMIC
                  </span>
                </div>

                <div style={{ padding: "16px 0 10px" }}>
                  <b style={{ fontSize: "19px", display: "block", fontWeight: 800 }}>
                    Kasus Uji: Invoice #INV-001
                  </b>
                  <span style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--ink-muted)" }}>
                    Status Saat Ini: Didanai (NFT dimiliki Investor Sah)
                  </span>
                </div>

                <ul className="revert-check-list">
                  <li>
                    <span className="check-dot" />
                    <span>Investor Sah Mendanai Tagihan</span>
                    <b style={{ color: "var(--cairin-emerald)", fontFamily: "var(--mono)", fontSize: "12px" }}>
                      SUKSES & TERKUNCI
                    </b>
                  </li>

                  <li>
                    <span className={revertStep >= 1 ? "check-dot" : "check-dot red"} />
                    <span>Upaya Pihak Lain Mencoba Mendanai Ulang</span>
                    <b style={{ fontFamily: "var(--mono)", fontSize: "12px" }}>
                      {revertStep >= 1 ? "TERDETEKSI" : "MENUNGGU"}
                    </b>
                  </li>

                  <li>
                    <span className={revertStep >= 2 ? "check-dot red" : "check-dot"} />
                    <span>Validasi Aturan: require(status == Listed)</span>
                    <b style={{ fontFamily: "var(--mono)", fontSize: "12px", color: revertStep >= 2 ? "var(--cairin-red)" : "inherit" }}>
                      {revertStep >= 2 ? "DITOLAK (SUDAH FINANCED)" : "MENUNGGU"}
                    </b>
                  </li>

                  <li>
                    <span className={revertState === "reverted" ? "check-dot red" : "check-dot"} />
                    <span>Hasil: Transaksi Batal Otomatis (Revert)</span>
                    <b style={{ color: revertState === "reverted" ? "var(--cairin-red)" : "var(--ink-muted)", fontFamily: "var(--mono)", fontSize: "12px" }}>
                      {revertState === "reverted" ? "REVERTED (DANA AMAN)" : "MENUNGGU"}
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
              <div className={`faq-item ${openFaq === 0 ? "is-open" : ""}`}>
                <button
                  type="button"
                  className="faq-question"
                  onClick={() => setOpenFaq(openFaq === 0 ? null : 0)}
                >
                  <span>Apakah CashIn merupakan pinjaman berbunga atau pinjol?</span>
                  <span className="faq-toggle-icon">{openFaq === 0 ? "−" : "+"}</span>
                </button>
                {openFaq === 0 && (
                  <div className="faq-answer">
                    <strong>Sama sekali bukan.</strong> CashIn adalah platform anjak piutang (<em>invoice factoring</em>), yaitu jual beli hak tagih dengan potongan diskon yang disepakati di awal. Freelancer tidak memiliki kewajiban mencicil atau membayar bunga bulanan. Kewajiban membayar pelunasan tagihan 100% ada pada klien Anda saat tanggal jatuh tempo.
                  </div>
                )}
              </div>

              <div className={`faq-item ${openFaq === 1 ? "is-open" : ""}`}>
                <button
                  type="button"
                  className="faq-question"
                  onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
                >
                  <span>Siapa yang membayar invoice saat tanggal jatuh tempo?</span>
                  <span className="faq-toggle-icon">{openFaq === 1 ? "−" : "+"}</span>
                </button>
                {openFaq === 1 && (
                  <div className="faq-answer">
                    Klien (pemberi kerja Anda). Klien menyetorkan pelunasan tagihan penuh (100%) ke alamat smart contract CashIn. Smart contract kemudian secara instan menyalurkan dana tersebut kepada investor yang memegang NFT hak tagih Anda.
                  </div>
                )}
              </div>

              <div className={`faq-item ${openFaq === 2 ? "is-open" : ""}`}>
                <button
                  type="button"
                  className="faq-question"
                  onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
                >
                  <span>Mengapa platform ini dibangun di jaringan Base Sepolia?</span>
                  <span className="faq-toggle-icon">{openFaq === 2 ? "−" : "+"}</span>
                </button>
                {openFaq === 2 && (
                  <div className="faq-answer">
                    Base adalah jaringan Ethereum Layer-2 yang didukung oleh Coinbase. Biaya transaksi (gas fee) di Base sangat murah (kurang dari Rp100 per transaksi) dengan kecepatan konfirmasi hanya 1-2 detik, sehingga cocok untuk transaksi invoice mikro bagi pekerja lepas di Indonesia.
                  </div>
                )}
              </div>

              <div className={`faq-item ${openFaq === 3 ? "is-open" : ""}`}>
                <button
                  type="button"
                  className="faq-question"
                  onClick={() => setOpenFaq(openFaq === 3 ? null : 3)}
                >
                  <span>Bagaimana jika klien belum menyetujui invoice?</span>
                  <span className="faq-toggle-icon">{openFaq === 3 ? "−" : "+"}</span>
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
              <Link href="/app" className="landing-cta-btn-white">
                <span>Masuk ke Workspace Aplikasi</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="wrap">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Cashin Logo" width={22} height={22} style={{ width: "22px", height: "22px", objectFit: "contain" }} />
          <span className="cashin-brand-title" style={{ fontSize: "16px" }}>Cashin</span>
          <span style={{ color: "var(--ink-muted)", fontSize: "12px", marginLeft: "4px" }}>&copy; 2026 — BASE SEPOLIA TESTNET</span>
        </div>
        <div>ETHEREUM JAKARTA 2026 HACKATHON</div>
      </footer>
    </>
  );
}
