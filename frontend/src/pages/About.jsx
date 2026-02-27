export default function About() {
  return (
    <div className="container">
      <div className="page-hero">
        <h1>О проекте</h1>
        <p>Новостник — учебный проект по веб-технологиям</p>
      </div>
      <div className="editor-card" style={{ marginTop: '1rem' }}>
        <p style={{ marginBottom: '1rem' }}>
          Новостник создан в рамках лабораторных работ по веб-технологиям. Реализованы страницы: главная, о проекте, контакты, обратная связь, динамические маршруты статей, работа со статическими файлами, CRUD статей, фильтрация по категориям, комментарии, аутентификация по JWT, REST API и современный фронтенд на React.
        </p>
        <p style={{ color: 'var(--text-muted)' }}>
          Стек: Flask, SQLAlchemy, Flask-Login, JWT, React, React Router.
        </p>
      </div>
    </div>
  )
}
