import type { AutoBlogPostDetail } from '../../../../lib/api'

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function toWordPressDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return '2024-01-01 00:00:00'
  }

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function toRssDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return new Date().toUTCString()
  }

  return date.toUTCString()
}

export function slugifyForWordPress(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\w-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 200)
}

function cdata(value: string): string {
  return `<![CDATA[${value.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`
}

function mapWordPressStatus(status: string): 'publish' | 'draft' | 'pending' | 'private' {
  if (status === 'published') return 'publish'
  if (status === 'pending') return 'pending'
  if (status === 'private') return 'private'
  return 'draft'
}

function postMeta(key: string, value: string): string {
  if (!value.trim()) return ''

  return `    <wp:postmeta>
      <wp:meta_key>${cdata(key)}</wp:meta_key>
      <wp:meta_value>${cdata(value)}</wp:meta_value>
    </wp:postmeta>`
}

export function buildWordPressWxR(post: AutoBlogPostDetail, featuredImageUrl?: string | null): string {
  const postId = 1
  const attachmentId = featuredImageUrl ? 2 : null
  const slug = post.slug?.trim() || slugifyForWordPress(post.title) || slugifyForWordPress(post.id)
  const title = post.title.trim() || post.topicLabel || post.keyword || 'Untitled post'
  const content = post.content.trim()
  const excerpt = post.excerpt?.trim() || ''
  const created = toWordPressDate(post.createdAt)
  const modified = toWordPressDate(post.updatedAt || post.createdAt)
  const pubDate = toRssDate(post.createdAt)
  const wpStatus = mapWordPressStatus(post.status)
  const categoryName = post.categoryName?.trim()
  const categorySlug = categoryName ? slugifyForWordPress(categoryName) : ''
  const seoTitle = post.seoTitle?.trim() || title
  const metaDescription = post.metaDescription?.trim() || excerpt
  const focusKeyword = post.focusKeyword?.trim() || ''

  const categoryBlock = categoryName
    ? `    <category domain="category" nicename="${categorySlug}">${cdata(categoryName)}</category>\n`
    : ''

  const seoMeta = [
    postMeta('_yoast_wpseo_title', seoTitle),
    postMeta('_yoast_wpseo_metadesc', metaDescription),
    postMeta('_yoast_wpseo_focuskw', focusKeyword),
    attachmentId ? postMeta('_thumbnail_id', String(attachmentId)) : '',
  ]
    .filter(Boolean)
    .join('\n')

  const attachmentItem = featuredImageUrl
    ? `
  <item>
    <title>${cdata(`${title} Featured Image`)}</title>
    <link>${cdata(featuredImageUrl)}</link>
    <pubDate>${pubDate}</pubDate>
    <dc:creator>${cdata('content-ai')}</dc:creator>
    <guid isPermaLink="false">${cdata(`${post.id}-featured`)}</guid>
    <description></description>
    <content:encoded>${cdata(`<img src="${featuredImageUrl}" alt="${title.replace(/"/g, '&quot;')}" />`)}</content:encoded>
    <excerpt:encoded>${cdata('')}</excerpt:encoded>
    <wp:post_id>${attachmentId}</wp:post_id>
    <wp:post_date>${created}</wp:post_date>
    <wp:post_date_gmt>${created}</wp:post_date_gmt>
    <wp:post_modified>${modified}</wp:post_modified>
    <wp:post_modified_gmt>${modified}</wp:post_modified_gmt>
    <wp:comment_status>closed</wp:comment_status>
    <wp:ping_status>closed</wp:ping_status>
    <wp:post_name>${cdata(`${slug}-featured`)}</wp:post_name>
    <wp:status>inherit</wp:status>
    <wp:post_parent>${postId}</wp:post_parent>
    <wp:menu_order>0</wp:menu_order>
    <wp:post_type>attachment</wp:post_type>
    <wp:post_password></wp:post_password>
    <wp:is_sticky>0</wp:is_sticky>
    <wp:attachment_url>${cdata(featuredImageUrl)}</wp:attachment_url>
    ${postMeta('_wp_attached_file', featuredImageUrl)}
  </item>`
    : ''

  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0"
  xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:wfw="http://wellformedweb.org/CommentAPI/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:wp="http://wordpress.org/export/1.2/">
<channel>
  <title>Content AI Export</title>
  <link>https://content-ai.local</link>
  <description>Auto blog post export for WordPress import</description>
  <pubDate>${pubDate}</pubDate>
  <language>en-US</language>
  <wp:wxr_version>1.2</wp:wxr_version>
  <wp:base_site_url>https://content-ai.local</wp:base_site_url>
  <wp:base_blog_url>https://content-ai.local</wp:base_blog_url>
  <generator>Content AI Auto Blog</generator>
  <item>
    <title>${cdata(title)}</title>
    <link>https://content-ai.local/${slug}/</link>
    <pubDate>${pubDate}</pubDate>
    <dc:creator>${cdata('content-ai')}</dc:creator>
    <guid isPermaLink="false">${cdata(post.id)}</guid>
    <description>${cdata(metaDescription)}</description>
    <content:encoded>${cdata(content)}</content:encoded>
    <excerpt:encoded>${cdata(excerpt)}</excerpt:encoded>
    <wp:post_id>${postId}</wp:post_id>
    <wp:post_date>${created}</wp:post_date>
    <wp:post_date_gmt>${created}</wp:post_date_gmt>
    <wp:post_modified>${modified}</wp:post_modified>
    <wp:post_modified_gmt>${modified}</wp:post_modified_gmt>
    <wp:comment_status>closed</wp:comment_status>
    <wp:ping_status>closed</wp:ping_status>
    <wp:post_name>${cdata(slug)}</wp:post_name>
    <wp:status>${wpStatus}</wp:status>
    <wp:post_parent>0</wp:post_parent>
    <wp:menu_order>0</wp:menu_order>
    <wp:post_type>post</wp:post_type>
    <wp:post_password></wp:post_password>
    <wp:is_sticky>0</wp:is_sticky>
${categoryBlock}${seoMeta ? `${seoMeta}\n` : ''}  </item>${attachmentItem}
</channel>
</rss>
`
}

export function downloadWordPressWxR(post: AutoBlogPostDetail, featuredImageUrl?: string | null): void {
  const xml = buildWordPressWxR(post, featuredImageUrl)
  const slug = post.slug?.trim() || slugifyForWordPress(post.title) || post.id.slice(0, 8)
  const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' })
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = `${slug}-wordpress.xml`
  link.click()
  URL.revokeObjectURL(objectUrl)
}
