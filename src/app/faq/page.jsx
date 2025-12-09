// app/faq/page.jsx

"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  Sparkles,
  Bell,
  Bot,
  Lock,
  Globe,
  CheckCircle2,
  MessageCircle,
  HelpCircle,
} from "lucide-react";

const faqs = [
  {
    question: "What makes Overlax different from other task apps?",
    answer:
      "Overlax is not just another to-do list. It intelligently calculates your daily pressure, gives motivational feedback, and sends Telegram reminders even when the app is closed. It focuses on reducing stress, not adding more.",
    icon: <Sparkles className="w-6 h-6" />,
  },
  {
    question: "Do Telegram reminders work when the app is closed?",
    answer:
      "Yes, 100%! Reminders are fully server-side. You’ll get a Telegram notification 2 minutes before deadline — even if your phone is off or app is not open. No battery drain, no background running needed.",
    icon: <Bell className="w-6 h-6" />,
  },
  {
    question: "How smart is the AI Assistant?",
    answer:
      "Very smart! Just type naturally — 'Meeting tomorrow 3pm', 'Gym at 7am daily', 'Submit assignment Friday' — and it creates tasks automatically with correct date, time, and category. Works perfectly in English.",
    icon: <Bot className="w-6 h-6" />,
  },
  {
    question: "Is my data safe and private?",
    answer:
      "Absolutely. We use Google Firebase Authentication with bank-level encryption. Your tasks are linked only to your Google account. No one else can access them — not even us.",
    icon: <Lock className="w-6 h-6" />,
  },
  {
    question: "Is Overlax free forever?",
    answer:
      "Yes! Lifetime FREE. No subscription, no hidden fees, no task limits. All core features — AI, reminders, history, pressure meter — are completely free forever.",
    icon: <CheckCircle2 className="w-6 h-6" />,
  },
  {
    question: "Can I use Overlax on mobile?",
    answer:
      "Yes! The web version is fully mobile-optimized. You can add it to your home screen (PWA) and use it like a native app. Native Android/iOS apps coming soon!",
    icon: <Globe className="w-6 h-6" />,
  },
  {
    question: "Can I use Overlax for team collaboration?",
    answer:
      "Currently best for personal use. Team features (shared tasks, assign to others) are planned for v2 and coming very soon!",
    icon: <MessageCircle className="w-6 h-6" />,
  },
  {
    question: "Will my tasks be deleted if I clear browser data?",
    answer:
      "No! All tasks are saved securely in the cloud (MongoDB + Firebase). Even if you clear cache or switch devices — just login again and everything will be there.",
    icon: <HelpCircle className="w-6 h-6" />,
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-[#039BE5] mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about Overlax
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-purple-300"
            >
              <button
                onClick={() => toggle(index)}
                className="w-full px-8 py-6 flex items-center justify-between text-left group hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200"
              >
                <div className="flex items-center gap-5">
                  <div className="text-purple-600 group-hover:scale-110 transition-transform">
                    {faq.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 group-hover:text-purple-700 pr-8">
                    {faq.question}
                  </h3>
                </div>
                <ChevronDown
                  className={`w-6 h-6 text-purple-600 transition-transform duration-300 flex-shrink-0 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Answer */}
              <div
                className={`transition-all duration-500 ease-in-out ${
                  openIndex === index
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-8 pb-8 pt-2">
                  <p className="text-gray-700 text-lg leading-relaxed pl-14">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 bg-white/60 backdrop-blur rounded-3xl py-10 px-8 shadow-xl">
          <p className="text-xl text-gray-700">
            Still have questions?
            <span className="font-bold text-purple-600">
              {" "}
              Ask our AI Assistant
            </span>{" "}
            — it's available 24/7!
          </p>
        </div>
      </div>
    </div>
  );
}
