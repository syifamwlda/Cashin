import { http, createConfig } from "wagmi";
import { baseSepolia, hardhat } from "wagmi/chains";
import { injected } from "wagmi/connectors";

export const wagmiConfig = createConfig({
  chains: [baseSepolia, hardhat],
  connectors: [injected()],
  transports: {
    [baseSepolia.id]: http(),
    [hardhat.id]: http("http://127.0.0.1:8545"),
  },
  ssr: true,
});
