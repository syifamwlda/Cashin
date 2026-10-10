"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function PitchDeckPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 10;

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

  return (
    <div style={{ backgroundColor: "#18181b", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px", fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)" }}>
      
      {/* Scoped CSS to ensure 100% pixel-perfect styling regardless of globals.css */}
      <style jsx global>{`
        .deck-toolbar-box {
          width: min(1080px, 100%);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #FAF7F0;
          border: 2px solid #111827;
          box-shadow: 5px 5px 0 #111827;
          padding: 12px 20px;
          margin-bottom: 16px;
        }
        .deck-stage-box {
          width: min(1080px, 100%);
          aspect-ratio: 16 / 9;
          min-height: 580px;
          background: #FCFAF5;
          border: 3px solid #111827;
          box-shadow: 12px 12px 0 rgba(0, 0, 0, 0.75);
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .pitch-slide {
          display: flex;
          width: 100%;
          height: 100%;
          padding: 40px 48px;
          flex-direction: column;
          justify-content: space-between;
          color: #111827;
        }
        .pitch-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .pitch-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .pitch-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        .pitch-card {
          background: #FFFFFF;
          border: 2px solid #111827;
          box-shadow: 4px 4px 0 #111827;
          padding: 18px 20px;
          color: #111827;
        }
        .pitch-table {
          width: 100%;
          border-collapse: collapse;
          border: 2px solid #111827;
          background: #FFFFFF;
          font-size: 13px;
        }
        .pitch-table th, .pitch-table td {
          border: 1.5px solid #111827;
          padding: 10px 14px;
          text-align: left;
          color: #111827;
        }
        .pitch-table th {
          background: #EFECE6;
          font-family: var(--mono, monospace);
          font-weight: 800;
          font-size: 11px;
          text-transform: uppercase;
        }
        .pitch-btn {
          padding: 8px 16px;
          background: #FFFFFF;
          border: 1.5px solid #111827;
          box-shadow: 2px 2px 0 #111827;
          font-family: var(--mono, monospace);
          font-size: 12px;
          font-weight: 700;
          color: #111827;
          cursor: pointer;
          transition: all 0.1s;
        }
        .pitch-btn:hover {
          transform: translate(1px, 1px);
          box-shadow: 1px 1px 0 #111827;
        }
        .pitch-btn.primary {
          background: #D9F99D;
        }
        .pitch-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 14px;
          border-top: 1.5px dashed rgba(17, 24, 39, 0.25);
          font-family: var(--mono, monospace);
          font-size: 11.5px;
          font-weight: 700;
          color: #4B5563;
        }
        @media print {
          body {
            background: transparent !important;
            padding: 0 !important;
          }
          .deck-toolbar-box {
            display: none !important;
          }
          .deck-stage-box {
            border: none !important;
            box-shadow: none !important;
            width: 100% !important;
            height: auto !important;
          }
        }
      `}</style>

      {/* Deck Controls Toolbar */}
      <header className="deck-toolbar-box">
        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: 900, fontSize: "16px", color: "#111827" }}>
          <Link href="/" style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#0d9227", fontFamily: "var(--sans)", fontWeight: 900, fontSize: "20px" }}>CashIn</span>
            <span style={{ fontSize: "13px", color: "#4B5563", fontWeight: 700 }}>SLIDE DECK</span>
          </Link>
          <span style={{ background: "#111827", color: "#FAF7F0", fontSize: "11px", padding: "2px 8px", fontFamily: "var(--mono, monospace)", fontWeight: 700, borderRadius: "2px" }}>
            BASE SEPOLIA
          </span>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--mono, monospace)", fontSize: "13px", fontWeight: 800, color: "#111827", marginRight: "6px" }}>
            Slide {currentSlide + 1} / {totalSlides}
          </span>
          <button className="pitch-btn" onClick={prevSlide}>
            &larr; Prev
          </button>
          <button className="pitch-btn" onClick={nextSlide}>
            Next &rarr;
          </button>
          <button className="pitch-btn primary" onClick={() => window.print()}>
            🖨️ Cetak / Simpan PDF
          </button>
        </div>
      </header>

      {/* Presentation Stage (16:9 Aspect Ratio) */}
      <main className="deck-stage-box">
        
        {/* SLIDE 1: COVER */}
        {currentSlide === 0 && (
          <div className="pitch-slide">
            <div>
              <div style={{ fontFamily: "var(--mono, monospace)", fontSize: "11px", fontWeight: 800, textTransform: "uppercase", color: "#EA580C", letterSpacing: "0.08em", marginBottom: "8px" }}>
                ETHEREUM JAKARTA HACKATHON 2026 • RWA PROTOCOL
              </div>
              <h1 style={{ fontSize: "clamp(46px, 5.5vw, 68px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: "14px", color: "#0d9227" }}>
                CashIn
              </h1>
              <p style={{ fontSize: "22px", fontWeight: 800, color: "#111827", marginBottom: "16px" }}>
                Cairkan Invoice Freelance Lebih Cepat. <span style={{ background: "#D9F99D", padding: "0 6px" }}>Ubah Piutang Jadi Kas Instan.</span>
              </p>
              <p style={{ fontSize: "15px", color: "#374151", maxWidth: "720px", lineHeight: 1.55 }}>
                Platform anjak piutang mikro (RWA Invoice Factoring) berbasis NFT ERC-721 di jaringan Base Sepolia. Memberikan modal kerja instan tanpa utang pinjol.
              </p>
            </div>

            <div className="pitch-grid-3" style={{ margin: "16px 0" }}>
              <div className="pitch-card" style={{ background: "#D9F99D" }}>
                <div style={{ fontFamily: "var(--mono, monospace)", fontSize: "11px", fontWeight: 800, color: "#166534" }}>TARGET PENGGUNA</div>
                <b style={{ fontSize: "15px", display: "block", marginTop: "4px" }}>Pekerja Lepas & Agensi Digital</b>
              </div>
              <div className="pitch-card" style={{ background: "#D1FAE5" }}>
                <div style={{ fontFamily: "var(--mono, monospace)", fontSize: "11px", fontWeight: 800, color: "#065F46" }}>INSTRUMEN RWA</div>
                <b style={{ fontSize: "15px", display: "block", marginTop: "4px" }}>NFT ERC-721 + Settlement USDC</b>
              </div>
              <div className="pitch-card" style={{ background: "#DBEAFE" }}>
                <div style={{ fontFamily: "var(--mono, monospace)", fontSize: "11px", fontWeight: 800, color: "#1E40AF" }}>JARINGAN BLOCKCHAIN</div>
                <b style={{ fontSize: "15px", display: "block", marginTop: "4px" }}>Base Sepolia (Ethereum L2)</b>
              </div>
            </div>

            <div className="pitch-footer">
              <span>Tim: Syifa Maulida (Product Lead) & Sultan Saladin (Smart Contract)</span>
              <span>cashin-syifamwldas-projects.vercel.app</span>
            </div>
          </div>
        )}

        {/* SLIDE 2: THE PROBLEM */}
        {currentSlide === 1 && (
          <div className="pitch-slide">
            <div>
              <div style={{ fontFamily: "var(--mono, monospace)", fontSize: "11px", fontWeight: 800, color: "#EA580C", marginBottom: "6px" }}>
                LATAR BELAKANG MASALAH
              </div>
              <h2 style={{ fontSize: "32px", fontWeight: 900, letterSpacing: "-0.03em" }}>
                Krisis Arus Kas 30–90 Hari <span style={{ background: "#D9F99D", padding: "0 4px" }}>Pekerja Lepas</span>
              </h2>
            </div>

            <div className="pitch-grid-2" style={{ margin: "auto 0" }}>
              <div className="pitch-card" style={{ borderLeft: "6px solid #EF4444" }}>
                <b style={{ fontSize: "15px", display: "block", marginBottom: "6px" }}>⏳ Termin Pembayaran Lama (Net 30-90)</b>
                <p style={{ fontSize: "13px", color: "#4B5563", lineHeight: 1.5 }}>
                  Pekerjaan selesai hari ini, namun klien baru membayar 1 hingga 3 bulan kemudian. Arus kas freelancer macet untuk kebutuhan hidup bulanan.
                </p>
              </div>

              <div className="pitch-card" style={{ borderLeft: "6px solid #EF4444" }}>
                <b style={{ fontSize: "15px", display: "block", marginBottom: "6px" }}>🏦 Ditolak Perbankan Konvensional</b>
                <p style={{ fontSize: "13px", color: "#4B5563", lineHeight: 1.5 }}>
                  Bank menolak anjak piutang mikro karena ketiadaan sertifikat agunan fisik tanah/properti dan nominal tiket yang dinilai terlalu kecil.
                </p>
              </div>

              <div className="pitch-card" style={{ borderLeft: "6px solid #EF4444" }}>
                <b style={{ fontSize: "15px", display: "block", marginBottom: "6px" }}>⚠️ Jeratan Pinjol Berbunga Mencekik</b>
                <p style={{ fontSize: "13px", color: "#4B5563", lineHeight: 1.5 }}>
                  Demi menutupi kebutuhan, freelancer terjerat pinjol berbunga 20–30% per bulan yang memperburuk kondisi keuangan.
                </p>
              </div>

              <div className="pitch-card" style={{ borderLeft: "6px solid #EF4444" }}>
                <b style={{ fontSize: "15px", display: "block", marginBottom: "6px" }}>🛑 Risiko Faktur Ganda di TradFi</b>
                <p style={{ fontSize: "13px", color: "#4B5563", lineHeight: 1.5 }}>
                  Pada perbankan tradisional, risiko terbesar adalah satu faktur difotokopi dan dijual berulang kali ke beberapa pemodal berbeda (double factoring).
                </p>
              </div>
            </div>

            <div className="pitch-footer">
              <span>CashIn Pitch Deck</span>
              <span>Slide 2 / 10</span>
            </div>
          </div>
        )}

        {/* SLIDE 3: THE SOLUTION */}
        {currentSlide === 2 && (
          <div className="pitch-slide">
            <div>
              <div style={{ fontFamily: "var(--mono, monospace)", fontSize: "11px", fontWeight: 800, color: "#EA580C", marginBottom: "6px" }}>
                SOLUSI KAMI
              </div>
              <h2 style={{ fontSize: "32px", fontWeight: 900, letterSpacing: "-0.03em" }}>
                Anjak Piutang On-Chain <span style={{ background: "#D9F99D", padding: "0 4px" }}>Berbasis Real-World Asset</span>
              </h2>
            </div>

            <div className="pitch-grid-3" style={{ margin: "auto 0" }}>
              <div className="pitch-card">
                <span style={{ background: "#D9F99D", fontSize: "10px", fontWeight: 800, padding: "3px 8px", border: "1px solid #111827", display: "inline-block", marginBottom: "8px" }}>01. TOKENISASI</span>
                <b style={{ fontSize: "15px", display: "block", marginBottom: "6px" }}>NFT Hak Tagih ERC-721</b>
                <p style={{ fontSize: "13px", color: "#4B5563", lineHeight: 1.5 }}>
                  Setiap invoice digital yang disahkan dicetak menjadi token NFT unik di Base Sepolia, mengunci hak klaim pembayaran secara legal on-chain.
                </p>
              </div>

              <div className="pitch-card">
                <span style={{ background: "#D1FAE5", fontSize: "10px", fontWeight: 800, padding: "3px 8px", border: "1px solid #111827", display: "inline-block", marginBottom: "8px" }}>02. LIKUIDITAS</span>
                <b style={{ fontSize: "15px", display: "block", marginBottom: "6px" }}>Pencairan Instan di Muka</b>
                <p style={{ fontSize: "13px", color: "#4B5563", lineHeight: 1.5 }}>
                  Freelancer menjual hak tagih dengan potongan diskon wajar (misal 8%) kepada investor. Dana USDC langsung cair detik itu juga tanpa bunga pinjaman.
                </p>
              </div>

              <div className="pitch-card">
                <span style={{ background: "#DBEAFE", fontSize: "10px", fontWeight: 800, padding: "3px 8px", border: "1px solid #111827", display: "inline-block", marginBottom: "8px" }}>03. SETTLEMENT</span>
                <b style={{ fontSize: "15px", display: "block", marginBottom: "6px" }}>Pelunasan Otomatis Klien</b>
                <p style={{ fontSize: "13px", color: "#4B5563", lineHeight: 1.5 }}>
                  Saat jatuh tempo, klien membayar 100% langsung ke smart contract yang otomatis meneruskannya ke investor pemegang NFT.
                </p>
              </div>
            </div>

            <div className="pitch-footer">
              <span>CashIn Pitch Deck</span>
              <span>Slide 3 / 10</span>
            </div>
          </div>
        )}

        {/* SLIDE 4: HOW IT WORKS */}
        {currentSlide === 3 && (
          <div className="pitch-slide">
            <div>
              <div style={{ fontFamily: "var(--mono, monospace)", fontSize: "11px", fontWeight: 800, color: "#EA580C", marginBottom: "6px" }}>
                ALUR PRODUK
              </div>
              <h2 style={{ fontSize: "32px", fontWeight: 900, letterSpacing: "-0.03em" }}>
                Alur Transaksi <span style={{ background: "#D9F99D", padding: "0 4px" }}>3 Langkah Sederhana</span>
              </h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", margin: "auto 0" }}>
              <div className="pitch-card" style={{ display: "flex", gap: "18px", alignItems: "center" }}>
                <div style={{ fontFamily: "var(--mono, monospace)", fontSize: "26px", fontWeight: 900, color: "#EA580C" }}>01</div>
                <div>
                  <b style={{ fontSize: "15px" }}>Freelancer Terbitkan Invoice Menjadi NFT</b>
                  <p style={{ fontSize: "13px", color: "#4B5563", marginTop: "3px" }}>Memasukkan nominal USDC, alamat klien, dan tenggat waktu. Smart contract mencetak NFT (Status: <code>Draft</code>).</p>
                </div>
              </div>

              <div className="pitch-card" style={{ display: "flex", gap: "18px", alignItems: "center" }}>
                <div style={{ fontFamily: "var(--mono, monospace)", fontSize: "26px", fontWeight: 900, color: "#059669" }}>02</div>
                <div>
                  <b style={{ fontSize: "15px" }}>Klien Sahkan & Investor Danai di Bursa</b>
                  <p style={{ fontSize: "13px", color: "#4B5563", marginTop: "3px" }}>Klien mengonfirmasi pekerjaan selesai (<code>Disetujui</code>). Tagihan ditawarkan di bursa (<code>Di Bursa</code>). Investor menyetor USDC dan dana seketika cair ke freelancer (<code>Didanai</code>).</p>
                </div>
              </div>

              <div className="pitch-card" style={{ display: "flex", gap: "18px", alignItems: "center" }}>
                <div style={{ fontFamily: "var(--mono, monospace)", fontSize: "26px", fontWeight: 900, color: "#111827" }}>03</div>
                <div>
                  <b style={{ fontSize: "15px" }}>Pelunasan Klien Saat Jatuh Tempo</b>
                  <p style={{ fontSize: "13px", color: "#4B5563", marginTop: "3px" }}>Klien mentransfer pelunasan 100% penuh saat jatuh tempo. Kontrak otomatis menyalurkan dana ke investor pemegang NFT (<code>Lunas</code>).</p>
                </div>
              </div>
            </div>

            <div className="pitch-footer">
              <span>CashIn Pitch Deck</span>
              <span>Slide 4 / 10</span>
            </div>
          </div>
        )}

        {/* SLIDE 5: SECURITY */}
        {currentSlide === 4 && (
          <div className="pitch-slide">
            <div>
              <div style={{ fontFamily: "var(--mono, monospace)", fontSize: "11px", fontWeight: 800, color: "#EA580C", marginBottom: "6px" }}>
                INOVASI KEAMANAN
              </div>
              <h2 style={{ fontSize: "32px", fontWeight: 900, letterSpacing: "-0.03em" }}>
                Proteksi Piutang Ganda: <span style={{ background: "#D9F99D", padding: "0 4px" }}>Atomic State Guard</span>
              </h2>
            </div>

            <div className="pitch-grid-2" style={{ margin: "auto 0" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 800, marginBottom: "8px" }}>State Machine Smart Contract</h3>
                <p style={{ fontSize: "13.5px", lineHeight: 1.55, color: "#4B5563", marginBottom: "14px" }}>
                  Fungsi <code>buyInvoice</code> pada smart contract CashIn secara mutlak mewajibkan kondisi status:
                  <br />
                  <code style={{ fontFamily: "var(--mono, monospace)", background: "#E5E7EB", padding: "3px 6px", fontSize: "12px", fontWeight: 700, borderRadius: "3px", display: "inline-block", marginTop: "4px" }}>
                    require(inv.status == InvoiceStatus.Listed)
                  </code>
                </p>
                <div className="pitch-card" style={{ background: "#D1FAE5", borderColor: "#059669" }}>
                  <b style={{ color: "#065F46", fontSize: "13.5px" }}>✓ Garansi 100% Anti-Double Financing</b>
                  <p style={{ fontSize: "12.5px", color: "#1F2937", marginTop: "4px" }}>
                    Begitu investor pertama mendanai, status terkunci ke <code>Financed</code>. Upaya pendanaan ulang otomatis digagalkan (revert) oleh EVM tanpa kehilangan saldo sepeser pun.
                  </p>
                </div>
              </div>

              <table className="pitch-table">
                <thead>
                  <tr>
                    <th>Status Kontrak</th>
                    <th>Aksi Diizinkan</th>
                    <th>Proteksi EVM</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><b>Draft</b></td>
                    <td>Verifikasi Klien</td>
                    <td>Tidak bisa dibeli</td>
                  </tr>
                  <tr>
                    <td><b>Disetujui</b></td>
                    <td>Pasang Diskon</td>
                    <td>Siap ke bursa</td>
                  </tr>
                  <tr>
                    <td><b>Di Bursa</b></td>
                    <td>Didanai Investor</td>
                    <td>Menerima USDC</td>
                  </tr>
                  <tr style={{ background: "#FEE2E2" }}>
                    <td><b>Didanai</b></td>
                    <td>Pelunasan Klien</td>
                    <td><b>Tolak pembelian ke-2</b></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pitch-footer">
              <span>CashIn Pitch Deck</span>
              <span>Slide 5 / 10</span>
            </div>
          </div>
        )}

        {/* SLIDE 6: MARKET */}
        {currentSlide === 5 && (
          <div className="pitch-slide">
            <div>
              <div style={{ fontFamily: "var(--mono, monospace)", fontSize: "11px", fontWeight: 800, color: "#EA580C", marginBottom: "6px" }}>
                POTENSI PASAR
              </div>
              <h2 style={{ fontSize: "32px", fontWeight: 900, letterSpacing: "-0.03em" }}>
                Peluang Pasar <span style={{ background: "#D9F99D", padding: "0 4px" }}>Gig Economy & RWA Asia Tenggara</span>
              </h2>
            </div>

            <div className="pitch-grid-3" style={{ margin: "auto 0" }}>
              <div className="pitch-card">
                <div style={{ fontSize: "32px", fontWeight: 900, color: "#EA580C", fontFamily: "var(--mono, monospace)" }}>140M+</div>
                <b style={{ fontSize: "15px", display: "block", marginTop: "4px", marginBottom: "6px" }}>Pekerja Informal & Gig ASEAN</b>
                <p style={{ fontSize: "13px", color: "#4B5563", lineHeight: 1.5 }}>
                  Indonesia memiliki puluhan juta pekerja digital lepas, agensi desain, software house, dan konsultan yang terkendala siklus termin piutang.
                </p>
              </div>

              <div className="pitch-card">
                <div style={{ fontSize: "32px", fontWeight: 900, color: "#059669", fontFamily: "var(--mono, monospace)" }}>$16T</div>
                <b style={{ fontSize: "15px", display: "block", marginTop: "4px", marginBottom: "6px" }}>Proyeksi Pasar RWA 2030</b>
                <p style={{ fontSize: "13px", color: "#4B5563", lineHeight: 1.5 }}>
                  Sektor tokenisasi aset dunia nyata (RWA Private Credit) bertumbuh pesat karena investor Web3 mencari imbal hasil nyata dan stabil.
                </p>
              </div>

              <div className="pitch-card">
                <div style={{ fontSize: "32px", fontWeight: 900, color: "#111827", fontFamily: "var(--mono, monospace)" }}>&lt; $0.001</div>
                <b style={{ fontSize: "15px", display: "block", marginTop: "4px", marginBottom: "6px" }}>Gas Fee Sangat Murah di Base</b>
                <p style={{ fontSize: "13px", color: "#4B5563", lineHeight: 1.5 }}>
                  Biaya transaksi di Base L2 memungkinkan pembiayaan invoice bernilai mikro ($200 – $2.000) tanpa terbebani biaya gas Ethereum mainnet.
                </p>
              </div>
            </div>

            <div className="pitch-footer">
              <span>CashIn Pitch Deck</span>
              <span>Slide 6 / 10</span>
            </div>
          </div>
        )}

        {/* SLIDE 7: BUSINESS MODEL */}
        {currentSlide === 6 && (
          <div className="pitch-slide">
            <div>
              <div style={{ fontFamily: "var(--mono, monospace)", fontSize: "11px", fontWeight: 800, color: "#EA580C", marginBottom: "6px" }}>
                MODEL BISNIS
              </div>
              <h2 style={{ fontSize: "32px", fontWeight: 900, letterSpacing: "-0.03em" }}>
                Pendapatan Protokol <span style={{ background: "#D9F99D", padding: "0 4px" }}>yang Berkelanjutan</span>
              </h2>
            </div>

            <div className="pitch-grid-3" style={{ margin: "auto 0" }}>
              <div className="pitch-card">
                <span style={{ background: "#D9F99D", fontSize: "10px", fontWeight: 800, padding: "3px 8px", border: "1px solid #111827", display: "inline-block", marginBottom: "8px" }}>ALIRAN 1</span>
                <b style={{ fontSize: "15px", display: "block", marginBottom: "6px" }}>Biaya Pencairan (0.5% – 1%)</b>
                <p style={{ fontSize: "13px", color: "#4B5563", lineHeight: 1.5 }}>
                  Dipotong otomatis dari nilai pencairan invoice saat transaksi pendanaan sukses dieksekusi di smart contract.
                </p>
              </div>

              <div className="pitch-card">
                <span style={{ background: "#D1FAE5", fontSize: "10px", fontWeight: 800, padding: "3px 8px", border: "1px solid #111827", display: "inline-block", marginBottom: "8px" }}>ALIRAN 2</span>
                <b style={{ fontSize: "15px", display: "block", marginBottom: "6px" }}>Biaya Pelunasan (0.25%)</b>
                <p style={{ fontSize: "13px", color: "#4B5563", lineHeight: 1.5 }}>
                  Biaya administrasi protokol saat klien melunasi tagihan saat tanggal jatuh tempo kontrak.
                </p>
              </div>

              <div className="pitch-card">
                <span style={{ background: "#DBEAFE", fontSize: "10px", fontWeight: 800, padding: "3px 8px", border: "1px solid #111827", display: "inline-block", marginBottom: "8px" }}>ALIRAN 3</span>
                <b style={{ fontSize: "15px", display: "block", marginBottom: "6px" }}>Kemitraan Platform Gig</b>
                <p style={{ fontSize: "13px", color: "#4B5563", lineHeight: 1.5 }}>
                  Integrasi API dengan platform freelance lokal untuk auto-verifikasi deliverables dan bagi hasil komisi.
                </p>
              </div>
            </div>

            <div className="pitch-footer">
              <span>CashIn Pitch Deck</span>
              <span>Slide 7 / 10</span>
            </div>
          </div>
        )}

        {/* SLIDE 8: COMPETITIVE ADVANTAGE */}
        {currentSlide === 7 && (
          <div className="pitch-slide">
            <div>
              <div style={{ fontFamily: "var(--mono, monospace)", fontSize: "11px", fontWeight: 800, color: "#EA580C", marginBottom: "6px" }}>
                KEUNGGULAN KOMPETITIF
              </div>
              <h2 style={{ fontSize: "32px", fontWeight: 900, letterSpacing: "-0.03em" }}>
                Mengapa CashIn <span style={{ background: "#D9F99D", padding: "0 4px" }}>Jauh Lebih Unggul?</span>
              </h2>
            </div>

            <div style={{ margin: "auto 0" }}>
              <table className="pitch-table">
                <thead>
                  <tr>
                    <th>Fitur / Parameter</th>
                    <th>P2P / Factoring Konvensional</th>
                    <th>Pinjol Konsumtif</th>
                    <th style={{ background: "#D9F99D" }}>CashIn (RWA Base)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><b>Waktu Pencairan</b></td>
                    <td>3 – 14 hari kerja (verifikasi manual)</td>
                    <td>1 hari</td>
                    <td style={{ background: "#F4F9D8" }}><b>Detik itu juga (On-chain)</b></td>
                  </tr>
                  <tr>
                    <td><b>Struktur Finansial</b></td>
                    <td>Utang berbunga majemuk</td>
                    <td>Bunga tinggi (20–30%/bln)</td>
                    <td style={{ background: "#F4F9D8" }}><b>Bukan utang (Jual diskon wajar 5-10%)</b></td>
                  </tr>
                  <tr>
                    <td><b>Persyaratan Agunan</b></td>
                    <td>Sertifikat tanah / aset fisik</td>
                    <td>Akses kontak & data pribadi</td>
                    <td style={{ background: "#F4F9D8" }}><b>Tanpa agunan (NFT hak tagih sah)</b></td>
                  </tr>
                  <tr>
                    <td><b>Proteksi Piutang Ganda</b></td>
                    <td>Pengecekan manual rawan lolos</td>
                    <td>Tidak relevan</td>
                    <td style={{ background: "#F4F9D8" }}><b>Terkunci kriptografis ERC-721</b></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pitch-footer">
              <span>CashIn Pitch Deck</span>
              <span>Slide 8 / 10</span>
            </div>
          </div>
        )}

        {/* SLIDE 9: TECH STACK */}
        {currentSlide === 8 && (
          <div className="pitch-slide">
            <div>
              <div style={{ fontFamily: "var(--mono, monospace)", fontSize: "11px", fontWeight: 800, color: "#EA580C", marginBottom: "6px" }}>
                ARSITEKTUR TEKNOLOGI
              </div>
              <h2 style={{ fontSize: "32px", fontWeight: 900, letterSpacing: "-0.03em" }}>
                Teknologi Modern & <span style={{ background: "#D9F99D", padding: "0 4px" }}>Infrastruktur Teruji</span>
              </h2>
            </div>

            <div className="pitch-grid-3" style={{ margin: "auto 0" }}>
              <div className="pitch-card">
                <b style={{ fontSize: "15px", display: "block", marginBottom: "8px" }}>⛓️ Smart Contracts</b>
                <ul style={{ fontSize: "12.5px", lineHeight: 1.6, color: "#4B5563", paddingLeft: "16px", margin: 0 }}>
                  <li>Solidity 0.8.28</li>
                  <li>OpenZeppelin ERC-721 & ERC-20</li>
                  <li>Hardhat 3 Tooling + TypeChain</li>
                  <li>100% Automated Test Passing</li>
                </ul>
              </div>

              <div className="pitch-card">
                <b style={{ fontSize: "15px", display: "block", marginBottom: "8px" }}>🌐 Live di Base Sepolia</b>
                <ul style={{ fontSize: "12.5px", lineHeight: 1.6, color: "#4B5563", paddingLeft: "16px", margin: 0 }}>
                  <li>CairIn: <code>0xf436e...357a</code></li>
                  <li>MockUSDC: <code>0x7715C...76DD</code></li>
                  <li>Gas fee mikro (&lt; Rp100)</li>
                  <li>Settlement USDC Stablecoin</li>
                </ul>
              </div>

              <div className="pitch-card">
                <b style={{ fontSize: "15px", display: "block", marginBottom: "8px" }}>💻 Frontend & Deployment</b>
                <ul style={{ fontSize: "12.5px", lineHeight: 1.6, color: "#4B5563", paddingLeft: "16px", margin: 0 }}>
                  <li>Next.js 16 (App Router) & React 19</li>
                  <li>Wagmi v2 & Viem Web3 Connect</li>
                  <li>Production Live di Vercel</li>
                  <li>UI Modern Light Mode</li>
                </ul>
              </div>
            </div>

            <div className="pitch-footer">
              <span>CashIn Pitch Deck</span>
              <span>Slide 9 / 10</span>
            </div>
          </div>
        )}

        {/* SLIDE 10: TEAM & ROADMAP */}
        {currentSlide === 9 && (
          <div className="pitch-slide">
            <div>
              <div style={{ fontFamily: "var(--mono, monospace)", fontSize: "11px", fontWeight: 800, color: "#EA580C", marginBottom: "6px" }}>
                TIM & PETA JALAN
              </div>
              <h2 style={{ fontSize: "32px", fontWeight: 900, letterSpacing: "-0.03em" }}>
                Tim Pengembang & <span style={{ background: "#D9F99D", padding: "0 4px" }}>Rencana Eksekusi</span>
              </h2>
            </div>

            <div className="pitch-grid-2" style={{ margin: "auto 0" }}>
              <div className="pitch-card">
                <span style={{ background: "#D9F99D", fontSize: "10px", fontWeight: 800, padding: "3px 8px", border: "1px solid #111827", display: "inline-block", marginBottom: "8px" }}>TIM PEMBANGUN</span>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
                  <div>
                    <b style={{ fontSize: "14px", display: "block" }}>Syifa Maulida</b>
                    <p style={{ fontSize: "12px", color: "#4B5563", margin: "2px 0 0" }}>Product Lead & Frontend Developer — Arsitektur dApp, Web3 UX, dan desain produk.</p>
                  </div>
                  <div>
                    <b style={{ fontSize: "14px", display: "block" }}>Sultan Saladin Pahlevi</b>
                    <p style={{ fontSize: "12px", color: "#4B5563", margin: "2px 0 0" }}>Smart Contract & Full-Stack Engineer — Kontrak Solidity, keamanan on-chain, dan integrasi protokol.</p>
                  </div>
                </div>
              </div>

              <div className="pitch-card">
                <span style={{ background: "#D1FAE5", fontSize: "10px", fontWeight: 800, padding: "3px 8px", border: "1px solid #111827", display: "inline-block", marginBottom: "8px" }}>ROADMAP</span>
                <div style={{ fontSize: "12px", color: "#4B5563", lineHeight: 1.6, marginTop: "4px" }}>
                  • <b>Q4 2026:</b> Hackathon MVP & Validasi Smart Contract Base Sepolia.<br />
                  • <b>Q1 2027:</b> Account Abstraction (ERC-4337) login email/Google & Paymaster.<br />
                  • <b>Q2 2027:</b> Audit keamanan eksternal & peluncuran Base Mainnet.<br />
                  • <b>Q3 2027:</b> On-ramp IDR langsung ke USDC & integrasi platform freelance.
                </div>
              </div>
            </div>

            <div className="pitch-footer">
              <span>CashIn — Build The Real World Onchain</span>
              <span>Terima Kasih! • cashin-syifamwldas-projects.vercel.app</span>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
