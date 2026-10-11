"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function PitchDeckPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 5;

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
    <div style={{ backgroundColor: "#18181b", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "18px 14px", fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)" }}>

      {/* Scoped CSS */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .pitch-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .pitch-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .pitch-grid-custom-4 { display: grid; grid-template-columns: 1.2fr 0.95fr; gap: 16px; }
        .pitch-table { width: 100%; border-collapse: collapse; border: 2px solid #111827; background: #FFFFFF; font-size: 13px; }
        .pitch-table th, .pitch-table td { border: 1.5px solid #111827; padding: 9px 12px; text-align: left; color: #111827; }
        .pitch-table th { background: #EFECE6; font-family: var(--mono, monospace); font-weight: 800; font-size: 11.5px; text-transform: uppercase; }
        @media print {
          body { background: transparent !important; padding: 0 !important; }
          .deck-toolbar-container { display: none !important; }
          .deck-notes-container { display: block !important; page-break-after: always; }
          .deck-stage-container { border: none !important; box-shadow: none !important; width: 100% !important; height: auto !important; }
        }
      `}} />

      {/* Toolbar Atas */}
      <header className="deck-toolbar-container" style={{ width: "min(1100px, 100%)", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "10px", background: "#FAF7F0", border: "2px solid #111827", boxShadow: "5px 5px 0 #111827", padding: "10px 18px", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: 900, fontSize: "16px", color: "#111827" }}>
          <Link href="/" style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#0d9227", fontFamily: "var(--sans)", fontWeight: 900, fontSize: "20px" }}>CashIn</span>
          </Link>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--mono, monospace)", fontSize: "13px", fontWeight: 800, color: "#111827", marginRight: "4px" }}>
            Slide {currentSlide + 1} / {totalSlides}
          </span>
          <button style={btnStyle} onClick={prevSlide}>
            &larr; Balik
          </button>
          <button style={btnStyle} onClick={nextSlide}>
            Lanjut &rarr;
          </button>
          <button style={{ ...btnStyle, background: "#D9F99D" }} onClick={() => window.print()}>
            🖨️ Cetak PDF
          </button>
        </div>
      </header>

      {/* Presentation Stage (16:9 Aspect Ratio) */}
      <main className="deck-stage-container" style={{ width: "min(1100px, 100%)", aspectRatio: "16 / 9", minHeight: "560px", background: "#FCFAF5", border: "3px solid #111827", boxShadow: "12px 12px 0 rgba(0, 0, 0, 0.75)", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>

        {/* SLIDE 1: COVER & PENGENALAN */}
        {currentSlide === 0 && (
          <div style={{ display: "flex", width: "100%", height: "100%", padding: "34px 42px", flexDirection: "column", justifyContent: "space-between", color: "#111827", background: "#FCFAF5" }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#FFEDD5", border: "1.5px solid #EA580C", padding: "4px 10px", marginBottom: "10px" }}>
                <span style={{ fontFamily: "var(--mono, monospace)", fontSize: "11px", fontWeight: 800, color: "#C2410C", letterSpacing: "0.06em" }}>
                  ETHEREUM JAKARTA HACKATHON 2026 • SOLUSI KEUANGAN FREELANCER
                </span>
              </div>
              <h1 style={{ fontSize: "clamp(46px, 5.2vw, 64px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: "10px", color: "#0d9227" }}>
                CashIn
              </h1>
              <p style={{ fontSize: "21px", fontWeight: 800, color: "#111827", marginBottom: "10px" }}>
                Kerjaan Sudah Selesai? <span style={{ background: "#D9F99D", padding: "0 6px" }}>Duitnya Cair Hari Ini Juga.</span>
              </p>
              <p style={{ fontSize: "14.5px", color: "#374151", maxWidth: "780px", lineHeight: 1.5 }}>
                Platform pencairan tagihan instan untuk pekerja lepas dan agensi kreatif. Gak perlu nunggu berbulan-bulan, gak perlu berutang ke pinjol, dan 100% aman dari nota bodong.
              </p>
            </div>

            <div className="pitch-grid-3" style={{ margin: "10px 0" }}>
              <div style={{ ...cardStyle, background: "#D9F99D", padding: "14px 16px" }}>
                <div style={{ fontFamily: "var(--mono, monospace)", fontSize: "10.5px", fontWeight: 800, color: "#166534" }}>UNTUK SIAPA?</div>
                <b style={{ fontSize: "14.5px", display: "block", marginTop: "4px" }}>Pekerja Lepas & Agensi</b>
                <p style={{ fontSize: "12px", color: "#14532D", margin: "4px 0 0", lineHeight: 1.4 }}>Desainer, programmer, & agensi yang sering macet uang kas operasionalnya.</p>
              </div>
              <div style={{ ...cardStyle, background: "#D1FAE5", padding: "14px 16px" }}>
                <div style={{ fontFamily: "var(--mono, monospace)", fontSize: "10.5px", fontWeight: 800, color: "#065F46" }}>CARANYA GIMANA?</div>
                <b style={{ fontSize: "14.5px", display: "block", marginTop: "4px" }}>Tagihan Jadi Uang Kas</b>
                <p style={{ fontSize: "12px", color: "#064E3B", margin: "4px 0 0", lineHeight: 1.4 }}>Nota tagihan dikunci di sistem, dana langsung cair dalam hitungan detik.</p>
              </div>
              <div style={{ ...cardStyle, background: "#DBEAFE", padding: "14px 16px" }}>
                <div style={{ fontFamily: "var(--mono, monospace)", fontSize: "10.5px", fontWeight: 800, color: "#1E40AF" }}>KENAPA AMAN & MURAH?</div>
                <b style={{ fontSize: "14.5px", display: "block", marginTop: "4px" }}>Jaringan Base Sepolia</b>
                <p style={{ fontSize: "12px", color: "#1E3A8A", margin: "4px 0 0", lineHeight: 1.4 }}>Biaya transaksi super irit (&lt; Rp100), cocok untuk tagihan berapa pun nominalnya.</p>
              </div>
            </div>

            <div style={footerStyle}>
              <span>Tim: Syifa Maulida (Desain & Produk) & Sultan Saladin (Sistem & Keamanan)</span>
              <span>Slide 1 / 5 • Waktu: 25 Detik</span>
            </div>
          </div>
        )}

        {/* SLIDE 2: MASALAH NYATA */}
        {currentSlide === 1 && (
          <div style={{ display: "flex", width: "100%", height: "100%", padding: "34px 42px", flexDirection: "column", justifyContent: "space-between", color: "#111827", background: "#FCFAF5" }}>
            <div>
              <div style={{ fontFamily: "var(--mono, monospace)", fontSize: "11px", fontWeight: 800, color: "#EA580C", marginBottom: "4px" }}>
                MASALAH NYATA DI LAPANGAN
              </div>
              <h2 style={{ fontSize: "28px", fontWeight: 900, letterSpacing: "-0.03em" }}>
                Kenapa Banyak Freelancer <span style={{ background: "#D9F99D", padding: "0 4px" }}>Terjepit Keuangan?</span>
              </h2>
            </div>

            <div className="pitch-grid-2" style={{ margin: "auto 0" }}>
              <div style={{ ...cardStyle, borderLeft: "6px solid #EF4444" }}>
                <b style={{ fontSize: "14.5px", display: "block", marginBottom: "5px" }}>⏳ Kerja Hari Ini, Baru Dibayar 1–3 Bulan Lagi</b>
                <p style={{ fontSize: "12.5px", color: "#4B5563", lineHeight: 1.5 }}>
                  Klien perusahaan sering punya aturan bayar tempo 30 sampai 90 hari. Padahal freelancer butuh makan, bayar listrik, dan biaya operasional setiap hari.
                </p>
              </div>

              <div style={{ ...cardStyle, borderLeft: "6px solid #EF4444" }}>
                <b style={{ fontSize: "14.5px", display: "block", marginBottom: "5px" }}>🏦 Mau Pinjam ke Bank? Pasti Ditolak!</b>
                <p style={{ fontSize: "12.5px", color: "#4B5563", lineHeight: 1.5 }}>
                  Bank selalu minta jaminan sertifikat tanah atau rumah. Tagihan freelancer bernilai 5–20 juta rupiah dinilai terlalu receh dan bikin repot pihak bank.
                </p>
              </div>

              <div style={{ ...cardStyle, borderLeft: "6px solid #EF4444" }}>
                <b style={{ fontSize: "14.5px", display: "block", marginBottom: "5px" }}>⚠️ Terpaksa Lari ke Pinjol Bunga Mencekik</b>
                <p style={{ fontSize: "12.5px", color: "#4B5563", lineHeight: 1.5 }}>
                  Karena kepepet nunggu honor cair, banyak yang nekat pakai pinjol berbunga 20–30% per bulan. Bukannya untung, malah gali lubang tutup lubang.
                </p>
              </div>

              <div style={{ ...cardStyle, borderLeft: "6px solid #EF4444" }}>
                <b style={{ fontSize: "14.5px", display: "block", marginBottom: "5px" }}>🛑 Sistem Manual Rawan Nota Tagihan Palsu</b>
                <p style={{ fontSize: "12.5px", color: "#4B5563", lineHeight: 1.5 }}>
                  Di perbankan konvensional, ada oknum yang memfotokopi 1 nota kertas lalu menjualnya berkali-kali ke beberapa pemodal berbeda (faktur bodong).
                </p>
              </div>
            </div>

            <div style={footerStyle}>
              <span>CashIn • Solusi Masalah Arus Kas Freelancer</span>
              <span>Slide 2 / 5 • Waktu: 30 Detik</span>
            </div>
          </div>
        )}

        {/* SLIDE 3: CARA KERJA & KEAMANAN */}
        {currentSlide === 2 && (
          <div style={{ display: "flex", width: "100%", height: "100%", padding: "34px 42px", flexDirection: "column", justifyContent: "space-between", color: "#111827", background: "#FCFAF5" }}>
            <div>
              <div style={{ fontFamily: "var(--mono, monospace)", fontSize: "11px", fontWeight: 800, color: "#EA580C", marginBottom: "4px" }}>
                SOLUSI KAMI
              </div>
              <h2 style={{ fontSize: "28px", fontWeight: 900, letterSpacing: "-0.03em" }}>
                3 Langkah Mudah: <span style={{ background: "#D9F99D", padding: "0 4px" }}>Ubah Tagihan Jadi Kas Tunai</span>
              </h2>
            </div>

            <div className="pitch-grid-2" style={{ margin: "auto 0", alignItems: "stretch" }}>
              {/* Kolom Kiri: 3 Langkah */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ ...cardStyle, padding: "12px 14px", display: "flex", gap: "14px", alignItems: "center" }}>
                  <div style={{ fontFamily: "var(--mono, monospace)", fontSize: "20px", fontWeight: 900, color: "#EA580C" }}>01</div>
                  <div>
                    <b style={{ fontSize: "13.5px" }}>Upload & Kunci Bukti Tagihan</b>
                    <p style={{ fontSize: "12px", color: "#4B5563", margin: "2px 0 0" }}>Freelancer upload tagihan yang disetujui klien. Sistem membuat bukti digital resmi yang anti-palsu.</p>
                  </div>
                </div>

                <div style={{ ...cardStyle, padding: "12px 14px", display: "flex", gap: "14px", alignItems: "center" }}>
                  <div style={{ fontFamily: "var(--mono, monospace)", fontSize: "20px", fontWeight: 900, color: "#059669" }}>02</div>
                  <div>
                    <b style={{ fontSize: "13.5px" }}>Uang Cair Detik Itu Juga</b>
                    <p style={{ fontSize: "12px", color: "#4B5563", margin: "2px 0 0" }}>Tagihan dijual dengan potongan wajar (misal diskon 8%). Pemodal mendanai, uang langsung masuk detik itu juga.</p>
                  </div>
                </div>

                <div style={{ ...cardStyle, padding: "12px 14px", display: "flex", gap: "14px", alignItems: "center" }}>
                  <div style={{ fontFamily: "var(--mono, monospace)", fontSize: "20px", fontWeight: 900, color: "#1E40AF" }}>03</div>
                  <div>
                    <b style={{ fontSize: "13.5px" }}>Klien Melunasi Pas Jatuh Tempo</b>
                    <p style={{ fontSize: "12px", color: "#4B5563", margin: "2px 0 0" }}>Saat jatuh tempo (misal 30 hari lagi), klien bayar 100% ke sistem, dan dana otomatis masuk ke pemodal.</p>
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Keamanan Anti-Tipu */}
              <div style={{ ...cardStyle, background: "#F0FDF4", borderColor: "#059669", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "inline-block", background: "#D1FAE5", border: "1px solid #059669", padding: "2px 8px", fontSize: "10.5px", fontWeight: 800, color: "#065F46", fontFamily: "var(--mono, monospace)", marginBottom: "8px" }}>
                    🔒 SISTEM ANTI-TIPU OTOMATIS
                  </div>
                  <h3 style={{ fontSize: "16px", fontWeight: 900, color: "#065F46", marginBottom: "6px" }}>
                    1 Tagihan Hanya Bisa Dicairkan 1 Kali!
                  </h3>
                  <p style={{ fontSize: "12.5px", color: "#1F2937", lineHeight: 1.5, marginBottom: "8px" }}>
                    Di bank biasa, petugas manusia bisa lalai mengecek nota ganda. Di CashIn, smart contract mengunci status secara otomatis:
                  </p>
                  <div style={{ background: "#FFFFFF", border: "1.5px solid #059669", padding: "8px 10px", borderRadius: "3px", marginBottom: "8px" }}>
                    <b style={{ color: "#065F46", fontSize: "12px", display: "block" }}>🛡️ Garansi Anti-Faktur Bodong:</b>
                    <span style={{ fontSize: "11.5px", color: "#374151" }}>Begitu sudah ada pemodal yang mencairkan, sistem seketika <b>menolak</b> upaya pencairan kedua. Tidak bisa dimanipulasi siapa pun!</span>
                  </div>
                  <p style={{ fontSize: "11.5px", color: "#4B5563", lineHeight: 1.4 }}>
                    Semua transaksi tercatat transparan di blockchain Base. Tidak ada celah penipuan manual.
                  </p>
                </div>

                <div style={{ background: "#FFFFFF", border: "1px solid #111827", padding: "6px 10px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "10.5px", fontWeight: 800, fontFamily: "var(--mono, monospace)" }}>
                  <span>Dibuat</span> &rarr; <span>Disetujui</span> &rarr; <span>Dipajang</span> &rarr; <span style={{ color: "#059669" }}>Dicairkan</span> &rarr; <span>Lunas</span>
                </div>
              </div>
            </div>

            <div style={footerStyle}>
              <span>CashIn • Alur Sederhana & Aman untuk Semua</span>
              <span>Slide 3 / 5 • Waktu: 50 Detik</span>
            </div>
          </div>
        )}

        {/* SLIDE 4: KEUNGGULAN & MODEL BISNIS */}
        {currentSlide === 3 && (
          <div style={{ display: "flex", width: "100%", height: "100%", padding: "34px 42px", flexDirection: "column", justifyContent: "space-between", color: "#111827", background: "#FCFAF5" }}>
            <div>
              <div style={{ fontFamily: "var(--mono, monospace)", fontSize: "11px", fontWeight: 800, color: "#EA580C", marginBottom: "4px" }}>
                KEUNGGULAN & POTENSI BISNIS
              </div>
              <h2 style={{ fontSize: "28px", fontWeight: 900, letterSpacing: "-0.03em" }}>
                Kenapa CashIn Lebih Baik & <span style={{ background: "#D9F99D", padding: "0 4px" }}>Dari Mana Kami Untung?</span>
              </h2>
            </div>

            <div className="pitch-grid-custom-4" style={{ margin: "auto 0", alignItems: "stretch" }}>
              {/* Kolom Kiri: Tabel Perbandingan */}
              <div>
                <table className="pitch-table">
                  <thead>
                    <tr>
                      <th>Perbandingan</th>
                      <th>Pinjol / Bank Biasa</th>
                      <th style={{ background: "#D9F99D" }}>CashIn</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><b>Waktu Cair</b></td>
                      <td>Nunggu 3–14 hari kerja</td>
                      <td style={{ background: "#F4F9D8" }}><b>Detik itu juga langsung cair</b></td>
                    </tr>
                    <tr>
                      <td><b>Beban Biaya</b></td>
                      <td>Bunga utang bulanan (20–30%)</td>
                      <td style={{ background: "#F4F9D8" }}><b>Bukan utang! Cuma diskon wajar sekali bayar</b></td>
                    </tr>
                    <tr>
                      <td><b>Syarat Jaminan</b></td>
                      <td>Wajib tanah / akses kontak HP</td>
                      <td style={{ background: "#F4F9D8" }}><b>Tanpa jaminan (Cukup bukti kerjaan asli)</b></td>
                    </tr>
                    <tr>
                      <td><b>Keamanan</b></td>
                      <td>Rawan nota dipalsukan</td>
                      <td style={{ background: "#F4F9D8" }}><b>100% Anti-Palsu via sistem otomatis</b></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Kolom Kanan: Pemasukan & Potensi */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ ...cardStyle, background: "#FFFFFF", padding: "12px 14px" }}>
                  <div style={{ fontFamily: "var(--mono, monospace)", fontSize: "10.5px", fontWeight: 800, color: "#EA580C" }}>DARI MANA CASHIN DAPAT UNTUNG?</div>
                  <b style={{ fontSize: "13px", display: "block", marginTop: "3px" }}>Biaya Layanan Sangat Kecil & Jelas</b>
                  <p style={{ fontSize: "12px", color: "#4B5563", margin: "3px 0 0", lineHeight: 1.45 }}>
                    • <b>0.5% – 1%</b> dipotong saat uang cair ke freelancer.<br />
                    • <b>0.25%</b> biaya administrasi saat klien melunasi tagihan.<br />
                    <i>Arus kas jelas tanpa membebani siapapun.</i>
                  </p>
                </div>

                <div style={{ ...cardStyle, background: "#D9F99D", padding: "12px 14px" }}>
                  <div style={{ fontFamily: "var(--mono, monospace)", fontSize: "10.5px", fontWeight: 800, color: "#166534" }}>PASAR SANGAT BESAR</div>
                  <b style={{ fontSize: "13px", display: "block", marginTop: "3px" }}>140 Juta+ Pekerja Gig di ASEAN</b>
                  <p style={{ fontSize: "12px", color: "#14532D", margin: "3px 0 0", lineHeight: 1.45 }}>
                    Biaya transaksi di Base super murah (&lt; Rp100), jadi tagihan bernilai 1 sampai 10 juta rupiah tetap sangat masuk akal dicairkan!
                  </p>
                </div>
              </div>
            </div>

            <div style={footerStyle}>
              <span>CashIn • Solusi Nyata yang Berkelanjutan</span>
              <span>Slide 4 / 5 • Waktu: 40 Detik</span>
            </div>
          </div>
        )}

        {/* SLIDE 5: SUDAH JALAN & RENCANA KE DEPAN */}
        {currentSlide === 4 && (
          <div style={{ display: "flex", width: "100%", height: "100%", padding: "34px 42px", flexDirection: "column", justifyContent: "space-between", color: "#111827", background: "#FCFAF5" }}>
            <div>
              <div style={{ fontFamily: "var(--mono, monospace)", fontSize: "11px", fontWeight: 800, color: "#EA580C", marginBottom: "4px" }}>
                BUKTI NYATA & RENCANA
              </div>
              <h2 style={{ fontSize: "28px", fontWeight: 900, letterSpacing: "-0.03em" }}>
                Sudah Bisa Dicoba Langsung & <span style={{ background: "#D9F99D", padding: "0 4px" }}>Siap Dikembangkan</span>
              </h2>
            </div>

            <div className="pitch-grid-2" style={{ margin: "auto 0", alignItems: "stretch" }}>
              {/* Kolom Kiri: Status Live */}
              <div style={{ ...cardStyle, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#D1FAE5", border: "1px solid #059669", padding: "2px 8px", fontSize: "10.5px", fontWeight: 800, color: "#065F46", fontFamily: "var(--mono, monospace)", marginBottom: "8px" }}>
                    🟢 SUDAH AKTIF DI BASE SEPOLIA TESTNET
                  </div>
                  <b style={{ fontSize: "14px", display: "block", marginBottom: "4px" }}>Aplikasi Bukan Sekadar Konsep</b>
                  <p style={{ fontSize: "12px", color: "#374151", lineHeight: 1.5, margin: "0 0 8px 0" }}>
                    Smart contract CashIn sudah berjalan di blockchain Base. Pencairan dan pelunasan uang digital (USDC) langsung berpindah otomatis tanpa perantara pihak ketiga.
                  </p>
                </div>

                <div style={{ background: "#F9FAFB", border: "1.5px solid #111827", padding: "10px 12px" }}>
                  <b style={{ fontSize: "12px", display: "block", marginBottom: "3px" }}>💻 Siap Pakai & Mudah Digunakan</b>
                  <div style={{ fontSize: "11.5px", color: "#4B5563", lineHeight: 1.45 }}>
                    Website responsif, terhubung langsung ke dompet digital, dan sudah lolos 100% uji coba pengujian sistem.
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Tim & Roadmap */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ ...cardStyle, padding: "12px 14px" }}>
                  <div style={{ fontFamily: "var(--mono, monospace)", fontSize: "10.5px", fontWeight: 800, color: "#EA580C" }}>SIAPA DI BALIK CASHIN?</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
                    <div>
                      <b style={{ fontSize: "13px" }}>Syifa Maulida</b>
                      <span style={{ fontSize: "11.5px", color: "#4B5563" }}> — Desain Produk & Tampilan Web (bikin dApp semudah aplikasi perbankan biasa).</span>
                    </div>
                    <div>
                      <b style={{ fontSize: "13px" }}>Sultan Saladin Pahlevi</b>
                      <span style={{ fontSize: "11.5px", color: "#4B5563" }}> — Sistem Blockchain & Keamanan (bikin smart contract otomatis & anti-kebobolan).</span>
                    </div>
                  </div>
                </div>

                <div style={{ ...cardStyle, background: "#FAF7F0", padding: "12px 14px" }}>
                  <div style={{ fontFamily: "var(--mono, monospace)", fontSize: "10.5px", fontWeight: 800, color: "#1E40AF" }}>RENCANA KE DEPAN</div>
                  <div style={{ fontSize: "11.5px", color: "#374151", lineHeight: 1.5, marginTop: "4px" }}>
                    • <b>Bisa login pakai akun Google/email biasa</b>, jadi freelancer gak perlu pusing bikin dompet kripto.<br />
                    • <b>Bisa langsung cair ke rekening Rupiah (IDR)</b> lewat kerjasama bank/fintech lokal.<br />
                    • Kerjasama langsung dengan platform freelance (Fastwork, Sribulancer, dll).
                  </div>
                </div>
              </div>
            </div>

            <div style={footerStyle}>
              <span>CashIn • Solusi Nyata untuk Freelancer Indonesia • Terima Kasih!</span>
              <span>Slide 5 / 5 • Waktu: 35 Detik</span>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
