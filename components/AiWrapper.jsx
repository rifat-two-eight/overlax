// app/components/AIWrapper.jsx
"use client";

import { usePathname } from "next/navigation";
import AIAssistant from "./AiAssistant";

export default function AIWrapper() {
  const pathname = usePathname();

  // Homepage e AI button dekhabe na
  if (pathname === "/" || pathname === "/home") {
    return null;
  }

  return <AIAssistant />;
}