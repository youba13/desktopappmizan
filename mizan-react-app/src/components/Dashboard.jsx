import { Briefcase, Users, Calendar, Banknote, TrendingUp, AlertCircle } from 'lucide-react'

export default function Dashboard({ showToast }) {
  const stats = [
    { label: 'القضايا المفتوحة', value: '24', change: '+12%', icon: Briefcase, color: 'primary', trend: 'up' },
    { label: 'الموكلين', value: '48', change: '', icon: Users, color: 'gold' },
    { label: 'جلسات هذا الأسبوع', value: '8', change: '3 غداً', icon: Calendar, color: 'purple', alert: true },
    { label: 'المستحقات (دج)', value: '125,000', change: '', icon: Banknote, color: 'green' },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          const colors = {
            primary: 'bg-primary-100 text-primary-600',
            gold: 'bg-gold-100 text-gold-600',
            purple: 'bg-purple-100 text-purple-600',
            green: 'bg-green-100 text-green-600',
          }
          
          return (
            <div key={index} className="bg-white rounded-xl p-6 card-hover border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                  <p className={`text-3xl font-bold text-${stat.color}-600`}>{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${colors[stat.color]} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              {stat.change && (
                <p className={`text-xs mt-2 flex items-center gap-1 ${stat.alert ? 'text-red-600' : stat.trend === 'up' ? 'text-green-600' : 'text-gray-500'}`}>
                  {stat.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                  {stat.alert && <AlertCircle className="w-3 h-3" />}
                  {stat.change}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-bold text-lg">الجلسات القادمة</h3>
            <button 
              onClick={() => showToast('عرض جميع الجلسات', 'success')}
              className="text-primary-600 text-sm hover:underline"
            >
              عرض الكل
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-700">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">قضية رقم 245/2024</p>
                <p className="text-sm text-gray-500">غداً، 09:00 صباحاً - المحكمة الابتدائية</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-700">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">قضية رقم 312/2024</p>
                <p className="text-sm text-gray-500">بعد غد، 11:30 صباحاً - مجلس القضاء</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-bold text-lg">أحدث القضايا</h3>
            <button 
              onClick={() => showToast('عرض جميع القضايا', 'success')}
              className="text-primary-600 text-sm hover:underline"
            >
              عرض الكل
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">قضية تجارية - شركة النور</p>
                <p className="text-sm text-gray-500">رقم 245/2024</p>
              </div>
              <span className="badge status-open">مفتوحة</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">قضية عقارية - أحمد محمد</p>
                <p className="text-sm text-gray-500">رقم 198/2024</p>
              </div>
              <span className="badge status-pending">قيد الانتظار</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
