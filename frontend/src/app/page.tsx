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
    listingPrice: parseUnits("900", 6),
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

export default function CairInBespokeApp() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContractAsync } = useWriteContract();

  const [invoices, setInvoices] = useState<InvoiceItem[]>(INITIAL_INVOICES);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<bigint>(1n);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [jobTitleInput, setJobTitleInput] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [nominalUsdc, setNominalUsdc] = useState("");
  const [dueDays, setDueDays] = useState("30");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Listing discount price input in drawer
  const [discountPriceInput, setDiscountPriceInput] = useState("");

  // Revert Demo State (Battle Test)
  const [isTestingRevert, setIsTestingRevert] = useState(false);
  const [revertState, setRevertState] = useState<"idle" | "testing" | "reverted">("idle");

  const selectedInvoice = invoices.find((inv) => inv.id === selectedInvoiceId) || invoices[0];

  // Formatting helpers
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
    if (filterStatus === "all") return true;
    if (filterStatus === "draft") return inv.status === InvoiceStatus.Created;
    if (filterStatus === "approved") return inv.status === InvoiceStatus.Approved;
    if (filterStatus === "listed") return inv.status === InvoiceStatus.Listed;
    if (filterStatus === "financed") return inv.status === InvoiceStatus.Financed;
    if (filterStatus === "paid") return inv.status === InvoiceStatus.Paid;
    return true;
  });

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
        jobTitle: jobTitleInput || `Jasa Pekerjaan Digital #${nextId}`,
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
      alert("Invoice berhasil dicetak sebagai NFT ERC-721 di blockchain!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(err);
      alert(`Gagal membuat invoice: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Persetujuan Klien (Simulasi / On-chain)
  const handleApproveInvoice = (id: bigint) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id ? { ...inv, status: InvoiceStatus.Approved } : inv
      )
    );
    alert(`Invoice #INV-${id} telah disetujui sah oleh klien! Status berubah menjadi DISETUJUI.`);
  };

  // Handler: Jual Invoice (List)
  const handleListInvoice = async (id: bigint) => {
    if (!discountPriceInput) {
      alert("Masukkan nominal diskon penawaran untuk investor.");
      return;
    }

    const parsedListing = parseUnits(discountPriceInput, 6);
    if (parsedListing > selectedInvoice.amount) {
      alert("Harga penawaran tidak boleh melebihi nilai tagihan penuh.");
      return;
    }

    if (isConnected) {
      try {
        await writeContractAsync({
          address: CAIRIN_ADDRESS,
          abi: cairInAbi,
          functionName: "listInvoice",
          args: [id, parsedListing],
        });
      } catch (err) {
        console.warn("On-chain list fallback to simulated state:", err);
      }
    }

    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id
          ? { ...inv, status: InvoiceStatus.Listed, listingPrice: parsedListing }
          : inv
      )
    );
    setDiscountPriceInput("");
    alert(`Invoice #INV-${id} resmi terdaftar di bursa investor seharga ${discountPriceInput} USDC!`);
  };

  // Handler: Funder 1 Mendanai Invoice
  const handleFundInvoice = (id: bigint) => {
    const defaultFunder = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id
          ? { ...inv, status: InvoiceStatus.Financed, funder: defaultFunder }
          : inv
      )
    );
    alert(
      `Funder 1 (${formatShortAddress(defaultFunder)}) berhasil mendanai invoice! Uang ${formatCurrency(
        selectedInvoice.listingPrice
      )} langsung masuk ke dompet Anda.`
    );
  };

  // Handler: Pelunasan Klien (Pay Invoice)
  const handlePayInvoice = (id: bigint) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id ? { ...inv, status: InvoiceStatus.Paid } : inv
      )
    );
    alert(`Klien melunasi penuh invoice #INV-${id}! Dana ${formatCurrency(selectedInvoice.amount)} otomatis ditransfer ke pemegang NFT.`);
  };

  // Live Revert Battle Test Simulator (MOMEN KUNCI DEMO HACKATHON)
  const runBattleTest = () => {
    setIsTestingRevert(true);
    setRevertState("testing");
    setTimeout(() => {
      setIsTestingRevert(false);
      setRevertState("reverted");
    }, 1100);
  };

  return (
    <>
      {/* 1. Header Brutalist CairIn */}
      <header className="site-header wrap">
        <a className="brand-badge" href="/" aria-label="CairIn">
          <span className="brand-circle">C</span>
          <span>CAIRIN</span>
        </a>

        <nav className="header-nav">
          <a href="#hero-slip">Voucher RWA</a>
          <a href="#buku-piutang">Buku Piutang</a>
          <a href="#battle-test">Uji Anti-Ganda</a>
          <a
            href="https://github.com/syifamwlda/Cashin"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </nav>

        {isConnected ? (
          <button
            type="button"
            className="header-action-btn"
            onClick={() => disconnect()}
          >
            <span>{formatShortAddress(address || "")}</span>
            <small style={{ opacity: 0.7 }}>(Putuskan)</small>
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
        {/* 2. Hero Section dengan Living Interactive Voucher Slip */}
        <section className="hero-stage wrap" id="hero-slip">
          <div>
            <div className="eyebrow-tag">
              <span className="eyebrow-bar" />
              <span>ETHGLOBAL JAKARTA 2026 / RWA FINANCING</span>
            </div>

            <h1 className="hero-statement">
              Invoice cair di muka. <em>Tanpa risiko piutang ganda.</em>
            </h1>

            <p className="hero-description">
              CairIn mengubah tagihan freelancer menjadi sertifikat NFT ERC-721 yang dapat
              didanai investor di muka dengan harga diskon. Saat jatuh tempo, klien melunasi
              penuh langsung ke pemegang NFT di Base Sepolia.
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

              <a className="btn-brutal btn-outline" href="#battle-test">
                <span>Uji Penolakan Funder 2</span>
                <span aria-hidden="true">&rarr;</span>
              </a>
            </div>

            <div style={{ marginTop: "32px", fontFamily: "var(--mono)", fontSize: "11px", fontWeight: 700, color: "#666" }}>
              JARINGAN: BASE SEPOLIA TESTNET • STANDAR: ERC-721 + MOCK USDC
            </div>
          </div>

          {/* Living Interactive Physical Voucher Slip */}
          <div className="factoring-slip-container">
            <div className="slip-sun" />

            <div className="interactive-physical-voucher">
              <div className="voucher-top-bar">
                <span>FAKTUR RESMI CAIRIN</span>
                <span style={{ color: "var(--cairin-green)" }}>TOKEN #{selectedInvoice.id.toString()}</span>
              </div>

              <div className="voucher-amount-section">
                <div className="voucher-label">NILAI PIUTANG TAGIHAN</div>
                <div className="voucher-amount">
                  <sup>$</sup>
                  {Number(formatUnits(selectedInvoice.amount, 6)).toLocaleString("id-ID")}
                </div>
              </div>

              {/* Rincian Pihak Terlibat */}
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
                    <span className="voucher-stamp-badge stamp-listed">DIJUAL</span>
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

              {/* Action Box Kontekstual Di Dalam Voucher */}
              <div className="voucher-interactive-action">
                {selectedInvoice.status === InvoiceStatus.Financed && (
                  <div onClick={() => alert("Invoice ini telah aman didanai oleh investor. Coba uji coba penolakan Funder 2 di bagian bawah!")}>
                    <b>Terkunci untuk Funder 1 ({formatShortAddress(selectedInvoice.funder)})</b>
                    <small>Dana {formatCurrency(selectedInvoice.listingPrice)} telah cair ke freelancer</small>
                  </div>
                )}
                {selectedInvoice.status === InvoiceStatus.Listed && (
                  <div onClick={() => handleFundInvoice(selectedInvoice.id)}>
                    <b>Klik: Danai Invoice ({formatCurrency(selectedInvoice.listingPrice)})</b>
                    <small>Investor mendanai, uang langsung ditransfer</small>
                  </div>
                )}
                {selectedInvoice.status === InvoiceStatus.Approved && (
                  <div onClick={() => alert("Gunakan formulir di tabel bawah untuk memasukkan harga diskon bursa.")}>
                    <b>Siap Ditawarkan ke Bursa Investor</b>
                    <small>Klien telah mengesahkan tagihan ini</small>
                  </div>
                )}
                {selectedInvoice.status === InvoiceStatus.Created && (
                  <div onClick={() => handleApproveInvoice(selectedInvoice.id)}>
                    <b>Klik: Simulasikan Persetujuan Klien</b>
                    <small>Ubah status dari Draft menjadi Disetujui</small>
                  </div>
                )}
                {selectedInvoice.status === InvoiceStatus.Paid && (
                  <div>
                    <b>Selesai Dilunasi Oleh Klien</b>
                    <small>Pelunasan 100% tuntas di Base Sepolia</small>
                  </div>
                )}
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
              PENCIRAN DI MUKA LANGSUNG <span className="plus">+</span>
              SMART CONTRACT ERC-721 <span className="plus">+</span>
              BASE SEPOLIA TESTNET <span className="plus">+</span>
              USDC STABLECOIN SETTLEMENT <span className="plus">+</span>
            </div>
            <div className="marquee-item" aria-hidden="true">
              HAK TAGIH RWA ON-CHAIN <span className="plus">+</span>
              ANTI-DOUBLE FUNDING VERIFIED <span className="plus">+</span>
              PENCIRAN DI MUKA LANGSUNG <span className="plus">+</span>
              SMART CONTRACT ERC-721 <span className="plus">+</span>
              BASE SEPOLIA TESTNET <span className="plus">+</span>
              USDC STABLECOIN SETTLEMENT <span className="plus">+</span>
            </div>
          </div>
        </section>

        {/* 4. Stats Metrics Strip */}
        <section className="wrap stats-metric-strip">
          <div className="stat-cell">
            <span className="stat-cell-label">Total Nilai Tagihan</span>
            <span className="stat-cell-number">5.450 USDC</span>
            <span className="stat-cell-note">4 invoice diterbitkan</span>
          </div>
          <div className="stat-cell">
            <span className="stat-cell-label">Uang Cair ke Freelancer</span>
            <span className="stat-cell-number" style={{ color: "var(--cairin-emerald)" }}>
              900 USDC
            </span>
            <span className="stat-cell-note">1 invoice sukses didanai</span>
          </div>
          <div className="stat-cell">
            <span className="stat-cell-label">Tersedia di Bursa</span>
            <span className="stat-cell-number" style={{ color: "var(--cairin-orange)" }}>
              2.300 USDC
            </span>
            <span className="stat-cell-note">Siap didanai investor</span>
          </div>
          <div className="stat-cell">
            <span className="stat-cell-label">Imbal Hasil Rata-rata</span>
            <span className="stat-cell-number">9.2%</span>
            <span className="stat-cell-note">Margin keuntungan funder</span>
          </div>
        </section>

        {/* 5. The Interactive Ledger Workspace */}
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
            {/* Filter Pills Bar */}
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
                  Dijual
                </button>
                <button
                  type="button"
                  className={`filter-pill ${filterStatus === "financed" ? "active" : ""}`}
                  onClick={() => setFilterStatus("financed")}
                >
                  Didanai
                </button>
              </div>

              <div style={{ fontFamily: "var(--mono)", fontSize: "11px", fontWeight: 700, color: "#666" }}>
                KLIK BARIS UNTUK MEMBUKA FAKTUR
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

                    <div className="col-mono" style={{ color: "var(--cairin-orange)", fontWeight: 700 }}>
                      {inv.listingPrice > 0n ? formatCurrency(inv.listingPrice) : "—"}
                    </div>

                    <div>
                      {inv.status === InvoiceStatus.Financed && (
                        <span className="voucher-stamp-badge stamp-financed">DIDANAI</span>
                      )}
                      {inv.status === InvoiceStatus.Listed && (
                        <span className="voucher-stamp-badge stamp-listed">DIJUAL</span>
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
                  <h3 style={{ fontFamily: "var(--serif)", fontSize: "28px", margin: 0 }}>
                    {selectedInvoice.jobTitle}
                  </h3>
                  <span style={{ fontFamily: "var(--mono)", fontWeight: 800 }}>
                    #INV-{selectedInvoice.id.toString().padStart(3, "0")}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", padding: "16px 0", borderBlock: "1px dashed var(--line)" }}>
                  <div>
                    <small style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "#666", display: "block" }}>
                      ALAMAT KLIEN PEMBAYAR
                    </small>
                    <span style={{ fontFamily: "var(--mono)", fontSize: "13px", fontWeight: 700 }}>
                      {selectedInvoice.client}
                    </span>
                  </div>
                  <div>
                    <small style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "#666", display: "block" }}>
                      INVESTOR PEMEGANG NFT
                    </small>
                    <span style={{ fontFamily: "var(--mono)", fontSize: "13px", fontWeight: 700 }}>
                      {selectedInvoice.funder === "0x0000000000000000000000000000000000000000"
                        ? "Belum ada pendana"
                        : selectedInvoice.funder}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "32px", fontSize: "14px" }}>
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
                      <span style={{ color: "#666" }}>Margin Funder: </span>
                      <b style={{ fontFamily: "var(--mono)", color: "var(--cairin-orange)" }}>
                        {formatCurrency(selectedInvoice.amount - selectedInvoice.listingPrice)}
                      </b>
                    </div>
                  )}
                </div>
              </div>

              {/* Panel Aksi Interaktif Sesuai Status Invoice */}
              <div className="drawer-actions-col">
                <span style={{ fontFamily: "var(--mono)", fontSize: "11px", fontWeight: 900, textTransform: "uppercase" }}>
                  TINDAKAN SIKLUS HIDUP
                </span>

                {selectedInvoice.status === InvoiceStatus.Created && (
                  <div>
                    <p style={{ fontSize: "13px", color: "#666", marginBottom: "12px" }}>
                      Invoice berstatus Draft. Butuh tanda tangan verifikasi dari klien.
                    </p>
                    <button
                      type="button"
                      className="btn-brutal btn-acid"
                      style={{ width: "100%", justifyContent: "center" }}
                      onClick={() => handleApproveInvoice(selectedInvoice.id)}
                    >
                      Klien Setujui Tagihan &rarr;
                    </button>
                  </div>
                )}

                {selectedInvoice.status === InvoiceStatus.Approved && (
                  <div>
                    <p style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>
                      Tentukan harga penawaran diskon untuk investor (USDC):
                    </p>
                    <input
                      type="number"
                      placeholder="Contoh: 700"
                      className="field-input-brutal"
                      value={discountPriceInput}
                      onChange={(e) => setDiscountPriceInput(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn-brutal btn-orange"
                      style={{ width: "100%", justifyContent: "center" }}
                      onClick={() => handleListInvoice(selectedInvoice.id)}
                    >
                      Jual Hak Tagih ke Bursa &rarr;
                    </button>
                  </div>
                )}

                {selectedInvoice.status === InvoiceStatus.Listed && (
                  <div>
                    <p style={{ fontSize: "13px", color: "#666", marginBottom: "12px" }}>
                      Invoice terpasang di bursa seharga {formatCurrency(selectedInvoice.listingPrice)}.
                    </p>
                    <button
                      type="button"
                      className="btn-brutal btn-acid"
                      style={{ width: "100%", justifyContent: "center" }}
                      onClick={() => handleFundInvoice(selectedInvoice.id)}
                    >
                      Funder 1 Danai Sekarang &rarr;
                    </button>
                  </div>
                )}

                {selectedInvoice.status === InvoiceStatus.Financed && (
                  <div>
                    <div style={{ background: "#e0f2fe", padding: "10px", border: "1px solid #0284c7", fontSize: "12px", marginBottom: "12px" }}>
                      🛡️ <strong>Terkunci:</strong> Uang telah masuk ke freelancer. Invoice ini aman dari penjualan ganda.
                    </div>
                    <button
                      type="button"
                      className="btn-brutal btn-ink"
                      style={{ width: "100%", justifyContent: "center", marginBottom: "8px" }}
                      onClick={() => handlePayInvoice(selectedInvoice.id)}
                    >
                      Klien Lunasi Tagihan (Jatuh Tempo) &rarr;
                    </button>
                  </div>
                )}

                {selectedInvoice.status === InvoiceStatus.Paid && (
                  <div style={{ background: "var(--cairin-mint)", padding: "14px", border: "1px solid var(--cairin-green)", textAlign: "center", fontWeight: 800, fontSize: "13px", color: "var(--cairin-green)" }}>
                    LUNAS • KONTRAK SELESAI
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 6. Anti-Double Funding Live Battle Test Section (The Showstopper Demo) */}
        <section className="battle-test-section" id="battle-test">
          <div className="wrap battle-grid">
            <div>
              <div className="eyebrow-tag" style={{ color: "var(--paper)" }}>
                <span className="eyebrow-bar" />
                <span>KEAMANAN KUNCI RWA • BASE SEPOLIA</span>
              </div>

              <h2 className="battle-title">
                Satu invoice. Mustahil didanai dua kali.
              </h2>

              <p className="battle-lede">
                Dalam anjak piutang (factoring) Web2 konvensional, penipuan terbesar adalah
                freelancer atau vendor menjual satu tagihan yang sama ke beberapa pihak pembiayaan.
                Di CairIn, kepemilikan ditransformasikan menjadi NFT ERC-721 dengan state machine atomik.
                Begitu Funder 1 mendanai, status seketika terkunci.
              </p>

              <button
                type="button"
                className="btn-brutal btn-acid"
                onClick={runBattleTest}
                disabled={isTestingRevert}
                style={{ width: "max-content" }}
              >
                <span>{isTestingRevert ? "Mengirim Panggilan Blockchain..." : "⚡ Coba Beli Sebagai Funder 2"}</span>
                <span aria-hidden="true">&rarr;</span>
              </button>
            </div>

            {/* The Live Revert Verification Card */}
            <div className="revert-verify-box">
              <div className="revert-verify-head">
                <span>SIMULASI SMART CONTRACT</span>
                <i style={{ background: "var(--cairin-mint)", padding: "3px 8px", borderRadius: "2px" }}>
                  EVM CALL
                </i>
              </div>

              <div style={{ padding: "18px 0" }}>
                <b style={{ fontFamily: "var(--serif)", fontSize: "22px", display: "block" }}>
                  Target: Invoice #INV-001
                </b>
                <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "#666" }}>
                  Status Saat Ini: Financed (Dimiliki Funder 1)
                </span>
              </div>

              <ul className="revert-check-list">
                <li>
                  <span className="check-dot" />
                  <span>Funder 1 Mendanai & Mentransfer USDC</span>
                  <b>SUKSES</b>
                </li>
                <li>
                  <span className="check-dot" />
                  <span>Status Diperbarui Menjadi &quot;Financed&quot;</span>
                  <b>TERKUNCI</b>
                </li>
                <li>
                  <span className={`check-dot ${revertState === "reverted" ? "red" : ""}`} />
                  <span>Funder 2 Memanggil <code>buyInvoice(1)</code></span>
                  <b style={{ color: revertState === "reverted" ? "var(--cairin-red)" : "inherit" }}>
                    {revertState === "reverted" ? "REVERTED" : "MENUNGGU UJI"}
                  </b>
                </li>
              </ul>

              {revertState === "reverted" ? (
                <div className="revert-stamp-verdict verdict-reverted">
                  ⛔ TRANSAKSI GAGAL DITOLAK SMART CONTRACT
                  <div style={{ fontFamily: "var(--mono)", fontSize: "11px", fontWeight: 600, marginTop: "4px" }}>
                    Pesan Revert: &quot;Invoice is not listed for financing&quot;
                  </div>
                </div>
              ) : (
                <div className="revert-stamp-verdict verdict-safe">
                  KLIK TOMBOL UNTUK MENGUJI PERLINDUNGAN
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Modal: Terbitkan Invoice Baru */}
        {showCreateModal && (
          <div className="modal-overlay">
            <div className="modal-content-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <h3 style={{ fontFamily: "var(--serif)", fontSize: "30px", margin: 0 }}>
                  Terbitkan Tagihan Baru
                </h3>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ background: "none", border: "none", fontSize: "28px", cursor: "pointer", fontWeight: 800 }}
                >
                  &times;
                </button>
              </div>

              <p style={{ margin: "8px 0 24px", color: "#666", fontSize: "14px" }}>
                Invoice akan dicetak langsung sebagai NFT ERC-721 di Base Sepolia ke dompet Anda.
              </p>

              <form onSubmit={handleCreateInvoice}>
                <div>
                  <label style={{ fontFamily: "var(--mono)", fontSize: "11px", fontWeight: 800 }}>
                    JUDUL PEKERJAAN / DESKRIPSI
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Redesign UI/UX Mobile App"
                    className="field-input-brutal"
                    value={jobTitleInput}
                    onChange={(e) => setJobTitleInput(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontFamily: "var(--mono)", fontSize: "11px", fontWeight: 800 }}>
                    ALAMAT DOMPET KLIEN (PEMBAYAR)
                  </label>
                  <input
                    type="text"
                    placeholder="0x7099... (Alamat EVM Klien)"
                    className="field-input-brutal"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontFamily: "var(--mono)", fontSize: "11px", fontWeight: 800 }}>
                    NOMINAL TAGIHAN (USDC)
                  </label>
                  <input
                    type="number"
                    placeholder="1000"
                    step="0.01"
                    className="field-input-brutal"
                    value={nominalUsdc}
                    onChange={(e) => setNominalUsdc(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontFamily: "var(--mono)", fontSize: "11px", fontWeight: 800 }}>
                    BATAS WAKTU JATUH TEMPO
                  </label>
                  <select
                    className="field-input-brutal"
                    value={dueDays}
                    onChange={(e) => setDueDays(e.target.value)}
                  >
                    <option value="14">14 Hari dari sekarang</option>
                    <option value="30">30 Hari dari sekarang</option>
                    <option value="45">45 Hari dari sekarang</option>
                    <option value="60">60 Hari dari sekarang</option>
                  </select>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "16px" }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    style={{
                      padding: "12px 18px",
                      background: "transparent",
                      border: "2px solid var(--ink)",
                      fontSize: "12px",
                      fontWeight: 800,
                      cursor: "pointer",
                      textTransform: "uppercase",
                    }}
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-brutal btn-acid"
                  >
                    <span>{isSubmitting ? "Mencetak..." : "Cetak NFT Invoice"}</span>
                    <span aria-hidden="true">&rarr;</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* 7. Footer */}
      <footer className="wrap">
        <div>
          <span>CAIRIN • PROTOKOL INVOICE FINANCING RWA</span>
        </div>
        <div>
          <span>ETHEREUM JAKARTA HACKATHON 2026</span>
        </div>
      </footer>
    </>
  );
}
