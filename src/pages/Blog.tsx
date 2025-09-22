import { Link, useSearchParams } from 'react-router-dom'

type Frontmatter = { slug: string; title: string; summary?: string }
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

export default function Blog() {
  const [searchParams] = useSearchParams()
  const from = searchParams.get('from')

  return (
    <div className="page">
      <section className="section">
        <h1>Блог</h1>
        {from === 'home' && (
          <p style={{ opacity: 0.8 }}>Вы перешли сюда со ссылок на главной странице.</p>
        )}
        <p>Здесь будут развёрнутые статьи о проектах, заметки и другие материалы.</p>
        <div style={{ marginTop: 16 }}>
          <Link className="link" to="/">← На главную</Link>
        </div>
      </section>

      <section className="section blog">
        <h2>Статьи</h2>
        <div className="blog__grid">
          {posts.map((p) => (
            <article key={p.slug} className="card card--wide">
              <div className="card__content">
                <h3>{p.title}</h3>
                {p.summary && <p>{p.summary}</p>}
                <Link className="link" to={`/blog/${p.slug}`}>Читать</Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
