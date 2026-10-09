"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAccount, useConnect, useDisconnect, useWriteContract, useSwitchChain } from "wagmi";
import { hardhat, baseSepolia } from "wagmi/chains";
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
  txHash?: string;
  createdAt?: number;
}

const STORAGE_KEY = "cairin_invoices_history_v1";

interface SerializedInvoice {
  id: string;
  jobTitle: string;
  freelancer: string;
  client: string;
  amount: string;
  listingPrice: string;
  dueDate: string;
  funder: string;
  status: number;
  txHash?: string;
  createdAt?: number;
}

function saveStoredInvoices(items: InvoiceItem[]) {
  if (typeof window === "undefined") return;
  try {
    const serialized: SerializedInvoice[] = items.map((inv) => ({
      id: inv.id.toString(),
      jobTitle: inv.jobTitle,
      freelancer: inv.freelancer,
      client: inv.client,
      amount: inv.amount.toString(),
      listingPrice: inv.listingPrice.toString(),
      dueDate: inv.dueDate.toString(),
      funder: inv.funder,
      status: Number(inv.status),
      txHash: inv.txHash,
      createdAt: inv.createdAt,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
  } catch (err) {
    console.warn("Gagal menyimpan riwayat ke localStorage:", err);
  }
}

function loadStoredInvoices(): InvoiceItem[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: SerializedInvoice[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed.map((item) => ({
      id: BigInt(item.id),
      jobTitle: item.jobTitle,
      freelancer: item.freelancer,
      client: item.client,
      amount: BigInt(item.amount),
      listingPrice: BigInt(item.listingPrice),
      dueDate: BigInt(item.dueDate),
      funder: item.funder,
      status: item.status as InvoiceStatus,
      txHash: item.txHash,
      createdAt: item.createdAt,
    }));
  } catch (err) {
    console.warn("Gagal membaca riwayat dari localStorage:", err);
    return null;
  }
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

export default function PlatformWorkspacePage() {
  const { address, isConnected, chainId } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContractAsync } = useWriteContract();
  const { switchChain } = useSwitchChain();

  const [invoices, setInvoices] = useState<InvoiceItem[]>(INITIAL_INVOICES);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<bigint>(1n);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Scope Mode: 'wallet' (Hanya invoice milik dompet ini) | 'all' (Bursa Global)
  const [viewScope, setViewScope] = useState<"wallet" | "all">("wallet");
  const [walletRoleFilter, setWalletRoleFilter] = useState<"all" | "freelancer" | "client">("all");

  // Muat riwayat tersimpan dari localStorage saat halaman dibuka
  useEffect(() => {
    const saved = loadStoredInvoices();
    if (saved && saved.length > 0) {
      setInvoices(saved);
      setSelectedInvoiceId(saved[0].id);
    }
  }, []);

  const updateAndSaveInvoices = (updater: (prev: InvoiceItem[]) => InvoiceItem[]) => {
    setInvoices((prev) => {
      const updated = updater(prev);
      saveStoredInvoices(updated);
      return updated;
    });
  };

  const handleResetHistory = () => {
    if (window.confirm("Apakah Anda ingin mereset riwayat ke data contoh awal? Data invoice baru akan dihapus dari penyimpanan lokal.")) {
      localStorage.removeItem(STORAGE_KEY);
      setInvoices(INITIAL_INVOICES);
      setSelectedInvoiceId(INITIAL_INVOICES[0].id);
    }
  };

  // Form State
  const [jobTitleInput, setJobTitleInput] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [nominalUsdc, setNominalUsdc] = useState("");
  const [dueDays, setDueDays] = useState("30");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Drawer listing price discount
  const [drawerDiscountPct, setDrawerDiscountPct] = useState<number>(8);

  // Quick Calculator Tool state
  const [toolNominal, setToolNominal] = useState<number>(1000);
  const [toolDiscount, setToolDiscount] = useState<number>(8);

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

  // 1. Filter berdasarkan Scope Dompet yang Sedang Terhubung
  const scopedInvoices = invoices.filter((inv) => {
    if (viewScope === "wallet") {
      if (!isConnected || !address) return false;
      const myAddr = address.toLowerCase();
      const isFreelancer = inv.freelancer.toLowerCase() === myAddr;
      const isClient = inv.client.toLowerCase() === myAddr;
      const isFunder = inv.funder.toLowerCase() === myAddr;

      // Akun harus terlibat sebagai Freelancer, Klien, atau Investor
      if (!isFreelancer && !isClient && !isFunder) return false;

      if (walletRoleFilter === "freelancer" && !isFreelancer) return false;
      if (walletRoleFilter === "client" && !isClient) return false;
      return true;
    }
    return true;
  });

  // 2. Filter berdasarkan Pencarian & Status
  const filteredInvoices = scopedInvoices.filter((inv) => {
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

  // Invoice terpilih saat ini
  const selectedInvoice =
    filteredInvoices.find((inv) => inv.id === selectedInvoiceId) ||
    filteredInvoices[0] ||
    null;

  // Sinkronisasi otomatis selectedInvoice saat ganti akun atau ganti filter
  useEffect(() => {
    if (filteredInvoices.length > 0) {
      const exists = filteredInvoices.some((inv) => inv.id === selectedInvoiceId);
      if (!exists) {
        setSelectedInvoiceId(filteredInvoices[0].id);
      }
    }
  }, [filteredInvoices, selectedInvoiceId]);

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

      let txHash: string | undefined = undefined;
      if (isConnected) {
        const targetChainId = chainId === baseSepolia.id ? baseSepolia.id : hardhat.id;
        if (chainId && chainId !== targetChainId && switchChain) {
          try {
            await switchChain({ chainId: targetChainId });
          } catch (e) {
            console.warn("User switch chain prompt:", e);
          }
        }

        txHash = await writeContractAsync({
          chainId: targetChainId,
          address: CAIRIN_ADDRESS,
          abi: cairInAbi,
          functionName: "createInvoice",
          args: [clientAddress as `0x${string}`, parsedAmount, parsedDueDate],
        });
      }

      // Pastikan ID unik dan tidak bentrok
      const maxId = invoices.reduce((max, inv) => (inv.id > max ? inv.id : max), 0n);
      const nextId = maxId + 1n;

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
        txHash: txHash,
        createdAt: Date.now(),
      };

      const updated = [newInv, ...invoices];
      setInvoices(updated);
      saveStoredInvoices(updated);
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
    updateAndSaveInvoices((prev) =>
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
        const targetChainId = chainId === baseSepolia.id ? baseSepolia.id : hardhat.id;
        await writeContractAsync({
          chainId: targetChainId,
          address: CAIRIN_ADDRESS,
          abi: cairInAbi,
          functionName: "listInvoice",
          args: [id, parsedListing],
        });
      } catch (err) {
        console.warn("On-chain fallback to simulated state:", err);
      }
    }

    updateAndSaveInvoices((prev) =>
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
    updateAndSaveInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id
          ? { ...inv, status: InvoiceStatus.Financed, funder: defaultInvestor }
          : inv
      )
    );
  };

  // Handler: Pelunasan Klien
  const handlePayInvoice = (id: bigint) => {
    updateAndSaveInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id ? { ...inv, status: InvoiceStatus.Paid } : inv
      )
    );
  };

  // Calculations for quick metrics (dihitung khusus invoice yang sedang aktif di scope)
  const totalAmount = scopedInvoices.reduce((acc, curr) => acc + curr.amount, 0n);
  const totalFinanced = scopedInvoices
    .filter(
      (inv) =>
        inv.status === InvoiceStatus.Financed || inv.status === InvoiceStatus.Paid
    )
    .reduce((acc, curr) => acc + curr.listingPrice, 0n);
  const totalListed = scopedInvoices
    .filter((inv) => inv.status === InvoiceStatus.Listed)
    .reduce((acc, curr) => acc + curr.listingPrice, 0n);

  return (
    <>
      {/* 1. Header Khusus Platform */}
      <header className="site-header wrap">
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Link className="brand-badge" href="/" aria-label="CairIn">
            <span className="brand-circle">C</span>
            <span>CAIRIN</span>
          </Link>
          <span style={{ fontFamily: "var(--mono)", fontSize: "11px", background: "var(--cairin-mint)", padding: "3px 8px", border: "1px solid var(--ink)", fontWeight: 700 }}>
            WORKSPACE KELOLA & CAIRKAN
          </span>
        </div>

        <nav className="header-nav">
          <Link href="/" style={{ color: "var(--cairin-orange)" }}>
            &larr; Kembali ke Beranda
          </Link>
        </nav>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            type="button"
            className="btn-brutal btn-orange"
            style={{ padding: "10px 16px", fontSize: "12px" }}
            onClick={() => setShowCreateModal(true)}
          >
            <span>+ Terbitkan Invoice</span>
          </button>

          {isConnected && (
            <button
              type="button"
              className="header-action-btn"
              style={{
                background: chainId === hardhat.id ? "#ecfdf5" : "#fef2f2",
                color: chainId === hardhat.id ? "#047857" : "#b91c1c",
                borderColor: chainId === hardhat.id ? "#10b981" : "#ef4444",
                fontWeight: 700,
                fontSize: "12px",
              }}
              onClick={() => {
                if (chainId !== hardhat.id && switchChain) {
                  switchChain({ chainId: hardhat.id });
                }
              }}
            >
              <span>{chainId === hardhat.id ? "🟢 Hardhat (31337)" : "🔴 Jaringan Salah (Pindah)"}</span>
            </button>
          )}

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
        </div>
      </header>

      <main style={{ paddingBottom: "80px" }}>
        {/* Banner Peringatan Salah Jaringan MetaMask */}
        {isConnected && chainId && chainId !== hardhat.id && chainId !== baseSepolia.id && (
          <div className="wrap" style={{ marginTop: "20px" }}>
            <div
              style={{
                background: "#fef2f2",
                border: "2px solid #ef4444",
                padding: "14px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div>
                <strong style={{ color: "#991b1b", display: "block", fontSize: "14px" }}>
                  ⚠️ MetaMask Anda Sedang Berada di Ethereum Mainnet (Chain ID {chainId})!
                </strong>
                <span style={{ color: "#7f1d1d", fontSize: "12px" }}>
                  Kontrak CairIn berjalan di jaringan lokal Hardhat (Chain ID 31337). Transaksi ke Mainnet akan gagal karena membutuhkan ETH riil.
                </span>
              </div>
              <button
                type="button"
                className="btn-brutal btn-orange"
                style={{ padding: "8px 16px", fontSize: "12px" }}
                onClick={() => switchChain && switchChain({ chainId: hardhat.id })}
              >
                Pindah ke Hardhat Local Sekarang &rarr;
              </button>
            </div>
          </div>
        )}
        {/* 2. Top Title Bar & Metrik */}
        <div className="wrap" style={{ marginTop: "40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
            <div>
              <div className="eyebrow-tag">
                <span className="eyebrow-bar" />
                <span>WORKSPACE PLATFORM • BASE SEPOLIA</span>
              </div>
              <h1 style={{ fontSize: "36px", fontWeight: 900, letterSpacing: "-0.03em" }}>
                Kelola & Cairkan Invoice
              </h1>
              <p style={{ color: "#555", fontSize: "15px", marginTop: "4px" }}>
                Pantau status piutang Anda, ajukan pengesahan klien, tawarkan hak tagih dengan diskon ke investor, atau danai tagihan rekanan.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="stats-metric-strip" style={{ marginBlock: "0 40px" }}>
            <div
              className={`stat-cell interactive ${filterStatus === "all" ? "active" : ""}`}
              onClick={() => setFilterStatus("all")}
            >
              <span className="stat-cell-label">Total Nilai Tagihan</span>
              <span className="stat-cell-number">{formatCurrency(totalAmount)}</span>
              <span className="stat-cell-note">{invoices.length} invoice terbit (Klik untuk filter)</span>
            </div>

            <div
              className={`stat-cell interactive ${filterStatus === "financed" ? "active" : ""}`}
              onClick={() => setFilterStatus("financed")}
            >
              <span className="stat-cell-label">Uang Cair ke Freelancer</span>
              <span className="stat-cell-number" style={{ color: "var(--cairin-emerald)" }}>
                {formatCurrency(totalFinanced)}
              </span>
              <span className="stat-cell-note">Sudah masuk rekening Web3</span>
            </div>

            <div
              className={`stat-cell interactive ${filterStatus === "listed" ? "active" : ""}`}
              onClick={() => setFilterStatus("listed")}
            >
              <span className="stat-cell-label">Tersedia di Bursa</span>
              <span className="stat-cell-number" style={{ color: "var(--cairin-orange)" }}>
                {formatCurrency(totalListed)}
              </span>
              <span className="stat-cell-note">Siap didanai investor</span>
            </div>

            <div className="stat-cell">
              <span className="stat-cell-label">Proteksi Blockchain</span>
              <span className="stat-cell-number" style={{ color: "var(--cairin-green)" }}>
                Anti-Ganda
              </span>
              <span className="stat-cell-note">Terkunci atomik di Base</span>
            </div>
          </div>

          {/* Tools Tambahan: Kalkulator Cepat Pencairan */}
          <div style={{ background: "#FFFFFF", border: "2px solid var(--ink)", boxShadow: "var(--shadow-brutal)", padding: "28px 32px", marginBottom: "40px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "16px" }}>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 800 }}>⚡ Tools Kalkulator Cepat Pencairan Piutang</h3>
                <p style={{ fontSize: "13px", color: "#666", marginTop: "2px" }}>
                  Hitung berapa dana bersih yang Anda terima hari ini jika Anda menjual invoice dengan potongan diskon ke investor.
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px", alignItems: "center" }}>
              <div>
                <label style={{ fontFamily: "var(--mono)", fontSize: "11px", fontWeight: 800, textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  Nilai Tagihan Invoice (USDC)
                </label>
                <input
                  type="number"
                  value={toolNominal}
                  onChange={(e) => setToolNominal(Number(e.target.value) || 0)}
                  className="field-input-brutal"
                  style={{ margin: 0 }}
                />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontFamily: "var(--mono)", fontSize: "11px", fontWeight: 800 }}>
                  <span>Diskon Ditawarkan:</span>
                  <span style={{ color: "var(--cairin-orange)" }}>{toolDiscount}%</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="20"
                  step="1"
                  value={toolDiscount}
                  onChange={(e) => setToolDiscount(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--cairin-orange)", cursor: "pointer" }}
                />
              </div>

              <div style={{ background: "var(--paper-card)", border: "1.5px solid var(--ink)", padding: "14px 18px", borderRadius: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "12px", color: "#555" }}>Uang Cair Hari Ini:</span>
                  <b style={{ color: "var(--cairin-green)", fontFamily: "var(--mono)", fontSize: "15px" }}>
                    ${((toolNominal * (100 - toolDiscount)) / 100).toFixed(0)} USDC
                  </b>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12px", color: "#555" }}>Margin Untung Investor:</span>
                  <b style={{ color: "var(--cairin-orange)", fontFamily: "var(--mono)" }}>
                    +${((toolNominal * toolDiscount) / 100).toFixed(0)} USDC
                  </b>
                </div>
              </div>
            </div>
          </div>

          {/* 3. The Interactive Ledger Workspace */}
          <div className="ledger-workspace">
            {/* Scope Switcher: Dompet Saya vs Bursa Global */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", paddingBottom: "14px", borderBottom: "2px solid var(--ink)", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  className={`btn-brutal ${viewScope === "wallet" ? "btn-orange" : "btn-outline"}`}
                  style={{ padding: "8px 16px", fontSize: "13px" }}
                  onClick={() => setViewScope("wallet")}
                >
                  👤 Invoice Akun Saya {isConnected && address ? `(${formatShortAddress(address)})` : ""}
                </button>
                <button
                  type="button"
                  className={`btn-brutal ${viewScope === "all" ? "btn-acid" : "btn-outline"}`}
                  style={{ padding: "8px 16px", fontSize: "13px" }}
                  onClick={() => setViewScope("all")}
                >
                  🌐 Bursa Global (Semua Akun: {invoices.length})
                </button>
              </div>

              {isConnected && viewScope === "wallet" && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "var(--mono)", fontSize: "11px" }}>
                  <span style={{ fontWeight: 800, color: "#666" }}>PERAN:</span>
                  <button
                    type="button"
                    className={`filter-pill ${walletRoleFilter === "all" ? "active" : ""}`}
                    style={{ padding: "3px 8px", fontSize: "11px" }}
                    onClick={() => setWalletRoleFilter("all")}
                  >
                    Semua ({scopedInvoices.length})
                  </button>
                  <button
                    type="button"
                    className={`filter-pill ${walletRoleFilter === "freelancer" ? "active" : ""}`}
                    style={{ padding: "3px 8px", fontSize: "11px" }}
                    onClick={() => setWalletRoleFilter("freelancer")}
                  >
                    Freelancer (Dibuat)
                  </button>
                  <button
                    type="button"
                    className={`filter-pill ${walletRoleFilter === "client" ? "active" : ""}`}
                    style={{ padding: "3px 8px", fontSize: "11px" }}
                    onClick={() => setWalletRoleFilter("client")}
                  >
                    Klien (Tagihan Masuk)
                  </button>
                </div>
              )}
            </div>

            {/* Filter Pills Bar + Search Input */}
            <div className="ledger-filters-bar">
              <div className="filter-pills-group">
                <button
                  type="button"
                  className={`filter-pill ${filterStatus === "all" ? "active" : ""}`}
                  onClick={() => setFilterStatus("all")}
                >
                  Semua ({scopedInvoices.length})
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
                <button
                  type="button"
                  onClick={handleResetHistory}
                  title="Kembalikan riwayat ke data contoh bawaan"
                  style={{
                    padding: "6px 10px",
                    border: "1.5px dashed #888",
                    background: "#F5F5F5",
                    fontFamily: "var(--mono)",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                    color: "#555",
                  }}
                >
                  ↺ Reset Data
                </button>
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
              {filteredInvoices.length === 0 ? (
                <div style={{ padding: "48px 24px", textAlign: "center", background: "#FFFFFF", border: "2px dashed var(--line)", margin: "8px 0" }}>
                  <div style={{ fontSize: "40px", marginBottom: "10px" }}>📭</div>
                  <h4 style={{ fontSize: "17px", fontWeight: 900 }}>
                    {viewScope === "wallet" && isConnected
                      ? `Belum Ada Invoice untuk Akun ${formatShortAddress(address || "")}`
                      : "Tidak Ada Invoice yang Sesuai Filter"}
                  </h4>
                  <p style={{ fontSize: "13px", color: "#666", maxWidth: "420px", margin: "8px auto 20px", lineHeight: 1.5 }}>
                    {viewScope === "wallet" && isConnected
                      ? "Dompet MetaMask ini belum menerbitkan invoice dan belum menerima tagihan dari pihak lain."
                      : "Silakan ganti kata kunci pencarian atau beralih ke tab bursa global."}
                  </p>
                  <button
                    type="button"
                    className="btn-brutal btn-orange"
                    onClick={() => setShowCreateModal(true)}
                  >
                    + Terbitkan Invoice untuk Akun Ini
                  </button>
                </div>
              ) : (
                filteredInvoices.map((inv) => {
                  const isSelected = selectedInvoice && inv.id === selectedInvoice.id;

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
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <b>{inv.jobTitle}</b>
                          {inv.txHash && (
                            <span
                              title={`Tx: ${inv.txHash}`}
                              style={{
                                fontFamily: "var(--mono)",
                                fontSize: "10px",
                                background: "#e0f2fe",
                                color: "#0369a1",
                                padding: "1px 6px",
                                border: "1px solid #7dd3fc",
                                fontWeight: 700,
                              }}
                            >
                              ⛓️ ON-CHAIN
                            </span>
                          )}
                          {address && inv.freelancer.toLowerCase() === address.toLowerCase() && (
                            <span
                              style={{
                                fontFamily: "var(--mono)",
                                fontSize: "10px",
                                background: "#fef3c7",
                                color: "#92400e",
                                padding: "1px 5px",
                                border: "1px solid #fde68a",
                                fontWeight: 700,
                              }}
                            >
                              Freelancer (Anda)
                            </span>
                          )}
                          {address && inv.client.toLowerCase() === address.toLowerCase() && (
                            <span
                              style={{
                                fontFamily: "var(--mono)",
                                fontSize: "10px",
                                background: "#e0e7ff",
                                color: "#3730a3",
                                padding: "1px 5px",
                                border: "1px solid #c7d2fe",
                                fontWeight: 700,
                              }}
                            >
                              Klien (Anda)
                            </span>
                          )}
                        </div>
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
                })
              )}
            </div>

            {/* Detail Voucher Drawer untuk Baris Terpilih */}
            {selectedInvoice ? (
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

                  {selectedInvoice.txHash && (
                    <div
                      style={{
                        background: "#f0fdf4",
                        border: "1.5px solid #86efac",
                        padding: "12px 14px",
                        marginTop: "16px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <span
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: "11px",
                            fontWeight: 800,
                            color: "#166534",
                          }}
                        >
                          ✓ TERCATAT DI BLOCKCHAIN (METAMASK)
                        </span>
                        <span style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "#15803d", fontWeight: 700 }}>
                          Tersimpan di Riwayat
                        </span>
                      </div>
                      <small style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "#475569", display: "block" }}>
                        ID Transaksi (Tx Hash):
                      </small>
                      <code
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: "11px",
                          wordBreak: "break-all",
                          color: "#0f172a",
                          fontWeight: 700,
                          display: "block",
                          marginTop: "2px",
                        }}
                      >
                        {selectedInvoice.txHash}
                      </code>
                    </div>
                  )}
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
            ) : (
              <div className="voucher-detail-drawer" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "380px", textAlign: "center", padding: "40px 24px" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
                <h3 style={{ fontSize: "19px", fontWeight: 800, marginBottom: "8px" }}>
                  {viewScope === "wallet" && isConnected
                    ? `Belum Ada Invoice untuk Akun Ini`
                    : "Tidak Ada Invoice Terpilih"}
                </h3>
                <p style={{ fontSize: "13.5px", color: "#666", maxWidth: "340px", margin: "0 auto 24px", lineHeight: 1.5 }}>
                  {viewScope === "wallet" && isConnected
                    ? `Akun MetaMask ${formatShortAddress(address || "")} belum memiliki invoice. Terbitkan invoice baru untuk mulai mencairkan piutang!`
                    : "Pilih salah satu invoice dari daftar sebelah kiri untuk melihat rincian."}
                </p>
                <button
                  type="button"
                  className="btn-brutal btn-orange"
                  onClick={() => setShowCreateModal(true)}
                >
                  + Terbitkan Invoice Baru
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="wrap">
        <div>&copy; 2026 CAIRIN — BASE SEPOLIA TESTNET</div>
        <Link href="/" style={{ textDecoration: "underline" }}>
          Kembali ke Beranda
        </Link>
      </footer>

      {/* Modal: Terbitkan Invoice Baru */}
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "6px" }}>
                  <label style={{ fontFamily: "var(--mono)", fontSize: "11px", fontWeight: 800, textTransform: "uppercase" }}>
                    Alamat Dompet Klien (Pembayar)
                  </label>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      type="button"
                      style={{ background: "#F0F0F0", border: "1px solid #CCC", padding: "2px 6px", color: "var(--ink)", fontSize: "10px", cursor: "pointer", fontFamily: "var(--mono)", fontWeight: 700 }}
                      onClick={() => setClientAddress("0x70997970C51812dc3A010C7d01b50e0d17dc79C8")}
                    >
                      Pilih Akun 1
                    </button>
                    <button
                      type="button"
                      style={{ background: "#F0F0F0", border: "1px solid #CCC", padding: "2px 6px", color: "var(--ink)", fontSize: "10px", cursor: "pointer", fontFamily: "var(--mono)", fontWeight: 700 }}
                      onClick={() => setClientAddress("0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc")}
                    >
                      Pilih Akun 2
                    </button>
                  </div>
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
