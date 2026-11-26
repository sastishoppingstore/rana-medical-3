import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "./erp.css";

export const metadata: Metadata = {
  title: "Rana Medical Hospital | Precision care, delivered with grace",
  description: "A hospital built on measured medicine — specialist attention, modern diagnostics and a calm, deliberate way of working. Call 0324-6627054.",
  metadataBase: new URL("https://rana-medical.example"),
  openGraph: {
    title: "Rana Medical Hospital",
    description: "Precision care, delivered with grace.",
    type: "website",
  },
};

const fonts = (
  <>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <link
      href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
  </>
);

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>{fonts}</head>
      <body className="bg-white text-slate-900 antialiased">{children}</body>
    </html>
  );
}
