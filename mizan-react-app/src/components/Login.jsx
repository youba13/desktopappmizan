import { useState } from 'react'
import { Scale, LogIn, Eye, EyeOff, Mail, Lock } from 'lucide-react'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('demo@lawyer.dz')
  const [password, setPassword] = useState('demo123')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (email && password) {
      onLogin({ email, name: 'أحمد بن علي' })
    } else {
      setError('الرجاء إدخال البريد الإلكتروني وكلمة المرور')
    }
    setIsLoading(false)
  }

  return (
    <div className="login-container">
      {/* Decorative circles */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl"></div>
      
      <div className="login-card animate-fade-in">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-gold-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform hover:scale-105 transition-transform duration-300">
            <Scale className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold font-naskh text-gray-900 mb-2">ميزان</h1>
          <p className="text-gray-500">نظام إدارة مكاتب المحاماة المتكامل</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pr-10"
                placeholder="example@lawyer.dz"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              كلمة المرور
            </label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pr-10 pl-10"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                جاري تسجيل الدخول...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                تسجيل الدخول
              </>
            )}
          </button>
        </form>

        {/* Demo Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center mb-3">
            للعرض التجريبي: استخدم أي بريد إلكتروني وكلمة مرور
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            نظام آمن ومشفّر
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-6 flex items-center justify-center gap-4 text-sm">
          <a href="#" className="text-primary-600 hover:text-primary-700 transition-colors">
            نسيت كلمة المرور؟
          </a>
          <span className="text-gray-300">|</span>
          <a href="#" className="text-primary-600 hover:text-primary-700 transition-colors">
            إنشاء حساب جديد
          </a>
        </div>
      </div>
    </div>
  )
}
