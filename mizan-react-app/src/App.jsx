import { useState, useEffect } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Clients from './components/Clients'
import Cases from './components/Cases'
import Calendar from './components/Calendar'
import Documents from './components/Documents'
import Finance from './components/Finance'
import AIAssistant from './components/AIAssistant'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Toast from './components/Toast'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentSection, setCurrentSection] = useState('dashboard')
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  // Check for saved session on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('mizan_auth')
    if (savedAuth) {
      setIsLoggedIn(true)
    }
  }, [])

  const handleLogin = (credentials) => {
    localStorage.setItem('mizan_auth', JSON.stringify(credentials))
    setIsLoggedIn(true)
    showToast('تم تسجيل الدخول بنجاح', 'success')
  }

  const handleLogout = () => {
    localStorage.removeItem('mizan_auth')
    setIsLoggedIn(false)
    setCurrentSection('dashboard')
    showToast('تم تسجيل الخروج', 'success')
  }

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
  }

  const renderSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return <Dashboard showToast={showToast} />
      case 'clients':
        return <Clients showToast={showToast} />
      case 'cases':
        return <Cases showToast={showToast} />
      case 'calendar':
        return <Calendar showToast={showToast} />
      case 'documents':
        return <Documents showToast={showToast} />
      case 'finance':
        return <Finance showToast={showToast} />
      case 'ai-assistant':
        return <AIAssistant showToast={showToast} />
      default:
        return <Dashboard showToast={showToast} />
    }
  }

  if (!isLoggedIn) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <Toast {...toast} />
      </>
    )
  }

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden" dir="rtl">
      <Sidebar 
        currentSection={currentSection} 
        onSectionChange={setCurrentSection}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title={currentSection}
          onQuickAdd={() => showToast('خاصية الإضافة السريعة قيد التطوير', 'success')}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {renderSection()}
        </main>
      </div>
      <Toast {...toast} />
    </div>
  )
}

export default App
