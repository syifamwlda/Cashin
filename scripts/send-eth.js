import { ethers } from "ethers";

const RPC = "https://sepolia.base.org";
const PK = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const provider = new ethers.JsonRpcProvider(RPC);
const wallet = new ethers.Wallet(PK, provider);

const targetAddress = process.argv[2];
if (!targetAddress) {
  console.log("Usage: node scripts/send-eth.js <address>");
  process.exit(1);
}

const tx = await wallet.sendTransaction({
  to: targetAddress,
  value: ethers.parseEther("0.001"),
});
console.log("Sent 0.001 ETH! Tx Hash:", tx.hash);
const receipt = await tx.wait();
console.log("Confirmed in block:", receipt.blockNumber);
