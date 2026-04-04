import { 
  LayoutDashboard, Users, Briefcase, CalendarDays, 
  FileText, Banknote, Sparkles, LogOut, Scale 
} from 'lucide-react'

const menuItems = [
  { id: 'dashboard', label: 'لوحة القيادة', icon: LayoutDashboard },
  { id: 'clients', label: 'الموكلين', icon: Users },
  { id: 'cases', label: 'القضايا', icon: Briefcase },
  { id: 'calendar', label: 'التقويم', icon: CalendarDays },
  { id: 'documents', label: 'الوثائق', icon: FileText },
  { id: 'finance', label: 'الأتعاب', icon: Banknote },
  { id: 'ai-assistant', label: 'المساعد الذكي', icon: Sparkles, special: true },
]

export default function Sidebar({ currentSection, onSectionChange, onLogout }) {
  return (
    <aside className="w-64 bg-dark-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-dark-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-gold-500 rounded-lg flex items-center justify-center">
            <Scale className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-naskh">ميزان</h1>
            <p className="text-xs text-gray-400">v2.0.1</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = currentSection === item.id
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`sidebar-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-right ${
                isActive ? 'active' : ''
              }`}
            >
              <Icon className={`w-5 h-5 ${item.special ? 'text-purple-400' : ''}`} />
              <span>{item.label}</span>
              {item.special && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              )}
            </button>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-dark-700">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-dark-800">
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="font-bold">أ</span>
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">أحمد بن علي</p>
            <p className="text-xs text-gray-400">محامٍ</p>
          </div>
          <button 
            onClick={onLogout}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
