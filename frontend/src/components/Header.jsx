import { useState, useRef, useEffect } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    setMenuOpen(false)
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
          {user && (
            <NavLink to="/create" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
              + Статья
            </NavLink>
          )}
        </nav>

        <div className="header-user">
          {user ? (
            <div className="user-dropdown" ref={menuRef}>
              <div
                className="header-avatar"
                title={user.name}
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {user.name[0].toUpperCase()}
              </div>

              {menuOpen && (
                <div className="user-menu">
                  <div className="user-menu-info">
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </div>
                  <div className="user-menu-divider"></div>
                  <button className="user-menu-btn" onClick={handleLogout}>
                    Выйти
                  </button>
                </div>
              )}
            </div>
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
