import { useState } from 'react'
import { Plus, CalendarPlus, Eye } from 'lucide-react'

export default function Cases({ showToast }) {
  const [filter, setFilter] = useState('all')
  const cases = [
    { id: 1, caseNumber: '245/2024', title: 'قضية تجارية - شركة النور', clientId: 1, type: 'commercial', status: 'open', agreedFee: 50000, paidFee: 30000, description: 'نزاع تجاري حول عقد توريد' },
    { id: 2, caseNumber: '198/2024', title: 'قضية عقارية', clientId: 2, type: 'real_estate', status: 'pending', agreedFee: 75000, paidFee: 75000, description: 'خلاف على ملكية عقار' },
    { id: 3, caseNumber: '312/2024', title: 'قضية عمالية', clientId: 3, type: 'civil', status: 'closed', agreedFee: 25000, paidFee: 25000, description: 'قضية تعويضات عمالية' },
  ]

  const filteredCases = filter === 'all' ? cases : cases.filter(c => c.status === filter)

  const getStatusBadge = (status) => {
    const badges = {
      open: { class: 'status-open', text: 'مفتوحة' },
      closed: { class: 'status-closed', text: 'مغلقة' },
      pending: { class: 'status-pending', text: 'قيد الانتظار' }
    }
    return badges[status] || badges.open
  }

  const getTypeName = (type) => {
    const types = {
      civil: 'مدنية', criminal: 'جزائية', family: 'عائلية',
      commercial: 'تجارية', administrative: 'إدارية', real_estate: 'عقارية'
    }
    return types[type] || type
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'الكل' },
              { id: 'open', label: 'مفتوحة' },
              { id: 'pending', label: 'قيد الانتظار' },
              { id: 'closed', label: 'مغلقة' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === tab.id 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button 
            onClick={() => showToast('خاصية إضافة قضية جديدة قيد التطوير', 'success')}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            قضية جديدة
          </button>
        </div>

        {/* Cases List */}
        <div className="divide-y divide-gray-200">
          {filteredCases.map(c => {
            const badge = getStatusBadge(c.status)
            const remaining = c.agreedFee - c.paidFee
            return (
              <div 
                key={c.id} 
                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => showToast(`عرض تفاصيل القضية: ${c.title}`, 'success')}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-bold text-lg text-gray-900">{c.title}</h4>
                      <span className={`badge ${badge.class}`}>{badge.text}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      {c.caseNumber} • {getTypeName(c.type)}
                    </p>
                    <p className="text-gray-600 text-sm mb-3">{c.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-500">
                        الأتعاب: <strong className="text-gray-900">{c.agreedFee.toLocaleString()} دج</strong>
                      </span>
                      <span className="text-gray-500">
                        المتبقي: <strong className={remaining > 0 ? 'text-red-600' : 'text-green-600'}>
                          {remaining.toLocaleString()} دج
                        </strong>
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      showToast('خاصية إضافة جلسة قيد التطوير', 'success')
                    }}
                    className="bg-primary-100 text-primary-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-200 transition-colors flex items-center gap-2"
                  >
                    <CalendarPlus className="w-4 h-4" />
                    جلسة
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredCases.length === 0 && (
          <div className="empty-state py-12">
            <Eye className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">لا توجد قضايا في هذا التصنيف</p>
          </div>
        )}
      </div>
    </div>
  )
}
