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
    <div style={{ backgroundColor: "#262521", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "var(--sans)" }}>
      {/* Deck Controls Toolbar */}
      <header className="deck-toolbar" style={{ width: "min(1080px, 100%)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--paper)", border: "2px solid var(--ink)", boxShadow: "6px 6px 0 var(--ink)", padding: "12px 20px", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: 900, fontSize: "16px" }}>
          <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
            CASHIN SLIDE DECK
          </Link>
          <span style={{ background: "var(--ink)", color: "var(--paper)", fontSize: "11px", padding: "2px 8px", fontFamily: "var(--mono)", fontWeight: 700 }}>
            RWA ON BASE
          </span>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: "13px", fontWeight: 800, marginRight: "8px" }}>
            Slide {currentSlide + 1} / {totalSlides}
          </span>
          <button className="btn-control" onClick={prevSlide} style={{ padding: "8px 16px", background: "var(--paper-white)", border: "1.5px solid var(--ink)", boxShadow: "2px 2px 0 var(--ink)", fontFamily: "var(--mono)", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
            &larr; Prev
          </button>
          <button className="btn-control" onClick={nextSlide} style={{ padding: "8px 16px", background: "var(--paper-white)", border: "1.5px solid var(--ink)", boxShadow: "2px 2px 0 var(--ink)", fontFamily: "var(--mono)", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
            Next &rarr;
          </button>
          <button className="btn-control primary" onClick={() => window.print()} style={{ padding: "8px 16px", background: "var(--cairin-acid)", border: "1.5px solid var(--ink)", boxShadow: "2px 2px 0 var(--ink)", fontFamily: "var(--mono)", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
            🖨️ Cetak / Simpan PDF
          </button>
        </div>
      </header>

      {/* Presentation Stage (16:9 Aspect Ratio) */}
      <main style={{ width: "min(1080px, 100%)", aspectRatio: "16 / 9", background: "var(--paper)", border: "3px solid var(--ink)", boxShadow: "14px 14px 0 rgba(0, 0, 0, 0.6)", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        
        {/* SLIDE 1: COVER */}
        {currentSlide === 0 && (
          <div className="slide active" style={{ display: "flex", width: "100%", height: "100%", padding: "44px 56px", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div className="slide-eyebrow">ETHEREUM JAKARTA HACKATHON 2026 • RWA PROTOCOL</div>
              <h1 style={{ fontSize: "clamp(44px, 5.5vw, 68px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: "16px" }}>
                CashIn
              </h1>
              <p style={{ fontSize: "22px", fontWeight: 800, color: "var(--cairin-green)", marginBottom: "20px" }}>
                Cairkan Invoice Freelance Lebih Cepat. Ubah Piutang Jadi Kas Instan.
              </p>
              <p style={{ fontSize: "15px", color: "#444", maxWidth: "680px", lineHeight: 1.5 }}>
                Platform anjak piutang mikro (RWA Invoice Factoring) berbasis NFT ERC-721 di jaringan Base Sepolia. Memberikan modal kerja instan tanpa utang pinjol.
              </p>
            </div>

            <div className="grid-3" style={{ marginTop: "24px" }}>
              <div className="card" style={{ background: "var(--cairin-acid)" }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: "11px", fontWeight: 800 }}>TARGET PENGGUNA</div>
                <b style={{ fontSize: "15px" }}>Pekerja Lepas & Agensi Digital</b>
              </div>
              <div className="card" style={{ background: "var(--cairin-mint)" }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: "11px", fontWeight: 800 }}>INSTRUMEN RWA</div>
                <b style={{ fontSize: "15px" }}>NFT ERC-721 + Settlement USDC</b>
              </div>
              <div className="card" style={{ background: "#DBEAFE" }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: "11px", fontWeight: 800 }}>JARINGAN BLOCKCHAIN</div>
                <b style={{ fontSize: "15px" }}>Base Sepolia (Ethereum L2)</b>
              </div>
            </div>

            <div className="slide-footer">
              <span>Tim: Syifa Maulida (Product/Frontend) & Sultan Saladin (Smart Contract)</span>
              <span>cashin-syifamwldas-projects.vercel.app</span>
            </div>
          </div>
        )}

        {/* SLIDE 2: THE PROBLEM */}
        {currentSlide === 1 && (
          <div className="slide active" style={{ display: "flex", width: "100%", height: "100%", padding: "44px 56px", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div className="slide-eyebrow">LATAR BELAKANG MASALAH</div>
              <h2 className="slide-heading">Krisis Arus Kas 30–90 Hari <em>Pekerja Lepas</em></h2>
            </div>

            <div className="grid-2 slide-body">
              <div className="card" style={{ borderLeft: "6px solid var(--cairin-red)" }}>
                <div className="card-title">⏳ Termin Pembayaran Lama (Net 30-90)</div>
                <p className="card-desc">
                  Pekerjaan selesai hari ini, namun klien baru membayar 1 hingga 3 bulan kemudian. Arus kas freelancer macet untuk kebutuhan hidup bulanan.
                </p>
              </div>

              <div className="card" style={{ borderLeft: "6px solid var(--cairin-red)" }}>
                <div className="card-title">🏦 Ditolak Perbankan Konvensional</div>
                <p className="card-desc">
                  Bank menolak anjak piutang mikro karena ketiadaan sertifikat agunan fisik tanah/properti dan nominal tiket yang dinilai terlalu kecil.
                </p>
              </div>

              <div className="card" style={{ borderLeft: "6px solid var(--cairin-red)" }}>
                <div className="card-title">⚠️ Jeratan Pinjol Berbunga Mencekik</div>
                <p className="card-desc">
                  Demi menutupi kebutuhan, freelancer terjerat pinjol berbunga 20–30% per bulan yang memperburuk kondisi keuangan.
                </p>
              </div>

              <div className="card" style={{ borderLeft: "6px solid var(--cairin-red)" }}>
                <div className="card-title">🛑 Risiko Faktur Ganda di TradFi</div>
                <p className="card-desc">
                  Pada perbankan tradisional, risiko terbesar adalah satu faktur difotokopi dan dijual berulang kali ke beberapa pemodal berbeda (double factoring).
                </p>
              </div>
            </div>

            <div className="slide-footer">
              <span>CashIn Pitch Deck</span>
              <span>Slide 2 / 10</span>
            </div>
          </div>
        )}

        {/* SLIDE 3: THE SOLUTION */}
        {currentSlide === 2 && (
          <div className="slide active" style={{ display: "flex", width: "100%", height: "100%", padding: "44px 56px", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div className="slide-eyebrow">SOLUSI KAMI</div>
              <h2 className="slide-heading">Anjak Piutang On-Chain <em>Berbasis Real-World Asset</em></h2>
            </div>

            <div className="grid-3 slide-body">
              <div className="card">
                <span className="badge-pill" style={{ background: "var(--cairin-acid)" }}>01. TOKENISASI</span>
                <div className="card-title">NFT Hak Tagih ERC-721</div>
                <p className="card-desc">
                  Setiap invoice digital yang disahkan dicetak menjadi token NFT unik di Base Sepolia, mengunci hak klaim pembayaran secara legal on-chain.
                </p>
              </div>

              <div className="card">
                <span className="badge-pill" style={{ background: "var(--cairin-mint)" }}>02. LIKUIDITAS</span>
                <div className="card-title">Pencairan Instan di Muka</div>
                <p className="card-desc">
                  Freelancer menjual hak tagih dengan potongan diskon wajar (misal 8%) kepada investor. Dana USDC langsung cair detik itu juga tanpa bunga pinjaman.
                </p>
              </div>

              <div className="card">
                <span className="badge-pill" style={{ background: "#DBEAFE" }}>03. SETTLEMENT</span>
                <div className="card-title">Pelunasan Otomatis Klien</div>
                <p className="card-desc">
                  Saat jatuh tempo, klien membayar 100% langsung ke smart contract yang otomatis meneruskannya ke investor pemegang NFT.
                </p>
              </div>
            </div>

            <div className="slide-footer">
              <span>CashIn Pitch Deck</span>
              <span>Slide 3 / 10</span>
            </div>
          </div>
        )}

        {/* SLIDE 4: HOW IT WORKS */}
        {currentSlide === 3 && (
          <div className="slide active" style={{ display: "flex", width: "100%", height: "100%", padding: "44px 56px", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div className="slide-eyebrow">ALUR PRODUK</div>
              <h2 className="slide-heading">Alur Transaksi <em>3 Langkah Sederhana</em></h2>
            </div>

            <div className="slide-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="card" style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: "28px", fontWeight: 900, color: "var(--cairin-orange)" }}>01</div>
                <div>
                  <b>Freelancer Terbitkan Invoice</b>
                  <p style={{ fontSize: "13px", color: "#555" }}>Memasukkan nominal USDC, alamat klien, dan tanggal jatuh tempo. Smart contract mencetak NFT (Status: <code>Draft</code>).</p>
                </div>
              </div>

              <div className="card" style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: "28px", fontWeight: 900, color: "var(--cairin-green)" }}>02</div>
                <div>
                  <b>Klien Sahkan & Investor Danai di Bursa</b>
                  <p style={{ fontSize: "13px", color: "#555" }}>Klien mengonfirmasi pekerjaan selesai (<code>Disetujui</code>). Tagihan ditawarkan di bursa (<code>Di Bursa</code>). Investor menyetor USDC dan dana seketika cair ke freelancer (<code>Didanai</code>).</p>
                </div>
              </div>

              <div className="card" style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: "28px", fontWeight: 900, color: "var(--ink)" }}>03</div>
                <div>
                  <b>Pelunasan Klien Saat Jatuh Tempo</b>
                  <p style={{ fontSize: "13px", color: "#555" }}>Klien mentransfer pelunasan 100% penuh saat jatuh tempo. Kontrak otomatis menyalurkan dana ke investor pemegang NFT (<code>Lunas</code>).</p>
                </div>
              </div>
            </div>

            <div className="slide-footer">
              <span>CashIn Pitch Deck</span>
              <span>Slide 4 / 10</span>
            </div>
          </div>
        )}

        {/* SLIDE 5: SECURITY */}
        {currentSlide === 4 && (
          <div className="slide active" style={{ display: "flex", width: "100%", height: "100%", padding: "44px 56px", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div className="slide-eyebrow">INOVASI KEAMANAN</div>
              <h2 className="slide-heading">Proteksi Piutang Ganda: <em>Atomic State Guard</em></h2>
            </div>

            <div className="grid-2 slide-body">
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "12px" }}>State Machine Smart Contract</h3>
                <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#444", marginBottom: "16px" }}>
                  Fungsi <code>buyInvoice</code> pada smart contract CashIn secara mutlak mewajibkan kondisi status:
                  <br />
                  <code style={{ fontFamily: "var(--mono)", background: "#E5E1D6", padding: "2px 6px", fontSize: "12px", fontWeight: 700 }}>
                    require(inv.status == InvoiceStatus.Listed)
                  </code>
                </p>
                <div className="card" style={{ background: "var(--cairin-mint)", borderColor: "var(--cairin-green)" }}>
                  <b style={{ color: "var(--cairin-green)", fontSize: "14px" }}>✓ Garansi 100% Anti-Double Financing</b>
                  <p style={{ fontSize: "12.5px", color: "#333", marginTop: "4px" }}>
                    Begitu investor pertama mendanai, status terkunci ke <code>Financed</code>. Upaya pendanaan ulang otomatis digagalkan (revert) oleh EVM tanpa kehilangan saldo sepeser pun.
                  </p>
                </div>
              </div>

              <table className="table-brutal">
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

            <div className="slide-footer">
              <span>CashIn Pitch Deck</span>
              <span>Slide 5 / 10</span>
            </div>
          </div>
        )}

        {/* SLIDE 6: MARKET */}
        {currentSlide === 5 && (
          <div className="slide active" style={{ display: "flex", width: "100%", height: "100%", padding: "44px 56px", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div className="slide-eyebrow">POTENSI PASAR</div>
              <h2 className="slide-heading">Peluang Pasar <em>Gig Economy & RWA Asia Tenggara</em></h2>
            </div>

            <div className="grid-3 slide-body">
              <div className="card">
                <div style={{ fontSize: "32px", fontWeight: 900, color: "var(--cairin-orange)", fontFamily: "var(--mono)" }}>140M+</div>
                <div className="card-title">Pekerja Informal & Gig ASEAN</div>
                <p className="card-desc">
                  Indonesia memiliki puluhan juta pekerja digital lepas, agensi desain, software house, dan konsultan yang terkendala siklus termin piutang.
                </p>
              </div>

              <div className="card">
                <div style={{ fontSize: "32px", fontWeight: 900, color: "var(--cairin-green)", fontFamily: "var(--mono)" }}>$16T</div>
                <div className="card-title">Proyeksi Pasar RWA 2030</div>
                <p className="card-desc">
                  Sektor tokenisasi aset dunia nyata (RWA Private Credit) bertumbuh eksponensial karena investor Web3 mencari imbal hasil nyata dan stabil.
                </p>
              </div>

              <div className="card">
                <div style={{ fontSize: "32px", fontWeight: 900, color: "var(--ink)", fontFamily: "var(--mono)" }}>$0.001</div>
                <div className="card-title">Gas Fee Sangat Efisien di Base</div>
                <p className="card-desc">
                  Biaya transaksi di Base L2 memungkinkan pembiayaan invoice bernilai mikro ($200 – $2.000) tanpa terbebani biaya gas Ethereum mainnet.
                </p>
              </div>
            </div>

            <div className="slide-footer">
              <span>CashIn Pitch Deck</span>
              <span>Slide 6 / 10</span>
            </div>
          </div>
        )}

        {/* SLIDE 7: BUSINESS MODEL */}
        {currentSlide === 6 && (
          <div className="slide active" style={{ display: "flex", width: "100%", height: "100%", padding: "44px 56px", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div className="slide-eyebrow">MODEL BISNIS</div>
              <h2 className="slide-heading">Pendapatan Protokol <em>yang Berkelanjutan</em></h2>
            </div>

            <div className="grid-3 slide-body">
              <div className="card">
                <span className="badge-pill" style={{ background: "var(--cairin-acid)" }}>ALIRAN 1</span>
                <div className="card-title">Biaya Pencairan (0.5% – 1%)</div>
                <p className="card-desc">
                  Dipotong otomatis dari nilai pencairan invoice saat transaksi pendanaan sukses dieksekusi di smart contract.
                </p>
              </div>

              <div className="card">
                <span className="badge-pill" style={{ background: "var(--cairin-mint)" }}>ALIRAN 2</span>
                <div className="card-title">Biaya Pelunasan (0.25%)</div>
                <p className="card-desc">
                  Biaya administrasi protokol saat klien melunasi tagihan saat tanggal jatuh tempo kontrak.
                </p>
              </div>

              <div className="card">
                <span className="badge-pill" style={{ background: "#DBEAFE" }}>ALIRAN 3</span>
                <div className="card-title">Kemitraan Platform Gig</div>
                <p className="card-desc">
                  Integrasi API dengan platform freelance lokal untuk auto-verifikasi deliverables dan bagi hasil komisi.
                </p>
              </div>
            </div>

            <div className="slide-footer">
              <span>CashIn Pitch Deck</span>
              <span>Slide 7 / 10</span>
            </div>
          </div>
        )}

        {/* SLIDE 8: COMPETITIVE ADVANTAGE */}
        {currentSlide === 7 && (
          <div className="slide active" style={{ display: "flex", width: "100%", height: "100%", padding: "44px 56px", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div className="slide-eyebrow">KEUNGGULAN KOMPETITIF</div>
              <h2 className="slide-heading">Mengapa CashIn <em>Jauh Lebih Unggul?</em></h2>
            </div>

            <div className="slide-body">
              <table className="table-brutal">
                <thead>
                  <tr>
                    <th>Fitur / Parameter</th>
                    <th>P2P / Factoring Konvensional</th>
                    <th>Pinjol Konsumtif</th>
                    <th style={{ background: "var(--cairin-acid)" }}>CashIn (RWA Base)</th>
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

            <div className="slide-footer">
              <span>CashIn Pitch Deck</span>
              <span>Slide 8 / 10</span>
            </div>
          </div>
        )}

        {/* SLIDE 9: TECH STACK */}
        {currentSlide === 8 && (
          <div className="slide active" style={{ display: "flex", width: "100%", height: "100%", padding: "44px 56px", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div className="slide-eyebrow">ARSITEKTUR TEKNOLOGI</div>
              <h2 className="slide-heading">Teknologi Modern & <em>Infrastruktur Teruji</em></h2>
            </div>

            <div className="grid-3 slide-body">
              <div className="card">
                <div className="card-title">⛓️ Smart Contracts</div>
                <ul style={{ fontSize: "13px", lineHeight: "1.6", color: "#444", paddingLeft: "18px" }}>
                  <li>Solidity 0.8.28</li>
                  <li>OpenZeppelin ERC-721 & ERC-20</li>
                  <li>Hardhat 3 Tooling + TypeChain</li>
                  <li>100% Automated Test Passing</li>
                </ul>
              </div>

              <div className="card">
                <div className="card-title">🌐 Live di Base Sepolia</div>
                <ul style={{ fontSize: "13px", lineHeight: "1.6", color: "#444", paddingLeft: "18px" }}>
                  <li>CairIn: <code>0xf436e...357a</code></li>
                  <li>MockUSDC: <code>0x7715C...76DD</code></li>
                  <li>Gas fee mikro (&lt; Rp100)</li>
                  <li>Settlement USDC Stablecoin</li>
                </ul>
              </div>

              <div className="card">
                <div className="card-title">💻 Frontend & Deployment</div>
                <ul style={{ fontSize: "13px", lineHeight: "1.6", color: "#444", paddingLeft: "18px" }}>
                  <li>Next.js 16 (App Router) & React 19</li>
                  <li>Wagmi v2 & Viem Web3 Connect</li>
                  <li>Production Live di Vercel</li>
                  <li>UI Modern Brutalist Light Mode</li>
                </ul>
              </div>
            </div>

            <div className="slide-footer">
              <span>CashIn Pitch Deck</span>
              <span>Slide 9 / 10</span>
            </div>
          </div>
        )}

        {/* SLIDE 10: TEAM & ROADMAP */}
        {currentSlide === 9 && (
          <div className="slide active" style={{ display: "flex", width: "100%", height: "100%", padding: "44px 56px", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div className="slide-eyebrow">TIM & PETA JALAN</div>
              <h2 className="slide-heading">Tim Pengembang & <em>Rencana Eksekusi</em></h2>
            </div>

            <div className="grid-2 slide-body" style={{ gap: "16px" }}>
              <div className="card" style={{ background: "var(--paper-white)" }}>
                <span className="badge-pill" style={{ background: "var(--cairin-acid)" }}>TIM PEMBANGUN</span>
                <div style={{ marginTop: "6px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div>
                    <b>Syifa Maulida</b>
                    <p style={{ fontSize: "12px", color: "#555" }}>Product Lead & Frontend Developer — Arsitektur dApp, Web3 UX, dan desain produk.</p>
                  </div>
                  <div>
                    <b>Sultan Saladin Pahlevi</b>
                    <p style={{ fontSize: "12px", color: "#555" }}>Smart Contract & Full-Stack Engineer — Kontrak Solidity, keamanan on-chain, dan integrasi protokol.</p>
                  </div>
                </div>
              </div>

              <div className="card" style={{ background: "var(--paper-white)" }}>
                <span className="badge-pill" style={{ background: "var(--cairin-mint)" }}>ROADMAP</span>
                <div style={{ fontSize: "12px", color: "#444", lineHeight: "1.6" }}>
                  • <b>Q4 2026:</b> Hackathon MVP & Validasi Smart Contract Base Sepolia.<br />
                  • <b>Q1 2027:</b> Account Abstraction (ERC-4337) login email/Google & Paymaster.<br />
                  • <b>Q2 2027:</b> Audit keamanan eksternal & peluncuran Base Mainnet.<br />
                  • <b>Q3 2027:</b> On-ramp IDR langsung ke USDC & integrasi platform freelance.
                </div>
              </div>
            </div>

            <div className="slide-footer">
              <span>CashIn — Build The Real World Onchain</span>
              <span>Terima Kasih! • cashin-syifamwldas-projects.vercel.app</span>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
