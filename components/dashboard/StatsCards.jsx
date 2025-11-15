// components/dashboard/StatsCards.jsx
import { Clock, Calendar, AlertTriangle } from "lucide-react";
import { isSameDay } from "date-fns";

export default function StatsCards({ filteredTasks }) {
  const todayCount = filteredTasks.filter(t => isSameDay(new Date(t.deadline), new Date())).length;
  const upcomingCount = filteredTasks.filter(t => new Date(t.deadline) > new Date()).length;
  const overdueCount = filteredTasks.filter(t => new Date(t.deadline) < new Date()).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white p-5 rounded-lg shadow-sm border">
        <div className="flex justify-between">
          <div>
            <p className="text-sm text-slate-600">Due Today</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{todayCount}</p>
          </div>
          <Clock className="w-8 h-8 text-orange-500" />
        </div>
      </div>
      <div className="bg-white p-5 rounded-lg shadow-sm border">
        <div className="flex justify-between">
          <div>
            <p className="text-sm text-slate-600">Upcoming</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{upcomingCount}</p>
          </div>
          <Calendar className="w-8 h-8 text-blue-500" />
        </div>
      </div>
      <div className="bg-white p-5 rounded-lg shadow-sm border">
        <div className="flex justify-between">
          <div>
            <p className="text-sm text-slate-600">Overdue</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{overdueCount}</p>
          </div>
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
      </div>
    </div>
  );
}