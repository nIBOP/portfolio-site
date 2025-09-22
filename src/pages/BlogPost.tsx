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
      <section className="section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0 }}>{post ? post.title : 'Статья не найдена'}</h1>
          <Link className="link" to="/blog">← К списку статей</Link>
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
