import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { refreshUser } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 4) return setError('Пароль должен быть не менее 4 символов')
    setLoading(true)
    const res = await api.register(name, email, password)
    setLoading(false)
    if (res.ok) {
      await refreshUser()
      navigate('/')
    } else {
      setError(res.data?.error || 'Ошибка регистрации')
    }
  }

  return (
    <div className="container auth-page">
      <div className="auth-card">
        <h1>Создать аккаунт</h1>
        <p className="subtitle">Присоединяйтесь к нашему блогу</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Имя</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ваше имя" required />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div className="field">
            <label>Пароль</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Минимум 4 символа" required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Создаю…' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="divider" />
        <p className="footer-link">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  )
}
