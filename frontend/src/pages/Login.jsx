import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { refreshUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = new URLSearchParams(location.search).get('redirect') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await api.login(email, password)
    setLoading(false)
    if (res.ok) {
      await refreshUser()
      navigate(from, { replace: true })
    } else {
      setError(res.data?.error || 'Неверный email или пароль')
    }
  }

  return (
    <div className="container auth-page">
      <div className="auth-card">
        <h1>Добро пожаловать</h1>
        <p className="subtitle">Войдите в свой аккаунт, чтобы продолжить</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input
              type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" required
            />
          </div>
          <div className="field">
            <label>Пароль</label>
            <input
              type="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Вхожу…' : 'Войти'}
          </button>
        </form>

        <div className="divider" />
        <p className="footer-link">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
        <p style={{ marginTop: '.5rem', fontSize: '.8rem', color: 'var(--text-light)', textAlign: 'center' }}>
          Тестовые данные: admin@blog.local / admin
        </p>
      </div>
    </div>
  )
}
