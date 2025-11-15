// components/dashboard/CategoryModal.jsx
import { X } from "lucide-react";

export default function CategoryModal({ isOpen, onClose, isEdit, name, setName, handleSubmit }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{isEdit ? "Edit Category" : "Add Category"}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-600" /></button>
        </div>
        <input type="text" placeholder="Category Name" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0084FF]" />
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-3 bg-slate-100 rounded-lg hover:bg-slate-200 font-medium">Cancel</button>
          <button onClick={handleSubmit} className="flex-1 py-3 bg-gradient-to-r from-[#039BE5] to-[#0288d1] text-white rounded-lg hover:shadow-lg font-medium">
            {isEdit ? "Save" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}