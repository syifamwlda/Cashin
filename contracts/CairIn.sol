// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title CairIn
 * @notice Platform Invoice Financing RWA untuk Freelancer.
 * Mengubah invoice riil menjadi NFT ERC-721 yang dapat didanai oleh investor (funder).
 */
contract CairIn is ERC721 {
    enum InvoiceStatus {
        Created,
        Approved,
        Listed,
        Financed,
        Paid
    }

    struct Invoice {
        uint256 id;
        address freelancer;
        address client;
        uint256 amount;        // Nilai penuh piutang invoice (misal: 1000 USDC)
        uint256 listingPrice;  // Harga diskon penawaran ke funder (misal: 900 USDC)
        uint256 dueDate;       // Batas waktu jatuh tempo pembayaran oleh klien
        address funder;        // Alamat funder yang mendanai invoice
        InvoiceStatus status;  // Status alur saat ini
    }

    IERC20 public immutable paymentToken;
    uint256 private _nextTokenId;

    mapping(uint256 => Invoice) public invoices;

    // Events untuk mencatat seluruh riwayat aktivitas di blockchain
    event InvoiceCreated(
        uint256 indexed tokenId,
        address indexed freelancer,
        address indexed client,
        uint256 amount,
        uint256 dueDate
    );
    event InvoiceApproved(uint256 indexed tokenId, address indexed client);
    event InvoiceListed(uint256 indexed tokenId, uint256 listingPrice);
    event InvoiceFinanced(uint256 indexed tokenId, address indexed funder, uint256 listingPrice);
    event InvoicePaid(uint256 indexed tokenId, address indexed payer, uint256 amount);

    constructor(address _paymentToken) ERC721("CairIn Invoice NFT", "CAIRIN") {
        require(_paymentToken != address(0), "Invalid payment token");
        paymentToken = IERC20(_paymentToken);
    }

    /**
     * @notice Langkah 1: Freelancer membuat invoice untuk klien.
     * NFT dicetak (mint) langsung ke dompet freelancer. Status: Created.
     */
    function createInvoice(
        address client,
        uint256 amount,
        uint256 dueDate
    ) external returns (uint256) {
        require(client != address(0), "Invalid client address");
        require(client != msg.sender, "Client cannot be freelancer");
        require(amount > 0, "Amount must be greater than zero");
        require(dueDate > block.timestamp, "Due date must be in the future");

        uint256 tokenId = ++_nextTokenId;

        invoices[tokenId] = Invoice({
            id: tokenId,
            freelancer: msg.sender,
            client: client,
            amount: amount,
            listingPrice: 0,
            dueDate: dueDate,
            funder: address(0),
            status: InvoiceStatus.Created
        });

        _safeMint(msg.sender, tokenId);

        emit InvoiceCreated(tokenId, msg.sender, client, amount, dueDate);
        return tokenId;
    }

    /**
     * @notice Langkah 2: Klien memverifikasi dan menyetujui invoice.
     * Hanya address klien yang tertera yang dapat menyetujui.
     * Status berubah: Created -> Approved.
     */
    function approveInvoice(uint256 tokenId) external {
        Invoice storage invoice = invoices[tokenId];
        require(invoice.id != 0, "Invoice not found");
        require(msg.sender == invoice.client, "Only client can approve");
        require(invoice.status == InvoiceStatus.Created, "Invoice is not in Created status");

        invoice.status = InvoiceStatus.Approved;
        emit InvoiceApproved(tokenId, msg.sender);
    }

    /**
     * @notice Langkah 3: Freelancer menjual hak tagih invoice dengan harga diskon.
     * Status berubah: Approved -> Listed.
     */
    function listInvoice(uint256 tokenId, uint256 listingPrice) external {
        Invoice storage invoice = invoices[tokenId];
        require(invoice.id != 0, "Invoice not found");
        require(ownerOf(tokenId) == msg.sender, "Only NFT owner can list");
        require(invoice.status == InvoiceStatus.Approved, "Invoice must be approved first");
        require(listingPrice > 0, "Listing price must be > 0");
        require(listingPrice <= invoice.amount, "Listing price cannot exceed amount");

        invoice.listingPrice = listingPrice;
        invoice.status = InvoiceStatus.Listed;

        emit InvoiceListed(tokenId, listingPrice);
    }

    /**
     * @notice Langkah 4: Funder membeli invoice dengan mentransfer dana diskon ke freelancer.
     * Kepemilikan NFT berpindah ke funder.
     * Status berubah: Listed -> Financed.
     * PENCEGAHAN DOUBLE-FUNDING:
     * Karena status langsung diubah ke 'Financed', panggilan kedua terhadap invoice yang sama
     * akan otomatis gagal (revert) karena require(status == Listed) tidak terpenuhi!
     */
    function buyInvoice(uint256 tokenId) external {
        Invoice storage invoice = invoices[tokenId];
        require(invoice.id != 0, "Invoice not found");
        require(invoice.status == InvoiceStatus.Listed, "Invoice is not listed for financing");
        require(msg.sender != invoice.freelancer, "Freelancer cannot fund own invoice");

        address freelancer = invoice.freelancer;
        uint256 price = invoice.listingPrice;

        // Perbarui status terlebih dahulu sebelum transfer token (pola Checks-Effects-Interactions)
        invoice.status = InvoiceStatus.Financed;
        invoice.funder = msg.sender;

        // Funder membayar freelancer langsung
        bool success = paymentToken.transferFrom(msg.sender, freelancer, price);
        require(success, "Payment token transfer failed");

        // Pindahkan kepemilikan NFT ke Funder
        _transfer(freelancer, msg.sender, tokenId);

        emit InvoiceFinanced(tokenId, msg.sender, price);
    }

    /**
     * @notice Langkah 5: Klien melunasi nominal invoice penuh saat jatuh tempo.
     * Dana pelunasan langsung otomatis masuk ke pemegang NFT (funder).
     * Status berubah: Financed -> Paid.
     */
    function payInvoice(uint256 tokenId) external {
        Invoice storage invoice = invoices[tokenId];
        require(invoice.id != 0, "Invoice not found");
        require(invoice.status == InvoiceStatus.Financed, "Invoice is not in Financed status");
        require(msg.sender == invoice.client, "Only client can pay invoice");

        address currentHolder = ownerOf(tokenId);
        uint256 fullAmount = invoice.amount;

        invoice.status = InvoiceStatus.Paid;

        // Klien melunasi langsung ke pemegang NFT (funder yang berhak menerima pokok + keuntungan diskon)
        bool success = paymentToken.transferFrom(msg.sender, currentHolder, fullAmount);
        require(success, "Repayment failed");

        emit InvoicePaid(tokenId, msg.sender, fullAmount);
    }

    /**
     * @notice Helper untuk mengambil data lengkap invoice berdasarkan tokenId.
     */
    function getInvoice(uint256 tokenId) external view returns (Invoice memory) {
        require(invoices[tokenId].id != 0, "Invoice not found");
        return invoices[tokenId];
    }
}
