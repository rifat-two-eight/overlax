// components/AIWrapper.jsx — EI TA THIK RAKHO
"use client";

import AIAssistant from "./AiAssistant";
import { useAuth } from "@/context/AuthContext";

export default function AIWrapper({ user: propUser, tasks = [] }) {
  const { user: contextUser } = useAuth();

  // JODI PROP USER DIYE THAKE → SEITA USE KORO (dashboard e pass kora)
  // NA HOLE CONTEXT THEKE NIBO (layout e thaka AI)
  const finalUser = propUser || contextUser;

  return <AIAssistant user={finalUser} tasks={tasks} />;
}