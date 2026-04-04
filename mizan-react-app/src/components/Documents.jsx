import { useState, useCallback } from 'react'
import { UploadCloud, File, Trash2, Download, Eye, FileText, FileSpreadsheet, Image, Archive } from 'lucide-react'

export default function Documents({ showToast }) {
  const [documents, setDocuments] = useState([
    { id: 1, name: 'عقد_إيجار.pdf', size: 245000, type: 'application/pdf', uploadedAt: new Date().toISOString() },
    { id: 2, name: 'حكم_ابتدائي.docx', size: 128000, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', uploadedAt: new Date().toISOString() },
    { id: 3, name: 'قائمة_المستندات.xlsx', size: 89000, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', uploadedAt: new Date().toISOString() },
  ])
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(null)

  const getFileIcon = (type) => {
    if (type.includes('pdf')) return FileText
    if (type.includes('word') || type.includes('document')) return File
    if (type.includes('excel') || type.includes('spreadsheet')) return FileSpreadsheet
    if (type.includes('image')) return Image
    if (type.includes('zip') || type.includes('archive')) return Archive
    return File
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    uploadFiles(files)
  }, [])

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files)
    uploadFiles(files)
  }

  const uploadFiles = (files) => {
    const maxSize = 50 * 1024 * 1024 // 50MB
    
    for (let file of files) {
      if (file.size > maxSize) {
        showToast(`الملف ${file.name} يتجاوز الحد المسموح (50MB)`, 'error')
        continue
      }

      // Simulate upload progress
      setUploadProgress({ fileName: file.name, progress: 0 })
      
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (!prev) return null
          const newProgress = prev.progress + 20
          if (newProgress >= 100) {
            clearInterval(interval)
            setTimeout(() => setUploadProgress(null), 500)
            
            // Add document to list
            const newDoc = {
              id: Date.now(),
              name: file.name,
              size: file.size,
              type: file.type,
              uploadedAt: new Date().toISOString()
            }
            setDocuments(prev => [newDoc, ...prev])
            showToast(`تم رفع ${file.name} بنجاح`, 'success')
            return null
          }
          return { ...prev, progress: newProgress }
        })
      }, 100)
    }
  }

  const deleteDocument = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الملف؟')) {
      setDocuments(prev => prev.filter(doc => doc.id !== id))
      showToast('تم حذف الملف', 'success')
    }
  }

  const downloadDocument = (doc) => {
    showToast(`جاري تحميل ${doc.name}...`, 'success')
  }

  const previewDocument = (doc) => {
    showToast(`معاينة ${doc.name}`, 'success')
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div 
        className={`file-upload-area ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('fileInput').click()}
      >
        <UploadCloud className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium text-gray-700 mb-2">اسحب الملفات هنا أو انقر للاختيار</p>
        <p className="text-sm text-gray-500">PDF, Word, Excel, Images up to 50MB</p>
        <input 
          type="file" 
          id="fileInput" 
          className="hidden" 
          multiple 
          onChange={handleFileInput}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip"
        />
      </div>

      {/* Upload Progress */}
      {uploadProgress && (
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">{uploadProgress.fileName}</span>
            <span className="text-sm text-gray-500">{uploadProgress.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress.progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Documents Grid */}
      {documents.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-4">الملفات المرفوعة ({documents.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map(doc => {
              const Icon = getFileIcon(doc.type)
              return (
                <div key={doc.id} className="document-card group">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-700 flex-shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(doc.size)}</p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => previewDocument(doc)}
                      className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="معاينة"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => downloadDocument(doc)}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="تحميل"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteDocument(doc.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {documents.length === 0 && !uploadProgress && (
        <div className="empty-state">
          <File className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">لا توجد ملفات مرفوعة بعد</p>
        </div>
      )}
    </div>
  )
}
