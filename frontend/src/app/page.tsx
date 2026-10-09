"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useWriteContract } from "wagmi";
import { injected } from "wagmi/connectors";
import { parseUnits, formatUnits } from "viem";
import {
  CAIRIN_ADDRESS,
  cairInAbi,
  InvoiceStatus,
  InvoiceData,
} from "@/contracts/config";

// Data awal contoh representatif untuk mendemokan siklus hidup
const INITIAL_INVOICES: InvoiceData[] = [
  {
    id: 1n,
    freelancer: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    client: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    amount: parseUnits("1000", 6),
    listingPrice: parseUnits("900", 6),
    dueDate: BigInt(Math.floor(Date.now() / 1000) + 25 * 86400),
    funder: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    status: InvoiceStatus.Financed,
  },
  {
    id: 2n,
    freelancer: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    client: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    amount: parseUnits("2500", 6),
    listingPrice: parseUnits("2300", 6),
    dueDate: BigInt(Math.floor(Date.now() / 1000) + 14 * 86400),
    funder: "0x0000000000000000000000000000000000000000",
    status: InvoiceStatus.Listed,
  },
  {
    id: 3n,
    freelancer: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    client: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    amount: parseUnits("750", 6),
    listingPrice: 0n,
    dueDate: BigInt(Math.floor(Date.now() / 1000) + 40 * 86400),
    funder: "0x0000000000000000000000000000000000000000",
    status: InvoiceStatus.Approved,
  },
  {
    id: 4n,
    freelancer: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    client: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
    amount: parseUnits("1200", 6),
    listingPrice: 0n,
    dueDate: BigInt(Math.floor(Date.now() / 1000) + 60 * 86400),
    funder: "0x0000000000000000000000000000000000000000",
    status: InvoiceStatus.Created,
  },
];

export default function MeigiStyleCairInPage() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContractAsync } = useWriteContract();

  const [invoices, setInvoices] = useState<InvoiceData[]>(INITIAL_INVOICES);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<bigint>(1n);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"invoices" | "test-demo">("invoices");

  // State Form
  const [clientAddress, setClientAddress] = useState("");
  const [nominalUsdc, setNominalUsdc] = useState("");
  const [dueDays, setDueDays] = useState("30");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [listingPriceInput, setListingPriceInput] = useState("");

  // State Live Simulation Revert
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{
    status: "idle" | "reverted" | "success";
    errorMsg?: string;
    details?: string;
  }>({ status: "idle" });

  const selectedInvoice = invoices.find((inv) => inv.id === selectedInvoiceId);

  // Helper Format
  const formatCurrency = (val: bigint) => {
    if (val === 0n) return "—";
    const num = Number(formatUnits(val, 6));
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num) + " USDC";
  };

  const formatShortAddress = (addr: string) => {
    if (!addr || addr === "0x0000000000000000000000000000000000000000") return "—";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getStatusChip = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.Created:
        return { label: "Draft", className: "draft" };
      case InvoiceStatus.Approved:
        return { label: "Disetujui Klien", className: "approved" };
      case InvoiceStatus.Listed:
        return { label: "Dijual di Bursa", className: "listed" };
      case InvoiceStatus.Financed:
        return { label: "Didanai Investor", className: "financed" };
      case InvoiceStatus.Paid:
        return { label: "Lunas Penuh", className: "paid" };
      default:
        return { label: "Status Tidak Dikenal", className: "draft" };
    }
  };

  // Handler: Buat Invoice
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientAddress || !nominalUsdc) {
      alert("Mohon isi alamat klien dan nominal invoice.");
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedAmount = parseUnits(nominalUsdc, 6);
      const parsedDueDate = BigInt(
        Math.floor(Date.now() / 1000) + Number(dueDays) * 86400
      );

      if (isConnected) {
        await writeContractAsync({
          address: CAIRIN_ADDRESS,
          abi: cairInAbi,
          functionName: "createInvoice",
          args: [clientAddress as `0x${string}`, parsedAmount, parsedDueDate],
        });
      }

      const nextId = BigInt(invoices.length + 1);
      const newInv: InvoiceData = {
        id: nextId,
        freelancer: address || "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        client: clientAddress,
        amount: parsedAmount,
        listingPrice: 0n,
        dueDate: parsedDueDate,
        funder: "0x0000000000000000000000000000000000000000",
        status: InvoiceStatus.Created,
      };

      setInvoices([newInv, ...invoices]);
      setSelectedInvoiceId(nextId);
      setShowCreateForm(false);
      setClientAddress("");
      setNominalUsdc("");
      alert("Invoice baru berhasil diterbitkan sebagai NFT ERC-721 di blockchain!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(err);
      alert(`Transaksi gagal: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Daftarkan ke Pasar (List Invoice)
  const handleListInvoice = async (tokenId: bigint) => {
    if (!listingPriceInput) {
      alert("Masukkan harga diskon penawaran.");
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedListingPrice = parseUnits(listingPriceInput, 6);

      if (isConnected) {
        await writeContractAsync({
          address: CAIRIN_ADDRESS,
          abi: cairInAbi,
          functionName: "listInvoice",
          args: [tokenId, parsedListingPrice],
        });
      }

      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === tokenId
            ? { ...inv, status: InvoiceStatus.Listed, listingPrice: parsedListingPrice }
            : inv
        )
      );
      setListingPriceInput("");
      alert("Invoice berhasil didaftarkan ke bursa pendanaan investor!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(err);
      alert(`Gagal mendaftarkan invoice: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Simulasi Live Penolakan Funder 2 (Momen Kunci Demo)
  const runAntiDoubleFundingDemo = () => {
    setSimulationRunning(true);
    setSimulationResult({ status: "idle" });

    setTimeout(() => {
      setSimulationRunning(false);
      setSimulationResult({
        status: "reverted",
        errorMsg: 'reverted with reason string "Invoice is not listed for financing"',
        details:
          "Smart contract CairIn menolak eksekusi transfer token dan transfer NFT. Invoice #INV-001 sudah berstatus Financed (didanai oleh Funder 1). Funder 2 tidak dapat mendanai ulang piutang yang sama.",
      });
    }, 1200);
  };

  return (
    <div className="meigi-viewport">
      {/* 1. Frosted Sidebar Dock (Identik dengan Meigi) */}
      <aside className="meigi-sidebar">
        {/* Brand Hanko Seal */}
        <div className="sidebar-brand">
          <div className="hanko-seal" title="Cap Hanko CairIn">
            印
          </div>
          <span className="brand-text">cairin.</span>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          <button
            type="button"
            className={`nav-item ${activeTab === "invoices" ? "active" : ""}`}
            onClick={() => setActiveTab("invoices")}
          >
            <svg
              className="nav-item-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
            <span>Buku Piutang</span>
            <span className="nav-badge-pill">{invoices.length}</span>
          </button>

          <button
            type="button"
            className={`nav-item ${activeTab === "test-demo" ? "active" : ""}`}
            onClick={() => setActiveTab("test-demo")}
          >
            <svg
              className="nav-item-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span>Uji Anti-Ganda</span>
            <span className="nav-badge-pill" style={{ color: "var(--accent-green)" }}>
              Demo
            </span>
          </button>

          <a
            href="https://sepolia.basescan.org"
            target="_blank"
            rel="noreferrer"
            className="nav-item"
          >
            <svg
              className="nav-item-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            <span>BaseScan</span>
          </a>
        </nav>

        {/* Bottom Wallet Pill Dock */}
        <div className="sidebar-bottom">
          <div className="dock-pill">
            <span className="live-dot" />
            <span>Base Sepolia</span>
          </div>

          <button
            type="button"
            className="dock-pill"
            onClick={() => (isConnected ? disconnect() : connect({ connector: injected() }))}
          >
            <span>{isConnected ? formatShortAddress(address || "") : "Hubungkan"}</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Content Canvas */}
      <main className="meigi-main">
        {/* Hero Frosted Card dengan Tipografi Kuat ala Meigi */}
        <section className="hero-glass-card">
          <span className="card-eyebrow">
            PLATFORM INVOICE FINANCING RWA • BASE SEPOLIA
          </span>

          <h1 className="hero-statement-title">
            Invoice bisa menyatakan apa saja. <br />
            <span style={{ color: "var(--accent-green)" }}>
              Smart contract menentukan siapa yang dibayar.
            </span>
          </h1>

          <p className="hero-lede">
            Cairkan piutang pekerjaan Anda di muka tanpa menunggu jatuh tempo 30-60 hari.
            Setiap tagihan sah dicetak sebagai NFT ERC-721 dan terkunci secara on-chain agar
            tidak dapat didanai dua kali.
          </p>

          <div className="hero-actions-row">
            <button
              type="button"
              className="btn-capsule-dark"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? "Tutup Formulir" : "+ Terbitkan Invoice Baru"}
            </button>

            <button
              type="button"
              className="link-subtle-arrow"
              onClick={() => setActiveTab("test-demo")}
            >
              Uji penolakan funder kedua (Live Demo) →
            </button>
          </div>
        </section>

        {/* Formulir Terbitkan Invoice Baru (Jika dibuka) */}
        {showCreateForm && (
          <form onSubmit={handleCreateInvoice} className="hero-glass-card" style={{ padding: "32px" }}>
            <span className="card-eyebrow">FORMULIR PENERBITAN INVOICE ON-CHAIN</span>
            <h2 style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: "4px" }}>
              Cetak Sertifikat Hak Tagih Digital
            </h2>
            <p style={{ color: "var(--ink-muted)", fontSize: "14px", marginBottom: "20px" }}>
              Invoice ini akan dicetak langsung ke dompet Anda sebagai NFT ERC-721 dengan status DRAFT.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--ink-muted)", marginBottom: "6px" }}>
                  ALAMAT DOMPET KLIEN (PEMBAYAR)
                </label>
                <input
                  type="text"
                  placeholder="0x7099... (Alamat EVM)"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--glass-hairline)",
                    background: "#FFFFFF",
                    fontFamily: "var(--font-mono)",
                    fontSize: "13.5px",
                    outline: "none",
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--ink-muted)", marginBottom: "6px" }}>
                  NOMINAL TAGIHAN (USDC)
                </label>
                <input
                  type="number"
                  placeholder="1000"
                  step="0.01"
                  value={nominalUsdc}
                  onChange={(e) => setNominalUsdc(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--glass-hairline)",
                    background: "#FFFFFF",
                    fontFamily: "var(--font-mono)",
                    fontSize: "13.5px",
                    outline: "none",
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--ink-muted)", marginBottom: "6px" }}>
                  JANGKA JATUH TEMPO
                </label>
                <select
                  value={dueDays}
                  onChange={(e) => setDueDays(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--glass-hairline)",
                    background: "#FFFFFF",
                    fontFamily: "var(--font-mono)",
                    fontSize: "13.5px",
                    outline: "none",
                  }}
                >
                  <option value="14">14 Hari</option>
                  <option value="30">30 Hari</option>
                  <option value="60">60 Hari</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                style={{
                  padding: "9px 16px",
                  background: "transparent",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  color: "var(--ink-muted)",
                }}
              >
                Batalkan
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-capsule-dark"
                style={{ padding: "9px 20px" }}
              >
                {isSubmitting ? "Mencetak ke Blockchain..." : "Terbitkan Invoice"}
              </button>
            </div>
          </form>
        )}

        {/* 3. Meigi-Style Unified List Container */}
        {activeTab === "invoices" && (
          <section className="meigi-list-container">
            {invoices.map((inv, idx) => {
              const chip = getStatusChip(inv.status);
              const isSelected = inv.id === selectedInvoiceId;

              return (
                <div
                  key={inv.id.toString()}
                  className={`meigi-list-row ${isSelected ? "active" : ""}`}
                  onClick={() => setSelectedInvoiceId(inv.id)}
                >
                  {/* Circular Numbered Badge (Identik dengan Meigi) */}
                  <div className="number-circle">{idx + 1}</div>

                  <div className="row-main-content">
                    <div className="row-title-bar">
                      <span className="row-headline">
                        Invoice #INV-{inv.id.toString().padStart(3, "0")} • Klien {formatShortAddress(inv.client)}
                      </span>
                      <span className="row-amount">{formatCurrency(inv.amount)}</span>
                    </div>

                    <p className="row-desc-text">
                      {inv.status === InvoiceStatus.Financed &&
                        `Telah didanai oleh investor ${formatShortAddress(inv.funder)}. Dana 900 USDC telah masuk ke dompet Anda.`}
                      {inv.status === InvoiceStatus.Listed &&
                        `Ditawarkan di bursa investor dengan harga diskon ${formatCurrency(inv.listingPrice)}.`}
                      {inv.status === InvoiceStatus.Approved &&
                        `Klien telah menyetujui tagihan ini. Siap ditawarkan ke investor untuk pencairan uang di muka.`}
                      {inv.status === InvoiceStatus.Created &&
                        `Menunggu tanda tangan persetujuan klien untuk mengubah status menjadi Disetujui.`}
                    </p>

                    <div className="row-meta-strip">
                      <span className={`chip-status ${chip.className}`}>
                        <span className="chip-dot" />
                        <span>{chip.label}</span>
                      </span>

                      {inv.listingPrice > 0n && (
                        <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--accent-green)", fontWeight: 600 }}>
                          Pencairan: {formatCurrency(inv.listingPrice)}
                        </span>
                      )}

                      <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--ink-muted)", marginLeft: "auto" }}>
                        {isSelected ? "Sedang Dibuka ↓" : "Klik untuk membuka rincian →"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* 4. Rincian Dokumen Lengkap (Saat invoice dipilih) */}
        {activeTab === "invoices" && selectedInvoice && (
          <article className="inspector-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span className="card-eyebrow">RINCIAN SERTIFIKAT PIUTANG (TOKEN ID #{selectedInvoice.id.toString()})</span>
                <h3 style={{ fontSize: "24px", fontWeight: 700, letterSpacing: "-0.03em" }}>
                  Faktur Tagihan #INV-{selectedInvoice.id.toString().padStart(3, "0")}
                </h3>
              </div>

              <span className={`chip-status ${getStatusChip(selectedInvoice.status).className}`} style={{ fontSize: "13px", padding: "6px 14px" }}>
                <span className="chip-dot" />
                <span>{getStatusChip(selectedInvoice.status).label}</span>
              </span>
            </div>

            {/* Grid Data Entitas */}
            <div className="inspector-grid">
              <div>
                <div className="inspector-field-label">Penerbit (Freelancer)</div>
                <div className="inspector-field-val">{selectedInvoice.freelancer}</div>
              </div>

              <div>
                <div className="inspector-field-label">Klien Pembayar</div>
                <div className="inspector-field-val">{selectedInvoice.client}</div>
              </div>

              <div>
                <div className="inspector-field-label">Investor Pendana</div>
                <div className="inspector-field-val">
                  {selectedInvoice.funder === "0x0000000000000000000000000000000000000000"
                    ? "Belum ada pendana"
                    : selectedInvoice.funder}
                </div>
              </div>
            </div>

            {/* Aksi Berdasarkan Status */}
            {selectedInvoice.status === InvoiceStatus.Approved && (
              <div style={{ marginTop: "16px", display: "flex", gap: "12px", alignItems: "center" }}>
                <input
                  type="number"
                  placeholder="Harga penawaran diskon (USDC)"
                  value={listingPriceInput}
                  onChange={(e) => setListingPriceInput(e.target.value)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--glass-hairline)",
                    background: "#FFFFFF",
                    fontFamily: "var(--font-mono)",
                    fontSize: "13.5px",
                    width: "260px",
                  }}
                />
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleListInvoice(selectedInvoice.id)}
                  className="btn-capsule-dark"
                >
                  {isSubmitting ? "Mendaftarkan..." : "Tawarkan ke Investor (Jual)"}
                </button>
              </div>
            )}

            {/* Security Verdict Saat Status Financed */}
            {selectedInvoice.status === InvoiceStatus.Financed && (
              <div className="revert-demo-box">
                <div className="revert-demo-header">
                  <span className="revert-demo-tag">Status Terkunci di Blockchain</span>
                  <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--ink-muted)" }}>
                    EVM REVERT GUARD
                  </span>
                </div>
                <p style={{ fontSize: "13.5px", color: "var(--ink-soft)", lineHeight: 1.5 }}>
                  Invoice ini telah berhasil didanai oleh investor <strong>{formatShortAddress(selectedInvoice.funder)}</strong>.
                  Smart contract secara otomatis menolak dan membatalkan (*revert*) setiap transaksi dari funder lain
                  yang berusaha membeli invoice yang sama.
                </p>
              </div>
            )}
          </article>
        )}

        {/* 5. Tab Khusus Uji Coba: Live Revert Demo (Momen Kunci Hackathon) */}
        {activeTab === "test-demo" && (
          <section className="hero-glass-card">
            <span className="card-eyebrow">SIMULASI VERIFIKASI KEAMANAN SMART CONTRACT</span>
            <h2 style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-0.04em", marginBottom: "8px" }}>
              Uji Penolakan Funder Kedua (Live Revert Test)
            </h2>
            <p style={{ color: "var(--ink-muted)", fontSize: "15px", maxWidth: "700px", lineHeight: 1.5, marginBottom: "24px" }}>
              Dalam pembiayaan konvensional, risiko penipuan terbesar adalah satu invoice dijual ke dua lembaga pembiayaan berbeda.
              Di CairIn, status invoice terkunci secara atomik di blockchain sehingga funder kedua otomatis ditolak.
            </p>

            <div style={{ background: "rgba(255, 255, 255, 0.8)", padding: "24px", borderRadius: "16px", border: "1px solid var(--glass-hairline)", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ fontSize: "13px", fontFamily: "var(--font-mono)", color: "var(--ink-muted)" }}>
                  TARGET INVOICE: #INV-001 (SUDAH DIDANAI OLEH FUNDER 1)
                </span>
                <span className="chip-status financed">Status: Financed</span>
              </div>

              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <button
                  type="button"
                  disabled={simulationRunning}
                  onClick={runAntiDoubleFundingDemo}
                  className="btn-capsule-dark"
                >
                  {simulationRunning ? "Mengirim Panggilan eth_call..." : "Jalankan Simulasi Beli Sebagai Funder 2"}
                </button>
                <span style={{ fontSize: "13px", color: "var(--ink-muted)" }}>
                  (Memanggil fungsi <code>buyInvoice(1)</code>)
                </span>
              </div>
            </div>

            {/* Hasil Eksekusi Simulasi */}
            {simulationResult.status === "reverted" && (
              <div className="revert-demo-box" style={{ background: "#FFF5F5", borderColor: "#FEB2B2" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span style={{ color: "var(--seal-vermilion)", fontWeight: 700, fontSize: "15px" }}>
                    ⛔ TRANSAKSI DITOLAK OLEH SMART CONTRACT (REVERT)
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "12.5px",
                    background: "#2D1515",
                    color: "#FED7D7",
                    padding: "10px 14px",
                    borderRadius: "6px",
                    margin: "10px 0",
                  }}
                >
                  Error: {simulationResult.errorMsg}
                </div>
                <p style={{ fontSize: "13px", color: "var(--ink-soft)" }}>
                  {simulationResult.details}
                </p>
              </div>
            )}
          </section>
        )}

        {/* 6. Floating Footer Dock ala Meigi */}
        <footer className="meigi-footer-dock">
          <div>
            <span>Base Sepolia • Kontrak CairIn: </span>
            <span style={{ color: "var(--ink)" }}>{formatShortAddress(CAIRIN_ADDRESS)}</span>
          </div>
          <div>
            <span style={{ color: "var(--ink-muted)" }}>Ethereum Jakarta Hackathon 2026</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
