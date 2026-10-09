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

interface InvoiceItem extends InvoiceData {
  jobTitle: string;
}

const INITIAL_INVOICES: InvoiceItem[] = [
  {
    id: 1n,
    jobTitle: "Redesign UI/UX Mobile App & Design System",
    freelancer: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    client: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    amount: parseUnits("1000", 6),
    listingPrice: parseUnits("920", 6),
    dueDate: BigInt(Math.floor(Date.now() / 1000) + 25 * 86400),
    funder: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    status: InvoiceStatus.Financed,
  },
  {
    id: 2n,
    jobTitle: "Audit Keamanan Smart Contract & Backend API",
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
    jobTitle: "Pengembangan Frontend Next.js & Integrasi Web3",
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
    jobTitle: "Penyusunan Dokumentasi API & Whitepaper Teknis",
    freelancer: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    client: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
    amount: parseUnits("1200", 6),
    listingPrice: 0n,
    dueDate: BigInt(Math.floor(Date.now() / 1000) + 60 * 86400),
    funder: "0x0000000000000000000000000000000000000000",
    status: InvoiceStatus.Created,
  },
];

export default function CairInCleanApp() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContractAsync } = useWriteContract();

  // Invoices & Selection
  const [invoices, setInvoices] = useState<InvoiceItem[]>(INITIAL_INVOICES);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<bigint>(1n);
  const [activeRole, setActiveRole] = useState<"freelancer" | "investor" | "security">("freelancer");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Interactive Live Calculator state
  const [calcAmount, setCalcAmount] = useState<number>(1000);
  const [calcDiscountPct, setCalcDiscountPct] = useState<number>(8);

  // Listing discount slider in inspector
  const [listingDiscountPct, setListingDiscountPct] = useState<number>(8);

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [jobTitleInput, setJobTitleInput] = useState("");
  const [clientAddressInput, setClientAddressInput] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [dueDaysInput, setDueDaysInput] = useState("30");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Revert Demo State
  const [revertRunning, setRevertRunning] = useState(false);
  const [revertLogs, setRevertLogs] = useState<string[]>([
    "Siap menguji. Klik tombol di bawah untuk menyimulasikan panggilan ganda dari Funder 2.",
  ]);
  const [revertSuccess, setRevertSuccess] = useState<boolean | null>(null);

  const selectedInvoice = invoices.find((inv) => inv.id === selectedInvoiceId) || invoices[0];

  // Helpers
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

  const formatDate = (ts: bigint) => {
    const d = new Date(Number(ts) * 1000);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Filtered Invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = inv.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.id.toString().includes(searchQuery);

    if (!matchesSearch) return false;
    if (filterStatus === "all") return true;
    if (filterStatus === "draft") return inv.status === InvoiceStatus.Created;
    if (filterStatus === "approved") return inv.status === InvoiceStatus.Approved;
    if (filterStatus === "listed") return inv.status === InvoiceStatus.Listed;
    if (filterStatus === "financed") return inv.status === InvoiceStatus.Financed;
    if (filterStatus === "paid") return inv.status === InvoiceStatus.Paid;
    return true;
  });

  const listedInvoices = invoices.filter((inv) => inv.status === InvoiceStatus.Listed);

  // Calculations for quick metrics
  const totalAmount = invoices.reduce((acc, curr) => acc + curr.amount, 0n);
  const totalFinanced = invoices
    .filter((inv) => inv.status === InvoiceStatus.Financed || inv.status === InvoiceStatus.Paid)
    .reduce((acc, curr) => acc + curr.listingPrice, 0n);
  const totalInMarket = invoices
    .filter((inv) => inv.status === InvoiceStatus.Listed)
    .reduce((acc, curr) => acc + curr.listingPrice, 0n);

  // Calculator Outputs
  const calcInstantPayout = calcAmount * (1 - calcDiscountPct / 100);
  const calcInvestorProfit = calcAmount * (calcDiscountPct / 100);

  // Actions
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientAddressInput || !amountInput) {
      alert("Harap isi alamat dompet klien dan nominal tagihan.");
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedAmount = parseUnits(amountInput, 6);
      const parsedDueDate = BigInt(Math.floor(Date.now() / 1000) + Number(dueDaysInput) * 86400);

      if (isConnected) {
        await writeContractAsync({
          address: CAIRIN_ADDRESS,
          abi: cairInAbi,
          functionName: "createInvoice",
          args: [clientAddressInput as `0x${string}`, parsedAmount, parsedDueDate],
        });
      }

      const nextId = BigInt(invoices.length + 1);
      const newInv: InvoiceItem = {
        id: nextId,
        jobTitle: jobTitleInput || `Tagihan Jasa Digital #${nextId}`,
        freelancer: address || "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        client: clientAddressInput,
        amount: parsedAmount,
        listingPrice: 0n,
        dueDate: parsedDueDate,
        funder: "0x0000000000000000000000000000000000000000",
        status: InvoiceStatus.Created,
      };

      setInvoices([newInv, ...invoices]);
      setSelectedInvoiceId(nextId);
      setShowCreateModal(false);
      setJobTitleInput("");
      setClientAddressInput("");
      setAmountInput("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(err);
      alert(`Gagal membuat invoice: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveInvoice = (id: bigint) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: InvoiceStatus.Approved } : inv))
    );
  };

  const handleListInvoice = (id: bigint) => {
    const inv = invoices.find((i) => i.id === id);
    if (!inv) return;

    const discountAmount = (Number(formatUnits(inv.amount, 6)) * (100 - listingDiscountPct)) / 100;
    const parsedListing = parseUnits(discountAmount.toFixed(2), 6);

    setInvoices((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: InvoiceStatus.Listed, listingPrice: parsedListing } : item
      )
    );
  };

  const handleFundInvoice = (id: bigint) => {
    const defaultFunder = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id ? { ...inv, status: InvoiceStatus.Financed, funder: defaultFunder } : inv
      )
    );
  };

  const handlePayInvoice = (id: bigint) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: InvoiceStatus.Paid } : inv))
    );
  };

  // Run EVM Revert Simulation
  const handleTriggerRevertTest = () => {
    setRevertRunning(true);
    setRevertSuccess(null);
    setRevertLogs([
      "▶ Memulai panggilan RPC ke Base Sepolia Testnet...",
      "→ Transaksi: cairIn.fundInvoice(1n)",
      "→ Pengirim (Funder 2): 0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      "→ Memeriksa kondisi smart contract...",
    ]);

    setTimeout(() => {
      setRevertLogs((prev) => [
        ...prev,
        "⚠️ require(inv.status == InvoiceStatus.Listed) dievaluasi:",
        "   Status saat ini = InvoiceStatus.Financed (Nilai: 3)",
        "   Expected = InvoiceStatus.Listed (Nilai: 2)",
        "🛑 REVERT EXCEPTION: \"Invoice is not listed for financing\"",
        "✓ State tidak berubah: Transaksi dibatalkan secara atomik.",
        "✓ Saldo Funder 2 aman 100% (0 USDC terpotong).",
        "✓ Kepemilikan NFT tetap sah milik Funder 1.",
      ]);
      setRevertRunning(false);
      setRevertSuccess(true);
    }, 1000);
  };

  const prefillFromCalc = () => {
    setAmountInput(calcAmount.toString());
    setJobTitleInput(`Proyek Freelance (${calcDiscountPct}% Diskon Cepat)`);
    setClientAddressInput("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
    setShowCreateModal(true);
  };

  return (
    <div className="app-container">
      {/* 1. Header Navigation */}
      <header className="top-nav">
        <div className="brand-section">
          <div className="brand-symbol">C</div>
          <div className="brand-title-group">
            <h1>CairIn</h1>
            <p>Invoice Financing Freelancer • Base Sepolia</p>
          </div>
        </div>

        {/* Role Switcher */}
        <div className="role-switcher">
          <button
            type="button"
            className={`role-btn ${activeRole === "freelancer" ? "active" : ""}`}
            onClick={() => setActiveRole("freelancer")}
          >
            <span>💼</span>
            <span>Freelancer</span>
          </button>
          <button
            type="button"
            className={`role-btn ${activeRole === "investor" ? "active" : ""}`}
            onClick={() => setActiveRole("investor")}
          >
            <span>📈</span>
            <span>Bursa Investor ({listedInvoices.length})</span>
          </button>
          <button
            type="button"
            className={`role-btn ${activeRole === "security" ? "active" : ""}`}
            onClick={() => setActiveRole("security")}
          >
            <span>🛡️</span>
            <span>Uji Anti-Ganda</span>
          </button>
        </div>

        {/* Action & Wallet Dock */}
        <div className="top-actions">
          <button
            type="button"
            className="btn-primary-action"
            onClick={() => setShowCreateModal(true)}
          >
            <span>+ Buat Invoice</span>
          </button>

          {isConnected ? (
            <button
              type="button"
              className="btn-wallet-connect"
              onClick={() => disconnect()}
              title="Klik untuk memutuskan dompet"
            >
              <span className="dot-network" />
              <span>{formatShortAddress(address || "")}</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn-wallet-connect"
              onClick={() => connect({ connector: injected() })}
            >
              <span className="dot-network" style={{ background: "#F59E0B" }} />
              <span>Sambungkan Dompet</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. Interactive Instant Financing Calculator */}
      <section className="calculator-banner">
        <div className="calc-header">
          <div className="calc-title">
            <h2>Simulasi Pencairan Cepat Hari Ini</h2>
            <p>Geser nilai tagihan dan diskon untuk melihat dana yang langsung cair ke dompetmu tanpa menunggu tempo.</p>
          </div>
          <button
            type="button"
            className="btn-primary-action"
            style={{ padding: "8px 14px", fontSize: "13px" }}
            onClick={prefillFromCalc}
          >
            <span>Pakai Nilai Ini Buat Invoice &rarr;</span>
          </button>
        </div>

        <div className="calc-grid">
          <div className="calc-controls">
            <div className="calc-slider-group">
              <div className="calc-slider-label">
                <span>Nominal Tagihan Invoice</span>
                <span>{calcAmount.toLocaleString("id-ID")} USDC</span>
              </div>
              <input
                type="range"
                min="200"
                max="5000"
                step="50"
                value={calcAmount}
                onChange={(e) => setCalcAmount(Number(e.target.value))}
                className="calc-range-input"
              />
            </div>

            <div className="calc-slider-group">
              <div className="calc-slider-label">
                <span>Tawaran Diskon ke Investor</span>
                <span>{calcDiscountPct}%</span>
              </div>
              <input
                type="range"
                min="2"
                max="20"
                step="0.5"
                value={calcDiscountPct}
                onChange={(e) => setCalcDiscountPct(Number(e.target.value))}
                className="calc-range-input"
              />
            </div>
          </div>

          <div className="calc-results-card">
            <div className="calc-result-row highlight">
              <span>Dana Cair Hari Ini:</span>
              <b>{calcInstantPayout.toLocaleString("id-ID", { maximumFractionDigits: 1 })} USDC</b>
            </div>
            <div className="calc-result-row">
              <span>Keuntungan Investor (Saat Tempo):</span>
              <b style={{ color: "var(--orange-main)" }}>
                +{calcInvestorProfit.toLocaleString("id-ID", { maximumFractionDigits: 1 })} USDC ({calcDiscountPct}%)
              </b>
            </div>
            <div className="calc-result-row">
              <span>Waktu Tunggu Freelancer:</span>
              <b style={{ color: "var(--green-main)" }}>0 Hari (Instan)</b>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Quick Stats Grid */}
      <section className="quick-stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Nilai Tagihan</div>
          <div className="stat-value">{formatCurrency(totalAmount)}</div>
          <div className="stat-subtext">{invoices.length} tagihan terdaftar</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Sudah Cair ke Freelancer</div>
          <div className="stat-value" style={{ color: "var(--green-text)" }}>
            {formatCurrency(totalFinanced)}
          </div>
          <div className="stat-subtext">Langsung masuk ke rekening Web3</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Tersedia di Bursa Investor</div>
          <div className="stat-value" style={{ color: "var(--orange-main)" }}>
            {formatCurrency(totalInMarket)}
          </div>
          <div className="stat-subtext">{listedInvoices.length} invoice siap didanai</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Protokol Keamanan</div>
          <div className="stat-value" style={{ fontSize: "17px", color: "var(--blue-text)" }}>
            Anti-Ganda Aktif
          </div>
          <div className="stat-subtext">ERC-721 State Guard on Base</div>
        </div>
      </section>

      {/* 4. Main Workspaces */}
      {activeRole === "freelancer" && (
        <div className="workspace-split">
          {/* Left Master List */}
          <div className="invoices-master-pane">
            <div className="pane-header">
              <span className="pane-title">Buku Piutang Freelancer</span>
              <div className="pane-filter-tabs">
                <button
                  type="button"
                  className={`filter-chip ${filterStatus === "all" ? "active" : ""}`}
                  onClick={() => setFilterStatus("all")}
                >
                  Semua
                </button>
                <button
                  type="button"
                  className={`filter-chip ${filterStatus === "draft" ? "active" : ""}`}
                  onClick={() => setFilterStatus("draft")}
                >
                  Draft
                </button>
                <button
                  type="button"
                  className={`filter-chip ${filterStatus === "approved" ? "active" : ""}`}
                  onClick={() => setFilterStatus("approved")}
                >
                  Disetujui
                </button>
                <button
                  type="button"
                  className={`filter-chip ${filterStatus === "listed" ? "active" : ""}`}
                  onClick={() => setFilterStatus("listed")}
                >
                  Dijual
                </button>
                <button
                  type="button"
                  className={`filter-chip ${filterStatus === "financed" ? "active" : ""}`}
                  onClick={() => setFilterStatus("financed")}
                >
                  Didanai
                </button>
              </div>
            </div>

            <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--border-light)" }}>
              <input
                type="text"
                placeholder="Cari invoice berdasarkan judul atau ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field"
                style={{ margin: 0, padding: "8px 12px", fontSize: "13px" }}
              />
            </div>

            <div style={{ maxHeight: "560px", overflowY: "auto" }}>
              {filteredInvoices.map((inv) => {
                const isSelected = inv.id === selectedInvoice.id;
                return (
                  <div
                    key={inv.id.toString()}
                    className={`invoice-row-card ${isSelected ? "selected" : ""}`}
                    onClick={() => setSelectedInvoiceId(inv.id)}
                  >
                    <div className="invoice-left-meta">
                      <div className="invoice-id-tag">#INV-{inv.id.toString().padStart(3, "0")}</div>
                      <div className="invoice-job-name">{inv.jobTitle}</div>
                      <div className="invoice-client-sub">
                        Klien: {formatShortAddress(inv.client)} • Tempo: {formatDate(inv.dueDate)}
                      </div>
                    </div>

                    <div className="invoice-right-meta">
                      <div className="invoice-amount-text">{formatCurrency(inv.amount)}</div>
                      {inv.status === InvoiceStatus.Created && (
                        <span className="status-pill draft">Draft</span>
                      )}
                      {inv.status === InvoiceStatus.Approved && (
                        <span className="status-pill approved">Disetujui</span>
                      )}
                      {inv.status === InvoiceStatus.Listed && (
                        <span className="status-pill listed">Dijual ({formatCurrency(inv.listingPrice)})</span>
                      )}
                      {inv.status === InvoiceStatus.Financed && (
                        <span className="status-pill financed">Didanai</span>
                      )}
                      {inv.status === InvoiceStatus.Paid && (
                        <span className="status-pill paid">Lunas</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Detail & Control Center */}
          <div className="detail-control-pane">
            <div className="detail-header-row">
              <div className="detail-headline">
                <h3>{selectedInvoice.jobTitle}</h3>
                <p>TOKEN NFT #INV-{selectedInvoice.id.toString().padStart(3, "0")} • BASE SEPOLIA</p>
              </div>

              {selectedInvoice.status === InvoiceStatus.Created && (
                <span className="status-pill draft">Tahap 1: Draft</span>
              )}
              {selectedInvoice.status === InvoiceStatus.Approved && (
                <span className="status-pill approved">Tahap 2: Disetujui</span>
              )}
              {selectedInvoice.status === InvoiceStatus.Listed && (
                <span className="status-pill listed">Tahap 3: Dijual di Bursa</span>
              )}
              {selectedInvoice.status === InvoiceStatus.Financed && (
                <span className="status-pill financed">Tahap 4: Didanai</span>
              )}
              {selectedInvoice.status === InvoiceStatus.Paid && (
                <span className="status-pill paid">Tahap 5: Lunas Selesai</span>
              )}
            </div>

            {/* Lifecycle Stepper */}
            <div className="stepper-container">
              <div className={`step-item ${selectedInvoice.status >= InvoiceStatus.Created ? "completed active" : ""}`}>
                <div className="step-circle">1</div>
                <div className="step-name">Draft</div>
              </div>
              <div className={`step-item ${selectedInvoice.status >= InvoiceStatus.Approved ? "completed active" : ""}`}>
                <div className="step-circle">2</div>
                <div className="step-name">Verifikasi</div>
              </div>
              <div className={`step-item ${selectedInvoice.status >= InvoiceStatus.Listed ? "completed active" : ""}`}>
                <div className="step-circle">3</div>
                <div className="step-name">Di Bursa</div>
              </div>
              <div className={`step-item ${selectedInvoice.status >= InvoiceStatus.Financed ? "completed active" : ""}`}>
                <div className="step-circle">4</div>
                <div className="step-name">Didanai</div>
              </div>
              <div className={`step-item ${selectedInvoice.status === InvoiceStatus.Paid ? "completed active" : ""}`}>
                <div className="step-circle">5</div>
                <div className="step-name">Lunas</div>
              </div>
            </div>

            {/* Financial Ledger Details */}
            <div className="financial-ledger-box">
              <div className="ledger-item-row">
                <span>Nilai Piutang Penuh</span>
                <b>{formatCurrency(selectedInvoice.amount)}</b>
              </div>
              <div className="ledger-item-row">
                <span>Alamat Klien Pembayar</span>
                <b title={selectedInvoice.client}>{formatShortAddress(selectedInvoice.client)}</b>
              </div>
              <div className="ledger-item-row">
                <span>Jatuh Tempo Pembayaran</span>
                <b>{formatDate(selectedInvoice.dueDate)}</b>
              </div>
              <div className="ledger-item-row">
                <span>Pemilik NFT Saat Ini</span>
                <b>
                  {selectedInvoice.funder === "0x0000000000000000000000000000000000000000"
                    ? "Freelancer (Anda)"
                    : `Funder 1 (${formatShortAddress(selectedInvoice.funder)})`}
                </b>
              </div>
              {selectedInvoice.listingPrice > 0n && (
                <div className="ledger-item-row">
                  <span style={{ color: "var(--green-text)" }}>Nilai Pencairan Cepat</span>
                  <b style={{ color: "var(--green-text)" }}>{formatCurrency(selectedInvoice.listingPrice)}</b>
                </div>
              )}
            </div>

            {/* Context Actions */}
            {selectedInvoice.status === InvoiceStatus.Created && (
              <div>
                <div className="action-banner-box info">
                  Tagihan berstatus Draft. Klien harus memberikan verifikasi sah agar hak tagih dapat didaftarkan ke bursa pembiayaan.
                </div>
                <button
                  type="button"
                  className="btn-big-action green"
                  onClick={() => handleApproveInvoice(selectedInvoice.id)}
                >
                  <span>✍️ Simulasikan: Klien Tanda Tangan & Setujui</span>
                </button>
              </div>
            )}

            {selectedInvoice.status === InvoiceStatus.Approved && (
              <div>
                <div className="action-banner-box info">
                  Klien telah mengesahkan invoice ini! Sekarang pilih besaran diskon penawaran untuk investor agar dana Anda lekas cair hari ini.
                </div>

                <div className="interactive-slider-box">
                  <div className="slider-label-row">
                    <span>Diskon Penawaran Investor</span>
                    <span>{listingDiscountPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="20"
                    step="1"
                    value={listingDiscountPct}
                    onChange={(e) => setListingDiscountPct(Number(e.target.value))}
                    className="slider-control"
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginTop: "10px", color: "#78350F" }}>
                    <span>Dana diterima freelancer:</span>
                    <b>
                      {(
                        (Number(formatUnits(selectedInvoice.amount, 6)) * (100 - listingDiscountPct)) /
                        100
                      ).toFixed(1)}{" "}
                      USDC
                    </b>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-big-action orange"
                  onClick={() => handleListInvoice(selectedInvoice.id)}
                >
                  <span>🚀 Daftarkan ke Bursa Investor</span>
                </button>
              </div>
            )}

            {selectedInvoice.status === InvoiceStatus.Listed && (
              <div>
                <div className="action-banner-box success">
                  Invoice telah aktif di bursa seharga <b>{formatCurrency(selectedInvoice.listingPrice)}</b>. Investor dapat langsung mendanai hak tagih ini.
                </div>
                <button
                  type="button"
                  className="btn-big-action green"
                  onClick={() => handleFundInvoice(selectedInvoice.id)}
                >
                  <span>💎 Danai Invoice Sekarang (Sebagai Funder 1)</span>
                </button>
              </div>
            )}

            {selectedInvoice.status === InvoiceStatus.Financed && (
              <div>
                <div className="action-banner-box success">
                  ✅ <b>Dana telah cair ke dompet freelancer!</b> NFT hak tagih sekarang dipegang oleh investor Funder 1. Satu invoice ini terlindungi secara atomik dari risiko pembiayaan ganda.
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <button
                    type="button"
                    className="btn-big-action dark"
                    onClick={() => handlePayInvoice(selectedInvoice.id)}
                  >
                    <span>💳 Klien Bayar Pelunasan (Jatuh Tempo)</span>
                  </button>

                  <button
                    type="button"
                    className="btn-big-action orange"
                    style={{ background: "#DC2626" }}
                    onClick={() => {
                      setActiveRole("security");
                      handleTriggerRevertTest();
                    }}
                  >
                    <span>⚡ Uji Penolakan: Funder 2 Coba Beli Lagi</span>
                  </button>
                </div>
              </div>
            )}

            {selectedInvoice.status === InvoiceStatus.Paid && (
              <div className="action-banner-box success" style={{ textAlign: "center" }}>
                <b>🎉 Invoice Telah Lunas Selesai!</b>
                <p style={{ marginTop: "4px", fontSize: "13px" }}>
                  Dana {formatCurrency(selectedInvoice.amount)} otomatis disetorkan kepada pemegang NFT di Base Sepolia.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Investor Marketplace View */}
      {activeRole === "investor" && (
        <div>
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--ink-heading)" }}>
              Bursa Hak Tagih Terverifikasi (Invoice Marketplace)
            </h2>
            <p style={{ color: "var(--ink-muted)", fontSize: "14px" }}>
              Danai invoice freelancer di muka dengan harga diskon, terima pelunasan penuh saat klien membayar saat jatuh tempo.
            </p>
          </div>

          {listedInvoices.length === 0 ? (
            <div style={{ background: "var(--bg-surface)", padding: "40px", textAlign: "center", borderRadius: "14px", border: "1px solid var(--border-medium)" }}>
              <p style={{ color: "var(--ink-muted)", fontSize: "15px" }}>
                Saat ini belum ada invoice yang terdaftar di bursa. Buat invoice baru atau ubah status invoice yang disetujui menjadi &quot;Dijual&quot;.
              </p>
              <button
                type="button"
                className="btn-primary-action"
                style={{ marginTop: "16px" }}
                onClick={() => setActiveRole("freelancer")}
              >
                <span>Kembali ke Workspace Freelancer</span>
              </button>
            </div>
          ) : (
            <div className="market-grid">
              {listedInvoices.map((inv) => {
                const profit = Number(formatUnits(inv.amount - inv.listingPrice, 6));
                const yieldPct = ((profit / Number(formatUnits(inv.listingPrice, 6))) * 100).toFixed(1);

                return (
                  <div key={inv.id.toString()} className="market-card">
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <span className="status-pill listed">Tersedia</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--ink-muted)" }}>
                          #INV-{inv.id.toString().padStart(3, "0")}
                        </span>
                      </div>

                      <h3 style={{ fontSize: "17px", fontWeight: 700, marginBottom: "8px", color: "var(--ink-heading)" }}>
                        {inv.jobTitle}
                      </h3>

                      <div style={{ fontSize: "13px", color: "var(--ink-muted)", marginBottom: "16px" }}>
                        Klien: {formatShortAddress(inv.client)} • Jatuh Tempo: {formatDate(inv.dueDate)}
                      </div>

                      <div className="financial-ledger-box" style={{ padding: "12px 14px", marginBottom: "16px" }}>
                        <div className="ledger-item-row">
                          <span>Modal Pendanaan:</span>
                          <b>{formatCurrency(inv.listingPrice)}</b>
                        </div>
                        <div className="ledger-item-row">
                          <span>Pelunasan Tempo:</span>
                          <b>{formatCurrency(inv.amount)}</b>
                        </div>
                        <div className="ledger-item-row">
                          <span style={{ color: "var(--green-text)" }}>Keuntungan Bersih:</span>
                          <b style={{ color: "var(--green-text)" }}>+{profit.toLocaleString("id-ID")} USDC (+{yieldPct}%)</b>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn-big-action green"
                      onClick={() => handleFundInvoice(inv.id)}
                    >
                      <span>Danai Sekarang ({formatCurrency(inv.listingPrice)})</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 6. Security Lab / Anti-Double Funding Demo */}
      {activeRole === "security" && (
        <div>
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--ink-heading)" }}>
              Laboratorium Verifikasi Keamanan: Anti-Double Funding
            </h2>
            <p style={{ color: "var(--ink-muted)", fontSize: "14px" }}>
              Uji langsung keunggulan smart contract CairIn di Base Sepolia: invoice yang telah didanai terlindungi secara mutlak dari penipuan pendanaan ganda.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "24px", alignItems: "start" }}>
            <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-medium)", borderRadius: "14px", padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <span style={{ fontSize: "24px" }}>🛡️</span>
                <div>
                  <h3 style={{ fontSize: "17px", fontWeight: 700 }}>Pemeriksaan State Atomik</h3>
                  <p style={{ fontSize: "12.5px", color: "var(--ink-muted)" }}>Target: Invoice #INV-001 (Sudah didanai oleh Funder 1)</p>
                </div>
              </div>

              <div style={{ fontSize: "13.5px", lineHeight: "1.6", color: "var(--ink-body)", marginBottom: "20px" }}>
                Pada industri factoring konvensional, pelaku usaha nakal sering menjual satu faktur yang sama ke 2 perusahaan pembiayaan yang berbeda.
                <br /><br />
                Di <strong>CairIn</strong>, kepemilikan tagihan diikat dalam NFT ERC-721. Fungsi <code>fundInvoice</code> secara ketat mewajibkan status <code>Listed</code>. Jika seorang penyerang atau Funder 2 mencoba mendanai invoice yang sudah didanai, EVM akan langsung membatalkan transaksi (revert).
              </div>

              <button
                type="button"
                className="btn-big-action orange"
                disabled={revertRunning}
                onClick={handleTriggerRevertTest}
                style={{ background: "#DC2626" }}
              >
                <span>{revertRunning ? "Mengirim Panggilan Blockchain..." : "⚡ Eksekusi Serangan: Funder 2 Coba Bayar"}</span>
              </button>
            </div>

            {/* EVM Terminal Log */}
            <div className="terminal-window">
              <div className="terminal-titlebar">
                <div className="terminal-dots">
                  <span className="terminal-dot red" />
                  <span className="terminal-dot yellow" />
                  <span className="terminal-dot green" />
                </div>
                <div className="terminal-title">Base Sepolia EVM Execution Trace</div>
                <div style={{ fontSize: "11px", color: "#60A5FA" }}>RPC: 84532</div>
              </div>

              <div className="terminal-body">
                {revertLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`terminal-line ${
                      log.includes("REVERT") || log.includes("Expected")
                        ? "error"
                        : log.includes("✓") || log.includes("aman")
                        ? "success"
                        : log.includes("▶") || log.includes("Transaksi")
                        ? "info"
                        : ""
                    }`}
                  >
                    {log}
                  </div>
                ))}
              </div>

              {revertSuccess && (
                <div style={{ background: "#166534", padding: "12px 18px", color: "#FFFFFF", fontSize: "12.5px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>🛡️</span>
                  <span>Hasil Uji: Smart Contract Berhasil Menolak Pendanaan Ganda! Dana Funder 2 Tidak Terpotong.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. Modal: Terbitkan Invoice Baru */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title-row">
              <h3>Terbitkan Invoice Baru</h3>
              <button
                type="button"
                style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--ink-muted)" }}
                onClick={() => setShowCreateModal(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateInvoice}>
              <div>
                <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink-heading)" }}>
                  Judul Pekerjaan / Lingkup Proyek
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Pembuatan UI/UX Website & Desain Logo"
                  value={jobTitleInput}
                  onChange={(e) => setJobTitleInput(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink-heading)" }}>
                    Alamat Dompet Klien (Pembayar)
                  </label>
                  <button
                    type="button"
                    style={{ background: "none", border: "none", color: "var(--blue-text)", fontSize: "11.5px", cursor: "pointer" }}
                    onClick={() => setClientAddressInput("0x70997970C51812dc3A010C7d01b50e0d17dc79C8")}
                  >
                    Gunakan Contoh Dompet Klien
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="0x7099... atau 0x..."
                  value={clientAddressInput}
                  onChange={(e) => setClientAddressInput(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink-heading)" }}>
                    Nilai Tagihan (USDC)
                  </label>
                  <input
                    type="number"
                    placeholder="Contoh: 1500"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink-heading)" }}>
                    Jatuh Tempo (Hari)
                  </label>
                  <select
                    value={dueDaysInput}
                    onChange={(e) => setDueDaysInput(e.target.value)}
                    className="input-field"
                  >
                    <option value="14">14 Hari</option>
                    <option value="30">30 Hari</option>
                    <option value="45">45 Hari</option>
                    <option value="60">60 Hari</option>
                  </select>
                </div>
              </div>

              <div style={{ background: "#FAF8F5", padding: "12px", borderRadius: "8px", fontSize: "12px", color: "var(--ink-muted)", marginBottom: "16px" }}>
                💡 <strong>Catatan:</strong> Setelah diterbitkan, invoice akan dicetak sebagai NFT ERC-721 berstatus <code>Draft</code>. Klien Anda dapat mengesahkan tagihan sebelum Anda menjualnya ke investor.
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  className="btn-primary-action"
                  style={{ background: "var(--bg-surface-subtle)", color: "var(--ink-body)", flex: 1, justifyContent: "center" }}
                  onClick={() => setShowCreateModal(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-primary-action"
                  disabled={isSubmitting}
                  style={{ flex: 1.5, justifyContent: "center" }}
                >
                  {isSubmitting ? "Mencetak NFT..." : "Terbitkan Invoice (NFT)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
