// app/connect-telegram/page.jsx

"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/firebase.config";
import { onAuthStateChanged } from "firebase/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ConnectTelegram() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Connecting...");

  useEffect(() => {
    const chatId = searchParams.get("chatId");
    if (!chatId) {
      setStatus("No chatId found — please open from Telegram bot");
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const res = await fetch(`${API_URL}/api/connect-telegram`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ chatId }),
          });

          if (res.ok) {
            setStatus("Connected successfully! You can close this page.");
            setTimeout(() => router.push("/dashboard"), 3000);
          } else {
            setStatus("Failed to connect — try again");
          }
        } catch (err) {
          setStatus("Error: " + err.message);
        }
      } else {
        router.push("/login?redirect=/connect-telegram?chatId=" + chatId);
      }
    });

    return () => unsubscribe();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
        <h1 className="text-3xl font-bold text-purple-600 mb-4">
          Connecting Telegram
        </h1>
        <p className="text-gray-700 text-lg">{status}</p>
      </div>
    </div>
  );
}
