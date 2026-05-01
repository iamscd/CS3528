import type { Metadata } from "next";
import { Zalando_Sans_Expanded } from "next/font/google";
import "./globals.css";
import Header from "./components/header";
import HelpButton from "./components/HelpButton";


const instrumentSerif = Zalando_Sans_Expanded({
  subsets: ["latin"],
  weight: [
        "200",
         ],
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
        <HelpButton />
        
      </body>
    </html>
  );
}
