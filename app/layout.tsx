import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import GothamBackdrop from "@/components/GothamBackdrop";
import GothamAtmosphere from "@/components/GothamAtmosphere";

export const metadata: Metadata = {
  title: "Wayne Automations",
  description: "Operações digitais Wayne — automação e conteúdo com padrão Gotham.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <GothamBackdrop />
        <GothamAtmosphere />
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
