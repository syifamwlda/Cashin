import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Modul Hardhat Ignition untuk mendeploy MockUSDC dan CairIn.
 * CairIn membutuhkan alamat MockUSDC sebagai parameter constructor.
 */
export default buildModule("CairInModule", (m) => {
  // 1. Deploy MockUSDC token
  const mockUSDC = m.contract("MockUSDC");

  // 2. Deploy CairIn dengan melewatkan instance MockUSDC sebagai paymentToken
  const cairIn = m.contract("CairIn", [mockUSDC]);

  return { mockUSDC, cairIn };
});
