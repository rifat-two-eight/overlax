// app/layout.jsx

import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Nav from "@/components/Nav";
import ConditionalFooter from "@/components/ConditionalFooter";
import AIWrapper from "@/components/AiWrapper";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Overlax",
  description: "Task & Deadline Manager",
  icons: {
    icon: "/overlax.svg",
    shortcut: "/overlax.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen bg-linear-to-br from-blue-50 to-slate-100 relative">
        <AuthProvider>
          <Nav />
          <main className="flex-1 pb-24">{children}</main>
          <ConditionalFooter />

          {/* AI Assistant */}
          <AIWrapper />
        </AuthProvider>
      </body>
    </html>
  );
}
