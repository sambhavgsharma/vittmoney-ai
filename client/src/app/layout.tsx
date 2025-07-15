
import type { Metadata } from "next";
import "./globals.css";
import { Schibsted_Grotesk } from "next/font/google";

const schibstedGrotesk = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});


export const metadata: Metadata = {
  title: "VittMoney.ai - Smart Expense Tracker",
  description: "Track your expenses smartly with vittmoney.ai",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased ${schibstedGrotesk.className}`}>
        {children}
      </body>
    </html>
  );
}
