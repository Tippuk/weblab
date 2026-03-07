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
    <div className="auth-page">
      <div className="auth-card-v2">
        <div className="auth-card-header">
          <h1>Создать аккаунт</h1>
          <p>Присоединяйтесь к Новостнику</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label>Имя</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ваше имя" required />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" required />
          </div>
          <div className="field">
            <label>Пароль</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Минимум 4 символа" required />
          </div>
          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? 'Создаю…' : 'Зарегистрироваться'}
          </button>
        </form>

        <p className="auth-footer">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  )
}
