import { Link, useSearchParams } from 'react-router-dom'
import './Blog.css'

type TagId = 'data-analytics' | 'business-analytics' | 'management' | 'development' | 'data-engineering' | 'business-intelligence' | 'analytics'

// Теги для блога
const tags = [
  { id: 'data-analytics', name: 'Аналитика данных', displayName: 'Аналитика данных', color: '#3b82f6' },
  { id: 'business-analytics', name: 'Бизнес-аналитика', displayName: 'Бизнес-аналитика', color: '#10b981' },
  { id: 'management', name: 'Менеджмент', displayName: 'Менеджмент', color: '#f59e0b' },
  { id: 'development', name: 'Разработка', displayName: 'Разработка', color: '#8b5cf6' },
  { id: 'data-engineering', name: 'Data Engineering', displayName: 'Data Engineering', color: '#ef4444' },
  { id: 'business-intelligence', name: 'Business Intelligence', displayName: 'BI', color: '#06b6d4' },
  { id: 'analytics', name: 'Analytics', displayName: 'Analytics', color: '#84cc16' }
] as const

type Frontmatter = {
  slug: string;
  title: string;
  summary?: string;
  date?: string; // ISO date string e.g. 2025-10-16
  tags?: TagId[]; // Массив тегов
}
const rawFiles = import.meta.glob('../content/*.md', { eager: true, as: 'raw' }) as Record<string, string>

function parseFrontmatter(markdown: string): { fm: Frontmatter | null } {
  const trimmed = markdown.trimStart()
  if (!trimmed.startsWith('---')) return { fm: null }
  const end = trimmed.indexOf('\n---')
  if (end === -1) return { fm: null }
  const header = trimmed.slice(3, end).trim()
  const fm: Partial<Frontmatter> = {}
  header.split('\n').forEach((line) => {
    const idx = line.indexOf(':')
    if (idx === -1) return
    const key = line.slice(0, idx).trim()
    const value = line.slice(idx + 1).trim().replace(/^"|^'|"$|'$/g, '')
    
    // Специальная обработка для массива тегов
    if (key === 'tags') {
      try {
        // Парсим YAML-массив: ['tag1', 'tag2', 'tag3']
        const arrayMatch = value.match(/\[(.*?)\]/)
        if (arrayMatch) {
          const arrayContent = arrayMatch[1]
          const tags = arrayContent
            .split(',')
            .map(tag => tag.trim().replace(/^'|^"|'$|"$/g, ''))
            .filter(tag => tag.length > 0)
          fm[key] = tags as TagId[]
        }
      } catch {
        // Если не удалось распарсить массив, игнорируем
        console.warn('Failed to parse tags array:', value)
      }
    } else {
      // @ts-expect-error узкий парсер YAML
      fm[key] = value
    }
  })
  if (!fm.slug || !fm.title) return { fm: null }
  return { fm: fm as Frontmatter }
}

const posts: Frontmatter[] = Object.values(rawFiles)
  .map((content) => parseFrontmatter(content).fm)
  .filter((fm): fm is Frontmatter => !!fm)
  .sort((a, b) => {
    const ad = a.date ? Date.parse(a.date) : 0
    const bd = b.date ? Date.parse(b.date) : 0
    return bd - ad
  })

export default function Blog() {
  const [searchParams] = useSearchParams()
  const from = searchParams.get('from')
  const selectedTag = searchParams.get('tag') as TagId | null

  const visiblePosts = selectedTag
    ? posts.filter((p) => p.tags?.includes(selectedTag))
    : posts

  return (
    <div className="page blog-page">
      <div className="top-actions">
        <Link 
          to={from === 'home' ? `/?spec=${selectedTag || ''}` : '/'} 
          aria-label="На главную" 
          className="blog__home-btn"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 16C9.85038 16.6303 10.8846 17 12 17C13.1154 17 14.1496 16.6303 15 16" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21.6359 12.9579L21.3572 14.8952C20.8697 18.2827 20.626 19.9764 19.451 20.9882C18.2759 22 16.5526 22 13.1061 22H10.8939C7.44737 22 5.72409 22 4.54903 20.9882C3.37396 19.9764 3.13025 18.2827 2.64284 14.8952L2.36407 12.9579C1.98463 10.3208 1.79491 9.00229 2.33537 7.87495C2.87583 6.7476 4.02619 6.06234 6.32691 4.69181L7.71175 3.86687C9.80104 2.62229 10.8457 2 12 2C13.1543 2 14.199 2.62229 16.2882 3.86687L17.6731 4.69181C19.9738 6.06234 21.1242 6.7476 21.6646 7.87495" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>
      <section className="section">
        <h1>Блог</h1>
        {from === 'home' && (
          <p className="from-home-message">Вы перешли сюда со ссылок на главной странице.</p>
        )}
        <p>Здесь записаны истории проектов, в которых я участвовал и просто интересные истории, которые происходили в моей работе.</p>
      </section>

      <section className="section blog">
        <h2>Статьи</h2>
        <div className="tag-filter-container">
          <span className="tag-filter-label">Фильтр по тегам: </span>
          <Link className="link tag-link" to="/blog">
            Все
          </Link>
          {tags.map((tag) => (
            <Link 
              key={tag.id}
              className="link tag-link" 
              to={`/blog?tag=${tag.id}`} 
              style={{ 
                borderColor: tag.color,
                backgroundColor: selectedTag === tag.id ? tag.color : 'transparent',
                color: selectedTag === tag.id ? 'white' : 'inherit'
              }}
            >
              {tag.displayName}
            </Link>
          ))}
        </div>
        <div className="blog__grid">
          {visiblePosts.map((p) => (
            <article key={p.slug} className="card">
              <div className="card__content">
                <h3>{p.title}</h3>
                {p.summary && <p className="card-summary">{p.summary}</p>}
                <div className="card-meta">
                  {p.tags && p.tags.length > 0 && (
                    <div className="card-tags">
                      {p.tags.map((tagId) => {
                        const tag = tags.find(t => t.id === tagId);
                        return tag ? (
                          <span key={tagId} className="card-tag" style={{ color: tag.color }}>
                            #{tag.displayName}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                  {p.date && <span>{new Date(p.date).toLocaleDateString()}</span>}
                </div>
                <Link className="secondary-button read-button" to={`/blog/${p.slug}`}>
                  Читать
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
