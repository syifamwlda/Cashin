"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function PitchDeckPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 5;

  // 3-Minute Presentation Timer helper for hackathon pitch rehearsal
  const [timerSeconds, setTimerSeconds] = useState(180); // 3 minutes = 180s
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds]);

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(180);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const nextSlide = () => {
    if (currentSlide < totalSlides - 1) setCurrentSlide((prev) => prev + 1);
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide((prev) => prev - 1);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        nextSlide();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        prevSlide();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide]);

  const cardStyle = {
    background: "#FFFFFF",
    border: "2px solid #111827",
    boxShadow: "4px 4px 0 #111827",
    padding: "16px 18px",
    color: "#111827",
  };

  const btnStyle = {
    padding: "8px 14px",
    background: "#FFFFFF",
    border: "1.5px solid #111827",
    boxShadow: "2px 2px 0 #111827",
    fontFamily: "var(--mono, monospace)",
    fontSize: "12px",
    fontWeight: 700,
    color: "#111827",
    cursor: "pointer",
  };

  const footerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "12px",
    borderTop: "1.5px dashed rgba(17, 24, 39, 0.25)",
    fontFamily: "var(--mono, monospace)",
    fontSize: "11px",
    fontWeight: 700,
    color: "#4B5563",
  };

  return (
    <div style={{ backgroundColor: "#18181b", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 16px", fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)" }}>

      {/* Scoped CSS using standard dangerouslySetInnerHTML for SSR/Vercel compatibility */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .pitch-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .pitch-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .pitch-grid-custom-4 { display: grid; grid-template-columns: 1.25fr 0.95fr; gap: 16px; }
        .pitch-table { width: 100%; border-collapse: collapse; border: 2px solid #111827; background: #FFFFFF; font-size: 12.5px; }
        .pitch-table th, .pitch-table td { border: 1.5px solid #111827; padding: 8px 12px; text-align: left; color: #111827; }
        .pitch-table th { background: #EFECE6; font-family: var(--mono, monospace); font-weight: 800; font-size: 11px; text-transform: uppercase; }
        @media print {
          body { background: transparent !important; padding: 0 !important; }
          .deck-toolbar-container { display: none !important; }
          .deck-stage-container { border: none !important; box-shadow: none !important; width: 100% !important; height: auto !important; }
        }
      `}} />

      {/* Deck Controls Toolbar */}
      <header className="deck-toolbar-container" style={{ width: "min(1100px, 100%)", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "10px", background: "#FAF7F0", border: "2px solid #111827", boxShadow: "5px 5px 0 #111827", padding: "10px 18px", marginBottom: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: 900, fontSize: "16px", color: "#111827" }}>
          <Link href="/" style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#0d9227", fontFamily: "var(--sans)", fontWeight: 900, fontSize: "20px" }}>CashIn</span>
            <span style={{ fontSize: "12px", color: "#4B5563", fontWeight: 800 }}>3-MIN PITCH DECK</span>
          </Link>
          <span style={{ background: "#EA580C", color: "#FFFFFF", fontSize: "11px", padding: "2px 7px", fontFamily: "var(--mono, monospace)", fontWeight: 800, borderRadius: "2px" }}>
            3 MENIT
          </span>
          <span style={{ background: "#111827", color: "#FAF7F0", fontSize: "11px", padding: "2px 7px", fontFamily: "var(--mono, monospace)", fontWeight: 700, borderRadius: "2px" }}>
            BASE SEPOLIA
          </span>
        </div>

        {/* 3-Minute Rehearsal Timer */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#FFFFFF", border: "1.5px solid #111827", padding: "4px 10px", borderRadius: "3px" }}>
          <span style={{ fontFamily: "var(--mono, monospace)", fontSize: "13px", fontWeight: 900, color: timerSeconds < 30 ? "#DC2626" : timerSeconds < 60 ? "#D97706" : "#111827" }}>
            ⏱️ {formatTimer(timerSeconds)}
          </span>
          <button style={{ ...btnStyle, padding: "3px 8px", fontSize: "11px", background: isTimerRunning ? "#FED7AA" : "#D9F99D" }} onClick={toggleTimer}>
            {isTimerRunning ? "Pause" : "Start"}
          </button>
          <button style={{ ...btnStyle, padding: "3px 8px", fontSize: "11px" }} onClick={resetTimer}>
            Reset
          </button>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--mono, monospace)", fontSize: "13px", fontWeight: 800, color: "#111827", marginRight: "4px" }}>
            Slide {currentSlide + 1} / {totalSlides}
          </span>
          <button style={btnStyle} onClick={prevSlide}>
            &larr; Prev
          </button>
          <button style={btnStyle} onClick={nextSlide}>
            Next &rarr;
          </button>
          <button style={{ ...btnStyle, background: "#D9F99D" }} onClick={() => window.print()}>
            🖨️ Simpan PDF
          </button>
        </div>
      </header>

      {/* Presentation Stage (16:9 Aspect Ratio) */}
      <main className="deck-stage-container" style={{ width: "min(1100px, 100%)", aspectRatio: "16 / 9", minHeight: "590px", background: "#FCFAF5", border: "3px solid #111827", boxShadow: "12px 12px 0 rgba(0, 0, 0, 0.75)", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>

        {/* SLIDE 1: COVER & VALUE PROPOSITION */}
        {currentSlide === 0 && (
          <div style={{ display: "flex", width: "100%", height: "100%", padding: "36px 44px", flexDirection: "column", justifyContent: "space-between", color: "#111827", background: "#FCFAF5" }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#FFEDD5", border: "1.5px solid #EA580C", padding: "4px 10px", marginBottom: "12px" }}>
                <span style={{ fontFamily: "var(--mono, monospace)", fontSize: "11px", fontWeight: 800, color: "#C2410C", letterSpacing: "0.06em" }}>
                  ETHEREUM JAKARTA HACKATHON 2026 • RWA PROTOCOL
                </span>
              </div>
              <h1 style={{ fontSize: "clamp(48px, 5.5vw, 68px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: "12px", color: "#0d9227" }}>
                CashIn
              </h1>
              <p style={{ fontSize: "22px", fontWeight: 800, color: "#111827", marginBottom: "12px" }}>
                Cairkan Invoice Freelance Lebih Cepat. <span style={{ background: "#D9F99D", padding: "0 6px" }}>Ubah Piutang Jadi Kas Instan.</span>
              </p>
              <p style={{ fontSize: "14.5px", color: "#374151", maxWidth: "760px", lineHeight: 1.55 }}>
                Protokol Micro-Invoice Factoring (RWA) berbasis NFT ERC-721 di Base Sepolia. Memberikan modal kerja instan bagi pekerja lepas tanpa utang pinjol dan bebas risiko faktur ganda perbankan tradisional.
              </p>
            </div>

            <div className="pitch-grid-3" style={{ margin: "14px 0" }}>
              <div style={{ ...cardStyle, background: "#D9F99D" }}>
                <div style={{ fontFamily: "var(--mono, monospace)", fontSize: "10.5px", fontWeight: 800, color: "#166534" }}>TARGET PENGGUNA</div>
                <b style={{ fontSize: "15px", display: "block", marginTop: "4px" }}>Pekerja Lepas & Agensi Digital</b>
                <p style={{ fontSize: "12px", color: "#14532D", margin: "4px 0 0" }}>Talenta kreatif, dev, & konsultan terhambat cashflow.</p>
              </div>
              <div style={{ ...cardStyle, background: "#D1FAE5" }}>
                <div style={{ fontFamily: "var(--mono, monospace)", fontSize: "10.5px", fontWeight: 800, color: "#065F46" }}>INSTRUMEN RWA</div>
                <b style={{ fontSize: "15px", display: "block", marginTop: "4px" }}>NFT ERC-721 + USDC Settlement</b>
                <p style={{ fontSize: "12px", color: "#064E3B", margin: "4px 0 0" }}>Hak tagih legal on-chain, likuid & terverifikasi.</p>
              </div>
              <div style={{ ...cardStyle, background: "#DBEAFE" }}>
                <div style={{ fontFamily: "var(--mono, monospace)", fontSize: "10.5px", fontWeight: 800, color: "#1E40AF" }}>JARINGAN BLOCKCHAIN</div>
                <b style={{ fontSize: "15px", display: "block", marginTop: "4px" }}>Base Sepolia (Ethereum L2)</b>
                <p style={{ fontSize: "12px", color: "#1E3A8A", margin: "4px 0 0" }}>Gas fee &lt; Rp100, ideal untuk tiket invoice mikro.</p>
              </div>
            </div>

            <div style={footerStyle}>
              <span>Tim: Syifa Maulida (Product Lead) & Sultan Saladin (Smart Contract)</span>
              <span>Slide 1 / 5 (Waktu Target: 0:00 - 0:25)</span>
            </div>
          </div>
        )}

        {/* SLIDE 2: THE PROBLEM */}
        {currentSlide === 1 && (
          <div style={{ display: "flex", width: "100%", height: "100%", padding: "36px 44px", flexDirection: "column", justifyContent: "space-between", color: "#111827", background: "#FCFAF5" }}>
            <div>
              <div style={{ fontFamily: "var(--mono, monospace)", fontSize: "11px", fontWeight: 800, color: "#EA580C", marginBottom: "4px" }}>
                LATAR BELAKANG MASALAH
              </div>
              <h2 style={{ fontSize: "30px", fontWeight: 900, letterSpacing: "-0.03em" }}>
                Krisis Arus Kas 30–90 Hari <span style={{ background: "#D9F99D", padding: "0 4px" }}>Pekerja Lepas</span>
              </h2>
            </div>

            <div className="pitch-grid-2" style={{ margin: "auto 0" }}>
              <div style={{ ...cardStyle, borderLeft: "6px solid #EF4444" }}>
                <b style={{ fontSize: "15px", display: "block", marginBottom: "5px" }}>⏳ Termin Pembayaran Lama (Net 30–90)</b>
                <p style={{ fontSize: "13px", color: "#4B5563", lineHeight: 1.5 }}>
                  Pekerjaan tuntas hari ini, namun klien korporasi baru membayar 1 hingga 3 bulan kemudian. Arus kas freelancer macet total untuk biaya hidup operasional harian.
                </p>
              </div>

              <div style={{ ...cardStyle, borderLeft: "6px solid #EF4444" }}>
                <b style={{ fontSize: "15px", display: "block", marginBottom: "5px" }}>🏦 Ditolak Perbankan Konvensional</b>
                <p style={{ fontSize: "13px", color: "#4B5563", lineHeight: 1.5 }}>
                  Bank menolak anjak piutang mikro karena ketiadaan sertifikat agunan tanah/properti dan nominal tiket ($200–$2.000) dinilai terlalu kecil & membebani admin bank.
                </p>
              </div>

              <div style={{ ...cardStyle, borderLeft: "6px solid #EF4444" }}>
                <b style={{ fontSize: "15px", display: "block", marginBottom: "5px" }}>⚠️ Terjerat Pinjol Bunga Mencekik</b>
                <p style={{ fontSize: "13px", color: "#4B5563", lineHeight: 1.5 }}>
                  Demi bertahan hidup menunggu invoice cair, freelancer terpaksa menggunakan pinjol konsumtif berbunga 20–30% per bulan yang memperburuk kondisi keuangan.
                </p>
              </div>

              <div style={{ ...cardStyle, borderLeft: "6px solid #EF4444" }}>
                <b style={{ fontSize: "15px", display: "block", marginBottom: "5px" }}>🛑 Risiko Faktur Ganda di TradFi</b>
                <p style={{ fontSize: "13px", color: "#4B5563", lineHeight: 1.5 }}>
                  Pada factoring tradisional, celah terbesar adalah <i>double financing</i>: satu invoice fisik difotokopi dan dijual berulang kali ke beberapa pemodal berbeda secara curang.
                </p>
              </div>
            </div>

            <div style={footerStyle}>
              <span>CashIn Pitch Deck • Masalah Arus Kas & TradFi Gap</span>
              <span>Slide 2 / 5 (Waktu Target: 0:25 - 0:55)</span>
            </div>
          </div>
        )}

        {/* SLIDE 3: SOLUTION & HOW IT WORKS + SECURITY */}
        {currentSlide === 2 && (
          <div style={{ display: "flex", width: "100%", height: "100%", padding: "36px 44px", flexDirection: "column", justifyContent: "space-between", color: "#111827", background: "#FCFAF5" }}>
            <div>
              <div style={{ fontFamily: "var(--mono, monospace)", fontSize: "11px", fontWeight: 800, color: "#EA580C", marginBottom: "4px" }}>
                SOLUSI & CARA KERJA PROTOKOL
              </div>
              <h2 style={{ fontSize: "30px", fontWeight: 900, letterSpacing: "-0.03em" }}>
                Anjak Piutang On-Chain dengan <span style={{ background: "#D9F99D", padding: "0 4px" }}>Atomic State Guard</span>
              </h2>
            </div>

            <div className="pitch-grid-2" style={{ margin: "auto 0", alignItems: "stretch" }}>
              {/* Kolom Kiri: 3 Langkah Alur */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ ...cardStyle, padding: "12px 14px", display: "flex", gap: "14px", alignItems: "center" }}>
                  <div style={{ fontFamily: "var(--mono, monospace)", fontSize: "22px", fontWeight: 900, color: "#EA580C" }}>01</div>
                  <div>
                    <b style={{ fontSize: "13.5px" }}>Tokenisasi NFT Hak Tagih (ERC-721)</b>
                    <p style={{ fontSize: "12px", color: "#4B5563", margin: "2px 0 0" }}>Invoice disahkan klien, dicetak jadi token NFT unik di Base Sepolia (Status: <code>Disetujui</code>).</p>
                  </div>
                </div>

                <div style={{ ...cardStyle, padding: "12px 14px", display: "flex", gap: "14px", alignItems: "center" }}>
                  <div style={{ fontFamily: "var(--mono, monospace)", fontSize: "22px", fontWeight: 900, color: "#059669" }}>02</div>
                  <div>
                    <b style={{ fontSize: "13.5px" }}>Likuiditas Instan di Bursa (Jual Diskon)</b>
                    <p style={{ fontSize: "12px", color: "#4B5563", margin: "2px 0 0" }}>Dijual dengan diskon wajar (misal 8%). Investor setor USDC, dana detik itu juga cair ke freelancer (<code>Didanai</code>).</p>
                  </div>
                </div>

                <div style={{ ...cardStyle, padding: "12px 14px", display: "flex", gap: "14px", alignItems: "center" }}>
                  <div style={{ fontFamily: "var(--mono, monospace)", fontSize: "22px", fontWeight: 900, color: "#1E40AF" }}>03</div>
                  <div>
                    <b style={{ fontSize: "13.5px" }}>Settlement Otomatis Saat Jatuh Tempo</b>
                    <p style={{ fontSize: "12px", color: "#4B5563", margin: "2px 0 0" }}>Klien bayar 100% langsung ke kontrak. Dana diteruskan ke investor pemegang NFT (<code>Lunas</code>).</p>
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Inovasi Atomic Guard */}
              <div style={{ ...cardStyle, background: "#F0FDF4", borderColor: "#059669", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "inline-block", background: "#D1FAE5", border: "1px solid #059669", padding: "2px 8px", fontSize: "10.5px", fontWeight: 800, color: "#065F46", fontFamily: "var(--mono, monospace)", marginBottom: "8px" }}>
                    🔒 INOVASI KEAMANAN EVM
                  </div>
                  <h3 style={{ fontSize: "16px", fontWeight: 900, color: "#065F46", marginBottom: "6px" }}>
                    100% Anti-Double Financing Guarantee
                  </h3>
                  <p style={{ fontSize: "12.5px", color: "#1F2937", lineHeight: 1.5, marginBottom: "10px" }}>
                    Fungsi <code>buyInvoice</code> pada smart contract CashIn memvalidasi status secara mutlak:
                  </p>
                  <code style={{ display: "block", fontFamily: "var(--mono, monospace)", background: "#FFFFFF", border: "1.5px solid #059669", padding: "6px 10px", fontSize: "11.5px", fontWeight: 700, color: "#065F46", borderRadius: "3px", marginBottom: "10px" }}>
                    require(inv.status == InvoiceStatus.Listed);
                  </code>
                  <p style={{ fontSize: "12px", color: "#374151", lineHeight: 1.5 }}>
                    Begitu investor pertama mendanai, status bertransisi atomik ke <code>Financed</code>. Upaya pendanaan ulang seketika di-<b>revert</b> otomatis oleh EVM tanpa celah kelalaian manual TradFi.
                  </p>
                </div>

                <div style={{ background: "#FFFFFF", border: "1px solid #111827", padding: "6px 10px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", fontWeight: 800, fontFamily: "var(--mono, monospace)" }}>
                  <span>Draft</span> &rarr; <span>Disetujui</span> &rarr; <span>Di Bursa</span> &rarr; <span style={{ color: "#059669" }}>Didanai</span> &rarr; <span>Lunas</span>
                </div>
              </div>
            </div>

            <div style={footerStyle}>
              <span>CashIn Pitch Deck • Alur Transaksi & Proteksi On-Chain</span>
              <span>Slide 3 / 5 (Waktu Target: 0:55 - 1:45)</span>
            </div>
          </div>
        )}

        {/* SLIDE 4: COMPETITIVE ADVANTAGE & BUSINESS MODEL */}
        {currentSlide === 3 && (
          <div style={{ display: "flex", width: "100%", height: "100%", padding: "36px 44px", flexDirection: "column", justifyContent: "space-between", color: "#111827", background: "#FCFAF5" }}>
            <div>
              <div style={{ fontFamily: "var(--mono, monospace)", fontSize: "11px", fontWeight: 800, color: "#EA580C", marginBottom: "4px" }}>
                KEUNGGULAN KOMPETITIF & MODEL BISNIS
              </div>
              <h2 style={{ fontSize: "30px", fontWeight: 900, letterSpacing: "-0.03em" }}>
                Mengapa CashIn Unggul & <span style={{ background: "#D9F99D", padding: "0 4px" }}>Model Monetisasinya</span>
              </h2>
            </div>

            <div className="pitch-grid-custom-4" style={{ margin: "auto 0", alignItems: "stretch" }}>
              {/* Kolom Kiri: Tabel Komparasi */}
              <div>
                <table className="pitch-table">
                  <thead>
                    <tr>
                      <th>Fitur / Parameter</th>
                      <th>Pinjol / TradFi</th>
                      <th style={{ background: "#D9F99D" }}>CashIn (RWA Base)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><b>Waktu Pencairan</b></td>
                      <td>3–14 hari kerja</td>
                      <td style={{ background: "#F4F9D8" }}><b>Detik itu juga (On-chain)</b></td>
                    </tr>
                    <tr>
                      <td><b>Struktur Finansial</b></td>
                      <td>Utang bunga majemuk (20-30%)</td>
                      <td style={{ background: "#F4F9D8" }}><b>Jual diskon (Bukan utang)</b></td>
                    </tr>
                    <tr>
                      <td><b>Agunan Fisik</b></td>
                      <td>Wajib tanah/akses kontak</td>
                      <td style={{ background: "#F4F9D8" }}><b>Tanpa agunan (NFT hak tagih)</b></td>
                    </tr>
                    <tr>
                      <td><b>Anti-Double Factoring</b></td>
                      <td>Verifikasi manual rawan lolos</td>
                      <td style={{ background: "#F4F9D8" }}><b>Terkunci Kriptografis EVM</b></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Kolom Kanan: Business Model & Market Size */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ ...cardStyle, background: "#FFFFFF", padding: "12px 14px" }}>
                  <div style={{ fontFamily: "var(--mono, monospace)", fontSize: "10.5px", fontWeight: 800, color: "#EA580C" }}>MODEL BISNIS PROTOKOL</div>
                  <b style={{ fontSize: "13.5px", display: "block", marginTop: "3px" }}>Fee Transaksi Berkelanjutan</b>
                  <p style={{ fontSize: "12px", color: "#4B5563", margin: "3px 0 0", lineHeight: 1.45 }}>
                    • <b>0.5% – 1%</b> fee pencairan dipotong otomatis saat invoice didanai.<br />
                    • <b>0.25%</b> fee administrasi saat settlement pelunasan klien.
                  </p>
                </div>

                <div style={{ ...cardStyle, background: "#D9F99D", padding: "12px 14px" }}>
                  <div style={{ fontFamily: "var(--mono, monospace)", fontSize: "10.5px", fontWeight: 800, color: "#166534" }}>PELUANG PASAR MASIF</div>
                  <b style={{ fontSize: "13.5px", display: "block", marginTop: "3px" }}>140M+ Pekerja Gig & $16T RWA</b>
                  <p style={{ fontSize: "12px", color: "#14532D", margin: "3px 0 0", lineHeight: 1.45 }}>
                    Pasar gig ASEAN terus membesar. Gas fee &lt; $0.001 di Base memungkinkan pembiayaan invoice bernilai mikro ($100–$2.000).
                  </p>
                </div>
              </div>
            </div>

            <div style={footerStyle}>
              <span>CashIn Pitch Deck • Keunggulan Kompetitif & Unit Economics</span>
              <span>Slide 4 / 5 (Waktu Target: 1:45 - 2:25)</span>
            </div>
          </div>
        )}

        {/* SLIDE 5: TRACTION, TEAM & ROADMAP */}
        {currentSlide === 4 && (
          <div style={{ display: "flex", width: "100%", height: "100%", padding: "36px 44px", flexDirection: "column", justifyContent: "space-between", color: "#111827", background: "#FCFAF5" }}>
            <div>
              <div style={{ fontFamily: "var(--mono, monospace)", fontSize: "11px", fontWeight: 800, color: "#EA580C", marginBottom: "4px" }}>
                TRAKSI, TIM & PETA JALAN
              </div>
              <h2 style={{ fontSize: "30px", fontWeight: 900, letterSpacing: "-0.03em" }}>
                Live di Base Sepolia & <span style={{ background: "#D9F99D", padding: "0 4px" }}>Siap Melangkah Maju</span>
              </h2>
            </div>

            <div className="pitch-grid-2" style={{ margin: "auto 0", alignItems: "stretch" }}>
              {/* Kolom Kiri: Live Contracts & Tech Stack */}
              <div style={{ ...cardStyle, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#D1FAE5", border: "1px solid #059669", padding: "2px 8px", fontSize: "10.5px", fontWeight: 800, color: "#065F46", fontFamily: "var(--mono, monospace)", marginBottom: "8px" }}>
                    🟢 LIVE DEPLOYED ON BASE SEPOLIA
                  </div>
                  <div style={{ fontSize: "12px", color: "#1F2937", lineHeight: 1.6, marginBottom: "8px" }}>
                    <div>• <b>CairIn Protocol:</b> <code style={{ fontFamily: "var(--mono, monospace)", background: "#F3F4F6", padding: "1px 4px" }}>0xf436e...357a</code></div>
                    <div>• <b>MockUSDC Token:</b> <code style={{ fontFamily: "var(--mono, monospace)", background: "#F3F4F6", padding: "1px 4px" }}>0x7715C...76DD</code></div>
                  </div>
                </div>

                <div style={{ background: "#F9FAFB", border: "1.5px solid #111827", padding: "10px 12px" }}>
                  <b style={{ fontSize: "12.5px", display: "block", marginBottom: "4px" }}>🛠️ Modern Web3 Tech Stack</b>
                  <div style={{ fontSize: "11.5px", color: "#4B5563", lineHeight: 1.5 }}>
                    Solidity 0.8.28 • OpenZeppelin ERC-721/20 • Hardhat 3 Tooling • Next.js 16 (App Router) • Wagmi v2 & Viem • Production Live di Vercel.
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Tim & Roadmap */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ ...cardStyle, padding: "12px 14px" }}>
                  <div style={{ fontFamily: "var(--mono, monospace)", fontSize: "10.5px", fontWeight: 800, color: "#EA580C" }}>TIM PENGEMBANG</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
                    <div>
                      <b style={{ fontSize: "13px" }}>Syifa Maulida</b>
                      <span style={{ fontSize: "11.5px", color: "#4B5563" }}> — Product Lead & Frontend Developer (Web3 UX & Product Design)</span>
                    </div>
                    <div>
                      <b style={{ fontSize: "13px" }}>Sultan Saladin Pahlevi</b>
                      <span style={{ fontSize: "11.5px", color: "#4B5563" }}> — Smart Contract & Protocol Engineer (Solidity & EVM Security)</span>
                    </div>
                  </div>
                </div>

                <div style={{ ...cardStyle, background: "#FAF7F0", padding: "12px 14px" }}>
                  <div style={{ fontFamily: "var(--mono, monospace)", fontSize: "10.5px", fontWeight: 800, color: "#1E40AF" }}>PETA JALAN EKSEKUSI</div>
                  <div style={{ fontSize: "11.5px", color: "#374151", lineHeight: 1.55, marginTop: "4px" }}>
                    • <b>Q4 2026:</b> Hackathon MVP & Validasi Smart Contract Base Sepolia.<br />
                    • <b>Q1 2027:</b> Account Abstraction (ERC-4337) login email/Google & Gasless.<br />
                    • <b>Q2 2027:</b> Audit keamanan eksternal & peluncuran Base Mainnet.<br />
                    • <b>Q3 2027:</b> On-ramp IDR langsung ke USDC & integrasi platform gig lokal.
                  </div>
                </div>
              </div>
            </div>

            <div style={footerStyle}>
              <span>CashIn — Build The Real World Onchain • Terima Kasih!</span>
              <span>Slide 5 / 5 (Waktu Target: 2:25 - 3:00)</span>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
