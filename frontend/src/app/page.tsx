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

export default function TapPayStyleCairInPage() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContractAsync } = useWriteContract();

  const [invoices, setInvoices] = useState<InvoiceData[]>(INITIAL_INVOICES);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [clientAddress, setClientAddress] = useState("");
  const [nominalUsdc, setNominalUsdc] = useState("");
  const [dueDays, setDueDays] = useState("30");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Revert Demo State
  const [revertDemoRunning, setRevertDemoRunning] = useState(false);
  const [revertDemoTriggered, setRevertDemoTriggered] = useState(false);

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

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientAddress || !nominalUsdc) {
      alert("Mohon isi alamat klien dan nominal tagihan.");
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
      setShowCreateModal(false);
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

  const runRevertSimulation = () => {
    setRevertDemoRunning(true);
    setRevertDemoTriggered(false);
    setTimeout(() => {
      setRevertDemoRunning(false);
      setRevertDemoTriggered(true);
    }, 900);
  };

  return (
    <>
      {/* 1. Header (Persis Struktur tap-pay.xyz) */}
      <header className="site-header wrap">
        <a className="brand" href="/" aria-label="CairIn home">
          <span className="brand-mark">C</span>
          <span>CAIRIN</span>
        </a>

        <nav aria-label="Main navigation">
          <a href="#cara-kerja">Cara Kerja</a>
          <a href="#anti-ganda">Anti-Double Funding</a>
          <a href="#buku-piutang">Buku Piutang</a>
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
            className="header-cta"
            onClick={() => disconnect()}
          >
            {formatShortAddress(address || "")} • Putuskan
          </button>
        ) : (
          <button
            type="button"
            className="header-cta"
            onClick={() => connect({ connector: injected() })}
          >
            Sambungkan Dompet &nearr;
          </button>
        )}
      </header>

      <main>
        {/* 2. Hero Section (Persis Grid & Tipografi tap-pay.xyz) */}
        <section className="hero wrap">
          <div className="hero-copy">
            <p className="eyebrow">
              <span /> ETHGLOBAL JAKARTA 2026 / RWA FINANCING
            </p>
            <h1>Uang invoice sudah ada di kantongmu.</h1>
            <p className="hero-lede">
              CairIn mengubah invoice freelance menjadi NFT ERC-721 di Base Sepolia.
              Investor mendanai dengan diskon, uang cair di muka langsung ke rekening Web3 freelancer.
              Saat jatuh tempo, klien melunasi tagihan penuh otomatis ke pemegang NFT.
              Satu invoice terkunci atomik, mustahil dijual dua kali.
            </p>

            <div className="hero-actions">
              <button
                type="button"
                className="button button-primary"
                onClick={() => setShowCreateModal(true)}
              >
                <span>+ Terbitkan Invoice</span>
                <span aria-hidden="true">&darr;</span>
              </button>

              <a className="text-link" href="#anti-ganda">
                Uji Anti-Ganda <span aria-hidden="true">&darr;</span>
              </a>
            </div>

            <p className="demo-note">
              Base Sepolia <span>/</span> NFT ERC-721 <span>/</span> MOCK USDC
            </p>
          </div>

          {/* Interactive Phone / Invoice Stage (Persis Gaya Terminal tap-pay.xyz) */}
          <div className="terminal-stage" aria-label="CairIn terminal preview">
            <div className="sun" />
            <p className="stage-note">
              INVOICE KAMU
              <br />
              ADALAH TERMINALNYA
            </p>

            <div className="phone">
              <div className="phone-top">
                <span>11:42</span>
                <span className="signal">NFT • RWA))</span>
              </div>
              <p className="phone-label">NILAI PIUTANG</p>
              <p className="amount">
                <sup>$</sup>1.000
              </p>

              <div className="merchant-card">
                <span className="merchant-avatar">C</span>
                <span>
                  <b>Desain UI/UX Mobile</b>
                  <small>klien: 0x7099...79c8</small>
                </span>
                <i>DIDANAI</i>
              </div>

              <div
                className="tap-zone"
                onClick={() => alert("Invoice #INV-001 telah berhasil didanai oleh investor seharga 900 USDC!")}
              >
                <span className="waves">)))</span>
                <b>Siap Dicairkan</b>
                <small>Funder membayar 900 USDC langsung</small>
              </div>
            </div>

            <p className="vertical-label">TERBIT / DANAI / CAIR</p>
          </div>
        </section>

        {/* 3. Neo-Brutalist Marquee Ticker */}
        <section className="ticker" aria-label="Product principles">
          <div className="ticker-track">
            <div className="ticker-line">
              HAK TAGIH RWA RESMI <b>+</b> ANTI-DOUBLE FUNDING ON-CHAIN <b>+</b> CAIR DI MUKA <b>+</b> NFT ERC-721 <b>+</b> BASE SEPOLIA TESTNET <b>+</b>
            </div>
            <div className="ticker-line" aria-hidden="true">
              HAK TAGIH RWA RESMI <b>+</b> ANTI-DOUBLE FUNDING ON-CHAIN <b>+</b> CAIR DI MUKA <b>+</b> NFT ERC-721 <b>+</b> BASE SEPOLIA TESTNET <b>+</b>
            </div>
          </div>
        </section>

        {/* 4. Three Steps Section (Persis Gaya "Three Moves" tap-pay.xyz) */}
        <section className="steps wrap" id="cara-kerja">
          <div className="section-heading">
            <p className="eyebrow">
              <span /> TIGA LANGKAH
            </p>
            <h2>
              Dari invoice jadi uang tunai.
              <br />
              Tanpa menunggu 60 hari.
            </h2>
          </div>

          <ol>
            <li>
              <span>01</span>
              <div className="step-icon">$</div>
              <h3>Terbitkan Tagihan</h3>
              <p>
                Freelancer membuat kuitansi digital. Smart contract mencetak sertifikat hak tagih NFT ERC-721 langsung ke dompet Anda.
              </p>
            </li>
            <li>
              <span>02</span>
              <div className="step-icon">OK</div>
              <h3>Persetujuan Klien</h3>
              <p>
                Klien menandatangani verifikasi bahwa pekerjaan telah tuntas. Status berubah sah menjadi Disetujui.
              </p>
            </li>
            <li>
              <span>03</span>
              <div className="step-icon">)))</div>
              <h3>Pencairan Investor</h3>
              <p>
                Investor mendanai invoice dengan harga diskon. Uang langsung masuk ke dompet Anda, hak NFT berpindah ke investor.
              </p>
            </li>
          </ol>
        </section>

        {/* 5. Trust & Anti-Double Funding Card (Persis Card miring tap-pay.xyz) */}
        <section className="trust" id="anti-ganda">
          <div className="wrap trust-grid">
            <div className="trust-copy">
              <p className="eyebrow" style={{ color: "var(--paper)" }}>
                <span /> PROTOKOL KEAMANAN
              </p>
              <h2>
                Kunci hak tagih.
                <br />
                Sebelum uang berpindah.
              </h2>
              <p>
                Dalam pembiayaan tradisional, penipuan terbesar adalah satu invoice digadaikan ke beberapa bank sekaligus.
                Di CairIn, smart contract mengunci status secara atomik di Base Sepolia.
                Upaya dari investor kedua untuk mendanai invoice yang sudah dibeli akan langsung <strong>ditolak (revert)</strong>.
              </p>

              <button
                type="button"
                className="button button-primary"
                onClick={runRevertSimulation}
                disabled={revertDemoRunning}
                style={{ width: "max-content", minWidth: "260px" }}
              >
                <span>{revertDemoRunning ? "Menguji Blockchain..." : "Uji Penolakan Funder 2"}</span>
                <span aria-hidden="true">&nearr;</span>
              </button>
            </div>

            <div className="verify-card">
              <div className="verify-head">
                <span>PEMERIKSAAN KONTRAK</span>
                <i>LIVE ON-CHAIN</i>
              </div>

              <div className="verify-name">
                <span className="merchant-avatar">C</span>
                <span>
                  <b>Invoice #INV-001</b>
                  <small>Nominal: 1.000 USDC • Diskon: 900 USDC</small>
                </span>
              </div>

              <ul>
                <li>
                  <i />
                  Status NFT = Listed di bursa <b>PASS</b>
                </li>
                <li>
                  <i />
                  Funder 1 membeli & mentransfer dana <b>PASS</b>
                </li>
                <li>
                  <i style={{ background: revertDemoTriggered ? "#f45b35" : "#22c55e" }} />
                  Funder 2 mencoba membeli ulang{" "}
                  <b>{revertDemoTriggered ? "DITOLAK (REVERT)" : "TERKUNCI"}</b>
                </li>
              </ul>

              <div
                className="verified-stamp"
                style={{
                  background: revertDemoTriggered ? "#fee2e2" : "var(--mint)",
                  color: revertDemoTriggered ? "#991b1b" : "#175c29",
                }}
              >
                {revertDemoTriggered
                  ? "TRANSAKSI GAGAL: INVOICE IS NOT LISTED"
                  : "DIVERIFIKASI AMAN DARI DOUBLE-FUNDING"}
              </div>
            </div>
          </div>
        </section>

        {/* 6. Buku Piutang & Manajemen Invoice (Live Table) */}
        <section className="ledger-section wrap" id="buku-piutang">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                <span /> BUKU BESAR ON-CHAIN
              </p>
              <h2>Daftar Invoice Freelancer</h2>
            </div>

            <button
              type="button"
              className="button button-orange"
              onClick={() => setShowCreateModal(true)}
            >
              <span>+ Terbitkan Invoice</span>
              <span aria-hidden="true">&darr;</span>
            </button>
          </div>

          <div className="ledger-box">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>No. Invoice</th>
                  <th>Klien Pembayar</th>
                  <th>Nominal Tagihan</th>
                  <th>Penawaran Bursa</th>
                  <th>Status Sertifikat</th>
                  <th style={{ textAlign: "right" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id.toString()}>
                    <td style={{ fontFamily: "var(--mono)", fontWeight: 700 }}>
                      #INV-{inv.id.toString().padStart(3, "0")}
                    </td>
                    <td style={{ fontFamily: "var(--mono)" }}>
                      {formatShortAddress(inv.client)}
                    </td>
                    <td style={{ fontFamily: "var(--mono)", fontWeight: 700 }}>
                      {formatCurrency(inv.amount)}
                    </td>
                    <td style={{ fontFamily: "var(--mono)", color: "var(--orange)", fontWeight: 700 }}>
                      {inv.listingPrice > 0n ? formatCurrency(inv.listingPrice) : "—"}
                    </td>
                    <td>
                      {inv.status === InvoiceStatus.Financed && (
                        <span style={{ background: "var(--mint)", color: "#175c29", padding: "4px 8px", fontSize: "11px", fontWeight: 800 }}>
                          DIDANAI INVESTOR
                        </span>
                      )}
                      {inv.status === InvoiceStatus.Listed && (
                        <span style={{ background: "var(--acid)", color: "var(--ink)", padding: "4px 8px", fontSize: "11px", fontWeight: 800 }}>
                          DIJUAL DI BURSA
                        </span>
                      )}
                      {inv.status === InvoiceStatus.Approved && (
                        <span style={{ background: "#e5e7eb", color: "#374151", padding: "4px 8px", fontSize: "11px", fontWeight: 800 }}>
                          DISETUJUI KLIEN
                        </span>
                      )}
                      {inv.status === InvoiceStatus.Created && (
                        <span style={{ background: "#f3f4f6", color: "#6b7280", padding: "4px 8px", fontSize: "11px", fontWeight: 800 }}>
                          DRAFT
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        style={{
                          background: "var(--ink)",
                          color: "white",
                          padding: "6px 12px",
                          fontSize: "11px",
                          fontWeight: 800,
                          border: "none",
                          cursor: "pointer",
                        }}
                        onClick={() => alert(`Detail Invoice #INV-${inv.id}: Klien ${inv.client}, Nominal ${formatCurrency(inv.amount)}`)}
                      >
                        Buka &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Modal Terbitkan Invoice Baru */}
        {showCreateModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(23, 23, 19, 0.75)",
              display: "grid",
              placeItems: "center",
              zIndex: 100,
              padding: "20px",
            }}
          >
            <div
              style={{
                width: "min(540px, 100%)",
                background: "var(--paper)",
                border: "2px solid var(--ink)",
                boxShadow: "10px 10px 0 var(--orange)",
                padding: "36px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <h3 style={{ fontFamily: "var(--serif)", fontSize: "32px", margin: 0 }}>
                  Terbitkan Tagihan Baru
                </h3>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", fontWeight: 800 }}
                >
                  &times;
                </button>
              </div>
              <p style={{ margin: "10px 0 24px", color: "#555", fontSize: "14px" }}>
                Invoice akan dicetak langsung sebagai NFT ERC-721 di Base Sepolia.
              </p>

              <form onSubmit={handleCreateInvoice}>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 900, marginBottom: "6px", fontFamily: "var(--mono)" }}>
                    ALAMAT DOMPET KLIEN (PEMBAYAR)
                  </label>
                  <input
                    type="text"
                    placeholder="0x7099... (Alamat EVM Klien)"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: "white",
                      border: "2px solid var(--ink)",
                      fontFamily: "var(--mono)",
                      fontSize: "13px",
                      outline: "none",
                    }}
                    required
                  />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 900, marginBottom: "6px", fontFamily: "var(--mono)" }}>
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
                      padding: "12px",
                      background: "white",
                      border: "2px solid var(--ink)",
                      fontFamily: "var(--mono)",
                      fontSize: "13px",
                      outline: "none",
                    }}
                    required
                  />
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 900, marginBottom: "6px", fontFamily: "var(--mono)" }}>
                    JANGKA JATUH TEMPO
                  </label>
                  <select
                    value={dueDays}
                    onChange={(e) => setDueDays(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: "white",
                      border: "2px solid var(--ink)",
                      fontFamily: "var(--mono)",
                      fontSize: "13px",
                      outline: "none",
                    }}
                  >
                    <option value="14">14 Hari</option>
                    <option value="30">30 Hari</option>
                    <option value="60">60 Hari</option>
                  </select>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    style={{
                      padding: "14px 18px",
                      background: "transparent",
                      border: "1px solid var(--ink)",
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
                    className="button button-primary"
                    style={{ minWidth: "200px" }}
                  >
                    <span>{isSubmitting ? "Mencetak..." : "Cetak NFT"}</span>
                    <span aria-hidden="true">&rarr;</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* 7. Footer (Persis Struktur tap-pay.xyz) */}
      <footer className="wrap">
        <a className="brand" href="/">
          <span className="brand-mark">C</span>
          <span>CAIRIN</span>
        </a>
        <p>Tagih dan cairkan. Tanpa perantara.</p>
        <p>&copy; 2026 CAIRIN • BASE SEPOLIA</p>
      </footer>
    </>
  );
}
