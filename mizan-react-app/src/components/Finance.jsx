import { Banknote, TrendingUp, ArrowDownLeft } from 'lucide-react'

export default function Finance({ showToast }) {
  const cases = [
    { id: 1, title: 'قضية تجارية - شركة النور', clientName: 'شركة النور للتجارة', agreedFee: 50000, paidFee: 30000 },
    { id: 2, title: 'قضية عقارية', clientName: 'أحمد محمد علي', agreedFee: 75000, paidFee: 75000 },
    { id: 3, title: 'قضية عمالية', clientName: 'فاطمة الزهراء', agreedFee: 25000, paidFee: 25000 },
  ]

  const totalFees = cases.reduce((sum, c) => sum + c.agreedFee, 0)
  const totalPaid = cases.reduce((sum, c) => sum + c.paidFee, 0)
  const totalRemaining = totalFees - totalPaid

  const payments = cases.filter(c => c.paidFee > 0).map(c => ({
    case: c,
    amount: c.paidFee,
  }))

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">إجمالي الأتعاب</h3>
            <Banknote className="w-8 h-8 text-primary-600" />
          </div>
          <p className="text-3xl font-bold text-primary-600">{totalFees.toLocaleString()} دج</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">المحصّل</h3>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">{totalPaid.toLocaleString()} دج</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">المتبقي</h3>
            <ArrowDownLeft className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-600">{totalRemaining.toLocaleString()} دج</p>
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-bold text-lg">سجل المدفوعات</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {payments.length > 0 ? (
            payments.map((payment, idx) => (
              <div key={idx} className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700">
                    <ArrowDownLeft className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{payment.case.title}</p>
                    <p className="text-sm text-gray-500">{payment.case.clientName}</p>
                  </div>
                </div>
                <p className="font-bold text-green-600">{payment.amount.toLocaleString()} دج</p>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">لا توجد مدفوعات مسجلة</div>
          )}
        </div>
      </div>
    </div>
  )
}
