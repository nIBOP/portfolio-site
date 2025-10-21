import { Link, useSearchParams } from 'react-router-dom'
import { specializations, getSpecializationDisplayName } from '../config/specializations'

type SpecializationId = 'data-analytics' | 'business-analytics' | 'management' | 'development'

type Frontmatter = {
  slug: string;
  title: string;
  summary?: string;
  date?: string; // ISO date string e.g. 2025-10-16
  specialization?: SpecializationId;
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
    // @ts-expect-error узкий парсер YAML
    fm[key] = value
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
  const specialization = searchParams.get('spec') as SpecializationId | null

  const visiblePosts = specialization
    ? posts.filter((p) => p.specialization === specialization)
    : posts

  return (
    <div className="page">
      <div className="top-actions">
        <Link to="/" aria-label="На главную" className="blog__home-btn">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 16C9.85038 16.6303 10.8846 17 12 17C13.1154 17 14.1496 16.6303 15 16" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21.6359 12.9579L21.3572 14.8952C20.8697 18.2827 20.626 19.9764 19.451 20.9882C18.2759 22 16.5526 22 13.1061 22H10.8939C7.44737 22 5.72409 22 4.54903 20.9882C3.37396 19.9764 3.13025 18.2827 2.64284 14.8952L2.36407 12.9579C1.98463 10.3208 1.79491 9.00229 2.33537 7.87495C2.87583 6.7476 4.02619 6.06234 6.32691 4.69181L7.71175 3.86687C9.80104 2.62229 10.8457 2 12 2C13.1543 2 14.199 2.62229 16.2882 3.86687L17.6731 4.69181C19.9738 6.06234 21.1242 6.7476 21.6646 7.87495" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>
      <section className="section">
        <h1>Блог</h1>
        {from === 'home' && (
          <p style={{ opacity: 0.8 }}>Вы перешли сюда со ссылок на главной странице.</p>
        )}
        <p>Здесь записаны истории проектов, в которых я участвовал и просто интересные истории, которые происходили в моей работе.</p>
      </section>

      <section className="section blog">
        <h2>Статьи</h2>
        <div style={{ marginBottom: 12, opacity: 0.85 }}>
          <span>Фильтр по специализации: </span>
          <Link 
            className="link" 
            to="/blog" 
            style={{ 
              marginRight: 8,
              padding: '4px 8px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '4px',
              display: 'inline-block'
            }}
          >
            Все
          </Link>
          {specializations.map((spec, index) => (
            <Link 
              key={spec.id}
              className="link" 
              to={`/blog?spec=${spec.id}`} 
              style={{ 
                marginRight: index < specializations.length - 1 ? 8 : 0,
                padding: '4px 8px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '4px',
                display: 'inline-block'
              }}
            >
              {spec.displayName}
            </Link>
          ))}
        </div>
        <div className="blog__grid">
          {visiblePosts.map((p) => (
            <article key={p.slug} className="card card--wide">
              <div className="card__content">
                <h3>{p.title}</h3>
                {p.summary && <p>{p.summary}</p>}
                <div style={{ fontSize: 12, opacity: 0.8, margin: '6px 0 10px' }}>
                  {p.date && <span>{new Date(p.date).toLocaleDateString()}</span>}
                  {p.specialization && (
                    <span style={{ marginLeft: 8 }}>
                      · {getSpecializationDisplayName(p.specialization)}
                    </span>
                  )}
                </div>
                <Link className="link" to={`/blog/${p.slug}`}>Читать</Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
