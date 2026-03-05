import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="header-logo" style={{ textDecoration: 'none' }}>
          News Hub
        </Link>

        <nav className="header-nav">
          <NavLink to="/" end className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            Главная
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            О проекте
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            Контакты
          </NavLink>
          <NavLink to="/feedback" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            Обратная связь
          </NavLink>
          {user && (
            <NavLink to="/create" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
              + Статья
            </NavLink>
          )}
        </nav>

        <div className="header-user">
          {user ? (
            <>
              <div className="header-avatar" title={user.name}>
                {user.name[0].toUpperCase()}
              </div>
              <span style={{ fontSize: '.9rem' }}>{user.name}</span>
              <button className="btn-ghost" onClick={handleLogout}>
                Выйти
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav-link">
                Войти
              </NavLink>
              <Link to="/register" className="btn-ghost" style={{ textDecoration: 'none' }}>
                Регистрация
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
