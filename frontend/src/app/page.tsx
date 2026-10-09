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

export default function CairInApp() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContractAsync } = useWriteContract();

  const [invoices, setInvoices] = useState<InvoiceItem[]>(INITIAL_INVOICES);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<bigint>(1n);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Voucher interactive tab mode: "voucher" or "calculator"
  const [voucherMode, setVoucherMode] = useState<"voucher" | "calculator">("voucher");
  const [liveDiscountPct, setLiveDiscountPct] = useState<number>(8);

  // FAQ Accordion State (open indexes)
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Form State
  const [jobTitleInput, setJobTitleInput] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [nominalUsdc, setNominalUsdc] = useState("");
  const [dueDays, setDueDays] = useState("30");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Drawer listing price discount
  const [drawerDiscountPct, setDrawerDiscountPct] = useState<number>(8);

  // Security Simulation State
  const [isTestingRevert, setIsTestingRevert] = useState(false);
  const [revertState, setRevertState] = useState<"idle" | "testing" | "reverted">("idle");
  const [revertStep, setRevertStep] = useState<number>(0);

  const selectedInvoice = invoices.find((inv) => inv.id === selectedInvoiceId) || invoices[0];

  // Helper formats
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
    const matchesSearch =
      inv.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  // Cycle invoice selector in hero voucher
  const cycleInvoice = (direction: "prev" | "next") => {
    const currentIndex = invoices.findIndex((i) => i.id === selectedInvoice.id);
    if (direction === "prev") {
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : invoices.length - 1;
      setSelectedInvoiceId(invoices[prevIndex].id);
    } else {
      const nextIndex = currentIndex < invoices.length - 1 ? currentIndex + 1 : 0;
      setSelectedInvoiceId(invoices[nextIndex].id);
    }
  };

  // Handler: Buat Invoice Baru
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientAddress || !nominalUsdc) {
      alert("Lengkapi alamat klien dan nominal piutang.");
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
      const newInv: InvoiceItem = {
        id: nextId,
        jobTitle: jobTitleInput || `Jasa Pekerjaan Freelance #${nextId}`,
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
      setShowCreateModal(false);
      setJobTitleInput("");
      setClientAddress("");
      setNominalUsdc("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(err);
      alert(`Gagal membuat invoice: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Persetujuan Klien
  const handleApproveInvoice = (id: bigint) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id ? { ...inv, status: InvoiceStatus.Approved } : inv
      )
    );
  };

  // Handler: Jual Invoice (List)
  const handleListInvoice = async (id: bigint, discountPct: number) => {
    const inv = invoices.find((i) => i.id === id);
    if (!inv) return;

    const discountAmount =
      (Number(formatUnits(inv.amount, 6)) * (100 - discountPct)) / 100;
    const parsedListing = parseUnits(discountAmount.toFixed(2), 6);

    if (isConnected) {
      try {
        await writeContractAsync({
          address: CAIRIN_ADDRESS,
          abi: cairInAbi,
          functionName: "listInvoice",
          args: [id, parsedListing],
        });
      } catch (err) {
        console.warn("On-chain fallback to simulated state:", err);
      }
    }

    setInvoices((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: InvoiceStatus.Listed, listingPrice: parsedListing }
          : item
      )
    );
  };

  // Handler: Investor Mendanai Invoice
  const handleFundInvoice = (id: bigint) => {
    const defaultInvestor = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id
          ? { ...inv, status: InvoiceStatus.Financed, funder: defaultInvestor }
          : inv
      )
    );
  };

  // Handler: Pelunasan Klien
  const handlePayInvoice = (id: bigint) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id ? { ...inv, status: InvoiceStatus.Paid } : inv
      )
    );
  };

  // Live Revert Battle Test Simulator (Edukasi Proteksi Anti-Ganda)
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

  // Calculations for quick metrics
  const totalAmount = invoices.reduce((acc, curr) => acc + curr.amount, 0n);
  const totalFinanced = invoices
    .filter(
      (inv) =>
        inv.status === InvoiceStatus.Financed || inv.status === InvoiceStatus.Paid
    )
    .reduce((acc, curr) => acc + curr.listingPrice, 0n);
  const totalListed = invoices
    .filter((inv) => inv.status === InvoiceStatus.Listed)
    .reduce((acc, curr) => acc + curr.listingPrice, 0n);

  // Live Voucher Calculation values
  const currentInvoiceNominal = Number(formatUnits(selectedInvoice.amount, 6));
  const livePayoutAmount = (currentInvoiceNominal * (100 - liveDiscountPct)) / 100;
  const liveInvestorMargin = (currentInvoiceNominal * liveDiscountPct) / 100;

  return (
    <>
      {/* 1. Top Navigation Bar */}
      <header className="site-header wrap">
        <a className="brand-badge" href="/" aria-label="CairIn">
          <span className="brand-circle">C</span>
          <span>CAIRIN</span>
        </a>

        <nav className="header-nav">
          <a href="#cara-kerja">Cara Kerja</a>
          <a href="#manfaat">Manfaat</a>
          <a href="#buku-piutang">Buku Piutang</a>
          <a href="#keamanan">Keamanan</a>
          <a href="#faq">FAQ</a>
        </nav>

        {isConnected ? (
          <button
            type="button"
            className="header-action-btn"
            onClick={() => disconnect()}
          >
            <span>{formatShortAddress(address || "")}</span>
            <small style={{ opacity: 0.8 }}>(Putuskan)</small>
          </button>
        ) : (
          <button
            type="button"
            className="header-action-btn"
            onClick={() => connect({ connector: injected() })}
          >
            <span>Sambungkan Dompet</span>
            <span aria-hidden="true">&nearr;</span>
          </button>
        )}
      </header>

      <main>
        {/* 2. Hero Section: Value Proposition & Interactive Voucher Slip */}
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
              <button
                type="button"
                className="btn-brutal btn-acid"
                onClick={() => setShowCreateModal(true)}
              >
                <span>+ Terbitkan Invoice</span>
                <span aria-hidden="true">&darr;</span>
              </button>

              <a className="btn-brutal btn-outline" href="#cara-kerja">
                <span>Pelajari Cara Kerja</span>
                <span aria-hidden="true">&rarr;</span>
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

          {/* Living Interactive Physical Voucher Slip */}
          <div className="factoring-slip-container">
            <div className="slip-sun" />

            <div className="interactive-physical-voucher">
              {/* Top Bar with Status and ID */}
              <div className="voucher-top-bar">
                <span>FAKTUR RESMI CAIRIN</span>
                <span style={{ color: "var(--cairin-green)" }}>
                  TOKEN #{selectedInvoice.id.toString()}
                </span>
              </div>

              {/* Mode Switcher inside Voucher: Info vs Interactive Calculator */}
              <div className="voucher-interactive-tabs">
                <button
                  type="button"
                  className={`voucher-tab-btn ${voucherMode === "voucher" ? "active" : ""}`}
                  onClick={() => setVoucherMode("voucher")}
                >
                  📄 Status Faktur
                </button>
                <button
                  type="button"
                  className={`voucher-tab-btn ${voucherMode === "calculator" ? "active" : ""}`}
                  onClick={() => setVoucherMode("calculator")}
                >
                  ⚡ Hitung Pencairan
                </button>
              </div>

              {/* Voucher View Mode */}
              {voucherMode === "voucher" ? (
                <>
                  <div className="voucher-amount-section">
                    <div className="voucher-label">NILAI PIUTANG TAGIHAN</div>
                    <div className="voucher-amount">
                      <sup>$</sup>
                      {Number(formatUnits(selectedInvoice.amount, 6)).toLocaleString("id-ID")}
                    </div>
                  </div>

                  {/* Party Details Card */}
                  <div className="voucher-party-card">
                    <div className="voucher-avatar">C</div>
                    <div className="voucher-party-info">
                      <b>{selectedInvoice.jobTitle}</b>
                      <small>Klien: {formatShortAddress(selectedInvoice.client)}</small>
                    </div>
                    <div>
                      {selectedInvoice.status === InvoiceStatus.Financed && (
                        <span className="voucher-stamp-badge stamp-financed">DIDANAI</span>
                      )}
                      {selectedInvoice.status === InvoiceStatus.Listed && (
                        <span className="voucher-stamp-badge stamp-listed">DI BURSA</span>
                      )}
                      {selectedInvoice.status === InvoiceStatus.Approved && (
                        <span className="voucher-stamp-badge stamp-approved">DISETUJUI</span>
                      )}
                      {selectedInvoice.status === InvoiceStatus.Created && (
                        <span className="voucher-stamp-badge stamp-draft">DRAFT</span>
                      )}
                      {selectedInvoice.status === InvoiceStatus.Paid && (
                        <span className="voucher-stamp-badge stamp-financed">LUNAS</span>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                /* Interactive Calculator Mode inside the Voucher */
                <div style={{ padding: "12px 0" }}>
                  <div className="voucher-slider-box">
                    <div className="voucher-slider-header">
                      <span>Tawaran Diskon ke Investor:</span>
                      <b style={{ color: "var(--cairin-orange)" }}>{liveDiscountPct}%</b>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="20"
                      step="1"
                      value={liveDiscountPct}
                      onChange={(e) => setLiveDiscountPct(Number(e.target.value))}
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
                        ${livePayoutAmount.toFixed(0)} USDC
                      </b>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#666" }}>Keuntungan Investor Saat Tempo:</span>
                      <b style={{ color: "var(--cairin-orange)", fontFamily: "var(--mono)" }}>
                        +${liveInvestorMargin.toFixed(0)} USDC
                      </b>
                    </div>
                  </div>
                </div>
              )}

              {/* Context Action Button Inside Voucher */}
              <div className="voucher-interactive-action">
                {selectedInvoice.status === InvoiceStatus.Financed && (
                  <div onClick={() => handlePayInvoice(selectedInvoice.id)}>
                    <b>✅ Sudah Didanai oleh Investor ({formatShortAddress(selectedInvoice.funder)})</b>
                    <small>Klik untuk simulasikan: Klien Lunasi Tagihan</small>
                  </div>
                )}
                {selectedInvoice.status === InvoiceStatus.Listed && (
                  <div onClick={() => handleFundInvoice(selectedInvoice.id)}>
                    <b>💎 Klik: Danai Sekarang ({formatCurrency(selectedInvoice.listingPrice)})</b>
                    <small>Uang langsung ditransfer ke dompet freelancer</small>
                  </div>
                )}
                {selectedInvoice.status === InvoiceStatus.Approved && (
                  <div onClick={() => handleListInvoice(selectedInvoice.id, liveDiscountPct)}>
                    <b>🚀 Klik: Tawarkan ke Bursa Investor</b>
                    <small>Pasang penawaran diskon agar investor dapat mendanai</small>
                  </div>
                )}
                {selectedInvoice.status === InvoiceStatus.Created && (
                  <div onClick={() => handleApproveInvoice(selectedInvoice.id)}>
                    <b>✍️ Klik: Simulasikan Persetujuan Klien</b>
                    <small>Ubah status draf menjadi disetujui sah</small>
                  </div>
                )}
                {selectedInvoice.status === InvoiceStatus.Paid && (
                  <div>
                    <b>✓ Selesai Dilunasi Oleh Klien</b>
                    <small>Pelunasan 100% tuntas di Base Sepolia</small>
                  </div>
                )}
              </div>

              {/* Cycle through invoices right on voucher */}
              <div className="voucher-cycle-nav">
                <button
                  type="button"
                  className="voucher-cycle-btn"
                  onClick={() => cycleInvoice("prev")}
                >
                  &larr; Sebelumnya
                </button>
                <span style={{ color: "#666" }}>
                  Invoice {invoices.findIndex((i) => i.id === selectedInvoice.id) + 1} dari {invoices.length}
                </span>
                <button
                  type="button"
                  className="voucher-cycle-btn"
                  onClick={() => cycleInvoice("next")}
                >
                  Selanjutnya &rarr;
                </button>
              </div>
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
                Smart contract mencetak token NFT ERC-721 yang merepresentasikan hak tagih sah di blockchain.
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

        {/* 6. Clickable Interactive Stats Metric Strip */}
        <section className="wrap stats-metric-strip">
          <div
            className={`stat-cell interactive ${filterStatus === "all" ? "active" : ""}`}
            onClick={() => setFilterStatus("all")}
            title="Klik untuk melihat semua invoice di tabel"
          >
            <span className="stat-cell-label">Total Nilai Tagihan</span>
            <span className="stat-cell-number">{formatCurrency(totalAmount)}</span>
            <span className="stat-cell-note">{invoices.length} invoice terbit (Klik untuk filter)</span>
          </div>

          <div
            className={`stat-cell interactive ${filterStatus === "financed" ? "active" : ""}`}
            onClick={() => setFilterStatus("financed")}
            title="Klik untuk melihat invoice yang sudah didanai"
          >
            <span className="stat-cell-label">Uang Cair ke Freelancer</span>
            <span className="stat-cell-number" style={{ color: "var(--cairin-emerald)" }}>
              {formatCurrency(totalFinanced)}
            </span>
            <span className="stat-cell-note">Sudah masuk rekening Web3 (Klik untuk filter)</span>
          </div>

          <div
            className={`stat-cell interactive ${filterStatus === "listed" ? "active" : ""}`}
            onClick={() => setFilterStatus("listed")}
            title="Klik untuk melihat invoice yang siap didanai"
          >
            <span className="stat-cell-label">Tersedia di Bursa</span>
            <span className="stat-cell-number" style={{ color: "var(--cairin-orange)" }}>
              {formatCurrency(totalListed)}
            </span>
            <span className="stat-cell-note">Siap didanai investor (Klik untuk filter)</span>
          </div>

          <div
            className="stat-cell interactive"
            onClick={() => {
              const el = document.getElementById("keamanan");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            title="Klik untuk membaca proteksi keamanan"
          >
            <span className="stat-cell-label">Proteksi Keamanan</span>
            <span className="stat-cell-number" style={{ color: "var(--cairin-green)" }}>
              Anti-Ganda
            </span>
            <span className="stat-cell-note">Smart contract guard Base (Baca di bawah &darr;)</span>
          </div>
        </section>

        {/* 7. The Interactive Ledger Workspace */}
        <section className="wrap" id="buku-piutang">
          <div className="section-headline-box">
            <div>
              <div className="eyebrow-tag">
                <span className="eyebrow-bar" />
                <span>BUKU BESAR FREELANCER</span>
              </div>
              <h2 className="section-title">Kelola & Cairkan Invoice</h2>
            </div>

            <button
              type="button"
              className="btn-brutal btn-orange"
              onClick={() => setShowCreateModal(true)}
            >
              <span>+ Terbitkan Invoice</span>
              <span aria-hidden="true">&darr;</span>
            </button>
          </div>

          <div className="ledger-workspace">
            {/* Filter Pills Bar + Search Input */}
            <div className="ledger-filters-bar">
              <div className="filter-pills-group">
                <button
                  type="button"
                  className={`filter-pill ${filterStatus === "all" ? "active" : ""}`}
                  onClick={() => setFilterStatus("all")}
                >
                  Semua ({invoices.length})
                </button>
                <button
                  type="button"
                  className={`filter-pill ${filterStatus === "draft" ? "active" : ""}`}
                  onClick={() => setFilterStatus("draft")}
                >
                  Draft
                </button>
                <button
                  type="button"
                  className={`filter-pill ${filterStatus === "approved" ? "active" : ""}`}
                  onClick={() => setFilterStatus("approved")}
                >
                  Disetujui
                </button>
                <button
                  type="button"
                  className={`filter-pill ${filterStatus === "listed" ? "active" : ""}`}
                  onClick={() => setFilterStatus("listed")}
                >
                  Di Bursa
                </button>
                <button
                  type="button"
                  className={`filter-pill ${filterStatus === "financed" ? "active" : ""}`}
                  onClick={() => setFilterStatus("financed")}
                >
                  Didanai
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <input
                  type="text"
                  placeholder="Cari judul / ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    padding: "6px 12px",
                    border: "1.5px solid var(--ink)",
                    fontFamily: "var(--mono)",
                    fontSize: "12px",
                    outline: "none",
                    background: "#FFFFFF",
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "11px",
                    fontWeight: 800,
                    color: "#555",
                  }}
                >
                  KLIK BARIS UNTUK INSPEKSI
                </span>
              </div>
            </div>

            {/* List Baris Invoice */}
            <div className="ledger-items-list">
              {filteredInvoices.map((inv) => {
                const isSelected = inv.id === selectedInvoice.id;

                return (
                  <div
                    key={inv.id.toString()}
                    className={`ledger-row-item ${isSelected ? "selected" : ""}`}
                    onClick={() => setSelectedInvoiceId(inv.id)}
                  >
                    <span className="col-mono" style={{ fontWeight: 800 }}>
                      #INV-{inv.id.toString().padStart(3, "0")}
                    </span>

                    <div className="col-job">
                      <b>{inv.jobTitle}</b>
                      <small>Klien: {formatShortAddress(inv.client)}</small>
                    </div>

                    <div style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "#666" }}>
                      Tempo: {formatDate(inv.dueDate)}
                    </div>

                    <div className="col-mono" style={{ fontWeight: 700 }}>
                      {formatCurrency(inv.amount)}
                    </div>

                    <div
                      className="col-mono"
                      style={{ color: "var(--cairin-orange)", fontWeight: 700 }}
                    >
                      {inv.listingPrice > 0n ? formatCurrency(inv.listingPrice) : "—"}
                    </div>

                    <div>
                      {inv.status === InvoiceStatus.Financed && (
                        <span className="voucher-stamp-badge stamp-financed">DIDANAI</span>
                      )}
                      {inv.status === InvoiceStatus.Listed && (
                        <span className="voucher-stamp-badge stamp-listed">DI BURSA</span>
                      )}
                      {inv.status === InvoiceStatus.Approved && (
                        <span className="voucher-stamp-badge stamp-approved">DISETUJUI</span>
                      )}
                      {inv.status === InvoiceStatus.Created && (
                        <span className="voucher-stamp-badge stamp-draft">DRAFT</span>
                      )}
                      {inv.status === InvoiceStatus.Paid && (
                        <span className="voucher-stamp-badge stamp-financed">LUNAS</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detail Voucher Drawer untuk Baris Terpilih */}
            <div className="voucher-detail-drawer">
              <div className="drawer-details-col">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <h3 style={{ fontSize: "24px", fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
                    {selectedInvoice.jobTitle}
                  </h3>
                  <span style={{ fontFamily: "var(--mono)", fontWeight: 800 }}>
                    #INV-{selectedInvoice.id.toString().padStart(3, "0")}
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                    padding: "16px 0",
                    borderBlock: "1px dashed var(--line)",
                  }}
                >
                  <div>
                    <small
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "11px",
                        color: "#666",
                        display: "block",
                        marginBottom: "4px",
                      }}
                    >
                      ALAMAT KLIEN PEMBAYAR
                    </small>
                    <span style={{ fontFamily: "var(--mono)", fontSize: "13px", fontWeight: 700 }}>
                      {selectedInvoice.client}
                    </span>
                  </div>
                  <div>
                    <small
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "11px",
                        color: "#666",
                        display: "block",
                        marginBottom: "4px",
                      }}
                    >
                      INVESTOR PEMEGANG NFT
                    </small>
                    <span style={{ fontFamily: "var(--mono)", fontSize: "13px", fontWeight: 700 }}>
                      {selectedInvoice.funder === "0x0000000000000000000000000000000000000000"
                        ? "Belum ada pendana (Masih milik freelancer)"
                        : `Investor (${formatShortAddress(selectedInvoice.funder)})`}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "28px", fontSize: "14px", flexWrap: "wrap" }}>
                  <div>
                    <span style={{ color: "#666" }}>Nilai Piutang Penuh: </span>
                    <b style={{ fontFamily: "var(--mono)" }}>{formatCurrency(selectedInvoice.amount)}</b>
                  </div>
                  {selectedInvoice.listingPrice > 0n && (
                    <div>
                      <span style={{ color: "#666" }}>Pencairan Di Muka: </span>
                      <b style={{ fontFamily: "var(--mono)", color: "var(--cairin-green)" }}>
                        {formatCurrency(selectedInvoice.listingPrice)}
                      </b>
                    </div>
                  )}
                  {selectedInvoice.listingPrice > 0n && (
                    <div>
                      <span style={{ color: "#666" }}>Margin Keuntungan Investor: </span>
                      <b style={{ fontFamily: "var(--mono)", color: "var(--cairin-orange)" }}>
                        {formatCurrency(selectedInvoice.amount - selectedInvoice.listingPrice)}
                      </b>
                    </div>
                  )}
                </div>
              </div>

              {/* Panel Aksi Sesuai Status Invoice */}
              <div className="drawer-actions-col">
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "11px",
                    fontWeight: 900,
                    textTransform: "uppercase",
                  }}
                >
                  TINDAKAN INVOICE
                </span>

                {selectedInvoice.status === InvoiceStatus.Created && (
                  <div>
                    <p style={{ fontSize: "13.5px", color: "#555", marginBottom: "14px", lineHeight: 1.5 }}>
                      Status masih <strong>Draft</strong>. Klien harus menandatangani pengesahan agar invoice sah dijual.
                    </p>
                    <button
                      type="button"
                      className="btn-brutal btn-acid"
                      style={{ width: "100%", justifyContent: "center" }}
                      onClick={() => handleApproveInvoice(selectedInvoice.id)}
                    >
                      Klien Sahkan & Setujui Tagihan &rarr;
                    </button>
                  </div>
                )}

                {selectedInvoice.status === InvoiceStatus.Approved && (
                  <div>
                    <p style={{ fontSize: "13px", color: "#555", marginBottom: "10px" }}>
                      Tentukan diskon penawaran untuk investor agar lekas cair:
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontFamily: "var(--mono)", fontSize: "12px", fontWeight: 700 }}>
                      <span>Diskon: {drawerDiscountPct}%</span>
                      <span style={{ color: "var(--cairin-green)" }}>
                        Cair: {(Number(formatUnits(selectedInvoice.amount, 6)) * (100 - drawerDiscountPct) / 100).toFixed(0)} USDC
                      </span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="20"
                      step="1"
                      value={drawerDiscountPct}
                      onChange={(e) => setDrawerDiscountPct(Number(e.target.value))}
                      style={{ width: "100%", accentColor: "var(--cairin-orange)", cursor: "pointer", marginBottom: "14px" }}
                    />
                    <button
                      type="button"
                      className="btn-brutal btn-orange"
                      style={{ width: "100%", justifyContent: "center" }}
                      onClick={() => handleListInvoice(selectedInvoice.id, drawerDiscountPct)}
                    >
                      Jual Hak Tagih ke Bursa &rarr;
                    </button>
                  </div>
                )}

                {selectedInvoice.status === InvoiceStatus.Listed && (
                  <div>
                    <p style={{ fontSize: "13px", color: "#555", marginBottom: "12px", lineHeight: 1.5 }}>
                      Invoice terdaftar di bursa seharga <b>{formatCurrency(selectedInvoice.listingPrice)}</b>.
                    </p>
                    <button
                      type="button"
                      className="btn-brutal btn-acid"
                      style={{ width: "100%", justifyContent: "center" }}
                      onClick={() => handleFundInvoice(selectedInvoice.id)}
                    >
                      Danai Sebagai Investor &rarr;
                    </button>
                  </div>
                )}

                {selectedInvoice.status === InvoiceStatus.Financed && (
                  <div>
                    <div
                      style={{
                        background: "#e0f2fe",
                        padding: "12px",
                        border: "1.5px solid #0284c7",
                        fontSize: "12px",
                        marginBottom: "14px",
                        lineHeight: 1.5,
                      }}
                    >
                      🛡️ <strong>Terkunci:</strong> Dana sudah cair ke freelancer. Hak tagih kini berada di tangan investor hingga jatuh tempo.
                    </div>
                    <button
                      type="button"
                      className="btn-brutal btn-ink"
                      style={{ width: "100%", justifyContent: "center" }}
                      onClick={() => handlePayInvoice(selectedInvoice.id)}
                    >
                      Klien Lunasi Tagihan (Jatuh Tempo) &rarr;
                    </button>
                  </div>
                )}

                {selectedInvoice.status === InvoiceStatus.Paid && (
                  <div
                    style={{
                      background: "var(--cairin-mint)",
                      padding: "16px",
                      border: "2px solid var(--cairin-green)",
                      textAlign: "center",
                      fontWeight: 800,
                      fontSize: "13px",
                      color: "var(--cairin-green)",
                    }}
                  >
                    LUNAS • KONTRAK SELESAI PENUH
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 8. Bagian Keamanan: Proteksi Piutang Ganda (Anti-Double Financing) */}
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
                <strong> satu faktur yang sama dijual berulang kali ke beberapa lembaga pembiayaan berbeda</strong>.
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

        {/* 9. Bagian Tanya Jawab (FAQ / Informasi Lengkap) */}
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
      </main>

      {/* Footer */}
      <footer className="wrap">
        <div>&copy; 2026 CAIRIN — BASE SEPOLIA TESTNET</div>
        <div>ETHEREUM JAKARTA 2026 HACKATHON</div>
      </footer>

      {/* 10. Modal: Terbitkan Invoice Baru */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "22px", fontWeight: 800 }}>Terbitkan Invoice Baru</h3>
              <button
                type="button"
                style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", fontWeight: 800 }}
                onClick={() => setShowCreateModal(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateInvoice}>
              <div>
                <label style={{ fontFamily: "var(--mono)", fontSize: "11px", fontWeight: 800, textTransform: "uppercase" }}>
                  Judul Pekerjaan / Jasa Freelance
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Pembuatan Website E-Commerce & Desain UI"
                  value={jobTitleInput}
                  onChange={(e) => setJobTitleInput(e.target.value)}
                  className="field-input-brutal"
                  required
                />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <label style={{ fontFamily: "var(--mono)", fontSize: "11px", fontWeight: 800, textTransform: "uppercase" }}>
                    Alamat Dompet Klien (Pembayar)
                  </label>
                  <button
                    type="button"
                    style={{ background: "none", border: "none", color: "var(--cairin-orange)", fontSize: "11px", cursor: "pointer", fontFamily: "var(--mono)", fontWeight: 700 }}
                    onClick={() => setClientAddress("0x70997970C51812dc3A010C7d01b50e0d17dc79C8")}
                  >
                    Gunakan Dompet Klien Contoh
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="0x..."
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  className="field-input-brutal"
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ fontFamily: "var(--mono)", fontSize: "11px", fontWeight: 800, textTransform: "uppercase" }}>
                    Nilai Tagihan (USDC)
                  </label>
                  <input
                    type="number"
                    placeholder="Contoh: 1500"
                    value={nominalUsdc}
                    onChange={(e) => setNominalUsdc(e.target.value)}
                    className="field-input-brutal"
                    required
                  />
                </div>

                <div>
                  <label style={{ fontFamily: "var(--mono)", fontSize: "11px", fontWeight: 800, textTransform: "uppercase" }}>
                    Jatuh Tempo
                  </label>
                  <select
                    value={dueDays}
                    onChange={(e) => setDueDays(e.target.value)}
                    className="field-input-brutal"
                  >
                    <option value="14">14 Hari</option>
                    <option value="30">30 Hari</option>
                    <option value="45">45 Hari</option>
                    <option value="60">60 Hari</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: "14px", marginTop: "16px" }}>
                <button
                  type="button"
                  className="btn-brutal btn-outline"
                  style={{ flex: 1, justifyContent: "center" }}
                  onClick={() => setShowCreateModal(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-brutal btn-acid"
                  disabled={isSubmitting}
                  style={{ flex: 1.5, justifyContent: "center" }}
                >
                  {isSubmitting ? "Mencetak NFT..." : "Cetak NFT Invoice &rarr;"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
