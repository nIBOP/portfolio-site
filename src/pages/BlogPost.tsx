import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Frontmatter = { slug: string; title: string; summary?: string }

const rawFiles = import.meta.glob('../content/*.md', { eager: true, as: 'raw' }) as Record<string, string>

function parseFrontmatter(markdown: string): { fm: Frontmatter | null; body: string } {
  const trimmed = markdown.trimStart()
  if (!trimmed.startsWith('---')) return { fm: null, body: markdown }
  const end = trimmed.indexOf('\n---')
  if (end === -1) return { fm: null, body: markdown }
  const header = trimmed.slice(3, end).trim()
  const body = trimmed.slice(end + 4).trimStart()
  const fm: Partial<Frontmatter> = {}
  header.split('\n').forEach((line) => {
    const idx = line.indexOf(':')
    if (idx === -1) return
    const key = line.slice(0, idx).trim()
    const value = line.slice(idx + 1).trim().replace(/^"|^'|"$|'$/g, '')
    // @ts-expect-error узкий парсер YAML
    fm[key] = value
  })
  if (!fm.slug || !fm.title) return { fm: null, body }
  return { fm: fm as Frontmatter, body }
}

function getBySlug(target: string | undefined): { title: string; body: string } | null {
  if (!target) return null
  for (const [, content] of Object.entries(rawFiles)) {
    const { fm, body } = parseFrontmatter(content)
    if (fm && fm.slug === target) {
      return { title: fm.title || target, body }
    }
  }
  return null
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const post = getBySlug(slug)

  return (
    <div className="page">
      <div className="top-actions">
        <div className="top-actions__row">
          <Link to="/blog" className="link">← К списку статей</Link>
          <Link to="/" aria-label="На главную" className="blog__home-btn">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 16C9.85038 16.6303 10.8846 17 12 17C13.1154 17 14.1496 16.6303 15 16" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21.6359 12.9579L21.3572 14.8952C20.8697 18.2827 20.626 19.9764 19.451 20.9882C18.2759 22 16.5526 22 13.1061 22H10.8939C7.44737 22 5.72409 22 4.54903 20.9882C3.37396 19.9764 3.13025 18.2827 2.64284 14.8952L2.36407 12.9579C1.98463 10.3208 1.79491 9.00229 2.33537 7.87495C2.87583 6.7476 4.02619 6.06234 6.32691 4.69181L7.71175 3.86687C9.80104 2.62229 10.8457 2 12 2C13.1543 2 14.199 2.62229 16.2882 3.86687L17.6731 4.69181C19.9738 6.06234 21.1242 6.7476 21.6646 7.87495" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </div>
      <section className="section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0 }}>{post ? post.title : 'Статья не найдена'}</h1>
        </div>
        {post ? (
          <div style={{ marginTop: 16 }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
          </div>
        ) : (
          <p style={{ marginTop: 16 }}>Проверьте ссылку или вернитесь в блог.</p>
        )}
      </section>
    </div>
  )
}
