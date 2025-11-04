// app/layout.jsx
import { AuthProvider } from "@/context/AuthContext";  // Fixed path
import "./globals.css";

export const metadata = {
  title: "Overlax",
  description: "Your smart task & calendar manager",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-gradient-to-br from-blue-50 to-slate-100 min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}