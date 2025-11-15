// components/dashboard/TaskModal.jsx
import { X, Paperclip } from "lucide-react";

export default function TaskModal({ 
  isOpen, onClose, isEdit, task, 
  title, setTitle, category, setCategory, deadline, setDeadline, 
  file, setFile, existingFile, categories, handleSubmit 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{isEdit ? "Edit Task" : "Add New Task"}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-600" /></button>
        </div>
        <div className="space-y-4">
          <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0084FF]" />
          <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0084FF]">
            <option value="">Select Category</option>
            {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
          </select>
          <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0084FF]" />
          <div className="flex items-center gap-2">
            <Paperclip className="w-5 h-5 text-slate-500" />
            <input type="file" accept="image/*,.pdf" onChange={e => setFile(e.target.files[0] || null)} className="flex-1 text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-[#039BE5] file:text-white hover:file:bg-[#0288d1]" />
          </div>
          {existingFile && !file && <p className="text-xs text-slate-600">Current: {existingFile.originalName}</p>}
          {file && <p className="text-xs text-green-600">New: {file.name}</p>}
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-3 bg-slate-100 rounded-lg hover:bg-slate-200 font-medium">Cancel</button>
          <button onClick={handleSubmit} className="flex-1 py-3 bg-gradient-to-r from-[#039BE5] to-[#0288d1] text-white rounded-lg hover:shadow-lg font-medium">
            {isEdit ? "Save Changes" : "Add Task"}
          </button>
        </div>
      </div>
    </div>
  );
}