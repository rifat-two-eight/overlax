// app/history/page.jsx

"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { CheckCircle2, XCircle, Calendar } from "lucide-react";
import { auth } from "@/firebase.config";
import { onAuthStateChanged } from "firebase/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function History() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchHistory(user.uid);
      } else {
        setTasks([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchHistory = async (uid) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${API_URL}/api/tasks/${uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");

      const data = await res.json();
      const allTasks = data.tasks || [];

      // Only tasks whose deadline is over
      const now = new Date();
      const pastTasks = allTasks
        .filter((task) => new Date(task.deadline) < now)
        .sort((a, b) => new Date(b.deadline) - new Date(a.deadline)); // newest first

      setTasks(pastTasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-purple-700 mb-2">History</h1>
          <p className="text-gray-600">All tasks with past deadlines</p>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-xl text-gray-500">No past tasks yet</p>
            <p className="text-gray-400 mt-2">
              Your completed and missed tasks will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => {
              const isDone = task.completed || task.status === "done";
              const deadline = new Date(task.deadline);

              return (
                <div
                  key={task._id}
                  className={`bg-white rounded-xl shadow-md p-5 flex items-center justify-between border-l-4 ${
                    isDone ? "border-green-500" : "border-red-500"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {isDone ? (
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    ) : (
                      <XCircle className="w-8 h-8 text-red-600" />
                    )}
                    <div>
                      <h3
                        className={`font-semibold text-lg ${
                          isDone ? "text-gray-800" : "text-gray-700"
                        }`}
                      >
                        {task.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span>{task.category}</span>
                        <span>•</span>
                        <span>{format(deadline, "dd MMM yyyy, h:mm a")}</span>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`font-medium ${
                      isDone ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isDone ? "Done" : "Missed"}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
