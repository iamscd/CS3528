import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/header"; 

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
    <html lang="en">
      <body
        className="
          bg-gradient-to-b from-fuchsia-50 to-fuchsia-100
          dark:from-fuchsia-800 dark:to-fuchsia-700
          text-gray-800 dark:text-gray-100
        "
      >
        <Header />  

        <main className="min-h-screen container mx-auto p-4">
          {children}
        </main>
      </body>
    </html>
  );
}