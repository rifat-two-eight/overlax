import { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Download,
  FileText,
  Image,
  Clock,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const isOverdue = (deadline) => {
  return new Date(deadline) < new Date();
};

export default function TaskList({
  tasks,
  selectedCategory,
  loading,
  openAddModal,
  openEditModal,
  handleDeleteTask,
  searchQuery = "",
}) {
  const [expandedTask, setExpandedTask] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false); // Toggle state

  // Filter by search
  const filteredBySearch = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Split tasks
  const activeTasks = filteredBySearch.filter(
    (t) => !t.completed && !isOverdue(t.deadline)
  );

  const completedTasks = filteredBySearch.filter(
    (t) => t.completed || isOverdue(t.deadline)
  );

  // Sort both
  const sortByDeadline = (arr) =>
    [...arr].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  const sortedActive = sortByDeadline(activeTasks);
  const sortedCompleted = sortByDeadline(completedTasks);

  const getFileIcon = (file) =>
    file?.type?.startsWith("image/") ? (
      <Image className="w-4 h-4" />
    ) : (
      <FileText className="w-4 h-4" />
    );

  const getFileUrl = (filePath) =>
    filePath ? `${process.env.NEXT_PUBLIC_API_URL}${filePath}` : null;

  const getPriorityColor = (deadline) => {
    const hoursUntil = (new Date(deadline) - new Date()) / (1000 * 60 * 60);
    if (hoursUntil < 0) return "border-red-500 bg-red-50";
    if (hoursUntil < 24) return "border-orange-500 bg-orange-50";
    if (hoursUntil < 72) return "border-yellow-500 bg-yellow-50";
    return "border-blue-500 bg-blue-50";
  };

  const TaskCard = ({ task, index }) => {
    const overdue = isOverdue(task.deadline);
    const isExpanded = expandedTask === task._id;

    return (
      <div
        key={task._id}
        className={`
          group relative rounded-xl border-l-4 transition-all duration-200
          ${
            overdue
              ? "border-red-500 bg-red-50"
              : getPriorityColor(task.deadline)
          }
          ${
            isExpanded
              ? "shadow-lg scale-[1.02]"
              : "hover:shadow-md hover:scale-[1.01]"
          }
        `}
        style={{ animation: `slideIn 0.3s ease-out ${index * 0.05}s both` }}
      >
        <div className="p-4">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 space-y-2">
              <div className="flex items-start gap-2">
                {task.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                ) : overdue ? (
                  <Clock className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0 animate-pulse" />
                ) : (
                  <Clock className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p
                    className={`font-semibold text-slate-800 ${
                      task.completed ? "line-through text-slate-400" : ""
                    }`}
                  >
                    {task.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                    <span className="px-2 py-1 bg-white rounded-full font-medium text-slate-600 border border-slate-200">
                      {task.category}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full font-medium ${
                        overdue
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {formatDate(task.deadline)} • {formatTime(task.deadline)}
                    </span>
                    {overdue && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full font-semibold animate-pulse">
                        Overdue
                      </span>
                    )}
                    {task.completed && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {task.file && (
                <a
                  href={getFileUrl(task.file.path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 bg-white px-3 py-2 rounded-lg border border-blue-200 hover:border-blue-300 transition-all w-fit group/file mt-2"
                >
                  {getFileIcon(task.file)}
                  <span className="font-medium truncate max-w-[150px]">
                    {task.file.originalName}
                  </span>
                  <Download className="w-3 h-3 group-hover/file:translate-y-0.5 transition-transform" />
                </a>
              )}
            </div>

            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => openEditModal(task)}
                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all hover:scale-110"
                title="Edit"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteTask(task._id)}
                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all hover:scale-110"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Add Button */}
      <button
        onClick={openAddModal}
        className="group w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
      >
        <div className="p-1.5 bg-white/20 rounded-lg group-hover:rotate-90 transition-transform duration-200">
          <Plus className="w-5 h-5" />
        </div>
        <span>Add New Task</span>
      </button>

      {/* Active Tasks Section */}
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
            {selectedCategory} • Upcoming
          </h3>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              {sortedActive.length} active
            </div>
          </div>
        </div>

        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {loading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
            </div>
          )}

          {sortedActive.length === 0 && !loading && (
            <div className="text-center py-12 text-slate-500">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500 opacity-50" />
              <p className="font-medium">No upcoming tasks</p>
              <p className="text-sm">You're all caught up!</p>
            </div>
          )}

          {sortedActive.map((task, i) => (
            <TaskCard key={task._id} task={task} index={i} />
          ))}
        </div>
      </div>

      {/* Completed / Overdue Section – Collapsible */}
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <button
          onClick={() => setShowCompleted(!showCompleted)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Completed & Overdue
          </h3>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
              {sortedCompleted.length} tasks
            </span>
            {showCompleted ? (
              <ChevronUp className="w-5 h-5 text-slate-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-500" />
            )}
          </div>
        </button>

        {showCompleted && (
          <div className="px-6 pb-6 space-y-3 border-t border-slate-200">
            {sortedCompleted.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <p>No completed or overdue tasks</p>
              </div>
            ) : (
              sortedCompleted.map((task, i) => (
                <TaskCard key={task._id} task={task} index={i} />
              ))
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
