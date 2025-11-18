// components/Nav.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { LogOut, Menu, X, User, Settings } from "lucide-react";
import { useState } from "react";

export default function Nav() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/dashboard", private: true },
    { label: "Reports", href: "/reports", private: true },
    { label: "FAQ", href: "/faq" },
    { label: "AI", href: "/ai" },
  ];

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* LOGO */}
          <Link href="/" className="flex items-center">
            <img src="/overlax.svg" alt="Overlax" className="h-9 w-auto" />
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              if (item.private && !user) return null;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
                    active
                      ? "bg-[#E6F5FC] text-[#0084FF] shadow-sm"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* RIGHT: PROFILE OR AUTH */}
          <div className="hidden md:flex items-center gap-4 relative">

            {user ? (
              <>
                {/* PROFILE PIC (clickable) */}
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-slate-200 hover:ring-[#0084FF] transition-all"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                      {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                </button>

                {/* DROPDOWN */}
                {profileOpen && (
                  <div className="absolute right-0 top-14 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-900">
                        {user.displayName || user.email?.split("@")[0]}
                      </p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>

                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profile Settings
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-slate-700 hover:text-[#0084FF]"
                >
                  Log in
                </Link>
                <span>/</span>
                <Link
                  href="/auth/signup"
                  className="text-sm font-medium text-slate-700 hover:text-[#0084FF]"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-slate-700" />
            ) : (
              <Menu className="w-5 h-5 text-slate-700" />
            )}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
            {navItems.map((item) => {
              if (item.private && !user) return null;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block w-full text-left px-5 py-2 rounded-md text-sm font-medium transition-all ${
                    active
                      ? "bg-[#E6F5FC] text-[#0084FF]"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {user ? (
              <>
                <div className="border-t border-slate-200 pt-3">
                  <div className="flex items-center gap-3 px-5 py-2">
                    <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-slate-200">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                          {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {user.displayName || user.email?.split("@")[0]}
                      </p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-left px-5 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-3"
                  >
                    <Settings className="w-4 h-4" />
                    Profile Settings
                  </Link>

                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-5 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left px-5 py-2 text-sm font-medium bg-[#0084FF] text-white hover:bg-[#0066cc] rounded-md"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}