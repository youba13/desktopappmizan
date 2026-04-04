import { useState } from 'react'
import { Search, Plus, Eye, Trash2, Users } from 'lucide-react'

export default function Clients({ showToast }) {
  const [clients] = useState([
    { id: 1, name: 'أحمد محمد علي', phone: '0550123456', email: 'ahmed@email.com', type: 'individual', caseCount: 3 },
    { id: 2, name: 'شركة النور للتجارة', phone: '021456789', email: 'info@alnoor.com', type: 'company', caseCount: 5 },
    { id: 3, name: 'فاطمة الزهراء', phone: '0661234567', email: '', type: 'individual', caseCount: 1 },
  ])
  const [searchTerm, setSearchTerm] = useState('')

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="البحث بالاسم، الهاتف، أو رقم الهوية..."
                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
          <button 
            onClick={() => showToast('خاصية إضافة موكل جديد قيد التطوير', 'success')}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            موكل جديد
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">الاسم</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">الهاتف</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">النوع</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">عدد القضايا</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="font-bold text-primary-700">{client.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{client.name}</p>
                        <p className="text-sm text-gray-500">{client.email || ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{client.phone}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${client.type === 'company' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {client.type === 'company' ? 'شركة' : 'فرد'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{client.caseCount}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => showToast(`عرض تفاصيل ${client.name}`, 'success')}
                        className="text-primary-600 hover:text-primary-800 p-2 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm('هل أنت متأكد من حذف هذا الموكل؟')) {
                            showToast('تم حذف الموكل', 'success')
                          }
                        }}
                        className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredClients.length === 0 && (
          <div className="empty-state">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">لا يوجد موكلين. أضف موكلك الأول!</p>
          </div>
        )}
      </div>
    </div>
  )
}
