import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../api'

const CATEGORIES = ['general', 'python', 'flask', 'web', 'news']

export default function CreateArticle() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [category, setCategory] = useState('general')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!title.trim()) return setError('Введите заголовок')
    if (!text.trim()) return setError('Введите текст статьи')
    setLoading(true)
    const res = await api.createArticle({ title: title.trim(), text: text.trim(), category })
    setLoading(false)
    if (res.ok && res.data) {
      navigate(`/article/${res.data.id}`)
    } else {
      setError(res.data?.error || 'Ошибка создания')
    }
  }

  return (
    <div className="container editor-page">
      <h1>Новая статья</h1>
      <p className="subtitle">Поделитесь своими мыслями с аудиторией</p>

      <div className="editor-card">
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Заголовок *</label>
            <input
              value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Придумайте яркий заголовок…" required
            />
          </div>
          <div className="field">
            <label>Категория</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Текст статьи *</label>
            <textarea
              value={text} onChange={(e) => setText(e.target.value)}
              placeholder="Напишите содержание статьи…" style={{ minHeight: 240 }} required
            />
          </div>
          <div className="editor-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Создаю…' : '✨ Опубликовать'}
            </button>
            <Link to="/" className="btn btn-secondary">Отмена</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
