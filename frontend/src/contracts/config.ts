import type { Abi } from "viem";
import cairInAbiJson from "./cairInAbi.json";
import mockUsdcAbiJson from "./mockUsdcAbi.json";

export const CAIRIN_ADDRESS = (process.env.NEXT_PUBLIC_CAIRIN_ADDRESS ||
  "0xf436eC9dcf77A857dFB85f53eCAc36F56737357a") as `0x${string}`;

export const MOCK_USDC_ADDRESS = (process.env.NEXT_PUBLIC_MOCK_USDC_ADDRESS ||
  "0x7715Cb22e0f7E811b7cd57F11dE6112019E776DD") as `0x${string}`;

export const CONTRACT_ADDRESSES: Record<number, { cairIn: `0x${string}`; mockUsdc: `0x${string}` }> = {
  // Hardhat Local (Chain ID: 31337)
  31337: {
    cairIn: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    mockUsdc: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  },
  // Base Sepolia Testnet (Chain ID: 84532)
  84532: {
    cairIn: (process.env.NEXT_PUBLIC_CAIRIN_ADDRESS as `0x${string}`) || "0xf436eC9dcf77A857dFB85f53eCAc36F56737357a",
    mockUsdc: (process.env.NEXT_PUBLIC_MOCK_USDC_ADDRESS as `0x${string}`) || "0x7715Cb22e0f7E811b7cd57F11dE6112019E776DD",
  },
};

export function getContractAddresses(chainId?: number) {
  if (chainId && CONTRACT_ADDRESSES[chainId]) {
    return CONTRACT_ADDRESSES[chainId];
  }
  return CONTRACT_ADDRESSES[84532]; // Default to Base Sepolia
}

export const cairInAbi = cairInAbiJson as unknown as Abi;
export const mockUsdcAbi = mockUsdcAbiJson as unknown as Abi;

export enum InvoiceStatus {
  Created = 0,
  Approved = 1,
  Listed = 2,
  Financed = 3,
  Paid = 4,
}

export interface InvoiceData {
  id: bigint;
  freelancer: string;
  client: string;
  amount: bigint;
  listingPrice: bigint;
  dueDate: bigint;
  funder: string;
  status: InvoiceStatus;
}

export function getStatusMeta(status: InvoiceStatus) {
  switch (status) {
    case InvoiceStatus.Created:
      return {
        label: "DRAFT",
        description: "Menunggu persetujuan klien",
        stampClass: "stamp-draft",
        canList: false,
      };
    case InvoiceStatus.Approved:
      return {
        label: "DISETUJUI",
        description: "Klien menyetujui, siap ditawarkan ke funder",
        stampClass: "stamp-approved",
        canList: true,
      };
    case InvoiceStatus.Listed:
      return {
        label: "DIJUAL",
        description: "Ditawarkan di bursa, menunggu pendanaan funder",
        stampClass: "stamp-listed",
        canList: false,
      };
    case InvoiceStatus.Financed:
      return {
        label: "DIDANAI",
        description: "Uang diterima freelancer, terkunci untuk pelunasan klien",
        stampClass: "stamp-financed",
        canList: false,
      };
    case InvoiceStatus.Paid:
      return {
        label: "LUNAS",
        description: "Telah dilunasi penuh oleh klien ke pemegang NFT",
        stampClass: "stamp-paid",
        canList: false,
      };
    default:
      return {
        label: "TIDAK DIKETAHUI",
        description: "-",
        stampClass: "",
        canList: false,
      };
  }
}
