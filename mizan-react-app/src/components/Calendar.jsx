import { useState } from 'react'
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, isSameMonth, isToday } from 'date-fns'
import { arSA } from 'date-fns/locale'

export default function Calendar({ showToast }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  
  // Sample hearings data
  const hearings = [
    { date: format(new Date(), 'yyyy-MM-dd'), title: 'قضية رقم 245/2024', time: '09:00' },
    { date: format(new Date(Date.now() + 86400000), 'yyyy-MM-dd'), title: 'قضية رقم 312/2024', time: '11:30' },
  ]

  const changeMonth = (delta) => {
    setCurrentMonth(addMonths(currentMonth, delta))
  }

  const getHearingsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return hearings.filter(h => h.date === dateStr)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => changeMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <h3 className="text-xl font-bold font-naskh">
            {format(currentMonth, 'MMMM yyyy', { locale: arSA })}
          </h3>
          <button 
            onClick={() => changeMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center">
          {['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map(day => (
            <div key={day} className="text-sm font-medium text-gray-500 py-2">{day}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for days before month starts */}
          {Array(monthStart.getDay()).fill(null).map((_, i) => (
            <div key={`empty-${i}`}></div>
          ))}
          
          {/* Days of the month */}
          {days.map((day) => {
            const dayHearings = getHearingsForDate(day)
            const today = isToday(day)
            
            return (
              <div
                key={day.toISOString()}
                onClick={() => {
                  if (dayHearings.length > 0) {
                    showToast(`${format(day, 'dd MMMM', { locale: arSA })}: ${dayHearings.length} جلسات`, 'success')
                  }
                }}
                className={`aspect-square border rounded-lg p-2 cursor-pointer transition-all ${
                  today 
                    ? 'bg-primary-50 border-primary-500' 
                    : 'hover:bg-gray-50 border-gray-200'
                } ${!isSameMonth(day, currentMonth) ? 'opacity-30' : ''}`}
              >
                <span className={`text-sm font-medium ${today ? 'text-primary-700' : 'text-gray-700'}`}>
                  {format(day, 'd')}
                </span>
                {dayHearings.length > 0 && (
                  <div className="mt-1 space-y-1">
                    {dayHearings.map((hearing, idx) => (
                      <div key={idx} className="w-2 h-2 bg-red-500 rounded-full"></div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-6 border-t border-gray-200 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-600">جلسة مقررة</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary-100 border border-primary-500 rounded"></div>
            <span className="text-gray-600">اليوم</span>
          </div>
        </div>
      </div>

      {/* Upcoming Hearings List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary-600" />
            الجلسات القادمة
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {hearings.map((hearing, idx) => (
            <div key={idx} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-700">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{hearing.title}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(hearing.date), 'EEEE، dd MMMM yyyy', { locale: arSA })} • {hearing.time}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
