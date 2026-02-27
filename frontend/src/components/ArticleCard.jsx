import { Link } from 'react-router-dom'

const CATEGORIES = ['python', 'flask', 'web', 'news', 'general']

function getBadgeClass(cat) {
  const c = CATEGORIES.includes(cat) ? cat : 'general'
  return `badge badge-${c}`
}

function getStripeClass(cat) {
  const c = CATEGORIES.includes(cat) ? cat : 'general'
  return `article-card-top stripe-${c}`
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function ArticleCard({ article }) {
  const excerpt = article.text ? article.text.slice(0, 160) + (article.text.length > 160 ? '…' : '') : ''

  return (
    <Link to={`/article/${article.id}`} className="article-card">
      <div className={getStripeClass(article.category)} />
      <div className="article-card-body">
        <div className="tag-row">
          <span className={getBadgeClass(article.category)}>{article.category || 'general'}</span>
        </div>
        <h3 className="article-card-title">{article.title}</h3>
        {excerpt && <p className="article-card-excerpt">{excerpt}</p>}
        <div className="article-card-meta">
          <span>{formatDate(article.created_date)}</span>
          {article.author_name && (
            <span className="meta-dot">{article.author_name}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
