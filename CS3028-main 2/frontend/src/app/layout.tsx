import type { Metadata } from "next";
import { DM_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/header";

const instrumentSerif = DM_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-instrument-serif",
});

export const metadata: Metadata = {
  title: "Endometriosis Learning Suite",
  description: "Learn about endometriosis through interactive modules",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={instrumentSerif.variable}>
      <body
        className="
          bg-[#efefef]
          text-gray-800 dark:text-gray-100
          m-0 min-h-screen
        "
      >

        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        
      </body>
    </html>
  );
}
