export default function Pagination({ page, pages, onPage }) {
  if (!pages || pages <= 1) return null

  const items = []
  for (let i = 1; i <= pages; i++) {
    if (
      i === 1 || i === pages ||
      (i >= page - 1 && i <= page + 1)
    ) {
      items.push(i)
    } else if (items[items.length - 1] !== '…') {
      items.push('…')
    }
  }

  return (
    <div className="pagination">
      <button
        className="page-btn"
        onClick={() => onPage(page - 1)}
        disabled={page <= 1}
        aria-label="Назад"
      >
        ←
      </button>

      {items.map((item, idx) =>
        item === '…' ? (
          <span key={idx} className="page-info">…</span>
        ) : (
          <button
            key={item}
            className={`page-btn${item === page ? ' active' : ''}`}
            onClick={() => item !== page && onPage(item)}
          >
            {item}
          </button>
        )
      )}

      <button
        className="page-btn"
        onClick={() => onPage(page + 1)}
        disabled={page >= pages}
        aria-label="Вперёд"
      >
        →
      </button>
    </div>
  )
}
