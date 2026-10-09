"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useWriteContract } from "wagmi";
import { injected } from "wagmi/connectors";
import { parseUnits, formatUnits } from "viem";
import {
  CAIRIN_ADDRESS,
  cairInAbi,
  InvoiceStatus,
  getStatusMeta,
  InvoiceData,
} from "@/contracts/config";

// Data awal contoh representatif agar pemula dapat langsung melihat visual seluruh status
const INITIAL_DEMO_INVOICES: InvoiceData[] = [
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

export default function FreelancerInvoicePage() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContractAsync } = useWriteContract();

  const [invoices, setInvoices] = useState<InvoiceData[]>(INITIAL_DEMO_INVOICES);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<bigint>(1n);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form State: Buat Invoice Baru
  const [clientAddress, setClientAddress] = useState("");
  const [nominalUsdc, setNominalUsdc] = useState("");
  const [dueDays, setDueDays] = useState("30");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State: Jual Invoice (List)
  const [listingDiscountPrice, setListingDiscountPrice] = useState("");

  const selectedInvoice = invoices.find((inv) => inv.id === selectedInvoiceId);

  // Format bantuan
  const formatCurrency = (val: bigint) => {
    if (val === 0n) return "-";
    const num = Number(formatUnits(val, 6));
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num) + " USDC";
  };

  const formatShortAddress = (addr: string) => {
    if (!addr || addr === "0x0000000000000000000000000000000000000000") return "-";
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

      // Coba kirim transaksi on-chain jika tersambung dompet
      if (isConnected) {
        await writeContractAsync({
          address: CAIRIN_ADDRESS,
          abi: cairInAbi,
          functionName: "createInvoice",
          args: [clientAddress as `0x${string}`, parsedAmount, parsedDueDate],
        });
      }

      // Perbarui state lokal
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
      alert("Invoice baru berhasil diterbitkan sebagai NFT ERC-721 dengan status DRAFT.");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(err);
      alert(`Penerbitan transaksi gagal: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Daftarkan Invoice ke Pasar (List Invoice)
  const handleListInvoice = async (tokenId: bigint) => {
    if (!listingDiscountPrice) {
      alert("Masukkan harga penawaran diskon.");
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedListingPrice = parseUnits(listingDiscountPrice, 6);

      if (isConnected) {
        await writeContractAsync({
          address: CAIRIN_ADDRESS,
          abi: cairInAbi,
          functionName: "listInvoice",
          args: [tokenId, parsedListingPrice],
        });
      }

      // Perbarui status invoice di state lokal
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === tokenId
            ? {
                ...inv,
                status: InvoiceStatus.Listed,
                listingPrice: parsedListingPrice,
              }
            : inv
        )
      );
      setListingDiscountPrice("");
      alert("Invoice berhasil didaftarkan ke bursa investor dengan cap DIJUAL.");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(err);
      alert(`Gagal mendaftarkan invoice: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="doc-canvas">
      {/* Top Bar Dokumen */}
      <header className="doc-topbar">
        <div className="brand-col">
          <div className="brand-title">
            <span>CAIRIN</span>
            <span className="brand-tag">RWA • BASE SEPOLIA</span>
          </div>
          <p className="brand-subtitle">
            Buku Catatan Piutang & Pembiayaan Invoice untuk Freelancer
          </p>
        </div>

        <div className="wallet-box">
          <span
            className={`network-indicator ${!isConnected ? "disconnected" : ""}`}
          />
          <div className="addr-cell">
            {isConnected ? formatShortAddress(address || "") : "Dompet Terputus"}
          </div>
          {isConnected ? (
            <button
              onClick={() => disconnect()}
              className="btn-doc btn-subtle"
              type="button"
            >
              Putuskan
            </button>
          ) : (
            <button
              onClick={() => connect({ connector: injected() })}
              className="btn-doc btn-outline"
              type="button"
            >
              Sambungkan Dompet
            </button>
          )}
        </div>
      </header>

      {/* Header Bagian Utama */}
      <section className="section-meta">
        <div>
          <h1 className="section-headline">Buku Catatan Invoice</h1>
          <p className="section-desc">
            Daftar invoice pekerjaan yang telah Anda terbitkan ke blockchain.
            Invoice yang telah disetujui klien dapat langsung ditawarkan ke investor
            dengan potongan harga untuk pencairan uang di muka.
          </p>
        </div>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-doc btn-primary"
          type="button"
        >
          {showCreateForm ? "Tutup Formulir" : "+ Terbitkan Invoice Baru"}
        </button>
      </section>

      {/* Formulir Terbitkan Invoice Baru (Bergaya Lembar Kuitansi Kantor) */}
      {showCreateForm && (
        <form onSubmit={handleCreateInvoice} className="form-paper">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <h2 className="font-serif" style={{ fontSize: "18px", fontWeight: 600 }}>
              Formulir Penerbitan Invoice NFT
            </h2>
            <span className="addr-cell">STANDAR KONTRAK ERC-721</span>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "4px" }}>
            Invoice ini akan dicetak langsung sebagai sertifikat hak tagih digital ke alamat dompet Anda.
          </p>

          <div className="form-grid">
            <div className="field-group">
              <label className="field-label">Alamat Dompet Klien (Pembayar)</label>
              <input
                type="text"
                className="field-input"
                placeholder="0x7099... (Alamat EVM Klien)"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                required
              />
            </div>

            <div className="field-group">
              <label className="field-label">Nominal Tagihan (USDC)</label>
              <input
                type="number"
                step="0.01"
                className="field-input"
                placeholder="Contoh: 1000"
                value={nominalUsdc}
                onChange={(e) => setNominalUsdc(e.target.value)}
                required
              />
            </div>

            <div className="field-group">
              <label className="field-label">Jangka Waktu Jatuh Tempo</label>
              <select
                className="field-input"
                value={dueDays}
                onChange={(e) => setDueDays(e.target.value)}
              >
                <option value="14">14 Hari dari sekarang</option>
                <option value="30">30 Hari dari sekarang</option>
                <option value="45">45 Hari dari sekarang</option>
                <option value="60">60 Hari dari sekarang</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="btn-doc btn-subtle"
            >
              Batalkan
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-doc btn-primary"
            >
              {isSubmitting ? "Mencetak ke Blockchain..." : "Cetak & Terbitkan Invoice"}
            </button>
          </div>
        </form>
      )}

      {/* Tabel Bersih Lembar Piutang Freelancer */}
      <section className="table-wrapper">
        <table className="doc-table">
          <thead>
            <tr>
              <th>No. Invoice</th>
              <th>Klien Pembayar</th>
              <th>Jatuh Tempo</th>
              <th>Nominal Tagihan</th>
              <th>Harga Penawaran</th>
              <th>Status Sertifikat</th>
              <th style={{ textAlign: "right" }}>Tindakan</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => {
              const meta = getStatusMeta(inv.status);
              const isSelected = inv.id === selectedInvoiceId;

              return (
                <tr
                  key={inv.id.toString()}
                  style={{
                    backgroundColor: isSelected ? "#FAF5E8" : undefined,
                    cursor: "pointer",
                  }}
                  onClick={() => setSelectedInvoiceId(inv.id)}
                >
                  <td className="font-mono" style={{ fontWeight: 600 }}>
                    #INV-{inv.id.toString().padStart(3, "0")}
                  </td>
                  <td className="addr-cell">{formatShortAddress(inv.client)}</td>
                  <td className="font-mono" style={{ fontSize: "13px" }}>
                    {formatDate(inv.dueDate)}
                  </td>
                  <td className="money-cell">{formatCurrency(inv.amount)}</td>
                  <td className="money-discount">
                    {inv.listingPrice > 0n ? formatCurrency(inv.listingPrice) : "—"}
                  </td>
                  <td>
                    <span className={`stamp ${meta.stampClass}`}>{meta.label}</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      className="btn-doc btn-subtle"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedInvoiceId(inv.id);
                      }}
                    >
                      {isSelected ? "Sedang Dibuka" : "Buka Lembaran"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* Lembar Faktur Fisik Terperinci (Physical Printed Invoice Sheet Style) */}
      {selectedInvoice && (
        <article className="invoice-sheet">
          <div className="invoice-sheet-header">
            <div>
              <div
                className="font-mono"
                style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}
              >
                LEMBAR SERTIFIKAT PIUTANG DIGITAL (ERC-721 #{selectedInvoice.id.toString()})
              </div>
              <h2 className="font-serif" style={{ fontSize: "26px", fontWeight: 700 }}>
                Faktur Tagihan #INV-{selectedInvoice.id.toString().padStart(3, "0")}
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "2px" }}>
                Jatuh tempo pelunasan: {formatDate(selectedInvoice.dueDate)}
              </p>
            </div>

            {/* Cap Stempel Besar Otentik */}
            <div style={{ textAlign: "right" }}>
              <div className={`stamp stamp-large ${getStatusMeta(selectedInvoice.status).stampClass}`}>
                {getStatusMeta(selectedInvoice.status).label}
              </div>
              <div
                className="font-mono"
                style={{ fontSize: "11px", color: "var(--text-faint)", marginTop: "8px" }}
              >
                STATUS SAH KONTRAK
              </div>
            </div>
          </div>

          {/* Rincian Pihak Terlibat */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "24px",
              padding: "24px 0",
              borderBottom: "1px solid var(--border-fine)",
            }}
          >
            <div>
              <div className="field-label">Penerbit (Freelancer)</div>
              <div className="font-mono" style={{ fontSize: "13px", marginTop: "4px" }}>
                {selectedInvoice.freelancer}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Pembuat pekerjaan & tagihan
              </div>
            </div>

            <div>
              <div className="field-label">Klien Pembayar</div>
              <div className="font-mono" style={{ fontSize: "13px", marginTop: "4px" }}>
                {selectedInvoice.client}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Pihak wajib melunasi saat tempo
              </div>
            </div>

            <div>
              <div className="field-label">Investor Pendana (Funder)</div>
              <div className="font-mono" style={{ fontSize: "13px", marginTop: "4px" }}>
                {selectedInvoice.funder === "0x0000000000000000000000000000000000000000"
                  ? "Belum ada pendana"
                  : selectedInvoice.funder}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Pemegang hak tagih saat ini
              </div>
            </div>
          </div>

          {/* Rincian Finansial Bersih */}
          <div
            style={{
              padding: "24px 0",
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: "32px",
              borderBottom: "1px solid var(--border-fine)",
            }}
          >
            <div>
              <div className="font-serif" style={{ fontSize: "17px", fontWeight: 600 }}>
                Keterangan Status Alur
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "13.5px", marginTop: "6px" }}>
                {getStatusMeta(selectedInvoice.status).description}
              </p>

              {/* Catatan Khusus Skenario Keamanan */}
              {selectedInvoice.status === InvoiceStatus.Financed && (
                <div
                  style={{
                    marginTop: "16px",
                    padding: "12px 16px",
                    background: "var(--bg-cream)",
                    borderLeft: "3px solid #0E7490",
                    fontSize: "13px",
                  }}
                >
                  <strong>Kunci Keamanan Anti-Double Funding Aktif:</strong> Invoice ini telah didanai.
                  Jika ada investor kedua yang mencoba mengirim transaksi pembelian, smart contract
                  akan otomatis membatalkannya (*revert*) dengan error{" "}
                  <code>&quot;Invoice is not listed for financing&quot;</code>.
                </div>
              )}
            </div>

            <div
              style={{
                background: "var(--bg-cream)",
                padding: "18px 20px",
                border: "1px solid var(--border-fine)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                  fontSize: "13px",
                }}
              >
                <span style={{ color: "var(--text-muted)" }}>Nilai Piutang Penuh:</span>
                <span className="font-mono" style={{ fontWeight: 600 }}>
                  {formatCurrency(selectedInvoice.amount)}
                </span>
              </div>

              {selectedInvoice.listingPrice > 0n && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                    fontSize: "13px",
                  }}
                >
                  <span style={{ color: "var(--text-muted)" }}>Pencairan Di Muka:</span>
                  <span className="font-mono" style={{ color: "var(--green-primary)", fontWeight: 600 }}>
                    {formatCurrency(selectedInvoice.listingPrice)}
                  </span>
                </div>
              )}

              {selectedInvoice.listingPrice > 0n && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingTop: "8px",
                    borderTop: "1px solid var(--border-fine)",
                    fontSize: "12px",
                  }}
                >
                  <span style={{ color: "var(--text-muted)" }}>Imbal Hasil Investor:</span>
                  <span className="font-mono" style={{ color: "#B45309", fontWeight: 600 }}>
                    {formatCurrency(selectedInvoice.amount - selectedInvoice.listingPrice)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Panel Aksi Kontekstual Berdasarkan Status */}
          <div
            style={{
              paddingTop: "24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              {selectedInvoice.status === InvoiceStatus.Approved && (
                <span>
                  Klien telah mengesahkan kuitansi ini. Anda dapat menawarkannya sekarang ke bursa investor.
                </span>
              )}
              {selectedInvoice.status === InvoiceStatus.Created && (
                <span>
                  Menunggu klien memanggil verifikasi tanda tangan digital untuk beralih ke status DISETUJUI.
                </span>
              )}
              {selectedInvoice.status === InvoiceStatus.Listed && (
                <span>
                  Invoice telah terpasang di bursa pasar. Dana akan otomatis masuk saat investor pertama membeli.
                </span>
              )}
              {selectedInvoice.status === InvoiceStatus.Financed && (
                <span>
                  Dana telah cair ke dompet Anda. Kewajiban pelunasan ada di pihak klien saat jatuh tempo.
                </span>
              )}
              {selectedInvoice.status === InvoiceStatus.Paid && (
                <span>
                  Invoice ini telah selesai dilunasi penuh oleh klien ke pemegang sertifikat.
                </span>
              )}
            </div>

            {/* Aksi Jual Jika Status = DISETUJUI */}
            {selectedInvoice.status === InvoiceStatus.Approved && (
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <input
                  type="number"
                  placeholder="Harga diskon (USDC)"
                  className="field-input"
                  style={{ width: "200px" }}
                  value={listingDiscountPrice}
                  onChange={(e) => setListingDiscountPrice(e.target.value)}
                />
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleListInvoice(selectedInvoice.id)}
                  className="btn-doc btn-primary"
                >
                  {isSubmitting ? "Mendaftarkan..." : "Tawarkan ke Investor (Jual)"}
                </button>
              </div>
            )}
          </div>
        </article>
      )}
    </div>
  );
}
