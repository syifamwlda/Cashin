import { network } from "hardhat";

async function main() {
  const { ethers } = await network.create({
    network: "localhost",
  });

  const cairInAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const mockUsdcAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const signers = await ethers.getSigners();
  const [freelancer, client1, funder1, client2, client3, client4] = signers;

  console.log("Seeding CairIn & MockUSDC on localhost...");

  const mockUsdc = await ethers.getContractAt("MockUSDC", mockUsdcAddress);
  const cairIn = await ethers.getContractAt("CairIn", cairInAddress);

  // 1. Mint 50,000 USDC ke semua akun demo dan approve CairIn
  const mintAmount = ethers.parseUnits("50000", 6);
  for (const signer of [freelancer, client1, funder1, client2, client3, client4]) {
    await (await mockUsdc.mint(signer.address, mintAmount)).wait();
    await (await mockUsdc.connect(signer).approve(cairInAddress, ethers.MaxUint256)).wait();
    console.log(`✓ Minted 50k USDC & approved CairIn for ${signer.address.slice(0, 8)}...`);
  }

  // Helper untuk membuat invoice baru
  async function createAndGetId(sender: any, clientAddr: string, amount: bigint, dueDays: number): Promise<bigint> {
    const dueTimestamp = BigInt(Math.floor(Date.now() / 1000) + dueDays * 86400);
    const tx = await cairIn.connect(sender).createInvoice(clientAddr, amount, dueTimestamp);
    const receipt = await tx.wait();
    const event = receipt?.logs
      .map((log: any) => {
        try {
          return cairIn.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((e: any) => e && e.name === "InvoiceCreated");
    return event ? BigInt(event.args[0]) : 1n;
  }

  // 2. Buat Invoice #1 (Status: Financed)
  const id1 = await createAndGetId(freelancer, client1.address, ethers.parseUnits("1000", 6), 30);
  await (await cairIn.connect(client1).approveInvoice(id1)).wait();
  await (await cairIn.connect(freelancer).listInvoice(id1, ethers.parseUnits("920", 6))).wait();
  await (await cairIn.connect(funder1).buyInvoice(id1)).wait();
  console.log(`✓ Invoice #${id1} (Financed) ready on-chain`);

  // 3. Buat Invoice #2 (Status: Listed)
  const id2 = await createAndGetId(freelancer, client2.address, ethers.parseUnits("2500", 6), 20);
  await (await cairIn.connect(client2).approveInvoice(id2)).wait();
  await (await cairIn.connect(freelancer).listInvoice(id2, ethers.parseUnits("2300", 6))).wait();
  console.log(`✓ Invoice #${id2} (Listed) ready on-chain`);

  // 4. Buat Invoice #3 (Status: Approved)
  const id3 = await createAndGetId(freelancer, client3.address, ethers.parseUnits("750", 6), 45);
  await (await cairIn.connect(client3).approveInvoice(id3)).wait();
  console.log(`✓ Invoice #${id3} (Approved) ready on-chain`);

  // 5. Buat Invoice #4 (Status: Created, Klien: client4 / Account 5)
  const id4 = await createAndGetId(freelancer, client4.address, ethers.parseUnits("450", 6), 38);
  console.log(`✓ Invoice #${id4} (Created untuk Account 5) ready on-chain`);

  console.log("✨ Seeding selesai sempurna!");
}

main().catch((err) => {
  console.error("Error seeding:", err);
  process.exit(1);
});
