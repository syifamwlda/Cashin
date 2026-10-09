import { expect } from "chai";
import { network } from "hardhat";

const { ethers, networkHelpers } = await network.create();

describe("CairIn - Platform Invoice Financing", function () {
  async function deployCairInFixture() {
    const [deployer, freelancer, client, funder1, funder2] = await ethers.getSigners();

    // 1. Deploy Mock USDC (token pembayaran simulasi)
    const mockUSDC = await ethers.deployContract("MockUSDC");
    const cairIn = await ethers.deployContract("CairIn", [await mockUSDC.getAddress()]);

    const cairInAddress = await cairIn.getAddress();

    // 2. Beri modal awal USDC (10,000 USDC dengan 6 desimal) ke Funder 1, Funder 2, dan Client
    const initialFunds = ethers.parseUnits("10000", 6);
    await mockUSDC.mint(funder1.address, initialFunds);
    await mockUSDC.mint(funder2.address, initialFunds);
    await mockUSDC.mint(client.address, initialFunds);

    // 3. Beri izin (approve) kontrak CairIn untuk memotong token USDC saat transaksi
    await mockUSDC.connect(funder1).approve(cairInAddress, ethers.MaxUint256);
    await mockUSDC.connect(funder2).approve(cairInAddress, ethers.MaxUint256);
    await mockUSDC.connect(client).approve(cairInAddress, ethers.MaxUint256);

    return { cairIn, mockUSDC, deployer, freelancer, client, funder1, funder2 };
  }

  describe("Siklus Hidup Invoice (Lifecycle)", function () {
    it("Harus menjalankan alur lengkap dari Created hingga Paid", async function () {
      const { cairIn, mockUSDC, freelancer, client, funder1 } = await networkHelpers.loadFixture(deployCairInFixture);

      const invoiceAmount = ethers.parseUnits("1000", 6); // Tagihan 1000 USDC
      const listingPrice = ethers.parseUnits("900", 6);   // Diskon 900 USDC untuk funder
      const dueDate = (await networkHelpers.time.latest()) + 30 * 24 * 60 * 60; // 30 hari ke depan

      // 1. Freelancer membuat invoice (Created)
      const createTx = await cairIn.connect(freelancer).createInvoice(client.address, invoiceAmount, dueDate);
      await expect(createTx).to.emit(cairIn, "InvoiceCreated");

      const tokenId = 1n;
      let invoice = await cairIn.getInvoice(tokenId);
      expect(invoice.status).to.equal(0n); // 0 = Created
      expect(await cairIn.ownerOf(tokenId)).to.equal(freelancer.address);

      // 2. Client menyetujui invoice (Approved)
      await expect(cairIn.connect(client).approveInvoice(tokenId))
        .to.emit(cairIn, "InvoiceApproved");
      invoice = await cairIn.getInvoice(tokenId);
      expect(invoice.status).to.equal(1n); // 1 = Approved

      // 3. Freelancer mendaftarkan invoice ke marketplace (Listed)
      await expect(cairIn.connect(freelancer).listInvoice(tokenId, listingPrice))
        .to.emit(cairIn, "InvoiceListed");
      invoice = await cairIn.getInvoice(tokenId);
      expect(invoice.status).to.equal(2n); // 2 = Listed
      expect(invoice.listingPrice).to.equal(listingPrice);

      // 4. Funder 1 mendanai invoice (Financed)
      const freelancerBalanceBefore = await mockUSDC.balanceOf(freelancer.address);

      await expect(cairIn.connect(funder1).buyInvoice(tokenId))
        .to.emit(cairIn, "InvoiceFinanced");

      invoice = await cairIn.getInvoice(tokenId);
      expect(invoice.status).to.equal(3n); // 3 = Financed
      expect(invoice.funder).to.equal(funder1.address);
      expect(await cairIn.ownerOf(tokenId)).to.equal(funder1.address); // NFT beralih ke Funder 1

      // Cek uang diskon diterima langsung oleh freelancer
      const freelancerBalanceAfter = await mockUSDC.balanceOf(freelancer.address);
      expect(freelancerBalanceAfter - freelancerBalanceBefore).to.equal(listingPrice);

      // 5. Client melunasi invoice saat jatuh tempo (Paid)
      const funderBalanceBefore = await mockUSDC.balanceOf(funder1.address);

      await expect(cairIn.connect(client).payInvoice(tokenId))
        .to.emit(cairIn, "InvoicePaid");

      invoice = await cairIn.getInvoice(tokenId);
      expect(invoice.status).to.equal(4n); // 4 = Paid

      // Funder menerima pelunasan penuh 1000 USDC (keuntungan = 1000 - 900 = 100 USDC)
      const funderBalanceAfter = await mockUSDC.balanceOf(funder1.address);
      expect(funderBalanceAfter - funderBalanceBefore).to.equal(invoiceAmount);
    });
  });

  describe("Keamanan: Pencegahan Double-Funding", function () {
    it("BUKTI: Satu invoice TIDAK BISA dibeli oleh dua funder berbeda", async function () {
      const { cairIn, freelancer, client, funder1, funder2 } = await networkHelpers.loadFixture(deployCairInFixture);

      const invoiceAmount = ethers.parseUnits("1000", 6);
      const listingPrice = ethers.parseUnits("900", 6);
      const dueDate = (await networkHelpers.time.latest()) + 30 * 24 * 60 * 60;

      // Persiapan: Buat invoice, setujui, dan daftarkan ke market
      await cairIn.connect(freelancer).createInvoice(client.address, invoiceAmount, dueDate);
      const tokenId = 1n;
      await cairIn.connect(client).approveInvoice(tokenId);
      await cairIn.connect(freelancer).listInvoice(tokenId, listingPrice);

      // Funder 1 membeli invoice pertama kali -> BERHASIL
      await expect(cairIn.connect(funder1).buyInvoice(tokenId))
        .to.emit(cairIn, "InvoiceFinanced");

      // Verifikasi status sudah menjadi Financed (3) dan pemilik NFT adalah Funder 1
      const invoice = await cairIn.getInvoice(tokenId);
      expect(invoice.status).to.equal(3n); // Financed
      expect(await cairIn.ownerOf(tokenId)).to.equal(funder1.address);

      // BUKTI UTAMA: Funder 2 mencoba membeli invoice yang SAMA -> HARUS GAGAL (REVERT)
      await expect(
        cairIn.connect(funder2).buyInvoice(tokenId)
      ).to.be.revertedWith("Invoice is not listed for financing");

      // Pastikan pemilik NFT tetap Funder 1 dan tidak berganti ke Funder 2
      expect(await cairIn.ownerOf(tokenId)).to.equal(funder1.address);
    });

    it("Freelancer tidak dapat membeli invoicenya sendiri", async function () {
      const { cairIn, freelancer, client } = await networkHelpers.loadFixture(deployCairInFixture);

      const invoiceAmount = ethers.parseUnits("1000", 6);
      const listingPrice = ethers.parseUnits("900", 6);
      const dueDate = (await networkHelpers.time.latest()) + 30 * 24 * 60 * 60;

      await cairIn.connect(freelancer).createInvoice(client.address, invoiceAmount, dueDate);
      const tokenId = 1n;
      await cairIn.connect(client).approveInvoice(tokenId);
      await cairIn.connect(freelancer).listInvoice(tokenId, listingPrice);

      await expect(
        cairIn.connect(freelancer).buyInvoice(tokenId)
      ).to.be.revertedWith("Freelancer cannot fund own invoice");
    });
  });
});
