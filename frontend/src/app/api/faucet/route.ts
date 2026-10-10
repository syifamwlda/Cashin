import { NextRequest, NextResponse } from "next/server";
import { createWalletClient, createPublicClient, http, parseUnits, isAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

const FAUCET_PRIVATE_KEY = (process.env.PRIVATE_KEY ||
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80") as `0x${string}`;

const RPC_URL = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";
const MOCK_USDC_ADDRESS = (process.env.NEXT_PUBLIC_MOCK_USDC_ADDRESS ||
  "0x7715Cb22e0f7E811b7cd57F11dE6112019E776DD") as `0x${string}`;

const mockUsdcAbi = [
  {
    name: "mint",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address } = body;

    if (!address || !isAddress(address)) {
      return NextResponse.json(
        { error: "Alamat dompet (address) tidak valid." },
        { status: 400 }
      );
    }

    const account = privateKeyToAccount(FAUCET_PRIVATE_KEY);
    const transport = http(RPC_URL);

    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport,
    });

    const walletClient = createWalletClient({
      account,
      chain: baseSepolia,
      transport,
    });

    // Mint 10,000 MockUSDC (10,000 * 10^6)
    const amount = parseUnits("10000", 6);

    const hash = await walletClient.writeContract({
      address: MOCK_USDC_ADDRESS,
      abi: mockUsdcAbi,
      functionName: "mint",
      args: [address as `0x${string}`, amount],
    });

    // Tunggu receipt konfirmasi di Base Sepolia
    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
      timeout: 30_000,
    });

    // Kirimkan saldo Base Sepolia ETH untuk biaya gas transaksi
    let ethDripSent = false;
    try {
      const userEthBal = await publicClient.getBalance({ address: address as `0x${string}` });
      if (userEthBal < parseUnits("0.002", 18)) {
        await walletClient.sendTransaction({
          to: address as `0x${string}`,
          value: parseUnits("0.0005", 18),
        });
        ethDripSent = true;
      }
    } catch (e) {
      console.warn("Faucet ETH drip notice:", e);
    }

    // Ambil saldo on-chain terbaru
    const newBalance = await publicClient.readContract({
      address: MOCK_USDC_ADDRESS,
      abi: mockUsdcAbi,
      functionName: "balanceOf",
      args: [address as `0x${string}`],
    });

    return NextResponse.json({
      success: true,
      txHash: hash,
      blockNumber: receipt.blockNumber.toString(),
      amountMinted: "10000",
      newBalance: newBalance.toString(),
      ethDripSent,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Faucet API Error]:", error);
    return NextResponse.json(
      { error: `Gagal mengirim token faucet: ${message}` },
      { status: 500 }
    );
  }
}
