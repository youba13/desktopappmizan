import { Plus, Bell } from 'lucide-react'
import { format } from 'date-fns'
import { arSA } from 'date-fns/locale'

export default function Header({ title, onQuickAdd }) {
  const sectionTitles = {
    dashboard: 'لوحة القيادة',
    clients: 'الموكلين',
    cases: 'القضايا',
    calendar: 'التقويم',
    documents: 'الوثائق',
    finance: 'الأتعاب',
    'ai-assistant': 'المساعد الذكي'
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold font-naskh text-gray-900">
          {sectionTitles[title] || title}
        </h2>
        <p className="text-sm text-gray-500">
          {format(new Date(), 'EEEE، dd MMMM yyyy', { locale: arSA })}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={onQuickAdd}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة سريعة</span>
        </button>
        <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
          <Bell className="w-6 h-6" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>
    </header>
  )
}
