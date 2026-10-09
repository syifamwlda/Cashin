// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockUSDC
 * @notice Token tiruan (mock) USDC untuk pengujian dan demo CairIn.
 * Memiliki 6 desimal sama seperti USDC asli di Base dan Ethereum.
 */
contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USD Coin", "USDC") {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    /**
     * @notice Fungsi mint bebas untuk simulasi & pengujian (testing).
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
