import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ContentIconName } from './ContentIcon'
import { blogApi, type PublicBlogPostSummary } from '../lib/api'
import '../styles/blog.css'

function formatDate(value: string | null): string {
  if (!value) return ''
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

type BlogListingSectionProps = {
  heading?: string
  description?: string
}

export default function BlogListingSection({ heading, description }: BlogListingSectionProps) {
  const [posts, setPosts] = useState<PublicBlogPostSummary[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(12)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const response = await blogApi.listPosts({ page, pageSize })
        setPosts(response.posts)
        setTotal(response.total)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load blog posts')
        setPosts([])
        setTotal(0)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [page, pageSize])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <section className="blog-list-section site-blocks-blog-list" aria-label="Blog posts">
      <div className="blog-container">
        {heading ? <h2 className="site-blocks-section-title">{heading}</h2> : null}
        {description ? <p className="site-blocks-section-lead">{description}</p> : null}

        {error && <p className="blog-alert blog-alert--error">{error}</p>}

        {loading ? (
          <p className="blog-muted">Loading articles...</p>
        ) : posts.length === 0 ? (
          <div className="blog-empty">
            <h2>No articles yet</h2>
            <p>Check back soon for new content from our team.</p>
          </div>
        ) : (
          <>
            <div className="blog-grid">
              {posts.map((post) => (
                <article key={post.id} className="blog-card">
                  <Link to={`/blog/${post.slug}`} className="blog-card-link">
                    {post.featuredImage ? (
                      <div className="blog-card-media">
                        <img src={post.featuredImage} alt="" loading="lazy" width={400} height={225} />
                      </div>
                    ) : null}
                    <div className="blog-card-body">
                      <time dateTime={post.publishedAt ?? post.createdAt}>
                        {formatDate(post.publishedAt ?? post.createdAt)}
                      </time>
                      <h2>{post.title}</h2>
                      <p>{post.excerpt || post.metaDescription}</p>
                      <span className="blog-card-cta">Read article →</span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>

            {totalPages > 1 ? (
              <nav className="blog-pagination" aria-label="Blog pagination">
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => current - 1)}
                >
                  Previous
                </button>
                <span>
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={page >= totalPages}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </button>
              </nav>
            ) : null}
          </>
        )}
      </div>
    </section>
  )
}

export function isContentIconName(value: string): value is ContentIconName {
  return ['blog', 'social', 'seo', 'repurpose', 'newsletter', 'schedule', 'keys', 'speed', 'platform'].includes(value)
}
