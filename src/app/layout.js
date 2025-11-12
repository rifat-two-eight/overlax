// app/layout.jsx
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Nav from "@/components/Nav";
import ConditionalFooter from "@/components/ConditionalFooter";

export const metadata = {
  title: "Overlax",
  description: "Task & Deadline Manager",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
        <AuthProvider>
          <Nav />
          <main className="flex-1">{children}</main>
          <ConditionalFooter />
        </AuthProvider>
      </body>
    </html>
  );
}