import { Link } from 'react-router-dom'

export default function Contact() {
  return (
    <div className="container">
      <div className="page-hero">
        <h1>Контакты</h1>
        <p>Свяжитесь с нами</p>
      </div>
      <div className="editor-card" style={{ marginTop: '1rem' }}>
        <p style={{ marginBottom: '1rem' }}>
          Написать нам можно через форму <Link to="/feedback">обратной связи</Link>.
        </p>
        <p><strong>Email:</strong> abubandit@gmail.com</p>
        <p style={{ marginTop: '0.5rem' }}><strong>Адрес:</strong> г. Влидивосток, ул. Цниверситетский проспект, д. 24/4</p>
      </div>
    </div>
  )
}
