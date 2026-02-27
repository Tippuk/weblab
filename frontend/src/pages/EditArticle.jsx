import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../api'

const CATEGORIES = ['general', 'python', 'flask', 'web', 'news']

export default function EditArticle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [category, setCategory] = useState('general')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    api.getArticle(id).then((res) => {
      if (res.ok && res.data) {
        setTitle(res.data.title || '')
        setText(res.data.text || '')
        setCategory(res.data.category || 'general')
      } else {
        setError('Статья не найдена')
      }
      setLoading(false)
    })
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!title.trim()) return setError('Введите заголовок')
    setSaving(true)
    const res = await api.updateArticle(id, { title: title.trim(), text: text.trim(), category })
    setSaving(false)
    if (res.ok) {
      navigate(`/article/${id}`)
    } else {
      setError(res.data?.error || 'Ошибка сохранения')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Удалить эту статью? Это действие нельзя отменить.')) return
    setDeleting(true)
    const res = await api.deleteArticle(id)
    setDeleting(false)
    if (res.ok) navigate('/')
    else setError(res.data?.error || 'Ошибка удаления')
  }

  if (loading) {
    return (
      <div className="container editor-page">
        <div className="skeleton" style={{ height: 36, width: '40%', marginBottom: '2rem' }} />
        <div className="editor-card">
          {[200, 100, 300].map((h, i) => (
            <div key={i} className="skeleton" style={{ height: h, marginBottom: '1.25rem' }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container editor-page">
      <h1>Редактировать статью</h1>
      <p className="subtitle">Внесите изменения и сохраните</p>

      <div className="editor-card">
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Заголовок *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
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
            <textarea value={text} onChange={(e) => setText(e.target.value)} style={{ minHeight: 240 }} required />
          </div>
          <div className="editor-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Сохраняю…' : '💾 Сохранить'}
            </button>
            <Link to={`/article/${id}`} className="btn btn-secondary">Отмена</Link>
            <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={deleting}
              style={{ marginLeft: 'auto' }}>
              {deleting ? 'Удаляю…' : '🗑 Удалить статью'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
