import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "CairIn — Platform Pembiayaan Invoice Freelancer",
  description:
    "Cairkan piutang invoice Anda lebih cepat ke investor melalui NFT ERC-721 di Base Sepolia.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
