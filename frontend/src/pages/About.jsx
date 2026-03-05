export default function About() {
  return (
    <div className="container">
      <div className="page-hero">
        <h1>О проекте</h1>
        <p>Новостник — учебный проект по веб-технологиям</p>
      </div>
      <div className="editor-card" style={{ marginTop: '1rem' }}>
        <p style={{ marginBottom: '1rem' }}>
          Новостник — лабораторная работа по веб-технологиям. Простой блог на Flask с регистрацией, статьями и комментариями.
        </p>
        <p style={{ color: 'var(--text-muted)' }}>
          Стек: Flask, SQLAlchemy, JWT, React.
        </p>
      </div>
    </div>
  )
}
