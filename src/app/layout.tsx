import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "./erp.css";

export const metadata: Metadata = {
  title: "Rana Medical Hospital | Compassionate Care, Advanced Medical Excellence",
  description: "Book a consultation, explore care services and connect with Rana Medical Hospital. Call 0324-6627054.",
  metadataBase: new URL("https://rana-medical.example"),
  openGraph: {
    title: "Rana Medical Hospital",
    description: "Compassionate care, advanced medical excellence.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-slate-900 antialiased">{children}</body>
    </html>
  );
}
