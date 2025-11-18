// app/layout.jsx → FINAL FIXED CODE

import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Nav from "@/components/Nav";
import ConditionalFooter from "@/components/ConditionalFooter";
import AIWrapper from "@/components/AiWrapper";

export const metadata = {
  title: "Overlax",
  description: "Task & Deadline Manager",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 relative">
        <AuthProvider>
          <Nav />
          <main className="flex-1 pb-24">{children}</main>
          <ConditionalFooter />
          
          {/* AI Assistant — homepage chara sob page e */}
          <AIWrapper />
        </AuthProvider>
      </body>
    </html>
  );
}