"use client";

import { useState, useEffect, useSyncExternalStore, useCallback } from "react";
import Link from "next/link";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useWriteContract,
  useSwitchChain,
  useConfig,
} from "wagmi";
import { waitForTransactionReceipt, readContract } from "wagmi/actions";
import { hardhat, baseSepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { parseUnits, formatUnits } from "viem";
import {
  CAIRIN_ADDRESS,
  MOCK_USDC_ADDRESS,
  CONTRACT_ADDRESSES,
  getContractAddresses,
  cairInAbi,
  mockUsdcAbi,
  InvoiceStatus,
  InvoiceData,
  getStatusMeta,
} from "@/contracts/config";
import { SAMPLE_PROOFS } from "@/lib/sampleProofs";
import {
  SearchIcon,
  SunIcon,
  BellIcon,
  FilePlusIcon,
  CoinsIcon,
  CalculatorIcon,
  RefreshIcon,
  DeviceMobileIcon,
  ShieldCheckIcon,
  CodeTerminalIcon,
  LockIcon,
  CameraIcon,
  LinkChainIcon,
  UserIcon,
  GlobeIcon,
  CopyIcon,
  CheckIcon,
  CheckCircleIcon,
  InboxEmptyIcon,
  ZoomInIcon,
  UploadIcon,
  ZapIcon,
  SparklesIcon,
  ClockTimeIcon,
} from "@/components/Icons";

interface InvoiceItem extends InvoiceData {
  jobTitle: string;
  txHash?: string;
  createdAt?: number;
  proofImages?: string[];
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
  proofImages?: string[];
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
      proofImages: inv.proofImages,
    }));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
    } catch (quotaErr) {
      console.warn("Storage quota terlampaui saat menyimpan gambar, fallback menyimpan invoice tanpa gambar base64...", quotaErr);
      // Fallback: hapus data URL base64 yang besar agar metadata penting invoice tidak pernah hilang
      const safeSerialized = serialized.map((inv) => ({
        ...inv,
        proofImages: inv.proofImages?.filter((img) => !img.startsWith("data:")),
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(safeSerialized));
    }
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

    // Bersihkan ID 0 atau ID duplikat yang mungkin sempat tersimpan
    const seenIds = new Set<string>();
    let maxId = 4n;

    const sanitized = parsed.map((item) => {
      let currentId = BigInt(item.id || 0);
      if (currentId <= 0n || seenIds.has(currentId.toString())) {
        currentId = ++maxId;
      } else {
        if (currentId > maxId) maxId = currentId;
      }
      seenIds.add(currentId.toString());

      return {
        id: currentId,
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
        proofImages: item.proofImages,
      };
    });

    return sanitized;
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
    dueDate: 1775836800n,
    funder: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    status: InvoiceStatus.Financed,
    proofImages: [SAMPLE_PROOFS[0].url, SAMPLE_PROOFS[1].url, SAMPLE_PROOFS[2].url],
  },
  {
    id: 2n,
    jobTitle: "Audit Keamanan Smart Contract & Backend API",
    freelancer: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    client: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    amount: parseUnits("2500", 6),
    listingPrice: parseUnits("2300", 6),
    dueDate: 1774886400n,
    funder: "0x0000000000000000000000000000000000000000",
    status: InvoiceStatus.Listed,
    proofImages: [SAMPLE_PROOFS[1].url, SAMPLE_PROOFS[3].url],
  },
  {
    id: 3n,
    jobTitle: "Pengembangan Frontend Next.js & Integrasi Web3",
    freelancer: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    client: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    amount: parseUnits("750", 6),
    listingPrice: 0n,
    dueDate: 1777132800n,
    funder: "0x0000000000000000000000000000000000000000",
    status: InvoiceStatus.Approved,
    proofImages: [SAMPLE_PROOFS[0].url, SAMPLE_PROOFS[1].url, SAMPLE_PROOFS[2].url, SAMPLE_PROOFS[3].url],
  },
  {
    id: 4n,
    jobTitle: "Penyusunan Dokumentasi API & Whitepaper Teknis",
    freelancer: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    client: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
    amount: parseUnits("1200", 6),
    listingPrice: 0n,
    dueDate: 1778860800n,
    funder: "0x0000000000000000000000000000000000000000",
    status: InvoiceStatus.Created,
    proofImages: [SAMPLE_PROOFS[2].url, SAMPLE_PROOFS[3].url],
  },
];

export default function PlatformWorkspacePage() {
  const { address, isConnected, chainId } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContractAsync } = useWriteContract();
  const { switchChain } = useSwitchChain();
  const config = useConfig();

  const isMounted = useSyncExternalStore(
    () => () => { },
    () => true,
    () => false
  );
  const [invoices, setInvoices] = useState<InvoiceItem[]>(INITIAL_INVOICES);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<bigint | null>(INITIAL_INVOICES[0].id);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isClaimingFaucet, setIsClaimingFaucet] = useState(false);
  const [isAddingToken, setIsAddingToken] = useState(false);
  const [tokenCopiedMsg, setTokenCopiedMsg] = useState(false);

  // Load localStorage after hydration to guarantee server and initial client match
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const saved = loadStoredInvoices();
      if (saved && saved.length > 0) {
        setInvoices(saved);
        setSelectedInvoiceId(saved[0].id);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const activeConnected = isMounted && isConnected;
  const activeAddress = isMounted && isConnected ? address : undefined;
  const activeChainId = isMounted && isConnected ? chainId : undefined;

  const [userUsdcBalance, setUserUsdcBalance] = useState<bigint | null>(null);

  const fetchUsdcBalance = useCallback(async () => {
    if (!address) return;
    try {
      const targetChainId = chainId === hardhat.id ? hardhat.id : baseSepolia.id;
      const targetAddresses = getContractAddresses(targetChainId);
      const bal = (await readContract(config, {
        chainId: targetChainId,
        address: targetAddresses.mockUsdc,
        abi: mockUsdcAbi,
        functionName: "balanceOf",
        args: [address],
      })) as bigint;
      setUserUsdcBalance(bal);
    } catch (e) {
      console.warn("fetchUsdcBalance error:", e);
    }
  }, [address, chainId, config]);

  useEffect(() => {
    if (activeConnected && address) {
      fetchUsdcBalance();
    }
  }, [activeConnected, address, fetchUsdcBalance]);

  // Scope Mode: 'wallet' (Hanya invoice dompet ini) | 'all' (Bursa Global)
  const [viewScope, setViewScope] = useState<"wallet" | "all">("wallet");
  const [walletRoleFilter, setWalletRoleFilter] = useState<"all" | "freelancer" | "client">("all");

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

  // Proof Deliverables Upload State (2-4 photos)
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  // Lightbox Viewer Modal State
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title?: string } | null>(null);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 800;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.72));
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = 4 - uploadedImages.length;
    if (remaining <= 0) {
      alert("Maksimal 4 foto bukti yang dapat diunggah.");
      return;
    }

    const filesToRead = Array.from(files).slice(0, remaining);
    for (const file of filesToRead) {
      if (!file.type.startsWith("image/")) {
        alert(`File ${file.name} bukan format gambar.`);
        continue;
      }
      try {
        const compressed = await compressImage(file);
        if (compressed) {
          setUploadedImages((prev) => {
            if (prev.length >= 4) return prev;
            return [...prev, compressed];
          });
        }
      } catch (err) {
        console.error("Gagal kompresi foto:", err);
      }
    }
    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUseSampleImages = () => {
    setUploadedImages([
      SAMPLE_PROOFS[0].url,
      SAMPLE_PROOFS[1].url,
      SAMPLE_PROOFS[2].url,
    ]);
  };

  // Drawer listing price discount
  const [drawerDiscountPct, setDrawerDiscountPct] = useState<number>(8);

  // Quick Calculator Tool state
  const [toolNominal, setToolNominal] = useState<number>(1000);
  const [toolDiscount, setToolDiscount] = useState<number>(8);
  const [showQuickCalc, setShowQuickCalc] = useState<boolean>(false);

  // Interactive Area Chart state & points (Raxon theme)
  const [chartTimeframe, setChartTimeframe] = useState<"12H" | "24H" | "1D" | "7D" | "1M" | "1Y">("7D");
  const [activeChartPoint, setActiveChartPoint] = useState<number>(4);

  const CHART_POINTS = [
    { day: "Minggu", date: "8 Jun 2026", amount: "$32,450 USDC", pct: "+12.4%", y: 135, x: 30 },
    { day: "Senin", date: "9 Jun 2026", amount: "$36,800 USDC", pct: "+15.1%", y: 115, x: 95 },
    { day: "Selasa", date: "10 Jun 2026", amount: "$41,200 USDC", pct: "+18.5%", y: 95, x: 160 },
    { day: "Rabu", date: "11 Jun 2026", amount: "$38,500 USDC", pct: "+17.0%", y: 120, x: 225 },
    { day: "Kamis", date: "12 Jun 2026", amount: "$83,727 USDC", pct: "+23.48%", y: 50, x: 290 },
    { day: "Jumat", date: "13 Jun 2026", amount: "$78,100 USDC", pct: "+21.2%", y: 70, x: 355 },
    { day: "Sabtu", date: "14 Jun 2026", amount: "$89,500 USDC", pct: "+25.8%", y: 38, x: 420 },
  ];

  // Topbar & UI ergonomics states
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [isRefreshingBalance, setIsRefreshingBalance] = useState<boolean>(false);
  const [balanceRefreshedMsg, setBalanceRefreshedMsg] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, fieldKey: string) => {
    if (!text) return;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedField(fieldKey);
    setTimeout(() => {
      setCopiedField((curr) => (curr === fieldKey ? null : curr));
    }, 2000);
  };

  const handleRefreshBalance = async () => {
    if (isRefreshingBalance) return;
    setIsRefreshingBalance(true);
    await fetchUsdcBalance();
    setIsRefreshingBalance(false);
    setBalanceRefreshedMsg(true);
    setTimeout(() => setBalanceRefreshedMsg(false), 2500);
  };

  const handleAddUsdcToMetaMask = async () => {
    if (!activeConnected || !address) {
      alert("Silakan hubungkan dompet MetaMask terlebih dahulu.");
      return;
    }
    if (typeof window !== "undefined" && (window as unknown as { ethereum?: { request: (args: unknown) => Promise<unknown> } }).ethereum) {
      setIsAddingToken(true);
      try {
        const targetChainId = chainId === hardhat.id ? hardhat.id : baseSepolia.id;
        const targetAddresses = getContractAddresses(targetChainId);
        
        // Timeout 12 detik agar tidak stuck jika modal MetaMask diminimalkan oleh browser
        const watchPromise = (window as unknown as { ethereum: { request: (args: unknown) => Promise<unknown> } }).ethereum.request({
          method: "wallet_watchAsset",
          params: {
            type: "ERC20",
            options: {
              address: targetAddresses.mockUsdc,
              symbol: "USDC",
              decimals: 6,
            },
          },
        });
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("TIMEOUT")), 12000)
        );

        await Promise.race([watchPromise, timeoutPromise]);
        alert("✅ Token MockUSDC berhasil didaftarkan di dompet MetaMask Anda!");
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg === "TIMEOUT") {
          alert(
            "⏳ Permintaan sedang diproses MetaMask.\n\nJika jendela tidak muncul otomatis, silakan klik ikon rubah MetaMask di toolbar browser Anda untuk menyetujui."
          );
        } else {
          console.warn("handleAddUsdcToMetaMask:", e);
        }
      } finally {
        setIsAddingToken(false);
      }
    } else {
      alert("Ekstensi MetaMask tidak ditemukan di peramban Anda.");
    }
  };

  const handleCopyTokenAddress = async () => {
    const targetChainId = chainId === hardhat.id ? hardhat.id : baseSepolia.id;
    const targetAddresses = getContractAddresses(targetChainId);
    try {
      await navigator.clipboard.writeText(targetAddresses.mockUsdc);
      setTokenCopiedMsg(true);
      setTimeout(() => setTokenCopiedMsg(false), 2500);
    } catch {
      alert(`Alamat MockUSDC: ${targetAddresses.mockUsdc}`);
    }
  };

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

  const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

  const formatDate = (ts: bigint) => {
    const d = new Date(Number(ts) * 1000);
    const day = d.getUTCDate();
    const month = MONTH_NAMES[d.getUTCMonth()];
    const year = d.getUTCFullYear();
    return `${day} ${month} ${year}`;
  };

  // 1. Filter berdasarkan Scope Dompet yang Sedang Terhubung
  const scopedInvoices = invoices.filter((inv) => {
    if (viewScope === "wallet") {
      if (!activeConnected || !activeAddress) return false;
      const myAddr = activeAddress.toLowerCase();
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
    (selectedInvoiceId !== null && filteredInvoices.find((inv) => inv.id === selectedInvoiceId)) ||
    (filteredInvoices.length > 0 ? filteredInvoices[0] : null);

  // Sinkronisasi otomatis selectedInvoice saat ganti akun atau ganti filter
  useEffect(() => {
    if (filteredInvoices.length > 0 && selectedInvoiceId !== null) {
      const exists = filteredInvoices.some((inv) => inv.id === selectedInvoiceId);
      if (!exists) {
        window.requestAnimationFrame(() => {
          setSelectedInvoiceId(filteredInvoices[0].id);
        });
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

    if (uploadedImages.length < 2 || uploadedImages.length > 4) {
      alert("Harap sertakan minimal 2 dan maksimal 4 foto bukti hasil pekerjaan agar klien dan investor dapat memverifikasi pekerjaan Anda.");
      return;
    }

    // Validasi format alamat Ethereum
    if (!/^0x[a-fA-F0-9]{40}$/.test(clientAddress.trim())) {
      alert("Alamat dompet klien tidak valid. Harap gunakan alamat Ethereum yang benar (contoh: 0x7099...C8).");
      return;
    }

    // Validasi: Klien tidak boleh sama dengan Freelancer (syarat mutlak smart contract CairIn)
    if (address && clientAddress.trim().toLowerCase() === address.toLowerCase()) {
      alert(
        `Alamat dompet klien tidak boleh sama dengan akun dompet Anda sendiri (${address.slice(0, 6)}...${address.slice(-4)}).\n\nSmart contract mewajibkan Klien dan Freelancer adalah entitas yang berbeda. Silakan gunakan tombol bantuan "Klien #1" atau "Klien #2" di formulir.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedAmount = parseUnits(nominalUsdc, 6);
      const parsedDueDate = BigInt(
        Math.floor(Date.now() / 1000) + Number(dueDays) * 86400
      );

      let txHash: string | undefined = undefined;
      let onChainTokenId: bigint | undefined = undefined;

      if (isConnected) {
        const targetChainId = chainId === hardhat.id ? hardhat.id : baseSepolia.id;
        const targetAddresses = getContractAddresses(targetChainId);
        if (chainId && chainId !== targetChainId && switchChain) {
          try {
            await switchChain({ chainId: targetChainId });
          } catch (e) {
            console.warn("User switch chain prompt:", e);
          }
        }

        try {
          // 1. Kirim transaksi ke MetaMask
          const hash = await writeContractAsync({
            chainId: targetChainId,
            address: targetAddresses.cairIn,
            abi: cairInAbi,
            functionName: "createInvoice",
            args: [clientAddress.trim() as `0x${string}`, parsedAmount, parsedDueDate],
            gas: 350000n,
          });
          txHash = hash;

          // 2. Tunggu konfirmasi on-chain (menunggu transaksi berhasil dimining oleh node)
          const receipt = await waitForTransactionReceipt(config, {
            hash,
            chainId: targetChainId,
          });

          if (receipt.status === "reverted") {
            throw new Error("Transaksi blockchain di-revert/gagal.");
          }

          // Ambil tokenId dari log InvoiceCreated jika ada
          if (receipt.logs && receipt.logs.length > 0) {
            try {
              const INVOICE_CREATED_TOPIC = "0x3fbaae0f1597d7f24bf2231a5fe5248190743aecc5f3da7126965e14e3f1ca4d";
              const createdLog = receipt.logs.find(
                (l) =>
                  l.address.toLowerCase() === targetAddresses.cairIn.toLowerCase() &&
                  l.topics &&
                  l.topics[0]?.toLowerCase() === INVOICE_CREATED_TOPIC.toLowerCase()
              );
              if (createdLog && createdLog.topics[1]) {
                const parsed = BigInt(createdLog.topics[1]);
                if (parsed > 0n) {
                  onChainTokenId = parsed;
                }
              }
            } catch {
              // fallback
            }
          }
        } catch (onChainErr) {
          console.warn("On-chain create invoice fallback to local state:", onChainErr);
        }
      }

      const maxId = invoices.reduce((max, inv) => (inv.id > max ? inv.id : max), 0n);
      const nextId = onChainTokenId && onChainTokenId > 0n ? onChainTokenId : maxId + 1n;

      const newInv: InvoiceItem = {
        id: nextId,
        jobTitle: jobTitleInput || `Jasa Pekerjaan Freelance #${nextId}`,
        freelancer: address || "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        client: clientAddress.trim(),
        amount: parsedAmount,
        listingPrice: 0n,
        dueDate: parsedDueDate,
        funder: "0x0000000000000000000000000000000000000000",
        status: InvoiceStatus.Created,
        txHash: txHash,
        createdAt: Date.now(),
        proofImages: [...uploadedImages],
      };

      const updated = [newInv, ...invoices];
      setInvoices(updated);
      saveStoredInvoices(updated);
      setSelectedInvoiceId(nextId);
      setShowCreateModal(false);
      setJobTitleInput("");
      setClientAddress("");
      setNominalUsdc("");
      setUploadedImages([]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(err);
      if (msg.includes("rejected") || msg.includes("denied") || msg.includes("User rejected")) {
        alert("Transaksi dibatalkan di dompet oleh pengguna.");
      } else if (msg.includes("nonce") || msg.includes("Nonce")) {
        alert("Terjadi masalah sinkronisasi nonce dompet (Phantom/MetaMask).\nSolusi: Ganti jaringan sebentar atau reset data aktivitas dompet, lalu coba lagi.");
      } else {
        alert(`Gagal membuat invoice di blockchain: ${msg}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Klaim Faucet MockUSDC (Backend Gasless + On-Chain Fallback)
  const handleClaimFaucet = async () => {
    if (!activeConnected || !address) {
      alert("Silakan hubungkan dompet MetaMask terlebih dahulu.");
      return;
    }
    setIsClaimingFaucet(true);
    try {
      const targetChainId = chainId === hardhat.id ? hardhat.id : baseSepolia.id;
      const targetAddresses = getContractAddresses(targetChainId);
      let success = false;

      // 1. Coba Server-Side Faucet terlebih dahulu (Gratis Gas: pengguna tidak perlu saldo ETH)
      if (targetChainId === baseSepolia.id) {
        try {
          const res = await fetch("/api/faucet", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address }),
          });
          const data = await res.json();
          if (res.ok && data.success) {
            success = true;
          } else {
            console.warn("Backend faucet response:", data);
          }
        } catch (apiErr) {
          console.warn("Backend faucet unreachable, falling back to direct mint:", apiErr);
        }
      }

      // 2. Fallback: jika server API tidak berhasil atau saat di localhost, mint via wallet pengguna
      if (!success) {
        const mintAmount = parseUnits("10000", 6);
        const mintHash = await writeContractAsync({
          chainId: targetChainId,
          address: targetAddresses.mockUsdc,
          abi: mockUsdcAbi,
          functionName: "mint",
          args: [address, mintAmount],
        });
        await waitForTransactionReceipt(config, { hash: mintHash, chainId: targetChainId });
        success = true;
      }

      // Refresh on-chain balance
      await fetchUsdcBalance();

      // Trigger penambahan token ke MetaMask secara asinkron tanpa menahan UI (jangan block isClaimingFaucet)
      if (typeof window !== "undefined" && (window as unknown as { ethereum?: { request: (args: unknown) => Promise<unknown> } }).ethereum) {
        (window as unknown as { ethereum: { request: (args: unknown) => Promise<unknown> } }).ethereum.request({
          method: "wallet_watchAsset",
          params: {
            type: "ERC20",
            options: {
              address: targetAddresses.mockUsdc,
              symbol: "USDC",
              decimals: 6,
            },
          },
        }).catch(() => {
          // Abaikan jika pengguna menutup dialog atau menolak penambahan aset
        });
      }

      alert(
        `🎉 Berhasil Klaim Faucet!\n\n10,000 MockUSDC dan saldo gas fee ETH telah berhasil masuk ke akun dompet Anda (${formatShortAddress(address)}).\n\nSekarang Anda bisa bertransaksi dengan lancar!`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Faucet error:", err);
      await fetchUsdcBalance();
      alert(`Status klaim: ${msg}`);
    } finally {
      setIsClaimingFaucet(false);
    }
  };

  // Handler: Persetujuan Klien
  const handleApproveInvoice = async (id: bigint) => {
    const inv = invoices.find((i) => i.id === id);
    if (!inv) return;

    if (isConnected && address) {
      if (address.toLowerCase() !== inv.client.toLowerCase()) {
        alert(
          `Akses Ditolak: Anda sedang terhubung dengan akun ${formatShortAddress(address)}, bukan Klien pembayar (${formatShortAddress(inv.client)}).\n\nHanya Klien yang berhak menandatangani pengesahan invoice ini.`
        );
        return;
      }
      try {
        const targetChainId = chainId === hardhat.id ? hardhat.id : baseSepolia.id;
        const targetAddresses = getContractAddresses(targetChainId);
        const hash = await writeContractAsync({
          chainId: targetChainId,
          address: targetAddresses.cairIn,
          abi: cairInAbi,
          functionName: "approveInvoice",
          args: [id],
          gas: 200000n,
        });
        await waitForTransactionReceipt(config, { hash, chainId: targetChainId });
      } catch (err) {
        console.warn("On-chain approve fallback to simulated state:", err);
      }
    }

    updateAndSaveInvoices((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: InvoiceStatus.Approved } : item
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
      const isOwner = address && inv.freelancer.toLowerCase() === address.toLowerCase();
      if (!isOwner) {
        alert(
          `Akses Ditolak: Anda sedang terhubung dengan akun ${formatShortAddress(address || "")}, bukan Freelancer pemilik invoice (${formatShortAddress(inv.freelancer)}).\n\nHanya Freelancer yang berhak menjual hak tagih invoice ke bursa.`
        );
        return;
      } else {
        try {
          const targetChainId = chainId === hardhat.id ? hardhat.id : baseSepolia.id;
          const targetAddresses = getContractAddresses(targetChainId);
          const hash = await writeContractAsync({
            chainId: targetChainId,
            address: targetAddresses.cairIn,
            abi: cairInAbi,
            functionName: "listInvoice",
            args: [id, parsedListing],
            gas: 250000n,
          });
          await waitForTransactionReceipt(config, { hash, chainId: targetChainId });
        } catch (err) {
          console.warn("On-chain fallback to simulated state:", err);
        }
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
  const handleFundInvoice = async (id: bigint) => {
    const inv = invoices.find((i) => i.id === id);
    if (!inv) return;

    if (isConnected && address) {
      if (address.toLowerCase() === inv.freelancer.toLowerCase()) {
        alert(
          `Akses Ditolak: Anda adalah Freelancer pembuat invoice ini (${formatShortAddress(address)}).\n\nSmart contract CashIn melarang freelancer mendanai tagihan buatannya sendiri demi integritas pasar.`
        );
        return;
      }
      try {
        const targetChainId = chainId === hardhat.id ? hardhat.id : baseSepolia.id;
        const targetAddresses = getContractAddresses(targetChainId);

        // 1. Cek saldo MockUSDC Investor
        try {
          const bal = (await readContract(config, {
            chainId: targetChainId,
            address: targetAddresses.mockUsdc,
            abi: mockUsdcAbi,
            functionName: "balanceOf",
            args: [address],
          })) as bigint;

          if (bal < inv.listingPrice) {
            alert(
              `Saldo MockUSDC Anda (${formatUnits(bal, 6)} USDC) tidak mencukupi untuk mendanai ${formatUnits(inv.listingPrice, 6)} USDC.\n\nSilakan klik tombol "+ Faucet 10k USDC" di atas untuk klaim saldo demo gratis!`
            );
            return;
          }
        } catch (e) {
          console.warn("Check funder balance warning:", e);
        }

        // 2. Cek & auto-approve MockUSDC Allowance untuk Investor
        try {
          const allowance = (await readContract(config, {
            chainId: targetChainId,
            address: targetAddresses.mockUsdc,
            abi: mockUsdcAbi,
            functionName: "allowance",
            args: [address, targetAddresses.cairIn],
          })) as bigint;

          if (allowance < inv.listingPrice) {
            const approveHash = await writeContractAsync({
              chainId: targetChainId,
              address: targetAddresses.mockUsdc,
              abi: mockUsdcAbi,
              functionName: "approve",
              args: [
                targetAddresses.cairIn,
                115792089237316195423570985008687907853269984665640564039457584007913129639935n,
              ],
              gas: 100000n,
            });
            await waitForTransactionReceipt(config, { hash: approveHash, chainId: targetChainId });
          }
        } catch (e) {
          console.warn("Check funder allowance warning:", e);
        }

        const hash = await writeContractAsync({
          chainId: targetChainId,
          address: targetAddresses.cairIn,
          abi: cairInAbi,
          functionName: "buyInvoice",
          args: [id],
          gas: 350000n,
        });
        await waitForTransactionReceipt(config, { hash, chainId: targetChainId });
      } catch (err: unknown) {
        console.warn("On-chain buy fallback to simulated state:", err);
        const errMsg = err instanceof Error ? err.message : String(err);
        if (errMsg.includes("gas cap") || errMsg.includes("exceeds") || errMsg.includes("21000000")) {
          alert("Transaksi ditolak node: Gas limit melebihi cap.\nPastikan Anda telah mengklaim Faucet USDC terlebih dahulu.");
        }
      }
    }

    const funderAddress = address || "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
    updateAndSaveInvoices((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: InvoiceStatus.Financed, funder: funderAddress }
          : item
      )
    );
  };

  // Handler: Pelunasan Klien
  const handlePayInvoice = async (id: bigint) => {
    const inv = invoices.find((i) => i.id === id);
    if (!inv) return;

    if (isConnected && address) {
      if (address.toLowerCase() !== inv.client.toLowerCase()) {
        alert(
          `Akses Ditolak: Anda sedang terhubung dengan akun ${formatShortAddress(address)}, bukan Klien pembayar (${formatShortAddress(inv.client)}).\n\nHanya Klien yang berhak melunasi tagihan ini saat jatuh tempo.`
        );
        return;
      }

      if (inv.status !== InvoiceStatus.Financed) {
        alert(
          `Status Belum Sesuai: Invoice ini berstatus "${getStatusMeta(inv.status).label}".\n\nDi smart contract CashIn, tagihan hanya dapat dilunasi setelah berhasil didanai oleh Investor/Funder (Status: DIDANAI).`
        );
        return;
      }

      try {
        const targetChainId = chainId === hardhat.id ? hardhat.id : baseSepolia.id;
        const targetAddresses = getContractAddresses(targetChainId);

        // 1. Cek Saldo MockUSDC Klien
        try {
          const bal = (await readContract(config, {
            chainId: targetChainId,
            address: targetAddresses.mockUsdc,
            abi: mockUsdcAbi,
            functionName: "balanceOf",
            args: [address],
          })) as bigint;

          if (bal < inv.amount) {
            alert(
              `Saldo MockUSDC Anda (${formatUnits(bal, 6)} USDC) tidak mencukupi untuk melunasi tagihan sebesar ${formatUnits(inv.amount, 6)} USDC.\n\nSilakan klik tombol "+ Faucet 10k USDC" di atas untuk klaim saldo uji coba.`
            );
            return;
          }
        } catch (e) {
          console.warn("Check client balance warning:", e);
        }

        // 2. Cek & Auto-Approve MockUSDC Allowance Klien
        try {
          const allowance = (await readContract(config, {
            chainId: targetChainId,
            address: targetAddresses.mockUsdc,
            abi: mockUsdcAbi,
            functionName: "allowance",
            args: [address, targetAddresses.cairIn],
          })) as bigint;

          if (allowance < inv.amount) {
            alert("Langkah 1/2: Menyetujui (Approve) izin pembayaran MockUSDC oleh smart contract CashIn...");
            const approveHash = await writeContractAsync({
              chainId: targetChainId,
              address: targetAddresses.mockUsdc,
              abi: mockUsdcAbi,
              functionName: "approve",
              args: [
                targetAddresses.cairIn,
                115792089237316195423570985008687907853269984665640564039457584007913129639935n,
              ],
              gas: 100000n,
            });
            await waitForTransactionReceipt(config, { hash: approveHash, chainId: targetChainId });
            alert("Langkah 1/2 Berhasil! Melanjutkan ke transaksi pelunasan final...");
          }
        } catch (e) {
          console.warn("Check client allowance warning:", e);
        }

        // 3. Panggil payInvoice dengan batas gas eksplisit (mencegah fallback MetaMask 21.000.000 gas cap)
        const hash = await writeContractAsync({
          chainId: targetChainId,
          address: targetAddresses.cairIn,
          abi: cairInAbi,
          functionName: "payInvoice",
          args: [id],
          gas: 350000n,
        });
        await waitForTransactionReceipt(config, { hash, chainId: targetChainId });
      } catch (err: unknown) {
        console.warn("On-chain pay fallback to simulated state:", err);
        const errMsg = err instanceof Error ? err.message : String(err);
        if (errMsg.includes("gas cap") || errMsg.includes("exceeds") || errMsg.includes("21000000")) {
          alert("Transaksi ditolak node: Gas limit melebihi cap.\nPastikan Anda telah mengklaim Faucet USDC terlebih dahulu.");
        }
      }
    }

    updateAndSaveInvoices((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: InvoiceStatus.Paid } : item
      )
    );
  };

  // Calculations for quick metrics
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
    <div className="rx-dashboard-root">
      {/* 1. Sleek Modern Top Navigation Bar (Raxon Theme) */}
      <header className="rx-topbar">
        <div className="rx-topbar-left">
          <Link href="/" className="rx-brand-badge" style={{ gap: "9px", textDecoration: "none" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Cashin Logo"
              width={28}
              height={28}
              style={{ width: "28px", height: "28px", objectFit: "contain", flexShrink: 0 }}
            />
            <span className="cashin-brand-title" style={{ fontSize: "21px" }}>Cashin</span>
            <span className="rx-brand-app-pill">WORKSPACE</span>
          </Link>

          <nav className="rx-nav-links">
            <button
              type="button"
              className={`rx-nav-tab ${viewScope === "all" && filterStatus === "all" ? "active" : ""}`}
              onClick={() => {
                setViewScope("all");
                setFilterStatus("all");
              }}
            >
              Dashboard
            </button>
            <button
              type="button"
              className={`rx-nav-tab ${filterStatus === "listed" ? "active" : ""}`}
              onClick={() => {
                setViewScope("all");
                setFilterStatus("listed");
              }}
            >
              Bursa Piutang
            </button>
            <button
              type="button"
              className={`rx-nav-tab ${viewScope === "wallet" ? "active" : ""}`}
              onClick={() => setViewScope("wallet")}
            >
              Invoice Saya
            </button>
            <button
              type="button"
              className={`rx-nav-tab ${showQuickCalc ? "active" : ""}`}
              onClick={() => setShowQuickCalc((prev) => !prev)}
            >
              Kalkulator
            </button>
            <Link href="/" className="rx-nav-tab">
              Beranda &rarr;
            </Link>
          </nav>
        </div>

        <div className="rx-topbar-right">
          {/* Search Input Bar with ⌘K badge */}
          <div className="rx-search-pill">
            <SearchIcon size={14} color="#94a3b8" />
            <input
              type="text"
              placeholder="Cari invoice..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="rx-search-kbd">⌘K</span>
          </div>

          {/* Theme Indicator */}
          <div
            className="rx-icon-btn"
            title="Tema Modern Raxon (Light Mode Aktif)"
            style={{ cursor: "default", userSelect: "none" }}
          >
            <SunIcon size={16} color="#0e3e44" />
          </div>

          {/* Notifications Popover */}
          <div className="rx-popover-wrapper">
            <button
              type="button"
              className="rx-icon-btn"
              title="Notifikasi Aktivitas"
              onClick={() => setShowNotifications((prev) => !prev)}
              style={{ position: "relative" }}
            >
              <BellIcon size={16} color="#475569" />
              <span
                style={{
                  position: "absolute",
                  top: "6px",
                  right: "6px",
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#ea580c",
                }}
              />
            </button>

            {showNotifications && (
              <div className="rx-popover-dropdown">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
                  <b style={{ fontSize: "13px", color: "#0f172a" }}>Aktivitas Protokol</b>
                  <span className="rx-pill-badge green" style={{ fontSize: "9.5px" }}>Live</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    <ShieldCheckIcon size={14} color="#059669" style={{ marginTop: "2px", flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#0f172a" }}>Invoice #01 Berhasil Didanai</div>
                      <div style={{ fontSize: "10.5px", color: "#64748b" }}>Investor menyetor 920 USDC • Hak tagih ditransfer</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    <LinkChainIcon size={14} color="#0284c7" style={{ marginTop: "2px", flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#0f172a" }}>Kontrak Base Sepolia Siap</div>
                      <div style={{ fontSize: "10.5px", color: "#64748b" }}>Jaringan Base Sepolia Testnet (84532) aktif sinkron</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    <LockIcon size={14} color="#0e3e44" style={{ marginTop: "2px", flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#0f172a" }}>Proteksi Escrow On-Chain</div>
                      <div style={{ fontSize: "10.5px", color: "#64748b" }}>Semua piutang dijamin bukti deliverables terverifikasi</div>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                  style={{
                    width: "100%",
                    marginTop: "12px",
                    padding: "6px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#64748b",
                    cursor: "pointer",
                  }}
                >
                  Tutup Notifikasi
                </button>
              </div>
            )}
          </div>

          {/* Network Badge */}
          {activeConnected && (
            <button
              type="button"
              className={`rx-network-badge ${
                activeChainId === baseSepolia.id || activeChainId === hardhat.id ? "connected" : "wrong"
              }`}
              onClick={() => {
                if (activeChainId !== baseSepolia.id && switchChain) {
                  switchChain({ chainId: baseSepolia.id });
                }
              }}
              title={
                activeChainId === baseSepolia.id
                  ? "Terhubung ke Base Sepolia Testnet"
                  : activeChainId === hardhat.id
                  ? "Terhubung ke Hardhat Local Node (Klik untuk beralih ke Base Sepolia)"
                  : "Jaringan salah! Klik untuk beralih ke Base Sepolia"
              }
            >
              <span>
                {activeChainId === baseSepolia.id
                  ? "🟢 Base Sepolia (84532)"
                  : activeChainId === hardhat.id
                  ? "🟢 Hardhat Local (31337)"
                  : "🔴 Salah Network (Pindah ke Base Sepolia)"}
              </span>
            </button>
          )}

          {/* Faucet MockUSDC Demo Button */}
          {activeConnected && (
            <button
              type="button"
              className="rx-faucet-btn"
              onClick={handleClaimFaucet}
              disabled={isClaimingFaucet}
              title="Klaim 10,000 MockUSDC & auto-approve smart contract CashIn untuk akun ini"
            >
              <CoinsIcon size={14} color="#0d9227" />
              <span>{isClaimingFaucet ? "Memproses..." : "+ Faucet 10k USDC"}</span>
            </button>
          )}

          {/* Wallet Connect / Disconnect Pill */}
          {activeConnected ? (
            <button
              type="button"
              className="rx-wallet-btn"
              onClick={() => disconnect()}
              title="Klik untuk memutuskan sambungan"
            >
              <span>{formatShortAddress(activeAddress || "")}</span>
              <small style={{ color: "#a7f3d0", fontSize: "10px" }}>(Putus)</small>
            </button>
          ) : (
            <button
              type="button"
              className="rx-wallet-btn"
              onClick={() => connect({ connector: injected() })}
            >
              <span>Sambungkan Dompet</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="rx-content-container">
        {/* Banner Peringatan Salah Jaringan MetaMask */}
        {activeConnected && activeChainId && activeChainId !== baseSepolia.id && activeChainId !== hardhat.id && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "14px",
              padding: "14px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <strong style={{ color: "#991b1b", fontSize: "13.5px", display: "block" }}>
                ⚠️ Dompet Sedang di Jaringan Lain (Chain ID {activeChainId})
              </strong>
              <span style={{ color: "#7f1d1d", fontSize: "12px" }}>
                Smart contract CashIn berjalan di jaringan resmi Base Sepolia Testnet (84532). Pindahkan jaringan dompet untuk transaksi on-chain.
              </span>
            </div>
            <button
              type="button"
              className="rx-action-btn-primary"
              style={{ padding: "8px 16px", fontSize: "12px" }}
              onClick={() => switchChain && switchChain({ chainId: baseSepolia.id })}
            >
              Pindah ke Base Sepolia &rarr;
            </button>
          </div>
        )}

        {/* 2. Top 4 Crypto / Invoice Metric Cards in a Row (Matching Raxon Screenshot) */}
        <div className="rx-top-metrics-grid">
          {/* Card 1: Total Piutang Terbit */}
          <div
            className={`rx-metric-cell ${filterStatus === "all" ? "active" : ""}`}
            onClick={() => setFilterStatus("all")}
          >
            <div className="rx-metric-cell-header">
              <span className="rx-metric-title">Total Tagihan Terbit</span>
              <span className="rx-metric-subtag">USDC / RWA</span>
            </div>
            <div className="rx-metric-value" suppressHydrationWarning>
              {formatCurrency(totalAmount)}
            </div>
            <div className="rx-metric-footer">
              <span className="rx-pill-badge green">▲ +12.4%</span>
              <span suppressHydrationWarning>vs minggu lalu • {invoices.length} tagihan</span>
            </div>
          </div>

          {/* Card 2: Uang Cair ke Freelancer */}
          <div
            className={`rx-metric-cell ${filterStatus === "financed" ? "active" : ""}`}
            onClick={() => setFilterStatus("financed")}
          >
            <div className="rx-metric-cell-header">
              <span className="rx-metric-title">Dana Dicairkan</span>
              <span className="rx-metric-subtag">KE FREELANCER</span>
            </div>
            <div className="rx-metric-value" style={{ color: "#0e3e44" }} suppressHydrationWarning>
              {formatCurrency(totalFinanced)}
            </div>
            <div className="rx-metric-footer">
              <span className="rx-pill-badge green">▲ +18.2%</span>
              <span>Instan masuk Web3</span>
            </div>
          </div>

          {/* Card 3: Tersedia di Bursa */}
          <div
            className={`rx-metric-cell ${filterStatus === "listed" ? "active" : ""}`}
            onClick={() => setFilterStatus("listed")}
          >
            <div className="rx-metric-cell-header">
              <span className="rx-metric-title">Tersedia di Bursa</span>
              <span className="rx-metric-subtag">INVESTOR READY</span>
            </div>
            <div className="rx-metric-value" style={{ color: "#c2410c" }} suppressHydrationWarning>
              {formatCurrency(totalListed)}
            </div>
            <div className="rx-metric-footer">
              <span className="rx-pill-badge neutral" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <ZapIcon size={12} color="#c2410c" /> Diskon 8-15%
              </span>
              <span>Siap didanai</span>
            </div>
          </div>

          {/* Card 4: Imbal Hasil Rata-rata */}
          <div className="rx-metric-cell">
            <div className="rx-metric-cell-header">
              <span className="rx-metric-title">Rata-rata Imbal Hasil</span>
              <span className="rx-metric-subtag">YIELD MARGIN</span>
            </div>
            <div className="rx-metric-value" style={{ color: "#059669" }}>
              8.4% <span style={{ fontSize: "16px", fontWeight: 700 }}>APR</span>
            </div>
            <div className="rx-metric-footer">
              <span className="rx-pill-badge green">▲ +0.6%</span>
              <span>Risiko terproteksi BAST</span>
            </div>
          </div>
        </div>

        {/* Quick Calculator Panel (Collapsible/Toggled) */}
        {showQuickCalc && (
          <div className="rx-card" style={{ background: "#ffffff", border: "1.5px solid #0e3e44" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0e3e44", display: "flex", alignItems: "center", gap: "6px" }}>
                  <ZapIcon size={16} color="#0e3e44" />
                  Kalkulator Cepat Simulasi Pencairan Piutang
                </h3>
                <p style={{ fontSize: "12.5px", color: "#64748b" }}>
                  Hitung berapa dana bersih yang Anda terima hari ini jika Anda menjual hak tagih invoice dengan diskon.
                </p>
              </div>
              <button
                type="button"
                className="rx-icon-btn"
                onClick={() => setShowQuickCalc(false)}
              >
                &times;
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", alignItems: "center" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  Nilai Tagihan Invoice (USDC)
                </label>
                <input
                  type="number"
                  value={toolNominal}
                  onChange={(e) => setToolNominal(Number(e.target.value) || 0)}
                  className="rx-input"
                />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "11px", fontWeight: 700 }}>
                  <span style={{ color: "#64748b" }}>Diskon Penawaran:</span>
                  <span style={{ color: "#c2410c" }}>{toolDiscount}%</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="20"
                  step="1"
                  value={toolDiscount}
                  onChange={(e) => setToolDiscount(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#0e3e44", cursor: "pointer" }}
                />
              </div>

              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "12px 16px", borderRadius: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>Uang Cair Hari Ini:</span>
                  <b style={{ color: "#059669", fontFamily: "var(--mono)", fontSize: "14px" }}>
                    ${((toolNominal * (100 - toolDiscount)) / 100).toFixed(0)} USDC
                  </b>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>Margin Investor:</span>
                  <b style={{ color: "#c2410c", fontFamily: "var(--mono)", fontSize: "13px" }}>
                    +${((toolNominal * toolDiscount) / 100).toFixed(0)} USDC
                  </b>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Middle Row: Market Leaders & Area Chart (Left) + My Balance & Top Assets (Right) */}
        <div className="rx-middle-row">
          {/* Left: Combined Card (Market Leaders + Interactive SVG Area Chart) */}
          <div className="rx-portfolio-chart-box">
            {/* Sub-column Left: Market Leaders / Kategori Teratas */}
            <div className="rx-leaders-side">
              <div className="rx-leaders-title-row">
                <span className="rx-subhead">Kategori Teratas</span>
                <span style={{ fontSize: "11px", color: "#94a3b8", fontFamily: "var(--mono)" }}>30 Hari</span>
              </div>

              <div className="rx-category-progress-list">
                <div className="rx-cat-item">
                  <div className="rx-cat-top">
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <DeviceMobileIcon size={14} color="#0e3e44" /> UI/UX & Mobile
                    </span>
                    <span style={{ color: "#0e3e44", fontFamily: "var(--mono)" }}>$44,343</span>
                  </div>
                  <div className="rx-cat-bar-bg">
                    <div className="rx-cat-bar-fill" style={{ width: "75%", background: "#0e3e44" }} />
                  </div>
                </div>

                <div className="rx-cat-item">
                  <div className="rx-cat-top">
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <ShieldCheckIcon size={14} color="#0284c7" /> Audit Smart Contract
                    </span>
                    <span style={{ color: "#0284c7", fontFamily: "var(--mono)" }}>$14,332</span>
                  </div>
                  <div className="rx-cat-bar-bg">
                    <div className="rx-cat-bar-fill" style={{ width: "52%", background: "#0284c7" }} />
                  </div>
                </div>

                <div className="rx-cat-item">
                  <div className="rx-cat-top">
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <CodeTerminalIcon size={14} color="#059669" /> Frontend & Web3
                    </span>
                    <span style={{ color: "#059669", fontFamily: "var(--mono)" }}>$7,460</span>
                  </div>
                  <div className="rx-cat-bar-bg">
                    <div className="rx-cat-bar-fill" style={{ width: "35%", background: "#059669" }} />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "auto", padding: "8px 12px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #eef2f6" }}>
                <span style={{ fontSize: "11px", color: "#64748b", display: "flex", alignItems: "center", gap: "6px", lineHeight: 1.45 }}>
                  <LockIcon size={13} color="#64748b" style={{ flexShrink: 0 }} />
                  <span>Seluruh invoice terlindungi smart contract escrow anti-double funding.</span>
                </span>
              </div>
            </div>

            {/* Sub-column Right: Interactive Area Chart */}
            <div className="rx-chart-side">
              <div className="rx-chart-header">
                <div>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", display: "block" }}>
                    Total Nilai Portofolio
                  </span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginTop: "2px" }}>
                    <span className="rx-chart-val-big">$83,727.90</span>
                    <span className="rx-pill-badge green">▲ +3.1% 24h</span>
                  </div>
                </div>

                {/* Time Range Pills: 12H, 24H, 1D, 7D, 1M, 1Y */}
                <div className="rx-range-pills">
                  {(["12H", "24H", "1D", "7D", "1M", "1Y"] as const).map((tf) => (
                    <button
                      key={tf}
                      type="button"
                      className={`rx-range-pill-btn ${chartTimeframe === tf ? "active" : ""}`}
                      onClick={() => setChartTimeframe(tf)}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pure SVG Area Chart with Gradient & Interactive Point Tooltip */}
              <div className="rx-chart-svg-container">
                <svg
                  viewBox="0 0 450 190"
                  style={{ width: "100%", height: "100%", overflow: "visible" }}
                >
                  <defs>
                    <linearGradient id="rxAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0e3e44" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#0e3e44" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  <line x1="20" y1="35" x2="430" y2="35" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="20" y1="75" x2="430" y2="75" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="20" y1="115" x2="430" y2="115" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="20" y1="155" x2="430" y2="155" stroke="#f1f5f9" strokeWidth="1" />

                  {/* Area Fill */}
                  <polygon
                    points="30,135 95,115 160,95 225,120 290,50 355,70 420,38 420,155 30,155"
                    fill="url(#rxAreaGrad)"
                  />

                  {/* Trend Curve Line */}
                  <polyline
                    points="30,135 95,115 160,95 225,120 290,50 355,70 420,38"
                    fill="none"
                    stroke="#0e3e44"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Active Point Indicator & Vertical Dashed Guideline */}
                  {CHART_POINTS.map((pt, idx) => {
                    const isSelected = activeChartPoint === idx;
                    return (
                      <g
                        key={idx}
                        style={{ cursor: "pointer" }}
                        onClick={() => setActiveChartPoint(idx)}
                      >
                        {isSelected && (
                          <line
                            x1={pt.x}
                            y1="25"
                            x2={pt.x}
                            y2="155"
                            stroke="#0e3e44"
                            strokeWidth="1.5"
                            strokeDasharray="3 3"
                            opacity="0.8"
                          />
                        )}
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isSelected ? 6 : 4}
                          fill={isSelected ? "#0e3e44" : "#ffffff"}
                          stroke="#0e3e44"
                          strokeWidth={isSelected ? 3 : 2}
                        />
                        {/* Day labels along bottom */}
                        <text
                          x={pt.x}
                          y="172"
                          textAnchor="middle"
                          fill={isSelected ? "#0e3e44" : "#94a3b8"}
                          fontSize="9.5"
                          fontWeight={isSelected ? "800" : "600"}
                          fontFamily="var(--sans)"
                        >
                          {pt.day}
                        </text>
                      </g>
                    );
                  })}

                  {/* Interactive Tooltip Card Floating above active point */}
                  {CHART_POINTS[activeChartPoint] && (
                    <g
                      transform={`translate(${Math.max(60, Math.min(320, CHART_POINTS[activeChartPoint].x - 65))}, ${Math.max(10, CHART_POINTS[activeChartPoint].y - 48)})`}
                    >
                      <rect
                        width="130"
                        height="42"
                        rx="8"
                        fill="#0f172a"
                        stroke="#334155"
                        strokeWidth="1"
                        filter="drop-shadow(0 4px 10px rgba(0,0,0,0.3))"
                      />
                      <text x="10" y="16" fill="#94a3b8" fontSize="9" fontFamily="var(--mono)">
                        {CHART_POINTS[activeChartPoint].date}
                      </text>
                      <text x="10" y="32" fill="#ffffff" fontSize="12" fontWeight="800" fontFamily="var(--mono)">
                        {CHART_POINTS[activeChartPoint].amount}
                      </text>
                      <rect x="92" y="20" width="30" height="14" rx="4" fill="#059669" />
                      <text x="107" y="30" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="800">
                        {CHART_POINTS[activeChartPoint].pct}
                      </text>
                    </g>
                  )}
                </svg>
              </div>
            </div>
          </div>

          {/* Right Column: My Balance Card + Top Assets Card */}
          <div className="rx-right-col">
            {/* My Balance Card */}
            <div className="rx-balance-card">
              <div className="rx-balance-head">
                <span>Saldo Rekening Web3</span>
                <span className={`rx-pill-badge ${activeChainId === baseSepolia.id ? "green" : "neutral"}`}>
                  {activeChainId === baseSepolia.id
                    ? "🔵 Base Sepolia (84532)"
                    : activeChainId === hardhat.id
                    ? "🟡 Hardhat Local (31337)"
                    : "⚪ Base Sepolia Testnet"}
                </span>
              </div>
              <div className="rx-balance-amount">
                {userUsdcBalance !== null
                  ? `$${Number(formatUnits(userUsdcBalance, 6)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : "$10,000.00"}{" "}
                <span style={{ fontSize: "16px", color: "#64748b" }}>USDC</span>
              </div>
              <div className="rx-balance-subinfo">
                <span>
                  {balanceRefreshedMsg ? "✅ Saldo Berhasil Diperbarui" : "Real-time On-chain Sync"}
                </span>
                <span
                  style={{ color: "#0e3e44", cursor: "pointer", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "5px" }}
                  onClick={handleRefreshBalance}
                >
                  <RefreshIcon size={13} className={isRefreshingBalance ? "rx-spin" : ""} />
                  {balanceRefreshedMsg ? (
                    <span style={{ color: "#059669" }}>Tersinkronisasi ✓</span>
                  ) : (
                    <span>Refresh</span>
                  )}
                </span>
              </div>
              <div style={{ marginTop: "8px", display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={handleAddUsdcToMetaMask}
                  disabled={isAddingToken}
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#0e3e44",
                    background: "#e6f1f3",
                    border: "1px solid #c2e0e5",
                    borderRadius: "6px",
                    padding: "4px 10px",
                    cursor: isAddingToken ? "wait" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    opacity: isAddingToken ? 0.7 : 1,
                  }}
                  title="Tampilkan saldo MockUSDC langsung di daftar token MetaMask Anda"
                >
                  <CoinsIcon size={12} color="#0e3e44" />
                  <span>{isAddingToken ? "Cek MetaMask..." : "+ Tambah Token ke MetaMask"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyTokenAddress}
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#475569",
                    background: "#f1f5f9",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    padding: "4px 8px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                  title="Salin alamat kontrak MockUSDC untuk diimpor manual di MetaMask"
                >
                  <span>{tokenCopiedMsg ? "✓ Tersalin!" : "📋 Salin Alamat Kontrak"}</span>
                </button>
              </div>

              {/* 4 Action Buttons Grid matching Raxon */}
              <div className="rx-action-buttons-grid">
                <button
                  type="button"
                  className="rx-action-btn-primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  <FilePlusIcon size={14} color="#ffffff" />
                  <span>Terbitkan Invoice</span>
                </button>
                <button
                  type="button"
                  className="rx-action-btn-secondary"
                  onClick={() => {
                    setViewScope("all");
                    setFilterStatus("listed");
                  }}
                >
                  <CoinsIcon size={14} color="#0e3e44" />
                  <span>Danai Tagihan</span>
                </button>
                <button
                  type="button"
                  className="rx-action-btn-secondary"
                  onClick={() => setShowQuickCalc((prev) => !prev)}
                >
                  <CalculatorIcon size={14} color="#0e3e44" />
                  <span>Kalkulator</span>
                </button>
                <button
                  type="button"
                  className="rx-action-btn-secondary"
                  onClick={handleResetHistory}
                >
                  <RefreshIcon size={13} color="#64748b" />
                  <span>Reset Data</span>
                </button>
              </div>
            </div>

            {/* Top Assets / Invoices Terpilih Mini List */}
            <div className="rx-top-assets-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span className="rx-subhead">Top Opportunities</span>
                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700 }}>Diskon & Return</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                {invoices.slice(0, 4).map((inv, idx) => (
                  <div
                    key={`mini-${inv.id.toString()}-${idx}`}
                    className="rx-mini-asset-item"
                    onClick={() => setSelectedInvoiceId(inv.id)}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "8px",
                          background: inv.status === InvoiceStatus.Listed ? "#ffedd5" : "#e6f1f3",
                          color: inv.status === InvoiceStatus.Listed ? "#c2410c" : "#0e3e44",
                          display: "grid",
                          placeItems: "center",
                          fontSize: "12px",
                          fontWeight: 800,
                        }}
                      >
                        #{inv.id.toString()}
                      </div>
                      <div>
                        <b style={{ fontSize: "12.5px", color: "#0f172a", display: "block" }}>
                          {inv.jobTitle.length > 22 ? `${inv.jobTitle.slice(0, 22)}...` : inv.jobTitle}
                        </b>
                        <small style={{ fontSize: "10.5px", color: "#94a3b8", fontFamily: "var(--mono)" }}>
                          {inv.proofImages?.length || 0} Foto Bukti Terlampir
                        </small>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <b style={{ fontSize: "12.5px", fontFamily: "var(--mono)", color: "#0f172a", display: "block" }}>
                        {formatCurrency(inv.amount)}
                      </b>
                      <span
                        className={`rx-pill-badge ${inv.status === InvoiceStatus.Financed ? "green" : inv.status === InvoiceStatus.Listed ? "green" : "neutral"}`}
                        style={{ fontSize: "9.5px", padding: "1px 5px" }}
                      >
                        {inv.status === InvoiceStatus.Listed ? "+8.0% Margin" : inv.status === InvoiceStatus.Financed ? "Didanai" : "Draft"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Modern Transactions & Invoices Table Section (Raxon Design) */}
        <div className="rx-table-section-card" id="bursa">
          {/* Table Top Controls Bar */}
          <div className="rx-table-top-bar">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                  Recent Transactions & Invoices
                </h3>
                <span className="rx-pill-badge neutral" style={{ fontSize: "11px" }}>
                  {filteredInvoices.length} Terdaftar
                </span>
              </div>
              <p style={{ fontSize: "12px", color: "#64748b", margin: "4px 0 0" }}>
                Pantau seluruh tagihan komersial, status likuidasi, dan bukti deliverables secara terpusat.
              </p>
            </div>

            {/* Scope & Role Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <div className="rx-range-pills">
                <button
                  type="button"
                  className={`rx-range-pill-btn ${viewScope === "wallet" ? "active" : ""}`}
                  onClick={() => setViewScope("wallet")}
                  suppressHydrationWarning
                  style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}
                >
                  <UserIcon size={12} />
                  <span>Akun Saya {activeConnected && activeAddress ? `(${formatShortAddress(activeAddress)})` : ""}</span>
                </button>
                <button
                  type="button"
                  className={`rx-range-pill-btn ${viewScope === "all" ? "active" : ""}`}
                  onClick={() => setViewScope("all")}
                  suppressHydrationWarning
                  style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}
                >
                  <GlobeIcon size={12} />
                  <span>Bursa Global ({invoices.length})</span>
                </button>
              </div>

              {activeConnected && viewScope === "wallet" && (
                <div className="rx-range-pills">
                  <button
                    type="button"
                    className={`rx-range-pill-btn ${walletRoleFilter === "all" ? "active" : ""}`}
                    onClick={() => setWalletRoleFilter("all")}
                    suppressHydrationWarning
                  >
                    Semua
                  </button>
                  <button
                    type="button"
                    className={`rx-range-pill-btn ${walletRoleFilter === "freelancer" ? "active" : ""}`}
                    onClick={() => setWalletRoleFilter("freelancer")}
                  >
                    Freelancer
                  </button>
                  <button
                    type="button"
                    className={`rx-range-pill-btn ${walletRoleFilter === "client" ? "active" : ""}`}
                    onClick={() => setWalletRoleFilter("client")}
                  >
                    Klien
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Table Filter Tabs & Search Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              paddingBottom: "16px",
              borderBottom: "1px solid #f1f5f9",
              marginBottom: "12px",
            }}
          >
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {[
                { key: "all", label: `Semua (${scopedInvoices.length})` },
                { key: "draft", label: "Draft" },
                { key: "approved", label: "Disetujui" },
                { key: "listed", label: "Di Bursa" },
                { key: "financed", label: "Didanai" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFilterStatus(tab.key as any)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "9999px",
                    fontSize: "12px",
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    background: filterStatus === tab.key ? "#0e3e44" : "#f1f5f9",
                    color: filterStatus === tab.key ? "#ffffff" : "#475569",
                    transition: "all 0.15s ease",
                  }}
                  suppressHydrationWarning
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "5px 12px",
                }}
              >
                <SearchIcon size={13} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="Cari judul atau ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: "12px",
                    outline: "none",
                    fontFamily: "var(--sans)",
                    width: "160px",
                    color: "#0f172a",
                  }}
                />
              </div>

              <button
                type="button"
                onClick={handleResetHistory}
                title="Kembalikan riwayat ke data bawaan"
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "6px 12px",
                  fontSize: "11.5px",
                  fontWeight: 700,
                  color: "#64748b",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <RefreshIcon size={12} color="#64748b" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Table Horizontal Scroll Container for responsive protection */}
          <div className="rx-table-scroll-wrapper">
            <div className="rx-table-inner">
              {/* Table Header Row */}
              <div className="rx-table-header-row">
                <span>#</span>
                <span>Rincian Pekerjaan & Pihak</span>
                <span>Nilai Piutang</span>
                <span>Harga Bursa</span>
                <span>Jatuh Tempo</span>
                <span>24h Trend</span>
                <span>Status</span>
                <span style={{ textAlign: "right" }}>Aksi</span>
              </div>

              {/* Table Rows Body */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {filteredInvoices.length === 0 ? (
                  <div
                    style={{
                      padding: "48px 24px",
                      textAlign: "center",
                      background: "#f8fafc",
                      borderRadius: "14px",
                      margin: "8px 0",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
                      <InboxEmptyIcon size={38} color="#94a3b8" />
                    </div>
                    <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }} suppressHydrationWarning>
                      {viewScope === "wallet" && activeConnected
                        ? `Belum Ada Tagihan untuk Akun ${formatShortAddress(activeAddress || "")}`
                        : "Tidak Ada Invoice yang Cocok"}
                    </h4>
                    <p style={{ fontSize: "12.5px", color: "#64748b", maxWidth: "380px", margin: "0 auto 16px" }} suppressHydrationWarning>
                      {viewScope === "wallet" && activeConnected
                        ? "Dompet ini belum menerbitkan invoice dan belum menerima tagihan."
                        : "Ubah kata kunci pencarian atau sesuaikan filter status di atas."}
                    </p>
                    <button
                      type="button"
                      className="rx-action-btn-primary"
                      style={{ margin: "0 auto", padding: "8px 18px", fontSize: "12px" }}
                      onClick={() => setShowCreateModal(true)}
                    >
                      + Terbitkan Invoice Baru
                    </button>
                  </div>
                ) : (
                  filteredInvoices.map((inv, idx) => {
                    const isSelected = selectedInvoice && inv.id === selectedInvoice.id;
                    const isUp = inv.status === InvoiceStatus.Financed || inv.status === InvoiceStatus.Listed;

                    return (
                      <div
                        key={`row-${inv.id.toString()}-${idx}`}
                        className={`rx-table-row ${isSelected ? "selected" : ""}`}
                        onClick={() => setSelectedInvoiceId(inv.id)}
                      >
                        {/* Col 1: ID */}
                        <span
                          style={{
                            fontFamily: "var(--mono)",
                            fontWeight: 800,
                            fontSize: "11px",
                            color: "#64748b",
                          }}
                        >
                          #{inv.id.toString().padStart(2, "0")}
                        </span>

                        {/* Col 2: Job details & Badges */}
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginBottom: "3px" }}>
                            <b style={{ fontSize: "13px", color: "#0f172a" }}>{inv.jobTitle}</b>
                            {inv.txHash && (
                              <span
                                style={{
                                  fontFamily: "var(--mono)",
                                  fontSize: "9px",
                                  background: "#e0f2fe",
                                  color: "#0369a1",
                                  padding: "1px 6px",
                                  borderRadius: "4px",
                                  fontWeight: 700,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "3px",
                                }}
                              >
                                <LinkChainIcon size={10} color="#0369a1" /> ON-CHAIN
                              </span>
                            )}
                            {inv.proofImages && inv.proofImages.length > 0 && (
                              <span
                                style={{
                                  fontFamily: "var(--mono)",
                                  fontSize: "9.5px",
                                  background: "#ecfdf5",
                                  color: "#059669",
                                  padding: "1px 6px",
                                  borderRadius: "4px",
                                  border: "1px solid #a7f3d0",
                                  fontWeight: 700,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                <CameraIcon size={11} color="#059669" /> {inv.proofImages.length} Foto
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: "11px", color: "#94a3b8", display: "flex", gap: "10px", alignItems: "center" }}>
                            <span>Klien: {formatShortAddress(inv.client)}</span>
                            {activeAddress && inv.freelancer.toLowerCase() === activeAddress.toLowerCase() && (
                              <span style={{ color: "#d97706", fontWeight: 700 }}>• Anda (Freelancer)</span>
                            )}
                            {activeAddress && inv.client.toLowerCase() === activeAddress.toLowerCase() && (
                              <span style={{ color: "#4f46e5", fontWeight: 700 }}>• Anda (Klien)</span>
                            )}
                          </div>
                        </div>

                        {/* Col 3: Amount */}
                        <div style={{ fontFamily: "var(--mono)", fontSize: "13px", fontWeight: 800, color: "#0f172a" }}>
                          {formatCurrency(inv.amount)}
                        </div>

                        {/* Col 4: Listing Price */}
                        <div style={{ fontFamily: "var(--mono)", fontSize: "12.5px", fontWeight: 700, color: inv.listingPrice > 0n ? "#0e3e44" : "#94a3b8" }}>
                          {inv.listingPrice > 0n ? formatCurrency(inv.listingPrice) : "—"}
                        </div>

                        {/* Col 5: Due Date */}
                        <div style={{ fontFamily: "var(--mono)", fontSize: "11.5px", color: "#64748b" }}>
                          {formatDate(inv.dueDate)}
                        </div>

                        {/* Col 6: Sparkline Trend */}
                        <div>
                          <svg width="68" height="22" viewBox="0 0 68 22" fill="none">
                            <path
                              d={isUp ? "M2 17 L16 13 L32 15 L48 7 L66 4" : "M2 6 L16 10 L32 8 L48 14 L66 18"}
                              stroke={isUp ? "#10b981" : "#0e3e44"}
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>

                        {/* Col 7: Status Pill */}
                        <div>
                          {inv.status === InvoiceStatus.Financed && (
                            <span className="rx-status-tag financed">DIDANAI</span>
                          )}
                          {inv.status === InvoiceStatus.Listed && (
                            <span className="rx-status-tag listed">DI BURSA</span>
                          )}
                          {inv.status === InvoiceStatus.Approved && (
                            <span className="rx-status-tag approved">DISETUJUI</span>
                          )}
                          {inv.status === InvoiceStatus.Created && (
                            <span className="rx-status-tag created">DRAFT</span>
                          )}
                          {inv.status === InvoiceStatus.Paid && (
                            <span className="rx-status-tag paid">LUNAS</span>
                          )}
                        </div>

                        {/* Col 8: Action button */}
                        <div style={{ textAlign: "right" }}>
                          <button
                            type="button"
                            style={{
                              background: isSelected ? "#0e3e44" : "#f1f5f9",
                              color: isSelected ? "#ffffff" : "#1e293b",
                              border: "none",
                              borderRadius: "8px",
                              padding: "6px 12px",
                              fontSize: "11px",
                              fontWeight: 700,
                              cursor: "pointer",
                              transition: "all 0.12s",
                            }}
                          >
                            {isSelected ? "Buka ▼" : "Detail →"}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Detail Invoice & Settlement Drawer / Card */}
          {selectedInvoice ? (
            <div
              style={{
                marginTop: "24px",
                padding: "24px",
                background: "#f8fafc",
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "4px" }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: "14px", fontWeight: 800, color: "#0e3e44" }}>
                      #INV-{selectedInvoice.id.toString().padStart(3, "0")}
                    </span>
                    <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                      {selectedInvoice.jobTitle}
                    </h3>
                    {selectedInvoice.status === InvoiceStatus.Financed && (
                      <span className="rx-status-tag financed">DIDANAI</span>
                    )}
                    {selectedInvoice.status === InvoiceStatus.Listed && (
                      <span className="rx-status-tag listed">DI BURSA</span>
                    )}
                    {selectedInvoice.status === InvoiceStatus.Approved && (
                      <span className="rx-status-tag approved">DISETUJUI</span>
                    )}
                    {selectedInvoice.status === InvoiceStatus.Created && (
                      <span className="rx-status-tag created">DRAFT</span>
                    )}
                    {selectedInvoice.status === InvoiceStatus.Paid && (
                      <span className="rx-status-tag paid">LUNAS</span>
                    )}
                  </div>
                  <span style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                    Dibuat oleh: <code style={{ fontFamily: "var(--mono)", color: "#0f172a" }}>{selectedInvoice.freelancer}</code>
                    <button
                      type="button"
                      className={`rx-copy-btn ${copiedField === "freelancer" ? "copied" : ""}`}
                      onClick={() => handleCopy(selectedInvoice.freelancer, "freelancer")}
                    >
                      {copiedField === "freelancer" ? "Tersalin ✓" : "Salin"}
                    </button>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedInvoiceId(null)}
                  style={{
                    background: "transparent",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    padding: "4px 10px",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#64748b",
                    cursor: "pointer",
                  }}
                >
                  ✕ Tutup Panel
                </button>
              </div>

              {/* Grid Rincian Keuangan & Pihak Terlibat */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "14px",
                  background: "#ffffff",
                  borderRadius: "12px",
                  padding: "16px",
                  border: "1px solid #e2e8f0",
                  marginBottom: "18px",
                }}
              >
                <div>
                  <span style={{ fontSize: "10.5px", fontFamily: "var(--mono)", color: "#94a3b8", display: "block", textTransform: "uppercase", fontWeight: 700, marginBottom: "3px" }}>
                    ALAMAT KLIEN PEMBAYAR
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "12px", fontFamily: "var(--mono)", fontWeight: 700, color: "#0f172a", wordBreak: "break-all" }}>
                      {selectedInvoice.client}
                    </span>
                    <button
                      type="button"
                      className={`rx-copy-btn ${copiedField === "client" ? "copied" : ""}`}
                      onClick={() => handleCopy(selectedInvoice.client, "client")}
                    >
                      {copiedField === "client" ? "Tersalin ✓" : "Salin"}
                    </button>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "10.5px", fontFamily: "var(--mono)", color: "#94a3b8", display: "block", textTransform: "uppercase", fontWeight: 700, marginBottom: "3px" }}>
                    PEMEGANG HAK TAGIH / INVESTOR
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "12px", fontFamily: "var(--mono)", fontWeight: 700, color: "#0f172a" }}>
                      {selectedInvoice.funder === "0x0000000000000000000000000000000000000000"
                        ? "Belum ada pendana (Hak tagih di Freelancer)"
                        : `Investor (${formatShortAddress(selectedInvoice.funder)})`}
                    </span>
                    {selectedInvoice.funder !== "0x0000000000000000000000000000000000000000" && (
                      <button
                        type="button"
                        className={`rx-copy-btn ${copiedField === "funder" ? "copied" : ""}`}
                        onClick={() => handleCopy(selectedInvoice.funder, "funder")}
                      >
                        {copiedField === "funder" ? "Tersalin ✓" : "Salin"}
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "10.5px", fontFamily: "var(--mono)", color: "#94a3b8", display: "block", textTransform: "uppercase", fontWeight: 700 }}>
                    NILAI TAGIHAN PIUTANG
                  </span>
                  <b style={{ fontSize: "16px", fontFamily: "var(--mono)", color: "#0f172a" }}>
                    {formatCurrency(selectedInvoice.amount)}
                  </b>
                </div>

                {selectedInvoice.listingPrice > 0n && (
                  <div>
                    <span style={{ fontSize: "10.5px", fontFamily: "var(--mono)", color: "#94a3b8", display: "block", textTransform: "uppercase", fontWeight: 700 }}>
                      PENCAIRAN DI MUKA & MARGIN
                    </span>
                    <div style={{ display: "flex", gap: "8px", alignItems: "baseline" }}>
                      <b style={{ fontSize: "15px", fontFamily: "var(--mono)", color: "#059669" }}>
                        {formatCurrency(selectedInvoice.listingPrice)}
                      </b>
                      <span style={{ fontSize: "11px", color: "#c2410c", fontFamily: "var(--mono)", fontWeight: 700 }}>
                        (Margin: {formatCurrency(selectedInvoice.amount - selectedInvoice.listingPrice)})
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* 📷 Galeri Foto Bukti Deliverables Pekerjaan */}
              {selectedInvoice.proofImages && selectedInvoice.proofImages.length > 0 && (
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "12px",
                    padding: "16px",
                    border: "1px solid #e2e8f0",
                    marginBottom: "18px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 800, color: "#0f172a", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <CameraIcon size={14} color="#0e3e44" /> Bukti Pekerjaan & Dokumen Deliverables
                      </span>
                      <span className="rx-pill-badge green" style={{ fontSize: "10px", padding: "1px 6px" }}>
                        {selectedInvoice.proofImages.length} Foto Terverifikasi
                      </span>
                    </div>
                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                      Klik foto untuk inspeksi resolusi penuh
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "10px" }}>
                    {selectedInvoice.proofImages.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        onClick={() =>
                          setLightboxImage({
                            url: imgUrl,
                            title: `Bukti Deliverables #${idx + 1} • ${selectedInvoice.jobTitle}`,
                          })
                        }
                        style={{
                          aspectRatio: "1",
                          borderRadius: "10px",
                          overflow: "hidden",
                          cursor: "pointer",
                          position: "relative",
                          border: "1.5px solid #e2e8f0",
                          background: "#0f172a",
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgUrl}
                          alt={`Bukti #${idx + 1}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "transform 0.2s ease",
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: "rgba(14, 62, 68, 0.4)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            opacity: 0,
                            transition: "opacity 0.15s ease",
                            color: "#ffffff",
                            fontSize: "11px",
                            fontWeight: 700,
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
                        >
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <ZoomInIcon size={13} color="#ffffff" /> Perbesar
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* On-Chain Record Tx Hash Notification */}
              {selectedInvoice.txHash && (
                <div
                  style={{
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    marginBottom: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <CheckIcon size={14} color="#166534" />
                    <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#166534" }}>
                      Tercatat di Smart Contract Base Sepolia
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <code style={{ fontSize: "10.5px", fontFamily: "var(--mono)", color: "#15803d" }}>
                      {selectedInvoice.txHash}
                    </code>
                    <button
                      type="button"
                      className={`rx-copy-btn ${copiedField === "txHash" ? "copied" : ""}`}
                      onClick={() => handleCopy(selectedInvoice.txHash || "", "txHash")}
                      style={{ padding: "1px 6px", fontSize: "10px" }}
                    >
                      {copiedField === "txHash" ? "Tersalin ✓" : "Salin"}
                    </button>
                  </div>
                </div>
              )}

              {/* Panel Tindakan Kontrak */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  padding: "18px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <span style={{ fontSize: "11px", fontFamily: "var(--mono)", fontWeight: 800, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "10px" }}>
                  Tindakan Penyelesaian & Protokol
                </span>

                {selectedInvoice.status === InvoiceStatus.Created && (() => {
                  const isClient = activeAddress && activeAddress.toLowerCase() === selectedInvoice.client.toLowerCase();
                  const isFreelancer = activeAddress && activeAddress.toLowerCase() === selectedInvoice.freelancer.toLowerCase();

                  if (isClient) {
                    return (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                        <div>
                          <span className="rx-pill-badge green" style={{ marginBottom: "6px" }}>✓ Terhubung Sebagai Klien</span>
                          <p style={{ fontSize: "12.5px", color: "#334155", margin: "4px 0 0", maxWidth: "540px" }}>
                            Sebagai <strong>Klien Pembayar</strong> ({formatShortAddress(selectedInvoice.client)}), periksa bukti deliverables pekerjaan dan tandatangani pengesahan on-chain agar invoice sah ditawarkan ke investor.
                          </p>
                        </div>
                        <button
                          type="button"
                          className="rx-action-btn-primary"
                          style={{ padding: "10px 22px" }}
                          onClick={() => handleApproveInvoice(selectedInvoice.id)}
                        >
                          Klien Sahkan & Setujui Tagihan →
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div style={{ background: "#fffbeb", border: "1px solid #fef3c7", borderRadius: "12px", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                        <span style={{ fontSize: "20px" }}>⏳</span>
                        <div>
                          <b style={{ fontSize: "13px", color: "#92400e", display: "block" }}>
                            Menunggu Pengesahan Klien ({formatShortAddress(selectedInvoice.client)})
                          </b>
                          <p style={{ fontSize: "12px", color: "#b45309", margin: "2px 0 0", maxWidth: "580px", lineHeight: 1.45 }}>
                            {isFreelancer
                              ? `Anda adalah Freelancer pembuat invoice ini (${formatShortAddress(selectedInvoice.freelancer)}). Demi keamanan hak tagih dan pencegahan invoice fiktif, hanya dompet Klien (${formatShortAddress(selectedInvoice.client)}) yang berhak mengesahkan tagihan.`
                              : `Tagihan ini masih berstatus Draft. Hanya dompet Klien (${formatShortAddress(selectedInvoice.client)}) yang berhak mengesahkan tagihan ini.`}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "#92400e", background: "#fef3c7", padding: "6px 12px", borderRadius: "8px", border: "1px solid #fde68a" }}>
                          🔒 Otorisasi Klien Diperlukan
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {selectedInvoice.status === InvoiceStatus.Approved && (() => {
                  const isFreelancer = activeAddress && activeAddress.toLowerCase() === selectedInvoice.freelancer.toLowerCase();

                  if (isFreelancer) {
                    // Perhitungan Tenor Otomatis & Smart Recommendation
                    const nowSeconds = Math.floor(Date.now() / 1000);
                    const dueSeconds = Number(selectedInvoice.dueDate);
                    const diffDays = Math.max(1, Math.round((dueSeconds - nowSeconds) / 86400));

                    let recDiscount = 7;
                    let recTag = "Standar 30 Hari";
                    let recRationale = "Tenor 1 bulan standar pasar • Imbal hasil seimbang untuk likuiditas Anda & minat investor.";

                    if (diffDays <= 18) {
                      recDiscount = 4;
                      recTag = "Tenor Singkat (≤14 Hari)";
                      recRationale = "Perputaran modal sangat cepat • Diskon kecil 4% sudah sangat atraktif bagi investor.";
                    } else if (diffDays <= 38) {
                      recDiscount = 7;
                      recTag = "Standar Pasar (~30 Hari)";
                      recRationale = "Tenor 1 bulan standar • Rekomendasi 7% ideal untuk menarik pendanaan likuiditas cepat.";
                    } else if (diffDays <= 52) {
                      recDiscount = 9;
                      recTag = "Tenor Menengah (~45 Hari)";
                      recRationale = "Tenor 1.5 bulan • Rekomendasi 9% mengimbangi waktu tunggu modal investor.";
                    } else {
                      recDiscount = 12;
                      recTag = "Tenor Panjang (≥60 Hari)";
                      recRationale = "Tenor 2 bulan ke atas • Diskon 12% memberikan yield kompetitif agar invoice lekas didanai.";
                    }

                    return (
                      <div>
                        {/* Smart AI / Tenor Recommendation Box */}
                        <div
                          style={{
                            background: "#f0fdfa",
                            border: "1px solid #ccfbf1",
                            borderRadius: "10px",
                            padding: "11px 14px",
                            marginBottom: "14px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: "10px",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                            <div
                              style={{
                                background: "#ccfbf1",
                                padding: "6px",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginTop: "2px",
                                flexShrink: 0,
                              }}
                            >
                              <SparklesIcon size={16} color="#0d9488" />
                            </div>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                                <span style={{ fontSize: "12.5px", fontWeight: 800, color: "#0f766e" }}>
                                  Rekomendasi Cerdas: {recDiscount}% ({recTag})
                                </span>
                                <span
                                  style={{
                                    fontSize: "10px",
                                    background: "#e0f2fe",
                                    color: "#0369a1",
                                    padding: "1px 7px",
                                    borderRadius: "6px",
                                    fontWeight: 700,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                  }}
                                >
                                  <ClockTimeIcon size={11} color="#0369a1" /> {diffDays} Hari Tenor
                                </span>
                              </div>
                              <p style={{ fontSize: "11.5px", color: "#134e4a", margin: "2px 0 0", lineHeight: 1.4, maxWidth: "560px" }}>
                                {recRationale}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setDrawerDiscountPct(recDiscount)}
                            style={{
                              background: drawerDiscountPct === recDiscount ? "#0d9488" : "#ffffff",
                              color: drawerDiscountPct === recDiscount ? "#ffffff" : "#0f766e",
                              border: "1px solid #0d9488",
                              borderRadius: "8px",
                              padding: "6px 12px",
                              fontSize: "11px",
                              fontWeight: 700,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              transition: "all 0.15s",
                              flexShrink: 0,
                            }}
                          >
                            <SparklesIcon size={12} color={drawerDiscountPct === recDiscount ? "#ffffff" : "#0d9488"} />
                            <span>{drawerDiscountPct === recDiscount ? "Terpasang ✓" : `Terapkan ${recDiscount}%`}</span>
                          </button>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <span style={{ fontSize: "12.5px", color: "#475569" }}>
                            Tentukan diskon penawaran untuk menarik investor:
                          </span>
                          <div style={{ fontFamily: "var(--mono)", fontSize: "12px", fontWeight: 700, color: "#0e3e44" }}>
                            Diskon: {drawerDiscountPct}% • Estimasi Cair: {(Number(formatUnits(selectedInvoice.amount, 6)) * (100 - drawerDiscountPct) / 100).toFixed(0)} USDC
                          </div>
                        </div>
                        <input
                          type="range"
                          min="2"
                          max="20"
                          step="1"
                          value={drawerDiscountPct}
                          onChange={(e) => setDrawerDiscountPct(Number(e.target.value))}
                          style={{ width: "100%", accentColor: "#0e3e44", cursor: "pointer", marginBottom: "14px" }}
                        />
                        <button
                          type="button"
                          className="rx-action-btn-primary"
                          style={{ width: "100%" }}
                          onClick={() => handleListInvoice(selectedInvoice.id, drawerDiscountPct)}
                        >
                          Jual Hak Tagih ke Bursa Sekarang →
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                        <CheckCircleIcon size={20} color="#166534" style={{ flexShrink: 0, marginTop: "2px" }} />
                        <div>
                          <b style={{ fontSize: "13px", color: "#166534", display: "block" }}>
                            Telah Disahkan oleh Klien
                          </b>
                          <p style={{ fontSize: "12px", color: "#15803d", margin: "2px 0 0" }}>
                            Menunggu Freelancer ({formatShortAddress(selectedInvoice.freelancer)}) menentukan diskon dan melisting invoice ke bursa investor.
                          </p>
                        </div>
                      </div>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#166534", background: "#dcfce7", padding: "6px 12px", borderRadius: "8px" }}>
                        Menunggu Listing Freelancer
                      </span>
                    </div>
                  );
                })()}

                {selectedInvoice.status === InvoiceStatus.Listed && (() => {
                  const isFreelancer = activeAddress && activeAddress.toLowerCase() === selectedInvoice.freelancer.toLowerCase();

                  if (isFreelancer) {
                    return (
                      <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "12px", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                        <div>
                          <b style={{ fontSize: "13px", color: "#9a3412", display: "block" }}>
                            📢 Tagihan Anda Sedang Aktif di Bursa Global
                          </b>
                          <p style={{ fontSize: "12px", color: "#c2410c", margin: "2px 0 0" }}>
                            Harga penawaran: <b>{formatCurrency(selectedInvoice.listingPrice)}</b>. Smart contract melarang freelancer mendanai tagihannya sendiri (anti-wash trading). Menunggu investor mendanai.
                          </p>
                        </div>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "#9a3412", background: "#ffedd5", padding: "6px 12px", borderRadius: "8px" }}>
                          Menunggu Investor
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                      <p style={{ fontSize: "12.5px", color: "#475569", margin: 0 }}>
                        Tagihan terdaftar di bursa seharga <b>{formatCurrency(selectedInvoice.listingPrice)}</b>. Investor dapat langsung mendanai.
                      </p>
                      <button
                        type="button"
                        className="rx-action-btn-primary"
                        style={{ padding: "10px 20px" }}
                        onClick={() => handleFundInvoice(selectedInvoice.id)}
                      >
                        Danai Sebagai Investor →
                      </button>
                    </div>
                  );
                })()}

                {selectedInvoice.status === InvoiceStatus.Financed && (() => {
                  const isClient = activeAddress && activeAddress.toLowerCase() === selectedInvoice.client.toLowerCase();

                  if (isClient) {
                    return (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                        <div>
                          <span className="rx-pill-badge green" style={{ marginBottom: "6px" }}>Kewajiban Pelunasan</span>
                          <p style={{ fontSize: "12.5px", color: "#334155", margin: "2px 0 0" }}>
                            Sebagai Klien pembayar ({formatShortAddress(selectedInvoice.client)}), lunasi nilai penuh tagihan <b>{formatCurrency(selectedInvoice.amount)}</b> ke pemegang NFT (investor).
                          </p>
                        </div>
                        <button
                          type="button"
                          className="rx-action-btn-primary"
                          style={{ padding: "10px 20px" }}
                          onClick={() => handlePayInvoice(selectedInvoice.id)}
                        >
                          Klien Lunasi Tagihan (Jatuh Tempo) →
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                      <p style={{ fontSize: "12.5px", color: "#475569", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                        <LockIcon size={14} color="#0e3e44" />
                        <span><strong>Terkunci:</strong> Dana talangan telah cair ke freelancer. Menunggu Klien ({formatShortAddress(selectedInvoice.client)}) melunasi saat jatuh tempo.</span>
                      </p>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", background: "#f1f5f9", padding: "6px 12px", borderRadius: "8px" }}>
                        Terkunci di Escrow
                      </span>
                    </div>
                  );
                })()}

                {selectedInvoice.status === InvoiceStatus.Paid && (
                  <div
                    style={{
                      background: "#ecfdf5",
                      padding: "14px",
                      borderRadius: "10px",
                      textAlign: "center",
                      fontWeight: 800,
                      fontSize: "13px",
                      color: "#059669",
                      border: "1px solid #a7f3d0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    <CheckCircleIcon size={16} color="#059669" />
                    <span>LUNAS • SELURUH KEWAJIBAN & IMBAL HASIL SELESAI PENUH</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              style={{
                marginTop: "16px",
                padding: "12px 18px",
                background: "#f8fafc",
                borderRadius: "12px",
                border: "1px dashed #cbd5e1",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "12px",
                color: "#64748b",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <ZapIcon size={14} color="#0e3e44" style={{ flexShrink: 0 }} />
                <span><strong>Tips:</strong> Klik baris transaksi di atas untuk menginspeksi rincian kontrak & galeri bukti deliverables.</span>
              </span>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                style={{
                  background: "#0e3e44",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: "11.5px",
                }}
              >
                + Terbitkan Invoice
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer Minimalist Raxon Style */}
      <footer
        style={{
          maxWidth: "1440px",
          margin: "40px auto 20px",
          padding: "20px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          borderTop: "1px solid #e2e8f0",
          fontSize: "12px",
          color: "#94a3b8",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Cashin Logo" width={18} height={18} style={{ width: "18px", height: "18px", objectFit: "contain" }} />
          <span className="cashin-brand-title" style={{ fontSize: "14px" }}>Cashin</span>
          <span>&copy; 2026 RWA Protocol — Base Sepolia Testnet</span>
        </div>
        <div style={{ display: "flex", gap: "16px" }}>
          <Link href="/" style={{ color: "#0e3e44", fontWeight: 700, textDecoration: "none" }}>
            Beranda
          </Link>
          <span style={{ color: "#cbd5e1" }}>•</span>
          <span style={{ color: "#64748b" }}>Status Jaringan: Base Sepolia Testnet (84532)</span>
        </div>
      </footer>

      {/* Modal: Terbitkan Invoice Baru (Raxon Clean Card) */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="rx-modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                  Terbitkan Invoice Baru
                </h3>
                <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0" }}>
                  Tokenisasi piutang pekerjaan nyata menjadi NFT RWA terverifikasi.
                </p>
              </div>
              <button
                type="button"
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  fontSize: "18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#64748b",
                }}
                onClick={() => setShowCreateModal(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", color: "#475569", display: "block", marginBottom: "6px" }}>
                  Judul Pekerjaan / Jasa Freelance
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Pembuatan Website E-Commerce & Desain UI"
                  value={jobTitleInput}
                  onChange={(e) => setJobTitleInput(e.target.value)}
                  className="rx-input"
                  required
                />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "6px", marginBottom: "6px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", color: "#475569" }}>
                    Alamat Dompet Klien (Pembayar)
                  </label>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      type="button"
                      style={{
                        background: "#f1f5f9",
                        border: "1px solid #e2e8f0",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        color: "#0e3e44",
                        fontSize: "10.5px",
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                      onClick={() => setClientAddress("0x90F79bf6EB2c4f870365E785982E1f101E93b906")}
                    >
                      Klien #1 (0x90F7)
                    </button>
                    <button
                      type="button"
                      style={{
                        background: "#f1f5f9",
                        border: "1px solid #e2e8f0",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        color: "#0e3e44",
                        fontSize: "10.5px",
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                      onClick={() => setClientAddress("0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc")}
                    >
                      Klien #2 (0x9965)
                    </button>
                    <button
                      type="button"
                      style={{
                        background: "#f1f5f9",
                        border: "1px solid #e2e8f0",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        color: "#0e3e44",
                        fontSize: "10.5px",
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                      onClick={() => setClientAddress("0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199")}
                    >
                      Klien #3 (0x8626)
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="0x..."
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  className="rx-input"
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", color: "#475569", display: "block", marginBottom: "6px" }}>
                    Nilai Tagihan (USDC)
                  </label>
                  <input
                    type="number"
                    placeholder="Contoh: 1500"
                    value={nominalUsdc}
                    onChange={(e) => setNominalUsdc(e.target.value)}
                    className="rx-input"
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", color: "#475569", display: "block", marginBottom: "6px" }}>
                    Jatuh Tempo
                  </label>
                  <select
                    value={dueDays}
                    onChange={(e) => setDueDays(e.target.value)}
                    className="rx-input"
                  >
                    <option value="14">14 Hari</option>
                    <option value="30">30 Hari</option>
                    <option value="45">45 Hari</option>
                    <option value="60">60 Hari</option>
                  </select>
                </div>
              </div>

              {/* Upload 2–4 Foto Bukti Pekerjaan / Deliverables */}
              <div style={{ marginTop: "4px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", color: "#475569" }}>
                    Foto Bukti Pekerjaan (Wajib 2–4 Foto)
                  </label>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 800,
                        color: uploadedImages.length >= 2 && uploadedImages.length <= 4 ? "#059669" : "#d97706",
                      }}
                    >
                      {uploadedImages.length} / 4 Foto
                    </span>
                    <button
                      type="button"
                      style={{
                        background: "#f1f5f9",
                        border: "1px solid #e2e8f0",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        color: "#0e3e44",
                        fontSize: "10.5px",
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                      onClick={handleUseSampleImages}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
                        <ZapIcon size={11} color="#0e3e44" />
                        <span>3 Foto Contoh</span>
                      </span>
                    </button>
                  </div>
                </div>

                <label
                  style={{
                    display: "block",
                    border: "2px dashed #cbd5e1",
                    borderRadius: "12px",
                    padding: "16px",
                    textAlign: "center",
                    cursor: uploadedImages.length >= 4 ? "not-allowed" : "pointer",
                    background: "#f8fafc",
                    transition: "border-color 0.15s",
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploadedImages.length >= 4}
                    style={{ display: "none" }}
                  />
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: "6px" }}>
                    <UploadIcon size={26} color="#0e3e44" />
                  </div>
                  <b style={{ fontSize: "12.5px", display: "block", color: "#0f172a" }}>
                    {uploadedImages.length >= 4 ? "Maksimal 4 Foto Terunggah" : "Pilih / Seret Foto Bukti dari Perangkat"}
                  </b>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>
                    JPG, PNG, WEBP (Screenshot deliverable, hasil desain, atau bukti serah terima)
                  </span>
                </label>

                {/* Preview Thumbnail Grid */}
                {uploadedImages.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginTop: "10px" }}>
                    {uploadedImages.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        style={{
                          aspectRatio: "1",
                          borderRadius: "8px",
                          overflow: "hidden",
                          position: "relative",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgUrl}
                          alt={`Bukti #${idx + 1}`}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          title="Hapus foto ini"
                          style={{
                            position: "absolute",
                            top: "4px",
                            right: "4px",
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            background: "rgba(15, 23, 42, 0.75)",
                            color: "#ffffff",
                            border: "none",
                            fontSize: "12px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {uploadedImages.length < 2 && (
                  <small style={{ color: "#d97706", fontSize: "11px", display: "block", marginTop: "6px" }}>
                    * Wajib sertakan minimal 2 foto bukti agar klien & investor dapat memverifikasi hasil pekerjaan.
                  </small>
                )}
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  className="rx-action-btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setShowCreateModal(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rx-action-btn-primary"
                  disabled={isSubmitting}
                  style={{ flex: 1.6 }}
                >
                  {isSubmitting ? "Mencetak NFT..." : "Cetak NFT Invoice →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Full-Size Image Inspection */}
      {lightboxImage && (
        <div className="proof-lightbox-modal" onClick={() => setLightboxImage(null)}>
          <div className="proof-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "12px 18px", background: "rgba(15, 23, 42, 0.96)", borderBottom: "1px solid rgba(255, 255, 255, 0.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#f8fafc", fontSize: "13px", fontWeight: 800 }}>
                {lightboxImage.title || "Pratinjau Bukti Pekerjaan"}
              </span>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                style={{ background: "none", border: "none", color: "#f8fafc", fontSize: "24px", cursor: "pointer", fontWeight: 800 }}
              >
                &times;
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightboxImage.url} alt="Pratinjau Resolusi Penuh" className="proof-lightbox-img" />
          </div>
        </div>
      )}
    </div>
  );
}
