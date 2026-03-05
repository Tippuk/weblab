import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatDateTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const CATEGORIES = ['python', 'flask', 'web', 'news', 'general']
function getBadgeClass(cat) {
  const c = CATEGORIES.includes(cat) ? cat : 'general'
  return `badge badge-${c}`
}

export default function Article() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [article, setArticle] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [commentName, setCommentName] = useState('')
  const [commentText, setCommentText] = useState('')
  const [commentError, setCommentError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let alive = true
    const load = async () => {
      setLoading(true)
      const [artRes, comRes] = await Promise.all([api.getArticle(id), api.getComments(id)])
      if (!alive) return
      if (artRes.ok && artRes.data) setArticle(artRes.data)
      if (comRes.ok && comRes.data) setComments(comRes.data.comments || [])
      setLoading(false)
    }
    load()
    return () => { alive = false }
  }, [id])

  const handleDelete = async () => {
    if (!confirm('Удалить статью?')) return
    const res = await api.deleteArticle(id)
    if (res.ok) navigate('/')
  }

  const handleComment = async (e) => {
    e.preventDefault()
    setCommentError('')
    if (!commentName.trim()) return setCommentError('Укажите имя')
    if (!commentText.trim()) return setCommentError('Введите комментарий')
    setSubmitting(true)
    const res = await api.addComment(id, commentText.trim(), commentName.trim())
    setSubmitting(false)
    if (res.ok && res.data) {
      setComments((prev) => [...prev, res.data])
      setCommentText('')
    } else {
      setCommentError(res.data?.error || 'Ошибка отправки')
    }
  }

  if (loading) {
    return (
      <div className="container article-page">
        <div className="skeleton" style={{ height: 28, width: '30%', marginBottom: '1rem' }} />
        <div className="skeleton" style={{ height: 48, width: '85%', marginBottom: '.75rem' }} />
        <div className="skeleton" style={{ height: 20, width: '50%', marginBottom: '2rem' }} />
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 16, marginBottom: '.6rem' }} />)}
      </div>
    )
  }

  if (!article) {
    return (
      <div className="container">
        <div className="empty-state">
          <div className="empty-icon">😕</div>
          <h3>Статья не найдена</h3>
          <p><Link to="/">Вернуться на главную</Link></p>
        </div>
      </div>
    )
  }

  return (
    <div className="container article-page">
      <div className="breadcrumb">
        <Link to="/">Главная</Link>
        <span className="breadcrumb-sep" />
        <span>{article.title}</span>
      </div>

      <header className="article-page-header">
        <div className="tag-row">
          <span className={getBadgeClass(article.category)}>{article.category || 'general'}</span>
        </div>
        <h1 className="article-page-title">{article.title}</h1>
        <div className="article-page-meta">
          {article.author_name && (
            <>
              <div className="header-avatar" style={{ width: 26, height: 26, fontSize: '.75rem' }}>
                {article.author_name[0].toUpperCase()}
              </div>
              <span>{article.author_name}</span>
            </>
          )}
          <span className="meta-dot">{formatDate(article.created_date)}</span>
        </div>
        {user && (
          <div className="article-actions">
            <Link to={`/edit/${id}`} className="btn btn-secondary btn-sm">✏️ Редактировать</Link>
            <button className="btn btn-danger btn-sm" onClick={handleDelete}>🗑 Удалить</button>
          </div>
        )}
      </header>

      <div className="article-divider" />
      <div className="article-page-body">{article.text}</div>

      <section className="comments-section">
        <h2>Комментарии ({comments.length})</h2>

        {comments.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Пока нет комментариев. Будьте первым!</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="comment">
              <div className="comment-header">
                <div className="comment-avatar">{c.author_name[0].toUpperCase()}</div>
                <span className="comment-author">{c.author_name}</span>
                <span className="comment-date">{formatDateTime(c.date)}</span>
              </div>
              <p className="comment-text">{c.text}</p>
            </div>
          ))
        )}

        <div className="comment-form">
          <h3>💬 Оставить комментарий</h3>
          {commentError && <div className="alert alert-error">{commentError}</div>}
          <form onSubmit={handleComment}>
            <div className="field">
              <label>Ваше имя</label>
              <input value={commentName} onChange={(e) => setCommentName(e.target.value)} required />
            </div>
            <div className="field">
              <label>Комментарий</label>
              <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Отправка…' : 'Отправить'}
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
