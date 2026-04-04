export default function Toast({ show, message, type = 'success' }) {
  if (!show) return null

  return (
    <div className={`toast ${type} ${show ? 'show' : ''}`}>
      {message}
    </div>
  )
}
