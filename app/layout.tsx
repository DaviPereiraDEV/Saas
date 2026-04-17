import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import SnowEffect from "@/components/SnowEffect";

export const metadata: Metadata = {
  title: "Wayne Automations",
  description: "Sistema completo de automação para Instagram",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <SnowEffect />
        <div className="app-container">
          <Sidebar />
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
