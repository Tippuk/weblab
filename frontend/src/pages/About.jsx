import { Link } from 'react-router-dom'
import { useState } from 'react'
import { api } from '../api'

export default function About() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await api.postFeedback(name.trim(), email.trim(), message.trim())
    setLoading(false)
    if (res.ok) {
      setSubmitted(true)
      setName('')
      setEmail('')
      setMessage('')
    } else {
      setError(res.data?.error || 'Ошибка отправки')
    }
  }

  return (
    <div className="container info-page">

      {/* О проекте */}
      <section className="info-card">
        <h1 className="info-card-title">О проекте</h1>
        <p className="info-text">
          Добро пожаловать в Новостник — блог, посвящённый IT-новостям, веб-разработке и программированию.
          Проект создан как лабораторная работа по веб-технологиям.
        </p>
        <p className="info-text">
          Цель — собрать в одном месте полезные статьи о Python, Flask, React, CSS и других технологиях.
          Здесь вы найдёте статьи с хабра, немного кривые, но все же.
        </p>
        <p className="info-text">
          Стек проекта: Flask + SQLAlchemy на бэкенде, React + Vite на фронтенде. Авторизация через JWT-токены.
        </p>
      </section>

      {/* Контакты */}
      <section className="info-card">
        <h2 className="info-card-title">Контактная информация</h2>
        <div className="contact-grid">
          <div className="contact-col">
            <h3 className="contact-subtitle">Связаться</h3>
            <div className="contact-row">
              <span className="contact-icon">✉</span>
              <span>abubandit@gmail.com</span>
            </div>
            <div className="contact-row">
              <span className="contact-icon">📍</span>
              <span>г. Владивосток, ул. Университетский проспект, д. 24/4</span>
            </div>
          </div>
          <div className="contact-col">
            <h3 className="contact-subtitle">Навигация</h3>
            <div className="contact-links">
              <Link to="/">Главная</Link>
              <Link to="/feedback">Обратная связь</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Обратная связь */}
      <section className="info-card">
        <h2 className="info-card-title">Обратная связь</h2>
        <p className="info-text" style={{ marginBottom: '1.5rem' }}>
          Нашли ошибку, есть предложение или просто хотите написать? Заполните форму ниже.
        </p>

        {submitted ? (
          <div className="alert alert-success">
            <p>Спасибо! Ваше сообщение отправлено.</p>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ marginTop: '1rem' }}
              onClick={() => setSubmitted(false)}
            >
              Отправить ещё
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="feedback-row">
              <div className="field">
                <label>Имя</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Иван Иванов" required />
              </div>
              <div className="field">
                <label>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ivan@example.com" required />
              </div>
            </div>
            <div className="field">
              <label>Сообщение</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} placeholder="Ваше сообщение..." required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Отправка…' : '➤ Отправить'}
            </button>
          </form>
        )}
      </section>
    </div>
  )
}
