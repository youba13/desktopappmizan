import { useState } from 'react'
import { Send, Sparkles, Trash2, MessageSquare } from 'lucide-react'

export default function AIAssistant({ showToast }) {
  const [messages, setMessages] = useState([
    { id: 1, role: 'ai', content: 'أهلاً! أنا مساعد ميزان الذكي. كيف يمكنني مساعدتك اليوم؟' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const suggestions = [
    'ما هي الجلسات القادمة؟',
    'ملخص القضايا المفتوحة',
    'الأتعاب المستحقة',
    'كيف يمكنني إضافة موكل جديد؟'
  ]

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = { id: Date.now(), role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = { 
        id: Date.now() + 1, 
        role: 'ai', 
        content: getAIResponse(input) 
      }
      setMessages(prev => [...prev, aiResponse])
      setIsLoading(false)
    }, 1000)
  }

  const getAIResponse = (question) => {
    const q = question.toLowerCase()
    if (q.includes('جلس')) return '📅 لديك جلستان قادمتان:\n• غداً 09:00 - قضية رقم 245/2024\n• بعد غد 11:30 - قضية رقم 312/2024'
    if (q.includes('قضية') && q.includes('مفتوح')) return '⚖️ لديك 24 قضية مفتوحة حالياً، منها 3 قضايا تجارية و 8 قضايا مدنية.'
    if (q.includes('أتعاب') || q.includes('مستحق')) return '💰 إجمالي الأتعاب المستحقة: 125,000 دج موزعة على 8 قضايا.'
    if (q.includes('موكل') && q.includes('إضافة')) return '👤 لإضافة موكل جديد:\n1. اذهب إلى قسم الموكلين\n2. اضغط على زر "موكل جديد"\n3. أدخل البيانات المطلوبة'
    return 'شكراً لسؤالك! للأسف هذه نسخة تجريبية. للحصول على إجابات ذكية كاملة، يرجى تفعيل خدمة الذكاء الاصطناعي.'
  }

  const clearChat = () => {
    setMessages([{ id: 1, role: 'ai', content: 'تم مسح المحادثة. كيف يمكنني مساعدتك؟' }])
    showToast('تم مسح المحادثة', 'success')
  }

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion)
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">المساعد الذكي</h3>
            <p className="text-xs text-gray-500">مدعوم بالذكاء الاصطناعي</p>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`chat-bubble ${msg.role}`}>
            <p className="whitespace-pre-line">{msg.content}</p>
          </div>
        ))}
        
        {isLoading && (
          <div className="chat-bubble ai">
            <div className="flex items-center gap-1">
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 flex flex-wrap gap-2 border-t border-gray-100">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestionClick(suggestion)}
              className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-primary-100 text-gray-700 hover:text-primary-700 rounded-full transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="اكتب سؤالك هنا..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white p-3 rounded-xl transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
