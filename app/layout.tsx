import type { Metadata } from "next";
import { DM_Sans, DM_Mono, Bebas_Neue } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-dm-sans",
  display: "optional",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-mono",
  display: "optional",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bebas",
  display: "optional",
});

export const metadata: Metadata = {
  title: "Víctor Salmerón",
  description: "Simracing, contenido y coaching de motorsport — Cocotilo37",
  icons: { icon: "/logo.jpg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" style={{ backgroundColor: "#0a0a0a" }}>
      <body
        className={`${dmSans.variable} ${dmMono.variable} ${bebasNeue.variable} antialiased`}
        style={{ backgroundColor: "#0a0a0a" }}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
