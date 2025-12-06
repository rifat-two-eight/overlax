'use client';

import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, AlertTriangle, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { auth } from '@/firebase.config';
import { onAuthStateChanged } from 'firebase/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL 

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [pressure, setPressure] = useState(0.5);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchTasks(currentUser.uid);
      } else {
        setTasks([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchTasks = async (uid) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${API_URL}/api/tasks/${uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      const { tasks } = await res.json();
      setTasks(tasks || []);
      calculatePressure(tasks || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const calculatePressure = (taskList) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCount = taskList.filter(t => 
      t.deadline && isSameDay(new Date(t.deadline), today) && !t.completed
    ).length;

    const weekCount = taskList.filter(t => {
      const d = new Date(t.deadline);
      const weekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return d >= today && d <= weekLater && !t.completed;
    }).length;

    const p = Math.min((todayCount * 0.18) + (weekCount * 0.08), 0.98);
    setPressure(p);
  };

  const todayTasks = tasks.filter(t => 
    t.deadline && isSameDay(new Date(t.deadline), new Date()) && !t.completed
  );

  const upcomingTasks = tasks
    .filter(t => t.deadline && new Date(t.deadline) > new Date() && !t.completed)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  const nextTask = upcomingTasks[0];

  const conflictingTasks = tasks.filter(t => {
    if (!t.deadline || t.completed) return false;
    const taskDate = new Date(t.deadline);
    return todayTasks.some(today => 
      isSameDay(new Date(today.deadline), taskDate)
    );
  });

  const hasConflict = todayTasks.length >= 3;

  // Generate suggestions based on tasks
  const generateSuggestions = () => {
    const suggestions = [];
    const today = new Date();
    
    // Check for tasks due in next 2 days
    const urgentTasks = tasks.filter(t => {
      if (!t.deadline || t.completed) return false;
      const daysUntil = Math.ceil((new Date(t.deadline) - today) / (1000 * 60 * 60 * 24));
      return daysUntil >= 0 && daysUntil <= 2;
    });

    if (urgentTasks.length > 0) {
      urgentTasks.forEach(task => {
        const daysUntil = Math.ceil((new Date(task.deadline) - today) / (1000 * 60 * 60 * 24));
        suggestions.push({
          text: `You should complete "${task.title}" ${daysUntil === 0 ? 'today' : `in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`} to avoid pressure`
        });
      });
    }

    // Check for overlapping deadlines
    const tasksByDate = {};
    tasks.forEach(t => {
      if (!t.deadline || t.completed) return;
      const dateKey = format(new Date(t.deadline), 'yyyy-MM-dd');
      if (!tasksByDate[dateKey]) tasksByDate[dateKey] = [];
      tasksByDate[dateKey].push(t);
    });

    Object.entries(tasksByDate).forEach(([date, tasksOnDate]) => {
      if (tasksOnDate.length >= 2) {
        const dayName = format(new Date(date), 'EEEE');
        suggestions.push({
          text: `${tasksOnDate.length} overlapping deadlines on ${dayName} — start early to manage workload.`
        });
      }
    });

    return suggestions.slice(0, 3);
  };

  const suggestions = generateSuggestions();

  // Calendar logic
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const pressureLevel = pressure < 0.3 ? 'Low' : pressure < 0.6 ? 'Medium' : pressure < 0.8 ? 'High' : 'Critical';
  const pressureColor = pressure < 0.3 ? 'text-green-500' 
    : pressure < 0.6 ? 'text-yellow-500'
    : pressure < 0.8 ? 'text-orange-500'
    : 'text-red-500';

  // Gauge calculation for semicircle
  const gaugeRotation = -90 + (pressure * 180);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-2xl text-gray-600">Loading Overlax...</div>
    </div>
  );

  if (!user) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-xl text-gray-600">Login to see dashboard</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-cyan-500">Overlax</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search"
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Top Row - Task Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Task Due Today */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-cyan-500 text-lg font-semibold mb-4">Task Due Today</h3>
            <div className="flex items-center justify-center">
              <div className="w-20 h-20 bg-cyan-100 rounded-lg flex items-center justify-center">
                <span className="text-4xl font-bold text-cyan-600">{todayTasks.length.toString().padStart(2, '0')}</span>
              </div>
            </div>
          </div>

          {/* Upcoming Deadline */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-cyan-500 text-lg font-semibold mb-4">Upcoming Deadline</h3>
            {nextTask ? (
              <div className="space-y-1">
                <p className="text-gray-700 font-medium">{nextTask.title}</p>
                <p className="text-gray-500 text-sm">
                  {nextTask.category && `(${nextTask.category}) `}
                  in {Math.ceil((new Date(nextTask.deadline) - new Date()) / (1000 * 60 * 60 * 24))} days
                </p>
              </div>
            ) : (
              <p className="text-green-600 font-medium">No upcoming tasks!</p>
            )}
          </div>

          {/* Conflict Detected */}
          <div className={`${hasConflict ? 'bg-gradient-to-br from-orange-400 to-orange-500' : 'bg-gray-100'} rounded-2xl shadow-md p-6 relative`}>
            <div className="flex items-start gap-3">
              <AlertTriangle className={`w-8 h-8 ${hasConflict ? 'text-white' : 'text-gray-400'}`} />
              <div>
                <h3 className={`text-lg font-semibold mb-2 ${hasConflict ? 'text-white' : 'text-gray-500'}`}>
                  Conflict Detected
                </h3>
                {hasConflict && conflictingTasks.length > 0 && (
                  <div className="bg-cyan-100 rounded px-3 py-1 text-sm text-cyan-900 inline-block">
                    {conflictingTasks[0].title}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Pressure Gauge */}
          <div className="bg-white rounded-2xl shadow-md p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-cyan-500 text-lg font-semibold">Pressure</h3>
              <div className="flex items-center gap-2 border border-gray-300 rounded px-3 py-1">
                <CalendarIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Date Range</span>
              </div>
            </div>

            {/* Semicircle Gauge */}
            <div className="relative w-full aspect-square max-w-xs mx-auto">
              <svg viewBox="0 0 200 120" className="w-full">
                {/* Background arc */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="20"
                  strokeLinecap="round"
                />
                
                {/* Colored segments */}
                {/* Green segment */}
                <path
                  d="M 20 100 A 80 80 0 0 1 64 34"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="20"
                  strokeLinecap="round"
                />
                
                {/* Yellow segment */}
                <path
                  d="M 64 34 A 80 80 0 0 1 100 20"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="20"
                  strokeLinecap="round"
                />
                
                {/* Orange segment */}
                <path
                  d="M 100 20 A 80 80 0 0 1 136 34"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="20"
                  strokeLinecap="round"
                />
                
                {/* Red segment */}
                <path
                  d="M 136 34 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="20"
                  strokeLinecap="round"
                />

                {/* Needle */}
                <g transform={`rotate(${gaugeRotation} 100 100)`}>
                  <path
                    d="M 100 100 L 100 30"
                    stroke="#1f2937"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <circle cx="100" cy="100" r="5" fill="#1f2937" />
                </g>
              </svg>

              {/* Center label */}
              <div className="absolute bottom-0 left-0 right-0 text-center pb-4">
                <div className={`text-2xl font-bold ${pressureColor}`}>
                  {pressureLevel}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Suggestions & Calendar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Suggestions */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-cyan-500 text-lg font-semibold mb-4">Suggestions</h3>
              <div className="space-y-3">
                {suggestions.length > 0 ? (
                  suggestions.map((sug, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
                      {sug.text}
                    </div>
                  ))
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-500">
                    You are all caught up! No suggestions at the moment.
                  </div>
                )}
              </div>
            </div>

            {/* Calendar */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <button 
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h3 className="text-lg font-semibold text-gray-800">
                  {format(currentMonth, 'MMMM yyyy')}
                </h3>
                <button 
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                    {day}
                  </div>
                ))}
                
                {days.map((day, i) => {
                  const dayTasks = tasks.filter(t => t.deadline && isSameDay(new Date(t.deadline), day) && !t.completed);
                  const isToday = isSameDay(day, new Date());
                  const isCurrentMonth = day.getMonth() === currentMonth.getMonth();

                  return (
                    <div
                      key={i}
                      className={`aspect-square flex flex-col items-center justify-center text-sm rounded-lg transition
                        ${isToday ? 'bg-blue-500 text-white font-bold' :
                          !isCurrentMonth ? 'text-gray-300' : 
                          dayTasks.length > 0 ? 'text-red-500 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      {day.getDate()}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <p className="text-center mt-8 text-gray-500">
          Stay relaxed. Overlax got your back.
        </p>
      </div>
    </div>
  );
}