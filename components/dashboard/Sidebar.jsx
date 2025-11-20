import { 
  FolderPlus, Calendar, X, Edit2, Trash2, CheckSquare, 
  BookOpen, User, Briefcase, Hash, MessageCircle, Info 
} from "lucide-react";
import { useState } from "react";

// ADD THIS — iconMap
const iconMap = {
  book: <BookOpen className="w-5 h-5" />,
  user: <User className="w-5 h-5" />,
  briefcase: <Briefcase className="w-5 h-5" />,
  folder: <Hash className="w-5 h-5" />
};

export default function Sidebar({
  categories, 
  tasks, 
  selectedCategory, 
  setSelectedCategory,
  showAddCategoryModal, 
  setShowAddCategoryModal,
  googleConnected, 
  handleGoogleConnect, 
  handleGoogleDisconnect,
  startEditCategory, 
  handleDeleteCategory,
  telegramConnected,
  handleTelegramConnect
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  const allCategories = [
    { name: "All Tasks", icon: <CheckSquare className="w-5 h-5" />, count: tasks.length },
    ...categories.map(c => ({
      name: c.name,
      icon: iconMap[c.icon] || <Hash className="w-5 h-5" />, // ← NOW DEFINED!
      count: tasks.filter(t => t.category === c.name).length,
      _id: c._id,
    })),
  ];


  return (
    <aside
  className="
    bg-white border-r border-slate-200 p-6 space-y-6 

    /* Desktop version */
    lg:fixed lg:top-16 lg:left-0 
    lg:w-80 
    lg:h-[calc(100vh-64px)] 
    lg:overflow-y-auto

    /* Mobile version */
    w-full
  "
>


      {/* ADD CATEGORY */}
      <button 
        onClick={() => setShowAddCategoryModal(true)} 
        className="w-full bg-[#039BE5] hover:bg-[#0288d1] text-white font-semibold py-3 rounded-md flex items-center justify-center gap-2"
      >
        <FolderPlus className="w-5 h-5" /> Add Category
      </button>

      {/* CATEGORIES */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Categories</h2>
        <div className="space-y-2">
          {allCategories.map((cat) => (
            <div key={cat.name} className="flex items-center justify-between">
              <button
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex-1 flex items-center justify-between p-3 rounded-lg transition-all
                  ${selectedCategory === cat.name 
                    ? "bg-[#039BE5] text-white shadow-md" 
                    : "text-slate-700 hover:bg-slate-50"}`}
              >
                <div className="flex items-center gap-3">
                  {cat.icon}
                  <span className="font-medium">{cat.name}</span>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full
                  ${selectedCategory === cat.name 
                    ? "bg-white/30 text-white" 
                    : "bg-slate-200 text-slate-600"}`}>
                  {cat.count}
                </span>
              </button>
              {cat._id && (
                <div className="flex gap-1 ml-2">
                  <button 
                    onClick={() => startEditCategory(cat)} 
                    className="p-1.5 text-slate-600 hover:text-slate-800"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteCategory(cat._id, cat.name)} 
                    className="p-1.5 text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* INTEGRATIONS */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Integrations</h2>

        {/* GOOGLE CALENDAR */}
        <button
          onClick={googleConnected ? handleGoogleDisconnect : handleGoogleConnect}
          className={`w-full flex items-center justify-between p-3 rounded-lg transition-all
            ${googleConnected 
              ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100" 
              : "text-slate-700 hover:bg-slate-50"}`}
        >
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-[#ea4335]" />
            <span className="font-medium">
              {googleConnected ? "Disconnect Google" : "Google Calendar"}
            </span>
          </div>
          {googleConnected ? <X className="w-5 h-5 text-red-600" /> : null}
        </button>

        {/* TELEGRAM ALERTS — PROFESSIONAL */}
        <div className="mt-3 flex items-center justify-between p-3 rounded-lg bg-slate-50">
          <div className="flex items-center gap-3">
            <MessageCircle 
              className={`w-5 h-5 ${telegramConnected ? 'text-green-600' : 'text-slate-400'}`} 
            />
            <span className="font-medium">Telegram Alerts</span>
          </div>

          {/* SMART BUTTON + INFO ICON */}
          <div className="flex items-center gap-2">
            {telegramConnected ? (
              <>
                <span className="text-xs text-green-600 font-medium">
                  Connected
                </span>
                <div className="relative">
                  <button
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    className="p-1 rounded-full hover:bg-slate-200 transition-colors"
                  >
                    <Info className="w-4 h-4 text-slate-500" />
                  </button>

                  {/* TOOLTIP */}
                  {showTooltip && (
                    <div className="absolute right-0 top-8 w-48 p-2 bg-slate-800 text-white text-xs rounded-md shadow-lg z-10">
                      Use <code className="bg-slate-700 px-1 rounded">/stop</code> in Telegram to disconnect
                      <div className="absolute -top-1 right-3 w-2 h-2 bg-slate-800 rotate-45"></div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={handleTelegramConnect}
                className="text-xs text-green-600 hover:text-green-800 font-medium"
              >
                Connect
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}