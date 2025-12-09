import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

// Date utility functions
const formatMonth = (date) => {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

const formatDay = (date) => {
  return date.getDate();
};

const isSameDay = (date1, date2) => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

const isSameMonth = (date1, date2) => {
  return (
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

const addMonths = (date, months) => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
};

const startOfMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

const endOfMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

// ADD THIS: Check if task is overdue
const isOverdue = (deadline) => {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
};

export default function CalendarView({
  currentMonth,
  setCurrentMonth,
  filteredTasks,
  setSelectedDate,
}) {
  const [hoveredDate, setHoveredDate] = useState(null);
  const [animating, setAnimating] = useState(false);

  // FILTER ACTIVE TASKS ONLY (exclude completed & overdue)
  const activeTasks = filteredTasks.filter(
    (t) => !t.completed && !isOverdue(t.deadline)
  );

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const firstDayOfWeek = monthStart.getDay();

  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - firstDayOfWeek);

  const calendarDays = [];
  const endDate = new Date(monthEnd);
  endDate.setDate(endDate.getDate() + (6 - monthEnd.getDay()));

  for (
    let day = new Date(startDate);
    day <= endDate;
    day.setDate(day.getDate() + 1)
  ) {
    calendarDays.push(new Date(day));
  }

  const hasTaskOnDate = (date) =>
    activeTasks.some((t) => isSameDay(new Date(t.deadline), date));

  const getTaskCountOnDate = (date) =>
    activeTasks.filter((t) => isSameDay(new Date(t.deadline), date)).length;

  const getTasksForDate = (date) =>
    activeTasks.filter((t) => isSameDay(new Date(t.deadline), date));

  const handleMonthChange = (direction) => {
    setAnimating(true);
    setCurrentMonth(addMonths(currentMonth, direction));
    setTimeout(() => setAnimating(false), 300);
  };

  return (
    <div className="bg-linear-to-br from-white to-blue-50 rounded-2xl shadow-lg border border-blue-100 p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-30 -mr-16 -mt-16" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500 rounded-lg">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold bg-[#039BE5] bg-clip-text text-transparent">
            {formatMonth(currentMonth)}
          </h3>
        </div>

        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-sm">
          <button
            onClick={() => handleMonthChange(-1)}
            className="p-2 hover:bg-blue-100 rounded-lg transition-all duration-200 hover:scale-110"
          >
            <ChevronLeft className="w-5 h-5 text-blue-600" />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-4 py-2 text-sm font-semibold text-[#039BE5] hover:bg-blue-50 rounded-lg transition-all"
          >
            Today
          </button>
          <button
            onClick={() => handleMonthChange(1)}
            className="p-2 hover:bg-blue-100 rounded-lg transition-all duration-200 hover:scale-110"
          >
            <ChevronRight className="w-5 h-5 text-blue-600" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 mb-3">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              {day}
            </span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div
        className={`grid grid-cols-7 gap-2 transition-opacity duration-300 ${
          animating ? "opacity-50" : "opacity-100"
        }`}
      >
        {calendarDays.map((date, idx) => {
          const inMonth = isSameMonth(date, currentMonth);
          const today = isSameDay(date, new Date());
          const hasTask = hasTaskOnDate(date);
          const count = getTaskCountOnDate(date);
          const tasks = getTasksForDate(date);
          const isHovered = hoveredDate && isSameDay(hoveredDate, date);

          return (
            <div
              key={idx}
              className="relative"
              onMouseEnter={() => setHoveredDate(date)}
              onMouseLeave={() => setHoveredDate(null)}
            >
              <button
                onClick={() => inMonth && hasTask && setSelectedDate(date)}
                disabled={!inMonth || !hasTask}
                className={`
                  w-full aspect-square flex flex-col items-center justify-center rounded-xl
                  transition-all duration-200 relative group
                  ${!inMonth ? "text-slate-300 pointer-events-none" : ""}
                  ${
                    today
                      ? "bg-purple-500 text-white font-bold shadow-lg scale-105"
                      : ""
                  }
                  ${
                    hasTask && !today
                      ? "bg-linear-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-2 border-blue-200 hover:scale-105 shadow-sm"
                      : "hover:bg-slate-50"
                  }
                  ${
                    !hasTask && inMonth && !today
                      ? "hover:border-2 hover:border-dashed hover:border-slate-200"
                      : ""
                  }
                  ${
                    isHovered && hasTask
                      ? "ring-2 ring-blue-400 ring-offset-2"
                      : ""
                  }
                `}
              >
                <span
                  className={`text-sm font-semibold ${
                    today
                      ? "text-white"
                      : hasTask
                      ? "text-blue-700"
                      : "text-slate-600"
                  }`}
                >
                  {formatDay(date)}
                </span>

                {hasTask && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                    {count <= 3 ? (
                      Array.from({ length: count }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${
                            today ? "bg-white" : "bg-blue-500"
                          }`}
                          style={{
                            animation: `pulse 2s ease-in-out infinite ${
                              i * 0.2
                            }s`,
                          }}
                        />
                      ))
                    ) : (
                      <div
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                          today
                            ? "bg-white text-blue-600"
                            : "bg-blue-500 text-white"
                        }`}
                      >
                        {count}
                      </div>
                    )}
                  </div>
                )}

                {/* Hover tooltip */}
                {isHovered && hasTask && (
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-20 w-48 p-2 bg-slate-900 text-white text-xs rounded-lg shadow-xl pointer-events-none">
                    <div className="font-semibold mb-1">
                      {count} upcoming task{count > 1 ? "s" : ""}
                    </div>
                    {tasks.slice(0, 2).map((task, i) => (
                      <div key={i} className="text-slate-300 truncate">
                        • {task.title}
                      </div>
                    ))}
                    {count > 2 && (
                      <div className="text-slate-400 mt-1">
                        +{count - 2} more
                      </div>
                    )}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500" />
          <span className="text-slate-600">Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-slate-600">Upcoming Tasks</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(0.8);
          }
        }
      `}</style>
    </div>
  );
}
