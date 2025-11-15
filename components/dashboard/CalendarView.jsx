// components/dashboard/CalendarView.jsx
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";

export default function CalendarView({ currentMonth, setCurrentMonth, filteredTasks, setSelectedDate }) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const firstDayOfWeek = monthStart.getDay();
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - firstDayOfWeek);
  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: new Date(monthEnd.getFullYear(), monthEnd.getMonth(), monthEnd.getDate() + (6 - monthEnd.getDay())),
  });

  const hasTaskOnDate = (date) => filteredTasks.some(t => isSameDay(new Date(t.deadline), date));
  const getTaskCountOnDate = (date) => filteredTasks.filter(t => isSameDay(new Date(t.deadline), date)).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">{format(currentMonth, "MMMM yyyy")}</h3>
        <div className="flex gap-2">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1.5 hover:bg-slate-100 rounded-lg"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={() => setCurrentMonth(new Date())} className="px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md">Today</button>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1.5 hover:bg-slate-100 rounded-lg"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-600 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 text-sm">
        {calendarDays.map((date, idx) => {
          const inMonth = isSameMonth(date, currentMonth);
          const today = isSameDay(date, new Date());
          const hasTask = hasTaskOnDate(date);
          const count = getTaskCountOnDate(date);
          return (
            <button
              key={idx}
              onClick={() => inMonth && setSelectedDate(date)}
              disabled={!inMonth}
              className={`aspect-square flex flex-col items-center justify-center rounded-xl transition-all
                ${!inMonth ? "text-slate-300 pointer-events-none" : ""}
                ${today ? "bg-[#0084FF] text-white font-bold shadow-md" : ""}
                ${hasTask && !today ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-slate-100"}
                ${hasTask ? "relative" : ""}
              `}
            >
              <span>{format(date, "d")}</span>
              {hasTask && !today && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                  {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                    <div key={i} className="w-1 h-1 bg-[#0084FF] rounded-full" />
                  ))}
                  {count > 3 && <span className="text-[10px] font-bold text-[#0084FF]">+{count - 3}</span>}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}