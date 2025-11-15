// components/dashboard/TaskList.jsx
import { Plus, Edit2, Trash2, Download, FileText, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";

export default function TaskList({ 
  tasks, selectedCategory, loading, 
  openAddModal, openEditModal, handleDeleteTask,
  searchQuery = ""
}) {
  const filteredBySearch = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFileIcon = (file) => file?.type?.startsWith("image/") ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />;

  return (
    <div className="space-y-4">
      <button onClick={openAddModal} className="w-full bg-[#B1BCC1] hover:bg-slate-500 text-white font-medium py-3 rounded-md flex items-center justify-center gap-2">
        <Plus className="w-5 h-5" /> Add Task
      </button>

      <div className="bg-white rounded-lg shadow-sm border p-4 space-y-3 max-h-96 overflow-y-auto">
        <h3 className="font-semibold text-slate-900">{selectedCategory}</h3>
        {loading && <p className="text-sm text-slate-500">Loading…</p>}
        {filteredBySearch.length === 0 && !loading && <p className="text-sm text-slate-500">No tasks found</p>}
        {filteredBySearch.map(task => (
          <div key={task._id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1 space-y-1">
                <p className="font-semibold text-slate-800">{task.title}</p>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span>{task.category}</span>
                  <span>•</span>
                  <span>{format(new Date(task.deadline), "MMM d, yyyy h:mm a")}</span>
                  {task.file && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        {getFileIcon(task.file)}
                        <a href={`http://localhost:5000${task.file.path}`} target="_blank" rel="noopener noreferrer"
                          className="truncate max-w-32 text-blue-600 hover:underline flex items-center gap-1">
                          {task.file.originalName} <Download className="w-3 h-3" />
                        </a>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEditModal(task)} className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDeleteTask(task._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}