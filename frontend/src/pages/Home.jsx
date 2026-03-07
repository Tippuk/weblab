import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { api } from '../api'
import ArticleCard from '../components/ArticleCard'
import Pagination from '../components/Pagination'

const CATEGORIES = ['python', 'flask', 'web', 'news', 'general']

function SkeletonCard() {
  return (
    <div className="article-card" style={{ pointerEvents: 'none' }}>
      <div className="article-card-top stripe-general" />
      <div className="article-card-body" style={{ gap: '.75rem' }}>
        <div className="skeleton" style={{ height: 20, width: '40%' }} />
        <div className="skeleton" style={{ height: 24, width: '90%' }} />
        <div className="skeleton" style={{ height: 14, width: '100%' }} />
        <div className="skeleton" style={{ height: 14, width: '75%' }} />
        <div className="skeleton" style={{ height: 12, width: '50%', marginTop: '.5rem' }} />
      </div>
    </div>
  )
}

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [articles, setArticles] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)

  const query = searchParams.get('q') || ''
  const category = searchParams.get('cat') || ''
  const page = parseInt(searchParams.get('page') || '1', 10)

  const load = useCallback(async () => {
    setLoading(true)
    const params = { page, per_page: 9, q: query }
    if (category) params.category = category
    const res = await api.getArticles(params)
    if (res.ok && res.data) {
      setArticles(res.data.articles || [])
      setPagination(res.data)
    }
    setLoading(false)
  }, [page, query, category])

  useEffect(() => { load() }, [load])

  const [searchInput, setSearchInput] = useState(query)

  const handleSearch = (e) => {
    e.preventDefault()
    setSearchParams({ ...(searchInput ? { q: searchInput } : {}), page: '1' })
  }

  const handleCategory = (cat) => {
    if (cat === category) {
      setSearchParams({ page: '1' })
    } else {
      setSearchParams({ cat: cat, page: '1' })
    }
  }

  const handlePage = (p) => {
    const sp = Object.fromEntries(searchParams)
    setSearchParams({ ...sp, page: String(p) })
  }

  const featured = articles[0]
  const rest = articles.slice(1)

  return (
    <div className="container">
      <div className="page-hero">
        <h1>Новостник</h1>
        <p>Статьи о Python, Flask, веб-разработке и не только</p>
      </div>

      <form className="search-bar" onSubmit={handleSearch}>
        <span className="search-icon">🔍</span>
        <input
          type="search"
          placeholder="Поиск по статьям..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button type="submit" className="btn btn-primary btn-sm">Найти</button>
      </form>

      <div className="category-pills">
        <button className={`pill${!category ? ' active' : ''}`} onClick={() => setSearchParams({ page: '1' })}>
          Все
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`pill${category === cat ? ' active' : ''}`}
            onClick={() => handleCategory(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="articles-grid">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : articles.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>Ничего не найдено</h3>
          <p>Попробуйте изменить запрос или выбрать другую категорию.</p>
        </div>
      ) : (
        <>
          {(() => {
            if (!query && !category && page === 1 && featured) {
              const imgMatch = featured.text ? featured.text.match(/<img[^>]+src=(["'])(.*?)\1/) : null
              const imgSrc = imgMatch ? imgMatch[2] : null

              let cleanText = featured.text ? featured.text.replace(/<[^>]+>/g, ' ') : ''
              cleanText = cleanText.replace(/https?:\/\/[^\s]+/g, '').trim()
              const excerpt = cleanText.slice(0, 200) + (cleanText.length > 200 ? '…' : '')

              return (
                <Link to={`/article/${featured.id}`} className="featured-article" style={{ textDecoration: 'none' }}>
                  <div
                    className={`featured-article-visual stripe-${featured.category || 'general'}`}
                    style={imgSrc ? { backgroundImage: `url(${imgSrc})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                  >
                    {!imgSrc && <span className="featured-article-tag">{featured.category || 'general'}</span>}
                  </div>
                  <div className="featured-article-content">
                    <span className="featured-label">Свежее</span>
                    <h2 className="featured-title">{featured.title}</h2>
                    <p className="featured-meta">{featured.author_name} · {featured.created_date && new Date(featured.created_date).toLocaleDateString('ru-RU')}</p>
                    <p className="featured-excerpt">{excerpt}</p>
                  </div>
                </Link>
              )
            }
            return null
          })()}

          <div className="articles-grid">
            {((!query && !category && page === 1) ? rest : articles).map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </>
      )}

      <Pagination page={pagination?.page || page} pages={pagination?.pages || 0} onPage={handlePage} />
    </div>
  )
}
