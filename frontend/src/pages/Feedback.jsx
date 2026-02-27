import { useState } from 'react'
import { api } from '../api'

export default function Feedback() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await api.postFeedback(name.trim(), email.trim(), message.trim())
    setLoading(false)
    if (res.ok && res.data) {
      setSubmitted(res.data.data || { name, email, message })
      setName('')
      setEmail('')
      setMessage('')
    } else {
      setError(res.data?.error || 'Ошибка отправки')
    }
  }

  return (
    <div className="container">
      <div className="page-hero">
        <h1>Обратная связь</h1>
        <p>Отправьте сообщение — мы ответим</p>
      </div>

      <div className="editor-card" style={{ maxWidth: '520px', marginTop: '1rem' }}>
        {submitted ? (
          <div className="alert alert-success">
            <p style={{ marginBottom: '0.5rem' }}>Спасибо! Ваше сообщение отправлено.</p>
            <dl className="submitted-data" style={{ marginTop: '1rem' }}>
              <dt style={{ fontWeight: 600, marginTop: '0.5rem' }}>Имя:</dt>
              <dd style={{ margin: '0.25rem 0 0 1rem' }}>{submitted.name}</dd>
              <dt style={{ fontWeight: 600, marginTop: '0.5rem' }}>Email:</dt>
              <dd style={{ margin: '0.25rem 0 0 1rem' }}>{submitted.email}</dd>
              <dt style={{ fontWeight: 600, marginTop: '0.5rem' }}>Сообщение:</dt>
              <dd style={{ margin: '0.25rem 0 0 1rem' }}>{submitted.message}</dd>
            </dl>
            <button type="button" className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }} onClick={() => setSubmitted(null)}>
              Отправить ещё
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="field">
              <label>Имя *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="field">
              <label>Email *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="field">
              <label>Сообщение *</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Отправка…' : 'Отправить'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
